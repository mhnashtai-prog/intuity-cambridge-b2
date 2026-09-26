/* ═══ CHALLENGE EXAM · MATCH ════════════════════════════════════════════
   Four pairs: tap an item on the left, then its partner on the right.
   When all four are joined, Check. Receptive.
   Round: { prompt, pairs: [["left","right"] × 4], note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(window.ChallengeGames=window.ChallengeGames||{}).match={
  title:'Match', kind:'exam', skill:'receptive',
  solution:r=>r.pairs.map(p=>p[0]+' → '+p[1]).join(' · '),
  render(host,r,ctx){
    const L=r.pairs.map((p,k)=>({t:p[0],k})), R=ctx.shuffle(r.pairs.map((p,k)=>({t:p[1],k})));
    let pick=null; const joined={};                       /* left index → right index */
    host.innerHTML=`<p class="cg-prompt">${ctx.esc(r.prompt)} Tap one on the left, then its partner on the right.</p>
      <div class="cg-match"><div>${L.map(x=>`<button class="cg-m" type="button" data-l="${x.k}">${ctx.esc(x.t)}</button>`).join('')}</div>
      <div>${R.map(x=>`<button class="cg-m" type="button" data-r="${x.k}">${ctx.esc(x.t)}</button>`).join('')}</div></div>
      <div class="cg-row"><button class="cg-btn cg-ghost" type="button" id="cgClear">Clear</button><button class="cg-btn" type="button" id="cgCheck" disabled>Check</button></div>`;
    const mark=()=>{ host.querySelectorAll('.cg-m').forEach(b=>{ b.classList.remove('cg-sel'); b.removeAttribute('data-n'); });
      if(pick!=null) host.querySelector(`[data-l="${pick}"]`).classList.add('cg-sel');
      Object.keys(joined).forEach((l,n)=>{ host.querySelector(`[data-l="${l}"]`).dataset.n=n+1; host.querySelector(`[data-r="${joined[l]}"]`).dataset.n=n+1; });
      host.querySelector('#cgCheck').disabled=Object.keys(joined).length<r.pairs.length; };
    host.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{ if(host.dataset.locked||host.dataset.wait) return; const l=+b.dataset.l; if(joined[l]!=null){ delete joined[l]; } pick=l; mark(); });
    host.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{ if(host.dataset.locked||host.dataset.wait||pick==null) return; const rr=+b.dataset.r;
      Object.keys(joined).forEach(l=>{ if(joined[l]===rr) delete joined[l]; }); joined[pick]=rr; pick=null; mark(); });
    host.querySelector('#cgClear').onclick=()=>{ if(host.dataset.locked||host.dataset.wait) return; Object.keys(joined).forEach(k=>delete joined[k]); pick=null; mark(); };
    host.querySelector('#cgCheck').onclick=()=>{
      if(host.dataset.locked||host.dataset.wait) return;
      const bad=Object.keys(joined).filter(l=>+l!==joined[l]);
      const given=Object.keys(joined).map(l=>r.pairs[l][0]+' → '+r.pairs[joined[l]][1]).join(' · ');
      if(!ctx.exam) Object.keys(joined).forEach(l=>{ const ok=+l===joined[l];
        host.querySelector(`[data-l="${l}"]`).classList.toggle(ok?'cg-ok':'cg-no',true); host.querySelector(`[data-r="${joined[l]}"]`).classList.toggle(ok?'cg-ok':'cg-no',true); });
      const again=ctx.answer(!bad.length,given);
      if(!again){ host.dataset.locked='1'; return; }
      host.dataset.wait='1';            /* show the wrong pairs for a moment, then clear them; no taps in between */
      setTimeout(()=>{ bad.forEach(l=>delete joined[l]); host.querySelectorAll('.cg-m').forEach(b=>b.classList.remove('cg-ok','cg-no')); delete host.dataset.wait; mark(); },900);
    };
  }
};
