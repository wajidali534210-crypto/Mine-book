/* Bright Future v52 - network-first service worker: new builds always show, offline still works */
const V='bf-v52',KEEP=/webllm|mlc|model|wasm/i;
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==V&&!KEEP.test(k))await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
e.respondWith(new Promise(async res=>{let done=false;const old=()=>caches.match(r,{ignoreSearch:true});
const t=setTimeout(async()=>{const m=await old();if(m&&!done){done=true;res(m)}},2500);
try{const n=await fetch(r,{cache:'no-cache'});if(n.ok){const c=n.clone();caches.open(V).then(x=>x.put(r,c))}if(!done){done=true;clearTimeout(t);res(n)}}
catch(err){clearTimeout(t);if(!done){done=true;res((await old())||Response.error())}}}))});
