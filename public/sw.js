self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    (async () => {
      await self.registration.showNotification(data.title ?? 'Calendario', {
        body: data.body ?? '',
        icon: data.icon ?? '/favicon.svg',
      });

      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        client.postMessage({
          type: 'push-notification',
          title: data.title ?? 'Calendario',
          body: data.body ?? '',
          icon: data.icon ?? '/favicon.svg',
        });
      }
    })()
  );
});