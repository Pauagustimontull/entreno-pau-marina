/* Service worker de notificaciones (Firebase Cloud Messaging). */
importScripts('https://www.gstatic.com/firebasejs/11.3.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.3.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDvKxjiTiLZ_wqW46Exj0P6XFnmPtKlzVY',
  authDomain: 'entreno-pau-marina.firebaseapp.com',
  projectId: 'entreno-pau-marina',
  storageBucket: 'entreno-pau-marina.firebasestorage.app',
  messagingSenderId: '847559651449',
  appId: '1:847559651449:web:1b3b237b4d9a3e0d46a4a8',
});

const messaging = firebase.messaging();

// Los mensajes llegan solo con datos: aquí se muestra la notificación.
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  return self.registration.showNotification(d.title || 'Entreno', {
    body: d.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: d.tag || undefined,
    data: { url: d.url || '/' },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      return self.clients.openWindow(url);
    }),
  );
});
