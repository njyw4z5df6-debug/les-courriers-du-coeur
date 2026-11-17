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
  event.waitUntil((async () => {
    const path = event.notification.data?.url || '/';
    const target = new URL(path, self.location.origin);
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find(client => new URL(client.url).origin === target.origin);
    if (existing) {
      await existing.navigate(target.href);
      return existing.focus();
    }
    return clients.openWindow(target.href);
  })());
});