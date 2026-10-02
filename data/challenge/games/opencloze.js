/* ═══ CHALLENGE GAME · OPEN CLOZE ═══════════════════════════════════════
   Use of English Part 2, one sentence at a time: a gap with nothing given,
   filled with ONE word — almost always a grammar word: an article, a
   preposition, an auxiliary, a pronoun, a linker.
   Round: { prompt: "… ___ …", answer: ["although", "though"], note, tag }
   The sentences are lifted from the Part 2 passages in
   data/use-of-english/gapfill, with the other gaps filled in.

   ONE WORD ONLY, as Cambridge marks it. Two words in the Exam is a wrong
   answer. In Game it gets a reminder instead of costing a life: the rule
   is the lesson there, and losing a heart to it teaches nothing about the
   grammar.
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(window.ChallengeGames = window.ChallengeGames || {}).opencloze = {
  title:'Open cloze', kind:'exam', skill:'productive',
  solution: r => r.answer[0],
  render(host, r, ctx){
    const norm = s => String(s).toLowerCase().replace(/[’']/g, "'").replace(/[.!?,;:]/g, '').replace(/\s+/g, ' ').trim();
    host.innerHTML = `<p class="cg-prompt">Write <b>one word</b> in the gap.</p>
      <p class="cg-line">${ctx.esc(r.prompt).replace('___', '<span class="cg-blank" id="cgBlank">&nbsp;</span>')}</p>
      <div class="cg-field"><input id="cgIn" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="One word" aria-label="Your answer">
      <button class="cg-btn" type="button" id="cgCheck">Check</button></div>`;
    const inp = host.querySelector('#cgIn'), go = () => {
      if (host.dataset.locked) return; const v = norm(inp.value); if (!v) return;
      if (/\s/.test(v) && !ctx.exam){
        const fb = document.getElementById('fb');
        if (fb) fb.innerHTML = '<b>One word only</b> — in Part 2 every gap takes exactly one word.';
        inp.select(); return;
      }
      const ok = r.answer.map(norm).includes(v);
      const again = ctx.answer(ok, inp.value.trim());
      if (ok && !ctx.exam) host.querySelector('#cgBlank').textContent = r.answer[0];
      if (!ok && !ctx.exam){ inp.classList.add('cg-shake'); setTimeout(() => inp.classList.remove('cg-shake'), 450); }
      if (!again){ host.dataset.locked = '1'; inp.disabled = true; host.querySelector('#cgCheck').disabled = true; } else inp.select();
    };
    host.querySelector('#cgCheck').onclick = go; inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    setTimeout(() => inp.focus(), 300);
  }
};
