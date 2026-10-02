/* ═══ CHALLENGE GAME · FORGE ════════════════════════════════════════════
   Put it in order, as Word Forge: one slot per word, the words as tiles.
   Tap tiles into the slots; tap a filled slot to send its tile back. It
   checks itself when the last slot fills, and a wrong sentence shakes and
   empties for another try.
   Productive, like Put it in order: the learner builds the sentence, and it
   is marked the same way — exactly this order.
   Round: { prompt, words: ["The","bridge","was","built","in","1998."], note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const CSS = `
.cg-slots{display:inline-flex;flex-wrap:wrap;gap:.35rem .3rem;vertical-align:middle;margin:0 .15rem}
.cg-slot{min-width:3.4em;height:2.1em;border:none;border-bottom:2px solid var(--ink);background:rgba(20,17,14,.05);font:inherit;font-weight:700;color:var(--accent-ink);padding:0 .45rem;cursor:pointer}
.cg-slot:empty{cursor:default}
.cg-slots.cg-ok .cg-slot{background:var(--right-soft,rgba(74,107,92,.12));color:var(--right,#4A6B5C);border-color:var(--good)}
.cg-bank{margin-top:.6rem}`;
  let styled = false;
  const words = s => String(s).trim().split(/\s+/);

  (window.ChallengeGames = window.ChallengeGames || {}).forge = {
    title:'Forge', kind:'game', skill:'productive',
    accepts: r => r.game === 'order' && Array.isArray(r.words) && r.words.length >= 2,
    solution: r => r.words.join(' '),
    render(host, r, ctx){
      if (!styled){ const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); styled = true; }
      const ans = r.words.slice(), answer = ans.join(' ');
      const bank = ctx.shuffle(ans.map((w, k) => ({ w, k })));
      host.innerHTML = `<p class="cg-prompt">${ctx.esc(r.prompt || 'Build the sentence.')} Forge it from the tiles.</p>
        <p class="cg-line"><span class="cg-slots" id="cgSlots">${ans.map((_, i) =>
          `<button class="cg-slot" type="button" data-s="${i}"></button>`).join('')}</span></p>
        <div class="cg-chips cg-bank" id="cgPool">${bank.map(o =>
          `<button class="cg-chip" type="button" data-k="${o.k}">${ctx.esc(o.w)}</button>`).join('')}</div>`;
      const slots = [...host.querySelectorAll('.cg-slot')], fill = Array(ans.length).fill(null);
      const tile = k => host.querySelector(`#cgPool .cg-chip[data-k="${k}"]`);
      const wordOf = k => bank.find(o => o.k === k).w;
      const draw = () => slots.forEach((s, i) => { s.textContent = fill[i] == null ? '' : wordOf(fill[i]); });
      const check = () => {
        const given = fill.map(wordOf).join(' '), ok = given === answer;
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
