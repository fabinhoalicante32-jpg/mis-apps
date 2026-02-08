self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || "./index.html";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Si ya está abierta, enfoca
      for (const c of clients) {
        if (c.url && c.url.includes("index.html")) {
          c.focus();
          return c.navigate(url);
        }
      }
      // Si no, abre nueva
      return self.clients.openWindow(url);
    })
  );
});
