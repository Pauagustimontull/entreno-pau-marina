// @ts-nocheck
// Plan de Marina: correr de 0 a 7-8 km, rutinas en casa guiadas, comida y progreso.
// Código portado de la primera versión (web independiente). Se monta dentro de un Shadow DOM.
import { L, rad, V, add, sub, mul, len, lerp, lerpV, dirV, ik, resolve, mix, P, ln, circ, limb, legSvg, refPt, drawProp, render } from './engine';
import type { CoreStore } from './store';

const CSS = "\n:host{display:block;\n  --bg:#fdf3f6; --card:#ffffff; --ink:#3b2632; --muted:#8a6f7c; --line:#f3dce5;\n  --pink:#f2a7bf; --pink-d:#d9718f; --pink-s:#fde4ec;\n  --body:#5a3247; --far:#d8b3c4; --equip:#e6cdd6; --equip-dark:#b991a3;\n  --dc:#d9718f; --soft:#fde4ec;\n}\n*{box-sizing:border-box}\n:host{color:var(--ink);font-family:Poppins,system-ui,sans-serif;-webkit-font-smoothing:antialiased}\n.wrap{max-width:760px;margin:0 auto;padding:0 14px 90px}\nheader.hero{padding:24px 4px 6px}\n.hero h1{font-size:25px;line-height:1.15;margin:0 0 6px;font-weight:700;letter-spacing:-.3px}\n.hero h1 span{color:var(--pink-d)}\n.hero p{margin:0;color:var(--muted);font-size:13.5px;line-height:1.5}\nnav.tabs{position:sticky;top:var(--top-offset,0px);z-index:5;background:var(--bg);padding:10px 0;display:grid;grid-template-columns:repeat(5,1fr);gap:6px}\n.tab{min-width:0;border:1px solid var(--line);background:#fff;border-radius:14px;padding:7px 2px;text-align:center;cursor:pointer;font-family:inherit;color:var(--ink)}\n.tab b{display:block;font-size:17px;line-height:1.2}\n.tab span{display:block;font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.tab.on{background:var(--pink-d);border-color:var(--pink-d);color:#fff}\n.tab.on span{color:rgba(255,255,255,.9)}\n.status{font-size:12px;color:var(--muted);text-align:center;margin:0 0 8px}\n.head{border-radius:22px;padding:18px;color:#fff;margin:4px 0 12px;background:linear-gradient(135deg,var(--dc),var(--pink))}\n.head h2{margin:0;font-size:21px;font-weight:700}\n.head p{margin:5px 0 0;font-size:13.5px;opacity:.95;line-height:1.45}\n.head .meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}\n.head .meta span{background:rgba(255,255,255,.25);border-radius:999px;padding:3px 10px;font-size:12px}\n.chips{display:flex;gap:6px;margin:2px 0 12px}\n.chip{flex:1;border:1px solid var(--line);background:#fff;border-radius:12px;padding:6px 0 5px;font:inherit;font-size:13px;font-weight:600;color:var(--ink);cursor:pointer;position:relative}\n.chip small{display:block;font-size:13px;line-height:1.1;margin-top:1px}\n.chip.on{background:var(--ink);color:#fff;border-color:var(--ink)}\n.chip.today::after{content:\"\";position:absolute;top:4px;right:5px;width:6px;height:6px;border-radius:50%;background:var(--pink-d)}\n.card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px 16px;margin-bottom:12px;font-size:13.5px;line-height:1.55}\n.card h3{margin:0 0 4px;font-size:16.5px;font-weight:600;line-height:1.25}\n.card h4{margin:0 0 6px;font-size:14.5px;font-weight:600}\n.card ul{margin:4px 0;padding-left:18px}\n.card li{margin:3px 0}\n.kicker{font-size:11px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;color:var(--pink-d);margin-bottom:2px}\n.row{display:flex;gap:12px;align-items:center}\n.ico{width:46px;height:46px;flex:none;border-radius:14px;background:var(--pink-s);display:flex;align-items:center;justify-content:center;font-size:22px}\n.muted{color:var(--muted)}\n.small{font-size:12px;color:var(--muted);margin:6px 0;display:block;line-height:1.45}\n.btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}\n.btn{background:var(--pink-d);color:#fff;border:0;border-radius:999px;padding:10px 16px;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer}\n.btn.ghost{background:#fff;color:var(--ink);border:1px solid var(--line)}\n.btn.sm{padding:7px 12px;font-size:12.5px}\n.donechk{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:13px;color:var(--muted);cursor:pointer;user-select:none}\n.donechk input{width:19px;height:19px;accent-color:var(--pink-d)}\n.card.isdone{opacity:.6}\n.badge{display:inline-block;font-size:11.5px;font-weight:600;border-radius:999px;padding:2px 9px;background:var(--pink-s);color:var(--pink-d);margin-left:4px;vertical-align:middle}\n.thumbs{display:flex;gap:6px;overflow-x:auto;margin-top:10px;padding-bottom:4px;scrollbar-width:none}\n.thumbs::-webkit-scrollbar{display:none}\n.thumbs div{flex:none;width:76px;background:#fbf4f7;border-radius:12px;padding:2px;text-align:center;font-size:9.5px;line-height:1.2;color:var(--muted)}\n.thumbs svg{width:100%;height:auto;display:block}\n.ex{background:var(--card);border-radius:20px;border:1px solid var(--line);margin-bottom:12px;overflow:hidden;display:grid;grid-template-columns:150px 1fr}\n@media (max-width:520px){.ex{grid-template-columns:1fr}}\n.fig{background:linear-gradient(180deg,#fff9fb,#fbeef3);display:flex;align-items:center;justify-content:center;min-height:130px;position:relative}\n.fig svg{width:100%;max-width:210px;height:auto;display:block}\n.num{position:absolute;top:10px;left:10px;width:26px;height:26px;border-radius:50%;background:var(--dc);color:#fff;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center}\n.info{padding:12px 16px 14px}\n.info h3{margin:0 0 6px;font-size:16px;font-weight:600}\n.sr{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px}\n.sr span{font-size:12.5px;border-radius:8px;padding:3px 8px;background:var(--soft);font-weight:500}\n.sr span.r{background:#f6eef1;color:var(--muted);font-weight:400}\n.mus{font-size:12px;color:var(--muted);margin-bottom:4px}\n.info ul{margin:0;padding-left:18px;font-size:13px;line-height:1.5}\n.easy{font-size:12.5px;background:#f6eef1;border-radius:10px;padding:6px 10px;margin-top:8px}\n.rsel{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px}\n.rsel button{border:1px solid var(--line);background:#fff;border-radius:14px;padding:8px 4px;font:inherit;font-size:12px;cursor:pointer;color:var(--ink);line-height:1.25}\n.rsel button b{display:block;font-size:15px}\n.rsel button.on{background:var(--dc);color:#fff;border-color:var(--dc)}\n.weeks{display:flex;flex-direction:column;gap:8px}\n.wk{border:1px solid var(--line);border-radius:16px;padding:10px 12px;background:#fff}\n.wk.cur{border-color:var(--pink-d);box-shadow:0 0 0 2px var(--pink-s)}\n.wk h4{margin:0 0 4px;font-size:13.5px;display:flex;justify-content:space-between}\n.ses{display:flex;align-items:center;gap:8px;font-size:12.5px;padding:4px 0;border-top:1px dashed #f3e3ea}\n.ses:first-of-type{border-top:0}\n.ses .st{width:20px;height:20px;border-radius:50%;flex:none;border:2px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff}\n.ses .st.ok{background:var(--pink-d);border-color:var(--pink-d)}\n.ses .st.sk{background:#e5d5dc;border-color:#e5d5dc}\n.ses .tx{flex:1}\n.ses button{border:0;background:var(--pink-s);color:var(--pink-d);font:inherit;font-size:12px;font-weight:600;border-radius:999px;padding:4px 10px;cursor:pointer}\n.inrow{display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end}\n.inrow label{display:flex;flex-direction:column;font-size:10.5px;color:var(--muted);gap:2px}\n.inrow input,.inrow select{width:70px;font:inherit;font-size:16px;padding:6px 4px;border:1px solid var(--line);border-radius:8px;text-align:center;background:#fff;color:var(--ink)}\n.inrow select{width:auto;padding:6px 8px}\ntextarea{width:100%;font:inherit;font-size:16px;border:1px solid var(--line);border-radius:10px;padding:8px;resize:vertical;margin:6px 0;background:#fff;color:var(--ink)}\n.msg{font-size:12px;color:var(--muted);min-height:16px;margin-top:4px}\n.hrow{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid #f6e8ee;font-size:12.5px}\n.hrow button{border:0;background:none;color:#c4a9b5;cursor:pointer;font-size:13px}\n.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:8px;margin:4px 0 10px}\n.stats div{background:#fbf1f5;border-radius:12px;padding:8px 10px}\n.stats b{display:block;font-size:18px}\n.stats span{font-size:11.5px;color:var(--muted);line-height:1.3;display:block}\n.cal .crow{display:grid;grid-template-columns:50px repeat(7,1fr);gap:4px;align-items:center;margin-bottom:4px}\n.cal .crow span{font-size:11px;color:var(--muted)}\n.cal .crow i{display:flex;height:22px;border-radius:7px;background:#f6ebf0;align-items:center;justify-content:center;font-style:normal;font-size:11px}\n.cal .crow i.today{outline:2px solid var(--ink);outline-offset:1px}\n.cal .crow.hd i{background:none;height:auto;color:var(--muted)}\n.legend{display:flex;gap:10px;flex-wrap:wrap;font-size:11.5px;color:var(--muted);margin-top:6px}\n.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}\n.spark{display:block;margin:4px 0}\n.mgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}\n.mbox{background:#fbf1f5;border-radius:12px;padding:8px 10px}\n.mbox b{font-size:16px}\n.mbox span{display:block;font-size:11.5px;color:var(--muted)}\n.plate{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:8px 0}\n.plate div{border-radius:14px;padding:10px;font-size:12.5px;line-height:1.4}\n.plate b{display:block;font-size:13px;margin-bottom:2px}\ndetails.cfg{background:#fff;border:1px solid var(--line);border-radius:16px;padding:10px 14px;margin-bottom:12px;font-size:13px}\ndetails.cfg summary{cursor:pointer;font-weight:600}\n.daypick{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin:6px 0}\n.daypick button{border:1px solid var(--line);background:#fff;border-radius:10px;padding:7px 0;font:inherit;font-size:12.5px;cursor:pointer;color:var(--ink)}\n.daypick button.on{background:#f0a35e;border-color:#f0a35e;color:#fff}\n.daypick.m button.on{background:var(--ink);border-color:var(--ink)}\n.wkplan .hrow{align-items:center}\n.wkplan .hrow b{min-width:78px;font-weight:600}\n.wkplan .hrow span{flex:1;text-align:right}\n/* player */\n#player{position:fixed;inset:0;z-index:50;background:linear-gradient(180deg,#fff,#fdeef4);display:none;flex-direction:column;align-items:center;justify-content:center;padding:20px;text-align:center}\n#player.on{display:flex}\n#player .pk{font-size:13px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--pink-d)}\n#player .pn{font-size:24px;font-weight:700;margin:4px 0 2px;line-height:1.2}\n#player .ps{font-size:13.5px;color:var(--muted);min-height:20px}\n#player .pfig{width:min(78vw,330px);margin:6px 0}\n#player .pfig svg{width:100%;height:auto}\n#player .pt{font-size:68px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1}\n#player .pbar{width:min(80vw,340px);height:8px;background:#f6dde7;border-radius:8px;overflow:hidden;margin:12px 0 6px}\n#player .pbar i{display:block;height:100%;background:var(--pink-d);width:0}\n#player .pnext{font-size:13px;color:var(--muted);min-height:20px}\n#player .pctl{display:flex;gap:10px;margin-top:16px}\n#player.rest .pt{color:#8fb6a0}\n#player.run{background:linear-gradient(180deg,#fff,#ffe3ec)}\n#player.walk{background:linear-gradient(180deg,#fff,#e6f3ec)}\n.big{font-size:44px;font-weight:700;letter-spacing:1px}\n\n.pgps{font-size:13.5px;color:var(--ink);min-height:20px;margin-top:4px}\n.pgps:empty{display:none}\n.fbk{display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap}\n.fbk button{font:inherit;font-size:14px;border:1px solid var(--line);background:#fff;border-radius:999px;padding:10px 14px;cursor:pointer;color:var(--ink)}\n.fbmsg{font-size:14px;color:var(--ink);font-weight:600;max-width:320px;margin:8px auto 0;line-height:1.4}\n.wkbanner{position:relative;background:linear-gradient(120deg,#fff,#fff3f7)}\n.wkx{position:absolute;top:10px;right:10px;border:0;background:#f6eaf0;border-radius:50%;width:26px;height:26px;cursor:pointer;color:var(--muted)}\n.stats .sb{font-size:16px}\n";
const MARKUP = "<div class=\"wrap\">\n  <header class=\"hero\">\n    <h1>Mi plan <span>\u2661</span></h1>\n    <p>Correr de cero a 7\u20138 km, rutinas en casa y comida para perder grasa sin perder energ\u00eda para el baloncesto.</p>\n  </header>\n  <nav class=\"tabs\" id=\"tabs\"></nav>\n  \n  <main id=\"view\"></main>\n</div>\n<div id=\"player\">\n  <div class=\"pk\" id=\"pk\"></div>\n  <div class=\"pn\" id=\"pn\"></div>\n  <div class=\"ps\" id=\"ps\"></div>\n  <div class=\"pfig\" id=\"pfig\"></div>\n  <div class=\"pt\" id=\"pt\">0:00</div>\n  <div class=\"pbar\"><i id=\"pbar\"></i></div>\n  <div class=\"pnext\" id=\"pnext\"></div>\n  <div class=\"pgps\" id=\"pgps\"></div>\n  <div class=\"pctl\"><button class=\"btn ghost\" id=\"ppause\">Pausa</button><button class=\"btn ghost\" id=\"pskip\">Saltar \u203a</button><button class=\"btn ghost\" id=\"pexit\">Salir</button></div>\n</div>\n";

export function mountMarina(host: HTMLElement, store: CoreStore): () => void {
const R = host.shadowRoot || host.attachShadow({ mode: 'open' });
R.innerHTML = '<style>' + CSS + '</style>' + MARKUP;
let alive = true;
const renderH=(ex,p,c)=>render(ex,p,c,{hair:true});
// ---------- Equipment ----------
const MAT=[['rect',14,148,176,3,1,'#f1d6e0']];
const CHAIR=[['rect',48,112,42,5,2],['line',52,117,52,150,4],['line',86,117,86,150,4],['line',50,114,50,66,5]];

// ---------- Exercises ----------
const EX={
 sentadilla:{name:'Sentadilla',mus:'Piernas y glúteos',tips:['Pies al ancho de caderas, puntas un poco abiertas.','Baja llevando la cadera atrás, como para sentarte.','Sube apretando glúteos. Peso en los talones.'],
  draw:{A:{hip:[98,91],t:-90,hn:'hang',fn:[104,148]},B:{hip:[80,120],t:-55,hn:[136,86],ed:90,fn:[104,148]}}},
 zancada:{name:'Zancada hacia atrás alterna',mus:'Piernas, glúteos y caderas',tips:['Da un paso largo hacia atrás y baja la rodilla de atrás.','La rodilla de delante no pasa de la punta del pie.','Alterna piernas. Manos en la cintura.'],
  draw:{A:{hip:[100,91],t:-90,hn:{hip:[5,-3]},ed:180,fn:[106,148],ff:[100,148]},B:{hip:[90,118],t:-88,hn:{hip:[5,-3]},ed:180,fn:[106,148],ff:[60,146],kdf:90,ftf:60}}},
 puente:{name:'Puente de glúteo',mus:'Glúteos, caderas y parte de atrás del muslo',tips:['Tumbada boca arriba, rodillas dobladas y pies apoyados.','Sube la cadera apretando glúteos hasta quedar recta.','Aguanta 1 segundo arriba y baja despacio.'],
  draw:{A:{hip:[100,143],t:180,hn:[92,148],ed:-90,fn:[132,148],kd:-90},B:{hip:[104,122],t:155,hn:[92,148],ed:-90,fn:[132,148],kd:-90},back:MAT}},
 patada:{name:'Patada de glúteo a cuatro patas',side:true,mus:'Glúteos y caderas',tips:['Manos bajo los hombros, rodillas bajo la cadera.','Sube una pierna doblada hacia el techo, sin arquear la espalda.','Mitad del tiempo con cada pierna.'],
  draw:{A:{hip:[110,106],t:180,hn:[70,148],hf:[66,148],ed:180,fn:[140,147],ff:[136,147],kd:90,kdf:90},B:{hip:[110,106],t:180,hn:[70,148],hf:[66,148],ed:180,fn:[140,80],ff:[136,147],kd:45,kdf:90,ftn:-90},back:MAT}},
 abductor:{name:'Elevación lateral de pierna tumbada',side:true,mus:'Caderas y glúteo lateral',tips:['Tumbada de lado, cuerpo en línea recta.','Sube la pierna de arriba sin girar la cadera.','Mitad del tiempo con cada lado.'],
  draw:{A:{hip:[104,140],t:180,hn:[86,147],ed:-90,hf:[50,128],edf:-90,fn:[160,140],ff:[160,145],kd:-90},B:{hip:[104,140],t:180,hn:[86,147],ed:-90,hf:[50,128],edf:-90,fn:[150,104],ff:[160,145],kd:-90},back:MAT}},
 sumo:{name:'Sentadilla sumo',mus:'Interior del muslo y glúteos',tips:['Piernas muy abiertas, puntas hacia fuera.','Baja recta, con las rodillas hacia fuera.','Manos juntas delante del pecho.'],
  draw:{A:{front:true,hip:[100,93],hn:[104,74],ed:90,fn:[126,148]},B:{front:true,hip:[100,114],hn:[104,94],ed:90,fn:[126,148]}}},
 pared:{name:'Sentadilla isométrica en la pared',mus:'Muslos y glúteos',tips:['Espalda pegada a la pared.','Baja hasta que las rodillas formen 90°.','Aguanta respirando normal.'],
  draw:{A:{hip:[90,118],t:-90,hn:[106,96],hf:[102,98],ed:90,fn:[120,148],kd:-45},B:{hip:[90,117],t:-90,hn:[106,95],hf:[102,97],ed:90,fn:[120,148],kd:-45},back:[['rect',76,8,6,142,1]]}},
 flexion:{name:'Flexiones con rodillas apoyadas',mus:'Pecho, brazos y hombros',tips:['Rodillas en el suelo, cuerpo recto de rodillas a cabeza.','Baja el pecho entre las manos.','Si cuesta, hazlas apoyando las manos en la pared o en el sofá.'],
  draw:{A:{hip:[110,124],t:-153,hn:[74,148],ed:-60,fn:[150,126],kd:90},B:{hip:[110,136],t:-172,hn:[74,148],ed:-60,fn:[150,122],kd:90},back:MAT}},
 fondos:{name:'Fondos de tríceps en una silla',mus:'Parte de atrás del brazo (tríceps)',tips:['Manos en el borde de una silla estable, dedos hacia delante.','Baja doblando los codos hacia atrás.','Cuanto más cerca tengas los pies, más fácil.'],
  draw:{A:{hip:[97,110],t:-97,hn:[88,111],ed:180,fn:[138,148],kd:-90},B:{hip:[97,132],t:-97,hn:[88,111],ed:180,fn:[138,148],kd:-90},back:CHAIR}},
 remo:{name:'Remo con mochila o botellas',mus:'Espalda y brazos, mejora la postura',tips:['Inclínate hacia delante con la espalda recta.','Tira de los codos hacia atrás pegados al cuerpo.','Usa botellas de agua o una mochila con libros.'],
  draw:{A:{hip:[92,90],t:-35,hn:'hang',fn:[102,148]},B:{hip:[92,90],t:-35,hn:[112,96],ed:-135,fn:[102,148]},front:[['bottle','hn']]}},
 pressh:{name:'Press de hombros con botellas',mus:'Hombros y brazos',tips:['Botellas a la altura de las orejas.','Empuja hacia arriba sin arquear la espalda.','Baja despacio.'],
  draw:{A:{hip:[96,91],t:-90,hn:[108,58],ed:90,fn:[100,148]},B:{hip:[96,91],t:-90,hn:[101,16],ed:90,fn:[100,148]},front:[['bottle','hn']]}},
 laterales:{name:'Elevaciones laterales con botellas',mus:'Hombros (da forma a la parte de arriba)',tips:['Sube los brazos hacia los lados hasta los hombros.','Codos un poco doblados.','Baja lento.'],
  draw:{A:{front:true,hip:[100,91],hn:[118,96],ed:0,fn:[110,148]},B:{front:true,hip:[100,91],hn:[152,58],ed:-90,fn:[110,148]},front:[['bottle','hn'],['bottle','hf']]}},
 curl:{name:'Curl de bíceps con botellas',mus:'Parte de delante del brazo (bíceps)',tips:['Codos pegados al cuerpo.','Sube sin balancearte.','Baja despacio.'],
  draw:{A:{hip:[98,91],t:-90,hn:[102,94],ed:180,fn:[100,148]},B:{hip:[98,91],t:-90,hn:[108,58],ed:180,fn:[100,148]},front:[['bottle','hn']]}},
 superman:{name:'Superman',mus:'Espalda y postura (hombros atrás)',tips:['Boca abajo, brazos estirados delante.','Sube brazos y piernas a la vez unos centímetros.','Mira al suelo. Ayuda a llevar los hombros atrás.'],
  draw:{A:{hip:[112,143],t:180,hn:[30,146],ed:-90,fn:[168,146],kd:90},B:{hip:[112,143],t:187,hn:[32,126],ed:-90,fn:[166,132],kd:90},back:MAT}},
 plancha:{name:'Plancha',mus:'Abdomen y zona media',tips:['Antebrazos en el suelo, cuerpo recto.','Aprieta glúteos y abdomen.','Si cuesta, apoya las rodillas.'],
  draw:{A:{hip:[106,129],t:184,hn:[42,148],ed:90,fn:[158,148],kd:-90,ftn:100},B:{hip:[106,127],t:183,hn:[42,148],ed:90,fn:[158,148],kd:-90,ftn:100},back:MAT}},
 jacks:{name:'Saltos de tijera (jumping jacks)',mus:'Cardio, todo el cuerpo',tips:['Salta abriendo piernas y subiendo los brazos.','Aterriza suave, sobre la parte delantera del pie.','Sin saltos: abre una pierna cada vez.'],
  draw:{A:{front:true,hip:[100,91],hn:[116,96],ed:0,fn:[106,148]},B:{front:true,hip:[100,88],hn:[126,18],ed:0,fn:[126,146]},dur:1.0}},
 escalador:{name:'Escaladores',mus:'Cardio y abdomen',tips:['Manos bajo los hombros, cuerpo recto.','Lleva las rodillas al pecho alternando, rápido.','Más lento si te cuesta mantener la postura.'],
  draw:{A:{hip:[110,118],t:-162,hn:[74,148],ed:180,fn:[118,142],ff:[156,147],kd:180,kdf:180},B:{hip:[110,118],t:-162,hn:[74,148],ed:180,fn:[156,147],ff:[118,142],kd:180,kdf:180},back:MAT,dur:1.0}},
 piernas:{name:'Elevación de piernas tumbada',mus:'Abdomen bajo',tips:['Boca arriba, manos bajo los glúteos.','Sube las piernas juntas hasta la vertical.','Baja sin tocar el suelo. Si cuesta, dobla un poco las rodillas.'],
  draw:{A:{hip:[110,143],t:180,hn:[96,148],ed:-90,fn:[166,141],kd:-90},B:{hip:[110,143],t:180,hn:[96,148],ed:-90,fn:[116,87],kd:-90},back:MAT}},
 inverso:{name:'Crunch inverso',mus:'Abdomen bajo',tips:['Rodillas dobladas en el aire.','Lleva las rodillas al pecho despegando un poco la cadera.','Baja controlando, sin impulso.'],
  draw:{A:{hip:[110,143],t:180,hn:[96,148],ed:-90,fn:[138,114],kd:-135},B:{hip:[106,134],t:168,hn:[96,148],ed:-90,fn:[112,98],kd:-150},back:MAT}},
 deadbug:{name:'Dead bug (bicho muerto)',mus:'Abdomen profundo y bajo',tips:['Brazos al techo y rodillas a 90°.','Estira a la vez un brazo atrás y la pierna contraria.','Zona lumbar pegada al suelo todo el rato.'],
  draw:{A:{hip:[110,143],t:180,hn:[72,104],ed:180,hf:[34,140],edf:180,fn:[138,114],kd:-135,ff:[164,138],kdf:-135},B:{hip:[110,143],t:180,hn:[34,140],ed:180,hf:[72,104],edf:180,fn:[164,138],kd:-135,ff:[138,114],kdf:-135},back:MAT}},
 bici:{name:'Bicicleta abdominal',mus:'Abdomen y oblicuos',tips:['Manos detrás de la cabeza sin tirar del cuello.','Codo hacia la rodilla contraria, alternando.','Despacio y controlado.'],
  draw:{A:{hip:[112,143],t:198,hn:{tl:[10,6]},ed:-90,fn:[120,114],kd:-135,ff:[166,128],kdf:-135},B:{hip:[112,143],t:202,hn:{tl:[10,6]},ed:-90,fn:[166,128],kd:-135,ff:[120,114],kdf:-135},back:MAT}},
 salto:{name:'Sentadilla con salto',mus:'Piernas y cardio',tips:['Baja a sentadilla y salta hacia arriba.','Aterriza suave y baja directamente a la siguiente.','Sin salto: sentadilla rápida subiendo de puntillas.'],
  draw:{A:{hip:[80,120],t:-55,hn:[110,124],ed:180,fn:[104,148]},B:{hip:[100,80],t:-88,hn:[110,30],ed:0,fn:[104,138],ftn:40},dur:1.6}},
 toques:{name:'Plancha con toque de hombros',mus:'Abdomen, brazos y hombros',tips:['Plancha alta con las manos bajo los hombros.','Toca el hombro contrario sin mover la cadera.','Piernas más abiertas = más fácil.'],
  draw:{A:{hip:[110,118],t:-162,hn:[74,148],ed:180,fn:[156,147],kd:-90},B:{hip:[110,118],t:-162,hn:[80,110],ed:90,fn:[156,147],kd:-90},back:MAT,dur:1.6}},
 lateral:{name:'Plancha lateral',side:true,mus:'Cintura y oblicuos',tips:['De lado, apoyada en el antebrazo.','Sube la cadera hasta quedar recta.','Mitad del tiempo con cada lado.'],
  draw:{A:{hip:[100,130],t:194,hn:{hip:[2,-6]},ed:-90,hf:[82,147],edf:120,fn:[160,145],kd:-90},B:{hip:[100,117],t:186,hn:{hip:[2,-6]},ed:-90,hf:[82,147],edf:120,fn:[160,145],kd:-90},back:MAT}}
};
const RUNDRAW={f:p=>{const a=rad(p*360);return {hip:[96,89+2*Math.sin(2*a)],t:-80,hn:[102-14*Math.cos(a),84],hf:[102+14*Math.cos(a),84],ed:90,edf:90,
  fn:[100+20*Math.cos(a),146+Math.min(0,12*Math.sin(a))],ff:[100-20*Math.cos(a),146+Math.min(0,-12*Math.sin(a))],kd:0,kdf:0}},dur:0.9};
const WALKDRAW={f:p=>{const a=rad(p*360);return {hip:[98,90],t:-88,hn:[100-12*Math.cos(a),94],hf:[100+12*Math.cos(a),94],ed:180,edf:180,
  fn:[100+14*Math.cos(a),148+Math.min(0,5*Math.sin(a))],ff:[100-14*Math.cos(a),148+Math.min(0,-5*Math.sin(a))],kd:0,kdf:0}},dur:1.6};
for(const k in EX){ const d=EX[k].draw; if(!d.f){ d.RA=resolve(d.A); d.RB=resolve(d.B);} }

// ---------- Routines ----------
const ROUT={
 A:{k:'A',name:'Piernas y caderas',emoji:'🍑',color:'#e07b9b',soft:'#fde4ec',sub:'Piernas, caderas y glúteos',ex:['sentadilla','zancada','puente','patada','abductor','sumo','pared']},
 B:{k:'B',name:'Brazos, espalda y abdomen',emoji:'💪',color:'#b98bd6',soft:'#f1e6fa',sub:'Brazos, espalda (postura) y abdomen',ex:['flexion','fondos','remo','pressh','superman','piernas','plancha']},
 C:{k:'C',name:'Quema total',emoji:'🔥',color:'#f0a35e',soft:'#fdebdc',sub:'Circuito cardio de todo el cuerpo y abdomen bajo',ex:['jacks','salto','escalador','inverso','toques','bici','deadbug']},
 X:{k:'X',name:'Exprés abdomen y brazos',emoji:'⚡',color:'#6fb7a0',soft:'#e1f3ec',sub:'15 min para los días de baloncesto (opcional)',ex:['inverso','laterales','deadbug','curl','lateral'],express:true}
};
const LEVELS={1:{on:30,off:30,rounds:2,name:'Nivel 1'},2:{on:40,off:20,rounds:3,name:'Nivel 2'},3:{on:45,off:15,rounds:3,name:'Nivel 3'},4:{on:50,off:10,rounds:4,name:'Nivel 4'}};

// ---------- Running plan ----------
const rep=(n,r,w)=>{const a=[];for(let i=0;i<n;i++){a.push(['r',r]); if(i<n-1) a.push(['w',w]);}return a;};
const cont=m=>[['r',m]];
const RUNS=[
 [rep(8,1,1.5),rep(8,1,1.5),rep(8,1,1.5)],
 [rep(6,2,2),rep(6,2,2),rep(6,2,2)],
 [rep(5,3,1.5),rep(5,3,1.5),rep(5,3,1.5)],
 [rep(4,5,2),rep(4,5,2),rep(4,5,2)],
 [rep(3,7,2),rep(3,7,2),rep(2,10,2)],
 [rep(2,12,2),rep(2,12,2),[['r',15],['w',2],['r',10]]],
 [cont(20),cont(20),cont(25)],
 [cont(25),cont(25),cont(30)],
 [cont(30),cont(30),cont(35)],
 [cont(30),cont(35),cont(40)],
 [cont(35),cont(35),cont(45)],
 [cont(35),cont(40),cont(50)],
 [cont(35),cont(40),cont(55)]
];
const mm=m=>{const s=Math.round(m*60);const a=Math.floor(s/60),b=s%60;return b?`${a}'${String(b).padStart(2,'0')}"`:`${a}'`;};
function runDesc(segs){
  const r=segs.filter(x=>x[0]==='r'), w=segs.filter(x=>x[0]==='w');
  if(segs.length===1) return `${mm(segs[0][1])} corriendo seguido`;
  const same=r.every(x=>x[1]===r[0][1])&&w.every(x=>x[1]===(w[0]||[0,0])[1]);
  if(same) return `${r.length} × (${mm(r[0][1])} correr + ${mm(w[0][1])} caminar)`.replace(/ \+ [^)]*\)$/, m=>m)+'';
  return segs.map(x=>`${mm(x[1])} ${x[0]==='r'?'correr':'caminar'}`).join(' · ');
}
const runMin=segs=>segs.filter(x=>x[0]==='r').reduce((a,b)=>a+b[1],0);
const totalMin=segs=>segs.reduce((a,b)=>a+b[1],0)+10;
const kmApprox=segs=>{const m=runMin(segs);return m>=20?`≈ ${fmt(Math.round(m/7*2)/2)} km`:'';};

// ---------- Store ----------
const DOCKEYS=['meta','sessions','body','runs','rfeed'];
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
const weeksSince=()=>{const st=getDoc('meta').start; if(!st) return 0; return Math.max(0,Math.floor((pdate(today())-pdate(st))/(7*864e5)));};
function baseLevel(){ const w=weeksSince(); return w<3?1:w<8?2:3; }
function level(){ const m=getDoc('meta'); if(m.lvl&&m.lvl!=='auto') return +m.lvl; return Math.max(1,Math.min(4,baseLevel()+(m.lvlAdj||0))); }
// Ajuste del nivel según cómo le van las rutinas (2 seguidas "fácil" sube, 2 "muy dura" baja)
function routineFeedback(r,feel){
  const lv=level(); const en=[...(getDoc('rfeed').entries||[]),{date:today(),r,lvl:lv,feel}].slice(-80);
  persist('rfeed',{entries:en});
  const m=getDoc('meta'); if(m.lvl&&m.lvl!=='auto') return 'Apuntado. Tienes el nivel en manual: puedes cambiarlo en Progreso.';
  const recent=en.filter(x=>x.lvl===lv).slice(-2); let adj=m.lvlAdj||0, msg='¡Apuntado! 💗';
  if(recent.length===2&&recent.every(x=>x.feel==='facil')&&lv<4){ adj++; msg=`¡Te sobra fuerza! Subes a ${LEVELS[lv+1].name} (${LEVELS[lv+1].on}"/${LEVELS[lv+1].off}") 🎉`; }
  else if(recent.length===2&&recent.every(x=>x.feel==='dura')&&lv>1){ adj--; msg=`Bajamos a ${LEVELS[lv-1].name} un tiempo: mejor bien hecho que a medias 💪`; }
  else if(feel==='facil') msg='¡Bien! Si la próxima también te parece fácil, subes de nivel.';
  else if(feel==='dura') msg='Normal que cueste. Si la próxima también se hace muy dura, bajamos un nivel.';
  if(adj!==(m.lvlAdj||0)) persist('meta',{...getDoc('meta'),lvlAdj:adj});
  return msg;
}
function askRoutineFeedback(r){
  const box=$('pnext');
  box.innerHTML=`<div style="margin-top:6px;color:var(--ink);font-weight:600">¿Qué tal te ha ido?</div><div class="fbk"><button data-fb="facil">😌 Fácil</button><button data-fb="bien">🙂 Bien</button><button data-fb="dura">🥵 Muy dura</button></div>`;
  box.querySelectorAll('[data-fb]').forEach(b=>b.onclick=()=>{ const msg=routineFeedback(r,b.dataset.fb); box.innerHTML=`<div class="fbmsg">${msg}</div>`; setTimeout(()=>{ playerClose(); rerender(); },2600); });
}

// sessions done per date: ids 'run','R-A','bb','match','rest'
const sessDays=()=>getDoc('sessions').days||{};
const daySess=d=>sessDays()[d]||{done:[]};
function setDone(id,on,date=today()){
  if(on) ensureStart();
  const days={...sessDays()}; const c={done:[],...(days[date]||{})}; c.done=[...(c.done||[])];
  if(on&&!c.done.includes(id)) c.done.push(id); if(!on) c.done=c.done.filter(x=>x!==id);
  if(!c.done.length&&!c.note) delete days[date]; else days[date]=c;
  persist('sessions',{days});
}
// runs
const runEntries=()=>getDoc('runs').entries||[];
function nextRun(){
  const done=new Set(runEntries().map(x=>`${x.w}-${x.s}`));
  for(let w=0;w<RUNS.length;w++) for(let s=0;s<3;s++) if(!done.has(`${w+1}-${s+1}`)) return {w:w+1,s:s+1};
  return {w:RUNS.length,s:3,finished:true};
}
function logRun(w,s,extra){
  ensureStart();
  const en=runEntries().filter(x=>!(x.w===w&&x.s===s)); en.push({date:today(),w,s,...extra});
  persist('runs',{entries:en});
  if(!extra.skip) setDone('run',true);
}

// ---------- Week plan ----------
const WD=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const WDS=['L','M','X','J','V','S','D'];
const todayIdx=()=>(new Date().getDay()+6)%7;
function weekPlan(){
  const m=getDoc('meta'); const bb=m.bb??[0,2,4]; const match=m.match??5;
  const plan=WD.map((n,i)=>({i,name:n,items:[]}));
  const before=match>=0?(match+6)%7:-1, after=match>=0?(match+1)%7:-1;
  if(match>=0) plan[match].items.push({type:'match'});
  bb.forEach(i=>{ if(i!==match) plan[i].items.push({type:'bb'}); });
  if(after>=0&&!plan[after].items.length) plan[after].items.push({type:'rest'});
  const free=plan.filter(d=>!d.items.length);
  const q=['A','B','C'];
  free.forEach((d,k)=>{ if(k<3){ d.items.push({type:'run'}); d.items.push({type:'routine',r:q[k]}); } else d.items.push({type:'rest'}); });
  if(before>=0){
    const dbm=plan[before], it=dbm.items.find(x=>x.type==='routine'&&x.r==='A');
    if(it){ const other=free.find(d=>d!==dbm&&d.items.some(x=>x.type==='routine'&&x.r!=='A')); if(other){const o=other.items.find(x=>x.type==='routine'); it.r=o.r; o.r='A';} else it.r='B'; }
    const rn=dbm.items.find(x=>x.type==='run'); if(rn) rn.easy=true;
  }
  const have=new Set(plan.flatMap(d=>d.items.filter(x=>x.type==='routine').map(x=>x.r)));
  const bbDays=bb.filter(i=>i!==match&&i!==before);
  bbDays.forEach(i=>plan[i].items.push({type:'routine',r:'X',opt:true}));
  for(const r of ['A','B']) if(!have.has(r)){ const d=plan.find(d=>d.items.some(x=>x.r==='X')); if(d){ const x=d.items.find(x=>x.r==='X'); x.r=r; x.opt=false; x.after=true; } }
  return plan;
}
const itemLabel=it=>it.type==='match'?'🏀 Partido':it.type==='bb'?'🏀 Baloncesto':it.type==='rest'?'🧘 Descanso activo':it.type==='run'?(it.easy?'🏃‍♀️ Carrera suave':'🏃‍♀️ Carrera'):`${ROUT[it.r].emoji} ${ROUT[it.r].name}${it.opt?' (opc.)':''}`;

// ---------- Timer / audio ----------
let actx=null, wake=null;
function audioUnlock(){ try{ if(!actx){const A=window.AudioContext||window.webkitAudioContext; if(A) actx=new A();} if(actx&&actx.state==='suspended') actx.resume(); }catch(e){} }
function tone(f,dur,when=0,vol=0.3){ try{ if(!actx) return; const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+when; o.frequency.value=f; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g).connect(actx.destination); o.start(t); o.stop(t+dur+0.05);}catch(e){} }
const vib=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};

// ---------- GPS ----------
const GPS={watch:null,last:null,dist:0,ok:false,err:null};
const hav=(a,b)=>{const R0=6371000,t=x=>x*Math.PI/180,dLa=t(b.lat-a.lat),dLo=t(b.lon-a.lon),h=Math.sin(dLa/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dLo/2)**2;return 2*R0*Math.asin(Math.sqrt(h));};
function gpsStart(){
  GPS.dist=0; GPS.last=null; GPS.err=null; GPS.ok=false;
  if(!navigator.geolocation){ GPS.err='Este navegador no permite el GPS'; return; }
  try{ GPS.watch=navigator.geolocation.watchPosition(p=>{ const c=p.coords; if(c.accuracy>35) return; const pt={lat:c.latitude,lon:c.longitude,t:p.timestamp};
      if(GPS.last){ const d=hav(GPS.last,pt), dt=(pt.t-GPS.last.t)/1000; if(d<3) return; if(dt>0&&d/dt>7){ GPS.last=pt; return; } GPS.dist+=d; }
      GPS.last=pt; GPS.ok=true; GPS.err=null; },
    e=>{ GPS.err=e.code===1?'Sin permiso de ubicación (actívalo en los ajustes del navegador)':'Buscando señal GPS…'; },
    {enableHighAccuracy:true,maximumAge:0,timeout:20000}); }catch(e){ GPS.err='No se pudo iniciar el GPS'; }
}
function gpsStop(){ try{ if(GPS.watch!=null) navigator.geolocation.clearWatch(GPS.watch); }catch(e){} GPS.watch=null; }
const paceTxt=minKm=>{ if(!(minKm>0)||!isFinite(minKm)) return ''; const t=Math.round(minKm*60); return `${Math.floor(t/60)}'${String(t%60).padStart(2,'0')}"/km`; };
let gpsPref=(()=>{ try{ return localStorage.getItem('marina-gps')!=='0'; }catch(e){ return true; } })();
const setGpsPref=v=>{ gpsPref=v; try{ localStorage.setItem('marina-gps',v?'1':'0'); }catch(e){} };

// ---------- Player ----------
const PL={segs:[],i:0,end:0,left:0,paused:false,int:null,onDone:null,raf:0,draw:null};
const $=id=>R.getElementById(id);
function playerStart(segs,onDone,opts={}){
  $('ppause').hidden=false; $('pskip').hidden=false; $('pexit').textContent='Salir';
  audioUnlock(); PL.startTs=Date.now(); PL.gps=!!opts.gps; if(PL.gps) gpsStart(); $('pgps').textContent=''; PL.segs=segs; PL.i=-1; PL.onDone=onDone; PL.paused=false; $('ppause').textContent='Pausa';
  $('player').classList.add('on'); document.body.style.overflow='hidden';
  try{ navigator.wakeLock&&navigator.wakeLock.request('screen').then(w=>wake=w).catch(()=>{}); }catch(e){}
  nextSeg();
  clearInterval(PL.int); PL.int=setInterval(ptick,200);
}
function nextSeg(){
  PL.i++;
  if(PL.i>=PL.segs.length){ return playerFinish(); }
  const s=PL.segs[PL.i]; PL.end=Date.now()+s.sec*1000; PL.left=s.sec; PL.halfDone=false;
  const pl=$('player'); pl.className='on '+(s.cls||'');
  $('pk').textContent=s.k||''; $('pn').innerHTML=s.n||''; $('ps').textContent=s.sub||'';
  $('pnext').textContent=s.next||'';
  PL.draw=s.draw||null; PL.color=s.color||'#d9718f';
  if(!PL.draw) $('pfig').innerHTML=s.big?`<div class="big" style="color:${PL.color}">${s.big}</div>`:'';
  if(PL.i>0){ s.cls==='rest'||s.cls==='walk' ? (tone(660,0.25),vib(150)) : (tone(988,0.35),tone(988,0.35,0.4),vib([200,80,200])); }
}
function ptick(){
  if(PL.paused) return;
  const s=PL.segs[PL.i]; if(!s) return;
  const left=Math.max(0,(PL.end-Date.now())/1000), L=Math.ceil(left);
  if(L!==PL.lastL){ PL.lastL=L; if(L<=3&&L>0) tone(520,0.12); }
  if(s.half&&!PL.halfDone&&left<=s.sec/2){ PL.halfDone=true; tone(780,0.2); tone(780,0.2,0.25); vib(300); $('ps').textContent='¡Cambia de lado!'; }
  $('pt').textContent=`${Math.floor(L/60)}:${String(L%60).padStart(2,'0')}`;
  $('pbar').style.width=(100*(1-left/s.sec)).toFixed(1)+'%';
  if(PL.gps){ const el=$('pgps'); const km=GPS.dist/1000, min=(Date.now()-PL.startTs)/60000;
    el.innerHTML=GPS.err&&!GPS.ok?`📍 ${GPS.err}`:GPS.ok?`📍 <b>${fmt(Math.round(km*100)/100)} km</b> · ${Math.floor(min)}' · ritmo medio ${paceTxt(km>0.05?min/km:0)||'–'}`:'📍 Buscando señal GPS…'; }
  if(left<=0) nextSeg();
}
function playerLoop(ts){
  if(!alive) return;
  if($('player').classList.contains('on')&&PL.draw){ const dur=(PL.draw.dur||2.6)*1000; let p; if(PL.draw.f) p=(ts%dur)/dur; else {const q=(ts%dur)/dur; p=q<.5?q*2:2-q*2;} if(PL.paused) p=0; $('pfig').innerHTML=renderH({name:'',draw:PL.draw},p,PL.color); }
  requestAnimationFrame(playerLoop);
}
function playerFinish(){
  $('ppause').hidden=true; $('pskip').hidden=true; $('pexit').textContent='Cerrar';
  clearInterval(PL.int); PL.result={km:PL.gps&&GPS.ok&&GPS.dist>=100?Math.round(GPS.dist/10)/100:null,min:Math.round((Date.now()-PL.startTs)/60000)}; gpsStop(); tone(784,0.2); tone(988,0.2,0.22); tone(1175,0.4,0.44); vib([200,100,200,100,400]);
  PL.draw=null; $('player').className='on';
  $('pk').textContent='¡Terminado!'; $('pn').textContent='¡Muy bien! 🎉'; $('ps').textContent='';
  $('pfig').innerHTML=''; $('pt').textContent='✓'; $('pbar').style.width='100%'; $('pnext').textContent='';
  const f=PL.onDone; PL.onDone=null; if(f) f();
}
function playerClose(){ gpsStop(); clearInterval(PL.int); $('player').className=''; document.body.style.overflow=''; PL.draw=null; try{wake&&wake.release()}catch(e){} wake=null; }
$('ppause').onclick=()=>{ if(!PL.segs.length) return; if(PL.paused){ PL.paused=false; PL.end=Date.now()+PL.left*1000; $('ppause').textContent='Pausa'; } else { PL.paused=true; PL.left=Math.max(0,(PL.end-Date.now())/1000); $('ppause').textContent='Seguir'; } };
$('pskip').onclick=()=>{ if(PL.i<PL.segs.length) { PL.paused=false; $('ppause').textContent='Pausa'; nextSeg(); } };
$('pexit').onclick=()=>playerClose();

function routineSegs(r){
  const R=ROUT[r], lv=LEVELS[level()], rounds=R.express?2:lv.rounds; const segs=[];
  segs.push({k:'Prepárate',n:EX[R.ex[0]].name,sub:`${rounds} rondas · ${lv.on}" trabajo / ${lv.off}" descanso`,sec:10,cls:'rest',draw:EX[R.ex[0]].draw,color:R.color});
  for(let rd=1;rd<=rounds;rd++){
    R.ex.forEach((k,j)=>{
      const e=EX[k], nx=R.ex[j+1]?EX[R.ex[j+1]]:(rd<rounds?EX[R.ex[0]]:null);
      segs.push({k:`Ronda ${rd}/${rounds} · ${j+1}/${R.ex.length}`,n:e.name,sub:e.side?'Mitad del tiempo con cada lado':e.tips[0],sec:lv.on,draw:e.draw,color:R.color,half:!!e.side,next:nx?`Después: ${nx.name}`:'Último ejercicio'});
      const last=j===R.ex.length-1;
      if(!(last&&rd===rounds)) segs.push({k:last?'Descanso entre rondas':'Descansa',n:last?'Respira y bebe agua':'Descansa',sub:'',sec:last?60:lv.off,cls:'rest',draw:nx?nx.draw:null,color:R.color,next:nx?`Ahora viene: ${nx.name}`:''});
    });
  }
  return segs;
}
function runSegs(w,s){
  const segs=[{k:'Calentamiento',n:'Camina a paso rápido',sub:'5 minutos para entrar en calor',sec:300,cls:'walk',draw:WALKDRAW,color:'#6fb7a0'}];
  RUNS[w-1][s-1].forEach((x,i,arr)=>{
    const nx=arr[i+1];
    segs.push(x[0]==='r'?{k:`Semana ${w} · sesión ${s}`,n:'¡CORRE!',sub:'Ritmo suave: debes poder hablar',sec:Math.round(x[1]*60),cls:'run',draw:RUNDRAW,color:'#d9718f',next:nx?`Luego: camina ${mm(nx[1])}`:'Luego: vuelta a la calma'}
      :{k:`Semana ${w} · sesión ${s}`,n:'Camina',sub:'Recupera el aliento',sec:Math.round(x[1]*60),cls:'walk',draw:WALKDRAW,color:'#6fb7a0',next:nx?`Luego: corre ${mm(nx[1])}`:''});
  });
  segs.push({k:'Vuelta a la calma',n:'Camina despacio',sub:'5 minutos y luego estira',sec:300,cls:'walk',draw:WALKDRAW,color:'#6fb7a0'});
  return segs;
}


// ---------- Resumen semanal ----------
const mondayOfIso=x=>{const d=pdate(x); d.setDate(d.getDate()-((d.getDay()+6)%7)); return iso(d);};
const addDaysIso=(x,n)=>{const d=pdate(x); d.setDate(d.getDate()+n); return iso(d);};
function weekSummaryM(ws){
  const we=addDaysIso(ws,6), inW=x=>x>=ws&&x<=we, days=sessDays();
  const act=Object.keys(days).filter(k=>inW(k)&&(days[k].done||[]).some(x=>x!=='rest'));
  const runs=runEntries().filter(x=>!x.skip&&inW(x.date));
  const rmin=runs.reduce((a,x)=>a+(+x.min||runMin(RUNS[x.w-1][x.s-1])),0), km=runs.reduce((a,x)=>a+(+x.km||0),0);
  const paces=runs.filter(x=>x.pace).map(x=>+x.pace);
  const routs=[]; Object.keys(days).filter(inW).forEach(k=>(days[k].done||[]).forEach(id=>{ if(id.startsWith('R-')) routs.push(id.slice(2)); }));
  const bbc=Object.keys(days).filter(k=>inW(k)&&(days[k].done||[]).some(x=>x==='bb'||x==='match')).length;
  const fb=(getDoc('rfeed').entries||[]).filter(x=>inW(x.date));
  const body=(getDoc('body').entries||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
  const inBody=body.filter(x=>inW(x.date)), before=body.filter(x=>x.date<ws);
  let meas='';
  if(inBody.length&&before.length){ const a=before[before.length-1], b=inBody[inBody.length-1]; const parts=[['cintura','cintura'],['cadera','cadera'],['kg','peso']].filter(([f])=>+a[f]>0&&+b[f]>0).map(([f,n])=>{ const d=+b[f]-+a[f]; return `${n} ${d>0?'+':''}${fmt(d)}`; }); meas=parts.join(' · '); }
  return {act:act.length,runs:runs.length,rmin,km,pace:paces.length?Math.min(...paces):null,routs,bbc,fb,meas};
}
function summaryHTMLM(x,title){
  const nr=nextRun();
  const rc={}; x.routs.forEach(r=>rc[r]=(rc[r]||0)+1);
  return `<h4>${title}</h4>
  <div class="stats"><div><b>${x.act}</b><span>días activos</span></div><div><b>${x.runs}</b><span>carreras · ${Math.round(x.rmin)} min</span></div><div><b>${x.routs.length}</b><span>rutinas</span></div>${x.km?`<div><b>${fmt(Math.round(x.km*10)/10)} km</b><span>${x.pace?'mejor ritmo '+paceTxt(x.pace):'corridos'}</span></div>`:''}</div>
  ${x.routs.length?`<p class="small" style="color:var(--ink)"><b>💗 Rutinas:</b> ${Object.entries(rc).map(([r,n])=>`${ROUT[r]?ROUT[r].name:r}${n>1?' ×'+n:''}`).join(', ')}</p>`:''}
  ${x.bbc?`<p class="small" style="color:var(--ink)"><b>🏀 Baloncesto:</b> ${x.bbc} día${x.bbc>1?'s':''}</p>`:''}
  ${x.meas?`<p class="small" style="color:var(--ink)"><b>📏 Medidas:</b> ${x.meas}</p>`:''}
  ${x.fb.length?`<p class="small" style="color:var(--ink)"><b>💬 Sensaciones:</b> ${x.fb.map(f=>f.feel==='facil'?'😌':f.feel==='dura'?'🥵':'🙂').join(' ')} · ahora estás en ${LEVELS[level()].name}</p>`:''}
  <p class="small" style="color:var(--ink)"><b>➡️ Lo siguiente:</b> ${nr.finished?'¡Plan de carrera completado! 🎉':`carrera semana ${nr.w} · sesión ${nr.s}`} y tus rutinas en ${LEVELS[level()].name}.</p>`;
}
function weeklyBannerM(){
  const wd=new Date().getDay(); if(!(wd===1||wd===2||wd===0)) return '';
  const ws=wd===0?mondayOfIso(today()):addDaysIso(mondayOfIso(today()),-7);
  let seen=null; try{seen=localStorage.getItem('marina-resumen-visto')}catch(e){}
  if(seen===mondayOfIso(today())) return '';
  const x=weekSummaryM(ws); if(!x.act&&!x.runs&&!x.routs.length) return '';
  return `<div class="card wkbanner" id="wkbanner"><button class="wkx" id="wkclose" type="button">✕</button>${summaryHTMLM(x,wd===0?'📋 Tu semana':'📋 Resumen de la semana pasada')}</div>`;
}

// ---------- Rendering helpers ----------
function sparkSvg(vals,color,W=220,H=40){
  if(vals.length<2) return '';
  const mn=Math.min(...vals), mx=Math.max(...vals);
  const pts=vals.map((v,i)=>[6+i*(W-12)/(vals.length-1), H-6-(mx===mn?0.5:(v-mn)/(mx-mn))*(H-12)]);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none"><polyline points="${pts.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
}
let figs=[];
function exCards(keys,color){
  const lv=LEVELS[level()];
  return keys.map((k,i)=>{ const e=EX[k];
    return `<article class="ex"><div class="fig"><div class="num">${i+1}</div><div class="svgbox" data-ex="${k}"></div></div>
    <div class="info"><h3>${e.name}</h3><div class="sr"><span>${lv.on}" trabajo</span><span class="r">${lv.off}" descanso</span>${e.side?'<span class="r">½ cada lado</span>':''}</div>
    <div class="mus">${e.mus}</div><ul>${e.tips.map(t=>`<li>${t}</li>`).join('')}</ul></div></article>`; }).join('');
}
const thumbs=keys=>`<div class="thumbs">${keys.map(k=>`<div><span class="svgbox" data-ex="${k}"></span>${EX[k].name}</div>`).join('')}</div>`;
function collectFigs(color){ figs=[...R.querySelectorAll('#view .svgbox')].map(el=>({el,draw:el.dataset.ex?EX[el.dataset.ex].draw:(el.dataset.d==='walk'?WALKDRAW:RUNDRAW),color:el.dataset.c||color})); }

// ---------- Views ----------
const TABS=[{id:'semana',ic:'🗓️',name:'Mi semana'},{id:'correr',ic:'🏃‍♀️',name:'Correr'},{id:'rutinas',ic:'💗',name:'Rutinas'},{id:'comida',ic:'🥗',name:'Comida'},{id:'progreso',ic:'📈',name:'Progreso'}];
let tab='semana', selDay=todayIdx(), selR='A';
const viewEl=$('view'), tabsEl=$('tabs');
function buildTabs(){
  tabsEl.innerHTML=TABS.map(t=>`<button class="tab${t.id===tab?' on':''}" data-t="${t.id}"><b>${t.ic}</b><span>${t.name}</span></button>`).join('');
  tabsEl.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{ tab=b.dataset.t; show(); window.scrollTo({top:Math.min(window.scrollY,tabsEl.offsetTop)}); });
}
function show(){ buildTabs(); figs=[]; ({semana:vSemana,correr:vCorrer,rutinas:vRutinas,comida:vComida,progreso:vProgreso})[tab](); }
function rerender(){ if($('player').classList.contains('on')) return; const y=window.scrollY; show(); window.scrollTo(0,y); }

function runCard(it,dateIso){
  const nr=nextRun(); const segs=RUNS[nr.w-1][nr.s-1]; const isToday=dateIso===today();
  const doneToday=runEntries().find(x=>x.date===dateIso&&!x.skip);
  if(doneToday) return `<div class="card isdone"><div class="row"><div class="ico">🏃‍♀️</div><div><div class="kicker">Carrera hecha</div><h3>Semana ${doneToday.w} · sesión ${doneToday.s} ✓</h3><span class="small">${doneToday.km?fmt(doneToday.km)+' km · ':''}${doneToday.pace?paceTxt(doneToday.pace)+' · ':''}${doneToday.feel||''}</span></div></div></div>`;
  return `<div class="card"><div class="row"><div class="ico" style="background:#ffe3ec"><span class="svgbox" data-d="run" data-c="#d9718f" style="width:44px"></span></div><div style="flex:1"><div class="kicker">${it.easy?'Carrera suave (mañana hay partido)':'Carrera'}</div>
   <h3>Semana ${nr.w} · sesión ${nr.s}${nr.s===3?' <span class="badge">opcional</span>':''}</h3></div></div>
   <p style="margin:8px 0 0">${runDesc(segs)}</p><span class="small">5' caminando para calentar + ${mm(totalMin(segs)-10)} + 5' de vuelta a la calma · total ${Math.round(totalMin(segs))} min ${kmApprox(segs)}</span>
   ${it.easy?'<div class="easy">Hoy, ritmo muy suave: llega fresca al partido. Si estás cansada, cámbiala por un paseo.</div>':''}
   ${isToday?`<label class="donechk"><input type="checkbox" class="gpschk" ${gpsPref?'checked':''}> 📍 Medir distancia y ritmo con GPS</label><div class="btns"><button class="btn" data-run="${nr.w}-${nr.s}">▶ Empezar con temporizador</button><button class="btn ghost" data-runmanual="${nr.w}-${nr.s}">Ya la hice</button></div><div class="runform"></div>`:''}</div>`;
}
function routineCard(it,dateIso){
  const R=ROUT[it.r], lv=LEVELS[level()], rounds=R.express?2:lv.rounds, done=(daySess(dateIso).done||[]).includes('R-'+it.r);
  const mins=Math.round((10+rounds*R.ex.length*(lv.on+lv.off)+(rounds-1)*60-lv.off)/60);
  return `<div class="card${done?' isdone':''}" style="--dc:${R.color}"><div class="row"><div class="ico" style="background:${R.soft}">${R.emoji}</div><div style="flex:1"><div class="kicker" style="color:${R.color}">Rutina en casa${it.opt?' · opcional':''}${it.after?' · después del entreno':''}</div>
    <h3>${R.name}</h3><span class="small" style="margin:0">${R.sub}</span></div></div>
    <span class="small">${R.ex.length} ejercicios · ${rounds} rondas · ${lv.on}"/${lv.off}" · ~${mins} min · ${lv.name}</span>
    ${thumbs(R.ex)}
    <div class="btns">${dateIso===today()?`<button class="btn" style="background:${R.color}" data-rout="${it.r}">▶ Empezar rutina guiada</button>`:''}<button class="btn ghost sm" data-goto="${it.r}">Ver cómo se hace cada ejercicio</button></div>
    ${dateIso===today()?`<label class="donechk"><input type="checkbox" data-done="R-${it.r}" ${done?'checked':''}> Hecha</label>`:''}</div>`;
}
function simpleCard(ic,kick,title,txt,id,dateIso,extra=''){
  const done=(daySess(dateIso).done||[]).includes(id);
  return `<div class="card${done?' isdone':''}"><div class="row"><div class="ico">${ic}</div><div style="flex:1"><div class="kicker">${kick}</div><h3>${title}</h3></div></div><p style="margin:8px 0 0">${txt}</p>${extra}
  ${dateIso===today()?`<label class="donechk"><input type="checkbox" data-done="${id}" ${done?'checked':''}> Hecho</label>`:''}</div>`;
}
function dateOfIdx(i){ const d=new Date(); d.setDate(d.getDate()+(i-todayIdx())); return iso(d); }
function vSemana(){
  const plan=weekPlan(), m=getDoc('meta'), bb=m.bb??[0,2,4], match=m.match??5;
  const d=plan[selDay], dIso=dateOfIdx(selDay), isT=selDay===todayIdx();
  let h=`<div class="head"><h2>${isT?'Hoy · ':''}${d.name}</h2><p>${d.items.map(itemLabel).join(' + ')}</p><div class="meta"><span>${LEVELS[level()].name} en rutinas</span><span>Carrera: semana ${nextRun().w}</span></div></div>
  <div class="chips">${plan.map((p,i)=>`<button class="chip${i===selDay?' on':''}${i===todayIdx()?' today':''}" data-day="${i}">${WDS[i]}<small>${p.items.map(x=>x.type==='bb'||x.type==='match'?'🏀':x.type==='run'?'🏃‍♀️':x.type==='rest'?'🧘':ROUT[x.r].emoji).slice(0,2).join('')}</small></button>`).join('')}</div>`;
  if(isT) h+=weeklyBannerM();
  if(!isT) h+=`<p class="small" style="text-align:center;margin-top:-4px">Vista previa de este día. Los botones para empezar salen el mismo día.</p>`;
  for(const it of d.items){
    if(it.type==='match') h+=simpleCard('🏀','Partido','Día de partido','Desayuna bien (hidratos + proteína), bebe agua desde por la mañana y come algo ligero 2–3 h antes. Hoy no hace falta nada más. ¡A por ellas!','match',dIso);
    else if(it.type==='bb') h+=simpleCard('🏀','Entrenamiento','Baloncesto','Tu entreno de equipo cuenta como cardio intenso. Lleva agua y come algo 1–2 h antes (una fruta y un yogur, una tostada…).','bb',dIso);
    else if(it.type==='rest') h+=simpleCard('🧘','Descanso activo','Paseo y estiramientos','Paseo de 30–45 min a ritmo cómodo y 10 min de estiramientos. Descansar también hace que pierdas grasa: el cuerpo se recupera y llegas con energía al resto de la semana.','rest',dIso,`<div class="thumbs"><div><span class="svgbox" data-d="walk" data-c="#6fb7a0"></span>Paseo</div></div>`);
    else if(it.type==='run') h+=runCard(it,dIso);
    else h+=routineCard(it,dIso);
  }
  h+=`<details class="cfg"${m.bb?'':' open'}><summary>⚙️ Mis días de baloncesto y partido</summary>
    <p class="small">Marca tus días de entreno y el día del partido. El plan se reorganiza solo: las carreras y las rutinas fuertes van a tus días libres. Nunca toca pierna el día antes del partido, y el día después es de descanso.</p>
    <b style="font-size:12.5px">Entrenos de baloncesto</b><div class="daypick" id="pbb">${WDS.map((w,i)=>`<button class="${bb.includes(i)?'on':''}" data-i="${i}">${w}</button>`).join('')}</div>
    <b style="font-size:12.5px">Partido</b><div class="daypick m" id="pmatch">${WDS.map((w,i)=>`<button class="${match===i?'on':''}" data-i="${i}">${w}</button>`).join('')}</div>
    <div class="wkplan" style="margin-top:8px">${plan.map(p=>`<div class="hrow"><b>${p.name}</b><span>${p.items.map(itemLabel).join(' + ')}</span></div>`).join('')}</div></details>
  <div class="card"><h4>Antes de empezar, lo importante 💗</h4><ul>
    <li><b>La grasa no se quema por zonas.</b> Hacer abdominales no quema la grasa de la tripa. Lo que funciona es perder grasa de todo el cuerpo (con la comida + el cardio + estas rutinas) y tonificar las zonas que te importan. Cada cuerpo pierde primero de unas zonas; caderas y piernas suelen ser las últimas, así que paciencia.</li>
    <li><b>No te vas a poner cuadrada.</b> Con tu peso corporal y unas botellas de agua no se gana volumen grande. Estas rutinas son de muchas repeticiones para tonificar y quemar, y el músculo es lo que hace que se vea todo más firme.</li>
    <li><b>Clavículas:</b> se marcan cuando baja la grasa general y con buena postura (hombros atrás y abajo). Por eso hay remo, superman y hombros. Que se noten más o menos depende también de la genética de cada una.</li>
    <li>Ya entrenas mucho con el baloncesto. Este plan está pensado para sumar <b>sin quemarte</b>. Si un día estás muy cansada o te duele algo, cambia la rutina por un paseo.</li></ul></div>`;
  viewEl.innerHTML=h;
  viewEl.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{selDay=+b.dataset.day;show();});
  const wkc=$('wkclose'); if(wkc) wkc.onclick=()=>{ try{localStorage.setItem('marina-resumen-visto',mondayOfIso(today()))}catch(e){}; $('wkbanner').remove(); };
  viewEl.querySelectorAll('#pbb button').forEach(b=>b.onclick=()=>{ const i=+b.dataset.i; let a=[...(getDoc('meta').bb??[0,2,4])]; a=a.includes(i)?a.filter(x=>x!==i):[...a,i].sort(); persist('meta',{...getDoc('meta'),bb:a,match:getDoc('meta').match??5}); });
  viewEl.querySelectorAll('#pmatch button').forEach(b=>b.onclick=()=>{ const i=+b.dataset.i; const cur=getDoc('meta').match??5; persist('meta',{...getDoc('meta'),bb:getDoc('meta').bb??[0,2,4],match:cur===i?-1:i}); });
  wireCommon();
}
function wireCommon(){
  viewEl.querySelectorAll('[data-done]').forEach(c=>c.onchange=()=>setDone(c.dataset.done,c.checked));
  viewEl.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>{selR=b.dataset.goto;tab='rutinas';show();window.scrollTo({top:tabsEl.offsetTop});});
  viewEl.querySelectorAll('[data-rout]').forEach(b=>b.onclick=()=>{ const r=b.dataset.rout; playerStart(routineSegs(r),()=>{ setDone('R-'+r,true); askRoutineFeedback(r); }); });
  viewEl.querySelectorAll('[data-run]').forEach(b=>b.onclick=()=>{ const [w,s]=b.dataset.run.split('-').map(Number); const box=b.closest('.card').querySelector('.runform'); playerStart(runSegs(w,s),()=>{ const res=PL.result; setTimeout(()=>{playerClose(); runForm(box,w,s,res);},1800); },{gps:gpsPref}); });
  viewEl.querySelectorAll('.gpschk').forEach(c=>c.onchange=()=>{ setGpsPref(c.checked); viewEl.querySelectorAll('.gpschk').forEach(o=>o.checked=c.checked); });
  viewEl.querySelectorAll('[data-runmanual]').forEach(b=>b.onclick=()=>{ const [w,s]=b.dataset.runmanual.split('-').map(Number); let box=b.closest('.card')&&b.closest('.card').querySelector('.runform'); if(!box){ box=document.createElement('div'); b.closest('.wk').appendChild(box); } runForm(box,w,s); });
  viewEl.querySelectorAll('[data-skip]').forEach(b=>b.onclick=()=>{ const [w,s]=b.dataset.skip.split('-').map(Number); logRun(w,s,{skip:true}); });
  collectFigs('#d9718f');
}
function runForm(box,w,s,res){
  if(!box) return;
  const planned=Math.round(totalMin(RUNS[w-1][s-1]));
  const f=document.createElement('div'); f.className='card'; f.style.marginTop='10px'; f.style.background='#fff9fb';
  f.innerHTML=`<h4>¿Qué tal la semana ${w} · sesión ${s}?</h4>
  <div class="inrow"><label>Km${res&&res.km?' (GPS)':' (opcional)'}<input class="rkm" type="number" inputmode="decimal" step="0.01" value="${res&&res.km?res.km:''}"></label><label>Minutos<input class="rmin" type="number" inputmode="numeric" value="${res&&res.min?res.min:planned}"></label><span class="small rpace" style="margin:0 0 8px"></span></div>
  <div class="btns">${['😌 Fácil','🙂 Bien','😮‍💨 Dura'].map(x=>`<button class="btn ghost sm" data-feel="${x}">${x}</button>`).join('')}</div><span class="small">El ritmo incluye los tramos caminando. Si te ha resultado dura, la próxima vez repite esta misma sesión: no hay prisa.</span>`;
  box.innerHTML=''; box.appendChild(f);
  const val=sel=>parseFloat((f.querySelector(sel).value||'').replace(',','.'));
  const upd=()=>{ const km=val('.rkm'), mi=val('.rmin'); f.querySelector('.rpace').textContent= km>0&&mi>0?`Ritmo medio: ${paceTxt(mi/km)}`:''; };
  f.querySelectorAll('input').forEach(i=>i.addEventListener('input',upd)); upd();
  f.querySelectorAll('[data-feel]').forEach(b=>b.onclick=()=>{ const km=val('.rkm'), mi=val('.rmin'); logRun(w,s,{km:km>0?km:null,min:mi>0?mi:null,pace:km>0&&mi>0?Math.round(mi/km*100)/100:null,gps:!!(res&&res.km),feel:b.dataset.feel}); });
}
function vCorrer(){
  const nr=nextRun(), en=runEntries(); const map={}; en.forEach(x=>map[`${x.w}-${x.s}`]=x);
  const last=en.filter(x=>!x.skip).slice(-1)[0];
  const km=en.reduce((a,x)=>a+(+x.km||0),0);
  let h=`<div class="head" style="--dc:#d9718f"><h2>De cero a 7–8 km</h2><p>13 semanas alternando correr y caminar hasta correr 55–60 minutos seguidos. Haz 2 carreras por semana; la 3ª es opcional si tienes otro hueco.</p><div class="meta"><span>Ahora: semana ${nr.w}</span><span>${en.filter(x=>!x.skip).length} carreras hechas</span>${km?`<span>${fmt(km)} km en total</span>`:''}</div></div>`;
  if(last&&last.feel&&last.feel.includes('Dura')) h+=`<div class="card" style="background:#fff3e8;border-color:#fde0c6">La última te resultó dura. Puedes repetir esa sesión antes de avanzar: <button class="btn sm" data-redo="${last.w}-${last.s}">Repetir semana ${last.w} · sesión ${last.s}</button></div>`;
  h+=`<div class="card"><h4>Cómo correr bien</h4><ul><li><b>Ritmo suave:</b> tienes que poder hablar mientras corres. Si no puedes, ve más despacio (aunque parezca andar rápido).</li><li>Pasos cortos, mirada al frente y brazos relajados.</li><li>Unas zapatillas de running cómodas evitan lesiones. Las de baloncesto no sirven para esto.</li><li>Con el temporizador el móvil pita y vibra cuando toca correr o caminar, y con el GPS activado mide la distancia y tu ritmo. Deja la pantalla encendida: si se bloquea, el GPS deja de medir.</li><li>Si alguna semana no puedes, repítela. Avanzar despacio es avanzar.</li></ul></div>
  <label class="donechk" style="margin:0 0 10px"><input type="checkbox" class="gpschk" ${gpsPref?'checked':''}> 📍 Medir distancia y ritmo con GPS al usar el temporizador</label>
  <div class="weeks">`;
  RUNS.forEach((week,wi)=>{
    const w=wi+1;
    h+=`<div class="wk${w===nr.w?' cur':''}"><h4><span>Semana ${w}${w===RUNS.length?' · ¡objetivo!':''}</span><span class="muted" style="font-weight:400;font-size:12px">${kmApprox(week[2])}</span></h4>`;
    week.forEach((segs,si)=>{ const s=si+1, e=map[`${w}-${s}`]; const isNext=w===nr.w&&s===nr.s&&!nr.finished;
      h+=`<div class="ses"><span class="st ${e?(e.skip?'sk':'ok'):''}">${e?(e.skip?'–':'✓'):''}</span><span class="tx">${s===3?'<b>S3 (opc.)</b> ':`<b>S${s}</b> `}${runDesc(segs)}${e&&!e.skip?` <span class="muted">· ${fdate(e.date)}${e.km?' · '+fmt(e.km)+' km':''}${e.pace?' · '+paceTxt(e.pace):''}</span>`:''}</span>
      ${isNext?`<button data-run="${w}-${s}">▶</button><button data-runmanual="${w}-${s}">✓</button>${s===3?`<button data-skip="${w}-${s}">Saltar</button>`:''}`:''}</div>`; });
    h+=`</div>`;
  });
  h+=`</div><div class="card" style="margin-top:12px"><h4>Después de cada carrera</h4>Estira 5 minutos: gemelos, cuádriceps, isquios y cadera (20–30 s cada uno). Si un dolor no se va en 2–3 días o va a más, descansa y consúltalo.</div>`;
  viewEl.innerHTML=h;
  viewEl.querySelectorAll('[data-redo]').forEach(b=>b.onclick=()=>{ const [w,s]=b.dataset.redo.split('-').map(Number); playerStart(runSegs(w,s),()=>{ const en=runEntries(); persist('runs',{entries:en.map(x=>x.w===w&&x.s===s?{...x,date:today(),feel:null}:x)}); setDone('run',true); setTimeout(playerClose,1800); }); });
  wireCommon();
  viewEl.querySelectorAll('.ses [data-run]').forEach(b=>b.onclick=()=>{ const [w,s]=b.dataset.run.split('-').map(Number); playerStart(runSegs(w,s),()=>{ const res=PL.result; setTimeout(()=>{ playerClose(); const card=document.createElement('div'); b.closest('.wk').appendChild(card); runForm(card,w,s,res); card.scrollIntoView({behavior:'smooth',block:'center'}); },1800); },{gps:gpsPref}); });
}
function vRutinas(){
  const R=ROUT[selR], lv=LEVELS[level()];
  viewEl.style.setProperty('--dc',R.color); viewEl.style.setProperty('--soft',R.soft);
  let h=`<div class="rsel">${Object.values(ROUT).map(r=>`<button class="${r.k===selR?'on':''}" style="--dc:${r.color}" data-r="${r.k}"><b>${r.emoji}</b>${r.name}</button>`).join('')}</div>
  <div class="head" style="--dc:${R.color}"><h2>${R.emoji} ${R.name}</h2><p>${R.sub}</p><div class="meta"><span>${R.express?2:lv.rounds} rondas</span><span>${lv.on}" trabajo / ${lv.off}" descanso</span><span>${lv.name}</span></div></div>
  <div class="card"><b>Cómo se hace:</b> calienta 3–5 min (marcha en el sitio, círculos de brazos, sentadillas suaves). Después haz los ejercicios seguidos: ${lv.on} segundos cada uno con ${lv.off} de descanso. Al acabar la ronda, descansa 1 minuto y repite. El temporizador te lo marca todo.
  <div class="btns"><button class="btn" style="background:${R.color}" data-rout="${R.k}">▶ Empezar rutina guiada</button></div>
  <span class="small">El nivel sube solo: semanas 1–3 nivel 1, semanas 4–8 nivel 2 y luego nivel 3. Puedes cambiarlo en Progreso. Si tienes material: una mochila con libros o botellas de 1,5 L sirven de pesas.</span></div>
  ${exCards(R.ex,R.color)}`;
  viewEl.innerHTML=h;
  viewEl.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{selR=b.dataset.r;show();});
  wireCommon(); collectFigs(R.color);
}
function vComida(){
  viewEl.innerHTML=`<div class="head" style="--dc:#6fb7a0"><h2>🥗 Comida</h2><p>Comer bien es el 70 % de perder grasa. No se trata de comer poco, sino de comer bien y suficiente para rendir en el baloncesto.</p></div>
  <div class="card"><h4>La regla de oro</h4>Para perder grasa hay que gastar un poco más de lo que comes, pero solo <b>un poco</b>. Si comes muy poco, pierdes músculo, rindes peor en el baloncesto, te lesionas más y acabas con más hambre y atracones. Con este plan ya gastas mucho, así que <b>no hace falta pasar hambre</b>.</div>
  <div class="card"><h4>Cómo llenar el plato (comida y cena)</h4>
    <div class="plate"><div style="background:#e1f3ec"><b>½ plato · verdura</b>Ensalada, verduras al horno o salteadas, crema de verduras…</div>
    <div style="background:#fde4ec"><b>¼ plato · proteína</b>Pollo, pavo, pescado, huevos, legumbres, tofu, ternera magra (del tamaño de tu mano).</div>
    <div style="background:#fdebdc"><b>¼ plato · hidratos buenos</b>Arroz, pasta, patata, pan integral, quinoa. Algo más los días de baloncesto o partido.</div>
    <div style="background:#f1e6fa"><b>+ grasa buena</b>Un chorrito de aceite de oliva, aguacate o un puñado de frutos secos.</div></div>
    <span class="small">Proteína en todas las comidas: ayuda a no tener hambre y a que lo que pierdas sea grasa, no músculo.</span></div>
  <div class="card"><h4>Un día de ejemplo</h4><ul>
    <li><b>Desayuno:</b> yogur natural o skyr con fruta y avena, o tostada integral con huevo/pavo y una fruta.</li>
    <li><b>Media mañana:</b> fruta + un puñado de frutos secos.</li>
    <li><b>Comida:</b> el plato de arriba (por ejemplo, arroz con pollo y verduras, o lentejas con verduras).</li>
    <li><b>Antes del baloncesto (1–2 h):</b> plátano, tostada con algo, yogur… algo fácil de digerir.</li>
    <li><b>Cena:</b> más verdura y proteína, con algo menos de hidratos si ese día no has entrenado (por ejemplo, tortilla con ensalada o pescado con verduras).</li></ul></div>
  <div class="card"><h4>Lo que más ayuda ✅</h4><ul><li>Agua como bebida principal (lleva botella al entreno).</li><li>Fruta y verdura cada día, de colores variados.</li><li>Comer a horas parecidas y sin saltarte comidas: así llegas menos hambrienta.</li><li>Dormir 8–9 horas: dormir poco da más hambre y ganas de dulce.</li></ul>
    <h4 style="margin-top:10px">Lo que más frena 🚫</h4><ul><li>Refrescos, zumos y bebidas energéticas (mucho azúcar sin llenar).</li><li>Bollería, galletas, snacks de bolsa y comida rápida a menudo.</li><li>Alcohol: tiene muchas calorías y empeora el descanso.</li><li>Picar sin hambre (estrés, aburrimiento, móvil).</li></ul>
    <span class="small">Darte un capricho de vez en cuando está bien. Lo que cuenta es lo que haces la mayor parte de la semana.</span></div>
  <div class="card"><h4>⏳ ¿Cuánto tardaré?</h4><ul>
    <li><b>2–4 semanas:</b> más energía, más fondo en la pista y la ropa empieza a sentar distinto.</li>
    <li><b>6–8 semanas:</b> cambios que se notan en las medidas (cintura y cadera) y en las fotos.</li>
    <li><b>3–4 meses:</b> cambio claro en el cuerpo si eres constante con la comida y el plan. A un ritmo sano se pierde aproximadamente un 0,5–1 % de tu peso por semana; ir más rápido suele ser perder músculo y agua.</li>
    <li><b>Correr 7–8 km:</b> unas 13 semanas siguiendo el plan de carrera.</li></ul>
    <span class="small">Que se noten las clavículas depende de tu genética y de dónde acumula grasa tu cuerpo. No te compares con nadie y mide tu progreso con la cinta métrica y fotos, no solo con la báscula.</span></div>
  <div class="card" style="background:#fff3e8;border-color:#fde0c6"><h4>Cuídate 🧡</h4>Con tanto deporte, comer demasiado poco es peligroso. Si notas cansancio constante, mareos, que la regla se retrasa o desaparece, o lesiones que no se curan, come más y consulta a un médico o dietista-nutricionista. Ellos pueden ajustarte un plan personalizado.</div>`;
}
function vProgreso(){
  const ph=level(), st=getDoc('meta').start, lvSel=getDoc('meta').lvl||'auto';
  const be=getDoc('body').entries||[];
  const M=[['kg','Peso','kg','#5a3247'],['cintura','Cintura','cm','#d9718f'],['cadera','Cadera','cm','#b98bd6'],['muslo','Muslo','cm','#f0a35e'],['brazo','Brazo','cm','#6fb7a0']];
  let h=`<div class="head" style="--dc:#5a3247"><h2>📈 Mi progreso</h2><p>Constancia, medidas y carreras. La cinta métrica dice más que la báscula.</p></div>
  <div class="card">${summaryHTMLM(weekSummaryM(mondayOfIso(today())),'📋 Esta semana')}${(()=>{ const x=weekSummaryM(addDaysIso(mondayOfIso(today()),-7)); return x.act||x.runs?`<details class="cfg" style="margin:8px 0 0"><summary>Ver la semana pasada</summary>${summaryHTMLM(x,'Semana pasada')}</details>`:''; })()}</div>
  <div class="card"><h4>Medidas</h4><div class="inrow">${M.map(m=>`<label>${m[1]} ${m[2]}<input id="m-${m[0]}" type="number" inputmode="decimal" step="0.1"></label>`).join('')}</div>
   <div class="btns"><button class="btn" id="msave">Guardar medidas</button></div><div class="msg" id="mmsg"></div>
   <span class="small">Mídete cada 2 semanas, por la mañana y en ayunas. Cintura: a la altura del ombligo. Cadera: por la parte más ancha. Muslo y brazo: por la parte más ancha. Si quieres, hazte también una foto cada 4 semanas con la misma luz y la misma ropa.</span>
   <div class="mgrid">${M.map(m=>{ const v=be.filter(x=>x[m[0]]>0); if(!v.length) return ''; const l=v[v.length-1][m[0]], dlt=v.length>1?l-v[0][m[0]]:null;
     return `<div class="mbox"><span>${m[1]}</span><b>${fmt(l)} ${m[2]}</b><span>${dlt!=null?`${dlt>0?'+':''}${fmt(dlt)} ${m[2]} desde el inicio`:'primera medida'}</span>${sparkSvg(v.slice(-15).map(x=>x[m[0]]),m[3],140,30)}</div>`; }).join('')}</div>
   ${be.slice().reverse().slice(0,8).map(x=>`<div class="hrow"><span>${fdate(x.date)}</span><span style="flex:1;text-align:right">${M.filter(m=>x[m[0]]>0).map(m=>`${m[1].toLowerCase()} ${fmt(x[m[0]])}`).join(' · ')}</span><button data-bdel="${x.date}">✕</button></div>`).join('')}</div>`;
  // calendar
  const days=sessDays(); const now=new Date(); const mon=new Date(now); mon.setDate(now.getDate()-todayIdx());
  const CCOL={run:'#d9718f','R-A':'#e07b9b','R-B':'#b98bd6','R-C':'#f0a35e','R-X':'#6fb7a0',bb:'#f3c08f',match:'#f0a35e',rest:'#cde7da'};
  let rows='', wk=[];
  for(let w=7;w>=0;w--){ const m0=new Date(mon); m0.setDate(mon.getDate()-7*w); let c=0, cells='';
    for(let k=0;k<7;k++){ const dd=new Date(m0); dd.setDate(m0.getDate()+k); const key=iso(dd); const s=days[key]; const dn=(s&&s.done)||[];
      const act=dn.filter(x=>x!=='rest'); if(act.length) c++;
      const ic=dn.includes('run')?'🏃‍♀️':dn.some(x=>x.startsWith('R-'))?'💗':(dn.includes('bb')||dn.includes('match'))?'🏀':dn.includes('rest')?'·':'';
      cells+=`<i class="${key===today()?'today':''}" style="${dn.length?`background:${CCOL[dn[0]]||'#f2a7bf'}55`:''}">${ic}</i>`; }
    wk.push(c); rows+=`<div class="crow"><span>${fdate(iso(m0))}</span>${cells}</div>`; }
  const re=runEntries().filter(x=>!x.skip), km=re.reduce((a,x)=>a+(+x.km||0),0), maxCont=Math.max(0,...re.map(x=>{const s=RUNS[x.w-1][x.s-1];return s.length===1?s[0][1]:Math.max(...s.filter(y=>y[0]==='r').map(y=>y[1]));}));
  const rtot=Object.values(days).reduce((a,s)=>a+((s.done||[]).filter(x=>x.startsWith('R-')).length),0);
  h+=`<div class="card"><h4>Constancia</h4><div class="stats"><div><b>${wk[wk.length-1]}</b><span>días activos esta semana</span></div><div><b>${rtot}</b><span>rutinas hechas</span></div><div><b>${re.length}</b><span>carreras</span></div></div>
    <div class="cal"><div class="crow hd"><span></span>${WDS.map(x=>`<i>${x}</i>`).join('')}</div>${rows}</div>
    <div class="legend"><span>🏃‍♀️ carrera</span><span>💗 rutina</span><span>🏀 baloncesto</span><span>· descanso</span></div></div>
  <div class="card"><h4>Carreras</h4><div class="stats"><div><b>${maxCont?mm(maxCont):'–'}</b><span>lo máximo seguido corriendo</span></div><div><b>${km?fmt(km)+' km':'–'}</b><span>km apuntados</span></div><div><b>${nextRun().w}/13</b><span>semana del plan</span></div></div>
    ${re.slice().reverse().slice(0,8).map(x=>`<div class="hrow"><span>${fdate(x.date)}</span><span style="flex:1;text-align:right">Sem ${x.w} · S${x.s}${x.km?` · ${fmt(x.km)} km`:''}${x.pace?` · ${paceTxt(x.pace)}`:''} ${x.feel?x.feel.split(' ')[0]:''}</span><button data-rdel="${x.w}-${x.s}">✕</button></div>`).join('')}</div>
  <div class="card"><h4>Nivel de las rutinas</h4><div class="inrow"><label>Fecha de inicio<input id="stdate" type="date" value="${st||''}" style="width:auto"></label><label>Nivel<select id="lvl"><option value="auto"${lvSel==='auto'?' selected':''}>Automático (${LEVELS[ph].name})</option>${[1,2,3,4].map(n=>`<option value="${n}"${lvSel==n?' selected':''}>${LEVELS[n].name} · ${LEVELS[n].on}"/${LEVELS[n].off}"</option>`).join('')}</select></label></div>
   <span class="small">${st?`Empezaste el ${fdate(st)} (semana ${weeksSince()+1}).`:'La fecha se pone sola cuando haces tu primera actividad.'} Al acabar cada rutina te pregunta qué tal: si dos seguidas te parecen fáciles sube de nivel, y si dos se hacen muy duras baja.${(getDoc('meta').lvlAdj||0)?` Ajuste actual: ${getDoc('meta').lvlAdj>0?'+':''}${getDoc('meta').lvlAdj} nivel.`:''}</span></div>
  <div class="card"><h4>Copia de seguridad</h4><span class="small">Copia tus datos para guardarlos o pasarlos a otro móvil.</span>
    <div class="btns"><button class="btn ghost sm" id="exp">Copiar mis datos</button></div><textarea id="impt" rows="2" placeholder="Pega aquí una copia para recuperarla"></textarea>
    <div class="btns"><button class="btn ghost sm" id="imp">Importar copia</button></div><div class="msg" id="bkmsg"></div></div>`;
  viewEl.innerHTML=h;
  $('msave').onclick=()=>{ const o={date:today()}; let any=false; M.forEach(m=>{ const v=parseFloat(($('m-'+m[0]).value||'').replace(',','.')); if(v>0){o[m[0]]=v;any=true;} });
    if(!any){ $('mmsg').textContent='Apunta al menos una medida.'; return; }
    ensureStart(); const en=be.filter(x=>x.date!==today()); const prev=be.find(x=>x.date===today())||{}; en.push({...prev,...o}); persist('body',{entries:en.slice(-150)}); };
  viewEl.querySelectorAll('[data-bdel]').forEach(b=>b.onclick=()=>persist('body',{entries:be.filter(x=>x.date!==b.dataset.bdel)}));
  viewEl.querySelectorAll('[data-rdel]').forEach(b=>b.onclick=()=>{ const [w,s]=b.dataset.rdel.split('-').map(Number); persist('runs',{entries:runEntries().filter(x=>!(x.w===w&&x.s===s))}); });
  $('stdate').onchange=e=>{ if(e.target.value) persist('meta',{...getDoc('meta'),start:e.target.value}); };
  $('lvl').onchange=e=>persist('meta',{...getDoc('meta'),lvl:e.target.value});
  $('exp').onclick=async()=>{ const data=JSON.stringify({app:'plan-ella',v:1,date:today(),docs:store.all()}); try{ await navigator.clipboard.writeText(data); $('bkmsg').textContent='Copiado ✓ Guárdalo en una nota o mándatelo por WhatsApp.'; }catch(e){ $('impt').value=data; $('impt').select(); $('bkmsg').textContent='Cópialo a mano desde el cuadro.'; } };
  let armed=false;
  $('imp').onclick=()=>{ let o; try{o=JSON.parse($('impt').value); if(!o||o.app!=='plan-ella'||!o.docs) throw 0;}catch(e){ $('bkmsg').textContent='Eso no parece una copia de este plan.'; return; }
    if(!armed){armed=true;$('bkmsg').textContent='Esto sustituirá tus datos. Pulsa otra vez para confirmar.';return;}
    for(const k of DOCKEYS) if(o.docs[k]&&typeof o.docs[k]==='object') persist(k,{...o.docs[k]}); };
}

// ---------- Animation loop ----------
function loop(ts){
  if(!alive) return;
  if(undefined==null && !$('player').classList.contains('on')){
    for(const f of figs){ const dur=(f.draw.dur||2.8)*1000; let p; if(f.draw.f) p=(ts%dur)/dur; else { const q=(ts%dur)/dur; p=q<.5?q*2:2-q*2; } f.el.innerHTML=renderH({name:'',draw:f.draw},p,f.color); }
  }
  requestAnimationFrame(loop);
}
function setStatus(t){}
const unsubStore=store.subscribe(()=>{ if(alive) rerender(); });
show(); requestAnimationFrame(loop); requestAnimationFrame(playerLoop);

return () => { alive = false; clearInterval(PL.int); try{ playerClose(); }catch(e){} unsubStore(); R.innerHTML = ''; };
}
