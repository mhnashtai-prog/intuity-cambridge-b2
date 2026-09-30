/* ═══ CHALLENGE GAME · PEGS ═════════════════════════════════════════════
   Match, as Phrasal Verbs 2 plays it: each item on the left ends in an
   empty socket, its ring; the partners are pegs lying underneath. Pick up
   a peg, then tap the row it belongs to — the right socket seats it, the
   wrong one throws it back. Pegs can be picked in either order: peg then
   row, or row then peg. Built for long items too (a whole sentence on
   each side), so the rows stack rather than sit in a ring of discs.
   Receptive, like Match. One life per tile (see game-kit.js).
   Round: { prompt, pairs: [["left","right"],…], note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const K = window.GameKit;
  K.style('gk-pegs', `
.pg-rows{display:flex;flex-direction:column;gap:.5rem;margin:.3rem 0 1rem}
.pg-row{display:grid;grid-template-columns:1fr auto minmax(0,1fr);align-items:center;gap:.7rem;width:100%;font:inherit;text-align:left;
  padding:.55rem .6rem;border:none;border-radius:6px;background:#fff;cursor:pointer;box-shadow:0 1px 0 rgba(20,17,14,.07)}
.pg-row:hover:not(:disabled){box-shadow:0 0 0 2px var(--ring-sage,#8AA79C)}
.pg-row.pg-aim{box-shadow:0 0 0 2px var(--accent-ink,#8A4B26)}
.pg-left{font-size:.96rem;line-height:1.4;color:var(--ink);font-weight:600}
.pg-row .gk-ring{width:1.9rem;height:1.9rem;font-size:.7rem;box-shadow:0 0 0 3px var(--ring-sage,#8AA79C)}
.pg-slot{min-height:2.1rem;display:flex;align-items:center;border-bottom:2px dashed var(--rule);font-size:.93rem;line-height:1.35;color:var(--faint)}
.pg-row.pg-seated{cursor:default;background:#EEF3EF}
.pg-row.pg-seated .gk-ring{background:var(--ring-sage,#8AA79C);color:#fff}
.pg-row.pg-seated .pg-slot{border-bottom-color:transparent;color:#1B4A31;font-weight:700}
.pg-row.pg-no{box-shadow:0 0 0 2px var(--wrong,#B4513A)}
.pg-tray{display:flex;flex-wrap:wrap;gap:.45rem;padding:.8rem;border-radius:6px;background:rgba(20,17,14,.04)}
.pg-peg{font:inherit;font-size:.92rem;font-weight:700;line-height:1.3;text-align:left;padding:.5rem .75rem .5rem .6rem;border:none;border-radius:999px 6px 6px 999px;
  background:var(--tile-bg,#E7E0D4);color:var(--tile-ink,#232C31);cursor:pointer;display:flex;align-items:center;gap:.5rem;transition:transform .12s,box-shadow .12s}
.pg-peg::before{content:'';width:.65rem;height:.65rem;border-radius:50%;background:var(--ring-core,#201E1C);box-shadow:0 0 0 2px var(--ring-sage,#8AA79C);flex:none}
.pg-peg.pg-up{transform:translateY(-4px);box-shadow:0 8px 16px -8px rgba(20,17,14,.6),0 0 0 2px var(--accent-ink,#8A4B26)}
.pg-empty{font-size:.85rem;color:var(--faint);padding:.2rem .2rem}
@media(max-width:560px){.pg-row{grid-template-columns:1fr auto;}.pg-slot{grid-column:1 / -1}}`);

  (window.ChallengeGames = window.ChallengeGames || {}).pegs = {
    title:'Pegs', kind:'game', skill:'receptive',
    accepts: r => r.game === 'match' && Array.isArray(r.pairs) && r.pairs.length >= 2,
    solution: r => r.pairs.map(p => p[0] + ' → ' + p[1]).join(' · '),
    render(host, r, ctx){
      const life = K.oneLife(ctx), seated = {};
      let peg = null, aim = null;
      host.innerHTML = `<p class="cg-prompt">${ctx.esc(r.prompt || 'Match each one to its partner.')} Pick up a peg, then tap its row.</p>
        <div class="pg-rows">${r.pairs.map((p, i) =>
          `<button class="pg-row" type="button" data-i="${i}"><span class="pg-left">${ctx.esc(p[0])}</span><span class="gk-ring">${i + 1}</span><span class="pg-slot">&nbsp;</span></button>`).join('')}</div>
        <div class="pg-tray" id="pgTray">${ctx.shuffle(r.pairs.map((p, j) => ({ w: p[1], j }))).map(o =>
          `<button class="pg-peg" type="button" data-j="${o.j}">${ctx.esc(o.w)}</button>`).join('')}</div>`;
      const rows = [...host.querySelectorAll('.pg-row')], tray = host.querySelector('#pgTray');
      const lock = () => { host.dataset.locked = '1'; host.querySelectorAll('button').forEach(b => b.disabled = true); };
      const given = () => r.pairs.map((p, i) => p[0] + ' → ' + (seated[i] != null ? r.pairs[seated[i]][1] : '…')).join(' · ');
      const clear = () => { if (peg) peg.classList.remove('pg-up'); if (aim) aim.classList.remove('pg-aim'); peg = null; aim = null; };
      const tryPair = () => {
        if (!peg || !aim) return;
        const i = +aim.dataset.i, j = +peg.dataset.j, row = aim, pg = peg; clear();
        if (i === j){
          seated[i] = j; row.classList.add('pg-seated'); row.disabled = true;
          row.querySelector('.pg-slot').textContent = r.pairs[j][1]; row.querySelector('.gk-ring').textContent = '✓';
          row.classList.add('gk-settle'); pg.remove();
          if (Object.keys(seated).length === r.pairs.length){
            tray.innerHTML = '<span class="pg-empty">All pegs seated.</span>'; ctx.answer(true, given()); lock();
          }
          return;
        }
        K.shake(pg); row.classList.add('pg-no'); setTimeout(() => row.classList.remove('pg-no'), 450);
        if (!life.miss(given() + ' · tried: ' + r.pairs[i][0] + ' → ' + r.pairs[j][1])) lock();
      };
      tray.querySelectorAll('.pg-peg').forEach(p => p.onclick = () => {
        if (host.dataset.locked) return;
        if (peg === p){ clear(); return; }
        if (peg) peg.classList.remove('pg-up'); peg = p; p.classList.add('pg-up'); tryPair();
      });
      rows.forEach(row => row.onclick = () => {
        if (host.dataset.locked || row.disabled) return;
        if (aim) aim.classList.remove('pg-aim'); aim = row; row.classList.add('pg-aim'); tryPair();
      });
    }
  };
})();
