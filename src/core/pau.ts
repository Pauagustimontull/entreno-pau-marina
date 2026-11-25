// @ts-nocheck
// Plan de Pau: gimnasio 4 entrenos numerados con registro de pesos, fases y progreso.
// Código portado de la primera versión (web independiente). Se monta dentro de un Shadow DOM.
import { L, rad, V, add, sub, mul, len, lerp, lerpV, dirV, ik, resolve, mix, P, ln, circ, limb, legSvg, refPt, drawProp, render } from './engine';
import type { CoreStore } from './store';

const CSS = "\n:host{display:block;\n  --bg:#f6f3ee; --card:#ffffff; --ink:#1f2433; --muted:#6b7080; --line:#e7e2d9;\n  --acc:#e0663a; --acc-soft:#fbe6dc;\n  --body:#273046; --far:#9aa3b8; --equip:#b9b2a6; --equip-dark:#857e72;\n}\n*{box-sizing:border-box}\n:host{color:var(--ink);font-family:Poppins,system-ui,sans-serif;-webkit-font-smoothing:antialiased}\n.wrap{max-width:760px;margin:0 auto;padding:0 14px 60px}\nheader.hero{padding:26px 4px 10px}\n.hero h1{font-size:26px;line-height:1.15;margin:0 0 6px;font-weight:700;letter-spacing:-.3px}\n.hero p{margin:0;color:var(--muted);font-size:14px;line-height:1.5}\n.pills{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}\n.pill{font-size:12px;background:#fff;border:1px solid var(--line);border-radius:999px;padding:4px 10px;color:var(--ink)}\nnav.tabs{position:sticky;top:var(--top-offset,0px);z-index:5;background:var(--bg);padding:10px 0 10px;display:grid;grid-template-columns:repeat(5,1fr);gap:6px}\nnav.tabs::-webkit-scrollbar{display:none}\n.tab{min-width:0;border:1px solid var(--line);background:#fff;border-radius:14px;padding:8px 10px;text-align:center;cursor:pointer;font-family:inherit;color:var(--ink)}\n.tab b{display:block;font-size:15px;font-weight:600}\n.tab span{display:block;font-size:10.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.tab.on{background:var(--dc,var(--acc));border-color:var(--dc,var(--acc));color:#fff}\n.tab.on span{color:rgba(255,255,255,.85)}\n.dayhead{border-radius:20px;padding:18px 18px 16px;color:#fff;margin:6px 0 14px;background:var(--dc)}\n.dayhead h2{margin:0;font-size:21px;font-weight:700}\n.dayhead p{margin:4px 0 0;font-size:13.5px;opacity:.92;line-height:1.45}\n.dayhead .meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}\n.dayhead .meta span{background:rgba(255,255,255,.2);border-radius:999px;padding:3px 10px;font-size:12px}\n.warm{background:#fff;border:1px dashed var(--line);border-radius:16px;padding:12px 14px;font-size:13.5px;line-height:1.5;margin-bottom:12px}\n.warm b{font-weight:600}\n.ex{background:var(--card);border-radius:20px;border:1px solid var(--line);margin-bottom:12px;overflow:hidden;display:grid;grid-template-columns:150px 1fr}\n@media (max-width:520px){.ex{grid-template-columns:1fr}}\n.fig{background:linear-gradient(180deg,#fbfaf7,#f1ede6);display:flex;align-items:center;justify-content:center;min-height:140px;position:relative}\n.fig svg{width:100%;max-width:220px;height:auto;display:block}\n.num{position:absolute;top:10px;left:10px;width:26px;height:26px;border-radius:50%;background:var(--dc);color:#fff;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center}\n.info{padding:14px 16px 14px}\n.info h3{margin:0 0 6px;font-size:16.5px;font-weight:600;line-height:1.25}\n.sr{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}\n.sr span{font-size:12.5px;border-radius:8px;padding:3px 8px;background:var(--soft);color:var(--ink);font-weight:500}\n.sr span.r{background:#f0eee9;color:var(--muted);font-weight:400}\n.mus{font-size:12px;color:var(--muted);margin-bottom:6px}\n.info ul{margin:0;padding-left:18px;font-size:13px;line-height:1.5;color:#3a3f4e}\n.info li{margin:2px 0}\n.tag{display:inline-block;font-size:11px;font-weight:600;letter-spacing:.3px;text-transform:uppercase;color:var(--dc);margin-bottom:3px}\n.done{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:12.5px;color:var(--muted);cursor:pointer;user-select:none}\n.done input{width:18px;height:18px;accent-color:var(--dc)}\n.ex.isdone{opacity:.55}\n.reset{display:block;margin:6px auto 22px;font-family:inherit;font-size:12.5px;border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 14px;color:var(--muted);cursor:pointer}\nsection.guide{margin-top:28px}\nsection.guide h2{font-size:19px;margin:0 0 10px}\n.gcard{background:#fff;border:1px solid var(--line);border-radius:18px;padding:14px 16px;margin-bottom:10px;font-size:13.5px;line-height:1.55}\n.gcard h4{margin:0 0 6px;font-size:14.5px;font-weight:600}\n.gcard ul{margin:0;padding-left:18px}\n.gcard li{margin:3px 0}\n.weeks{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px}\n.wk{border-radius:12px;padding:10px;font-size:12.5px;line-height:1.4;background:#f6f3ee}\n.wk b{display:block;font-size:13px;margin-bottom:2px}\n@media (max-width:520px){.weeks{grid-template-columns:1fr}}\n\n.log{margin-top:12px;border-top:1px solid var(--line);padding-top:10px}\n.log h5{margin:0 0 6px;font-size:12px;letter-spacing:.3px;text-transform:uppercase;color:var(--dc);font-weight:600}\n.logsum{font-size:12.5px;line-height:1.45;color:#3a3f4e;margin-bottom:6px}\n.sug{background:var(--soft);border-radius:10px;padding:7px 10px;font-size:12.5px;line-height:1.45;margin-bottom:8px}\n.inrow{display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end}\n.inrow label{display:flex;flex-direction:column;font-size:10.5px;color:var(--muted);gap:2px}\n.inrow input{width:52px;font:inherit;font-size:16px;padding:6px 4px;border:1px solid var(--line);border-radius:8px;text-align:center;background:#fff;color:var(--ink)}\n.inrow input.kg{width:66px}\nbutton.save{background:var(--dc);color:#fff;border:0;border-radius:999px;padding:9px 14px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;margin-left:auto}\n.msg{font-size:12px;color:var(--muted);min-height:16px;margin-top:4px}\ndetails.hist{margin-top:6px;font-size:12.5px}\ndetails.hist summary{cursor:pointer;color:var(--muted)}\n.hrow{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0ece5}\n.hrow button{border:0;background:none;color:#b0aaa0;cursor:pointer;font-size:13px}\n.spark{display:block;margin:6px 0 2px}\n.status{font-size:12px;color:var(--muted);text-align:center;margin:0 0 8px}\n\nnav.tabs{grid-template-columns:repeat(5,1fr)!important}\n.tab{position:relative}\n.tab i.next{position:absolute;top:-6px;right:-4px;font-style:normal;font-size:9.5px;font-weight:600;background:#e0663a;color:#fff;border-radius:999px;padding:1px 6px;box-shadow:0 1px 4px rgba(0,0,0,.15)}\n.nextbar{background:#fff;border:1px solid var(--line);border-radius:14px;padding:9px 12px;font-size:13px;margin:0 0 10px;line-height:1.45}\n.nextbar button{font:inherit;font-size:12.5px;border:0;background:var(--dc);color:#fff;border-radius:999px;padding:5px 11px;margin-left:6px;cursor:pointer}\n.tab{padding:8px 3px!important}\n.dayhead .phtip{font-size:12.5px;margin-top:8px;opacity:.9}\n.dayhead .phtip:empty{display:none}\n.sr small{font-weight:400;opacity:.75}\nbutton.tbtn{font:inherit;font-size:12.5px;border:0;border-radius:8px;padding:3px 9px;background:#f0eee9;color:var(--ink);cursor:pointer}\ntextarea{width:100%;font:inherit;font-size:16px;border:1px solid var(--line);border-radius:10px;padding:8px;resize:vertical;margin:6px 0;background:#fff;color:var(--ink)}\nbutton.save.ghost{background:#fff;color:var(--ink);border:1px solid var(--line)}\n.small{font-size:12px;color:var(--muted);margin:6px 0;display:block}\n#timer{position:fixed;left:50%;bottom:14px;transform:translate(-50%,140%);width:min(92vw,420px);background:#273046;color:#fff;border-radius:18px;padding:10px 14px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 30px rgba(0,0,0,.25);transition:transform .3s,visibility .3s;z-index:20;visibility:hidden}\n#timer.on{transform:translate(-50%,0);visibility:visible}\n#timer .tc{flex:1;min-width:0}\n#timer .tl{font-size:11.5px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#timer .tt{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}\n#timer .tb{height:4px;background:rgba(255,255,255,.2);border-radius:4px;overflow:hidden;margin-top:4px}\n#timer .tb i{display:block;height:100%;background:#e0663a;width:0}\n#timer button{font:inherit;font-size:13px;border:0;border-radius:999px;padding:7px 11px;background:rgba(255,255,255,.15);color:#fff;cursor:pointer}\n.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px;margin:4px 0 10px}\n.stats div{background:#f6f3ee;border-radius:12px;padding:8px 10px}\n.stats b{display:block;font-size:18px}\n.stats span{font-size:11.5px;color:var(--muted);line-height:1.3;display:block}\n.cal .crow{display:grid;grid-template-columns:52px repeat(7,1fr) 22px;gap:4px;align-items:center;margin-bottom:4px}\n.cal .crow span{font-size:11px;color:var(--muted)}\n.cal .crow i{display:block;height:20px;border-radius:6px;background:#efebe4}\n.cal .crow i.we{background:transparent;border:1px dashed #ebe6dd}\n.cal .crow i.today{outline:2px solid #273046;outline-offset:1px}\n.cal .crow b{font-size:12px;text-align:right}\n.cal .crow.hd i{background:none;height:auto;font-style:normal;font-size:11px;color:var(--muted);text-align:center}\n.phbar{display:grid;grid-template-columns:repeat(9,1fr);gap:4px;margin:10px 0 2px}\n.phbar i{font-style:normal;font-size:11px;text-align:center;border-radius:6px;padding:4px 0;background:#efebe4;color:var(--muted)}\n.phbar i.p{background:#cfd5e3;color:#273046}\n.phbar i.c{background:#273046;color:#fff}\n.pday{margin-top:10px}\n.pdh{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.3px;color:var(--dc);margin-bottom:2px}\n.prow{display:flex;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid #f0ece5}\n.prow>div:first-child{flex:1;min-width:0}\n.prow b{font-size:13px;font-weight:600;display:block}\n.prow .small{margin:2px 0 0}\n.psp{width:90px;flex:none}\n.up{color:#3d8a55;font-weight:600}\n.notes{margin-top:4px}\n.foot{color:var(--muted);font-size:12px;text-align:center;margin-top:20px;line-height:1.5}\n\n.setrow{display:flex;gap:6px;align-items:flex-end;margin-bottom:6px}\n.setrow .sl{font-size:12px;font-weight:600;color:var(--dc);width:22px;padding-bottom:9px}\n.setrow label{display:flex;flex-direction:column;font-size:10.5px;color:var(--muted);gap:2px}\n.setrow input{width:62px;font:inherit;font-size:16px;padding:6px 4px;border:1px solid var(--line);border-radius:8px;text-align:center;background:#fff;color:var(--ink)}\n.setrow input.rp{width:54px}\n.setrow select{font:inherit;font-size:15px;padding:6px 4px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);min-width:54px}\n.aux{font-size:12.5px;line-height:1.45;margin:2px 0 8px}\n.aux>div:empty{display:none}\n.aux>div{background:#f6f3ee;border-radius:10px;padding:6px 10px;margin-top:6px}\n.muted{color:var(--muted)}\n.ghostbtn{font:inherit;font-size:12.5px;border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 12px;cursor:pointer;color:var(--ink)}\n.rirhelp{font-size:11px;color:var(--muted);margin:6px 0 0}\n.stall{background:#fff1e6;border:1px solid #f6d3b8;border-radius:10px;padding:7px 10px;margin:-2px -4px 8px;color:#7a3b12}\n.altnote{font-size:12px;color:var(--dc);margin:-2px 0 6px;font-weight:500}\n.swapbox{background:#f6f3ee;border-radius:12px;padding:8px 10px;margin-bottom:8px}\n.swapopts{display:flex;flex-wrap:wrap;gap:6px}\n.swapopts button{font:inherit;font-size:12.5px;border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 10px;cursor:pointer;color:var(--ink);text-align:left}\n.swapopts button.on{background:var(--dc);color:#fff;border-color:var(--dc)}\nsup{font-size:9px;color:var(--muted);margin-left:1px}\n.prow{cursor:pointer}\n.chev{color:var(--muted);font-size:18px;padding-left:2px}\n.wkbanner{position:relative;background:linear-gradient(120deg,#fff,#fbf3ec)}\n.wkx{position:absolute;top:10px;right:10px;border:0;background:#f0ece5;border-radius:50%;width:26px;height:26px;cursor:pointer;color:var(--muted)}\n#chartov{position:fixed;inset:0;z-index:40;background:rgba(31,36,51,.45);display:none;align-items:flex-end;justify-content:center}\n#chartov.on{display:flex}\n.ovbox{background:#fff;width:min(100%,560px);max-height:88vh;overflow:auto;border-radius:22px 22px 0 0;padding:16px 16px 28px}\n@media (min-width:600px){#chartov{align-items:center}.ovbox{border-radius:22px}}\n.ovhead{display:flex;align-items:center;gap:8px;margin-bottom:8px}\n.ovhead h3{flex:1;margin:0;font-size:17px}\n.ovx{border:0;background:#f0ece5;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:14px}\n.lchart{display:block;margin:8px 0 2px}\n.lchart .ax{font-size:9px;fill:#8a8f9c}\n.legend{display:flex;gap:12px;flex-wrap:wrap;font-size:11.5px;color:var(--muted);margin-bottom:8px}\n.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}\n.htable{margin-top:6px;font-size:12.5px}\n\n.setrow:not(:first-child) label{font-size:0;gap:0}\n.setrow:not(:first-child) .sl{padding-bottom:9px}\n\n.wbtn{display:block;margin:10px 0 4px;background:var(--dc);color:#fff;border:0;border-radius:999px;padding:10px 16px;font:inherit;font-size:14px;font-weight:600;cursor:pointer}\n.whint{display:block;font-size:11.5px;color:var(--muted)}\n#timer .tl{white-space:normal!important;line-height:1.3}\n";
const MARKUP = "<div class=\"wrap\">\n  <header class=\"hero\">\n    <h1>Mi plan de gimnasio</h1>\n    <p>4 entrenos \u00b7 1 hora \u00b7 Ganar m\u00fasculo con foco en espalda, postura y core (seg\u00fan la valoraci\u00f3n del entrenador). Haz el 1, 2, 3 y 4 en orden, el d\u00eda que te vaya bien: la app te marca el que te toca.</p>\n    <div class=\"pills\">\n      <span class=\"pill\">4 d\u00edas por semana</span><span class=\"pill\">10 min de movilidad</span><span class=\"pill\">Espalda 3:1 sobre pecho</span><span class=\"pill\">Cardio o HIIT al final</span>\n    </div>\n  </header>\n\n  <nav class=\"tabs\" id=\"tabs\"></nav>\n  \n  <main id=\"day\"></main>\n\n  <section class=\"guide\">\n    <h2>C\u00f3mo usar el plan</h2>\n    <div class=\"gcard\">\n      <h4>Registro de pesos</h4>\n      En cada ejercicio apunta, <b>serie a serie</b>, el peso, las reps y el <b>RIR</b> (las reps que te quedaban en rec\u00e1mara) y pulsa Guardar. Con el RIR la recomendaci\u00f3n es m\u00e1s precisa, y si un ejercicio se estanca 3 sesiones te avisa con soluciones. La pr\u00f3xima vez ver\u00e1s lo que hiciste y una recomendaci\u00f3n: <b>subir peso</b> solo cuando llegues al m\u00e1ximo de reps en todas las series, <b>mantener</b> y sumar reps si a\u00fan no, o <b>bajar un poco</b> si no llegas al m\u00ednimo. As\u00ed progresas sin pasarte.\n    </div>\n    <div class=\"gcard\">\n      <h4>C\u00f3mo elegir el peso: las \u00abreps en rec\u00e1mara\u00bb</h4>\n      Si pone <b>8\u201312</b>, elige un peso con el que acabes la serie sintiendo que podr\u00edas hacer <b>1\u20133 repeticiones m\u00e1s</b> con buena t\u00e9cnica. Si llegas a 12 en todas las series, sube un poco el peso la semana siguiente y vuelve a empezar desde 8. As\u00ed vas progresando sin estancarte.\n    </div>\n    <div class=\"gcard\">\n      <h4>Las primeras semanas (vuelves tras a\u00f1os parado)</h4>\n      <div class=\"weeks\">\n        <div class=\"wk\"><b>Semanas 1\u20132</b>Readaptaci\u00f3n: haz 1 serie menos por ejercicio y deja 3\u20134 reps en rec\u00e1mara. C\u00e9ntrate en la t\u00e9cnica. Las agujetas fuertes son normales al principio.</div>\n        <div class=\"wk\"><b>Semanas 3\u20138</b>El plan completo. Intenta subir reps o peso cada semana en los ejercicios principales y ap\u00fantalo en el m\u00f3vil.</div>\n        <div class=\"wk\"><b>Semana 9</b>Descarga: mismos ejercicios con la mitad de series. Luego repite el ciclo y cambia alguna variante si quieres.</div>\n      </div>\n    </div>\n    <div class=\"gcard\">\n      <h4>Para ganar m\u00fasculo</h4>\n      <ul>\n        <li><b>Prote\u00edna:</b> unos 1,6\u20132,2 g por kg de peso al d\u00eda (carne, pescado, huevos, l\u00e1cteos, legumbres).</li>\n        <li><b>Calor\u00edas:</b> unas 2400\u20132600 kcal al d\u00eda y 130\u2013150 g de prote\u00edna. P\u00e9sate una vez por semana: si en un mes no subes nada, come un poco m\u00e1s; si subes m\u00e1s de medio kilo por semana, un poco menos.</li>\n        <li><b>Sue\u00f1o:</b> 7\u20139 horas. El m\u00fasculo se construye descansando.</li>\n        <li><b>Pasos:</b> 8.000\u201310.000 al d\u00eda ayudan mucho a quemar grasa sin cansar las piernas.</li>\n      </ul>\n    </div>\n    <div class=\"gcard\">\n      <h4>Si vas con prisa o te sobra tiempo</h4>\n      <ul>\n        <li><b>Con prisa:</b> haz la movilidad, los ejercicios marcados como <b>Foco</b> y el HIIT de 5 min. Son los m\u00e1s importantes.</li>\n        <li><b>Orden:</b> si un d\u00eda no puedes ir, no pasa nada: el siguiente d\u00eda haces el entreno que te tocaba. Deja al menos un d\u00eda entre los dos de pierna si puedes.</li>\n        <li><b>M\u00e1quina ocupada:</b> cambia la barra por mancuernas o por la m\u00e1quina equivalente; el m\u00fasculo trabajado es el mismo.</li>\n      </ul>\n    </div>\n    <p class=\"foot\">Si notas dolor en una articulaci\u00f3n (no cansancio muscular), para ese ejercicio y pide a un monitor que revise tu t\u00e9cnica.</p>\n  </section>\n</div>\n\n<div id=\"chartov\"></div>\n<div id=\"timer\"><div class=\"tc\"><div class=\"tl\">Descanso</div><div class=\"tt\">0:00</div><div class=\"tb\"><i></i></div></div><button id=\"tskip\" hidden>Saltar \u203a</button><button id=\"tplus\">+15 s</button><button id=\"tstop\">\u2715</button></div>\n";

export function mountPau(host: HTMLElement, store: CoreStore, hooks: { onEvent?: (text: string) => void } = {}): () => void {
const R = host.shadowRoot || host.attachShadow({ mode: 'open' });
R.innerHTML = '<style>' + CSS + '</style>' + MARKUP;
let alive = true;
// ---------- Static equipment helpers ----------
const flatBench = [['rect',48,118,92,6,3],['line',58,124,58,150,4],['line',130,124,130,150,4]];
const floorMat = [['rect',20,148,170,3,1,'#e2d6c3']];

// ---------- Plan data ----------
// Plan anterior (5 días). Se conserva para su historial y para reutilizar dibujos.
const OLD=[
{ k:'L', name:'Lunes', title:'Empuje', sub:'Pecho, hombros y tríceps + core', color:'#e0663a', soft:'#fbe2d6', time:'~60 min',
  ex:[
  {name:'Press de banca con barra', sets:'4', reps:'6–10', rest:'2 min', mus:'Pecho, hombro frontal, tríceps',
   tips:['Omóplatos juntos y hacia abajo, pies firmes en el suelo.','Baja la barra controlada hasta la parte baja del pecho.','Codos a unos 45° del cuerpo, no abiertos del todo.'],
   draw:{A:{hip:[122,112],t:180,hn:[84,72],ed:90,fn:[152,148],kd:-60},
         B:{hip:[122,112],t:180,hn:[92,102],ed:90,fn:[152,148],kd:-60},
         back:[...flatBench,['line',70,150,70,64,4],['line',64,70,74,70,3]], front:[['plate','hn',14]]}},
  {name:'Press inclinado con mancuernas', sets:'3', reps:'8–12', rest:'90 s', mus:'Pecho superior, hombro frontal',
   tips:['Banco a 30–45°.','Baja las mancuernas a los lados del pecho, estirando bien.','Sube juntándolas ligeramente arriba sin chocarlas.'],
   draw:{A:{hip:[112,118],t:-135,hn:[110,64],ed:0,fn:[142,148],kd:-60},
         B:{hip:[112,118],t:-135,hn:[93,82],ed:135,fn:[142,148],kd:-60},
         back:[['line',118,124,76,82,6],['rect',100,123,40,5,2],['line',112,128,112,150,4],['line',84,100,84,150,3]], front:[['dbs','hn']]}},
  {name:'Press militar con mancuernas (sentado)', sets:'3', reps:'8–12', rest:'90 s', mus:'Hombros, tríceps',
   tips:['Espalda bien apoyada en el respaldo.','Empieza con las mancuernas a la altura de las orejas.','Empuja hacia arriba sin bloquear de golpe los codos.'],
   draw:{A:{hip:[100,118],t:-90,hn:[106,72],ed:110,fn:[132,148],kd:-45},
         B:{hip:[100,118],t:-90,hn:[101,37],ed:180,fn:[132,148],kd:-45},
         back:[['line',92,124,92,66,6],['rect',84,122,44,5,2],['line',104,127,104,150,4]], front:[['dbs','hn']]}},
  {name:'Aperturas en polea (cruce de poleas)', sets:'3', reps:'12–15', rest:'60 s', mus:'Pecho',
   tips:['Un paso adelante y el pecho alto.','Codos ligeramente doblados todo el rato.','Junta las manos delante como si abrazaras un árbol.'],
   draw:{A:{front:true,hip:[100,91],hn:[146,52],ed:-90,fn:[110,148]},
         B:{front:true,hip:[100,91],hn:[106,94],ed:-60,fn:[110,148]},
         back:[['line',190,10,190,150,4],['line',10,10,10,150,4]],
         front:[['cable',[186,14],'hn'],['cable',[14,14],'hf'],['handle','hn'],['handle','hf']]}},
  {name:'Elevaciones laterales con mancuernas', sets:'3', reps:'12–15', rest:'60 s', mus:'Hombro lateral',
   tips:['Peso ligero: aquí manda la técnica.','Sube los brazos hacia los lados hasta la altura del hombro.','Codos un pelín doblados, baja despacio.'],
   draw:{A:{front:true,hip:[100,91],hn:[118,96],ed:0,fn:[110,148]},
         B:{front:true,hip:[100,91],hn:[152,58],ed:-90,fn:[110,148]},
         front:[['dbs','hn'],['dbs','hf']]}},
  {name:'Extensión de tríceps en polea con cuerda', sets:'3', reps:'10–15', rest:'60 s', mus:'Tríceps',
   tips:['Codos pegados al cuerpo, no se mueven.','Estira del todo y separa un poco la cuerda abajo.','Sube controlando hasta la altura del pecho.'],
   draw:{A:{hip:[98,91],t:-82,hn:[118,62],ed:90,fn:[100,148],ff:[90,148]},
         B:{hip:[98,91],t:-82,hn:[112,98],ed:150,fn:[100,148],ff:[90,148]},
         back:[['line',156,8,156,150,4]], front:[['cable',[152,12],'hn'],['handle','hn']]}},
  {name:'Plancha abdominal', tag:'Core', sets:'3', reps:'30–45 s', rest:'45 s', mus:'Abdomen, zona media',
   tips:['Cuerpo en línea recta de cabeza a talones.','Aprieta glúteos y abdomen, sin hundir la cadera.','Respira normal, no aguantes el aire.'],
   draw:{A:{hip:[106,129],t:184,hn:[42,148],ed:90,fn:[158,148],kd:-90,ftn:100},
         B:{hip:[106,127],t:183,hn:[42,148],ed:90,fn:[158,148],kd:-90,ftn:100},
         back:floorMat}}
  ]},
{ k:'M', name:'Martes', title:'Tirón', sub:'Espalda y bíceps + cardio', color:'#3f7ea6', soft:'#dcebf4', time:'~60 min',
  ex:[
  {name:'Jalón al pecho en polea', sets:'4', reps:'8–12', rest:'90 s', mus:'Dorsales, bíceps',
   tips:['Agarre algo más ancho que los hombros.','Lleva la barra a la parte alta del pecho sacando pecho.','Piensa en bajar los codos, no en tirar con las manos.'],
   draw:{A:{hip:[100,118],t:-98,hn:[106,24],ed:0,fn:[130,148],kd:-45},
         B:{hip:[100,118],t:-106,hn:[102,72],ed:120,fn:[130,148],kd:-45},
         back:[['line',100,4,156,4,4],['line',156,4,156,150,4],['rect',82,122,40,5,2],['line',100,127,100,150,4],['rect',116,104,18,6,3,'var(--equip-dark)']],
         front:[['cable',[100,6],'hn'],['seg',['hn',-12,0],['hn',12,0],3,'var(--equip-dark)']]}},
  {name:'Remo con barra', sets:'3', reps:'6–10', rest:'2 min', mus:'Espalda media, dorsales, bíceps',
   tips:['Inclínate con la espalda recta y rodillas un poco flexionadas.','Tira de la barra hacia el ombligo.','Junta los omóplatos arriba y baja controlando.'],
   draw:{A:{hip:[92,90],t:-28,hn:'hang',fn:[104,148]},
         B:{hip:[92,90],t:-28,hn:[110,98],ed:-135,fn:[104,148]},
         front:[['plate','hn',13]]}},
  {name:'Remo sentado en polea', sets:'3', reps:'10–12', rest:'90 s', mus:'Espalda media, dorsales',
   tips:['Pies en la plataforma, rodillas algo dobladas.','Tira del agarre hacia el abdomen con el pecho alto.','Estira los brazos delante sin encorvar la espalda.'],
   draw:{A:{hip:[86,130],t:-70,hn:[138,98],ed:90,fn:[146,132],kd:-90},
         B:{hip:[86,130],t:-96,hn:[100,100],ed:180,fn:[146,132],kd:-90},
         back:[['rect',56,134,58,6,3],['line',85,140,85,150,4],['line',154,116,154,150,5],['line',190,110,190,150,4]],
         front:[['cable',[188,118],'hn'],['handle','hn']]}},
  {name:'Face pull en polea', sets:'3', reps:'12–15', rest:'60 s', mus:'Hombro posterior, espalda alta',
   tips:['Polea a la altura de la cara, con cuerda.','Tira hacia la frente abriendo los codos hacia fuera.','Aguanta 1 segundo atrás. Ideal para la postura.'],
   draw:{A:{hip:[98,91],t:-94,hn:[138,50],ed:90,fn:[102,148],ff:[88,148]},
         B:{hip:[98,91],t:-94,hn:[104,42],ed:-150,fn:[102,148],ff:[88,148]},
         back:[['line',194,8,194,150,4]], front:[['cable',[190,46],'hn'],['handle','hn']]}},
  {name:'Curl de bíceps con barra', sets:'3', reps:'8–12', rest:'60 s', mus:'Bíceps',
   tips:['Codos quietos, pegados a los costados.','Sube sin balancear el cuerpo.','Baja lento (2–3 segundos).'],
   draw:{A:{hip:[98,91],t:-90,hn:[102,96],ed:180,fn:[100,148]},
         B:{hip:[98,91],t:-90,hn:[108,58],ed:180,fn:[100,148]},
         front:[['plate','hn',11]]}},
  {name:'Curl martillo con mancuernas', sets:'3', reps:'10–12', rest:'60 s', mus:'Bíceps, antebrazo',
   tips:['Palmas mirándose entre sí todo el recorrido.','Puedes alternar brazos.','Sin balanceo: si te balanceas, baja el peso.'],
   draw:{A:{hip:[98,91],t:-90,hn:[102,96],ed:180,fn:[100,148]},
         B:{hip:[98,91],t:-90,hn:[108,58],ed:180,fn:[100,148]},
         front:[['db','hn']]}},
  {name:'Cinta inclinada caminando', tag:'Cardio', sets:'1', reps:'10 min', rest:'—', mus:'Cardio, quema de grasa',
   tips:['Inclinación 8–12 %, velocidad 5–6 km/h.','Sin agarrarte a la barandilla.','Ritmo en el que puedas hablar pero cueste un poco.'],
   draw:{A:{hip:[100,92],t:-87,hn:[114,92],hf:[86,90],fn:[118,144.6],ff:[82,148.5]},
         B:{hip:[100,92],t:-87,hn:[86,90],hf:[114,92],fn:[82,148.5],ff:[118,144.6]},
         noGround:true,
         back:[['line',40,153,164,139,6,'var(--equip-dark)'],['line',164,139,170,78,4],['line',170,80,148,82,4],['line',44,153,40,158,3]]}}
  ]},
{ k:'X', name:'Miércoles', title:'Pierna', sub:'Cuádriceps, femoral, glúteo y gemelo + core', color:'#5b9a6b', soft:'#dff0e2', time:'~60 min',
  ex:[
  {name:'Sentadilla con barra', sets:'4', reps:'6–10', rest:'2 min', mus:'Cuádriceps, glúteos',
   tips:['Barra sobre los trapecios, pies al ancho de hombros.','Baja como si te sentaras en una silla, pecho alto.','Rodillas en la dirección de las puntas de los pies.'],
   draw:{A:{hip:[98,91],t:-90,hn:{tl:[2,8]},ed:90,fn:[104,148]},
         B:{hip:[80,120],t:-55,hn:{tl:[2,8]},ed:90,fn:[104,148]},
         front:[['fn',(fr,acc)=>{const c=add(add(fr.sh,mul(fr.back,9)),mul(fr.d,-3)); return circ(c,14,acc,'opacity=".9"')+circ(c,6,'#fff','opacity=".5"')+circ(c,2.2,'var(--equip-dark)')}]]}},
  {name:'Peso muerto rumano', sets:'3', reps:'8–10', rest:'2 min', mus:'Femorales, glúteos, lumbar',
   tips:['Rodillas casi estiradas (ligera flexión).','Lleva la cadera hacia atrás con la espalda recta.','Baja hasta notar tirantez detrás del muslo y sube apretando glúteos.'],
   draw:{A:{hip:[98,91],t:-90,hn:'hang',fn:[102,148]},
         B:{hip:[82,94],t:-14,hn:'hang',fn:[100,148]},
         front:[['plate','hn',13]]}},
  {name:'Prensa de piernas', sets:'3', reps:'10–12', rest:'90 s', mus:'Cuádriceps, glúteos',
   tips:['Espalda y cadera pegadas al respaldo.','Baja hasta que las rodillas formen unos 90°.','No bloquees las rodillas arriba.'],
   draw:{A:{hip:[84,124],t:-150,hn:[90,130],ed:90,fn:[114,99],kd:-120,ftn:-40},
         B:{hip:[84,124],t:-150,hn:[90,130],ed:90,fn:[125,89],kd:-120,ftn:-40},
         back:[['line',90,131,42,104,7],['line',80,132,104,132,6],['line',92,135,92,150,4],['line',100,135,178,69,3]],
         front:[['platform','fn',50,32,5]]}},
  {name:'Curl femoral en máquina', sets:'3', reps:'10–15', rest:'60 s', mus:'Femorales',
   tips:['Tumbado boca abajo, rodilla justo al borde del banco.','Lleva el rodillo hacia el glúteo.','Baja lento sin dejar caer el peso.'],
   draw:{A:{hip:[110,110],t:180,hn:[48,124],ed:90,fn:[166,112],kd:90,ftn:90},
         B:{hip:[110,110],t:180,hn:[48,124],ed:90,fn:[130,82],kd:90,ftn:-20},
         back:[['rect',40,116,98,6,3],['line',60,122,60,150,4],['line',126,122,126,150,4],['line',46,124,46,150,3]],
         front:[['pad','fn',5.5]]}},
  {name:'Extensión de cuádriceps', sets:'2', reps:'12–15', rest:'60 s', mus:'Cuádriceps',
   tips:['Rodilla alineada con el eje de la máquina.','Estira del todo y aguanta 1 segundo arriba.','Baja controlando.'],
   draw:{A:{hip:[92,112],t:-98,hn:[100,118],ed:180,fn:[121,140],kd:-45,ftn:-10},
         B:{hip:[92,112],t:-98,hn:[100,118],ed:180,fn:[148,106],kd:-45,ftn:-60},
         back:[['line',80,118,74,70,6],['rect',76,116,46,6,3],['line',92,122,92,150,4]],
         front:[['pad','fn',5.5]]}},
  {name:'Elevación de gemelos de pie', sets:'3', reps:'12–15', rest:'60 s', mus:'Gemelos',
   tips:['Puntas en un escalón, talones fuera.','Baja el talón para estirar y sube todo lo que puedas.','Pausa de 1 segundo arriba.'],
   draw:{A:{hip:[100,89],t:-90,hn:'hang',fn:[102,144],ftn:-15},
         B:{hip:[100,81],t:-90,hn:'hang',fn:[102,136],ftn:35},
         back:[['rect',104,142,40,8,2]], front:[['db','hn']]}},
  {name:'Elevación de piernas colgado', tag:'Core', sets:'3', reps:'10–15', rest:'60 s', mus:'Abdomen inferior',
   tips:['Cuélgate de la barra sin balancearte.','Sube las piernas hasta 90° (dobladas si cuesta).','Baja despacio. Alternativa: en la silla romana.'],
   draw:{A:{hip:[100,91],t:-90,hn:[102,12],hf:[98,12],fn:[102,150]},
         B:{hip:[100,91],t:-90,hn:[102,12],hf:[98,12],fn:[154,90],kd:-90},
         noGround:true, back:[['line',40,10,160,10,4,'var(--equip-dark)']]}}
  ]},
{ k:'J', name:'Jueves', title:'Torso', sub:'Pecho y espalda (variantes) + cardio', color:'#8a63b5', soft:'#ece2f6', time:'~60 min',
  ex:[
  {name:'Dominadas (o asistidas)', sets:'4', reps:'6–10', rest:'2 min', mus:'Dorsales, bíceps',
   tips:['Si no salen, usa la máquina asistida o una goma.','Sube hasta pasar la barbilla de la barra.','Baja del todo, controlando.'],
   draw:{A:{hip:[100,97],t:-90,hn:[106,13],ed:30,fn:[96,150],kd:0},
         B:{hip:[100,71],t:-90,hn:[106,13],ed:30,fn:[96,124],kd:0},
         noGround:true, back:[['line',40,10,160,10,4,'var(--equip-dark)']]}},
  {name:'Press plano con mancuernas', sets:'3', reps:'8–12', rest:'90 s', mus:'Pecho, tríceps',
   tips:['Mancuernas a la altura del pecho al bajar.','Omóplatos apretados contra el banco.','Sube en línea recta, sin perder el control.'],
   draw:{A:{hip:[122,112],t:180,hn:[84,72],ed:90,fn:[152,148],kd:-60},
         B:{hip:[122,112],t:180,hn:[90,104],ed:90,fn:[152,148],kd:-60},
         back:[...flatBench], front:[['dbs','hn']]}},
  {name:'Remo con mancuerna a una mano', sets:'3', reps:'8–12 por brazo', rest:'60 s', mus:'Dorsales, espalda media',
   tips:['Rodilla y mano del mismo lado apoyadas en el banco.','Espalda plana, paralela al suelo.','Lleva la mancuerna hacia la cadera, no hacia el hombro.'],
   draw:{A:{hip:[78,96],t:-8,hn:'hang',hf:[122,118],edf:180,fn:[72,148],ff:[40,116],kdf:90},
         B:{hip:[78,96],t:-8,hn:[100,100],ed:-110,hf:[122,118],edf:180,fn:[72,148],ff:[40,116],kdf:90},
         back:[['rect',36,118,96,6,3],['line',46,124,46,150,4],['line',124,124,124,150,4]], front:[['db','hn']]}},
  {name:'Fondos en paralelas', sets:'3', reps:'8–12', rest:'90 s', mus:'Pecho inferior, tríceps',
   tips:['Inclínate un poco hacia delante para dar más trabajo al pecho.','Baja hasta que los codos lleguen a 90°.','Si cuesta, usa la máquina de fondos asistidos.'],
   draw:{A:{hip:[96,84],t:-80,hn:[106,84],ed:180,fn:[80,112],kd:0},
         B:{hip:[92,104],t:-70,hn:[106,84],ed:180,fn:[76,134],kd:0},
         back:[['line',84,86,150,86,4,'var(--equip-dark)'],['line',140,86,140,150,4],['line',92,86,92,150,4]]}},
  {name:'Pájaros (hombro posterior)', sets:'3', reps:'12–15', rest:'60 s', mus:'Hombro posterior, espalda alta',
   tips:['Inclinado hacia delante con la espalda recta.','Abre los brazos hacia los lados como unas alas.','Peso ligero y movimiento controlado.'],
   draw:{A:{hip:[90,92],t:-18,hn:'hang',ed:180,fn:[100,148]},
         B:{hip:[90,92],t:-18,hn:[116,72],ed:-90,fn:[100,148]},
         front:[['dbs','hn']]}},
  {name:'Bici: intervalos', tag:'Cardio', sets:'1', reps:'12 min', rest:'—', mus:'Cardio, quema de grasa',
   tips:['30 s fuerte + 60 s suave, repetido 8 veces.','Calienta 2 min suave antes.','Sillín a la altura de la cadera.'],
   draw:{f:p=>{const a=p*360, c=[110,128], r=12;
         return {hip:[88,94],t:-68,hn:[130,72],hf:[128,73],ed:90,
           fn:[c[0]+r*Math.cos(rad(a)),c[1]+r*Math.sin(rad(a))], ff:[c[0]+r*Math.cos(rad(a+180)),c[1]+r*Math.sin(rad(a+180))],kd:-30,kdf:-30}},
         back:[['line',88,98,110,128,5],['line',78,96,98,96,6,'var(--equip-dark)'],['line',110,128,128,76,5],['line',124,74,136,72,5,'var(--equip-dark)'],['ring',146,126,15,5],['line',110,128,146,126,4],['ring',110,128,12,1.5]], dur:1.6}}
  ]},
{ k:'V', name:'Viernes', title:'Hombros, brazos y pierna', short:'Hombro', sub:'Día que puedes alargar con cardio extra', color:'#c58a1f', soft:'#f7ebd2', time:'~60 min (+20 opcional)',
  ex:[
  {name:'Press militar con barra de pie', sets:'4', reps:'6–10', rest:'2 min', mus:'Hombros, tríceps',
   tips:['Aprieta glúteos y abdomen para no arquear la espalda.','La barra sube rozando la cara.','Arriba, mete la cabeza "dentro" de los brazos.'],
   draw:{A:{hip:[96,91],t:-90,hn:[113,58],ed:90,fn:[100,148]},
         B:{hip:[96,91],t:-90,hn:[100,14],ed:90,fn:[100,148]},
         front:[['plate','hn',12]]}},
  {name:'Zancadas con mancuernas', sets:'3', reps:'10 por pierna', rest:'90 s', mus:'Cuádriceps, glúteos',
   tips:['Paso largo hacia delante, tronco recto.','Baja hasta que la rodilla de atrás casi toque el suelo.','Empuja con el talón de delante para volver.'],
   draw:{A:{hip:[94,91],t:-90,hn:'hang',fn:[98,148],ff:[92,148]},
         B:{hip:[88,118],t:-88,hn:'hang',fn:[122,148],ff:[60,146],kdf:90,ftf:60},
         front:[['db','hn']]}},
  {name:'Hip thrust con barra', sets:'3', reps:'8–12', rest:'90 s', mus:'Glúteos',
   tips:['Parte alta de la espalda apoyada en el banco.','Sube la cadera hasta quedar recto de rodillas a hombros.','Aprieta glúteos 1 segundo arriba. Usa una almohadilla en la barra.'],
   draw:{A:{hip:[108,138],t:-142,hn:{hip:[0,-12]},ed:90,fn:[138,148],kd:-90},
         B:{hip:[112,112],t:178,hn:{hip:[0,-12]},ed:90,fn:[138,148],kd:-90},
         back:[['rect',36,116,44,7,3],['line',44,123,44,150,4],['line',72,123,72,150,4]], front:[['plate',['hip',0,-10],13]]}},
  {name:'Elevación lateral en polea', sets:'3', reps:'12–15 por brazo', rest:'60 s', mus:'Hombro lateral',
   tips:['Polea baja, agarra con la mano del lado contrario.','Sube el brazo hacia el lado hasta el hombro.','Movimiento lento; la polea mantiene la tensión.'],
   draw:{A:{front:true,hip:[100,91],hn:[100,100],ed:0,hf:[62,96],edf:180,fn:[110,148]},
         B:{front:true,hip:[100,91],hn:[152,58],ed:-90,hf:[62,96],edf:180,fn:[110,148]},
         back:[['line',18,30,18,150,4]], front:[['cable',[22,140],'hn'],['handle','hn']]}},
  {name:'Curl inclinado con mancuernas', tag:'Superserie 5a', sets:'3', reps:'10–12', rest:'sin descanso → 5b', mus:'Bíceps',
   tips:['Banco a 45–60°, brazos colgando por detrás del cuerpo.','Sube sin adelantar los codos.','Encadena con el ejercicio 5b y luego descansa 90 s.'],
   draw:{A:{hip:[112,118],t:-125,hn:[86,125],ed:180,fn:[142,148],kd:-60},
         B:{hip:[112,118],t:-125,hn:[100,92],ed:150,fn:[142,148],kd:-60},
         back:[['line',118,124,82,82,6],['rect',100,123,40,5,2],['line',112,128,112,150,4]], front:[['dbs','hn']]}},
  {name:'Press francés con barra Z', tag:'Superserie 5b', sets:'3', reps:'10–12', rest:'90 s', mus:'Tríceps',
   tips:['Tumbado, brazos verticales apuntando al techo.','Dobla solo los codos y baja la barra hacia la frente.','Estira sin mover la parte de arriba de los brazos.'],
   draw:{A:{hip:[122,112],t:180,hn:[82,72],ed:-60,fn:[152,148],kd:-60},
         B:{hip:[122,112],t:180,hn:[66,96],ed:-60,fn:[152,148],kd:-60},
         back:[...flatBench], front:[['plate','hn',9]]}},
  {name:'Crunch en polea de rodillas', tag:'Core', sets:'3', reps:'12–15', rest:'60 s', mus:'Abdomen',
   tips:['De rodillas, cuerda junto a la cabeza.','Enrolla el tronco llevando los codos a los muslos.','La cadera no se mueve: trabaja el abdomen.'],
   draw:{A:{hip:[90,112],t:-80,hn:{tl:[10,-8]},ed:90,fn:[60,147],kd:60,ftn:180},
         B:{hip:[90,112],t:-22,hn:{tl:[10,-8]},ed:90,fn:[60,147],kd:60,ftn:180},
         back:[['line',156,4,156,150,4],...floorMat], front:[['cable',[152,10],'hn'],['handle','hn']]}},
  {name:'Elíptica (opcional)', tag:'Extra +15–20 min', sets:'1', reps:'15–20 min', rest:'—', mus:'Cardio, quema de grasa',
   tips:['Ritmo moderado y constante.','Empuja y tira de los brazos para implicar todo el cuerpo.','Perfecto para alargar el viernes.'],
   draw:{f:p=>{const a=p*360, cx=98, cy=138;
         return {hip:[96,90+2*Math.sin(rad(2*a))],t:-86,
           hn:[124+10*Math.cos(rad(a)),76],hf:[124+10*Math.cos(rad(a+180)),76],ed:90,
           fn:[cx+16*Math.cos(rad(a)),cy+4*Math.sin(rad(a))],ff:[cx+16*Math.cos(rad(a+180)),cy+4*Math.sin(rad(a+180))]}},
         back:[['line',60,150,166,150,6,'var(--equip-dark)'],['line',160,150,150,74,5],['line',150,74,124,74,3],['ring',98,140,5,2]], dur:2.2}}
  ]}
];


// ---------- Plan actual: 4 entrenos numerados (informe del entrenador, nov 2026) ----------
// Cada ejercicio guarda su historial en `log` (reutiliza la clave del plan anterior si es el mismo ejercicio).
const O=(k,i,over={})=>({...OLD.find(d=>d.k===k).ex[i],log:`${k}-${i}`,...over});
const CARDIO=(k,bike)=>({name:'Final: cardio suave o HIIT', tag:'Cardio', sets:'1', reps:'20 min · o 5–10 min HIIT', rest:'—', mus:'Corazón y quema de grasa sin restar músculo',
  tips:[bike?'Opción A: 20 min de bici a ritmo cómodo (puedes hablar pero cuesta un poco).':'Opción A: 20 min de cinta inclinada (8–12 %, 5–6 km/h) sin agarrarte.',
        'Opción B, si vas con prisa: HIIT de 5–10 min: 20 s a tope + 40 s suave, repetido.','Para ganar músculo no hace falta más: no lo alargues.'],
  draw:(bike?OLD.find(d=>d.k==='J').ex[5]:OLD.find(d=>d.k==='M').ex[6]).draw, log:`${k}-cardio`});
const DAYS=[
{ k:'E1', name:'Entreno 1', title:'Torso · espalda', short:'Torso', sub:'Foco en espalda y postura (hombros atrás) + core', color:'#3f7ea6', soft:'#dcebf4', time:'~60 min',
  ex:[
  O('M',0,{sets:'4', tag:'Foco espalda'}),
  {name:'Remo en máquina con apoyo de pecho', tag:'Foco espalda', sets:'4', reps:'8–12', rest:'90 s', mus:'Espalda media, dorsales, hombro posterior', log:'E1-1',
   tips:['Pecho bien pegado al apoyo: así la lumbar descansa.','Tira con los codos hacia atrás y junta los omóplatos.','Aguanta 1 s atrás y baja controlando.'],
   draw:{A:{hip:[84,118],t:-40,hn:'hang',ed:180,fn:[72,148],kd:0,ff:[66,148]},
         B:{hip:[84,118],t:-40,hn:[104,110],ed:-120,fn:[72,148],kd:0,ff:[66,148]},
         back:[['line',96,128,130,100,6],['line',112,116,112,150,4],['rect',68,121,34,5,2],['line',84,126,84,150,4]], front:[['db','hn']]}},
  O('M',2,{tag:'Foco espalda'}),
  O('M',3,{sets:'4', tips:['Polea a la altura de la cara, con cuerda.','Tira hacia la frente abriendo los codos y girando las manos hacia atrás.','Aguanta 1 s atrás. Es el mejor ejercicio para tus hombros adelantados.']}),
  O('L',1),
  O('L',4),
  {name:'Dead bug', tag:'Core', sets:'3', reps:'8–10 por lado', rest:'45 s', mus:'Abdomen profundo, control lumbar', type:'bw', nolastre:true, log:'E1-6',
   tips:['Boca arriba, brazos al techo y rodillas a 90°.','Estira a la vez un brazo y la pierna contraria, despacio.','La lumbar pegada al suelo todo el rato: si se despega, recorta el movimiento.'],
   draw:{A:{hip:[128,140],t:180,hn:[88,100],ed:0,hf:[86,100],edf:0,fn:[157,111],kd:-90,ftn:-10,ff:[155,111],kdf:-90,ftf:-10},
         B:{hip:[128,140],t:180,hn:[50,134],ed:0,hf:[86,100],edf:0,fn:[184,134],kd:-90,ftn:0,ff:[155,111],kdf:-90,ftf:-10},
         back:floorMat}},
  CARDIO('E1',false)
  ]},
{ k:'E2', name:'Entreno 2', title:'Pierna · cuádriceps', short:'Cuádriceps', sub:'Foco en cuádriceps, sin olvidar femoral, gemelo y core', color:'#5b9a6b', soft:'#dff0e2', time:'~60 min',
  ex:[
  O('X',0,{tag:'Foco cuádriceps'}),
  O('X',2,{tag:'Foco cuádriceps', sets:'3'}),
  {name:'Sentadilla búlgara con mancuernas', tag:'Foco cuádriceps', sets:'3', reps:'8–10 por pierna', rest:'90 s', mus:'Cuádriceps, glúteos', log:'E2-2',
   tips:['Pie de atrás apoyado en un banco y el de delante bien adelantado.','Baja recto hasta que la rodilla de atrás casi toque el suelo.','Empieza con poco peso: cuesta más de lo que parece.'],
   draw:{A:{hip:[98,96],t:-90,hn:'hang',fn:[114,148],ff:[60,121],kdf:90,ftf:30},
         B:{hip:[92,118],t:-84,hn:'hang',fn:[116,148],ff:[58,122],kdf:90,ftf:30},
         back:[['rect',30,124,40,6,3],['line',38,130,38,150,4],['line',62,130,62,150,4]], front:[['db','hn']]}},
  O('X',4,{sets:'3'}),
  O('X',3,{sets:'2'}),
  O('X',5),
  O('L',6),
  CARDIO('E2',true)
  ]},
{ k:'E3', name:'Entreno 3', title:'Torso · espalda', short:'Torso', sub:'Otra vez espalda con variantes + hombro, bíceps y core', color:'#8a63b5', soft:'#ece2f6', time:'~60 min',
  ex:[
  O('J',0,{tag:'Foco espalda'}),
  O('J',2,{tag:'Foco espalda', sets:'4'}),
  {name:'Pullover en polea alta', tag:'Foco espalda', sets:'3', reps:'12–15', rest:'60 s', mus:'Dorsales', log:'E3-2',
   tips:['Barra recta o cuerda en la polea alta, un paso atrás e inclínate un poco.','Brazos casi estirados: baja en arco hasta los muslos.','Sube despacio notando cómo se estira el dorsal.'],
   draw:{A:{hip:[96,92],t:-72,hn:[136,22],ed:-90,fn:[104,148],ff:[90,148]},
         B:{hip:[96,92],t:-72,hn:[120,92],ed:-90,fn:[104,148],ff:[90,148]},
         back:[['line',176,4,176,150,4]], front:[['cable',[172,10],'hn'],['handle','hn']]}},
  O('J',4),
  O('L',2),
  O('M',4),
  {name:'Press Pallof en polea', tag:'Core', sets:'3', reps:'10 por lado', rest:'45 s', mus:'Abdomen y oblicuos (antirrotación)', type:'bw', nolastre:true, log:'E3-6',
   tips:['De lado a la polea, con el agarre pegado al pecho.','Estira los brazos al frente sin dejar que la polea te gire.','Aguanta 2 s estirado. Cadera quieta y abdomen apretado.'],
   draw:{A:{hip:[98,91],t:-90,hn:[112,64],ed:90,fn:[104,148],ff:[90,148]},
         B:{hip:[98,91],t:-90,hn:[138,60],ed:90,fn:[104,148],ff:[90,148]},
         back:[['line',184,30,184,150,4]], front:[['cable',[180,60],'hn'],['handle','hn']]}},
  CARDIO('E3',false)
  ]},
{ k:'E4', name:'Entreno 4', title:'Pierna · glúteo y femoral', short:'Glúteo', sub:'Foco en glúteo y femoral + estabilidad de cadera y core', color:'#c58a1f', soft:'#f7ebd2', time:'~60 min',
  ex:[
  O('V',2,{tag:'Foco glúteo', sets:'4'}),
  O('X',1,{tag:'Foco femoral', sets:'4'}),
  O('X',3,{tag:'Foco femoral'}),
  {name:'Abducción de cadera (máquina o polea)', sets:'3', reps:'12–15', rest:'60 s', mus:'Glúteo medio', log:'E4-3',
   tips:['En máquina: espalda apoyada y abre las piernas despacio.','En polea: tobillera en la pierna de fuera y llévala hacia el lado.','Sin balancear el tronco. Ayuda a que las rodillas no se metan hacia dentro.'],
   draw:{A:{front:true,hip:[100,91],hn:[106,132],ed:0,hf:[52,92],edf:180,fn:[108,148],ff:[92,148]},
         B:{front:true,hip:[100,91],hn:[106,132],ed:0,hf:[52,92],edf:180,fn:[138,141],ftn:20,ff:[92,148]},
         back:[['line',40,40,40,150,4]], front:[['cable',[176,146],['fn',0,-4]]]}},
  {name:'Puente de glúteo a una pierna', tag:'Activación', sets:'3', reps:'10 por pierna', rest:'45 s', mus:'Glúteo, femoral, estabilidad de cadera', type:'bw', nolastre:true, log:'E4-4',
   tips:['Tumbado, un pie apoyado y la otra pierna estirada.','Sube la cadera apretando el glúteo, sin arquear la lumbar ni girar el tronco.','Si tiemblas o giras, sube menos. Es justo lo que falló en tu test.'],
   draw:{A:{hip:[118,142],t:180,hn:[100,147],ed:-90,hf:[98,147],edf:-90,fn:[150,148],kd:-90,ff:[170,116],kdf:-90,ftf:-60},
         B:{hip:[118,124],t:157,hn:[98,147],ed:-90,hf:[96,147],edf:-90,fn:[150,148],kd:-90,ff:[170,99],kdf:-90,ftf:-70},
         back:floorMat}},
  {name:'Plancha lateral', tag:'Core', sets:'3', reps:'20–40 s por lado', rest:'45 s', mus:'Oblicuos, glúteo medio', log:'E4-5',
   tips:['Codo justo debajo del hombro.','Cuerpo en línea recta y cadera arriba.','Respira normal y cambia de lado.'],
   draw:{A:{hip:[112,136],t:-164,hn:[96,147],ed:135,hf:{hip:[-4,-4]},edf:-90,fn:[164,147],kd:-90,ftn:-20,ff:[162,146],kdf:-90,ftf:-20},
         B:{hip:[112,124],t:-176,hn:[96,147],ed:135,hf:{hip:[-4,-4]},edf:-90,fn:[164,147],kd:-90,ftn:-20,ff:[162,146],kdf:-90,ftf:-20},
         back:floorMat}},
  CARDIO('E4',true)
  ]}
];

// pre-resolve
for(const d of [...OLD,...DAYS]) for(const e of d.ex){ if(!e.draw.f){ e.draw.RA=resolve(e.draw.A); e.draw.RB=resolve(e.draw.B);} }


// ---------- Store ----------
const keyOf=(d,i)=>`ex-${(d.ex[i]&&d.ex[i].log)||`${d.k}-${i}`}`;
const dayOfId=id=>{ const k=String(id).split('-')[0]; return DAYS.find(x=>x.k===k)||OLD.find(x=>x.k===k); };
const DOCKEYS=()=>['meta','sessions','body',...allLogKeys().map(o=>o.key)];
const getDoc=k=>store.get(k)||{};
const fmt=n=>(Math.round(n*100)/100).toString().replace('.',',');
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today=()=>iso(new Date());
const pdate=s=>new Date(s+'T12:00:00');
const fdate=s=>pdate(s).toLocaleDateString('es-ES',{day:'numeric',month:'short'});
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function persist(key,obj){
  obj.updated=Date.now(); store.set(key,obj);
  rerender();
}
function ensureStart(){ if(!getDoc('meta').start) persist('meta',{...getDoc('meta'),start:today()}); }

// ---------- Phases ----------
function phase(){
  const st=getDoc('meta').start; if(!st) return null;
  const days=Math.max(0,Math.floor((pdate(today())-pdate(st))/864e5));
  const w=Math.floor(days/7), cycle=Math.floor(w/9)+1, wk=w%9+1;
  let name='Progresión', tip='Intenta subir reps o peso respecto a la semana pasada.';
  if(wk===9){name='Descarga';tip='Mismo peso que la última vez, pero la mitad de series. Recuperas para el siguiente ciclo.';}
  else if(cycle===1&&wk<=2){name='Readaptación';tip='Haz 1 serie menos por ejercicio y deja 3–4 reps en recámara. Prioriza la técnica.';}
  return {wk,cycle,name,tip};
}
function effSets(e){ const n=parseInt(e.sets)||1, ph=phase(); if(!ph||n===1) return n; if(ph.name==='Readaptación') return n-1; if(ph.name==='Descarga') return Math.ceil(n/2); return n; }

// ---------- Exercise log ----------
function logType(e){ if(e.type) return e.type; if(/Cardio|Extra/.test(e.tag||'')) return 'none'; if(/Plancha|Rueda abdominal/.test(e.name)) return 't'; if(/Dominadas|Fondos|colgado|silla romana/.test(e.name)) return 'bw'; return 'w'; }
function range(e){ const m=e.reps.match(/(\d+)\s*[–-]\s*(\d+)/); return m?[+m[1],+m[2]]:[8,12]; }
const isBarbell=e=>/barra|Sentadilla con barra|Hip thrust/i.test(e.name)&&!/polea|cuerda|máquina|Jalón/i.test(e.name);
const barWeight=e=>/barra Z|Z\b/.test(e.name)?10:20;
const isDumbbell=e=>/mancuerna/i.test(e.name);
const round25=x=>Math.max(0,Math.round(x/2.5)*2.5);
function incText(e,kg){
  if(/Sentadilla|Peso muerto|Prensa|Hip thrust/.test(e.name)) return `Sube a <b>${fmt(kg+5)} kg</b>`;
  if(/mancuerna|polea|Elevaci|máquina|cuádriceps|gemelos|Face pull/i.test(e.name)) return `Sube al <b>siguiente peso</b> disponible (≈ +1–2,5 kg)`;
  return `Sube a <b>${fmt(kg+2.5)} kg</b>`;
}
const entries=key=>(store.get(key)&&Array.isArray(store.get(key).entries))?store.get(key).entries:[];
// Series de una entrada (compatible con el formato antiguo: kg + reps[])
const setsOf=x=>Array.isArray(x.sets)&&x.sets.length? x.sets : (x.reps||[]).map(r=>({kg:+x.kg||0,reps:+r,rir:null}));
const e1rm=(kg,r)=>kg*(1+r/30);
const bestE1rm=x=>Math.max(0,...setsOf(x).filter(s=>s.reps>0).map(s=>e1rm(+s.kg||0,s.reps)));
const topKg=x=>Math.max(0,...setsOf(x).filter(s=>s.reps>0).map(s=>+s.kg||0));
const score=(e,x)=>logType(e)==='w'? bestE1rm(x) : Math.max(0,...setsOf(x).map(s=>+s.reps||0))+(+x.kg||0)*0.5;
function stallInfo(e,key){
  const en=entries(key); if(en.length<4) return null;
  const prevBest=Math.max(...en.slice(0,-3).map(x=>score(e,x)));
  const last3=Math.max(...en.slice(-3).map(x=>score(e,x)));
  return last3<=prevBest+0.01 ? {sessions:3} : null;
}
function suggestion(e,key){
  const en=entries(key), t=logType(e), [lo,hi]=range(e), ph=phase();
  if(ph&&ph.name==='Descarga'&&en.length) { const l=en[en.length-1]; return `<b>Semana de descarga:</b> ${t==='w'?`usa ${fmt(topKg(l))} kg y `:''}haz ${effSets(e)} series sin llegar al fallo.`; }
  if(!en.length) return t==='t' ? 'Primera vez: aguanta lo que puedas con buena forma y apúntalo.' : 'Primera vez: usa un peso con el que te sobren 3–4 reps (RIR 3–4). Apúntalo y aquí verás cuándo subir.';
  const last=en[en.length-1], S=setsOf(last).filter(s=>s.reps>0), reps=S.map(s=>s.reps), kg=topKg(last);
  const rirs=S.map(s=>s.rir).filter(v=>v!=null&&v!==''); const avgRir=rirs.length? rirs.reduce((a,b)=>a+(+b),0)/rirs.length : null;
  const nExp=Math.min(effSets(e),parseInt(e.sets)||1);
  const allTop=reps.length>=nExp&&reps.every(r=>r>=hi);
  const anyLow=reps.some(r=>r<lo);
  let s;
  if(t==='t') s= allTop? '¡Objetivo cumplido! Suma 10 s por serie o prueba una variante más difícil.' : 'Intenta sumar 5 s en alguna serie.';
  else if(t==='bw') s= allTop? `¡Llegaste a ${hi} en todas! Añade 2,5 kg de lastre (o quita algo de asistencia).` : anyLow? `Hasta llegar a ${lo} en todas, usa algo de asistencia.` : 'Repite y suma 1 rep en alguna serie.';
  else if(allTop && (avgRir==null||avgRir>=1)) s=`¡${hi} reps en todas! ${incText(e,kg)} y vuelve a empezar desde ${lo} reps.`;
  else if(allTop) s=`Llegaste a ${hi} pero al límite (RIR 0). Repite <b>${fmt(kg)} kg</b> una sesión más y, si te sobra alguna rep, sube.`;
  else if(!anyLow && avgRir!=null && avgRir>=3) s=`Te sobraban muchas reps (RIR ${fmt(avgRir)}). ${incText(e,kg)}: así trabajas en el rango bueno.`;
  else if(anyLow && avgRir!=null && avgRir<=1) s=`Ha costado mucho. Baja a <b>${fmt(round25(kg*0.92))} kg</b> y busca hacer al menos ${lo} reps en todas.`;
  else if(anyLow) s=`Mantén ${fmt(kg)} kg (o baja un poco) hasta hacer al menos ${lo} reps en todas con buena técnica.`;
  else s=`Repite con <b>${fmt(kg)} kg</b> e intenta sumar 1 rep en alguna serie.`;
  if(ph&&ph.name==='Readaptación'&&t!=='t') s+=' <i>Estás en readaptación: sin prisa por subir.</i>';
  const st=t!=='t'&&stallInfo(e,key);
  if(st) s=`<div class="stall"><b>⚠️ Estancado en las últimas 3 sesiones.</b> Prueba una de estas: ${t==='w'?`<br>1) Baja a <b>${fmt(round25(kg*0.9))} kg</b> (−10 %) y vuelve a subir poco a poco.`:'<br>1) Haz una semana más fácil y vuelve a intentarlo.'}<br>2) Cambia a una variante unas semanas (botón 🔄 de arriba).<br>3) Descansa 30 s más entre series y revisa sueño y comida.</div>`+s;
  return s;
}
function sparkSvg(vals,color,W=220,H=40){
  if(vals.length<2) return '';
  const mn=Math.min(...vals), mx=Math.max(...vals);
  const pts=vals.map((v,i)=>[6+i*(W-12)/(vals.length-1), H-6-(mx===mn?0.5:(v-mn)/(mx-mn))*(H-12)]);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none"><polyline points="${pts.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
}
const exVals=(e,key)=>entries(key).slice(-12).map(x=> logType(e)==='w'? topKg(x) : setsOf(x).reduce((a,s)=>a+(+s.reps||0),0)+(+x.kg||0));
function setsText(e,x){
  const t=logType(e), S=setsOf(x).filter(s=>s.reps>0);
  const sameKg=S.every(s=>(+s.kg||0)===(+S[0]?.kg||0));
  const rir=s=>s.rir!=null&&s.rir!==''?`<sup>@${s.rir}</sup>`:'';
  if(t==='t') return S.map(s=>`${s.reps}${rir(s)}`).join(' / ')+' s';
  if(t==='bw') return `${+x.kg?`+${fmt(+x.kg)} kg · `:''}${S.map(s=>`${s.reps}${rir(s)}`).join(' / ')}`;
  if(sameKg) return `${fmt(+S[0]?.kg||0)} kg · ${S.map(s=>`${s.reps}${rir(s)}`).join(' / ')}`;
  return S.map(s=>`${fmt(+s.kg||0)}×${s.reps}${rir(s)}`).join(' · ');
}
function lastText(e,key){
  const en=entries(key); if(!en.length) return '<span style="color:var(--muted)">Aún sin registros.</span>';
  const l=en[en.length-1]; return `Última vez (${fdate(l.date)}): <b>${setsText(e,l)}</b>${logType(e)==='t'?'':' reps'}`;
}
function histHTML(e,key,color){
  const en=entries(key); if(!en.length) return '';
  const rows=en.slice().reverse().slice(0,12).map(x=>`<div class="hrow"><span>${fdate(x.date)}</span><span>${setsText(e,x)}</span><button data-del="${x.date}" title="Borrar">✕</button></div>`).join('');
  return `<details class="hist"><summary>Historial (${en.length})</summary>${rows}<p class="small">El número pequeño (@2) son las reps que te quedaban en recámara (RIR).</p></details>`;
}
// Discos por lado
function platesText(e,kg){
  if(!isBarbell(e)||!(kg>0)) return '';
  const bar=barWeight(e);
  if(kg<bar) return `🏋️ Con barra de ${bar} kg el mínimo es ${bar} kg.`;
  if(kg===bar) return `🏋️ Solo la barra (${bar} kg).`;
  let side=(kg-bar)/2; const P=[25,20,15,10,5,2.5,1.25], used=[];
  for(const p of P){ while(side>=p-1e-9){ used.push(p); side-=p; } }
  const rest=side>0.01?` (sobran ${fmt(side*2)} kg: redondea)`:'';
  return `🏋️ <b>Por lado:</b> ${used.map(fmt).join(' + ')}${rest} <span class="muted">· barra ${bar} kg</span>`;
}
// Series de aproximación
function warmupText(e,kg,isFirst){
  if(logType(e)!=='w'||!(kg>0)) return '';
  const big=isBarbell(e)&&/banca|Sentadilla|rumano|militar|Remo con barra|Hip thrust/i.test(e.name);
  if(!big&&!isFirst) return '';
  let steps;
  if(isBarbell(e)){ const bar=barWeight(e); steps=[[bar,10]]; [[0.5,8],[0.7,5],[0.85,3]].forEach(([p,r])=>{ const w=round25(kg*p); if(w>bar&&w<kg) steps.push([w,r]); }); }
  else steps=[[round25(kg*0.5),10],[round25(kg*0.75),5]].filter(([w])=>w>0&&w<kg);
  if(!steps.length) return '';
  return `🔥 <b>Aproximación:</b> ${steps.map(([w,r])=>`${fmt(w)} kg × ${r}`).join(' → ')} <span class="muted">· sin descanso largo, luego tus series</span>`;
}
const RIR_OPTS=['','0','1','2','3','4'];
function logBlock(e,key){
  const t=logType(e); if(t==='none') return '';
  const n=parseInt(e.sets)||3;
  let rows='';
  for(let i=0;i<n;i++){
    rows+=`<div class="setrow" data-s="${i}"><span class="sl">S${i+1}</span>
      ${t==='w'?`<label>kg<input class="skg" type="number" inputmode="decimal" step="0.5" min="0"></label>`:''}
      <label>${t==='t'?'seg':'reps'}<input class="rp" type="number" inputmode="numeric" min="0"></label>
      ${t!=='t'?`<label>RIR<select class="rir">${RIR_OPTS.map(o=>`<option value="${o}">${o===''?'–':o==='4'?'4+':o}</option>`).join('')}</select></label>`:''}</div>`;
  }
  return `<div class="log" data-key="${key}"><h5>Registro</h5><div class="logsum"></div><div class="sug"></div>
    ${t==='bw'&&!e.nolastre?`<div class="inrow" style="margin-bottom:6px"><label>kg extra (lastre)<input class="kg" type="number" inputmode="decimal" step="0.5" min="0"></label></div>`:''}
    <div class="sets">${rows}</div>
    <div class="aux"><div class="plates"></div><div class="warmup"></div></div>
    <div class="inrow"><button class="ghostbtn chartbtn" type="button">📈 Ver progreso</button><button class="save">Guardar</button></div>
    <div class="msg"></div><div class="histbox"></div>
    ${t!=='t'?'<p class="rirhelp">RIR = reps que te quedaban en recámara (0 = no podías más, 2 = podías 2 más).</p>':''}</div>`;
}
function refreshAux(box,e,isFirst){
  const kgs=[...box.querySelectorAll('.skg')].map(x=>parseFloat((x.value||'').replace(',','.'))||0);
  const kg=Math.max(0,...kgs);
  const pl=box.querySelector('.plates'), wu=box.querySelector('.warmup');
  if(pl) pl.innerHTML=platesText(e,kg);
  if(wu) wu.innerHTML=warmupText(e,kg,isFirst);
}
function refreshLog(box,e,color,prefill,isFirst){
  const key=box.dataset.key;
  box.querySelector('.logsum').innerHTML=lastText(e,key);
  box.querySelector('.sug').innerHTML=suggestion(e,key);
  const hb=box.querySelector('.histbox'); const open=hb.querySelector('details')?.open;
  hb.innerHTML=histHTML(e,key,color); if(open) hb.querySelector('details').open=true;
  hb.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{ persist(key,{entries:entries(key).filter(x=>x.date!==b.dataset.del)}); });
  if(prefill){
    const en=entries(key), [lo,hi]=range(e), t=logType(e);
    const rows=[...box.querySelectorAll('.setrow')];
    if(en.length){
      const l=en[en.length-1], S=setsOf(l);
      const kgI=box.querySelector('.kg'); if(kgI && !kgI.value && +l.kg) kgI.value=+l.kg;
      rows.forEach((r,i)=>{ const s=S[i]||S[S.length-1]||{}; const k=r.querySelector('.skg'); if(k&&!k.value&&+s.kg) k.value=+s.kg; const rp=r.querySelector('.rp'); rp.placeholder=S[i]?S[i].reps:''; });
    } else rows.forEach(r=>{ r.querySelector('.rp').placeholder=t==='t'?lo:`${lo}-${hi}`; });
  }
  refreshAux(box,e,isFirst);
}
// Gráfica de un ejercicio (ventana)
function lineChart(series,labels){
  const W=340,H=170,pl=34,pr=8,pt=10,pb=22;
  const all=series.flatMap(s=>s.vals).filter(v=>v!=null); if(all.length<1) return '';
  let mn=Math.min(...all), mx=Math.max(...all); if(mn===mx){mn-=1;mx+=1;} const padv=(mx-mn)*0.12; mn-=padv; mx+=padv;
  const n=labels.length, X=i=>pl+(n===1?(W-pl-pr)/2:i*(W-pl-pr)/(n-1)), Y=v=>pt+(1-(v-mn)/(mx-mn))*(H-pt-pb);
  let s=`<svg viewBox="0 0 ${W} ${H}" width="100%" class="lchart">`;
  for(let k=0;k<=3;k++){ const v=mn+(mx-mn)*k/3, y=Y(v); s+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" stroke="#eee8df"/><text x="${pl-4}" y="${y+3}" text-anchor="end" class="ax">${fmt(Math.round(v*2)/2)}</text>`; }
  const step=Math.max(1,Math.ceil(n/6)); labels.forEach((l,i)=>{ if(i%step===0||i===n-1) s+=`<text x="${X(i)}" y="${H-6}" text-anchor="middle" class="ax">${l}</text>`; });
  for(const se of series){ const pts=se.vals.map((v,i)=>v==null?null:[X(i),Y(v)]).filter(Boolean); if(!pts.length) continue;
    s+=`<polyline points="${pts.map(p=>p.map(x=>x.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${se.color}" stroke-width="2.5" ${se.dash?'stroke-dasharray="5 4"':''} stroke-linecap="round" stroke-linejoin="round"/>`;
    pts.forEach(p=>{ s+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${se.color}"/>`; }); }
  return s+'</svg>';
}
function openChart(e,key,color){
  const en=entries(key), t=logType(e), ov=R.getElementById('chartov');
  const labels=en.map(x=>{const d=pdate(x.date);return `${d.getDate()}/${d.getMonth()+1}`;});
  let body='';
  if(en.length<1) body='<p class="small">Aún no hay registros de este ejercicio.</p>';
  else if(t==='w'){
    const first=en[0], last=en[en.length-1];
    const best=Math.max(...en.map(bestE1rm)), bestKg=Math.max(...en.map(topKg));
    const d=topKg(last)-topKg(first), pct=topKg(first)?d/topKg(first)*100:0;
    body=`<div class="stats"><div><b>${fmt(topKg(last))} kg</b><span>peso actual</span></div><div><b>${fmt(bestKg)} kg</b><span>récord de peso</span></div><div><b>${fmt(Math.round(best))} kg</b><span>1RM estimado</span></div><div><b class="${d>=0?'up':''}">${d>0?'+':''}${fmt(d)} kg</b><span>${pct?`${d>0?'+':''}${fmt(Math.round(pct))} % `:''}desde el inicio</span></div></div>
      ${lineChart([{vals:en.map(topKg),color},{vals:en.map(x=>Math.round(bestE1rm(x)*10)/10),color:'#8a63b5',dash:true}],labels)}
      <div class="legend"><span><i style="background:${color}"></i>Peso de trabajo</span><span><i style="background:#8a63b5"></i>1RM estimado</span></div>
      ${lineChart([{vals:en.map(x=>setsOf(x).reduce((a,s)=>a+(+s.kg||0)*(+s.reps||0),0)),color:'#6fb7a0'}],labels)}
      <div class="legend"><span><i style="background:#6fb7a0"></i>Volumen de la sesión (kg × reps)</span></div>`;
  } else {
    body=`${lineChart([{vals:en.map(x=>Math.max(0,...setsOf(x).map(s=>+s.reps||0))),color},{vals:en.map(x=>setsOf(x).reduce((a,s)=>a+(+s.reps||0),0)),color:'#8a63b5',dash:true}],labels)}
      <div class="legend"><span><i style="background:${color}"></i>Mejor serie</span><span><i style="background:#8a63b5"></i>Total de la sesión</span></div>`;
  }
  body+=`<div class="htable">${en.slice().reverse().map(x=>`<div class="hrow"><span>${fdate(x.date)}</span><span>${setsText(e,x)}</span></div>`).join('')}</div>`;
  ov.innerHTML=`<div class="ovbox"><div class="ovhead"><h3>${e.name}</h3><button class="ovx" type="button">✕</button></div>${body}</div>`;
  ov.classList.add('on'); document.body.style.overflow='hidden';
  const close=()=>{ ov.classList.remove('on'); ov.innerHTML=''; document.body.style.overflow=''; };
  ov.querySelector('.ovx').onclick=close; ov.onclick=ev=>{ if(ev.target===ov) close(); };
}

// ---------- Variantes (máquina ocupada) ----------
const ALTS={
 'E1-0':[['estrecho','Jalón con agarre estrecho','M-0'],['asistidas','Dominadas asistidas en máquina','J-0']],
 'E1-1':[['mancuernas','Remo con mancuernas en banco inclinado','E1-1'],['barra','Remo con barra','M-1']],
 'E1-2':[['maquina','Remo en máquina','M-2'],['mancuerna','Remo con mancuerna a una mano','J-2']],
 'E1-3':[['goma','Face pull con goma','M-3'],['pajaros','Pájaros con mancuernas','J-4']],
 'E1-4':[['barra','Press inclinado con barra','L-1'],['maquina','Press inclinado en máquina','L-1']],
 'E1-5':[['polea','Elevación lateral en polea','V-3'],['maquina','Elevaciones laterales en máquina','L-4']],
 'E2-0':[['hack','Sentadilla hack en máquina','X-0'],['goblet','Sentadilla goblet con mancuerna','X-0'],['smith','Sentadilla en máquina Smith','X-0']],
 'E2-1':[['hack','Sentadilla hack en máquina','X-0']],
 'E2-2':[['zancadas','Zancadas con mancuernas','V-1'],['step','Subidas al banco con mancuernas','V-1']],
 'E2-4':[['sentado','Curl femoral sentado en máquina','X-4'],['nordico','Curl femoral con fitball','X-3']],
 'E2-5':[['prensa','Gemelos en prensa','X-5'],['sentado','Gemelos sentado en máquina','X-5']],
 'E2-6':[['rueda','Rueda abdominal','L-6']],
 'E3-0':[['jalon','Jalón al pecho en polea','M-0'],['goma','Dominadas con goma','J-0']],
 'E3-1':[['polea','Remo a una mano en polea','J-2'],['maquina','Remo en máquina','M-2']],
 'E3-2':[['cuerda','Pullover en polea con cuerda','E3-2']],
 'E3-3':[['facepull','Face pull en polea','M-3'],['contractor','Contractor invertido','J-4']],
 'E3-4':[['maquina','Press de hombro en máquina','L-2'],['landmine','Press landmine a una mano','L-2']],
 'E3-5':[['mancuernas','Curl con mancuernas','M-5'],['polea','Curl en polea baja','M-4']],
 'E3-6':[['goma','Press Pallof con goma','E3-6']],
 'E4-0':[['maquina','Hip thrust en máquina','V-2'],['puente','Puente de glúteo con mancuerna','V-2']],
 'E4-1':[['mancuernas','Peso muerto rumano con mancuernas','X-1'],['hiper','Hiperextensiones con peso','X-1']],
 'E4-2':[['sentado','Curl femoral sentado en máquina','X-4'],['nordico','Curl femoral con fitball','X-3']],
 'E4-3':[['goma','Abducción con goma (pasos laterales)','E4-3']],
 'E4-5':[['rodillas','Plancha lateral con rodillas apoyadas','E4-5']]
};
const exById=id=>{ const [k,i]=id.split('-'); const d=DAYS.find(x=>x.k===k)||OLD.find(x=>x.k===k); return d&&d.ex[+i]; };
const swaps=()=>getDoc('meta').swaps||{};
// Ejercicio efectivo de una tarjeta (el original o la variante elegida) y su clave de registro
function effEx(d,i){
  const id=`${d.k}-${i}`, base=d.ex[i], alt=(ALTS[id]||[]).find(a=>a[0]===swaps()[id]);
  if(!alt) return {ex:base,key:keyOf(d,i),alt:null};
  const from=exById(alt[2])||base;
  const ex={...base,name:alt[1],draw:from.draw,type:(alt[1].includes('asistid')?'bw':undefined),
    tips:[`Variante de «${base.name}»: trabaja lo mismo.`,'Mismo rango de reps y mismos descansos.','Su historial de pesos se guarda aparte.'],tag:base.tag};
  return {ex,key:`${keyOf(d,i)}@${alt[0]}`,alt:alt[0]};
}
function setSwap(id,altId){ const s={...swaps()}; if(altId) s[id]=altId; else delete s[id]; persist('meta',{...getDoc('meta'),swaps:s}); show(); }

// ---------- Sessions ----------
const sessDays=()=>getDoc('sessions').days||{};
const todaySess=()=>sessDays()[today()]||{done:[],note:''};
function updateToday(fn){
  const days={...sessDays()}, t=today(); const c={done:[],note:'',...(days[t]||{})}; c.done=[...(c.done||[])];
  fn(c);
  if(!c.done.length && !c.note) delete days[t]; else days[t]=c;
  persist('sessions',{days});
}
function setDone(id,on){ if(on) ensureStart(); updateToday(c=>{ if(on&&!c.done.includes(id)) c.done.push(id); if(!on) c.done=c.done.filter(x=>x!==id); }); }

// ---------- Rest timer ----------
let tEnd=0,tTot=0,tInt=null,actx=null;
const parseRest=r=>{const m=String(r).match(/(\d+)\s*(min|s)/); return m?(m[2]==='min'?+m[1]*60:+m[1]):0;};
function audioUnlock(){ try{ if(!actx){const A=window.AudioContext||window.webkitAudioContext; if(A) actx=new A();} if(actx&&actx.state==='suspended') actx.resume(); }catch(e){} }
function beep(){ try{ if(!actx) return; [0,0.25,0.5].forEach(o=>{const os=actx.createOscillator(),g=actx.createGain(); os.frequency.value=880; g.gain.setValueAtTime(0.0001,actx.currentTime+o); g.gain.exponentialRampToValueAtTime(0.3,actx.currentTime+o+0.02); g.gain.exponentialRampToValueAtTime(0.0001,actx.currentTime+o+0.18); os.connect(g).connect(actx.destination); os.start(actx.currentTime+o); os.stop(actx.currentTime+o+0.2);}); }catch(e){} try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){} }
// Voz (se oye por los auriculares) y bips
let voice=null;
function speak(text){
  try{ const ss=window.speechSynthesis; if(!ss) return; ss.cancel();
    if(!voice){ const vs=ss.getVoices(); voice=vs.find(v=>/^es(-|_)ES/i.test(v.lang))||vs.find(v=>/^es/i.test(v.lang))||null; }
    const u=new SpeechSynthesisUtterance(text); u.lang='es-ES'; if(voice) u.voice=voice; u.rate=1.02; ss.speak(u); }catch(e){}
}
function tickBeep(f=660){ try{ if(!actx) return; const os=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime; os.frequency.value=f; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.25,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+0.12); os.connect(g).connect(actx.destination); os.start(t); os.stop(t+0.15);}catch(e){} }
let wakeLock=null;
const keepAwake=on=>{ try{ if(on&&navigator.wakeLock&&!wakeLock) navigator.wakeLock.request('screen').then(w=>wakeLock=w).catch(()=>{}); if(!on&&wakeLock){ wakeLock.release(); wakeLock=null; } }catch(e){} };
let tOnEnd=null, tLastL=null, tSeq=null;
function startTimer(sec,label,opts={}){
  if(!sec) return; audioUnlock(); tTot=sec; tEnd=Date.now()+sec*1000; tOnEnd=opts.onEnd||null; tLastL=null;
  if(!opts.seq) tSeq=null;
  const el=R.getElementById('timer'); el.classList.add('on'); el.querySelector('.tl').textContent=label||'Descanso';
  R.getElementById('tskip').hidden=!tSeq;
  clearInterval(tInt); tInt=setInterval(tick,250); tick();
}
function tick(){
  const el=R.getElementById('timer'); const left=Math.ceil((tEnd-Date.now())/1000);
  if(left!==tLastL){ tLastL=left; if(left<=3&&left>0) tickBeep(); if(left===10&&tTot>=30&&tSeq) speak('Diez segundos'); }
  if(left<=0){
    clearInterval(tInt);
    if(tOnEnd){ const f=tOnEnd; tOnEnd=null; beep(); f(); return; }
    el.querySelector('.tt').textContent='¡Siguiente serie!'; el.querySelector('.tb i').style.width='100%'; beep(); speak('Descanso terminado. ¡Siguiente serie!');
    setTimeout(()=>{ if(Date.now()>=tEnd) el.classList.remove('on'); },4000); return;
  }
  el.querySelector('.tt').textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;
  el.querySelector('.tb i').style.width=(100*(1-left/tTot)).toFixed(1)+'%';
}
// Calentamiento guiado
const WARMUP=[
  {sec:60,label:'🧽 Rodillo: pecho (contra la pared con pelota o rodillo)',say:'Empezamos. Un minuto de rodillo en el pecho, apoyado en la pared. Busca los puntos tensos y quédate en ellos.'},
  {sec:60,label:'🧽 Rodillo: espalda alta y trapecio',say:'Rodillo en la espalda alta. Brazos cruzados y rueda despacio entre los omóplatos.'},
  {sec:60,label:'🧽 Rodillo: cuádriceps y flexor de cadera',say:'Ahora rodillo en los cuádriceps, boca abajo, hasta la parte delantera de la cadera.'},
  {sec:60,label:'🧽 Rodillo: gemelos',say:'Rodillo en los gemelos. Cruza una pierna encima para apretar más.'},
  {sec:60,label:'📖 Movilidad torácica: libro abierto (30 s por lado)',say:'Movilidad de la espalda alta. Tumbado de lado, abre el brazo como un libro, siguiéndolo con la mirada. Cambia de lado a mitad.'},
  {sec:60,label:'🧱 Ángeles en pared',say:'Ángeles en la pared. Espalda, codos y manos pegados a la pared, sube y baja despacio sin arquear la lumbar.'},
  {sec:60,label:'🦵 Cadera: estiramiento del flexor en zancada (30 s por lado)',say:'Estiramiento de cadera. Rodilla atrás en el suelo, aprieta el glúteo y empuja la cadera adelante. Cambia a mitad.'},
  {sec:45,label:'🦶 Tobillo: rodilla a la pared',say:'Movilidad de tobillo. Lleva la rodilla hacia la pared sin levantar el talón. Alterna piernas.'},
  {sec:45,label:'🟠 Goma: rotaciones externas de hombro',say:'Activación con goma. Rotaciones externas: codo pegado al cuerpo y lleva la mano hacia fuera.'},
  {sec:45,label:'🟠 Goma: face pull o aperturas',say:'Face pull con goma. Tira hacia la cara abriendo los codos y junta los omóplatos.'},
  {sec:45,label:'🟠 Goma: almeja de glúteo',say:'Último. La almeja con goma: tumbado de lado, abre la rodilla sin mover la cadera. Cambia de lado a mitad.'}
];
function startWarmup(){
  audioUnlock(); keepAwake(true); tSeq={i:0};
  const run=()=>{
    const st=WARMUP[tSeq.i];
    speak(st.say);
    startTimer(st.sec,`Calentamiento ${tSeq.i+1}/${WARMUP.length} · ${st.label}`,{seq:true,onEnd:()=>{
      tSeq.i++;
      if(tSeq.i<WARMUP.length) run();
      else { tSeq=null; keepAwake(false); const el=R.getElementById('timer'); el.querySelector('.tl').textContent='Calentamiento'; el.querySelector('.tt').textContent='¡Listo! 💪'; el.querySelector('.tb i').style.width='100%';
        R.getElementById('tskip').hidden=true; speak('Movilidad terminada. Ahora haz la aproximación del primer ejercicio. ¡A por ello!'); setTimeout(()=>el.classList.remove('on'),5000); }
    }});
  };
  run();
}

// ---------- UI ----------
const tabsEl=R.getElementById('tabs'), dayEl=R.getElementById('day');
const PROG=DAYS.length; let cur=0, figs=[];
const slug=n=>n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
// Siguiente entreno: el que sigue al último hecho (o el de hoy si ya has empezado)
function nextIdx(){
  const days=sessDays(); const ks=Object.keys(days).sort().reverse();
  for(const k of ks){ const ids=(days[k].done||[]); for(let j=ids.length-1;j>=0;j--){ const i=DAYS.findIndex(d=>String(ids[j]).startsWith(d.k+'-')); if(i>=0) return {idx:k===today()?i:(i+1)%DAYS.length, last:k, lastIdx:i}; } }
  return {idx:0,last:null,lastIdx:-1};
}
function buildTabs(){
  const nx=nextIdx().idx;
  tabsEl.innerHTML=DAYS.map((d,i)=>`<button class="tab${i===cur?' on':''}" style="--dc:${d.color}" data-i="${i}">${i===nx?'<i class="next">Hoy</i>':''}<b>${i+1}</b><span>${d.short||d.title}</span></button>`).join('')
   +`<button class="tab${cur===PROG?' on':''}" style="--dc:#273046" data-i="${PROG}"><b>📈</b><span>Progreso</span></button>`;
  tabsEl.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{cur=+b.dataset.i;show();window.scrollTo({top:Math.min(window.scrollY,tabsEl.offsetTop),behavior:'smooth'});});
}
function phaseText(){ const ph=phase(); return ph? `Semana ${ph.wk} de 9 · ${ph.name}` : 'Semana 1 empieza al guardar tu primer registro'; }
function show(){
  buildTabs(); figs=[];
  if(cur===PROG) return showProgress();
  const d=DAYS[cur];
  dayEl.style.setProperty('--dc',d.color); dayEl.style.setProperty('--soft',d.soft);
  const nx=nextIdx();
  let h=`<div class="dayhead"><h2>${d.name} · ${d.title}</h2><p>${d.sub}</p><div class="meta"><span>${d.time}</span><span>${d.ex.length} ejercicios</span><span class="phasepill">${phaseText()}</span></div><p class="phtip"></p></div>
  ${nx.idx!==cur?`<div class="nextbar">Hoy te toca el <b>${DAYS[nx.idx].name}</b> (${DAYS[nx.idx].title})${nx.last?`: el último fue el ${DAYS[nx.lastIdx].name.replace('Entreno ','')} el ${fdate(nx.last)}`:''}.<button type="button" id="gonext">Ir al ${nx.idx+1}</button></div>`:''}
  ${weeklyBanner()}
  <div class="warm"><b>Antes de empezar: movilidad e inhibición (10 min).</b> Rodillo en pecho, espalda alta, cuádriceps y gemelos; movilidad de espalda alta, hombros, cadera y tobillo; y activación con goma (rotaciones externas, face pull y almeja). En el primer ejercicio te sale abajo la <b>aproximación</b> con los pesos exactos.
    <button class="wbtn" id="warmgo" type="button">▶ Empezar movilidad guiada</button><span class="whint">Te avisa por voz y con pitidos al cambiar de parte (se oye en los AirPods). Deja la app abierta.</span></div>`;
  d.ex.forEach((base,i)=>{
    const id=`${d.k}-${i}`, {ex:e,key,alt}=effEx(d,i), rs=parseRest(e.rest), alts=ALTS[id]||[];
    h+=`<article class="ex" data-id="${id}" data-i="${i}">
      <div class="fig"><div class="num">${i+1}</div><div class="svgbox" data-i="${i}"></div></div>
      <div class="info">${e.tag?`<div class="tag">${e.tag}</div>`:''}<h3>${e.name}</h3>
        ${alt?`<div class="altnote">🔄 Variante de «${base.name}»</div>`:''}
        <div class="sr"><span class="setsch" data-i="${i}">${e.sets} × ${e.reps}</span>${rs?`<button class="tbtn" data-rest="${rs}">⏱ Descanso ${e.rest}</button>`:`<span class="r">Descanso ${e.rest}</span>`}${alts.length?`<button class="tbtn swapbtn" type="button">🔄 Cambiar</button>`:''}</div>
        ${alts.length?`<div class="swapbox" hidden><span class="small" style="margin:0 0 4px">¿Máquina ocupada? Elige una variante (se queda hasta que la cambies):</span>
          <div class="swapopts"><button data-alt="" class="${!alt?'on':''}">${base.name}</button>${alts.map(a=>`<button data-alt="${a[0]}" class="${alt===a[0]?'on':''}">${a[1]}</button>`).join('')}</div></div>`:''}
        <div class="mus">${e.mus}</div>
        <ul>${e.tips.map(t=>`<li>${t}</li>`).join('')}</ul>
        <label class="done"><input type="checkbox"> Hecho hoy</label>
        ${logBlock(e,key)}
      </div></article>`;
  });
  h+=`<div class="gcard notes"><h4>Notas de hoy</h4><textarea id="note" rows="3" placeholder="Cómo te has sentido, molestias, máquina ocupada…"></textarea><div class="msg" id="notemsg"></div></div>
  <button class="reset" id="reset">Desmarcar los ejercicios de hoy</button>`;
  dayEl.innerHTML=h;
  dayEl.querySelectorAll('.ex').forEach(a=>{
    const i=+a.dataset.i, {ex:e}=effEx(d,i);
    const cb=a.querySelector('.done input');
    cb.onchange=()=>setDone(a.dataset.id,cb.checked);
    const rest=a.querySelector('.tbtn[data-rest]'); if(rest) rest.onclick=()=>startTimer(+rest.dataset.rest, e.name);
    a.querySelectorAll('.rp').forEach(inp=>inp.addEventListener('change',()=>{ if(inp.value&&rest) startTimer(+rest.dataset.rest,e.name); }));
    const sw=a.querySelector('.swapbtn'), sb=a.querySelector('.swapbox');
    if(sw) sw.onclick=()=>{ sb.hidden=!sb.hidden; };
    a.querySelectorAll('[data-alt]').forEach(b=>b.onclick=()=>setSwap(a.dataset.id,b.dataset.alt));
  });
  const note=R.getElementById('note');
  note.onchange=()=>{ updateToday(c=>{c.note=note.value.trim()}); R.getElementById('notemsg').textContent='Nota guardada ✓'; };
  R.getElementById('reset').onclick=()=>updateToday(c=>{c.done=c.done.filter(x=>!x.startsWith(d.k+'-'))});
  const wb=R.getElementById('wkclose'); if(wb) wb.onclick=()=>{ try{localStorage.setItem('pau-resumen-visto',mondayOf(today()))}catch(e){}; R.getElementById('wkbanner').remove(); };
  R.getElementById('warmgo').onclick=()=>startWarmup();
  const gn=R.getElementById('gonext'); if(gn) gn.onclick=()=>{ cur=nextIdx().idx; show(); };
  wireLogs();
  figs=[...dayEl.querySelectorAll('.svgbox')].map(el=>({el,ex:effEx(d,+el.dataset.i).ex}));
  refreshDay(true);
}
function refreshDay(prefill){
  const d=DAYS[cur]; if(!d) return;
  const ph=phase(); const pp=dayEl.querySelector('.phasepill'); if(pp) pp.textContent=phaseText();
  const tip=dayEl.querySelector('.phtip'); if(tip) tip.textContent= ph? ph.tip : '';
  dayEl.querySelectorAll('.setsch').forEach(el=>{ const e=d.ex[+el.dataset.i]; const n=effSets(e); el.innerHTML= n!==(parseInt(e.sets)||1) ? `${n} × ${e.reps} <small>(esta semana)</small>` : `${e.sets} × ${e.reps}`; });
  const done=todaySess().done||[];
  dayEl.querySelectorAll('.ex').forEach(a=>{ const on=done.includes(a.dataset.id); a.classList.toggle('isdone',on); a.querySelector('.done input').checked=on; });
  const note=R.getElementById('note'); if(note && R.activeElement!==note) note.value=todaySess().note||'';
  dayEl.querySelectorAll('.log').forEach(box=>{ const i=+box.closest('.ex').dataset.i; refreshLog(box,effEx(d,i).ex,d.color,prefill,i===0); });
}
function wireLogs(){
  const d=DAYS[cur];
  dayEl.querySelectorAll('.log').forEach(box=>{
    const key=box.dataset.key, i=+box.closest('.ex').dataset.i, e=effEx(d,i).ex, t=logType(e);
    box.querySelectorAll('.skg').forEach((inp,idx,all)=>inp.addEventListener('input',()=>{
      // al cambiar el peso de la serie 1, copia a las siguientes que aún no tienen reps
      if(idx===0) all.forEach((o,j)=>{ if(j>0){ const r=o.closest('.setrow').querySelector('.rp'); if(!r.value) o.value=inp.value; } });
      refreshAux(box,e,i===0);
    }));
    box.querySelector('.chartbtn').onclick=()=>openChart(e,key,d.color);
    box.querySelector('.save').onclick=()=>{
      const msg=box.querySelector('.msg');
      const extra=box.querySelector('.kg'); const xkg=extra?(parseFloat((extra.value||'').replace(',','.'))||0):0;
      const sets=[...box.querySelectorAll('.setrow')].map(r=>{
        const k=r.querySelector('.skg'), rp=r.querySelector('.rp'), ri=r.querySelector('.rir');
        return {kg:k?(parseFloat((k.value||'').replace(',','.'))||0):xkg, reps:parseInt(rp.value)||0, rir:ri&&ri.value!==''?+ri.value:null};
      }).filter(s=>s.reps>0);
      if(!sets.length){ msg.textContent='Apunta las reps de al menos una serie.'; return; }
      ensureStart();
      const kgTop=t==='w'?Math.max(...sets.map(s=>s.kg)):xkg;
      const entry={date:today(),kg:kgTop,reps:sets.map(s=>s.reps),sets};
      const prev=entries(key), prevBest=prev.length?Math.max(...prev.map(x=>score(e,x))):null;
      const en=prev.filter(x=>x.date!==today()); en.push(entry);
      persist(key,{entries:en.slice(-80)});
      setDone(`${d.k}-${i}`,true);
      box.querySelectorAll('.rp').forEach(x=>x.value=''); box.querySelectorAll('.rir').forEach(x=>x.value='');
      refreshLog(box,e,d.color,true,i===0);
      const pr=prevBest!=null&&score(e,entry)>prevBest+0.01;
      msg.innerHTML=pr?'<b>🏆 ¡Nuevo récord en este ejercicio!</b>':'Guardado ✓'; setTimeout(()=>{msg.textContent=''},3500);
      if(pr&&hooks.onEvent) hooks.onEvent(`🏆 Nuevo récord en ${e.name}: ${setsText(e,entry)}`.replace(/<[^>]+>/g,''));
    };
  });
}

// ---------- Resumen semanal ----------
const mondayOf=s=>{const d=pdate(s); d.setDate(d.getDate()-((d.getDay()+6)%7)); return iso(d);};
const addDaysIso=(s,n)=>{const d=pdate(s); d.setDate(d.getDate()+n); return iso(d);};
function allLogKeys(){ const ks=[], seen=new Set(); const push=o=>{ if(!seen.has(o.key)){ seen.add(o.key); ks.push(o); } }; for(const d of [...DAYS,...OLD]) d.ex.forEach((e,i)=>{ const base=keyOf(d,i); push({key:base,ex:e}); (ALTS[`${d.k}-${i}`]||[]).forEach(a=>{ const from=exById(a[2])||e; push({key:`${base}@${a[0]}`,ex:{...e,name:a[1],draw:from.draw}}); }); }); return ks; }
function weekSummary(weekStart){
  const end=addDaysIso(weekStart,6), inW=x=>x>=weekStart&&x<=end;
  const days=Object.keys(sessDays()).filter(k=>inW(k)&&(sessDays()[k].done||[]).length);
  const ups=[], prs=[], stalls=[]; let vol=0, volPrev=0;
  const prevStart=addDaysIso(weekStart,-7), inPrev=x=>x>=prevStart&&x<weekStart;
  for(const {key,ex} of allLogKeys()){
    const en=entries(key); if(!en.length) continue; const t=logType(ex);
    en.forEach(x=>{ const v=setsOf(x).reduce((a,s)=>a+(+s.kg||0)*(+s.reps||0),0); if(inW(x.date)) vol+=v; if(inPrev(x.date)) volPrev+=v; });
    const idx=en.findIndex(x=>inW(x.date)); if(idx<0) continue;
    const cur=en.filter(x=>inW(x.date)), before=en.slice(0,idx);
    if(before.length){
      const bestBefore=Math.max(...before.map(x=>score(ex,x))), bestNow=Math.max(...cur.map(x=>score(ex,x)));
      if(bestNow>bestBefore+0.01) prs.push(ex.name);
      const lastBefore=before[before.length-1], lastNow=cur[cur.length-1];
      if(t==='w'&&topKg(lastNow)>topKg(lastBefore)) ups.push(`${ex.name} (${fmt(topKg(lastBefore))} → ${fmt(topKg(lastNow))} kg)`);
    }
    if(stallInfo(ex,key)) stalls.push(ex.name);
  }
  return {days:days.length,prs,ups,stalls,vol,volPrev};
}
function summaryHTML(s,title){
  const dv=s.volPrev?Math.round((s.vol-s.volPrev)/s.volPrev*100):null;
  const nextPh=(()=>{ const ph=phase(); if(!ph) return 'Empieza cuando quieras: la semana 1 arranca con tu primer registro.'; const nw=ph.wk%9+1; return nw===9?'La semana que viene toca <b>descarga</b>: mismo peso y la mitad de series.':nw===1?'Empieza un ciclo nuevo: vuelve a progresar desde tus pesos actuales.':ph.name==='Readaptación'&&nw>=3?'Se acaba la readaptación: la semana que viene haces todas las series.':'Sigue progresando: sube reps o peso donde te lo diga la app.'; })();
  return `<h4>${title}</h4>
    <div class="stats"><div><b>${s.days}/4</b><span>entrenos</span></div><div><b>${s.prs.length}</b><span>récords</span></div><div><b>${fmt(Math.round(s.vol/100)/10)} t</b><span>volumen${dv!=null?` (${dv>0?'+':''}${dv} %)`:''}</span></div></div>
    ${s.ups.length?`<p class="small" style="color:var(--ink)"><b>⬆️ Subiste peso en:</b> ${s.ups.slice(0,6).join(', ')}</p>`:''}
    ${s.prs.length?`<p class="small" style="color:var(--ink)"><b>🏆 Récords:</b> ${s.prs.slice(0,6).join(', ')}</p>`:''}
    ${s.stalls.length?`<p class="small" style="color:#b3541e"><b>⚠️ Estancados:</b> ${s.stalls.slice(0,5).join(', ')}. Mira la recomendación en cada ejercicio.</p>`:''}
    <p class="small" style="color:var(--ink)"><b>➡️ Próxima semana:</b> ${nextPh}</p>`;
}
function weeklyBanner(){
  const wd=new Date().getDay(); if(!(wd===1||wd===2||wd===0)) return '';
  const lastWeek=wd===0?mondayOf(today()):addDaysIso(mondayOf(today()),-7);
  let seen=null; try{seen=localStorage.getItem('pau-resumen-visto')}catch(e){}
  if(seen===mondayOf(today())) return '';
  const s=weekSummary(lastWeek); if(!s.days) return '';
  return `<div class="gcard wkbanner" id="wkbanner"><button class="wkx" id="wkclose" type="button">✕</button>${summaryHTML(s,wd===0?'📋 Tu semana':'📋 Resumen de la semana pasada')}</div>`;
}

// ---------- Progress view ----------
function showProgress(){
  dayEl.style.setProperty('--dc','#273046'); dayEl.style.setProperty('--soft','#e4e7ef');
  dayEl.innerHTML=`<div class="dayhead"><h2>Mi progreso</h2><p>Tu constancia, tu peso corporal y cómo suben tus marcas.</p></div>
  <div class="gcard" id="pWeek"></div>
  <div class="gcard" id="pPhase"></div>
  <div class="gcard"><h4>Constancia</h4><div id="pCal"></div></div>
  <div class="gcard"><h4>Peso corporal y cintura</h4>
    <div class="inrow"><label>Peso kg<input id="bkg" class="kg" type="number" inputmode="decimal" step="0.1"></label><label>Cintura cm<input id="bwa" class="kg" type="number" inputmode="decimal" step="0.5"></label><button class="save" id="bsave">Guardar</button></div>
    <div class="msg" id="bmsg"></div>
    <p class="small">Pésate en ayunas 1–2 veces por semana. Mide la cintura a la altura del ombligo. Para ganar músculo y perder grasa, la cintura dice más que la báscula.</p>
    <div id="pBody"></div></div>
  <div class="gcard"><h4>Ejercicios</h4><div id="pEx"></div></div>
  <div class="gcard"><h4>Copia de seguridad</h4>
    <p class="small">Copia tus datos para guardarlos donde quieras, o pega una copia para recuperarlos.</p>
    <div class="inrow"><button class="save" id="exp" style="margin-left:0">Copiar mis datos</button></div>
    <textarea id="impt" rows="3" placeholder="Pega aquí una copia para importarla"></textarea>
    <div class="inrow"><button class="save ghost" id="imp" style="margin-left:0">Importar copia</button></div>
    <div class="msg" id="bkmsg"></div></div>`;
  R.getElementById('bsave').onclick=()=>{
    const kg=parseFloat((R.getElementById('bkg').value||'').replace(',','.')), wa=parseFloat((R.getElementById('bwa').value||'').replace(',','.'));
    const m=R.getElementById('bmsg');
    if(!(kg>0)&&!(wa>0)){ m.textContent='Apunta el peso, la cintura o ambos.'; return; }
    const en=(getDoc('body').entries||[]).filter(x=>x.date!==today()); en.push({date:today(),kg:kg>0?kg:null,waist:wa>0?wa:null});
    persist('body',{entries:en.slice(-200)}); R.getElementById('bkg').value=''; R.getElementById('bwa').value=''; m.textContent='Guardado ✓';
  };
  R.getElementById('exp').onclick=async()=>{
    const data=JSON.stringify({app:'plan-gym',v:1,date:today(),docs:store.all()});
    const m=R.getElementById('bkmsg');
    try{ await navigator.clipboard.writeText(data); m.textContent='Copiado ✓ Pégalo en una nota o un correo para guardarlo.'; }
    catch(e){ const t=R.getElementById('impt'); t.value=data; t.select(); m.textContent='No se pudo copiar solo: está en el cuadro, cópialo a mano.'; }
  };
  let armed=false;
  R.getElementById('imp').onclick=()=>{
    const m=R.getElementById('bkmsg'); let obj;
    try{ obj=JSON.parse(R.getElementById('impt').value); if(!obj||obj.app!=='plan-gym'||!obj.docs) throw 0; }catch(e){ m.textContent='Eso no parece una copia de este plan.'; return; }
    if(!armed){ armed=true; m.textContent='Esto sustituirá tus datos actuales. Pulsa «Importar copia» otra vez para confirmar.'; return; }
    const keys=DOCKEYS(); for(const k of keys) if(obj.docs[k]&&typeof obj.docs[k]==='object') persist(k,{...obj.docs[k]});
    armed=false; m.textContent='Copia importada ✓';
  };
  refreshProgress();
}
function refreshProgress(){
  if(cur!==PROG) return;
  // phase
  const ph=phase(), st=getDoc('meta').start;
  R.getElementById('pPhase').innerHTML=`<h4>${ph?`Semana ${ph.wk} de 9 · ${ph.name}${ph.cycle>1?` <small>(ciclo ${ph.cycle})</small>`:''}`:'Aún no has empezado'}</h4>
    <p class="small">${ph?ph.tip:'Tu semana 1 empieza el día que guardes tu primer registro o marques un ejercicio.'}</p>
    <div class="inrow"><label>Fecha de inicio<input id="stdate" type="date" value="${st||''}" style="width:auto"></label></div>
    <div class="phbar">${Array.from({length:9},(_,i)=>`<i class="${ph&&i+1<ph.wk?'p':''}${ph&&i+1===ph.wk?' c':''}" title="Semana ${i+1}">${i+1}</i>`).join('')}</div>
    <p class="small">1–2 readaptación · 3–8 progresión · 9 descarga · y vuelta a empezar.</p>`;
  R.getElementById('stdate').onchange=e=>{ if(e.target.value) persist('meta',{...getDoc('meta'),start:e.target.value}); };
  // calendar
  const days=sessDays(); const now=new Date(); const mon=new Date(now); mon.setDate(now.getDate()-((now.getDay()+6)%7));
  const colorOf=s=>{const id=(s&&s.done||[])[0]; const d=id&&dayOfId(id); return d?d.color:'#273046';};
  let rows='', weekCounts=[];
  for(let w=7;w>=0;w--){
    const m0=new Date(mon); m0.setDate(mon.getDate()-7*w); let cnt=0, cells='';
    for(let k=0;k<7;k++){ const dd=new Date(m0); dd.setDate(m0.getDate()+k); const key=iso(dd); const s=days[key]; const has=s&&(s.done||[]).length;
      if(has) cnt++;
      if(k<5||has) cells+=`<i class="${key===today()?'today':''}" style="${has?`background:${colorOf(s)}`:''}" title="${fdate(key)}${s&&s.note?' · '+esc(s.note):''}"></i>`; else cells+='<i class="we"></i>'; }
    weekCounts.push(cnt);
    rows+=`<div class="crow"><span>${fdate(iso(m0))}</span>${cells}<b>${cnt}</b></div>`;
  }
  let streak=0; for(let i=weekCounts.length-2;i>=0;i--){ if(weekCounts[i]>=4) streak++; else break; } if(weekCounts[weekCounts.length-1]>=4) streak++;
  const total=Object.values(days).filter(s=>(s.done||[]).length).length;
  const notes=Object.entries(days).filter(([k,s])=>s.note).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,5);
  R.getElementById('pCal').innerHTML=`<div class="stats"><div><b>${weekCounts[weekCounts.length-1]}/4</b><span>esta semana</span></div><div><b>${total}</b><span>sesiones en total</span></div><div><b>${streak}</b><span>semanas seguidas con los 4 entrenos</span></div></div>
    <div class="cal"><div class="crow hd"><span></span><i>L</i><i>M</i><i>X</i><i>J</i><i>V</i><i>S</i><i>D</i><b></b></div>${rows}</div>
    ${notes.length?`<h4 style="margin-top:12px">Últimas notas</h4>${notes.map(([k,s])=>`<div class="hrow"><span>${fdate(k)}</span><span style="text-align:right;flex:1;margin-left:10px">${esc(s.note)}</span></div>`).join('')}`:''}`;
  // body
  const be=(getDoc('body').entries||[]);
  let bh='';
  if(be.length){
    const kgs=be.filter(x=>x.kg>0), was=be.filter(x=>x.waist>0);
    const dl=(a,f)=>a.length>1?(f(a[a.length-1])-f(a[0])):null;
    const dk=dl(kgs,x=>x.kg), dw=dl(was,x=>x.waist);
    bh+=`<div class="stats">${kgs.length?`<div><b>${fmt(kgs[kgs.length-1].kg)} kg</b><span>${dk!=null?`${dk>0?'+':''}${fmt(dk)} kg desde el inicio`:'peso actual'}</span></div>`:''}${was.length?`<div><b>${fmt(was[was.length-1].waist)} cm</b><span>${dw!=null?`${dw>0?'+':''}${fmt(dw)} cm de cintura`:'cintura actual'}</span></div>`:''}</div>`;
    if(kgs.length>1) bh+=`<div class="small">Peso</div>${sparkSvg(kgs.slice(-20).map(x=>x.kg),'#273046')}`;
    if(was.length>1) bh+=`<div class="small">Cintura</div>${sparkSvg(was.slice(-20).map(x=>x.waist),'#e0663a')}`;
    bh+=be.slice().reverse().slice(0,8).map(x=>`<div class="hrow"><span>${fdate(x.date)}</span><span>${x.kg?fmt(x.kg)+' kg':''}${x.kg&&x.waist?' · ':''}${x.waist?fmt(x.waist)+' cm':''}</span><button data-bdel="${x.date}">✕</button></div>`).join('');
  }
  const pb=R.getElementById('pBody'); pb.innerHTML=bh;
  pb.querySelectorAll('[data-bdel]').forEach(b=>b.onclick=()=>persist('body',{entries:(getDoc('body').entries||[]).filter(x=>x.date!==b.dataset.bdel)}));
  // weekly summary
  { const thisW=mondayOf(today()), lastW=addDaysIso(thisW,-7); const sNow=weekSummary(thisW), sLast=weekSummary(lastW);
    R.getElementById('pWeek').innerHTML=summaryHTML(sNow,'📋 Esta semana')+(sLast.days?`<details class="hist"><summary>Ver la semana pasada</summary>${summaryHTML(sLast,'Semana pasada')}</details>`:''); }
  // exercises
  let ex='';
  const shown=new Set();
  for(const d of [...DAYS,...OLD]){
    const old=OLD.includes(d);
    const items=[]; d.ex.forEach((e,i)=>{ if(logType(e)==='none') return; items.push({e,i,key:keyOf(d,i)}); (ALTS[`${d.k}-${i}`]||[]).forEach(a=>{ const from=exById(a[2])||e; items.push({e:{...e,name:a[1],draw:from.draw},i,key:`${keyOf(d,i)}@${a[0]}`,alt:true}); }); });
    const fresh=items.filter(o=>!shown.has(o.key)); fresh.forEach(o=>shown.add(o.key));
    const nrec=fresh.filter(o=>entries(o.key).length).length;
    if(old&&!nrec) continue;
    ex+=`<div class="pday" style="--dc:${d.color}"><div class="pdh">${old?'Plan anterior · ':''}${d.name} · ${d.title}</div>${nrec?'':'<span class="small">Sin registros nuevos todavía (los ejercicios repetidos salen arriba).</span>'}`;
    for(const {e,key} of fresh){
      const en=entries(key);
      if(!en.length) continue;
      const l=en[en.length-1], f=en[0], t=logType(e);
      const best= t==='w'? Math.max(...en.map(topKg)) : null;
      const delta= t==='w'? topKg(l)-topKg(f) : null;
      ex+=`<div class="prow" data-chart="${key}" data-c="${d.color}"><div><b>${e.name}</b><span class="small">${fdate(l.date)}: ${setsText(e,l)}${best!=null?` · récord ${fmt(best)} kg`:''}${delta?` · <span class="up">${delta>0?'+':''}${fmt(delta)} kg desde el inicio</span>`:''}${stallInfo(e,key)?' · <span style="color:#b3541e">⚠️ estancado</span>':''}</span></div><div class="psp">${sparkSvg(exVals(e,key),d.color,90,30)}</div><span class="chev">›</span></div>`;
    }
    ex+='</div>';
  }
  R.getElementById('pEx').innerHTML=ex;
  R.getElementById('pEx').querySelectorAll('[data-chart]').forEach(row=>row.onclick=()=>{ const key=row.dataset.chart; const it=allLogKeys().find(o=>o.key===key); if(it) openChart(it.ex,key,row.dataset.c); });
}
function rerender(){ if(cur===PROG) refreshProgress(); else refreshDay(false); }

function loop(ts){
  if(!alive) return;
  if(undefined==null && cur!==PROG){
    const d=DAYS[cur];
    for(const f of figs){
      const dur=(f.ex.draw.dur||2.8)*1000;
      let p;
      if(f.ex.draw.f) p=(ts%dur)/dur;
      else { const q=(ts%dur)/dur; p= q<0.5? q*2 : 2-q*2; }
      f.el.innerHTML=render(f.ex,p,d.color);
    }
  }
  requestAnimationFrame(loop);
}
function setStatus(t){}
R.getElementById('tplus').onclick=()=>{tEnd+=15000;tTot+=15;clearInterval(tInt);tInt=setInterval(tick,250);R.getElementById('timer').classList.add('on');tick();};
R.getElementById('tstop').onclick=()=>{clearInterval(tInt);tOnEnd=null;tSeq=null;keepAwake(false);try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){};R.getElementById('timer').classList.remove('on');};
R.getElementById('tskip').onclick=()=>{ if(tSeq){ tEnd=Date.now(); tick(); } };
const unsubStore=store.subscribe(()=>{ if(alive) rerender(); });
cur=nextIdx().idx;
show(); requestAnimationFrame(loop);

return () => { alive = false; clearInterval(tInt); keepAwake(false); try{ window.speechSynthesis && window.speechSynthesis.cancel(); }catch(e){} unsubStore(); R.innerHTML = ''; };
}
