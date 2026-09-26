/* ═══ CHALLENGE EXAM · CORRECT THE ERROR ════════════════════════════════
   One sentence with one mistake. The student types the correct form of the
   wrong part. Productive: the answer must be written, not recognised.
   Round: { sentence, answer: ["was made", …], note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(window.ChallengeGames=window.ChallengeGames||{}).correct={
  title:'Correct the error', kind:'exam', skill:'productive',
  solution:r=>r.answer[0],
  render(host,r,ctx){
    const norm=s=>String(s).toLowerCase().replace(/[’']/g,"'").replace(/[.!?,]/g,'').replace(/\s+/g,' ').trim();
    host.innerHTML=`<p class="cg-prompt">One part of this sentence is wrong. Type the correct form of that part.</p>
      <p class="cg-line">${ctx.esc(r.sentence)}</p>
      <div class="cg-field"><input id="cgIn" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="The corrected words" aria-label="Your correction">
      <button class="cg-btn" type="button" id="cgCheck">Check</button></div>`;
    const inp=host.querySelector('#cgIn'), go=()=>{
      if(host.dataset.locked) return; const v=norm(inp.value); if(!v) return;
      const ok=r.answer.map(norm).includes(v), again=ctx.answer(ok,inp.value.trim());
      if(!ok&&!ctx.exam){ inp.classList.add('cg-shake'); setTimeout(()=>inp.classList.remove('cg-shake'),450); }
      if(!again){ host.dataset.locked='1'; inp.disabled=true; host.querySelector('#cgCheck').disabled=true; } else inp.select();
    };
    host.querySelector('#cgCheck').onclick=go; inp.addEventListener('keydown',e=>{ if(e.key==='Enter') go(); });
    setTimeout(()=>inp.focus(),300);
  }
};
