const CACHE = 'cocoalink-v1';   // change v1 to v2 each time you publish an update
const SHELL = [
  './', './index.html', './manifest.webmanifest', './support.js', './image-slot.js',
  './vendor/react.production.min.js', './vendor/react-dom.production.min.js', './vendor/babel.min.js',
  './data/register.json', './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).hostname === 'script.google.com') return;   // sync calls use the network
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      // also keep the Google Fonts files (they come back "opaque")
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
