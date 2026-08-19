// Firebase web config (publishable values — safe in client code)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: "AIzaSyBU-9-DFUYVd68wJaPr0sbMuU5yM1gL4AM",
  authDomain: "al-tawakkal-foods.firebaseapp.com",
  projectId: "al-tawakkal-foods",
  storageBucket: "al-tawakkal-foods.firebasestorage.app",
  messagingSenderId: "221582591815",
  appId: "1:221582591815:web:1360b56aa610a745656e62",
};

export const VAPID_KEY =
  "BERDUSPgKhyGvHQ6N0lnEOxQGvyKi85XBqJFtDkjoXbmZE6tj_zXu98uvChoJAgcBo-SItsH_xpUdrd8m64zaR4";

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

let _messaging: Messaging | null = null;

export async function getMessagingSafe(): Promise<Messaging | null> {
  try {
    if (!(await isSupported())) return null;
    if (!_messaging) _messaging = getMessaging(firebaseApp);
    return _messaging;
  } catch {
    return null;
  }
}

export async function requestPushToken(): Promise<string | null> {
  try {
    // Skip inside Lovable preview iframe to avoid SW pollution of the editor.
    const inIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();
    if (inIframe) return null;

    const messaging = await getMessagingSafe();
    if (!messaging) return null;

    if (!("Notification" in window)) return null;
    const perm = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (perm !== "granted") return null;

    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: reg,
    });
    return token || null;
  } catch (e) {
    console.warn("[push] token error", e);
    return null;
  }
}

export async function onForegroundMessage(cb: (payload: any) => void) {
  const messaging = await getMessagingSafe();
  if (!messaging) return () => {};
  return onMessage(messaging, cb);
}
