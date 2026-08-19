/* Firebase Cloud Messaging service worker — handles BACKGROUND push */
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBU-9-DFUYVd68wJaPr0sbMuU5yM1gL4AM",
  authDomain: "al-tawakkal-foods.firebaseapp.com",
  projectId: "al-tawakkal-foods",
  storageBucket: "al-tawakkal-foods.firebasestorage.app",
  messagingSenderId: "221582591815",
  appId: "1:221582591815:web:1360b56aa610a745656e62",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || payload?.data?.title || "AL Maalik Foods";
  const body = payload?.notification?.body || payload?.data?.body || "";
  const url = payload?.data?.url || "/";
  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url },
    tag: payload?.data?.tag || "almaalik",
    requireInteraction: false,
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ("focus" in w) {
          w.navigate(url);
          return w.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
