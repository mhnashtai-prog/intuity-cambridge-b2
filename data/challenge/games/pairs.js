/* ═══ CHALLENGE GAME · PAIRS ════════════════════════════════════════════
   Fill the gap on a card: the clue — the word in brackets — sits in the
   ring in the corner, and the answer is typed straight into the gap,
   inside the sentence rather than in a box underneath.
   The card used to lie face down first and had to be turned over. The
   turn hid nothing (the clue was on the back as well as the front), so it
   was a tap with no decision in it, and it has gone.
   Productive, like Fill the gap: typed, and marked exactly as the Exam
   marks it (game-kit.js normalising, every accepted answer).
   Round: { prompt: "… ___ (clue) …", answer: [accepted…], note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const K = window.GameKit;
  K.style('gk-pairs', `
.pr-card{position:relative;margin:.5rem 0 .2rem;padding:1.1rem 1.3rem 1rem;border-radius:8px;background:#fff;display:flex;flex-direction:column;gap:.8rem;
  box-shadow:0 1px 0 rgba(20,17,14,.08),0 16px 32px -18px rgba(20,17,14,.55)}
.pr-card .cg-line{margin:0;font-size:clamp(1.05rem,3vw,1.25rem);line-height:1.8}`);

  const clueOf = p => { const m = String(p).match(/___\s*\(([^)]+)\)/); return m ? m[1] : null; };

  (window.ChallengeGames = window.ChallengeGames || {}).pairs = {
    title:'Pairs', kind:'game', skill:'productive',
    /* fill-the-gap rounds, and word formation (Part 3): the stem word becomes the clue in the ring */
    accepts: r => (r.game === 'gap' || r.game === 'wordform' || r.game === 'opencloze') && typeof r.prompt === 'string' && r.prompt.includes('___') && Array.isArray(r.answer) && r.answer.length,
    solution: r => r.answer[0],
    render(host, r, ctx){
      const wf = (r.src || r.game) === 'wordform', oc = (r.src || r.game) === 'opencloze';
      const clue = wf ? r.stem : clueOf(r.prompt);
      const line = !wf && clue ? r.prompt.replace(/___\s*\([^)]+\)/, '___') : r.prompt;
      const [pre, post] = [line.split('___')[0], line.split('___').slice(1).join('___')];
      host.innerHTML = `<p class="cg-prompt">${wf ? 'Change the word in the ring so it fits the gap.' : oc ? 'Write one word in the gap.' : 'Write the missing words into the sentence.'}</p>
        <div class="pr-card">
          ${clue ? `<span class="fc-corner"><span class="gk-ring">${ctx.esc(clue)}</span></span>` : ''}
          <p class="cg-line">${ctx.esc(pre)}<input class="gk-in" id="fcIn" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="The missing words">${ctx.esc(post)}</p>
          <div class="fc-row"><button class="cg-btn" type="button" id="fcCheck">Check</button></div>
        </div>`;
      const inp = host.querySelector('#fcIn'), btn = host.querySelector('#fcCheck');
      K.grow(inp);
      setTimeout(() => inp.focus(), 250);
      const go = () => {
        if (host.dataset.locked) return; const v = K.norm(inp.value); if (!v) return;
        /* open cloze is one word only; in Game that is a reminder, not a lost life */
        if (oc && /\s/.test(v)){ const fb = document.getElementById('fb'); if (fb) fb.innerHTML = '<b>One word only</b> — in Part 2 every gap takes exactly one word.'; inp.select(); return; }
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
