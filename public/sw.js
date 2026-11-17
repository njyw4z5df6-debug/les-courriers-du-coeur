self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { /* no private data */ }
  event.waitUntil(self.registration.showNotification('💌 Les Courriers du Cœur', {
    body: typeof payload.body === 'string' ? payload.body : 'Vous avez une nouvelle notification.',
    icon: '/favicon.ico',
    tag: typeof payload.tag === 'string' ? payload.tag : 'courriers-du-coeur',
    data: { url: typeof payload.url === 'string' && /^\/(?!\/)/.test(payload.url) ? payload.url : '/' }
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
});