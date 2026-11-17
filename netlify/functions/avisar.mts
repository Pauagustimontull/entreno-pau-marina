// POST /.netlify/functions/avisar  { to, text, kind }  — con el token de Firebase de quien envía.
import { NAMES, admin, profileOf, sendTo, type Profile } from '../lib/admin.mts';

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Método no permitido', { status: 405 });
  let from: Profile | undefined;
  try {
    const idToken = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const decoded = await admin().auth.verifyIdToken(idToken);
    from = profileOf(decoded.email);
  } catch {
    return new Response('No autorizado', { status: 401 });
  }
  if (!from) return new Response('Prohibido', { status: 403 });
  const { to, text, kind } = (await req.json().catch(() => ({}))) as { to?: Profile; text?: string; kind?: string };
  if ((to !== 'pau' && to !== 'marina') || to === from || !text) return new Response('Petición incorrecta', { status: 400 });
  const body = String(text).slice(0, 160);
  const title = kind === 'evento' ? `${NAMES[from]} ✨` : `💌 ${NAMES[from]} te manda ánimos`;
  const sent = await sendTo(to, { title, body, tag: kind === 'evento' ? 'evento' : 'animo' });
  return Response.json({ ok: true, sent });
};
