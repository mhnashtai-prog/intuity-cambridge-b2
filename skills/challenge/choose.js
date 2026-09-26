/* ═══ CHALLENGE GAME · CHOOSE ═══════════════════════════════════════════
   One sentence with a gap, four options, one right. Shared by every
   Challenge; the agreement every game file follows:

     ChallengeGames.<name> = {
       title,                         the card's headline
       render(host, round, ctx),      draws one round into the focus card
       solution(round)                the right answer, for the exam review
     }
   ctx.answer(correct, given) reports each attempt and returns true when the
   player may try again (Game mode, lives left) — the game never decides
   the rules, the Challenge does. ctx.esc / ctx.shuffle are shared helpers.
   Round: { prompt: "… ___ …", options: [4], answer, note }
   ═══════════════════════════════════════════════════════════════════════ */
(window.ChallengeGames=window.ChallengeGames||{}).choose={
  title:'Choose',
  solution:r=>r.answer,
  render(host,r,ctx){
    const L='ABCD';
    host.innerHTML=`<p class="cg-line">${ctx.esc(r.prompt).replace('___','<span class="cg-blank">&nbsp;</span>')}</p>
      <div class="cg-opts">${ctx.shuffle(r.options).map((o,k)=>`<button class="cg-opt" type="button" data-o="${ctx.esc(o)}"><span class="cg-l">${L[k]}</span><span>${ctx.esc(o)}</span></button>`).join('')}</div>`;
    host.querySelectorAll('.cg-opt').forEach(b=>b.onclick=()=>{
      if(host.dataset.locked) return;
      const ok=b.dataset.o===r.answer;
      b.classList.add(ctx.exam?'cg-picked':ok?'cg-ok':'cg-no');
      if(ok&&!ctx.exam){ const bl=host.querySelector('.cg-blank'); if(bl) bl.textContent=r.answer; }
      const again=ctx.answer(ok,b.dataset.o);
      if(again){ b.disabled=true; } else { host.dataset.locked='1'; host.querySelectorAll('.cg-opt').forEach(x=>x.disabled=true); }
    });
  }
};
