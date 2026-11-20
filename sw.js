/* Service worker E-Retribusi: jaringan dulu (selalu memuat versi terbaru), cadangan dari cache bila tanpa sinyal.
   Hanya berkas dari alamat yang sama yang disimpan. Panggilan ke Apps Script tidak pernah dicegat atau disimpan. */
var VER = 'eretribusi-v1';
var CEGAH = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VER).then(function (c) { return c.addAll(CEGAH); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VER; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(r).then(function (res) {
      if (res && res.ok) { var salin = res.clone(); caches.open(VER).then(function (c) { c.put(r, salin); }); }
      return res;
    }).catch(function () {
      return caches.match(r).then(function (m) { return m || (r.mode === 'navigate' ? caches.match('./index.html') : Response.error()); });
    })
  );
});
