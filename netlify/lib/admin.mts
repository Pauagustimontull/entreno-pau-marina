// Utilidades compartidas por las funciones de Netlify (Firebase Admin).
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
// Mismo mapa de correos → perfil que usa la app (y que firestore.rules).
import { DEFAULT_PROFILE_BY_EMAIL } from '../../src/environments/profiles.config';

export type Profile = 'pau' | 'marina';
export const NAMES: Record<Profile, string> = { pau: 'Pau', marina: 'Marina' };
export const profileOf = (email?: string): Profile | undefined =>
  email ? (DEFAULT_PROFILE_BY_EMAIL as Record<string, Profile>)[email.toLowerCase()] : undefined;

export function admin() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
    if (!raw) throw new Error('Falta la variable FIREBASE_SERVICE_ACCOUNT en Netlify');
    const json = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    initializeApp({ credential: cert(JSON.parse(json)) });
  }
  return { auth: getAuth(), db: getFirestore(), messaging: getMessaging() };
}

/** Envía una notificación a todos los dispositivos de un perfil y limpia los tokens caducados. */
export async function sendTo(profile: Profile, data: { title: string; body: string; url?: string; tag?: string }) {
  const { db, messaging } = admin();
  const ref = db.doc(`profiles/${profile}/docs/push`);
  const snap = await ref.get();
  const tokens: string[] = (snap.data()?.tokens as string[]) || [];
  if (!tokens.length) return 0;
  const res = await messaging.sendEachForMulticast({
    tokens,
    data: { title: data.title, body: data.body, url: data.url || '/', tag: data.tag || '' },
    webpush: { headers: { Urgency: 'high', TTL: '86400' } },
  });
  const bad = res.responses
    .map((r, i) => (!r.success && /not-registered|invalid-registration-token|invalid-argument/.test(r.error?.code || '') ? tokens[i] : null))
    .filter((t): t is string => !!t);
  if (bad.length) await ref.set({ tokens: tokens.filter((t) => !bad.includes(t)) }, { merge: true });
  return res.successCount;
}

/** Fecha de hoy en Madrid (AAAA-MM-DD) y día de la semana (0 = lunes). */
export const isoMadrid = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
export const weekdayMadrid = (d = new Date()) =>
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Madrid', weekday: 'short' }).format(d));
