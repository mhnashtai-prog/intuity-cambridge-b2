/* ═══ CHALLENGE GAME · HUNT ═════════════════════════════════════════════
   (Rounds with `pick` play the chooser described below; the rest play the
   original typed hunt.)
   Correct the error as a hunt: the sentence is laid out word by word, and
   the learner hunts down the faulty part — tap a word to strike it, tap
   its neighbours to widen the strike. A box opens right after the struck
   words; type the fix there and the sentence reads corrected.
   THE HUNT IS CHECKED WHEN THE ROUND SAYS WHERE THE ERROR IS. A round with
   `wrong` ("would have", or the wrong word in a vocabulary sentence) is
   right only if the struck words contain it AND the typed fix is accepted:
   finding the fault is half the skill, so it is half the mark. Striking any
   word and typing the right form no longer passes. A round without `wrong`
   is marked on the fix alone, as before, until its data says where the
   error sits.
   Productive: the correction is written, not picked.
   Round: { sentence, answer: [accepted…], wrong: "the faulty words" | ["or", "these"], note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const K = window.GameKit;
  K.style('gk-hunt', `
.ht-board{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .3rem;padding:1.1rem 1rem;border-radius:var(--r-box,16px);background:var(--sheet,#FEFCF9);margin:.3rem 0 .8rem;
  box-shadow:0 1px 0 rgba(20,17,14,.08),0 12px 26px -18px rgba(20,17,14,.5);cursor:crosshair}
.ht-w{font:inherit;font-family:var(--f-display);font-weight:700;font-size:clamp(1rem,3vw,1.15rem);line-height:1.3;padding:.28rem .45rem;border:none;
  border-radius:var(--r-tap,999px);background:transparent;color:var(--ink);cursor:crosshair;transition:background .12s}
.ht-w:hover:not(:disabled){background:rgba(221,142,88,.14)}
.ht-w.ht-hit{background:rgba(180,81,58,.12);color:var(--wrong,#B4653A);text-decoration:line-through;text-decoration-thickness:2px}
.ht-w:disabled{cursor:default}
.ht-board .gk-in{font-family:var(--f-display);font-size:clamp(1rem,3vw,1.15rem)}
.ht-board.ht-done{cursor:default}
.ht-board.ht-done .ht-w.ht-hit{display:none}
.ht-foot{display:flex;align-items:center;justify-content:space-between;gap:1rem}
.ht-foot .gk-ring{width:2rem;height:2rem;font-size:.75rem;box-shadow:0 0 0 3px var(--ring-sage,#8AA79C)}
.ht-status{display:flex;align-items:center;gap:.6rem}`);


  /* ═══ THE HUNT, REDESIGNED (a teacher's note from the first trial) ═══════
     "A kid would not have the slightest clue to hunt down the words." The
     old Hunt asked for two things at once, both blind: strike the exact
     right words, then TYPE a correction with nothing to go on. Now:
       1 ONE INSTRUCTION — one word or phrase is wrong: tap it.
       2 TAP ANY PART of the faulty phrase and the whole phrase is taken —
         no more striking word by word to "widen" a selection.
       3 A TOOLTIP opens under it with the replacements to choose from.
     A tap on a part that is fine costs nothing ("that part is fine"); after
     two, the faulty phrase is underlined as a clue. Only a wrong
     REPLACEMENT is a mistake, so a life is lost for the grammar, not for
     the hunting. Rounds without choices keep the typed Hunt below. */
  const bareW = w => String(w).toLowerCase().replace(/[.,!?;:"()]/g, '').replace(/^['‘’"]+|['‘’"]+$/g, '');
  function spanAt(words, span){
    const want = String(span).trim().split(/\s+/).map(bareW), got = words.map(bareW);
    for (let k = 0; k + want.length <= got.length; k++) if (want.every((w, j) => got[k + j] === w)) return [k, k + want.length - 1];
    return null;
  }
  function choose(host, r, ctx){
    const words = r.sentence.trim().split(/\s+/), [a, b] = spanAt(words, r.pick.span);
    const trail = s => { const m = String(s).match(/[.,!?;:]+$/); return m ? m[0] : ''; };
    const lead  = s => { const m = String(s).match(/^['‘"]+/); return m ? m[0] : ''; };
    const opts = ctx.shuffle([r.pick.fix].concat(r.pick.others || []));
    host.innerHTML = `<p class="cg-prompt">One word or phrase in this sentence is wrong. <b>Tap it</b>, then choose what should replace it.</p>
      <div class="ht-board" id="htBoard">${words.map((w, i) => `<button class="ht-w${i >= a && i <= b ? ' ht-err' : ''}" type="button" data-i="${i}">${ctx.esc(w)}</button>`).join('')}</div>
      <div class="ht-foot"><span class="gk-hint" id="htHint" aria-live="polite">Tap the part that's wrong</span></div>`;
    const board = host.querySelector('#htBoard'), btns = [...board.querySelectorAll('.ht-w')], hint = host.querySelector('#htHint');
    const err = btns.slice(a, b + 1);
    let misses = 0, tip = null;
    const open = () => {
      if (tip) return;
      err.forEach(x => x.classList.add('ht-hit'));
      tip = document.createElement('div'); tip.className = 'ht-tip'; tip.setAttribute('role', 'group'); tip.setAttribute('aria-label', 'Choose the replacement');
      tip.innerHTML = `<span class="ht-tip-h">Replace <b>${ctx.esc(r.pick.span)}</b> with…</span><div class="ht-opts">${opts.map(o =>
        `<button class="ht-opt" type="button" data-o="${ctx.esc(o)}">${ctx.esc(o)}</button>`).join('')}</div>`;
      /* under the sentence, never inside it: the learner reads the whole
         sentence while choosing. The arrow points at the struck words. */
      board.after(tip);
      const bb = board.getBoundingClientRect(), e0 = err[0].getBoundingClientRect(), e1 = err[err.length - 1].getBoundingClientRect();
      const mid = Math.max(18, Math.min(bb.width - 18, (e0.left + e1.right) / 2 - bb.left));
      tip.style.setProperty('--arrow', mid + 'px');
      hint.textContent = 'Now choose the replacement';
      tip.querySelectorAll('.ht-opt').forEach(o => o.onclick = () => pick(o));
      const first = tip.querySelector('.ht-opt'); if (first) setTimeout(() => first.focus(), 30);
    };
    const pick = o => {
      if (host.dataset.locked || o.disabled) return;
      const ok = o.dataset.o === r.pick.fix;
      const again = ctx.answer(ok, '[' + r.pick.span + '] → ' + o.dataset.o);
      if (ok){
        /* the sentence reads corrected: the faulty words go, the fix sits in their place */
        const s = document.createElement('span'); s.className = 'gk-good ht-w';
        s.textContent = lead(words[a]) + r.pick.fix + trail(words[b]);
        err[0].before(s); err.forEach(x => x.remove()); if (tip) tip.remove(); tip = null;
        board.classList.add('ht-done'); btns.forEach(x => x.disabled = true); hint.textContent = 'Fixed';
      } else {
        o.disabled = true; o.classList.add('ht-no'); K.shake(o);
        hint.textContent = again ? 'Not that one — try another' : '';
      }
      if (!again){ host.dataset.locked = '1'; btns.forEach(x => x.disabled = true); if (tip) tip.querySelectorAll('.ht-opt').forEach(x => x.disabled = true); }
    };
    btns.forEach((x, i) => x.onclick = () => {
      if (host.dataset.locked) return;
      if (i >= a && i <= b){ open(); return; }
      if (tip) return;                                  /* found already: choose below */
      misses++; K.shake(x); x.classList.add('ht-fine'); setTimeout(() => x.classList.remove('ht-fine'), 700);
      hint.textContent = misses >= 2 ? 'Look at the underlined part' : 'That part is fine — look again';
      if (misses >= 2) err.forEach(e => e.classList.add('ht-clue'));
    });
  }

  K.style('gk-hunt-choose', `
.ht-w.ht-clue{text-decoration:underline dotted;text-decoration-thickness:2px;text-underline-offset:.3em;text-decoration-color:var(--caramel,#C2956E)}
.ht-w.ht-fine{background:rgba(74,107,92,.12)}
.ht-board .ht-w.ht-hit.ht-err{text-decoration:line-through;text-decoration-thickness:2px}
.ht-tip{position:relative;margin:-.35rem 0 .8rem;padding:.75rem .8rem .8rem;border-radius:14px;background:var(--ring-core,#201E1C);color:var(--ring-ink,#E5D1B8)}
.ht-tip::before{content:'';position:absolute;top:-7px;left:calc(var(--arrow,1.4rem) - 7px);border:7px solid transparent;border-top:0;border-bottom-color:var(--ring-core,#201E1C)}
.ht-tip-h{display:block;font-family:var(--f-display,system-ui);font-size:.82rem;margin:0 0 .55rem;color:var(--ring-ink,#E5D1B8)}
.ht-tip-h b{color:#fff}
.ht-opts{display:flex;flex-wrap:wrap;gap:.45rem}
.ht-opt{font:inherit;font-family:var(--f-display,system-ui);font-weight:700;font-size:1rem;padding:.5rem .95rem;border:none;border-radius:999px;background:var(--sheet,#FEFCF9);color:var(--ink,#201E1C);cursor:pointer}
.ht-opt:focus-visible{outline:3px solid var(--caramel,#C2956E);outline-offset:2px}
.ht-opt.ht-no{text-decoration:line-through;opacity:.45;cursor:default}
.ht-board .ht-tip .ht-opt{cursor:pointer}
@media(prefers-reduced-motion:reduce){.ht-w,.ht-opt{transition:none}}`);
  (window.ChallengeGames = window.ChallengeGames || {}).hunt = {
    title:'Hunt', kind:'game', skill:'productive',
    accepts: r => r.game === 'correct' && typeof r.sentence === 'string' && Array.isArray(r.answer) && r.answer.length,
    solution: r => (r.pick && r.pick.fix) || r.answer[0],
    render(host, r, ctx){
      if (r.pick && spanAt(r.sentence.trim().split(/\s+/), r.pick.span)) return choose(host, r, ctx);
      const words = r.sentence.trim().split(/\s+/);
      host.innerHTML = `<p class="cg-prompt">One part of this sentence is wrong. Hunt it down — tap the wrong word or words — then type the fix.</p>
        <div class="ht-board" id="htBoard">${words.map((w, i) => `<button class="ht-w" type="button" data-i="${i}">${ctx.esc(w)}</button>`).join('')}</div>
        <div class="ht-foot"><span class="ht-status"><span class="gk-ring" id="htRing">0</span><span class="gk-hint" id="htHint">Tap the wrong word or words</span></span>
          <button class="cg-btn" type="button" id="htCheck" disabled>Check</button></div>`;
      const board = host.querySelector('#htBoard'), btns = [...board.querySelectorAll('.ht-w')], ring = host.querySelector('#htRing'),
            hint = host.querySelector('#htHint'), check = host.querySelector('#htCheck');
      const hit = new Set(); let inp = null;
      /* the strike must be one run of words that contains the faulty words */
      /* quote marks at a word's edges don't count ('So → so), the apostrophe inside "don't" does */
      const bare = w => K.norm(w).replace(/[;:"()]/g, '').replace(/^['‘’"]+|['‘’"]+$/g, '');
      const foundIt = idx => {
        if (!r.wrong) return true;
        if (!idx.length || idx[idx.length - 1] - idx[0] !== idx.length - 1) return false;
        const got = idx.map(i => bare(words[i]));
        /* `wrong` may list alternatives where the error can honestly be struck in more than one
           place: "Unless you don't hurry" is fixed by striking "don't" or by striking "Unless" */
        return [].concat(r.wrong).some(alt => {
          const want = String(alt).trim().split(/\s+/).map(bare);
          for (let k = 0; k + want.length <= got.length; k++)
            if (want.every((w, j) => got[k + j] === w)) return true;
          return false;
        });
      };
      const place = () => {
        const last = Math.max(...hit);
        if (!inp){ inp = document.createElement('input'); inp.className = 'gk-in'; inp.autocomplete = 'off'; inp.autocapitalize = 'off'; inp.spellcheck = false;
          inp.setAttribute('aria-label', 'The corrected words'); K.grow(inp); inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }); }
        btns[last].after(inp); setTimeout(() => inp.focus(), 30);
      };
      const refresh = () => {
        ring.textContent = hit.size;
        /* the ring counts the struck words, so the line beside it says so */
        hint.textContent = hit.size ? (hit.size === 1 ? '1 word struck' : hit.size + ' words struck') + ' — now type the right word in the gap' : 'Tap the wrong word or words';
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
        const struck = [...hit].sort((x, y) => x - y), struckText = struck.map(i => words[i]).join(' ');
        const fixOk = r.answer.map(K.norm).includes(v);
        const ok = fixOk && foundIt(struck);
        const again = ctx.answer(ok, (r.wrong ? '[' + struckText + '] → ' : '') + inp.value.trim());
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
