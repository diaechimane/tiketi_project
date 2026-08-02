const CACHE_STATIQUE = 'tiketi-static-v1';
const CACHE_BILLETS  = 'tiketi-billets-v1';

const RESSOURCES = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_STATIQUE).then(c => c.addAll(RESSOURCES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_STATIQUE && k !== CACHE_BILLETS).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/billets')) {
    e.respondWith(
      caches.open(CACHE_BILLETS).then(async cache => {
        const cached = await cache.match(e.request);
        const net = fetch(e.request).then(r => { cache.put(e.request, r.clone()); return r; }).catch(() => cached);
        return cached || net;
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
      caches.open(CACHE_STATIQUE).then(c => c.put(e.request, r.clone()));
      return r;
    }))
  );
});

self.addEventListener('push', e => {
  if (!e.data) return;
  const d = e.data.json();
  e.waitUntil(self.registration.showNotification(d.title, {
    body: d.body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', data: { url: d.url || '/' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/'));
});
