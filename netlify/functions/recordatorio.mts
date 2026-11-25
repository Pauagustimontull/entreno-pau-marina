// Recordatorio diario (Netlify Scheduled Function): 16:00 UTC = 17:00 en invierno / 18:00 en verano en Madrid.
// Solo avisa si ese día toca entrenar y todavía no hay nada marcado.
import { admin, isoMadrid, sendTo, weekdayMadrid, type Profile } from '../lib/admin.mts';

const PAU_PLAN = [['E1', 'el Entreno 1: torso y espalda 💪'], ['E2', 'el Entreno 2: pierna (cuádriceps) 🦵'], ['E3', 'el Entreno 3: torso y espalda 🏋️'], ['E4', 'el Entreno 4: pierna (glúteo y femoral) 🍑']];

// Pau: 4 entrenos numerados en orden. Avisa de lunes a viernes si esta semana aún le quedan entrenos.
function pauToday(wd: number, days: Record<string, any>, today: string): string | null {
  if (wd > 4) return null;
  const monday = new Date(today + 'T12:00:00Z'); monday.setUTCDate(monday.getUTCDate() - wd);
  const mon = monday.toISOString().slice(0, 10);
  const done = Object.keys(days).filter((d) => d >= mon && d < today && (days[d].done || []).some((x: string) => /^E\d-/.test(x))).length;
  if (done >= 4) return null;
  let next = 0;
  for (const d of Object.keys(days).sort().reverse()) {
    const ids: string[] = (days[d].done || []).filter((x: string) => /^E\d-/.test(x));
    if (ids.length) { next = (+ids[ids.length - 1][1]) % 4; break; }
  }
  return PAU_PLAN[next][1];
}

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
      const plan = p === 'pau' ? pauToday(wd, days, today) : marinaToday(wd, (await db.doc('profiles/marina/docs/meta').get()).data());
      if (!plan) continue;
      await sendTo(p, { title: `Hoy toca ${plan}`, body: 'Aún no has marcado el entreno de hoy. ¡A por ello! 💪', tag: 'recordatorio' });
    } catch (e) {
      console.error('Recordatorio', p, e);
    }
  }
  return new Response('ok');
};

export const config = { schedule: '0 16 * * *' };
