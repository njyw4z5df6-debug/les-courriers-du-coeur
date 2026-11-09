self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { /* no private data */ }
  event.waitUntil(self.registration.showNotification('💌 Les Courriers du Cœur', {
    body: payload.body || 'Un nouveau courrier attend ta validation.',
    icon: '/favicon.ico',
    tag: payload.tag || 'courrier-a-valider',
    data: { url: '/moderation' }
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/moderation'));
});