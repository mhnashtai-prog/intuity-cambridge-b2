/* ═══ CHALLENGE GAME · PUT IT IN ORDER ══════════════════════════════════
   Words in a jumble, tapped into the right order.
   Round: { prompt, words: ["The","bridge","was","built","in","1998."], note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(window.ChallengeGames=window.ChallengeGames||{}).order={
  title:'Put it in order', kind:'exam', skill:'productive',
  solution:r=>r.words.join(' '),
  render(host,r,ctx){
    const seq=[];
    host.innerHTML=`<p class="cg-prompt">${ctx.esc(r.prompt||'Build the sentence.')} Tap the words in order.</p><div class="cg-built" id="cgBuilt"></div>
      <div class="cg-chips" id="cgPool">${ctx.shuffle(r.words.map((w,k)=>({w,k}))).map(o=>`<button class="cg-chip" type="button" data-k="${o.k}">${ctx.esc(o.w)}</button>`).join('')}</div>
      <div class="cg-row"><button class="cg-btn cg-ghost" type="button" id="cgUndo">Undo</button><button class="cg-btn" type="button" id="cgCheck">Check</button></div>`;
    const built=host.querySelector('#cgBuilt'), draw=()=>{ built.innerHTML=seq.map(k=>`<span class="cg-chip">${ctx.esc(r.words[k])}</span>`).join(''); };
    host.querySelectorAll('#cgPool .cg-chip').forEach(c=>c.onclick=()=>{ if(host.dataset.locked) return; seq.push(+c.dataset.k); c.classList.add('cg-used'); draw(); });
    host.querySelector('#cgUndo').onclick=()=>{ if(host.dataset.locked||!seq.length) return; const k=seq.pop(); host.querySelector(`#cgPool .cg-chip[data-k="${k}"]`).classList.remove('cg-used'); draw(); };
    host.querySelector('#cgCheck').onclick=()=>{
      if(host.dataset.locked||seq.length<r.words.length) return;
      const given=seq.map(k=>r.words[k]).join(' '), ok=given===r.words.join(' ');
      const again=ctx.answer(ok,given);
      if(!again){ host.dataset.locked='1'; return; }
      built.classList.add('cg-shake'); setTimeout(()=>built.classList.remove('cg-shake'),450);
      seq.splice(0).forEach(k=>host.querySelector(`#cgPool .cg-chip[data-k="${k}"]`).classList.remove('cg-used')); draw();
    };
  }
};
