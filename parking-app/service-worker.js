const CACHE_NAME = "parking-pwa-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./parking_192x192.png",
  "./parking_512x512.png",
  "./service-worker.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Solo cachea cosas dentro de /parking-app/
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (!url.pathname.includes("/parking-app/")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
