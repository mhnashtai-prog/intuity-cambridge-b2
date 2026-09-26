/* ═══ CHALLENGE GAME · ODD ONE OUT ══════════════════════════════════════
   Four sentences, three right, one wrong: tap the wrong one.
   Round: { prompt, options: [4 sentences], answer: the wrong sentence, note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(window.ChallengeGames=window.ChallengeGames||{}).odd={
  title:'Odd one out',
  solution:r=>'The odd one out: “'+r.answer+'”',
  render(host,r,ctx){
    const L='ABCD';
    host.innerHTML=`<p class="cg-prompt">${ctx.esc(r.prompt||'Three are correct. Tap the one that isn’t.')}</p>
      <div class="cg-opts">${ctx.shuffle(r.options).map((o,k)=>`<button class="cg-opt" type="button" data-o="${ctx.esc(o)}"><span class="cg-l">${L[k]}</span><span>${ctx.esc(o)}</span></button>`).join('')}</div>`;
    host.querySelectorAll('.cg-opt').forEach(b=>b.onclick=()=>{
      if(host.dataset.locked) return;
      const ok=b.dataset.o===r.answer;
      b.classList.add(ctx.exam?'cg-picked':ok?'cg-ok':'cg-no');
      const again=ctx.answer(ok,b.dataset.o);
      if(again){ b.disabled=true; } else { host.dataset.locked='1'; host.querySelectorAll('.cg-opt').forEach(x=>x.disabled=true); }
    });
  }
};
