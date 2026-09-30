/* ═══ CHALLENGE GAME · HUNT ═════════════════════════════════════════════
   Correct the error as a hunt: the sentence is laid out word by word, and
   the learner hunts down the faulty part — tap a word to strike it, tap
   its neighbours to widen the strike. A box opens right after the struck
   words; type the fix there and the sentence reads corrected.
   Why the typed fix is what gets marked: the rounds store the correction,
   not which words were wrong, so the strike can't be checked on its own —
   it is where the learner aims. Marking the fix keeps it exactly as fair
   as Correct the error in the Exam, which marks the same thing.
   Productive: the correction is written, not picked.
   Round: { sentence, answer: [accepted…], note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const K = window.GameKit;
  K.style('gk-hunt', `
.ht-board{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .3rem;padding:1.1rem 1rem;border-radius:8px;background:#fff;margin:.3rem 0 .8rem;
  box-shadow:0 1px 0 rgba(20,17,14,.08),0 12px 26px -18px rgba(20,17,14,.5);cursor:crosshair}
.ht-w{font:inherit;font-family:var(--f-display);font-weight:700;font-size:clamp(1rem,3vw,1.15rem);line-height:1.3;padding:.28rem .45rem;border:none;
  border-radius:4px;background:transparent;color:var(--ink);cursor:crosshair;transition:background .12s}
.ht-w:hover:not(:disabled){background:rgba(221,142,88,.14)}
.ht-w.ht-hit{background:rgba(180,81,58,.12);color:var(--wrong,#B4513A);text-decoration:line-through;text-decoration-thickness:2px}
.ht-w:disabled{cursor:default}
.ht-board .gk-in{font-family:var(--f-display);font-size:clamp(1rem,3vw,1.15rem)}
.ht-board.ht-done{cursor:default}
.ht-board.ht-done .ht-w.ht-hit{display:none}
.ht-foot{display:flex;align-items:center;justify-content:space-between;gap:1rem}
.ht-foot .gk-ring{width:2rem;height:2rem;font-size:.75rem;box-shadow:0 0 0 3px var(--ring-sage,#8AA79C)}
.ht-status{display:flex;align-items:center;gap:.6rem}`);

  (window.ChallengeGames = window.ChallengeGames || {}).hunt = {
    title:'Hunt', kind:'game', skill:'productive',
    accepts: r => r.game === 'correct' && typeof r.sentence === 'string' && Array.isArray(r.answer) && r.answer.length,
    solution: r => r.answer[0],
    render(host, r, ctx){
      const words = r.sentence.trim().split(/\s+/);
      host.innerHTML = `<p class="cg-prompt">One part of this sentence is wrong. Hunt it down — tap the wrong word or words — then type the fix.</p>
        <div class="ht-board" id="htBoard">${words.map((w, i) => `<button class="ht-w" type="button" data-i="${i}">${ctx.esc(w)}</button>`).join('')}</div>
        <div class="ht-foot"><span class="ht-status"><span class="gk-ring" id="htRing">0</span><span class="gk-hint" id="htHint">Tap the fault</span></span>
          <button class="cg-btn" type="button" id="htCheck" disabled>Check</button></div>`;
      const board = host.querySelector('#htBoard'), btns = [...board.querySelectorAll('.ht-w')], ring = host.querySelector('#htRing'),
            hint = host.querySelector('#htHint'), check = host.querySelector('#htCheck');
      const hit = new Set(); let inp = null;
      const place = () => {
        const last = Math.max(...hit);
        if (!inp){ inp = document.createElement('input'); inp.className = 'gk-in'; inp.autocomplete = 'off'; inp.autocapitalize = 'off'; inp.spellcheck = false;
          inp.setAttribute('aria-label', 'The corrected words'); K.grow(inp); inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }); }
        btns[last].after(inp); setTimeout(() => inp.focus(), 30);
      };
      const refresh = () => {
        ring.textContent = hit.size;
        hint.textContent = hit.size ? 'Type the fix after the struck words' : 'Tap the fault';
        check.disabled = !hit.size;
        if (hit.size) place(); else if (inp){ inp.remove(); }
      };
      btns.forEach(b => b.onclick = () => {
        if (host.dataset.locked) return;
        const i = +b.dataset.i;
        if (hit.has(i)) hit.delete(i); else hit.add(i);
        b.classList.toggle('ht-hit', hit.has(i)); refresh();
      });
      const go = () => {
        if (host.dataset.locked || !inp) return; const v = K.norm(inp.value); if (!v) return;
        const ok = r.answer.map(K.norm).includes(v), again = ctx.answer(ok, inp.value.trim());
        if (ok){
          board.classList.add('ht-done'); btns.forEach(b => b.disabled = true);
          const s = document.createElement('span'); s.className = 'gk-good ht-w'; s.textContent = inp.value.trim(); inp.replaceWith(s); inp = null;
          ring.textContent = '✓'; hint.textContent = 'Fixed';
        } else K.shake(inp);
        if (!again){ host.dataset.locked = '1'; check.disabled = true; btns.forEach(b => b.disabled = true); if (inp) inp.disabled = true; }
        else if (!ok) inp.select();
      };
      check.onclick = go;
    }
  };
})();
