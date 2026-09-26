/* ═══ CHALLENGE GAME · SORT IT ══════════════════════════════════════════
   Six items into two boxes: tap an item, then its box. With an item
   selected, a tap anywhere in a box drops it there; with nothing selected,
   tapping a placed item sends it back.
   Round: { prompt, bins: ["A","B"], items: [["item",0],["item",1]…], note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(window.ChallengeGames=window.ChallengeGames||{}).sort={
  title:'Sort it', kind:'exam', skill:'receptive',
  solution:r=>r.bins.map((b,k)=>b+': '+r.items.filter(x=>x[1]===k).map(x=>x[0]).join(', ')).join(' · '),
  render(host,r,ctx){
    let pick=null;
    host.innerHTML=`<p class="cg-prompt">${ctx.esc(r.prompt)} Tap an item, then its box.</p>
      <div class="cg-chips" id="cgPool">${ctx.shuffle(r.items).map(([w,b])=>`<button class="cg-chip" type="button" data-w="${ctx.esc(w)}" data-b="${b}">${ctx.esc(w)}</button>`).join('')}</div>
      <div class="cg-bins">${r.bins.map((b,k)=>`<div class="cg-bin" data-bin="${k}"><h4>${ctx.esc(b)}</h4></div>`).join('')}</div>
      <div class="cg-row"><button class="cg-btn" type="button" id="cgCheck" disabled>Check</button></div>`;
    const pool=host.querySelector('#cgPool'), check=host.querySelector('#cgCheck');
    const ready=()=>host.querySelectorAll('.cg-bin').forEach(b=>b.classList.toggle('cg-ready',!!pick));
    const can=()=>{ check.disabled=pool.querySelectorAll('.cg-chip').length>0; };
    host.querySelectorAll('.cg-chip').forEach(c=>c.onclick=e=>{
      if(host.dataset.locked||host.dataset.wait) return;
      if(c.parentElement!==pool){ if(pick) return; e.stopPropagation(); c.classList.remove('cg-ok','cg-no'); delete c.dataset.in; pool.appendChild(c); ready(); can(); return; }
      e.stopPropagation(); host.querySelectorAll('.cg-sel').forEach(x=>x.classList.remove('cg-sel')); pick=c; c.classList.add('cg-sel'); ready();
    });
    host.querySelectorAll('.cg-bin').forEach(b=>b.onclick=()=>{ if(host.dataset.locked||host.dataset.wait||!pick) return;
      pick.classList.remove('cg-sel'); b.appendChild(pick); pick.dataset.in=b.dataset.bin; pick=null; ready(); can(); });
    check.onclick=()=>{
      if(host.dataset.locked||host.dataset.wait) return;
      const placed=[...host.querySelectorAll('.cg-bin .cg-chip')], bad=placed.filter(c=>c.dataset.in!==c.dataset.b);
      if(!ctx.exam) placed.forEach(c=>{ const ok=c.dataset.in===c.dataset.b; c.classList.toggle('cg-ok',ok); c.classList.toggle('cg-no',!ok); });
      const given=r.bins.map((b,k)=>b+': '+placed.filter(c=>c.dataset.in==k).map(c=>c.dataset.w).join(', ')).join(' · ');
      const again=ctx.answer(!bad.length,given);
      if(!again){ host.dataset.locked='1'; return; }
      host.dataset.wait='1';            /* show the wrong items for a moment, then return them; no taps in between */
      setTimeout(()=>{ bad.forEach(c=>{ c.classList.remove('cg-no'); delete c.dataset.in; pool.appendChild(c); }); delete host.dataset.wait; can(); },900);
    };
  }
};
