/* ═══ CHALLENGE GAME · PENDULUM ═════════════════════════════════════════
   The Passive game's round, in a focus card: four swinging pendulums with a
   form in each ring, the active and passive sentences printed underneath.
   Round: { active, passive: "… ___ …", options: [4], answer, note }
      (the shape of passive-voice-game.json, so its rounds import as-is)
   or:    { context, line: "… ___ …", options: [4], answer, note, labels?: [2] }
      for any other topic — labels default to Situation / Sentence
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(window.ChallengeGames=window.ChallengeGames||{}).pendulum={
  title:'Swing', kind:'game', skill:'receptive',
  solution:r=>r.answer,
  render(host,r,ctx){
    /* Passive rounds carry active/passive; any other topic carries context/line
       and, if it likes, its own two labels. */
    const first=r.active!=null?r.active:r.context, second=r.passive!=null?r.passive:r.line;
    const lab=r.labels||(r.active!=null?['Active','Passive']:['Situation','Sentence']);
    host.innerHTML=`<div class="cg-dials">${ctx.shuffle(r.options).map((o,k)=>`<button class="dial-b" type="button" data-o="${ctx.esc(o)}" aria-label="${ctx.esc(o)}">
        <div class="pend-hang" style="animation-delay:${(k*-1.3).toFixed(2)}s" aria-hidden="true"><div class="pend-dial"><span>${ctx.esc(o)}</span></div></div></button>`).join('')}</div>
      <div class="cg-sent"><span class="cg-lab">${ctx.esc(lab[0])}</span><p class="cg-act">${ctx.esc(first)}</p>
      <span class="cg-lab">${ctx.esc(lab[1])}</span><p class="cg-line">${ctx.esc(second).replace('___','<span class="cg-blank">&nbsp;</span>')}</p></div>`;
    host.querySelectorAll('.dial-b').forEach(b=>b.onclick=()=>{
      if(host.dataset.locked||b.classList.contains('cg-no')) return;
      const ok=b.dataset.o===r.answer;
      b.classList.add(ctx.exam?'cg-picked':ok?'cg-ok':'cg-no');
      const again=ctx.answer(ok,b.dataset.o);
      if(!again){ host.dataset.locked='1'; host.querySelector('.cg-dials').classList.add('cg-done');
        if(ok&&!ctx.exam){ const bl=host.querySelector('.cg-blank'); bl.textContent=r.answer; } }
    });
  }
};
