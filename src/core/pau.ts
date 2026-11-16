// @ts-nocheck
// Plan de Pau: gimnasio 5 días con registro de pesos, fases y progreso.
// Código portado de la primera versión (web independiente). Se monta dentro de un Shadow DOM.
import { L, rad, V, add, sub, mul, len, lerp, lerpV, dirV, ik, resolve, mix, P, ln, circ, limb, legSvg, refPt, drawProp, render } from './engine';
import type { CoreStore } from './store';

const CSS = "\n:host{display:block;\n  --bg:#f6f3ee; --card:#ffffff; --ink:#1f2433; --muted:#6b7080; --line:#e7e2d9;\n  --acc:#e0663a; --acc-soft:#fbe6dc;\n  --body:#273046; --far:#9aa3b8; --equip:#b9b2a6; --equip-dark:#857e72;\n}\n*{box-sizing:border-box}\n:host{color:var(--ink);font-family:Poppins,system-ui,sans-serif;-webkit-font-smoothing:antialiased}\n.wrap{max-width:760px;margin:0 auto;padding:0 14px 60px}\nheader.hero{padding:26px 4px 10px}\n.hero h1{font-size:26px;line-height:1.15;margin:0 0 6px;font-weight:700;letter-spacing:-.3px}\n.hero p{margin:0;color:var(--muted);font-size:14px;line-height:1.5}\n.pills{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}\n.pill{font-size:12px;background:#fff;border:1px solid var(--line);border-radius:999px;padding:4px 10px;color:var(--ink)}\nnav.tabs{position:sticky;top:var(--top-offset,0px);z-index:5;background:var(--bg);padding:10px 0 10px;display:grid;grid-template-columns:repeat(5,1fr);gap:6px}\nnav.tabs::-webkit-scrollbar{display:none}\n.tab{min-width:0;border:1px solid var(--line);background:#fff;border-radius:14px;padding:8px 10px;text-align:center;cursor:pointer;font-family:inherit;color:var(--ink)}\n.tab b{display:block;font-size:15px;font-weight:600}\n.tab span{display:block;font-size:10.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.tab.on{background:var(--dc,var(--acc));border-color:var(--dc,var(--acc));color:#fff}\n.tab.on span{color:rgba(255,255,255,.85)}\n.dayhead{border-radius:20px;padding:18px 18px 16px;color:#fff;margin:6px 0 14px;background:var(--dc)}\n.dayhead h2{margin:0;font-size:21px;font-weight:700}\n.dayhead p{margin:4px 0 0;font-size:13.5px;opacity:.92;line-height:1.45}\n.dayhead .meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}\n.dayhead .meta span{background:rgba(255,255,255,.2);border-radius:999px;padding:3px 10px;font-size:12px}\n.warm{background:#fff;border:1px dashed var(--line);border-radius:16px;padding:12px 14px;font-size:13.5px;line-height:1.5;margin-bottom:12px}\n.warm b{font-weight:600}\n.ex{background:var(--card);border-radius:20px;border:1px solid var(--line);margin-bottom:12px;overflow:hidden;display:grid;grid-template-columns:150px 1fr}\n@media (max-width:520px){.ex{grid-template-columns:1fr}}\n.fig{background:linear-gradient(180deg,#fbfaf7,#f1ede6);display:flex;align-items:center;justify-content:center;min-height:140px;position:relative}\n.fig svg{width:100%;max-width:220px;height:auto;display:block}\n.num{position:absolute;top:10px;left:10px;width:26px;height:26px;border-radius:50%;background:var(--dc);color:#fff;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center}\n.info{padding:14px 16px 14px}\n.info h3{margin:0 0 6px;font-size:16.5px;font-weight:600;line-height:1.25}\n.sr{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}\n.sr span{font-size:12.5px;border-radius:8px;padding:3px 8px;background:var(--soft);color:var(--ink);font-weight:500}\n.sr span.r{background:#f0eee9;color:var(--muted);font-weight:400}\n.mus{font-size:12px;color:var(--muted);margin-bottom:6px}\n.info ul{margin:0;padding-left:18px;font-size:13px;line-height:1.5;color:#3a3f4e}\n.info li{margin:2px 0}\n.tag{display:inline-block;font-size:11px;font-weight:600;letter-spacing:.3px;text-transform:uppercase;color:var(--dc);margin-bottom:3px}\n.done{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:12.5px;color:var(--muted);cursor:pointer;user-select:none}\n.done input{width:18px;height:18px;accent-color:var(--dc)}\n.ex.isdone{opacity:.55}\n.reset{display:block;margin:6px auto 22px;font-family:inherit;font-size:12.5px;border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 14px;color:var(--muted);cursor:pointer}\nsection.guide{margin-top:28px}\nsection.guide h2{font-size:19px;margin:0 0 10px}\n.gcard{background:#fff;border:1px solid var(--line);border-radius:18px;padding:14px 16px;margin-bottom:10px;font-size:13.5px;line-height:1.55}\n.gcard h4{margin:0 0 6px;font-size:14.5px;font-weight:600}\n.gcard ul{margin:0;padding-left:18px}\n.gcard li{margin:3px 0}\n.weeks{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px}\n.wk{border-radius:12px;padding:10px;font-size:12.5px;line-height:1.4;background:#f6f3ee}\n.wk b{display:block;font-size:13px;margin-bottom:2px}\n@media (max-width:520px){.weeks{grid-template-columns:1fr}}\n\n.log{margin-top:12px;border-top:1px solid var(--line);padding-top:10px}\n.log h5{margin:0 0 6px;font-size:12px;letter-spacing:.3px;text-transform:uppercase;color:var(--dc);font-weight:600}\n.logsum{font-size:12.5px;line-height:1.45;color:#3a3f4e;margin-bottom:6px}\n.sug{background:var(--soft);border-radius:10px;padding:7px 10px;font-size:12.5px;line-height:1.45;margin-bottom:8px}\n.inrow{display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end}\n.inrow label{display:flex;flex-direction:column;font-size:10.5px;color:var(--muted);gap:2px}\n.inrow input{width:52px;font:inherit;font-size:16px;padding:6px 4px;border:1px solid var(--line);border-radius:8px;text-align:center;background:#fff;color:var(--ink)}\n.inrow input.kg{width:66px}\nbutton.save{background:var(--dc);color:#fff;border:0;border-radius:999px;padding:9px 14px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;margin-left:auto}\n.msg{font-size:12px;color:var(--muted);min-height:16px;margin-top:4px}\ndetails.hist{margin-top:6px;font-size:12.5px}\ndetails.hist summary{cursor:pointer;color:var(--muted)}\n.hrow{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0ece5}\n.hrow button{border:0;background:none;color:#b0aaa0;cursor:pointer;font-size:13px}\n.spark{display:block;margin:6px 0 2px}\n.status{font-size:12px;color:var(--muted);text-align:center;margin:0 0 8px}\n\nnav.tabs{grid-template-columns:repeat(6,1fr)!important}\n.tab{padding:8px 3px!important}\n.dayhead .phtip{font-size:12.5px;margin-top:8px;opacity:.9}\n.dayhead .phtip:empty{display:none}\n.sr small{font-weight:400;opacity:.75}\nbutton.tbtn{font:inherit;font-size:12.5px;border:0;border-radius:8px;padding:3px 9px;background:#f0eee9;color:var(--ink);cursor:pointer}\ntextarea{width:100%;font:inherit;font-size:16px;border:1px solid var(--line);border-radius:10px;padding:8px;resize:vertical;margin:6px 0;background:#fff;color:var(--ink)}\nbutton.save.ghost{background:#fff;color:var(--ink);border:1px solid var(--line)}\n.small{font-size:12px;color:var(--muted);margin:6px 0;display:block}\n#timer{position:fixed;left:50%;bottom:14px;transform:translate(-50%,140%);width:min(92vw,420px);background:#273046;color:#fff;border-radius:18px;padding:10px 14px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 30px rgba(0,0,0,.25);transition:transform .3s,visibility .3s;z-index:20;visibility:hidden}\n#timer.on{transform:translate(-50%,0);visibility:visible}\n#timer .tc{flex:1;min-width:0}\n#timer .tl{font-size:11.5px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#timer .tt{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}\n#timer .tb{height:4px;background:rgba(255,255,255,.2);border-radius:4px;overflow:hidden;margin-top:4px}\n#timer .tb i{display:block;height:100%;background:#e0663a;width:0}\n#timer button{font:inherit;font-size:13px;border:0;border-radius:999px;padding:7px 11px;background:rgba(255,255,255,.15);color:#fff;cursor:pointer}\n.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px;margin:4px 0 10px}\n.stats div{background:#f6f3ee;border-radius:12px;padding:8px 10px}\n.stats b{display:block;font-size:18px}\n.stats span{font-size:11.5px;color:var(--muted);line-height:1.3;display:block}\n.cal .crow{display:grid;grid-template-columns:52px repeat(7,1fr) 22px;gap:4px;align-items:center;margin-bottom:4px}\n.cal .crow span{font-size:11px;color:var(--muted)}\n.cal .crow i{display:block;height:20px;border-radius:6px;background:#efebe4}\n.cal .crow i.we{background:transparent;border:1px dashed #ebe6dd}\n.cal .crow i.today{outline:2px solid #273046;outline-offset:1px}\n.cal .crow b{font-size:12px;text-align:right}\n.cal .crow.hd i{background:none;height:auto;font-style:normal;font-size:11px;color:var(--muted);text-align:center}\n.phbar{display:grid;grid-template-columns:repeat(9,1fr);gap:4px;margin:10px 0 2px}\n.phbar i{font-style:normal;font-size:11px;text-align:center;border-radius:6px;padding:4px 0;background:#efebe4;color:var(--muted)}\n.phbar i.p{background:#cfd5e3;color:#273046}\n.phbar i.c{background:#273046;color:#fff}\n.pday{margin-top:10px}\n.pdh{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.3px;color:var(--dc);margin-bottom:2px}\n.prow{display:flex;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid #f0ece5}\n.prow>div:first-child{flex:1;min-width:0}\n.prow b{font-size:13px;font-weight:600;display:block}\n.prow .small{margin:2px 0 0}\n.psp{width:90px;flex:none}\n.up{color:#3d8a55;font-weight:600}\n.notes{margin-top:4px}\n.foot{color:var(--muted);font-size:12px;text-align:center;margin-top:20px;line-height:1.5}\n";
const MARKUP = "<div class=\"wrap\">\n  <header class=\"hero\">\n    <h1>Mi plan de gimnasio</h1>\n    <p>5 d\u00edas \u00b7 1 hora \u00b7 Ganar m\u00fasculo y perder grasa, con prioridad al tren superior. Cada dibujo se mueve para que veas el movimiento completo.</p>\n    <div class=\"pills\">\n      <span class=\"pill\">Lunes a viernes</span><span class=\"pill\">~60 min/d\u00eda</span><span class=\"pill\">Nivel medio</span><span class=\"pill\">Cardio + core incluidos</span>\n    </div>\n  </header>\n\n  <nav class=\"tabs\" id=\"tabs\"></nav>\n  \n  <main id=\"day\"></main>\n\n  <section class=\"guide\">\n    <h2>C\u00f3mo usar el plan</h2>\n    <div class=\"gcard\">\n      <h4>Registro de pesos</h4>\n      En cada ejercicio apunta el <b>peso</b> y las <b>reps de cada serie</b> y pulsa Guardar. La pr\u00f3xima vez ver\u00e1s lo que hiciste y una recomendaci\u00f3n: <b>subir peso</b> solo cuando llegues al m\u00e1ximo de reps en todas las series, <b>mantener</b> y sumar reps si a\u00fan no, o <b>bajar un poco</b> si no llegas al m\u00ednimo. As\u00ed progresas sin pasarte.\n    </div>\n    <div class=\"gcard\">\n      <h4>C\u00f3mo elegir el peso: las \u00abreps en rec\u00e1mara\u00bb</h4>\n      Si pone <b>8\u201312</b>, elige un peso con el que acabes la serie sintiendo que podr\u00edas hacer <b>1\u20133 repeticiones m\u00e1s</b> con buena t\u00e9cnica. Si llegas a 12 en todas las series, sube un poco el peso la semana siguiente y vuelve a empezar desde 8. As\u00ed vas progresando sin estancarte.\n    </div>\n    <div class=\"gcard\">\n      <h4>Las primeras semanas (vuelves tras a\u00f1os parado)</h4>\n      <div class=\"weeks\">\n        <div class=\"wk\"><b>Semanas 1\u20132</b>Readaptaci\u00f3n: haz 1 serie menos por ejercicio y deja 3\u20134 reps en rec\u00e1mara. C\u00e9ntrate en la t\u00e9cnica. Las agujetas fuertes son normales al principio.</div>\n        <div class=\"wk\"><b>Semanas 3\u20138</b>El plan completo. Intenta subir reps o peso cada semana en los ejercicios principales y ap\u00fantalo en el m\u00f3vil.</div>\n        <div class=\"wk\"><b>Semana 9</b>Descarga: mismos ejercicios con la mitad de series. Luego repite el ciclo y cambia alguna variante si quieres.</div>\n      </div>\n    </div>\n    <div class=\"gcard\">\n      <h4>Para ganar m\u00fasculo y perder grasa a la vez</h4>\n      <ul>\n        <li><b>Prote\u00edna:</b> unos 1,6\u20132,2 g por kg de peso al d\u00eda (carne, pescado, huevos, l\u00e1cteos, legumbres).</li>\n        <li><b>Calor\u00edas:</b> come ligeramente por debajo de lo que gastas, sin dietas extremas. Si pierdes fuerza, come un poco m\u00e1s.</li>\n        <li><b>Sue\u00f1o:</b> 7\u20139 horas. El m\u00fasculo se construye descansando.</li>\n        <li><b>Pasos:</b> 8.000\u201310.000 al d\u00eda ayudan mucho a quemar grasa sin cansar las piernas.</li>\n      </ul>\n    </div>\n    <div class=\"gcard\">\n      <h4>Si vas con prisa o te sobra tiempo</h4>\n      <ul>\n        <li><b>Con prisa:</b> haz los 4 primeros ejercicios y el bloque de core o cardio. Son los m\u00e1s importantes.</li>\n        <li><b>Con tiempo extra:</b> el viernes tiene 15\u201320 min opcionales de el\u00edptica, y cualquier d\u00eda puedes alargar el cardio.</li>\n        <li><b>M\u00e1quina ocupada:</b> cambia la barra por mancuernas o por la m\u00e1quina equivalente; el m\u00fasculo trabajado es el mismo.</li>\n      </ul>\n    </div>\n    <p class=\"foot\">Si notas dolor en una articulaci\u00f3n (no cansancio muscular), para ese ejercicio y pide a un monitor que revise tu t\u00e9cnica.</p>\n  </section>\n</div>\n\n<div id=\"timer\"><div class=\"tc\"><div class=\"tl\">Descanso</div><div class=\"tt\">0:00</div><div class=\"tb\"><i></i></div></div><button id=\"tplus\">+15 s</button><button id=\"tstop\">\u2715</button></div>\n";

export function mountPau(host: HTMLElement, store: CoreStore): () => void {
const R = host.shadowRoot || host.attachShadow({ mode: 'open' });
R.innerHTML = '<style>' + CSS + '</style>' + MARKUP;
let alive = true;
// ---------- Static equipment helpers ----------
const flatBench = [['rect',48,118,92,6,3],['line',58,124,58,150,4],['line',130,124,130,150,4]];
const floorMat = [['rect',20,148,170,3,1,'#e2d6c3']];

// ---------- Plan data ----------
const DAYS=[
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

// pre-resolve
for(const d of DAYS) for(const e of d.ex){ if(!e.draw.f){ e.draw.RA=resolve(e.draw.A); e.draw.RB=resolve(e.draw.B);} }


// ---------- Store ----------
const keyOf=(d,i)=>`ex-${d.k}-${i}`;
const DOCKEYS=()=>{const k=['meta','sessions','body']; for(const d of DAYS) d.ex.forEach((e,i)=>k.push(keyOf(d,i))); return k;};
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
function logType(e){ if(/Cardio|Extra/.test(e.tag||'')) return 'none'; if(/Plancha/.test(e.name)) return 't'; if(/Dominadas|Fondos|colgado/.test(e.name)) return 'bw'; return 'w'; }
function range(e){ const m=e.reps.match(/(\d+)\s*[–-]\s*(\d+)/); return m?[+m[1],+m[2]]:[8,12]; }
function incText(e,kg){
  if(/Sentadilla|Peso muerto|Prensa|Hip thrust/.test(e.name)) return `Sube a <b>${fmt(kg+5)} kg</b>`;
  if(/mancuerna|polea|Elevaci|máquina|cuádriceps|gemelos|Face pull/i.test(e.name)) return `Sube al <b>siguiente peso</b> disponible (≈ +1–2,5 kg)`;
  return `Sube a <b>${fmt(kg+2.5)} kg</b>`;
}
const entries=key=>(store.get(key)&&Array.isArray(store.get(key).entries))?store.get(key).entries:[];
function suggestion(e,key){
  const en=entries(key), t=logType(e), [lo,hi]=range(e), ph=phase();
  if(ph&&ph.name==='Descarga'&&en.length) { const l=en[en.length-1]; return `<b>Semana de descarga:</b> ${t==='w'?`usa ${fmt(+l.kg||0)} kg y `:''}haz ${effSets(e)} series sin llegar al fallo.`; }
  if(!en.length) return t==='t' ? 'Primera vez: aguanta lo que puedas con buena forma y apúntalo.' : 'Primera vez: usa un peso con el que te sobren 3–4 reps. Apúntalo y aquí verás cuándo subir.';
  const last=en[en.length-1], reps=(last.reps||[]).filter(r=>r>0), kg=+last.kg||0;
  const allTop=reps.length>=Math.min(effSets(e),parseInt(e.sets)||1)&&reps.every(r=>r>=hi);
  const anyLow=reps.some(r=>r<lo);
  let s;
  if(t==='t') s= allTop? '¡Objetivo cumplido! Suma 10 s por serie o prueba levantando una pierna.' : 'Intenta sumar 5 s en alguna serie.';
  else if(t==='bw') s= allTop? `¡Llegaste a ${hi} en todas! Añade 2,5 kg de lastre (o quita algo de asistencia).` : anyLow? `Hasta llegar a ${lo} en todas, usa algo de asistencia.` : 'Repite y suma 1 rep en alguna serie.';
  else s= allTop? `¡${hi} reps en todas! ${incText(e,kg)} y vuelve a empezar desde ${lo} reps.` : anyLow? `Mantén ${fmt(kg)} kg (o baja un poco) hasta hacer al menos ${lo} reps en todas con buena técnica.` : `Repite con <b>${fmt(kg)} kg</b> e intenta sumar 1 rep en alguna serie.`;
  if(ph&&ph.name==='Readaptación'&&t!=='t') s+=' <i>Estás en readaptación: sin prisa por subir.</i>';
  return s;
}
function sparkSvg(vals,color,W=220,H=40){
  if(vals.length<2) return '';
  const mn=Math.min(...vals), mx=Math.max(...vals);
  const pts=vals.map((v,i)=>[6+i*(W-12)/(vals.length-1), H-6-(mx===mn?0.5:(v-mn)/(mx-mn))*(H-12)]);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none"><polyline points="${pts.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
}
const exVals=(e,key)=>entries(key).slice(-12).map(x=> logType(e)==='w'? (+x.kg||0) : (x.reps||[]).reduce((a,b)=>a+(+b||0),0)+(+x.kg||0));
function setsText(e,x){ const t=logType(e); const w= t==='w'? `${fmt(+x.kg||0)} kg · ` : (+x.kg? `+${fmt(+x.kg)} kg · `:''); return `${w}${(x.reps||[]).join(' / ')}${t==='t'?' s':''}`; }
function lastText(e,key){
  const en=entries(key); if(!en.length) return '<span style="color:var(--muted)">Aún sin registros.</span>';
  const l=en[en.length-1]; return `Última vez (${fdate(l.date)}): <b>${setsText(e,l)}</b>${logType(e)==='t'?'':' reps'}`;
}
function histHTML(e,key,color){
  const en=entries(key); if(!en.length) return '';
  const rows=en.slice().reverse().slice(0,12).map(x=>`<div class="hrow"><span>${fdate(x.date)}</span><span>${setsText(e,x)}</span><button data-del="${x.date}" title="Borrar">✕</button></div>`).join('');
  return `<details class="hist"><summary>Historial y progreso (${en.length})</summary>${sparkSvg(exVals(e,key),color)}${rows}</details>`;
}
function logBlock(e,key){
  const t=logType(e); if(t==='none') return '';
  const n=parseInt(e.sets)||3;
  let inputs='';
  if(t!=='t') inputs+=`<label>${t==='bw'?'kg extra':'Peso kg'}<input class="kg" type="number" inputmode="decimal" step="0.5" min="0"></label>`;
  for(let i=0;i<n;i++) inputs+=`<label>S${i+1} ${t==='t'?'seg':'reps'}<input class="rp" type="number" inputmode="numeric" min="0"></label>`;
  return `<div class="log" data-key="${key}"><h5>Registro</h5><div class="logsum"></div><div class="sug"></div>
    <div class="inrow">${inputs}<button class="save">Guardar</button></div><div class="msg"></div><div class="histbox"></div></div>`;
}
function refreshLog(box,e,color,prefill){
  const key=box.dataset.key;
  box.querySelector('.logsum').innerHTML=lastText(e,key);
  box.querySelector('.sug').innerHTML=suggestion(e,key);
  const hb=box.querySelector('.histbox'); const open=hb.querySelector('details')?.open;
  hb.innerHTML=histHTML(e,key,color); if(open) hb.querySelector('details').open=true;
  hb.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{ persist(key,{entries:entries(key).filter(x=>x.date!==b.dataset.del)}); });
  if(!prefill) return;
  const en=entries(key), [lo,hi]=range(e);
  if(en.length){
    const l=en[en.length-1]; const kgI=box.querySelector('.kg');
    if(kgI && !kgI.value && +l.kg) kgI.value=+l.kg;
    box.querySelectorAll('.rp').forEach((inp,i)=>{ inp.placeholder=(l.reps||[])[i]??''; });
  } else box.querySelectorAll('.rp').forEach(inp=>inp.placeholder=logType(e)==='t'?lo:`${lo}-${hi}`);
}

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
function startTimer(sec,label){
  if(!sec) return; audioUnlock(); tTot=sec; tEnd=Date.now()+sec*1000;
  const el=R.getElementById('timer'); el.classList.add('on'); el.querySelector('.tl').textContent=label||'Descanso';
  clearInterval(tInt); tInt=setInterval(tick,250); tick();
}
function tick(){
  const el=R.getElementById('timer'); const left=Math.ceil((tEnd-Date.now())/1000);
  if(left<=0){ clearInterval(tInt); el.querySelector('.tt').textContent='¡Siguiente serie!'; el.querySelector('.tb i').style.width='100%'; beep(); setTimeout(()=>{ if(Date.now()>=tEnd) el.classList.remove('on'); },4000); return; }
  el.querySelector('.tt').textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;
  el.querySelector('.tb i').style.width=(100*(1-left/tTot)).toFixed(1)+'%';
}

// ---------- UI ----------
const tabsEl=R.getElementById('tabs'), dayEl=R.getElementById('day');
const PROG=DAYS.length; let cur=0, figs=[];
const slug=n=>n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function buildTabs(){
  tabsEl.innerHTML=DAYS.map((d,i)=>`<button class="tab${i===cur?' on':''}" style="--dc:${d.color}" data-i="${i}"><b>${d.name.slice(0,3)}</b><span>${d.short||d.title}</span></button>`).join('')
   +`<button class="tab${cur===PROG?' on':''}" style="--dc:#273046" data-i="${PROG}"><b>📈</b><span>Progreso</span></button>`;
  tabsEl.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{cur=+b.dataset.i;show();window.scrollTo({top:Math.min(window.scrollY,tabsEl.offsetTop),behavior:'smooth'});});
}
function phaseText(){ const ph=phase(); return ph? `Semana ${ph.wk} de 9 · ${ph.name}` : 'Semana 1 empieza al guardar tu primer registro'; }
function show(){
  buildTabs(); figs=[];
  if(cur===PROG) return showProgress();
  const d=DAYS[cur];
  dayEl.style.setProperty('--dc',d.color); dayEl.style.setProperty('--soft',d.soft);
  let h=`<div class="dayhead"><h2>${d.name} · ${d.title}</h2><p>${d.sub}</p><div class="meta"><span>${d.time}</span><span>${d.ex.length} ejercicios</span><span class="phasepill">${phaseText()}</span></div><p class="phtip"></p></div>
  <div class="warm"><b>Calentamiento (5–7 min):</b> 5 min de bici o elíptica suave, movilidad de hombros y caderas, y 1–2 series ligeras del primer ejercicio.</div>`;
  d.ex.forEach((e,i)=>{
    const id=`${d.k}-${i}`, rs=parseRest(e.rest);
    h+=`<article class="ex" data-id="${id}">
      <div class="fig"><div class="num">${i+1}</div><div class="svgbox" data-i="${i}"></div></div>
      <div class="info">${e.tag?`<div class="tag">${e.tag}</div>`:''}<h3>${e.name}</h3>
        <div class="sr"><span class="setsch" data-i="${i}">${e.sets} × ${e.reps}</span>${rs?`<button class="tbtn" data-rest="${rs}">⏱ Descanso ${e.rest}</button>`:`<span class="r">Descanso ${e.rest}</span>`}</div>
        <div class="mus">${e.mus}</div>
        <ul>${e.tips.map(t=>`<li>${t}</li>`).join('')}</ul>
        <label class="done"><input type="checkbox"> Hecho hoy</label>
        ${logBlock(e,keyOf(d,i))}
      </div></article>`;
  });
  h+=`<div class="gcard notes"><h4>Notas de hoy</h4><textarea id="note" rows="3" placeholder="Cómo te has sentido, molestias, máquina ocupada…"></textarea><div class="msg" id="notemsg"></div></div>
  <button class="reset" id="reset">Desmarcar los ejercicios de hoy</button>`;
  dayEl.innerHTML=h;
  dayEl.querySelectorAll('.ex').forEach(a=>{
    const cb=a.querySelector('.done input');
    cb.onchange=()=>setDone(a.dataset.id,cb.checked);
    const rest=a.querySelector('.tbtn'); if(rest) rest.onclick=()=>startTimer(+rest.dataset.rest, a.querySelector('h3').textContent);
    a.querySelectorAll('.rp').forEach(inp=>inp.addEventListener('change',()=>{ if(inp.value&&rest) startTimer(+rest.dataset.rest,a.querySelector('h3').textContent); }));
  });
  const note=R.getElementById('note');
  note.onchange=()=>{ updateToday(c=>{c.note=note.value.trim()}); R.getElementById('notemsg').textContent='Nota guardada ✓'; };
  R.getElementById('reset').onclick=()=>updateToday(c=>{c.done=c.done.filter(x=>!x.startsWith(d.k+'-'))});
  wireLogs();
  figs=[...dayEl.querySelectorAll('.svgbox')].map(el=>({el,ex:d.ex[+el.dataset.i]}));
  if(undefined!=null){ figs.forEach(f=>f.el.innerHTML=render(f.ex,undefined,d.color)); }
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
  dayEl.querySelectorAll('.log').forEach(box=>{ const i=+box.dataset.key.split('-')[2]; refreshLog(box,d.ex[i],d.color,prefill); });
}
function wireLogs(){
  const d=DAYS[cur];
  dayEl.querySelectorAll('.log').forEach(box=>{
    const key=box.dataset.key, i=+key.split('-')[2];
    box.querySelector('.save').onclick=()=>{
      const kgI=box.querySelector('.kg'); const kg=kgI?(parseFloat((kgI.value||'').replace(',','.'))||0):0;
      const reps=[...box.querySelectorAll('.rp')].map(x=>parseInt(x.value)).filter(x=>x>0);
      const msg=box.querySelector('.msg');
      if(!reps.length){ msg.textContent='Apunta las reps de al menos una serie.'; return; }
      ensureStart();
      const en=entries(key).filter(x=>x.date!==today()); en.push({date:today(),kg,reps});
      persist(key,{entries:en.slice(-80)});
      setDone(`${d.k}-${i}`,true);
      box.querySelectorAll('.rp').forEach(x=>x.value='');
      refreshLog(box,d.ex[i],d.color,true);
      msg.textContent='Guardado ✓'; setTimeout(()=>{msg.textContent=''},2500);
    };
  });
}

// ---------- Progress view ----------
function showProgress(){
  dayEl.style.setProperty('--dc','#273046'); dayEl.style.setProperty('--soft','#e4e7ef');
  dayEl.innerHTML=`<div class="dayhead"><h2>Mi progreso</h2><p>Tu constancia, tu peso corporal y cómo suben tus marcas.</p></div>
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
  const colorOf=s=>{const id=(s&&s.done||[])[0]; const d=id&&DAYS.find(x=>x.k===id.split('-')[0]); return d?d.color:'#273046';};
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
  R.getElementById('pCal').innerHTML=`<div class="stats"><div><b>${weekCounts[weekCounts.length-1]}/5</b><span>esta semana</span></div><div><b>${total}</b><span>sesiones en total</span></div><div><b>${streak}</b><span>semanas seguidas con 4+ días</span></div></div>
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
  // exercises
  let ex='';
  for(const d of DAYS){
    const items=d.ex.map((e,i)=>({e,i,key:keyOf(d,i)})).filter(o=>logType(o.e)!=='none');
    const nrec=items.filter(o=>entries(o.key).length).length;
    ex+=`<div class="pday" style="--dc:${d.color}"><div class="pdh">${d.name} · ${d.title}</div>${nrec?'':'<span class="small">Sin registros todavía.</span>'}`;
    for(const {e,key} of items){
      const en=entries(key);
      if(!en.length) continue;
      const l=en[en.length-1], f=en[0], t=logType(e);
      const best= t==='w'? Math.max(...en.map(x=>+x.kg||0)) : null;
      const delta= t==='w'? (+l.kg||0)-(+f.kg||0) : null;
      ex+=`<div class="prow"><div><b>${e.name}</b><span class="small">${fdate(l.date)}: ${setsText(e,l)}${best!=null?` · récord ${fmt(best)} kg`:''}${delta?` · <span class="up">${delta>0?'+':''}${fmt(delta)} kg desde el inicio</span>`:''}</span></div><div class="psp">${sparkSvg(exVals(e,key),d.color,90,30)}</div></div>`;
    }
    ex+='</div>';
  }
  R.getElementById('pEx').innerHTML=ex;
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
R.getElementById('tstop').onclick=()=>{clearInterval(tInt);R.getElementById('timer').classList.remove('on');};
const unsubStore=store.subscribe(()=>{ if(alive) rerender(); });
{ const wd=new Date().getDay(); if(wd>=1&&wd<=5) cur=wd-1; }
show(); requestAnimationFrame(loop);

return () => { alive = false; clearInterval(tInt); unsubStore(); R.innerHTML = ''; };
}
