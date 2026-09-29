/* ═══ CHALLENGE GAME · FORGE ════════════════════════════════════════════
   Word Forge in one cell: the gap is split into one slot per word, and a
   bank of tiles holds the answer's words plus every word the wrong options
   use. Tap tiles into the slots; tap a filled slot to send its tile back.
   It checks itself when the last slot fills.
   Productive, and the most honest kind a tile bank allows: the learner
   assembles the form word by word (may + have + left) instead of picking a
   finished one, and the spare tiles are exactly the forms the question
   tempts (must, can't). Plays only rounds whose answer has two words or
   more — a one-word answer in a bank of four is just Choose.
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const CSS = `
.cg-slots{display:inline-flex;gap:.3rem;vertical-align:middle;margin:0 .15rem}
.cg-slot{min-width:3.4em;height:2.1em;border:none;border-bottom:2px solid var(--ink);background:rgba(20,17,14,.05);font:inherit;font-weight:700;color:var(--accent-ink);padding:0 .45rem;cursor:pointer}
.cg-slot:empty{cursor:default}
.cg-slots.cg-ok .cg-slot{background:#DCEFE2;color:#1B4A31;border-color:var(--good)}
.cg-bank{margin-top:.6rem}`;
  let styled = false;
  const words = s => String(s).trim().split(/\s+/);

  (window.ChallengeGames = window.ChallengeGames || {}).forge = {
    title:'Forge', kind:'game', skill:'productive',
    accepts: r => (r.game === 'choose' || r.game === 'pendulum') && Array.isArray(r.options)
                  && r.options.includes(r.answer) && words(r.answer).length >= 2,
    solution: r => r.answer,
    render(host, r, ctx){
      if (!styled){ const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); styled = true; }
      const pen = (r.src || r.game) === 'pendulum';
      const lead = pen ? (r.active != null ? r.active : r.context) : '';
      const line = pen ? (r.passive != null ? r.passive : r.line) : r.prompt;
      const ans = words(r.answer), inAns = new Set(ans.map(w => w.toLowerCase())), extra = [];
      r.options.forEach(o => { if (o === r.answer) return; words(o).forEach(w => { const k = w.toLowerCase();
        if (!inAns.has(k) && !extra.some(x => x.toLowerCase() === k)) extra.push(w); }); });
      const bank = ctx.shuffle(ans.concat(extra.slice(0, 5)).map((w, k) => ({ w, k })));
      const [pre, post] = [line.split('___')[0] || '', line.split('___').slice(1).join('___')];
      host.innerHTML = `<p class="cg-prompt">Build the missing words from the tiles.</p>
        ${lead ? `<p class="cg-act">${ctx.esc(lead)}</p>` : ''}
        <p class="cg-line">${ctx.esc(pre)}<span class="cg-slots" id="cgSlots">${ans.map((_, i) =>
          `<button class="cg-slot" type="button" data-s="${i}"></button>`).join('')}</span>${ctx.esc(post)}</p>
        <div class="cg-chips cg-bank" id="cgPool">${bank.map(o =>
          `<button class="cg-chip" type="button" data-k="${o.k}">${ctx.esc(o.w)}</button>`).join('')}</div>`;
      const slots = [...host.querySelectorAll('.cg-slot')], fill = Array(ans.length).fill(null);
      const tile = k => host.querySelector(`#cgPool .cg-chip[data-k="${k}"]`);
      const wordOf = k => bank.find(o => o.k === k).w;
      const draw = () => slots.forEach((s, i) => { s.textContent = fill[i] == null ? '' : wordOf(fill[i]); });
      const check = () => {
        const given = fill.map(wordOf).join(' '), ok = given.toLowerCase() === r.answer.toLowerCase();
        const again = ctx.answer(ok, given);
        if (ok){ host.querySelector('#cgSlots').classList.add('cg-ok'); }
        if (!again){ host.dataset.locked = '1'; return; }
        const box = host.querySelector('#cgSlots'); box.classList.add('cg-shake');
        setTimeout(() => { box.classList.remove('cg-shake');
          fill.forEach((k, i) => { if (k != null) tile(k).classList.remove('cg-used'); fill[i] = null; }); draw(); }, 450);
      };
      host.querySelectorAll('#cgPool .cg-chip').forEach(c => c.onclick = () => {
        if (host.dataset.locked) return; const i = fill.indexOf(null); if (i < 0) return;
        fill[i] = +c.dataset.k; c.classList.add('cg-used'); draw();
        if (fill.indexOf(null) < 0) check();
      });
      slots.forEach((s, i) => s.onclick = () => {
        if (host.dataset.locked || fill[i] == null) return;
        tile(fill[i]).classList.remove('cg-used'); fill[i] = null; draw();
      });
    }
  };
})();
