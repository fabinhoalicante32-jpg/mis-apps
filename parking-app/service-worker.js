const CACHE = "parking-pwa-v1";
const ASSETS = [
  "/mis-apps/parking-app/",
  "/mis-apps/parking-app/index.html",
  "/mis-apps/parking-app/manifest.json",
  "/mis-apps/parking-app/parking_192x192.png",
  "/mis-apps/parking-app/parking_512x512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

// ✅ CLAVE: sin esto, muchas veces Chrome no deja “Instalar app”
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const res = await fetch(event.request);
      return res;
    } catch (e) {
      return (await caches.match("/mis-apps/parking-app/index.html")) || Response.error();
    }
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const url = (event.notification?.data?.url) || "/mis-apps/parking-app/";
    const all = await clients.matchAll({ type: "window", includeUncontrolled: true });

    for (const c of all) {
      // si ya está abierta, enfocar
      if (c.url.includes("/mis-apps/parking-app/") && "focus" in c) return c.focus();
    }
    // si no, abrir
    if (clients.openWindow) return clients.openWindow(url);
  })());
});
