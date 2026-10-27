/* ═══ OPEN › — the Model page's line as a poster card (27 Oct 2026) ═══════
   Shared by the Model pages that grew from the Essay one. A page sets
   window.OC = { line(slot,idx) → HTML of the frame, state(slot,idx) → {h,i},
   roll(slot,dir,idx), label(slot,idx) → '02 · First feature',
   head(slot,idx) → the Anton headline, sample(slot,idx) → text or null },
   and calls OC_pill(slot,idx) where its arrows used to be. */
(function(){
  const css=`/* OPEN › (26 Oct): the arrows are gone from the page. Each line ends in a
   grey pill, as on the Plan page; it opens that line as a card. Inside the
   card the arrows choose another wording (backward / forward), and the
   question's own plan for that part sits under the frame. */
.opn{flex:none;display:inline-flex;align-items:center;gap:.3rem;border:none;cursor:pointer;background:rgba(0,0,0,0.05);border-radius:999px;padding:.32rem .7rem;
  font-family:'Geist Mono',monospace;font-size:.62rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:rgba(0,0,0,0.45);transition:background .15s;white-space:nowrap}
.opn:hover{background:rgba(0,0,0,0.09)}
.opn i{font-style:normal}
.mscrim{position:fixed;inset:0;z-index:300;background:rgba(20,17,14,.45);opacity:0;pointer-events:none;transition:opacity .2s}
.mscrim.on{opacity:1;pointer-events:auto}
/* poster style (26 Oct, after the Sentence Builder): a half-screen paper card, caramel
   bar + spaced label, the point as an Anton headline, the frame large,
   thin rules, the wording count and one black pill at the foot */
.mcard{position:fixed;z-index:301;left:50%;top:50%;width:min(620px,calc(100vw - 1.5rem));max-height:calc(100dvh - 2rem);display:flex;flex-direction:column;
  background:#F3F1EC;border-radius:4px;box-shadow:0 24px 60px rgba(0,0,0,.3);padding:1.6rem 1.6rem 1.2rem;transform:translate(-50%,-48%) scale(.97);opacity:0;pointer-events:none;
  transition:transform .25s cubic-bezier(.2,1.4,.4,1),opacity .2s}
.mcard.on{transform:translate(-50%,-50%) scale(1);opacity:1;pointer-events:auto}
.mcard .mx{position:absolute;z-index:3;top:1rem;right:1rem;width:2.2rem;height:2.2rem;border-radius:50%;border:none;background:rgba(0,0,0,.06);font-size:.95rem;color:rgba(0,0,0,.5);cursor:pointer}
.mcard .ml{display:flex;align-items:center;gap:.8rem;font-family:'Geist Mono',monospace;font-size:.72rem;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:#6B655C;padding-right:2.6rem}
.mcard .ml::before{content:'';width:2.2rem;height:.7rem;background:#A9875F;flex:none}
.mcard .mt{margin:.9rem 0 0;padding-bottom:1rem;border-bottom:1.5px solid rgba(20,17,14,.18);font:400 clamp(1.8rem,8vw,2.6rem)/1.02 'Anton',Impact,sans-serif;color:#141210;letter-spacing:.005em}
.mcard .mb{min-height:0;overflow:auto;padding:1rem 0 1.1rem}
.mcard .mline{font-size:clamp(1.15rem,4.6vw,1.4rem);line-height:1.55;color:#141210}
.mcard .mline .soft,.mcard .mline .view{font-size:inherit}
.mcard .mline .sig{font-size:inherit}
.mcard .mrows{margin-top:1rem}
.mcard .dr{display:grid;grid-template-columns:6.2rem 1fr;gap:.8rem;align-items:baseline;font-size:1.02rem;line-height:1.45;color:#2c2a27}
.mcard .dr+.dr{margin-top:.55rem}
.mcard .dl{font-family:'Geist Mono',monospace;font-size:.64rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#8A8378}
.mcard .dr.pt{font-weight:600}
.mcard .mfoot{display:flex;justify-content:space-between;align-items:center;gap:.8rem;padding-top:1rem;border-top:1.5px solid rgba(20,17,14,.18)}
.mcard .mv{font-size:1rem;color:#6B655C}
.mcard .mv b{color:#141210;font-weight:800}
.mcard .mbtns{display:flex;align-items:center;gap:.5rem}
.mcard .mprev{border:none;cursor:pointer;background:none;font-size:1rem;font-weight:600;color:#6B655C;padding:.6rem .4rem}
.mcard .mprev:disabled{opacity:.3;cursor:default}
.mcard .mnext{border:none;cursor:pointer;background:#141210;color:#fff;border-radius:999px;padding:.8rem 1.4rem;font-size:1rem;font-weight:700}
.mcard .mnext:active{transform:scale(.96)}
@media (max-width:480px){ .mcard{padding:1.3rem 1.2rem 1rem} .mcard .dr{grid-template-columns:5.2rem 1fr;font-size:.96rem} .mcard .mnext{padding:.7rem 1.1rem;font-size:.95rem} }
@media (prefers-reduced-motion:reduce){ .mcard,.mscrim{transition:none} }`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let M=null;
  window.OC_pill=(slot,idx)=>`<button type="button" class="opn" onclick="event.stopPropagation();openM('${slot}',${idx===undefined?'undefined':idx})">Open <i>›</i></button>`;
  window.openM=function(slot,idx){
    if(!document.getElementById('mcard')){
      document.body.insertAdjacentHTML('beforeend','<div class="mscrim" id="mscrim"></div><div class="mcard" id="mcard" role="dialog" aria-modal="true"></div>');
      document.getElementById('mscrim').onclick=closeM;
    }
    M={slot,idx}; draw();
    requestAnimationFrame(()=>{ document.getElementById('mscrim').classList.add('on'); document.getElementById('mcard').classList.add('on'); });
  };
  function draw(){
    const O=window.OC, {slot,idx}=M, s=O.state(slot,idx), smp=O.sample?O.sample(slot,idx):null;
    const c=document.getElementById('mcard');
    c.setAttribute('aria-label',O.label(slot,idx));
    c.innerHTML=`<button type="button" class="mx" id="mx" aria-label="Close">✕</button><div class="ml">${esc(O.label(slot,idx))}</div><div class="mt">${esc(O.head(slot,idx))}</div>`+
      `<div class="mb"><div class="mline">${O.line(slot,idx)}</div>`+
      (smp?`<div class="mrows"><div class="dr"><span class="dl">In the sample</span><span>${esc(smp)}</span></div></div>`:'')+`</div>`+
      `<div class="mfoot"><span class="mv">Wording <b>${s.i+1}</b></span><span class="mbtns"><button type="button" class="mprev" id="mprev"${s.i>0?'':' disabled'} aria-label="Previous wording">←</button><button type="button" class="mnext" id="mnext">Another wording →</button></span></div>`;
    document.getElementById('mx').onclick=closeM;
    document.getElementById('mprev').onclick=()=>{ O.roll(slot,-1,idx); setTimeout(draw,120); };
    document.getElementById('mnext').onclick=()=>{ O.roll(slot,1,idx); setTimeout(draw,120); };
  }
  function closeM(){ const c=document.getElementById('mcard'); if(!c) return; c.classList.remove('on'); document.getElementById('mscrim').classList.remove('on'); M=null; }
  window.closeM=closeM;
  document.addEventListener('keydown',e=>{ if(!M) return; if(e.key==='Escape') closeM(); if(e.key==='ArrowRight') document.getElementById('mnext').click(); if(e.key==='ArrowLeft'){ const b=document.getElementById('mprev'); if(!b.disabled) b.click(); } });
})();
