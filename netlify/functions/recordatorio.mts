// Recordatorio diario (Netlify Scheduled Function): 16:00 UTC = 17:00 en invierno / 18:00 en verano en Madrid.
// Solo avisa si ese día toca entrenar y todavía no hay nada marcado.
import { admin, isoMadrid, sendTo, weekdayMadrid, type Profile } from '../lib/admin.mts';

const PAU_DAYS = ['Empuje 💪', 'Tirón 🏋️', 'Pierna 🦵', 'Torso 💥', 'Hombros, brazos y pierna 🔥'];

function marinaToday(wd: number, meta: any): string | null {
  const bb: number[] = meta?.bb ?? [0, 2, 4];
  const match: number = meta?.match ?? 5;
  if (wd === match || bb.includes(wd)) return null; // baloncesto o partido: ya entrena con el equipo
  if (match >= 0 && wd === (match + 1) % 7) return null; // descanso tras el partido
  return 'carrera + rutina en casa 🏃‍♀️💗';
}

export default async () => {
  const { db } = admin();
  const today = isoMadrid();
  const wd = weekdayMadrid();
  for (const p of ['pau', 'marina'] as Profile[]) {
    try {
      const push = (await db.doc(`profiles/${p}/docs/push`).get()).data();
      if (!push?.tokens?.length || push.reminders === false) continue;
      const days = (await db.doc(`profiles/${p}/docs/sessions`).get()).data()?.days || {};
      if ((days[today]?.done || []).length) continue;
      const plan = p === 'pau' ? (wd <= 4 ? PAU_DAYS[wd] : null) : marinaToday(wd, (await db.doc('profiles/marina/docs/meta').get()).data());
      if (!plan) continue;
      await sendTo(p, { title: `Hoy toca ${plan}`, body: 'Aún no has marcado el entreno de hoy. ¡A por ello! 💪', tag: 'recordatorio' });
    } catch (e) {
      console.error('Recordatorio', p, e);
    }
  }
  return new Response('ok');
};

export const config = { schedule: '0 16 * * *' };
