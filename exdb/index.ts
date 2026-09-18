// Supabase Edge Function: exdb
// Проксі до exerciseapi.dev. Ключ живе в секреті EXERCISEAPI_KEY і НЕ потрапляє в браузер.
// verify_jwt лишається увімкненим (за замовчуванням) — викликати може лише залогінений користувач,
// тож ключ не «спалять" анонімно. Дозволено лише вузький whitelist параметрів (без SSRF).
//
// Деплой і секрет — див. EXDB_SETUP.md.

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const API_BASE = "https://api.exerciseapi.dev/v1";
const ALLOWED = ["q", "limit", "offset", "category", "muscle", "equipment", "level", "force", "mechanic", "random"];

function json(o: unknown, status = 200): Response {
  return new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

async function forward(target: string, key: string): Promise<Response> {
  try {
    const r = await fetch(target, { headers: { "X-API-Key": key } });
    const text = await r.text();
    // Транзитом віддаємо тіло й статус (включно з 429 rate-limit і помилковими конвертами)
    return new Response(text, { status: r.status, headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    return json({ error: "PROXY_FETCH_FAILED", message: String(e) }, 502);
  }
}

async function forwardSingle(id: string, key: string): Promise<Response> {
  const clean = id.replace(/[^A-Za-z0-9_\-]/g, ""); // тільки безпечний slug
  if (!clean) return json({ error: "BAD_ID" }, 400);
  return await forward(`${API_BASE}/exercises/${encodeURIComponent(clean)}`, key);
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const key = Deno.env.get("EXERCISEAPI_KEY");
  if (!key) return json({ error: "NO_API_KEY", message: "Set EXERCISEAPI_KEY secret" }, 500);

  const inUrl = new URL(req.url);
  const params = new URLSearchParams();

  // Параметри можуть прийти з query (GET) або JSON-тіла (POST)
  let body: Record<string, unknown> = {};
  if (req.method === "POST") {
    try { body = await req.json(); } catch { /* ignore */ }
  }

  // Одиночна вправа за id (slug)
  const id = (body.id as string) ?? inUrl.searchParams.get("id");
  if (id) return await forwardSingle(String(id), key);

  // Пошук: збираємо лише дозволені параметри
  for (const k of ALLOWED) {
    const v = (body[k] as string) ?? inUrl.searchParams.get(k);
    if (v != null && String(v) !== "") params.set(k, String(v));
  }

  // Безкоштовний тариф: limit ≤ 20
  let lim = parseInt(params.get("limit") || "20", 10);
  if (isNaN(lim) || lim < 1) lim = 20;
  if (lim > 20) lim = 20;
  params.set("limit", String(lim));

  return await forward(`${API_BASE}/exercises?${params.toString()}`, key);
});
