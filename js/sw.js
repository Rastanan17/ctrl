const CACHE = 'consignaciones-v4';
const ASSETS = [
  './', './index.html', './css/styles.css', './js/app.js', './manifest.webmanifest',
  './images/ctrl.png', './images/ctrl-icon.png', './images/bizcochitos.png', './images/brownie.png',
  './images/cheesecake.png', './images/chocotorta.png', './images/lemonpie.png', './images/maicena.png',
  './images/oreo.png', './images/pepas.png', './images/pepitos.png', './images/pochoclochoco.png',
  './images/pochoclofrutilla.png', './images/pochocloslimon.png', './images/pochoclosvainilla.png', './images/tiramisu.png'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const clone = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, clone));
    return response;
  }).catch(() => caches.match('./index.html'))));
});
