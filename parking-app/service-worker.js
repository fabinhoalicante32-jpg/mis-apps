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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// Activar
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
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

// ✅ Click en notificación: abrir Google Maps APP (Android) con INTENT
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const lat = data.lat;
  const lng = data.lng;

  if (typeof lat !== "number" || typeof lng !== "number") return;

  // 1) Intent para abrir Google Maps app
  const intentUrl =
    `intent://maps.google.com/maps?daddr=${lat},${lng}` +
    `#Intent;scheme=https;package=com.google.android.apps.maps;end`;

  // 2) Fallback web (por si el intent no funciona)
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + "," + lng)}`;

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });

      // Si ya hay una ventana abierta, la enfocamos y la mandamos al intent
      for (const c of allClients) {
        if ("focus" in c) await c.focus();
        if ("navigate" in c) {
          try {
            await c.navigate(intentUrl);
            return;
          } catch (e) {
            // si falla, intentamos web
            try { await c.navigate(webUrl); } catch (e2) {}
            return;
          }
        }
      }

      // Si no hay ninguna ventana, abrimos una nueva
      if (clients.openWindow) {
        try {
          await clients.openWindow(intentUrl);
        } catch (e) {
          await clients.openWindow(webUrl);
        }
      }
    })()
  );
});
