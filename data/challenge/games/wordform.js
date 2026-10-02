/* ═══ CHALLENGE GAME · WORD FORMATION ═══════════════════════════════════
   Use of English Part 3, one sentence at a time, laid out as on the paper:
   the sentence with its gap, and the word to change in capitals at the end
   of the line. The learner types the form that fits.
   Round: { prompt: "… ___ …", stem: "REGARD", answer: ["disregard", …],
            note, tag: "Noun" }
   The tag — the word class the gap needs — is the heart of the skill, so
   like every tag it stays hidden until the answer is in.
   Spelling must be exact, as Cambridge marks it; British and American
   spellings are both listed where the round accepts them.
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const CSS = `
.wf-row{display:flex;align-items:baseline;gap:1rem;margin:.9rem 0 1rem}
.wf-row .cg-line{flex:1;min-width:0;margin:0}
.wf-stem{flex:none;font-family:var(--f-display,system-ui);font-weight:800;font-size:.95rem;letter-spacing:.08em;color:var(--ink);
  padding:.15rem .55rem;border-radius:999px;background:rgba(43,33,41,.06)}
@media(max-width:420px){.wf-row{flex-direction:column;gap:.5rem}.wf-stem{align-self:flex-end}}`;
  let styled = false;
  (window.ChallengeGames = window.ChallengeGames || {}).wordform = {
    title:'Word formation', kind:'exam', skill:'productive',
    solution: r => r.answer[0],
    render(host, r, ctx){
      if (!styled){ const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); styled = true; }
      const norm = s => String(s).toLowerCase().replace(/[’']/g, "'").replace(/[.!?,]/g, '').replace(/\s+/g, ' ').trim();
      host.innerHTML = `<p class="cg-prompt">Use the word in capitals to form a word that fits the gap.</p>
        <div class="wf-row"><p class="cg-line">${ctx.esc(r.prompt).replace('___', '<span class="cg-blank" id="cgBlank">&nbsp;</span>')}</p>
          <span class="wf-stem" aria-label="Word to change">${ctx.esc(r.stem)}</span></div>
        <div class="cg-field"><input id="cgIn" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the new word" aria-label="Your answer">
        <button class="cg-btn" type="button" id="cgCheck">Check</button></div>`;
      const inp = host.querySelector('#cgIn'), go = () => {
        if (host.dataset.locked) return; const v = norm(inp.value); if (!v) return;
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
})();
