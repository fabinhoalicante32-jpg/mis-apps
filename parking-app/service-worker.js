self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Cuando el usuario toca la notificación → abre la app (o la enfoca)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });

    // si ya está abierta, enfocarla
    for (const c of allClients) {
      if (c.url && "focus" in c) return c.focus();
    }

    // si no, abrir nueva
    if (clients.openWindow) return clients.openWindow("./");
  })());
});