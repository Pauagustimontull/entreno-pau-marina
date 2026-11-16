// @ts-nocheck
// Motor de dibujo de las figuras animadas (SVG, cinemática inversa sencilla).
// ---------- Figure engine ----------
const L = {T:40, neck:5, head:8, UA:22, FA:20, TH:29, SH:29, FT:10};
const rad = d => d*Math.PI/180;
const V = (x,y)=>({x,y});
const add=(a,b)=>V(a.x+b.x,a.y+b.y), sub=(a,b)=>V(a.x-b.x,a.y-b.y), mul=(a,k)=>V(a.x*k,a.y*k);
const len=a=>Math.hypot(a.x,a.y);
const lerp=(a,b,p)=>a+(b-a)*p, lerpV=(a,b,p)=>V(lerp(a.x,b.x,p),lerp(a.y,b.y,p));
const dirV = d => V(Math.cos(rad(d)),Math.sin(rad(d)));

function ik(S,T,a,b,dir){
  let D=sub(T,S), d=len(D); if(d<1e-6){D=V(0,1);d=1e-6}
  const u=mul(D,1/d);
  const dc=Math.max(Math.abs(a-b)+0.5, Math.min(a+b-0.3,d));
  const along=(a*a-b*b+dc*dc)/(2*dc);
  const h=Math.sqrt(Math.max(0,a*a-along*along));
  const base=add(S,mul(u,along)), p=V(-u.y,u.x);
  const c1=add(base,mul(p,h)), c2=add(base,mul(p,-h));
  const pr=dirV(dir);
  const pick=( (c1.x-base.x)*pr.x+(c1.y-base.y)*pr.y >= (c2.x-base.x)*pr.x+(c2.y-base.y)*pr.y )?c1:c2;
  return {J:pick, E:add(S,mul(u,dc))};
}

// resolve a pose spec into world points
function resolve(s){
  const hip=V(s.hip[0],s.hip[1]); const t=s.t??-90;
  const d=dirV(t); const back=V(d.y,-d.x);
  const sh=add(hip,mul(d,L.T));
  const front=!!s.front;
  const shN= front? add(sh,V(13,3)) : sh, shF= front? add(sh,V(-13,3)) : add(sh,V(-1,0));
  const hpN= front? add(hip,V(8,0)) : hip, hpF= front? add(hip,V(-8,0)) : add(hip,V(-1,0));
  const cx=hip.x;
  const pt=(v,base)=>{
    if(v==null) return null;
    if(v==='hang') return add(base,V(front?4:2,41));
    if(v.tl) return add(add(sh,mul(d,v.tl[0])),mul(back,v.tl[1]));
    if(v.hip) return add(hip,V(v.hip[0],v.hip[1]));
    return V(v[0],v[1]);
  };
  const hn=pt(s.hn??'hang',shN);
  let hf=pt(s.hf,shF); if(!hf) hf = front? V(2*cx-hn.x,hn.y) : add(hn,V(-2,1));
  const fn=pt(s.fn??[hip.x+2,148],hpN);
  let ff=pt(s.ff,hpF); if(!ff) ff = front? V(2*cx-fn.x,fn.y) : add(fn,V(-4,0));
  return {hip,t,sh,d,back,shN,shF,hpN,hpF,hn,hf,fn,ff,
    ed:s.ed??180, edf:s.edf??(front?180-(s.ed??180):(s.ed??180)),
    kd:s.kd??0, kdf:s.kdf??(front?180-(s.kd??0):(s.kd??0)),
    ftn:s.ftn??(front?15:0), ftf:s.ftf??(front?165:(s.ftn??0)), front};
}
function mix(A,B,p){
  const o={...A};
  for(const k of ['hip','sh','shN','shF','hpN','hpF','hn','hf','fn','ff']) o[k]=lerpV(A[k],B[k],p);
  for(const k of ['t','ftn','ftf']) o[k]=lerp(A[k],B[k],p);
  o.d=dirV(o.t); o.back=V(o.d.y,-o.d.x);
  return o;
}
const P=v=>v.x.toFixed(1)+','+v.y.toFixed(1);
const ln=(a,b,w,c,extra='')=>`<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const circ=(c,r,f,extra='')=>`<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${r}" fill="${f}" ${extra}/>`;

function limb(S,T,a,b,dir,col,w){
  const {J,E}=ik(S,T,a,b,dir);
  return {svg: `<polyline points="${P(S)} ${P(J)} ${P(E)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`, J, E};
}
function legSvg(H,F,dir,ft,col,w){
  const l=limb(H,F,L.TH,L.SH,dir,col,w);
  const toe=add(l.E,mul(dirV(ft),L.FT));
  return l.svg+ln(l.E,toe,w-1.5,col);
}

function refPt(fr,r){
  if(Array.isArray(r) && typeof r[0]==='string'){ const b=fr[r[0]]; return add(b,V(r[1]||0,r[2]||0)); }
  if(typeof r==='string') return fr[r];
  return V(r[0],r[1]);
}
function drawProp(pr,fr,acc){
  const k=pr[0];
  const EQ='var(--equip)', ED='var(--equip-dark)';
  switch(k){
    case 'rect': return `<rect x="${pr[1]}" y="${pr[2]}" width="${pr[3]}" height="${pr[4]}" rx="${pr[5]??2}" fill="${pr[6]??EQ}"/>`;
    case 'line': return ln(V(pr[1],pr[2]),V(pr[3],pr[4]),pr[5]??4,pr[6]??EQ);
    case 'circle': return circ(V(pr[1],pr[2]),pr[3],pr[4]??EQ);
    case 'ring': return `<circle cx="${pr[1]}" cy="${pr[2]}" r="${pr[3]}" fill="none" stroke="${EQ}" stroke-width="${pr[4]??4}"/>`;
    case 'plate': { const c=refPt(fr,pr[1]); const r=pr[2]??13; return circ(c,r,acc,'opacity=".95"')+circ(c,r*0.45,'#fff','opacity=".55"')+circ(c,2.2,ED); }
    case 'db': { const c=refPt(fr,pr[1]); return ln(add(c,V(-5,0)),add(c,V(5,0)),3,ED)+circ(add(c,V(-5,0)),5.2,acc)+circ(add(c,V(5,0)),5.2,acc); }
    case 'dbs': { const c=refPt(fr,pr[1]); return circ(c,6.5,acc)+circ(c,2.4,'#fff','opacity=".6"'); }
    case 'cable': { const a=V(pr[1][0],pr[1][1]); const b=refPt(fr,pr[2]); return ln(a,b,1.4,ED)+circ(a,4.5,ED)+circ(a,1.8,'#fff'); }
    case 'bottle': { const c=refPt(fr,pr[1]); return `<rect x="${(c.x-3.5).toFixed(1)}" y="${(c.y-8).toFixed(1)}" width="7" height="16" rx="3" fill="${acc}"/><rect x="${(c.x-2).toFixed(1)}" y="${(c.y-11).toFixed(1)}" width="4" height="3.5" rx="1" fill="var(--equip-dark)"/>`; }
    case 'handle': { const c=refPt(fr,pr[1]); return circ(c,3.2,ED); }
    case 'pad': { const c=refPt(fr,pr[1]); return circ(c,pr[2]??5.5,ED); }
    case 'platform': { const c=refPt(fr,pr[1]); const a=dirV(pr[2]); const f=dirV(pr[2]-90); const cc=add(c,mul(f,pr[4]??4)); return ln(add(cc,mul(a,-16)),add(cc,mul(a,16)),5,ED); }
    case 'seg': { return ln(refPt(fr,pr[1]),refPt(fr,pr[2]),pr[3]??4,pr[4]??EQ); }
    case 'fn': return pr[1](fr,acc);
  }
  return '';
}

function render(ex,p,acc,opts){
  const dr=ex.draw;
  let fr;
  if(dr.f){ fr=resolve(dr.f(p)); }
  else { const e=(1-Math.cos(Math.PI*p))/2; fr=mix(dr.RA,dr.RB,e); }
  let s='';
  if(!dr.noGround) s+=`<line x1="6" y1="150.5" x2="194" y2="150.5" stroke="#d9d2c6" stroke-width="2" stroke-linecap="round"/>`;
  for(const pr of (dr.back||[])) s+=drawProp(pr,fr,acc);
  const FAR='var(--far)', BODY='var(--body)';
  // far limbs
  s+=legSvg(fr.hpF,fr.ff,fr.kdf,fr.ftf,FAR,6.5);
  s+=limb(fr.shF,fr.hf,L.UA,L.FA,fr.edf,FAR,5.5).svg;
  for(const pr of (dr.mid||[])) s+=drawProp(pr,fr,acc);
  // torso + head
  const neckTop=add(fr.sh,mul(fr.d,L.neck));
  const headC=add(fr.sh,mul(fr.d,L.neck+L.head));
  if(fr.front){
    s+=`<polygon points="${P(add(fr.shN,V(3,-3)))} ${P(add(fr.shF,V(-3,-3)))} ${P(add(fr.hpF,V(-2,0)))} ${P(add(fr.hpN,V(2,0)))}" fill="${BODY}" stroke="${BODY}" stroke-width="6" stroke-linejoin="round"/>`;
  } else {
    s+=ln(fr.hip,fr.sh,13,BODY);
  }
  s+=ln(fr.sh,neckTop,6,BODY);
  if(opts&&opts.hair){
    if(fr.front){ s+=circ(add(headC,V(0,-8)),4.5,BODY); }
    else { const pc=add(add(headC,mul(fr.back,8)),mul(fr.d,1)); s+=circ(pc,4,BODY)+ln(pc,add(pc,add(mul(fr.back,4),mul(fr.d,-6))),4,BODY); }
  }
  s+=circ(headC,L.head,BODY);
  // near limbs
  s+=legSvg(fr.hpN,fr.fn,fr.kd,fr.ftn,BODY,7);
  s+=limb(fr.shN,fr.hn,L.UA,L.FA,fr.ed,BODY,6).svg;
  for(const pr of (dr.front||[])) s+=drawProp(pr,fr,acc);
  return `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${ex.name}">${s}</svg>`;
}


export { L, rad, V, add, sub, mul, len, lerp, lerpV, dirV, ik, resolve, mix, P, ln, circ, limb, legSvg, refPt, drawProp, render };
