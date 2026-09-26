/* ═══ CHALLENGE GAME · FILL THE GAP ═════════════════════════════════════
   One sentence, a verb in brackets, the form typed in.
   Round: { prompt: "… ___ (verb) …", answer: ["accepted", "also accepted"], note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(window.ChallengeGames=window.ChallengeGames||{}).gap={
  title:'Fill the gap',
  solution:r=>r.answer[0],
  render(host,r,ctx){
    const norm=s=>String(s).toLowerCase().replace(/[’']/g,"'").replace(/[.!?,]/g,'').replace(/\s+/g,' ').trim();
    host.innerHTML=`<p class="cg-line">${ctx.esc(r.prompt).replace('___','<span class="cg-blank" id="cgBlank">&nbsp;</span>')}</p>
      <div class="cg-field"><input id="cgIn" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the missing words" aria-label="Your answer">
      <button class="cg-btn" type="button" id="cgCheck">Check</button></div>`;
    const inp=host.querySelector('#cgIn'), go=()=>{
      if(host.dataset.locked) return; const v=norm(inp.value); if(!v) return;
      const ok=r.answer.map(norm).includes(v);
      const again=ctx.answer(ok,inp.value.trim());
      if(ok&&!ctx.exam) host.querySelector('#cgBlank').textContent=r.answer[0];
      if(!ok&&!ctx.exam){ inp.classList.add('cg-shake'); setTimeout(()=>inp.classList.remove('cg-shake'),450); }
      if(!again){ host.dataset.locked='1'; inp.disabled=true; host.querySelector('#cgCheck').disabled=true; } else inp.select();
    };
    host.querySelector('#cgCheck').onclick=go; inp.addEventListener('keydown',e=>{ if(e.key==='Enter') go(); });
    setTimeout(()=>inp.focus(),300);
  }
};
