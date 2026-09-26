/* ═══ CHALLENGE EXAM · KEY WORD TRANSFORMATION ══════════════════════════
   B2 First Reading & Use of English, Part 4: a sentence, a key word in
   capitals, and a second sentence to complete in two to five words,
   using the key word without changing it. Productive.
   Round: { prompt, keyword, stem: "… ___ …", answer: ["accepted", …], note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(window.ChallengeGames=window.ChallengeGames||{}).transform={
  title:'Key word transformation', kind:'exam', skill:'productive',
  solution:r=>r.answer[0],
  render(host,r,ctx){
    const norm=s=>String(s).toLowerCase().replace(/[’']/g,"'").replace(/[.!?,]/g,'').replace(/\s+/g,' ').trim();
    host.innerHTML=`<p class="cg-prompt">Complete the second sentence so that it means the same as the first. Use the word given, and between two and five words.</p>
      <p class="cg-act">${ctx.esc(r.prompt)}</p>
      <p class="cg-key"><span>${ctx.esc(r.keyword.toUpperCase())}</span></p>
      <p class="cg-line">${ctx.esc(r.stem).replace('___','<span class="cg-blank" id="cgBlank">&nbsp;</span>')}</p>
      <div class="cg-field"><input id="cgIn" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Two to five words" aria-label="Your answer">
      <button class="cg-btn" type="button" id="cgCheck">Check</button></div>`;
    const inp=host.querySelector('#cgIn'), go=()=>{
      if(host.dataset.locked) return; const v=norm(inp.value); if(!v) return;
      const ok=r.answer.map(norm).includes(v), again=ctx.answer(ok,inp.value.trim());
      if(ok&&!ctx.exam) host.querySelector('#cgBlank').textContent=r.answer[0];
      if(!ok&&!ctx.exam){ inp.classList.add('cg-shake'); setTimeout(()=>inp.classList.remove('cg-shake'),450); }
      if(!again){ host.dataset.locked='1'; inp.disabled=true; host.querySelector('#cgCheck').disabled=true; } else inp.select();
    };
    host.querySelector('#cgCheck').onclick=go; inp.addEventListener('keydown',e=>{ if(e.key==='Enter') go(); });
    setTimeout(()=>inp.focus(),300);
  }
};
