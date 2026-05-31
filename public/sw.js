self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Calendario', {
      body: data.body ?? '',
      icon: data.icon ?? '/favicon.svg',
    })
  );
});