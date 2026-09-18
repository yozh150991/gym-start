// Supabase Edge Function: recognize
// Розпізнавання вправи по фото (одне зображення) або кількох кадрах відео.
// Ключ Anthropic живе в секреті ANTHROPIC_API_KEY і НЕ потрапляє в браузер.
// verify_jwt лишається увімкненим (за замовчуванням) — викликати може лише залогінений
// користувач, тож платний ключ не витрачають анонімні боти.
//
// Деплой і секрети — див. AI_SETUP.md.
//
// Контракт (його очікує index.html: `aiRecognize` / `aiRecognizeFrames`):
//   POST {image:"<base64 без префікса>", media_type:"image/jpeg"}
//     → {name_uk, name_en, equipment, muscle, note}
//   POST {frames:["<base64>", …до 8], media_type:"image/jpeg"}
//     → {exercises:[{name_uk, name_en, equipment, muscle, note, frames:[start,end]}]}
//     (frames — 1-based номери кадрів із надісланого масиву)

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const MAX_FRAMES = 8;

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
  `Якщо вправу визначити неможливо — опиши тренажер чи рух якнайточніше, не вигадуй деталей.`;

const ONE_PROMPT =
  `На фото — тренажер або вправа в залі. Визнач вправу.\n${RULES}\n\n` +
  `Відповідай ЛИШЕ JSON-обʼєктом, без пояснень і без markdown:\n` +
  `{"name_uk":"…","name_en":"…","equipment":"…","muscle":"…","note":"…"}`;

const MANY_PROMPT = (n: number) =>
  `Це ${n} кадрів одного тренування, у хронологічному порядку (кадр 1 … кадр ${n}).\n` +
  `Визнач УСІ різні вправи, які на них видно. Одна вправа — один обʼєкт, навіть якщо вона ` +
  `займає кілька кадрів; не дублюй ту саму вправу.\n${RULES}\n` +
  `frames — діапазон [перший, останній] номерів кадрів цієї вправи (1-based, від 1 до ${n}).\n\n` +
  `Відповідай ЛИШЕ JSON-обʼєктом, без пояснень і без markdown:\n` +
  `{"exercises":[{"name_uk":"…","name_en":"…","equipment":"…","muscle":"…","note":"…","frames":[1,3]}]}`;

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

type Ex = { name_uk: string; name_en: string; equipment: string; muscle: string; note: string };

function cleanOne(o: Record<string, unknown>): Ex {
  return {
    name_uk: String(o.name_uk ?? "").trim(),
    name_en: String(o.name_en ?? "").trim(),
    equipment: pick(o.equipment, EQUIPMENT),
    muscle: pick(o.muscle, MUSCLES),
    note: String(o.note ?? "").trim(),
  };
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

  // --- режим «кілька кадрів» ---
  if (Array.isArray(body.frames) && body.frames.length) {
    const frames = (body.frames as unknown[]).map(String).filter(Boolean).slice(0, MAX_FRAMES);
    const out = await callClaude(key, frames, mediaType, MANY_PROMPT(frames.length), 2000);
    if (!out.ok) return out.res;

    const parsed = parseJSON(out.text);
    const raw = Array.isArray(parsed?.exercises) ? parsed!.exercises as Record<string, unknown>[] : [];
    const exercises = raw.map((e) => {
      const fr = Array.isArray(e.frames) ? e.frames.map((n) => parseInt(String(n), 10) || 1) : [];
      const a = Math.min(Math.max(fr[0] || 1, 1), frames.length);
      const b = Math.min(Math.max(fr[1] || a, a), frames.length);
      return { ...cleanOne(e), frames: [a, b] };
    }).filter((e) => e.name_en || e.name_uk);

    if (!exercises.length) return json({ error: "NO_RESULT", message: out.text.slice(0, 300) }, 422);
    return json({ exercises });
  }

  // --- режим «одне фото» ---
  const image = String(body.image || "");
  if (!image) return json({ error: "NO_IMAGE", message: "Expect {image} or {frames:[…]}" }, 400);

  const out = await callClaude(key, [image], mediaType, ONE_PROMPT, 600);
  if (!out.ok) return out.res;

  const parsed = parseJSON(out.text);
  if (!parsed) return json({ error: "NO_RESULT", message: out.text.slice(0, 300) }, 422);
  return json(cleanOne(parsed));
});
