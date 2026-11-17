// @ts-nocheck
// Vista "Juntos": logros, rendimiento y zona de pareja de Pau y Marina.
// Lee los datos de los dos perfiles (los mismos documentos que usan pau.ts y marina.ts).
import type { CoreStore } from './store';
import { PAU_DAYS } from './catalog-pau';

type Who = 'pau' | 'marina';

const NAMES = { pau: 'Pau', marina: 'Marina' };
const COLORS = { pau: '#e0663a', marina: '#d9718f', pareja: '#8a63b5' };
const SOFT = { pau: '#fbe2d6', marina: '#fde4ec', pareja: '#ece2f6' };
const TARGET = { pau: 4, marina: 4 }; // días activos por semana para "cumplir"

// ---------- Utilidades de fechas ----------
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const pdate = (s: string) => new Date(s + 'T12:00:00');
const today = () => iso(new Date());
const fdate = (s: string) => pdate(s).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const mondayOf = (s: string) => { const d = pdate(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
const addDays = (s: string, n: number) => { const d = pdate(s); d.setDate(d.getDate() + n); return iso(d); };
const fmt = (n: number, dec = 1) => (Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)).toLocaleString('es-ES');
const esc = (t: any) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- Plan de carrera de Marina (igual que en marina.ts) ----------
const rep = (n, r, w) => { const a = []; for (let i = 0; i < n; i++) { a.push(['r', r]); if (i < n - 1) a.push(['w', w]); } return a; };
const cont = (m) => [['r', m]];
const RUNS = [
  [rep(8, 1, 1.5), rep(8, 1, 1.5), rep(8, 1, 1.5)], [rep(6, 2, 2), rep(6, 2, 2), rep(6, 2, 2)], [rep(5, 3, 1.5), rep(5, 3, 1.5), rep(5, 3, 1.5)],
  [rep(4, 5, 2), rep(4, 5, 2), rep(4, 5, 2)], [rep(3, 7, 2), rep(3, 7, 2), rep(2, 10, 2)], [rep(2, 12, 2), rep(2, 12, 2), [['r', 15], ['w', 2], ['r', 10]]],
  [cont(20), cont(20), cont(25)], [cont(25), cont(25), cont(30)], [cont(30), cont(30), cont(35)], [cont(30), cont(35), cont(40)],
  [cont(35), cont(35), cont(45)], [cont(35), cont(40), cont(50)], [cont(35), cont(40), cont(55)],
];
const runSegs = (w, s) => (RUNS[w - 1] && RUNS[w - 1][s - 1]) || [];
const runMinutes = (w, s) => runSegs(w, s).filter((x) => x[0] === 'r').reduce((a, b) => a + b[1], 0);
const maxCont = (w, s) => Math.max(0, ...runSegs(w, s).filter((x) => x[0] === 'r').map((x) => x[1]));
const ROUT_NAMES = { A: 'Piernas y caderas', B: 'Brazos, espalda y abdomen', C: 'Quema total', X: 'Exprés abdomen y brazos' };

// ---------- Catálogo de Pau ----------
const PAU_EX: { key: string; name: string; type: string; day: string }[] = [];
for (const d of PAU_DAYS) d.ex.forEach((e, i) => {
  const type = /Cardio|Extra/.test(e.tag) ? 'none' : /Plancha/.test(e.name) ? 't' : /Dominadas|Fondos|colgado/.test(e.name) ? 'bw' : 'w';
  PAU_EX.push({ key: `ex-${d.k}-${i}`, name: e.name, type, day: d.title });
});
const PAU_DAY_TITLE = Object.fromEntries(PAU_DAYS.map((d) => [d.k, d.title]));
const BIG = [
  { key: 'ex-L-0', short: 'Press banca' }, { key: 'ex-X-0', short: 'Sentadilla' }, { key: 'ex-X-1', short: 'Peso muerto rumano' },
  { key: 'ex-V-0', short: 'Press militar' }, { key: 'ex-M-1', short: 'Remo con barra' }, { key: 'ex-X-2', short: 'Prensa' },
];
const e1rm = (kg, reps) => kg * (1 + reps / 30);
const paceTxt = (m) => { if (!(m > 0)) return ''; const t = Math.round(m * 60); return `${Math.floor(t / 60)}'${String(t % 60).padStart(2, '0')}"/km`; };

// ---------- Cálculo de datos ----------
function analyse(stores: Record<Who, CoreStore>) {
  const P = stores.pau, M = stores.marina;
  const g = (s, k) => s.get(k) || {};

  // ---- Pau ----
  const pDays = g(P, 'sessions').days || {};
  const pActive = Object.keys(pDays).filter((d) => (pDays[d].done || []).length).sort();
  const pNotes = Object.keys(pDays).filter((d) => pDays[d].note).sort();
  const pBody = (g(P, 'body').entries || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const prs = []; // {date, key, name, value, unit}
  const volByDate = {};
  const maxKg = {}; const maxRep = {}; const firstLast = {};
  const allDocs = P.all ? P.all() : {};
  const exList = [...PAU_EX];
  for (const k of Object.keys(allDocs)) if (k.startsWith('ex-') && k.includes('@')) {
    const base = PAU_EX.find((e) => e.key === k.split('@')[0]);
    if (base) exList.push({ ...base, key: k, name: base.name + ' (variante)', type: /asistid/.test(k) ? 'bw' : base.type });
  }
  const setsOf = (x) => Array.isArray(x.sets) && x.sets.length ? x.sets : (x.reps || []).map((r) => ({ kg: +x.kg || 0, reps: +r }));
  for (const ex of exList) {
    const en = (g(P, ex.key).entries || []).slice().sort((a, b) => a.date.localeCompare(b.date));
    if (!en.length) continue;
    let best = -1;
    const pts = [];
    for (const x of en) {
      const reps = (x.reps || []).map(Number).filter((r) => r > 0);
      const kg = +x.kg || 0;
      if (ex.type === 'w') {
        const S = setsOf(x).filter((s) => +s.reps > 0);
        volByDate[x.date] = (volByDate[x.date] || 0) + S.reduce((a, s) => a + (+s.kg || 0) * (+s.reps || 0), 0);
        const v = kg; const est = S.length ? Math.max(...S.map((s) => e1rm(+s.kg || 0, +s.reps))) : 0;
        pts.push({ date: x.date, kg, est, top: Math.max(0, ...reps) });
        if (best >= 0 && v > best) prs.push({ date: x.date, key: ex.key, name: ex.name, text: `${fmt(v)} kg` });
        if (v > best) best = v;
        maxKg[ex.key] = Math.max(maxKg[ex.key] || 0, v);
      } else if (ex.type === 'bw' || ex.type === 't') {
        const v = Math.max(0, ...reps);
        pts.push({ date: x.date, kg, top: v, total: reps.reduce((a, b) => a + b, 0) + kg });
        if (best >= 0 && v > best) prs.push({ date: x.date, key: ex.key, name: ex.name, text: `${v} ${ex.type === 't' ? 's' : 'reps'}` });
        if (v > best) best = v;
        maxRep[ex.key] = Math.max(maxRep[ex.key] || 0, v);
      }
    }
    firstLast[ex.key] = pts;
  }
  prs.sort((a, b) => a.date.localeCompare(b.date));
  const rirDays = []; for (const ex of exList) for (const x of (g(P, ex.key).entries || [])) if ((x.sets || []).some((st) => st.rir != null)) rirDays.push(x.date);

  // ---- Marina ----
  const mDays = g(M, 'sessions').days || {};
  const mActive = Object.keys(mDays).filter((d) => (mDays[d].done || []).some((x) => x !== 'rest')).sort();
  const mNotes = Object.keys(mDays).filter((d) => mDays[d].note).sort();
  const mBody = (g(M, 'body').entries || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const runs = (g(M, 'runs').entries || []).filter((x) => !x.skip).slice().sort((a, b) => a.date.localeCompare(b.date) || a.w - b.w || a.s - b.s);
  const routs = []; // {date, r}
  const bbDays = [];
  for (const d of Object.keys(mDays).sort()) for (const id of mDays[d].done || []) {
    if (id.startsWith('R-')) routs.push({ date: d, r: id.slice(2) });
    if (id === 'bb' || id === 'match') bbDays.push(d);
  }

  // ---- Cheers ----
  const cheers = [...(g(P, 'cheers').items || []).map((c) => ({ ...c, to: 'pau' })), ...(g(M, 'cheers').items || []).map((c) => ({ ...c, to: 'marina' }))]
    .sort((a, b) => (a.ts || 0) - (b.ts || 0));

  return { rirDays, pActive, pNotes, pBody, prs, volByDate, maxKg, maxRep, firstLast, pDays, pStart: g(P, 'meta').start,
    mActive, mNotes, mBody, runs, routs, bbDays, mDays, mStart: g(M, 'meta').start, cheers, rfeed: g(M, 'rfeed').entries || [] };
}

// ---------- Series (fecha, valor) ----------
const countSeries = (dates) => dates.map((d, i) => [d, i + 1]);
const sumSeries = (pairs) => { let s = 0; return pairs.slice().sort((a, b) => a[0].localeCompare(b[0])).map(([d, v]) => [d, (s += v)]); };
const maxSeries = (pairs) => { let m = -Infinity; return pairs.slice().sort((a, b) => a[0].localeCompare(b[0])).map(([d, v]) => [d, (m = Math.max(m, v))]); };
function weekCounts(dates) { const m = {}; for (const d of dates) { const w = mondayOf(d); m[w] = (m[w] || 0) + 1; } return m; }
function streakSeries(dates, target) {
  const wc = weekCounts(dates); const weeks = Object.keys(wc).sort(); if (!weeks.length) return [];
  const out = []; let w = weeks[0], s = 0; const last = mondayOf(today());
  while (w <= last) { if ((wc[w] || 0) >= target) { s++; out.push([addDays(w, 6) > today() ? today() : addDays(w, 6), s]); } else if (w !== last) s = 0; w = addDays(w, 7); }
  return out;
}
function currentStreak(dates, target) {
  const wc = weekCounts(dates); let w = mondayOf(today()); let s = 0;
  if ((wc[w] || 0) >= target) s++; w = addDays(w, -7);
  while ((wc[w] || 0) >= target) { s++; w = addDays(w, -7); }
  return s;
}
const dropSeries = (entries, f) => { const v = entries.filter((x) => +x[f] > 0); if (!v.length) return []; const first = +v[0][f]; return v.map((x) => [x.date, first - +x[f]]); };

// ---------- Logros ----------
function achievements(D) {
  const A = [];
  const add = (who, id, emoji, name, desc, goal, series, unit = '') => A.push({ who, id, emoji, name, desc, goal, series, unit });
  // Pau
  const pS = countSeries(D.pActive);
  add('pau', 'p-first', '🏁', 'Primer día', 'Completa tu primer entreno', 1, pS);
  [[10, 'Calentando motores'], [25, 'Ya es costumbre'], [50, 'Medio centenar'], [100, 'Centurión']].forEach(([n, t]) => add('pau', 'p-s' + n, '💪', t, `${n} días de gym`, n, pS, 'días'));
  const perfect = Object.entries(weekCounts(D.pActive)).filter(([, c]) => c >= 5).map(([w]) => addDays(w, 4)).sort();
  add('pau', 'p-perfect', '⭐', 'Semana perfecta', 'Entrena los 5 días de una semana', 1, countSeries(perfect));
  add('pau', 'p-perfect4', '🌟', 'Perfeccionista', '4 semanas perfectas', 4, countSeries(perfect), 'semanas');
  const pStr = streakSeries(D.pActive, TARGET.pau);
  [[2, 'En racha'], [4, 'Un mes sin fallar'], [8, 'Dos meses on fire'], [12, 'Leyenda del gym']].forEach(([n, t]) => add('pau', 'p-str' + n, '🔥', t, `${n} semanas seguidas con 4+ días`, n, pStr, 'semanas'));
  const prS = countSeries(D.prs.map((p) => p.date));
  [[1, 'Primer récord'], [10, 'Coleccionista de récords'], [25, 'Máquina de récords'], [50, 'Imparable']].forEach(([n, t]) => add('pau', 'p-pr' + n, '🏆', t, `${n} récord${n > 1 ? 's' : ''} personal${n > 1 ? 'es' : ''}`, n, prS, 'récords'));
  const kgS = (key) => maxSeries((D.firstLast[key] || []).map((p) => [p.date, p.kg]));
  [[60, 'Banca de 60'], [80, 'Banca de 80'], [100, 'Club de los 100']].forEach(([n, t]) => add('pau', 'p-bench' + n, '🏋️', t, `Press de banca con ${n} kg`, n, kgS('ex-L-0'), 'kg'));
  [[80, 'Piernas de acero'], [100, 'Sentadilla de 100'], [120, 'Bestia de la sentadilla']].forEach(([n, t]) => add('pau', 'p-squat' + n, '🦵', t, `Sentadilla con ${n} kg`, n, kgS('ex-X-0'), 'kg'));
  [[80, 'Bisagra firme'], [100, 'Rumano de 100']].forEach(([n, t]) => add('pau', 'p-rdl' + n, '🧱', t, `Peso muerto rumano con ${n} kg`, n, kgS('ex-X-1'), 'kg'));
  [[40, 'Hombros de 40'], [60, 'Hombros de piedra']].forEach(([n, t]) => add('pau', 'p-ohp' + n, '🗿', t, `Press militar de pie con ${n} kg`, n, kgS('ex-V-0'), 'kg'));
  add('pau', 'p-pull10', '🧗', 'Rey de la barra', '10 dominadas seguidas en una serie', 10, maxSeries((D.firstLast['ex-J-0'] || []).map((p) => [p.date, p.top])), 'reps');
  add('pau', 'p-dips15', '🤸', 'Fondos de campeón', '15 fondos seguidos en una serie', 15, maxSeries((D.firstLast['ex-J-3'] || []).map((p) => [p.date, p.top])), 'reps');
  const weekVol = {}; for (const [d, v] of Object.entries(D.volByDate)) { const w = mondayOf(d); weekVol[w] = (weekVol[w] || 0) + v; }
  add('pau', 'p-vol10', '🚚', 'Diez toneladas', 'Mueve 10.000 kg en una semana', 10000, maxSeries(Object.entries(weekVol).map(([w, v]) => [addDays(w, 6) > today() ? today() : addDays(w, 6), v])), 'kg');
  add('pau', 'p-vol250', '🐋', 'Una ballena y media', 'Mueve 250.000 kg en total (≈ 1,5 ballenas azules)', 250000, sumSeries(Object.entries(D.volByDate)), 'kg');
  if (D.pStart) {
    const weeksIn = D.pActive.map((d) => [d, Math.floor((pdate(d) - pdate(D.pStart)) / (7 * 864e5)) + 1]);
    add('pau', 'p-readapt', '🧩', 'Readaptado', 'Supera las 2 semanas de readaptación', 3, maxSeries(weeksIn), 'semana');
    add('pau', 'p-cycle', '🔄', 'Primer ciclo completo', 'Llega a la semana 9 (descarga)', 9, maxSeries(weeksIn), 'semana');
  }
  add('pau', 'p-waist2', '📏', 'Cintura −2 cm', 'Baja 2 cm de cintura desde tu primera medida', 2, dropSeries(D.pBody, 'waist'), 'cm');
  add('pau', 'p-waist5', '📐', 'Cintura −5 cm', 'Baja 5 cm de cintura', 5, dropSeries(D.pBody, 'waist'), 'cm');
  add('pau', 'p-rir', '🎯', 'Entreno con cabeza', 'Apunta el RIR en 20 ejercicios', 20, countSeries(D.rirDays.slice().sort()), 'ejercicios');
  add('pau', 'p-notes', '📝', 'Diario de entreno', 'Escribe 5 notas de sesión', 5, countSeries(D.pNotes), 'notas');
  add('pau', 'p-meas', '🧮', 'Me mido, luego existo', 'Registra tu peso o cintura 4 veces', 4, countSeries(D.pBody.map((x) => x.date)), 'veces');

  // Marina
  const mS = countSeries(D.mActive);
  add('marina', 'm-first', '🏁', 'Primer día', 'Completa tu primera actividad', 1, mS);
  [[10, 'Calentando motores'], [25, 'Ya es costumbre'], [50, 'Medio centenar'], [100, 'Centenaria']].forEach(([n, t]) => add('marina', 'm-s' + n, '💗', t, `${n} días activos`, n, mS, 'días'));
  const mStr = streakSeries(D.mActive, TARGET.marina);
  [[2, 'En racha'], [4, 'Un mes sin fallar'], [8, 'Dos meses on fire'], [12, 'Leyenda']].forEach(([n, t]) => add('marina', 'm-str' + n, '🔥', t, `${n} semanas seguidas con 4+ días activos`, n, mStr, 'semanas'));
  add('marina', 'm-run1', '👟', 'Primera carrera', 'Completa tu primera sesión de carrera', 1, countSeries(D.runs.map((r) => r.date)));
  [[10, 'Corredora'], [25, 'Corredora habitual'], [39, 'Plan completo']].forEach(([n, t]) => add('marina', 'm-runs' + n, '🏃‍♀️', t, n === 39 ? 'Completa las 39 sesiones del plan de carrera' : `${n} carreras`, n, countSeries(D.runs.map((r) => r.date)), 'carreras'));
  const contS = maxSeries(D.runs.map((r) => [r.date, maxCont(r.w, r.s)]));
  [[5, '5 minutos sin parar'], [10, '10 minutos sin parar'], [20, '20 minutos sin parar'], [30, 'Media hora corriendo'], [45, '45 minutos'], [55, '¡Objetivo 7–8 km!']]
    .forEach(([n, t]) => add('marina', 'm-cont' + n, n >= 55 ? '🥇' : '⏱️', t, `Corre ${n} minutos seguidos`, n, contS, 'min'));
  const paced = D.runs.filter((r) => +r.pace > 0 && +r.km >= 2);
  add('marina', 'm-pace8', '⚡', 'Ritmo de 8', 'Una carrera de 2+ km a menos de 8 min/km de media', 1, countSeries(paced.filter((r) => +r.pace < 8).map((r) => r.date)));
  add('marina', 'm-pace7', '🚀', 'Ritmo de 7', 'Una carrera de 2+ km a menos de 7 min/km de media', 1, countSeries(paced.filter((r) => +r.pace < 7).map((r) => r.date)));
  add('marina', 'm-5k', '🎽', 'Mis primeros 5 km', 'Recorre 5 km en una sola salida', 5, maxSeries(D.runs.filter((r) => +r.km > 0).map((r) => [r.date, +r.km])), 'km');
  add('marina', 'm-lvl4', '🦾', 'Nivel 4', 'Llega al nivel máximo de las rutinas', 1, countSeries((D.rfeed || []).filter((f) => +f.lvl >= 4).map((f) => f.date)));
  const kmS = sumSeries(D.runs.filter((r) => +r.km > 0).map((r) => [r.date, +r.km]));
  [[10, 'Primeros 10 km'], [25, '25 km'], [50, '50 km'], [100, 'Club de los 100 km']].forEach(([n, t]) => add('marina', 'm-km' + n, '🗺️', t, `${n} km apuntados en total`, n, kmS, 'km'));
  const rS = countSeries(D.routs.map((r) => r.date));
  [[1, 'Primera rutina'], [10, 'Constante en casa'], [25, '25 rutinas'], [50, 'Medio centenar de rutinas']].forEach(([n, t]) => add('marina', 'm-r' + n, '🏠', t, `${n} rutina${n > 1 ? 's' : ''} en casa`, n, rS, 'rutinas'));
  const seen = new Set(); const distinct = D.routs.map((r) => { seen.add(r.r); return [r.date, seen.size]; });
  add('marina', 'm-allr', '🎨', 'Coleccionista de rutinas', 'Haz las 4 rutinas al menos una vez', 4, distinct, 'rutinas');
  add('marina', 'm-legs10', '🍑', 'Piernas de baloncesto', '10 rutinas de piernas y caderas', 10, countSeries(D.routs.filter((r) => r.r === 'A').map((r) => r.date)), 'rutinas');
  add('marina', 'm-abs10', '✨', 'Abdomen de acero', '10 rutinas Exprés o Quema total', 10, countSeries(D.routs.filter((r) => r.r === 'X' || r.r === 'C').map((r) => r.date)), 'rutinas');
  add('marina', 'm-bb10', '🏀', 'Jugadora de equipo', 'Marca 10 entrenos o partidos de baloncesto', 10, countSeries(D.bbDays), 'días');
  add('marina', 'm-waist3', '📏', 'Cintura −3 cm', 'Baja 3 cm de cintura desde tu primera medida', 3, dropSeries(D.mBody, 'cintura'), 'cm');
  add('marina', 'm-hip3', '🍐', 'Cadera −3 cm', 'Baja 3 cm de cadera', 3, dropSeries(D.mBody, 'cadera'), 'cm');
  add('marina', 'm-thigh2', '🦵', 'Muslo −2 cm', 'Baja 2 cm de muslo', 2, dropSeries(D.mBody, 'muslo'), 'cm');
  add('marina', 'm-arm1', '💪', 'Brazo −1 cm', 'Baja 1 cm de brazo', 1, dropSeries(D.mBody, 'brazo'), 'cm');
  add('marina', 'm-meas', '🧮', 'Me mido, luego existo', 'Registra tus medidas 4 veces', 4, countSeries(D.mBody.map((x) => x.date)), 'veces');
  add('marina', 'm-notes', '📝', 'Diario de entreno', 'Escribe 5 notas', 5, countSeries(D.mNotes), 'notas');

  // Pareja
  const pSet = new Set(D.pActive); const both = D.mActive.filter((d) => pSet.has(d));
  [[1, 'Entrenamos juntos'], [10, 'Equipo de dos'], [25, 'Dúo dinámico'], [50, 'Inseparables']].forEach(([n, t]) => add('pareja', 'c-same' + n, '👫', t, `${n} día${n > 1 ? 's' : ''} en los que entrenáis los dos`, n, countSeries(both), 'días'));
  const pw = weekCounts(D.pActive), mw = weekCounts(D.mActive);
  const bothWeeks = Object.keys(pw).filter((w) => (pw[w] || 0) >= TARGET.pau && (mw[w] || 0) >= TARGET.marina);
  const bothDates = bothWeeks.flatMap((w) => [addDays(w, 0)]).map((w) => addDays(w, 6) > today() ? today() : addDays(w, 6)).sort();
  add('pareja', 'c-week1', '🤝', 'Semana de equipo', 'Los dos cumplís el objetivo la misma semana', 1, countSeries(bothDates));
  // racha de pareja
  const coupleStreak = (() => { const out = []; if (!bothWeeks.length) return out; let w = bothWeeks.sort()[0], s = 0; const last = mondayOf(today()); const set = new Set(bothWeeks);
    while (w <= last) { if (set.has(w)) { s++; out.push([addDays(w, 6) > today() ? today() : addDays(w, 6), s]); } else if (w !== last) s = 0; w = addDays(w, 7); } return out; })();
  [[2, 'Racha de pareja'], [4, 'Un mes a tope juntos'], [8, 'Pareja imparable']].forEach(([n, t]) => add('pareja', 'c-str' + n, '💞', t, `${n} semanas seguidas cumpliendo los dos`, n, coupleStreak, 'semanas'));
  const all = [...D.pActive, ...D.mActive].sort();
  [[100, '100 entre los dos'], [250, '250 entre los dos'], [500, 'Medio millar']].forEach(([n, t]) => add('pareja', 'c-tot' + n, '💯', t, `${n} días activos sumando los dos`, n, countSeries(all), 'días'));
  const cheerDates = D.cheers.map((c) => c.date).filter(Boolean).sort();
  [[1, 'Primer ánimo'], [10, 'Fans el uno del otro'], [50, 'Club de fans']].forEach(([n, t]) => add('pareja', 'c-ch' + n, '💌', t, `${n} ánimo${n > 1 ? 's' : ''} enviado${n > 1 ? 's' : ''} entre los dos`, n, countSeries(cheerDates), 'ánimos'));
  const prsTot = countSeries(D.prs.map((p) => p.date).concat(D.runs.filter((r) => maxCont(r.w, r.s) >= 10).map((r) => r.date)).sort());
  add('pareja', 'c-rec', '🎖️', 'Récords en pareja', '20 récords o carreras largas sumando los dos', 20, prsTot, 'hitos');

  // Evaluar
  for (const a of A) {
    const s = a.series || []; let max = 0, date = null;
    for (const [d, v] of s) { if (v > max) max = v; if (!date && v >= a.goal) date = d; }
    a.value = max; a.done = max >= a.goal; a.date = date; a.pct = Math.max(0, Math.min(1, max / a.goal));
  }
  return A;
}

// ---------- Gráficas SVG ----------
function bars(values, labels, color, opts: any = {}) {
  const W = 320, H = opts.h || 120, pad = 18, n = values.length, max = Math.max(opts.min || 1, ...values);
  const bw = (W - 10) / n;
  let s = `<svg viewBox="0 0 ${W} ${H + pad}" width="100%" class="chart">`;
  if (opts.target) { const y = H - (opts.target / max) * (H - 14); s += `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="${color}" stroke-dasharray="4 4" opacity=".5"/><text x="${W - 2}" y="${y - 3}" text-anchor="end" class="ct">objetivo</text>`; }
  values.forEach((v, i) => {
    const h = v ? Math.max(3, (v / max) * (H - 14)) : 0; const x = 5 + i * bw + bw * 0.15;
    s += `<rect x="${x}" y="${H - h}" width="${bw * 0.7}" height="${h}" rx="4" fill="${color}" opacity="${i === n - 1 ? 1 : 0.75}"/>`;
    if (v && opts.showVal) s += `<text x="${x + bw * 0.35}" y="${H - h - 3}" text-anchor="middle" class="cv">${opts.fmtV ? opts.fmtV(v) : v}</text>`;
    if (labels[i]) s += `<text x="${x + bw * 0.35}" y="${H + 13}" text-anchor="middle" class="ct">${labels[i]}</text>`;
  });
  return s + '</svg>';
}
function spark(vals, color, W = 120, H = 32) {
  if (vals.length < 2) return '';
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const pts = vals.map((v, i) => [4 + (i * (W - 8)) / (vals.length - 1), H - 4 - (mx === mn ? 0.5 : (v - mn) / (mx - mn)) * (H - 8)]);
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><polyline points="${pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function ring(v, target, color, label) {
  const r = 34, c = 2 * Math.PI * r, p = Math.min(1, v / target);
  return `<svg viewBox="0 0 90 90" width="90" height="90"><circle cx="45" cy="45" r="${r}" fill="none" stroke="#efe9e3" stroke-width="9"/>
  <circle cx="45" cy="45" r="${r}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(c * p).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 45 45)"/>
  <text x="45" y="47" text-anchor="middle" font-size="20" font-weight="700" fill="#1f2433">${v}</text><text x="45" y="63" text-anchor="middle" font-size="10" fill="#8a8f9c">${label}</text></svg>`;
}
const last12Weeks = () => { const out = []; let w = mondayOf(today()); for (let i = 0; i < 12; i++) { out.unshift(w); w = addDays(w, -7); } return out; };
const wLabel = (w) => { const d = pdate(w); return `${d.getDate()}/${d.getMonth() + 1}`; };

// ---------- CSS ----------
const CSS = `
:host{display:block;color:#1f2433;font-family:Poppins,system-ui,sans-serif}
.wrap{max-width:760px;margin:0 auto;padding:0 14px 90px}
.hero{border-radius:22px;padding:18px;color:#fff;margin:10px 0 12px;background:linear-gradient(120deg,#e0663a,#d9718f 55%,#8a63b5)}
.hero h1{margin:0;font-size:22px}
.hero p{margin:4px 0 0;font-size:13px;opacity:.95}
nav.sub{position:sticky;top:var(--top-offset,0px);z-index:4;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px 0;background:var(--bg,#f8f4f2)}
nav.sub button{border:1px solid #ece4dc;background:#fff;border-radius:14px;padding:9px 4px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;color:#1f2433}
nav.sub button.on{background:#1f2433;color:#fff;border-color:#1f2433}
.card{background:#fff;border:1px solid #efe7df;border-radius:20px;padding:14px 16px;margin-bottom:12px;font-size:13.5px;line-height:1.5}
.card h3{margin:0 0 8px;font-size:15.5px}
.small{font-size:12px;color:#8a8f9c}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.who{border-radius:18px;padding:12px;text-align:center}
.who h4{margin:0 0 2px;font-size:14px}
.dots{display:flex;justify-content:center;gap:4px;margin-top:6px}
.dots i{width:16px;height:16px;border-radius:5px;background:#efe9e3;font-style:normal;font-size:9px;display:flex;align-items:center;justify-content:center;color:#fff}
.banner{border-radius:16px;padding:12px 14px;font-size:14px;font-weight:600;margin-top:10px;text-align:center}
.cheers{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.cheers button{border:1px solid #efe7df;background:#fff;border-radius:999px;padding:8px 12px;font:inherit;font-size:13px;cursor:pointer}
.cheers button:active{transform:scale(.96)}
.inrow{display:flex;gap:6px;margin-top:8px}
.inrow input{flex:1;min-width:0;font:inherit;font-size:16px;border:1px solid #efe7df;border-radius:12px;padding:8px 10px}
.btn{border:0;border-radius:999px;padding:9px 14px;font:inherit;font-size:13px;font-weight:600;color:#fff;background:#8a63b5;cursor:pointer}
.feed .it{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #f4efe9;align-items:flex-start}
.feed .it:last-child{border-bottom:0}
.feed .em{width:34px;height:34px;flex:none;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:17px}
.feed .tx{flex:1;font-size:13px;line-height:1.4}
.feed .tx span{display:block;font-size:11.5px;color:#8a8f9c}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.chips button{border:1px solid #efe7df;background:#fff;border-radius:999px;padding:6px 12px;font:inherit;font-size:12.5px;cursor:pointer}
.chips button.on{background:#1f2433;color:#fff;border-color:#1f2433}
.sum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.sum div{border-radius:14px;padding:10px;text-align:center}
.sum b{display:block;font-size:20px}
.sum span{font-size:11.5px;color:#6b7080}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.ach{background:#fff;border:1px solid #efe7df;border-radius:16px;padding:10px;position:relative;overflow:hidden}
.ach .e{font-size:28px;line-height:1}
.ach.lock .e{filter:grayscale(1);opacity:.45}
.ach h5{margin:6px 0 2px;font-size:13px;line-height:1.25}
.ach p{margin:0;font-size:11.5px;color:#6b7080;line-height:1.35}
.ach .bar{height:5px;border-radius:5px;background:#f1ece6;margin-top:7px;overflow:hidden}
.ach .bar i{display:block;height:100%}
.ach .meta{font-size:10.5px;color:#8a8f9c;margin-top:4px}
.ach .tag{position:absolute;top:8px;right:8px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;color:#fff}
.ach.new{box-shadow:0 0 0 2px #f2b84b inset;animation:pop .6s ease}
@keyframes pop{0%{transform:scale(.9)}60%{transform:scale(1.04)}100%{transform:scale(1)}}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:8px;margin-bottom:10px}
.stats div{background:#f8f4f0;border-radius:12px;padding:8px 10px}
.stats b{display:block;font-size:18px}
.stats span{font-size:11.5px;color:#6b7080;line-height:1.3;display:block}
.chart{display:block;margin:4px 0}
.chart .ct{font-size:9px;fill:#8a8f9c}
.chart .cv{font-size:9px;fill:#1f2433;font-weight:600}
table{width:100%;border-collapse:collapse;font-size:12.5px}
td,th{padding:6px 4px;border-bottom:1px solid #f4efe9;text-align:left;vertical-align:middle}
th{font-size:11px;color:#8a8f9c;font-weight:500}
.up{color:#3d8a55;font-weight:600}.down{color:#c0392b;font-weight:600}
.pbar{height:10px;border-radius:10px;background:#f1ece6;overflow:hidden;margin:6px 0}
.pbar i{display:block;height:100%;border-radius:10px}
.newbox{border-radius:20px;padding:14px 16px;margin-bottom:12px;background:linear-gradient(120deg,#fff5dc,#fde4ec);border:1px solid #f6dfb0}
.newbox h3{margin:0 0 6px}
.confetti{position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden}
.confetti i{position:absolute;top:-12px;width:8px;height:12px;border-radius:2px;animation:fall 2.6s linear forwards}
@keyframes fall{to{transform:translateY(105vh) rotate(720deg);opacity:.8}}
.vs{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;text-align:center;font-size:13px}
.vs b{font-size:22px;display:block}
.vs .mid{font-size:11px;color:#8a8f9c}
`;

// ---------- Montaje ----------
export function mountJuntos(host: HTMLElement, stores: Record<Who, CoreStore>, me: Who | null): () => void {
  const R = host.shadowRoot || host.attachShadow({ mode: 'open' });
  let alive = true;
  let tab = 'pareja', filter = 'todos', perf: Who = me || 'pau';
  const seenKey = 'logros-vistos-' + (me || 'anon');
  const getSeen = () => { try { return new Set(JSON.parse(localStorage.getItem(seenKey) || '[]')); } catch { return new Set(); } };
  const setSeen = (ids) => { try { localStorage.setItem(seenKey, JSON.stringify([...ids])); } catch { /* ignorar */ } };
  let firstLoad = !(() => { try { return localStorage.getItem(seenKey); } catch { return null; } })();

  function render() {
    if (!alive) return;
    const D = analyse(stores);
    const ACH = achievements(D);
    const seen = getSeen();
    if (firstLoad) { setSeen(new Set(ACH.filter((a) => a.done).map((a) => a.id))); firstLoad = false; }
    const fresh = ACH.filter((a) => a.done && !getSeen().has(a.id));
    const y = window.scrollY;
    R.innerHTML = `<style>${CSS}</style><div class="wrap">
      <div class="hero"><h1>Entrenamos juntos 💞</h1><p>Logros, progreso y ánimos entre Pau y Marina.</p></div>
      <nav class="sub">${[['pareja', '👫 Pareja'], ['logros', `🏆 Logros${fresh.length ? ` (${fresh.length})` : ''}`], ['rend', '📊 Rendimiento']].map(([k, t]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${t}</button>`).join('')}</nav>
      <div id="body">${tab === 'pareja' ? vPareja(D, ACH, fresh) : tab === 'logros' ? vLogros(ACH, seen) : vRend(D)}</div></div>`;
    R.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; render(); window.scrollTo({ top: 0 }); }));
    R.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { filter = b.dataset.f; render(); }));
    R.querySelectorAll('[data-perf]').forEach((b) => (b.onclick = () => { perf = b.dataset.perf; render(); }));
    R.querySelectorAll('[data-cheer]').forEach((b) => (b.onclick = () => sendCheer(b.dataset.cheer)));
    const ci = R.getElementById('cheertxt'); const cb = R.getElementById('cheersend');
    if (cb) cb.onclick = () => { const t = (ci.value || '').trim(); if (t) { sendCheer(t); ci.value = ''; } };
    const go = R.getElementById('golog'); if (go) go.onclick = () => { tab = 'logros'; render(); window.scrollTo({ top: 0 }); };
    if (tab === 'logros' && fresh.length) { confetti(); const s = getSeen(); fresh.forEach((a) => s.add(a.id)); setSeen(s); }
    window.scrollTo(0, y);
  }

  function sendCheer(text) {
    if (!me) return;
    const other: Who = me === 'pau' ? 'marina' : 'pau';
    const st = stores[other]; const cur = (st.get('cheers') || {}).items || [];
    const items = [...cur, { from: me, text, ts: Date.now(), date: today() }].slice(-40);
    st.set('cheers', { items, updated: Date.now() });
    const msg = R.getElementById('cheermsg'); if (msg) msg.textContent = `Enviado a ${NAMES[other]} ✓`;
    setTimeout(() => { if (alive) render(); }, 900);
  }

  function confetti() {
    const box = document.createElement('div'); box.className = 'confetti';
    const cols = ['#e0663a', '#d9718f', '#8a63b5', '#f2b84b', '#6fb7a0'];
    for (let i = 0; i < 70; i++) { const p = document.createElement('i'); p.style.left = Math.random() * 100 + '%'; p.style.background = cols[i % cols.length]; p.style.animationDelay = Math.random() * 0.8 + 's'; p.style.transform = `rotate(${Math.random() * 360}deg)`; box.appendChild(p); }
    R.appendChild(box); setTimeout(() => box.remove(), 3600);
  }

  // ---------- Pareja ----------
  function vPareja(D, ACH, fresh) {
    const wk = mondayOf(today());
    const days = (dates) => { const s = new Set(dates); return Array.from({ length: 7 }, (_, i) => s.has(addDays(wk, i))); };
    const pd = days(D.pActive), md = days(D.mActive);
    const pc = pd.filter(Boolean).length, mc = md.filter(Boolean).length;
    const pOk = pc >= TARGET.pau, mOk = mc >= TARGET.marina;
    const dots = (arr, col) => `<div class="dots">${arr.map((v, i) => `<i style="${v ? `background:${col}` : ''}">${'LMXJVSD'[i]}</i>`).join('')}</div>`;
    const bothSet = new Set(D.pActive); const same = D.mActive.filter((d) => bothSet.has(d));
    const pw = weekCounts(D.pActive), mw = weekCounts(D.mActive);
    let cs = 0; { let w = wk; if ((pw[w] || 0) >= TARGET.pau && (mw[w] || 0) >= TARGET.marina) cs++; w = addDays(w, -7); while ((pw[w] || 0) >= TARGET.pau && (mw[w] || 0) >= TARGET.marina) { cs++; w = addDays(w, -7); } }
    let banner;
    if (pOk && mOk) banner = `<div class="banner" style="background:#e3f3e8;color:#2f6d42">🎉 ¡Reto de la semana cumplido por los dos!</div>`;
    else banner = `<div class="banner" style="background:#f6f0fb;color:#5e3f86">Reto de la semana: ${pOk ? 'Pau ✓' : `a Pau le faltan ${TARGET.pau - pc} día${TARGET.pau - pc > 1 ? 's' : ''}`} · ${mOk ? 'Marina ✓' : `a Marina le faltan ${TARGET.marina - mc} día${TARGET.marina - mc > 1 ? 's' : ''}`}</div>`;
    const done = (w) => ACH.filter((a) => a.who === w && a.done).length;
    const month = today().slice(0, 7);
    const mpc = D.pActive.filter((d) => d.startsWith(month)).length, mmc = D.mActive.filter((d) => d.startsWith(month)).length;
    // feed
    const ev = [];
    const pTitle = (d) => { const ids = D.pDays[d].done || []; const ks = [...new Set(ids.map((x) => x.split('-')[0]))]; return ks.map((k) => PAU_DAY_TITLE[k]).filter(Boolean).join(' + ') || 'gym'; };
    for (const d of D.pActive) ev.push({ date: d, who: 'pau', em: '🏋️', t: `Pau entrenó ${pTitle(d)}` });
    for (const p of D.prs) ev.push({ date: p.date, who: 'pau', em: '🏆', t: `Pau: récord en ${p.name} (${p.text})`, hi: true });
    for (const r of D.runs) ev.push({ date: r.date, who: 'marina', em: '🏃‍♀️', t: `Marina corrió la semana ${r.w} · sesión ${r.s}${r.km ? ` (${fmt(+r.km)} km)` : ''}${r.pace ? ` · ${paceTxt(+r.pace)}` : ''}${maxCont(r.w, r.s) >= 10 ? ` · ${maxCont(r.w, r.s)}' seguidos` : ''}` });
    for (const r of D.routs) ev.push({ date: r.date, who: 'marina', em: '💗', t: `Marina hizo la rutina ${ROUT_NAMES[r.r] || r.r}` });
    for (const a of ACH) if (a.done && a.date) ev.push({ date: a.date, who: a.who, em: a.emoji, t: `${a.who === 'pareja' ? 'Los dos' : NAMES[a.who]} desbloque${a.who === 'pareja' ? 'asteis' : 'ó'} «${a.name}»`, hi: true });
    for (const c of D.cheers) ev.push({ date: c.date, ts: c.ts, who: c.from, em: '💌', t: `${NAMES[c.from]} → ${NAMES[c.to]}: «${esc(c.text)}»` });
    ev.sort((a, b) => b.date.localeCompare(a.date) || (b.ts || 0) - (a.ts || 0) || (b.hi ? 1 : 0) - (a.hi ? 1 : 0));
    const feed = ev.slice(0, 25);
    const received = me ? D.cheers.filter((c) => c.to === me).slice(-3).reverse() : [];
    const other = me === 'pau' ? 'marina' : me === 'marina' ? 'pau' : null;
    return `
      ${fresh.length ? `<div class="newbox"><h3>🎉 ${fresh.length === 1 ? 'Nuevo logro' : `${fresh.length} logros nuevos`}</h3>${fresh.slice(0, 4).map((a) => `<div>${a.emoji} <b>${a.name}</b> · ${a.who === 'pareja' ? 'los dos' : NAMES[a.who]}</div>`).join('')}<div style="margin-top:8px"><button class="btn" id="golog">Ver logros</button></div></div>` : ''}
      <div class="card"><h3>Esta semana</h3>
        <div class="two">
          <div class="who" style="background:${SOFT.pau}"><h4>Pau</h4>${ring(pc, 5, COLORS.pau, 'de 5 días')}${dots(pd, COLORS.pau)}</div>
          <div class="who" style="background:${SOFT.marina}"><h4>Marina</h4>${ring(mc, 7, COLORS.marina, 'días activos')}${dots(md, COLORS.marina)}</div>
        </div>${banner}
        <p class="small" style="margin:8px 0 0">El reto: Pau 4+ días de gym y Marina 4+ días activos (carrera, rutinas o baloncesto) en la misma semana.</p></div>
      <div class="card"><h3>Marcador</h3><div class="vs">
        <div><b style="color:${COLORS.pau}">${cs}</b><span class="small">semanas seguidas<br>cumpliendo los dos</span></div><div class="mid">💞</div>
        <div><b style="color:${COLORS.marina}">${same.length}</b><span class="small">días en los que<br>entrenasteis los dos</span></div></div>
        <table style="margin-top:10px"><tr><th></th><th style="color:${COLORS.pau}">Pau</th><th style="color:${COLORS.marina}">Marina</th></tr>
        <tr><td>Días activos este mes</td><td><b>${mpc}</b></td><td><b>${mmc}</b></td></tr>
        <tr><td>Racha actual (semanas)</td><td><b>${currentStreak(D.pActive, TARGET.pau)}</b></td><td><b>${currentStreak(D.mActive, TARGET.marina)}</b></td></tr>
        <tr><td>Logros</td><td><b>${done('pau')}</b></td><td><b>${done('marina')}</b></td></tr>
        <tr><td>Logros de pareja</td><td colspan="2"><b>${done('pareja')}</b> / ${ACH.filter((a) => a.who === 'pareja').length}</td></tr></table></div>
      ${other ? `<div class="card"><h3>Mándale ánimos a ${NAMES[other]} 💌</h3>
        <div class="cheers">${['💪 ¡Vamos crack!', '🔥 ¡Qué máquina!', '❤️ Estoy orgullos' + (me === 'pau' ? 'o' : 'a') + ' de ti', other === 'marina' ? '🏃‍♀️ ¡A correr!' : '🏋️ ¡A darle al hierro!', '🍕 Te has ganado un premio', '😴 Descansa, te lo mereces'].map((t) => `<button data-cheer="${esc(t)}">${t}</button>`).join('')}</div>
        <div class="inrow"><input id="cheertxt" maxlength="120" placeholder="O escribe tu mensaje…"><button class="btn" id="cheersend">Enviar</button></div>
        <div class="small" id="cheermsg" style="margin-top:6px"></div>
        ${received.length ? `<div style="margin-top:10px"><b style="font-size:12.5px">Lo último que te ha mandado:</b>${received.map((c) => `<div class="small" style="color:#1f2433;margin-top:4px">💌 «${esc(c.text)}» · ${fdate(c.date)}</div>`).join('')}</div>` : ''}</div>` : ''}
      <div class="card feed"><h3>Actividad reciente</h3>${feed.length ? feed.map((e) => `<div class="it"><div class="em" style="background:${SOFT[e.who] || '#f4efe9'}">${e.em}</div><div class="tx">${e.hi ? `<b>${e.t}</b>` : e.t}<span>${fdate(e.date)}</span></div></div>`).join('') : '<p class="small">Aún no hay actividad. ¡El primero que entrene estrena el muro!</p>'}</div>`;
  }

  // ---------- Logros ----------
  function vLogros(ACH, seen) {
    const list = ACH.filter((a) => filter === 'todos' || a.who === filter);
    const cnt = (w) => `${ACH.filter((a) => a.who === w && a.done).length}/${ACH.filter((a) => a.who === w).length}`;
    const sorted = list.slice().sort((a, b) => (b.done - a.done) || (a.done ? (b.date || '').localeCompare(a.date || '') : b.pct - a.pct));
    const nf = (v, a) => a.unit === 'kg' && a.goal >= 1000 ? `${fmt(v / 1000, 1)} t` : fmt(v, a.unit === 'km' || a.unit === 'cm' ? 1 : 0);
    return `
      <div class="sum"><div style="background:${SOFT.pau}"><b>${cnt('pau')}</b><span>Pau</span></div><div style="background:${SOFT.marina}"><b>${cnt('marina')}</b><span>Marina</span></div><div style="background:${SOFT.pareja}"><b>${cnt('pareja')}</b><span>Pareja</span></div></div>
      <div class="chips">${[['todos', 'Todos'], ['pau', 'Pau'], ['marina', 'Marina'], ['pareja', 'Pareja']].map(([k, t]) => `<button data-f="${k}" class="${filter === k ? 'on' : ''}">${t}</button>`).join('')}</div>
      <div class="grid">${sorted.map((a) => `<div class="ach ${a.done ? '' : 'lock'} ${a.done && !seen.has(a.id) ? 'new' : ''}">
        <span class="tag" style="background:${COLORS[a.who]}">${a.who === 'pareja' ? '💞' : NAMES[a.who]}</span>
        <div class="e">${a.emoji}</div><h5>${a.name}</h5><p>${a.desc}</p>
        ${a.done ? `<div class="meta">✓ Conseguido${a.date ? ' el ' + fdate(a.date) : ''}</div>` : `<div class="bar"><i style="width:${(a.pct * 100).toFixed(0)}%;background:${COLORS[a.who]}"></i></div><div class="meta">${nf(Math.max(0, a.value), a)} / ${nf(a.goal, a)} ${a.unit && !(a.unit === 'kg' && a.goal >= 1000) ? a.unit : ''}</div>`}
      </div>`).join('')}</div>`;
  }

  // ---------- Rendimiento ----------
  function vRend(D) {
    const weeks = last12Weeks(); const labels = weeks.map((w, i) => (i % 2 === 1 || i === 11 ? wLabel(w) : ''));
    const head = `<div class="chips">${['pau', 'marina'].map((w) => `<button data-perf="${w}" class="${perf === w ? 'on' : ''}">${NAMES[w]}</button>`).join('')}</div>`;
    if (perf === 'pau') {
      const wc = weekCounts(D.pActive);
      const wv = {}; for (const [d, v] of Object.entries(D.volByDate)) { const w = mondayOf(d); wv[w] = (wv[w] || 0) + v; }
      const thisW = mondayOf(today());
      const totalVol = Object.values(D.volByDate).reduce((a, b) => a + b, 0);
      const lifts = BIG.map((b) => { const p = D.firstLast[b.key] || []; if (!p.length) return null; const f = p[0], l = p[p.length - 1]; const best = Math.max(...p.map((x) => x.est || 0));
        const pct = f.kg ? ((l.kg - f.kg) / f.kg) * 100 : 0; return { ...b, f, l, best, pct, vals: p.map((x) => x.kg) }; }).filter(Boolean);
      const progress = Object.entries(D.firstLast).map(([k, p]) => { const ex = PAU_EX.find((e) => e.key === k); if (!ex || ex.type !== 'w' || p.length < 2 || !p[0].kg) return null; return { name: ex.name, pct: ((p[p.length - 1].kg - p[0].kg) / p[0].kg) * 100, from: p[0].kg, to: p[p.length - 1].kg }; })
        .filter(Boolean).sort((a, b) => b.pct - a.pct).slice(0, 5);
      const body = D.pBody;
      const kgs = body.filter((x) => +x.kg > 0), ws = body.filter((x) => +x.waist > 0);
      return head + `
        <div class="stats"><div><b>${D.pActive.length}</b><span>días de gym</span></div><div><b>${wc[thisW] || 0}/5</b><span>esta semana</span></div><div><b>${currentStreak(D.pActive, TARGET.pau)}</b><span>semanas de racha</span></div><div><b>${D.prs.length}</b><span>récords personales</span></div><div><b>${fmt(totalVol / 1000, 1)} t</b><span>movidas en total</span></div></div>
        <div class="card"><h3>Días por semana</h3>${bars(weeks.map((w) => wc[w] || 0), labels, COLORS.pau, { target: TARGET.pau, min: 5, showVal: true })}</div>
        <div class="card"><h3>Volumen semanal (toneladas)</h3><p class="small" style="margin:0">Peso × repeticiones de todas las series. Si sube con el tiempo, estás progresando.</p>${bars(weeks.map((w) => (wv[w] || 0) / 1000), labels, '#f0a35e', { showVal: true, fmtV: (v) => fmt(v, 1) })}</div>
        <div class="card"><h3>Ejercicios principales</h3>${lifts.length ? `<table><tr><th>Ejercicio</th><th>Inicio → ahora</th><th>1RM est.</th><th></th></tr>${lifts.map((l) => `<tr><td>${l.short}</td><td>${fmt(l.f.kg)} → <b>${fmt(l.l.kg)} kg</b> ${l.pct ? `<span class="${l.pct >= 0 ? 'up' : 'down'}">${l.pct > 0 ? '+' : ''}${fmt(l.pct, 0)}%</span>` : ''}</td><td>${fmt(l.best, 0)} kg</td><td>${spark(l.vals, COLORS.pau, 70, 24)}</td></tr>`).join('')}</table><p class="small">1RM estimado: el peso máximo que podrías levantar una vez, calculado con tus series (fórmula de Epley). Solo es orientativo, no hace falta probarlo.</p>` : '<p class="small">Cuando apuntes pesos en los ejercicios principales verás aquí tu evolución.</p>'}</div>
        ${progress.length ? `<div class="card"><h3>Lo que más ha mejorado</h3><table>${progress.map((p) => `<tr><td>${p.name}</td><td>${fmt(p.from)} → ${fmt(p.to)} kg</td><td class="${p.pct >= 0 ? 'up' : 'down'}">${p.pct > 0 ? '+' : ''}${fmt(p.pct, 0)}%</td></tr>`).join('')}</table></div>` : ''}
        <div class="card"><h3>Cuerpo</h3>${kgs.length || ws.length ? `<table>${kgs.length ? `<tr><td>Peso</td><td>${fmt(+kgs[0].kg)} → <b>${fmt(+kgs[kgs.length - 1].kg)} kg</b></td><td>${spark(kgs.map((x) => +x.kg), '#273046', 90, 26)}</td></tr>` : ''}${ws.length ? `<tr><td>Cintura</td><td>${fmt(+ws[0].waist)} → <b>${fmt(+ws[ws.length - 1].waist)} cm</b></td><td>${spark(ws.map((x) => +x.waist), COLORS.pau, 90, 26)}</td></tr>` : ''}</table><p class="small">Para ganar músculo y perder grasa a la vez, lo ideal es que la cintura baje o se mantenga mientras los pesos suben.</p>` : '<p class="small">Apunta tu peso y cintura en Progreso para verlos aquí.</p>'}</div>`;
    }
    // Marina
    const wc = weekCounts(D.mActive);
    const wr = {}; for (const r of D.runs) { const w = mondayOf(r.date); wr[w] = (wr[w] || 0) + runMinutes(r.w, r.s); }
    const km = D.runs.reduce((a, r) => a + (+r.km || 0), 0);
    const best = Math.max(0, ...D.runs.map((r) => maxCont(r.w, r.s)));
    const lastRun = D.runs[D.runs.length - 1];
    const planDone = new Set(D.runs.map((r) => `${r.w}-${r.s}`)).size;
    const rc = { A: 0, B: 0, C: 0, X: 0 }; D.routs.forEach((r) => (rc[r.r] = (rc[r.r] || 0) + 1));
    const rmax = Math.max(1, ...Object.values(rc));
    const M = [['kg', 'Peso', 'kg'], ['cintura', 'Cintura', 'cm'], ['cadera', 'Cadera', 'cm'], ['muslo', 'Muslo', 'cm'], ['brazo', 'Brazo', 'cm']];
    const mrows = M.map(([f, n, u]) => { const v = D.mBody.filter((x) => +x[f] > 0); if (!v.length) return ''; const a = +v[0][f], b = +v[v.length - 1][f], d = b - a;
      return `<tr><td>${n}</td><td>${fmt(a)} → <b>${fmt(b)} ${u}</b></td><td class="${d < 0 ? 'up' : d > 0 ? 'down' : ''}">${d ? (d > 0 ? '+' : '') + fmt(d) : '='}</td><td>${spark(v.map((x) => +x[f]), COLORS.marina, 80, 24)}</td></tr>`; }).join('');
    return head + `
      <div class="stats"><div><b>${D.mActive.length}</b><span>días activos</span></div><div><b>${wc[mondayOf(today())] || 0}</b><span>esta semana</span></div><div><b>${D.runs.length}</b><span>carreras</span></div><div><b>${best ? best + "'" : '–'}</b><span>máximo sin parar</span></div><div><b>${km ? fmt(km) : '–'}</b><span>km apuntados</span></div><div><b>${D.routs.length}</b><span>rutinas en casa</span></div></div>
      <div class="card"><h3>Plan de carrera</h3><div class="pbar"><i style="width:${((planDone / 39) * 100).toFixed(0)}%;background:linear-gradient(90deg,#f2a7bf,#d9718f)"></i></div>
        <p class="small" style="margin:0">${planDone} de 39 sesiones · ${lastRun ? `vas por la semana ${lastRun.w} de 13` : 'aún sin empezar'} · objetivo: 55' seguidos (≈ 7–8 km)</p></div>
      <div class="card"><h3>Días activos por semana</h3>${bars(weeks.map((w) => wc[w] || 0), labels, COLORS.marina, { target: TARGET.marina, min: 5, showVal: true })}</div>
      ${(() => { const pr = D.runs.filter((r) => +r.pace > 0 && +r.km >= 1); if (!pr.length) return ''; const best = Math.min(...pr.map((r) => +r.pace));
        return `<div class="card"><h3>Ritmo medio por carrera</h3><p class="small" style="margin:0">Minutos por km (incluye los tramos caminando, así que irá bajando según corras más seguido). Mejor: <b>${paceTxt(best)}</b></p>${bars(pr.slice(-12).map((r) => +r.pace), pr.slice(-12).map((r) => fdate(r.date).replace(' ', '')), '#b98bd6', { showVal: true, fmtV: (v) => paceTxt(v).replace('/km', '') })}</div>`; })()}
      <div class="card"><h3>Minutos corriendo por semana</h3>${bars(weeks.map((w) => wr[w] || 0), labels, '#f2a7bf', { showVal: true, fmtV: (v) => fmt(v, 0) })}</div>
      <div class="card"><h3>Rutinas en casa</h3><table>${Object.entries(rc).map(([k, v]) => `<tr><td>${ROUT_NAMES[k]}</td><td style="width:45%"><div class="pbar" style="margin:0"><i style="width:${(v / rmax) * 100}%;background:#b98bd6"></i></div></td><td><b>${v}</b></td></tr>`).join('')}</table></div>
      <div class="card"><h3>Medidas</h3>${mrows ? `<table>${mrows}</table><p class="small">En verde lo que ha bajado desde la primera medida. La grasa baja poco a poco y de todo el cuerpo: mira la tendencia de varias semanas, no un día suelto.</p>` : '<p class="small">Apunta tus medidas en Progreso para verlas aquí.</p>'}</div>`;
  }

  const unsubs = (['pau', 'marina'] as Who[]).map((w) => stores[w].subscribe(() => { if (alive && !R.activeElement) render(); }));
  render();
  return () => { alive = false; unsubs.forEach((u) => u()); R.innerHTML = ''; };
}

/** Ánimos recibidos que aún no se han visto (para el aviso de la cabecera). */
export function unseenCheers(store: CoreStore, me: Who): { from: Who; text: string; ts: number }[] {
  let seenTs = 0;
  try { seenTs = +(localStorage.getItem('animos-vistos-' + me) || 0); } catch { /* ignorar */ }
  return ((store.get('cheers') || {}).items || []).filter((c) => (c.ts || 0) > seenTs);
}
export function markCheersSeen(me: Who) {
  try { localStorage.setItem('animos-vistos-' + me, String(Date.now())); } catch { /* ignorar */ }
}
