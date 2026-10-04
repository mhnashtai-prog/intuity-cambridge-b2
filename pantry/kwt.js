/* Part 4 (B2 First key word transformations) engine. Adds a "Part 4" tab to the page and reads window.KWT, which part1.js, part1b.js, part1c.js and part1d.js fill. Load this file AFTER those four and BEFORE the main inline script. It keeps its own progress under the localStorage key wf2_kwt, so it cannot disturb the other tabs.
   Marking: each answer in the data is "first half|second half". The whole answer right = 2 marks. One half right (first half at the start, or second half at the end) = 1 mark. Contractions are expanded before checking and count as two words, as in the exam. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pick=a=>a[Math.random()*a.length|0];
const KEY='wf2_kwt';
const PRAISE=['Nice!','Well done!','Spot on!','Brilliant!','You got it!'];
const KWC={passive:'Passives',caus:'Causatives',reported:'Reported speech',cond:'Conditionals',wish:'Wish and unreal past',modal:'Modals',comp:'Comparison',degree:'So, such, too, enough',vpat:'Verb patterns',link:'Linkers and relatives',tense:'Tenses and time',pv:'Phrasal verbs',fixed:'Fixed expressions',prep:'Prepositions'};
let K=null,PK={m:{},t:0,x:0,rounds:0,best:0,c:'all'};
try{const s=localStorage.getItem(KEY);if(s)PK=Object.assign(PK,JSON.parse(s))}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(PK))}catch(e){}};
const items=()=>window.KWT||[];
const inCat=q=>PK.c==='all'||q.c===PK.c;
const weak=q=>PK.m[q.id]&&PK.m[q.id].b<2;
const wt=q=>PK.m[q.id]?(PK.m[q.id].b>=2?1:4):3;

/* ---------- checking ---------- */
const norm=t=>String(t).toLowerCase().replace(/[\u2018\u2019]/g,"'").replace(/[^a-z' -]/g,' ').replace(/\s+/g,' ').trim();
const wc=t=>t.split(' ').filter(Boolean).length+(t.match(/n't\b|'(ll|ve|re|m|d|s)\b/g)||[]).length;
function variants(t){
  t=t.replace(/\bwon't\b/g,'will not').replace(/\bcan't\b/g,'can not').replace(/\bshan't\b/g,'shall not')
     .replace(/n't\b/g,' not').replace(/'ll\b/g,' will').replace(/'ve\b/g,' have').replace(/'re\b/g,' are').replace(/'m\b/g,' am');
  let out=[t];
  [["'d",['would','had']],["'s",['is','has']]].forEach(([c,subs])=>{
    out=out.flatMap(x=>x.includes(c)?subs.map(s=>x.split(c).join(' '+s)):[x]);
  });
  return out.map(x=>x.replace(/\s+/g,' ').trim());
}
const keyIn=(q,t)=>variants(t).some(v=>v.split(' ').includes(q.k.toLowerCase()));
function score(q,t){
  const vs=variants(t);let best=0;
  q.a.forEach(ans=>{
    const [h1,h2]=ans.split('|').map(s=>s.trim().toLowerCase());
    const full=(h1+' '+h2).trim();
    vs.forEach(v=>{
      let m=0;
      if(v===full)m=2;
      else{
        const a1=v===h1||v.startsWith(h1+' '),a2=v===h2||v.endsWith(' '+h2);
        m=(a1||a2)?1:0;
      }
      if(m>best)best=m;
    });
  });
  return best;
}

/* ---------- picking questions ---------- */
function sample(p,n,spread){
  p=p.slice();const out=[];
  const draw=src=>{let r=Math.random()*src.reduce((a,x)=>a+wt(x),0),i=0;for(;i<src.length-1;i++){r-=wt(src[i]);if(r<=0)break}return src[i]};
  while(out.length<n&&p.length){
    let src=p;
    if(spread){const used=new Set(out.map(x=>x.c)),fresh=p.filter(x=>!used.has(x.c));if(fresh.length)src=fresh}
    const q=draw(src);out.push(q);p.splice(p.indexOf(q),1);
  }
  return out;
}
function record(q,m){
  const st=PK.m[q.id]||(PK.m[q.id]={b:0,m:0});
  if(m===2)st.b=Math.min(4,st.b+1);else{st.b=0;st.m++}
  PK.t+=m;PK.x+=2;save();
}
const sentence=(q,mid)=>esc(q.b)+(q.b?' ':'')+mid+(q.e?(/^[,.;:?!']/.test(q.e)?'':' ')+esc(q.e):'');

/* ---------- screens ---------- */
function home(){
  K=null;const all=items();
  if(!all.length){$('view').innerHTML='<div class="empty">Part 4 sentences not found. Check that part1.js, part1b.js, part1c.js and part1d.js are in the same folder as this page.</div>';return}
  const wk=all.filter(weak).length,cats=Object.keys(KWC).filter(k=>all.some(q=>q.c===k));
  $('view').innerHTML=`<div class="goal"><div class="goal-t"><b>Part 4: key word transformations</b><span>${all.length} sentences</span></div><p class="tip">Complete the second sentence so that it means the same as the first. Use the key word, unchanged. Write 2 to 5 words including the key word. Each answer is worth 2 marks.</p></div>
  <div class="modes"><button class="mode hero" data-kw="start" data-m="exam"><h3>Exam round</h3><p>Six questions, a different structure in each, like the real Part 4.</p></button>
  <button class="mode" data-kw="start" data-m="ten"><h3>Practice ten</h3><p>Ten sentences from the structure you choose below.</p></button>
  <button class="mode" data-kw="start" data-m="weak"><h3>Weak spots</h3><p>Sentences where you lost marks${wk?' ('+wk+' waiting)':''}.</p></button></div>
  <p style="margin-top:1rem"><label class="sel">Structure <select id="kwSel"><option value="all">Everything</option>${cats.map(k=>`<option value="${k}"${PK.c===k?' selected':''}>${esc(KWC[k])} (${all.filter(q=>q.c===k).length})</option>`).join('')}</select></label></p>
  <p class="tip" style="margin-top:.8rem">Your marks so far: ${PK.t} out of ${PK.x}. Best round: ${PK.best}.</p>`;
}
function start(mode){
  let p=items().filter(inCat);
  if(mode==='weak')p=p.filter(weak);
  if(!p.length){$('view').insertAdjacentHTML('afterbegin','<div class="empty">Nothing to practise here yet. '+(mode==='weak'?'Play an Exam round first, then come back.':'Choose another structure.')+'</div>');return}
  const exam=mode==='exam';
  K={mode,items:sample(p,exam?6:10,exam),i:0,marks:0,max:0,miss:[],done:false,hint:false,cur:null};
  show();
}
function show(){
  const q=K.items[K.i];K.done=false;K.hint=false;K.cur=null;
  $('view').innerHTML=`<div class="sbar"><button class="x" data-kw="quit" aria-label="Stop practising">✕</button><div class="prog"><i style="width:${K.i/K.items.length*100}%"></i></div><span class="combo" id="kwscore">${K.marks}/${K.max} marks</span></div>
  <article class="card q" id="kwcard"><div class="meta">${esc(KWC[q.c]||q.c)} · question ${K.i+1} of ${K.items.length}</div>
  <p class="stem">${esc(q.s)}</p>
  <p style="margin:-.4rem 0 .8rem"><span class="tile base">${esc(q.k)}</span></p>
  <p class="stem">${sentence(q,'<span class="gap" id="kwgap">&nbsp;</span>')}</p>
  <div class="typebox"><input class="search" id="kwi" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Your answer" aria-label="Your answer" style="font-size:1.1rem;font-weight:700"><button class="btn" data-kw="hint">Hint</button><button class="btn primary" data-kw="check">Check</button></div>
  <p class="tip" id="kwc" aria-live="polite" style="margin-top:.5rem">Use 2 to 5 words, including ${esc(q.k)}.</p>
  <div class="fb" id="kwfb" hidden></div></article>`;
  const t=$('kwi');if(t&&matchMedia('(pointer:fine)').matches)t.focus();
}
function note(msg,bad){const c=$('kwc');if(!c)return;c.textContent=msg;c.style.color=bad?'var(--no-ink)':'';}
function check(){
  if(!K||K.done)return;
  const q=K.items[K.i],inp=$('kwi'),raw=inp.value.trim(),t=norm(raw);
  if(!t)return;
  const n=wc(t);
  if(n<2||n>5){note(`That is ${n} word${n===1?'':'s'}. Use 2 to 5, including ${q.k}.`,true);return}
  if(!keyIn(q,t)){note(`Your answer must include ${q.k}, exactly as given.`,true);return}
  K.done=true;
  const m=score(q,t);
  K.marks+=m;K.max+=2;K.cur={q,m};
  if(m<2)K.miss.push({q,m});
  record(q,m);
  const g=$('kwgap');g.className='gap'+(m===2?' ok':m===0?' miss':'');g.textContent=raw;
  if(m===1)g.style.background='var(--hl)';
  inp.disabled=true;
  if(m<2)$('kwcard').classList.add('shake');
  const sc=$('kwscore');if(sc)sc.textContent=`${K.marks}/${K.max} marks`;
  const ans=q.a.map(a=>a.replace('|',' ')),mine=variants(t);
  const others=m===2?ans.filter(a=>!mine.includes(a.toLowerCase())):ans.slice(1);
  const fb=$('kwfb');fb.hidden=false;fb.className='fb '+(m===2?'ok':'no');
  fb.innerHTML=`<div class="fb-h">${m===2?'2 marks. '+esc(pick(PRAISE)):m===1?'1 mark. Half of it is right.':'0 marks.'}</div>
   ${m<2?`<p>Model answer: <b>${esc(ans[0])}</b></p>`:''}
   ${others.length?`<p>${m===2?'Also correct':'Also accepted'}: ${others.slice(0,4).map(a=>'<b>'+esc(a)+'</b>').join(', ')}</p>`:''}
   <p>${esc(q.w)}</p>
   ${m<2?'<p>Other correct answers are possible. If yours keeps the meaning and the grammar, you can <button class="btn" data-kw="own">count it as correct</button></p>':''}
   <button class="btn primary" data-kw="next">${K.i+1<K.items.length?'Next question':'See results'}</button>`;
  const nb=fb.querySelector('[data-kw=next]');if(nb)nb.focus();
}
function own(el){
  if(!K||!K.cur||K.cur.m===2||K.cur.own)return;
  const c=K.cur,add=2-c.m;
  K.cur.own=true;K.marks+=add;K.miss=K.miss.filter(x=>x.q!==c.q);
  PK.t+=add;const st=PK.m[c.q.id];if(st){st.b=2;st.m=Math.max(0,st.m-1)}save();
  const sc=$('kwscore');if(sc)sc.textContent=`${K.marks}/${K.max} marks`;
  const g=$('kwgap');g.className='gap ok';g.style.background='';
  $('kwfb').className='fb ok';
  el.closest('p').textContent=`Counted as correct. +${add} mark${add>1?'s':''}.`;
}
function results(){
  PK.rounds++;PK.best=Math.max(PK.best,K.marks);save();
  const pct=K.max?Math.round(K.marks/K.max*100):0,lost={};
  K.miss.forEach(x=>{lost[x.q.c]=(lost[x.q.c]||0)+(2-x.m)});
  const top=Object.entries(lost).sort((a,b)=>b[1]-a[1])[0];
  const msg=pct>=85?'Excellent round.':pct>=60?'Good round.':'Good practice. Mistakes are how these stick.';
  $('view').innerHTML=`<article class="card res"><div class="big">${K.marks}/${K.max}</div><p style="margin:.3rem auto 0">marks. ${msg}</p>
  <div class="coach"><b>Coach says</b><p>${top?'Revisit: <b>'+esc(KWC[top[0]]||top[0])+'</b> ('+top[1]+' mark'+(top[1]>1?'s':'')+' lost).':'No marks lost. Try Practice ten on a structure you find hard.'}</p></div>
  ${K.miss.length?`<div class="miss-list"><h2 style="font-size:1.1rem;margin-bottom:.3rem">Review these</h2>${K.miss.map(x=>`<div class="row"><p class="eg">${esc(x.q.s)} <b>${esc(x.q.k)}</b></p><p class="eg">${sentence(x.q,'<b>'+esc(x.q.a[0].replace('|',' '))+'</b>')}</p><p class="tip">${esc(x.q.w)}</p></div>`).join('')}</div>`:''}
  <div class="acts"><button class="btn primary" data-kw="start" data-m="${K.mode}">Another round</button><button class="btn" data-kw="home">Change mode</button></div></article>`;
  K=null;window.scrollTo(0,0);
}

/* ---------- wiring ---------- */
(function(){
  const nav=$('nav');
  if(nav&&!nav.querySelector('[data-t="kwt"]')){
    const b=document.createElement('button');
    b.dataset.act='tab';b.dataset.t='kwt';b.textContent='Part 4';nav.appendChild(b);
  }
})();
document.addEventListener('click',e=>{
  const nb=e.target.closest('#nav [data-t="kwt"]');
  if(nb){
    /* run after the main page has handled the tab click */
    setTimeout(()=>{
      const h=$('hotbar');if(h)h.innerHTML='';
      document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b===nb));
      home();window.scrollTo(0,0);
    },0);
    return;
  }
  const el=e.target.closest('[data-kw]');if(!el)return;
  const a=el.dataset.kw;
  if(a==='start')start(el.dataset.m);
  else if(a==='home'||a==='quit')home();
  else if(a==='check')check();
  else if(a==='own')own(el);
  else if(a==='hint'){
    if(!K||K.done)return;const q=K.items[K.i];
    const w=q.a[0].replace('|',' ').split(' ');K.hint=true;
    note(`Hint: it starts with "${w[0]}" and has ${w.length} word${w.length>1?'s':''}.`);$('kwi').focus();
  }
  else if(a==='next'){K.i++;K.i<K.items.length?show():results()}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='kwi'){e.preventDefault();check()}});
document.addEventListener('input',e=>{
  if(e.target.id!=='kwi'||!K||K.done)return;
  const q=K.items[K.i],t=norm(e.target.value);
  if(!t){note(`Use 2 to 5 words, including ${q.k}.`);return}
  const n=wc(t);
  note(`${n} word${n===1?'':'s'} · use 2 to 5, including ${q.k}.`,n>5);
});
document.addEventListener('change',e=>{if(e.target.id==='kwSel'){PK.c=e.target.value;save();home()}});
})();
