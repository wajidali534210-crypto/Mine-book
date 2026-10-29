// ZERO TO HERO service worker: book + AI library offline.
// Model files (weights/wasm) are NOT touched here: WebLLM stores those itself in the browser cache.
const CACHE = 'z2h-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
const EXTERNAL = ['esm.run', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(u => c.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE && k.startsWith('z2h-')) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.headers.has('range')) return;
  const u = new URL(r.url);
  if (u.origin === self.location.origin) { e.respondWith(staleWhileRevalidate(e, r)); return; }
  if (EXTERNAL.includes(u.hostname)) { e.respondWith(cacheFirst(r)); }
});

async function staleWhileRevalidate(e, r) {
  const c = await caches.open(CACHE);
  const hit = (await c.match(r, { ignoreSearch: true })) || (r.mode === 'navigate' ? await c.match('index.html') : null);
  const net = fetch(r).then(res => { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(() => null);
  e.waitUntil(net);
  return hit || (await net) || new Response('Offline', { status: 503 });
}

async function cacheFirst(r) {
  const c = await caches.open(CACHE);
  const hit = await c.match(r);
  if (hit) return hit;
  try {
    const res = await fetch(r);
    if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone());
    return res;
  } catch (err) {
    return new Response('', { status: 504 });
  }
}
