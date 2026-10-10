/* ═══ CHALLENGE GAME · FLIP ═════════════════════════════════════════════
   Key word transformation as a card with two sides — which is what the
   task is: one meaning, written twice. The front holds the first sentence
   and the key word in its ring. Turn the card over: the second sentence is
   on the back, waiting for its two to five words, typed into the gap. The
   first sentence stays on the back too, small, because the exam lets you
   look at both, and so does this.
   Productive, like Key word transformation: typed, marked exactly as the
   Exam marks it.
   Round: { prompt, keyword, stem: "… ___ …", answer: [accepted…], note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const K = window.GameKit;
  K.style('gk-flip', `
.fl-first{font-family:var(--f-display);font-weight:700;font-size:clamp(1.05rem,3vw,1.25rem);line-height:1.5;color:var(--ink);text-align:center;max-width:28rem;margin:0}
.fl-key{display:flex;flex-direction:column;align-items:center;gap:.35rem}
.fl-key .gk-ring{width:auto;min-width:4.4rem;height:4.4rem;font-size:.9rem;letter-spacing:.08em;padding:0 1.1rem;border-radius:999px}
.fl-rule{font-size:.8rem;color:var(--faint);text-align:center;margin:0}`);

  (window.ChallengeGames = window.ChallengeGames || {}).flip = {
    title:'Flip', kind:'game', skill:'productive',
    accepts: r => r.game === 'transform' && r.keyword && typeof r.stem === 'string' && r.stem.includes('___') && Array.isArray(r.answer) && r.answer.length,
    solution: r => r.answer[0],
    render(host, r, ctx){
      const key = String(r.keyword).toUpperCase();
      const [pre, post] = [r.stem.split('___')[0], r.stem.split('___').slice(1).join('___')];
      host.innerHTML = `<p class="cg-prompt">Same meaning, other side. Turn the card over and complete it in two to five words, using the key word.</p>
        <div class="fc-stage"><div class="fc-card" id="fcCard" style="min-height:14rem">
          <div class="fc-face fc-back" id="fcBack" role="button" tabindex="0" aria-label="Turn the card over">
            <p class="fl-first">${ctx.esc(r.prompt)}</p>
            <span class="fl-key"><span class="gk-ring">${ctx.esc(key)}</span><span class="gk-hint">Key word · tap to turn over</span></span></div>
          <div class="fc-face fc-front">
            <span class="fc-corner"><span class="gk-ring">${ctx.esc(key)}</span></span>
            <p class="fc-act">${ctx.esc(r.prompt)}</p>
            <p class="cg-line">${ctx.esc(pre)}<input class="gk-in" id="fcIn" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Two to five words" tabindex="-1">${ctx.esc(post)}</p>
            <div class="fc-row"><button class="cg-btn" type="button" id="fcCheck" tabindex="-1">Check</button></div>
          </div></div></div>
        <p class="fl-rule">Don’t change the key word.</p>`;
      const card = host.querySelector('#fcCard'), back = host.querySelector('#fcBack'), inp = host.querySelector('#fcIn'), btn = host.querySelector('#fcCheck');
      K.grow(inp);
      const turn = () => { if (card.classList.contains('fc-over')) return; card.classList.add('fc-over');
        inp.tabIndex = 0; btn.tabIndex = 0; back.tabIndex = -1; setTimeout(() => inp.focus(), 420); };
      back.onclick = turn; back.onkeydown = e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); turn(); } };
      setTimeout(() => back.focus(), 250);
      const go = () => {
        if (host.dataset.locked) return; const v = K.norm(inp.value); if (!v) return;
        if (ctx.nudge && (r.alsoRight || []).map(K.norm).includes(v) && ctx.nudge(r.alsoNote)){ K.shake(inp); inp.select(); return; }
        const ok = K.same(v, r.answer), again = ctx.answer(ok, inp.value.trim());
        if (ok){ const s = document.createElement('span'); s.className = 'gk-good'; s.textContent = inp.value.trim(); inp.replaceWith(s); }
        else K.shake(inp);
        if (!again){ host.dataset.locked = '1'; if (!ok) inp.disabled = true; btn.disabled = true; } else if (!ok) inp.select();
      };
      btn.onclick = go; inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    }
  };
})();
