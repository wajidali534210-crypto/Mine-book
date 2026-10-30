/* Zero to Hero — safe offline cache. Page: network-first (always fresh when online). CDN libs: cache-first. */
var V='z2h-v30',PAGE=['./','./index.html','./manifest.json'];
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(V).then(function(c){return Promise.all(PAGE.map(function(u){return c.add(u).catch(function(){})}))}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==V&&/^z2h-/.test(x)}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){var r=e.request;if(r.method!=='GET')return;var u=new URL(r.url);
 if(u.origin===location.origin){e.respondWith(fetch(r).then(function(x){if(x&&x.ok){var c=x.clone();caches.open(V).then(function(h){h.put(r,c)})}return x}).catch(function(){return caches.match(r).then(function(m){return m||caches.match('./index.html')||caches.match('./')})}));return}
 if(/(^|\.)(esm\.sh|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname)){e.respondWith(caches.match(r).then(function(m){return m||fetch(r).then(function(x){if(x&&(x.ok||x.type==='opaque')){var c=x.clone();caches.open(V).then(function(h){h.put(r,c)})}return x})}))}});
