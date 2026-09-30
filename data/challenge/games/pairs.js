/* ═══ CHALLENGE GAME · PAIRS ════════════════════════════════════════════
   Fill the gap, as Phrasal Verbs 2's Pairs plays it: a card lies face
   down with only its ring showing — the word in brackets, the clue.
   Turn it over and the sentence is there, with the answer typed straight
   into the gap, inside the sentence rather than in a box underneath.
   Productive, like Fill the gap: typed, and marked exactly as the Exam
   marks it (game-kit.js normalising, every accepted answer).
   Round: { prompt: "… ___ (clue) …", answer: [accepted…], note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const K = window.GameKit;

  const clueOf = p => { const m = String(p).match(/___\s*\(([^)]+)\)/); return m ? m[1] : null; };

  (window.ChallengeGames = window.ChallengeGames || {}).pairs = {
    title:'Pairs', kind:'game', skill:'productive',
    accepts: r => r.game === 'gap' && typeof r.prompt === 'string' && r.prompt.includes('___') && Array.isArray(r.answer) && r.answer.length,
    solution: r => r.answer[0],
    render(host, r, ctx){
      const clue = clueOf(r.prompt);
      const line = clue ? r.prompt.replace(/___\s*\([^)]+\)/, '___') : r.prompt;
      const [pre, post] = [line.split('___')[0], line.split('___').slice(1).join('___')];
      host.innerHTML = `<p class="cg-prompt">Turn the card over and write the missing words into the sentence.</p>
        <div class="fc-stage"><div class="fc-card" id="fcCard">
          <div class="fc-face fc-back" id="fcBack" role="button" tabindex="0" aria-label="Turn the card over">
            <span class="gk-ring${(clue || '').length > 7 ? ' gk-pill' : ''}">${ctx.esc(clue || '?')}</span><span class="gk-hint">Tap to turn over</span></div>
          <div class="fc-face fc-front">
            ${clue ? `<span class="fc-corner"><span class="gk-ring">${ctx.esc(clue)}</span></span>` : ''}
            <p class="cg-line">${ctx.esc(pre)}<input class="gk-in" id="fcIn" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="The missing words" tabindex="-1">${ctx.esc(post)}</p>
            <div class="fc-row"><button class="cg-btn" type="button" id="fcCheck" tabindex="-1">Check</button></div>
          </div></div></div>`;
      const card = host.querySelector('#fcCard'), back = host.querySelector('#fcBack'), inp = host.querySelector('#fcIn'), btn = host.querySelector('#fcCheck');
      K.grow(inp);
      const turn = () => { if (card.classList.contains('fc-over')) return; card.classList.add('fc-over');
        inp.tabIndex = 0; btn.tabIndex = 0; back.tabIndex = -1; setTimeout(() => inp.focus(), 420); };
      back.onclick = turn; back.onkeydown = e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); turn(); } };
      setTimeout(() => back.focus(), 250);
      const go = () => {
        if (host.dataset.locked) return; const v = K.norm(inp.value); if (!v) return;
        if (ctx.nudge && (r.alsoRight || []).map(K.norm).includes(v) && ctx.nudge(r.alsoNote)){ K.shake(inp); inp.select(); return; }
        const ok = r.answer.map(K.norm).includes(v), again = ctx.answer(ok, inp.value.trim());
        if (ok){ const s = document.createElement('span'); s.className = 'gk-good'; s.textContent = inp.value.trim(); inp.replaceWith(s); }
        else K.shake(inp);
        if (!again){ host.dataset.locked = '1'; if (!ok){ inp.disabled = true; } btn.disabled = true; } else if (!ok) inp.select();
      };
      btn.onclick = go; inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    }
  };
})();
