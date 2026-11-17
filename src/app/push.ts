import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { arrayUnion, doc, setDoc } from 'firebase/firestore';
import { auth, db, firebaseApp } from './firebase';
import type { ProfileId } from './profile-store';
import { VAPID_KEY } from '../environments/push.config';

export type PushState = 'not-configured' | 'unsupported' | 'ios-install' | 'default' | 'granted' | 'denied';

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;

export async function pushState(): Promise<PushState> {
  if (!VAPID_KEY) return 'not-configured';
  if (isIos() && !isStandalone()) return 'ios-install';
  const ok = await isSupported().catch(() => false);
  if (!ok || !('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
  return Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'default';
}

/** Pide permiso, registra el dispositivo y guarda su token en profiles/{me}/docs/push. */
export async function enablePush(me: ProfileId): Promise<string> {
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return 'No has dado permiso. Puedes activarlo en los ajustes del navegador.';
  const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const token = await getToken(getMessaging(firebaseApp), { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
  if (!token) return 'No se pudo registrar este dispositivo.';
  await setDoc(doc(db, 'profiles', me, 'docs', 'push'), { tokens: arrayUnion(token), reminders: true, updated: Date.now() }, { merge: true });
  return 'Avisos activados en este dispositivo ✓';
}

export async function setReminders(me: ProfileId, on: boolean) {
  await setDoc(doc(db, 'profiles', me, 'docs', 'push'), { reminders: on, updated: Date.now() }, { merge: true });
}

/** Avisa al otro (ánimos, récords, actividad). Si el servidor aún no está configurado, no pasa nada. */
export async function notifyPartner(to: ProfileId, text: string, kind: 'animo' | 'evento' = 'animo') {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const idToken = await user.getIdToken();
    await fetch('/.netlify/functions/avisar', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + idToken },
      body: JSON.stringify({ to, text, kind }),
    });
  } catch { /* sin conexión o sin configurar: el aviso dentro de la app sigue funcionando */ }
}
