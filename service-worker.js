const CACHE='start-u-zali-v43';
// Ядро: без цих файлів додаток не стартує — ставимо атомарно.
const ASSETS=['./','./index.html','./config.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
// Важке, але потрібне офлайн (бібліотека вправ): тягнемо окремо, щоб збій мережі
// не завалив установку SW цілком (addAll — усе або нічого).
const EXTRA=['./exercises.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>
  c.addAll(ASSETS).then(()=>Promise.all(EXTRA.map(u=>c.add(u).catch(()=>null))))
));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin){return;} // не чіпаємо запити до Supabase/CDN
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    const cp=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return resp;
  }).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Response.error())));
  // офлайн-фолбек лише для навігації: інакше на запит exercises.json прилетів би HTML
});
