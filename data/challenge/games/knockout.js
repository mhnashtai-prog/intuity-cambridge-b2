/* ═══ CHALLENGE GAME · KNOCK-OUT ════════════════════════════════════════
   Odd one out, as the Past Modals game plays it: four sentences stand up
   like cards, three right and one wrong. Knock out the wrong one — it
   topples off the line. Hit a good one and it wobbles, stays standing,
   and is marked safe; that costs a life.
   Receptive, like Odd one out: the same rounds, the same judgement.
   Round: { options: [4 sentences], answer, note }
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const K = window.GameKit;
  K.style('gk-knockout', `
.ko-line{display:flex;flex-direction:column;gap:.55rem;margin-top:.3rem;perspective:900px}
.ko-card{position:relative;display:flex;align-items:center;gap:.9rem;width:100%;text-align:left;font:inherit;font-size:1rem;line-height:1.45;
  padding:.8rem .9rem .8rem .8rem;border:none;background:#fff;color:var(--ink);cursor:pointer;border-radius:4px;
  box-shadow:0 1px 0 rgba(20,17,14,.08),0 8px 18px -12px rgba(20,17,14,.45);transform-origin:left bottom;transition:transform .15s}
.ko-card:hover:not(:disabled){transform:translateY(-2px)}
.ko-card::after{content:'';position:absolute;left:0;right:0;bottom:-6px;height:3px;background:var(--rule);border-radius:2px}
.ko-card .gk-ring{width:2rem;height:2rem;font-size:.8rem;box-shadow:0 0 0 3px var(--ring-sage,#8AA79C)}
.ko-card.ko-out{animation:koTopple .7s cubic-bezier(.5,-.3,.7,1) forwards;pointer-events:none}
@keyframes koTopple{30%{transform:rotate(-6deg)}100%{transform:translateX(-18%) rotate(-78deg) translateY(40%);opacity:0}}
.ko-card.ko-wobble{animation:koWobble .5s}
@keyframes koWobble{25%{transform:rotate(-2.5deg)}50%{transform:rotate(2deg)}75%{transform:rotate(-1deg)}}
.ko-card.ko-safe{background:#EEF3EF;cursor:default}
.ko-card.ko-safe .gk-ring{background:var(--ring-sage,#8AA79C);color:#fff}
.ko-card.ko-stand{cursor:default}
.ko-gone{font-size:.9rem;color:var(--dim);margin:.2rem 0 0;padding-left:.2rem}
.ko-gone s{color:var(--wrong,#B4513A)}
@media(prefers-reduced-motion:reduce){.ko-card.ko-out{animation:none;opacity:.25;text-decoration:line-through}.ko-card.ko-wobble{animation:none}}`);

  (window.ChallengeGames = window.ChallengeGames || {}).knockout = {
    title:'Knock-out', kind:'game', skill:'receptive',
    accepts: r => r.game === 'odd' && Array.isArray(r.options) && r.options.includes(r.answer),
    solution: r => r.answer,
    render(host, r, ctx){
      host.innerHTML = `<p class="cg-prompt">Three of these are right. Knock out the one that isn’t.</p>
        <div class="ko-line">${ctx.shuffle(r.options).map((o, k) =>
          `<button class="ko-card" type="button" data-o="${ctx.esc(o)}"><span class="gk-ring">${'ABCD'[k]}</span><span>${ctx.esc(o)}</span></button>`).join('')}</div>`;
      const cards = [...host.querySelectorAll('.ko-card')];
      const lock = () => { host.dataset.locked = '1'; cards.forEach(c => c.disabled = true); };
      cards.forEach(c => c.onclick = () => {
        if (host.dataset.locked || c.disabled) return;
        const ok = c.dataset.o === r.answer;
        if (ok){
          c.classList.add('ko-out');
          cards.filter(x => x !== c).forEach(x => x.classList.add('ko-stand'));
          const gone = document.createElement('p'); gone.className = 'ko-gone';
          gone.innerHTML = 'Knocked out: <s>' + ctx.esc(r.answer) + '</s>';
          setTimeout(() => { c.replaceWith(gone); }, 700);
          ctx.answer(true, c.dataset.o); lock(); return;
        }
        c.classList.add('ko-wobble'); setTimeout(() => c.classList.remove('ko-wobble'), 500);
        c.classList.add('ko-safe'); c.disabled = true; c.querySelector('.gk-ring').textContent = '✓';
        if (!ctx.answer(false, c.dataset.o)) lock();
      });
    }
  };
})();
