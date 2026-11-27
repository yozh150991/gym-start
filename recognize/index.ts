// Supabase Edge Function: recognize
// Розпізнавання вправи по фото (одне зображення) або кількох кадрах відео.
// Ключ Anthropic живе в секреті ANTHROPIC_API_KEY і НЕ потрапляє в браузер.
// verify_jwt лишається увімкненим (за замовчуванням) — викликати може лише залогінений
// користувач, тож платний ключ не витрачають анонімні боти.
//
// Деплой і секрети — див. AI_SETUP.md.
//
// Контракт v2 (його очікує index.html v44+: `aiRecognize` / `aiRecognizeFrames`):
//   POST {image:"<base64 без префікса>", media_type:"image/jpeg"}
//     → {v:2, found, name_uk, name_en, equipment, muscle, note, confidence, alt_names}
//       found:false — на фото немає вправи/тренажера (назви порожні), HTTP 200
//   POST {frames:["<base64>", …до 8], media_type:"image/jpeg"}
//     → {v:2, exercises:[{name_uk, name_en, equipment, muscle, note, confidence, alt_names, frames:[first,last]}]}
//     (frames — 1-based номери кадрів із надісланого масиву; нічого не видно → exercises:[] з HTTP 200)
//   confidence: "high" | "medium" | "low";  alt_names: до 3 альтернативних англ. назв.
//   Ознака `v:2` потрібна клієнту: стара задеплоєна версія повертала frames як список 0-based індексів.
//
// Помилки: 400 BAD_JSON/BAD_MEDIA_TYPE/NO_IMAGE, 413 IMAGE_TOO_LARGE, 422 NO_RESULT (нерозбірна
// відповідь моделі), 429 DAILY_LIMIT (денний ліміт на користувача), 500 NO_API_KEY, 502 upstream.
//
// Денний ліміт: перед викликом Anthropic — RPC `bump_ai_usage` (див. ai_usage_setup.sql) з JWT
// САМОГО користувача; ліміт — секрет RECOGNIZE_DAILY_LIMIT (за замовчуванням 30). Якщо SQL ще не
// встановлено або RPC недоступна — fail-open (розпізнавання працює, у логах console.warn).

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-5-5";
const MAX_FRAMES = 8;
const MAX_B64 = 1_600_000;        // ~1.2 МБ JPEG на картинку; клієнт шле ~640–700px, це з запасом
const DEFAULT_DAILY_LIMIT = 30;
const CONFIDENCE = ["high", "medium", "low"];

// Словники free-exercise-db — модель мусить обирати лише з них,
// інакше `bestLibMatch` у клієнті не звузить пошук.
const EQUIPMENT = [
  "barbell", "dumbbell", "cable", "machine", "body only", "bands", "kettlebells",
  "e-z curl bar", "exercise ball", "medicine ball", "foam roll", "other",
];
const MUSCLES = [
  "abdominals", "abductors", "adductors", "biceps", "calves", "chest", "forearms",
  "glutes", "hamstrings", "lats", "lower back", "middle back", "neck",
  "quadriceps", "shoulders", "traps", "triceps",
];

const RULES =
  `equipment — рівно одне значення зі списку: ${EQUIPMENT.join(", ")}.\n` +
  `muscle — головний робочий мʼяз, рівно одне значення зі списку: ${MUSCLES.join(", ")}.\n` +
  `name_en — усталена англійська назва вправи (як у базах вправ), напр. "Barbell Bench Press".\n` +
  `name_uk — коротка українська назва, напр. "Жим штанги лежачи".\n` +
  `note — одне-два речення українською: на що звернути увагу в техніці.\n` +
  `confidence — наскільки ти впевнений у назві вправи: "high", "medium" або "low".\n` +
  `alt_names — до 3 інших поширених англійських назв цієї ж вправи/тренажера (синоніми), напр. ` +
  `["Pec Deck", "Machine Fly"]; якщо немає — [].\n` +
  `Не вигадуй деталей, яких не видно.`;

const ONE_PROMPT =
  `На фото — імовірно тренажер або вправа в залі. Визнач вправу.\n${RULES}\n` +
  `Якщо на фото НЕМАЄ ні вправи, ні спортивного обладнання — відповідай рівно {"found":false}.\n` +
  `Якщо це спортивне обладнання, але яку саме вправу виконують — неясно: found true, confidence "low" ` +
  `і найімовірніша назва.\n\n` +
  `Відповідай ЛИШЕ JSON-обʼєктом, без пояснень і без markdown:\n` +
  `{"found":true,"name_uk":"…","name_en":"…","equipment":"…","muscle":"…","note":"…","confidence":"high","alt_names":["…"]}`;

const MANY_PROMPT = (n: number) =>
  `Це ${n} кадрів одного тренування, у хронологічному порядку (кадр 1 … кадр ${n}).\n` +
  `Визнач УСІ різні вправи, які на них видно. Одна вправа — один обʼєкт, навіть якщо вона ` +
  `займає кілька кадрів; не дублюй ту саму вправу.\n${RULES}\n` +
  `frames — діапазон [перший, останній] номерів кадрів цієї вправи (1-based, від 1 до ${n}).\n` +
  `Вправи, в яких ти не впевнений, познач confidence "low". Якщо на кадрах не видно жодної вправи — ` +
  `відповідай рівно {"exercises":[]}.\n\n` +
  `Відповідай ЛИШЕ JSON-обʼєктом, без пояснень і без markdown:\n` +
  `{"exercises":[{"name_uk":"…","name_en":"…","equipment":"…","muscle":"…","note":"…","confidence":"medium","alt_names":["…"],"frames":[1,3]}]}`;

function json(o: unknown, status = 200): Response {
  return new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

// Модель інколи загортає JSON у ```json … ``` або додає речення довкола.
function parseJSON(text: string): Record<string, unknown> | null {
  const clean = String(text || "").replace(/```(?:json)?/gi, "").trim();
  try { return JSON.parse(clean); } catch { /* пробуємо витягти обʼєкт */ }
  const a = clean.indexOf("{"), b = clean.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(clean.slice(a, b + 1)); } catch { /* ignore */ } }
  return null;
}

function pick(v: unknown, allowed: string[]): string {
  const s = String(v ?? "").trim().toLowerCase();
  return allowed.includes(s) ? s : "";
}

type Ex = {
  name_uk: string; name_en: string; equipment: string; muscle: string; note: string;
  confidence: string; alt_names: string[];
};

function altNames(v: unknown, main: string): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const x of v) {
    if (typeof x !== "string") continue;
    const s = x.trim().slice(0, 60).trim();
    if (!s || s.toLowerCase() === main.toLowerCase() || out.some((o) => o.toLowerCase() === s.toLowerCase())) continue;
    out.push(s);
    if (out.length >= 3) break;
  }
  return out;
}

function cleanOne(o: Record<string, unknown>): Ex {
  const name_en = String(o.name_en ?? "").trim();
  const conf = String(o.confidence ?? "").trim().toLowerCase();
  return {
    name_uk: String(o.name_uk ?? "").trim(),
    name_en,
    equipment: pick(o.equipment, EQUIPMENT),
    muscle: pick(o.muscle, MUSCLES),
    note: String(o.note ?? "").trim(),
    confidence: CONFIDENCE.includes(conf) ? conf : "medium",
    alt_names: altNames(o.alt_names, name_en),
  };
}

// Денний ліміт на користувача. Рахує Postgres-функція bump_ai_usage() (ai_usage_setup.sql),
// викликана через PostgREST з JWT самого користувача (auth.uid() усередині).
// Повертає Response 429, якщо ліміт перевищено; null — можна продовжувати.
// FAIL-OPEN: немає env / RPC ще не встановлена (404) / будь-яка інша помилка → null + console.warn.
async function checkDailyLimit(req: Request): Promise<Response | null> {
  const url = (Deno.env.get("SUPABASE_URL") || "").replace(/\/+$/, "");
  const anon = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const auth = req.headers.get("Authorization") || "";
  if (!url || !anon || !auth) {
    console.warn("daily limit skipped: SUPABASE_URL / SUPABASE_ANON_KEY / Authorization missing");
    return null;
  }
  const raw = Deno.env.get("RECOGNIZE_DAILY_LIMIT");
  const parsed = raw ? parseInt(raw, 10) : NaN;
  const limit = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_LIMIT;
  try {
    const r = await fetch(`${url}/rest/v1/rpc/bump_ai_usage`, {
      method: "POST",
      headers: { "Authorization": auth, "apikey": anon, "Content-Type": "application/json" },
      body: "{}",
    });
    if (r.status !== 200) {
      console.warn("daily limit skipped: bump_ai_usage HTTP " + r.status + " " + (await r.text()).slice(0, 200));
      return null;
    }
    const count = Number(await r.json());
    if (!Number.isFinite(count)) {
      console.warn("daily limit skipped: unexpected bump_ai_usage result");
      return null;
    }
    if (count > limit) return json({ error: "DAILY_LIMIT", limit }, 429);
    return null;
  } catch (e) {
    console.warn("daily limit skipped: " + String(e));
    return null;
  }
}

async function callClaude(
  key: string,
  images: string[],
  mediaType: string,
  prompt: string,
  maxTokens: number,
): Promise<{ ok: true; text: string } | { ok: false; res: Response }> {
  const content: unknown[] = images.map((b64, i) => ([
    // підпис перед кожним кадром — щоб модель могла послатись на його номер
    images.length > 1 ? { type: "text", text: `Кадр ${i + 1}:` } : null,
    { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
  ])).flat().filter(Boolean);
  content.push({ type: "text", text: prompt });

  let r: Response;
  try {
    r = await fetch(API_URL, {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": API_VERSION, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: Deno.env.get("ANTHROPIC_MODEL") || DEFAULT_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content }],
      }),
    });
  } catch (e) {
    return { ok: false, res: json({ error: "UPSTREAM_FETCH_FAILED", message: String(e) }, 502) };
  }

  if (!r.ok) {
    const body = await r.text();
    // 400 — хибний ключ/запит, 429 — ліміт; віддаємо статус як є, щоб UI показав причину
    return { ok: false, res: json({ error: "ANTHROPIC_" + r.status, message: body.slice(0, 500) }, r.status) };
  }

  const data = await r.json();
  const text = (data?.content || []).filter((c: { type?: string }) => c?.type === "text")
    .map((c: { text?: string }) => c.text || "").join("\n");
  return { ok: true, text };
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "NO_API_KEY", message: "Set ANTHROPIC_API_KEY secret" }, 500);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "BAD_JSON" }, 400); }

  const mediaType = String(body.media_type || "image/jpeg");
  if (!/^image\/(jpeg|png|webp|gif)$/.test(mediaType)) return json({ error: "BAD_MEDIA_TYPE" }, 400);

  const isMany = Array.isArray(body.frames) && body.frames.length > 0;
  const frames = isMany ? (body.frames as unknown[]).map(String).filter(Boolean).slice(0, MAX_FRAMES) : [];
  const image = isMany ? "" : String(body.image || "");
  if (!isMany && !image) return json({ error: "NO_IMAGE", message: "Expect {image} or {frames:[…]}" }, 400);
  if (isMany && !frames.length) return json({ error: "NO_IMAGE", message: "Empty frames" }, 400);
  if ((isMany ? frames : [image]).some((b) => b.length > MAX_B64)) {
    return json({ error: "IMAGE_TOO_LARGE", max_base64_chars: MAX_B64 }, 413);
  }

  // ліміт рахуємо лише для валідних запитів, перед платним викликом
  const limited = await checkDailyLimit(req);
  if (limited) return limited;

  // --- режим «кілька кадрів» ---
  if (isMany) {
    const out = await callClaude(key, frames, mediaType, MANY_PROMPT(frames.length), 2000);
    if (!out.ok) return out.res;

    const parsed = parseJSON(out.text);
    // нерозбірна відповідь або без масиву exercises → 422; порожній масив — нормальна відповідь
    if (!parsed || !Array.isArray(parsed.exercises)) {
      return json({ error: "NO_RESULT", message: out.text.slice(0, 300) }, 422);
    }
    const raw = (parsed.exercises as unknown[])
      .filter((e): e is Record<string, unknown> => !!e && typeof e === "object" && !Array.isArray(e));
    const exercises = raw.map((e) => {
      const fr = Array.isArray(e.frames) ? e.frames.map((n) => parseInt(String(n), 10) || 1) : [];
      const a = Math.min(Math.max(fr[0] || 1, 1), frames.length);
      const b = Math.min(Math.max(fr[1] || a, a), frames.length);
      return { ...cleanOne(e), frames: [a, b] };
    }).filter((e) => e.name_en || e.name_uk);

    return json({ v: 2, exercises });
  }

  // --- режим «одне фото» ---
  const out = await callClaude(key, [image], mediaType, ONE_PROMPT, 700);
  if (!out.ok) return out.res;

  const parsed = parseJSON(out.text);
  if (!parsed) return json({ error: "NO_RESULT", message: out.text.slice(0, 300) }, 422);
  const one = cleanOne(parsed);
  const found = parsed.found !== false && !!(one.name_en || one.name_uk);
  if (!found) {
    return json({ v: 2, found: false, name_uk: "", name_en: "", equipment: "", muscle: "", note: "", confidence: "low", alt_names: [] });
  }
  return json({ v: 2, found: true, ...one });
});
