/* parking-app/service-worker.js */

const CACHE_NAME = "parking-pwa-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./service-worker.js"
];

// Instalar
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

// Activar
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Cache básico (solo para tu carpeta parking-app)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Solo cachea lo que está dentro de /parking-app/
  if (!url.pathname.includes("/parking-app/")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((resp) => {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return resp;
          })
          .catch(() => cached)
      );
    })
  );
});

// ✅ Click en notificación: abrir la URL guardada (Google Maps)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url;

  if (!targetUrl) return;

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });

      // Si ya hay una ventana abierta, la enfocamos y la llevamos a la URL
      for (const client of allClients) {
        if ("focus" in client) {
          await client.focus();
          // Navegar a Maps
          client.navigate(targetUrl);
          return;
        }
      }

      // Si no hay ninguna, abrir nueva
      if (clients.openWindow) {
        await clients.openWindow(targetUrl);
      }
    })()
  );
});
