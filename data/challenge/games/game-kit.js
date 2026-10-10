/* ═══ CHALLENGE · GAME KIT ══════════════════════════════════════════════
   What the Game-mode tiles share, so they look and behave as one family:

   · the RING — the dark disc with the sage rim from the pendulums and the
     "?" dial. Every game uses it for the thing you aim at. Its colours are
     the page's tokens (--ring-core, --ring-sage, --ring-ink), so a new
     colour scheme reaches every game from one place.
   · one SHAKE for a wrong move, one SETTLE for a right one.
   · the same NORMALISING as the exam formats, so a typed answer is marked
     identically in Game and Exam.
   · EVERY SLIP COUNTS for games played in steps (Sort, Pegs). It used to
     be one life per tile: the first slip cost a life and every later slip
     was free, so after one mistake a tile could be won by tapping blindly
     until the right pile or row took the card. Tested, it scored "Right"
     with no knowledge at all. Now each wrong move costs a life, exactly as
     a wrong card does in Knock-out, so guessing loses the run instead of
     winning the tile. (The Exam is untouched: there one wrong answer
     settles the cell, so these games never reach it.)

   Loaded before the games that use it.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const K = window.GameKit = {};

  K.style = (id, css) => {
    if (document.getElementById(id)) return;
    const s = document.createElement('style'); s.id = id; s.textContent = css; document.head.appendChild(s);
  };
  K.norm = s => String(s).toLowerCase().replace(/[’']/g, "'").replace(/[.!?,]/g, '').replace(/\s+/g, ' ').trim();
  /* ONE ANSWER, ANY SPELLING OF ITS CONTRACTIONS. Typed answers were marked
     by exact match, so "need not have taken" failed where the key said
     "needn't", and "I'd finished" failed against "I had finished" — and a
     fifteen-year-old types the contracted form. Every unambiguous
     contraction is expanded on both sides before comparing. 'd and 's are
     NOT collapsed: 'd is had OR would, the very distinction Part 4 tests, so
     "I'd" counts only where the key itself has "had" or "would" there. */
  const base = s => String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/[.!?,;:]/g, '').replace(/\s+/g, ' ').trim();
  const expand = s => s.replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'can not').replace(/\bcannot\b/g, 'can not')
    .replace(/\bshan't\b/g, 'shall not').replace(/n't\b/g, ' not').replace(/'ve\b/g, ' have').replace(/'ll\b/g, ' will')
    .replace(/'re\b/g, ' are').replace(/\bi'm\b/g, 'i am').replace(/\s+/g, ' ').trim();
  const AMBIG = [[/'d\b/g, [' had', ' would']],
                 [/\b(he|she|it|that|there|who|what|where|here)'s\b/g, ['$1 is', '$1 has']]];
  const forms = s => {
    let out = [expand(base(s))];
    AMBIG.forEach(([re, reps]) => {
      const next = [];
      out.forEach(f => { next.push(f); if (f.match(re)) reps.forEach(r => next.push(f.replace(re, r).replace(/\s+/g, ' ').trim())); });
      out = next;
    });
    return out;
  };
  K.same = (given, answers) => { const g = forms(given); return [].concat(answers).some(a => forms(a).some(x => g.indexOf(x) >= 0)); };
  K.shake = el => { if (!el) return; el.classList.remove('gk-shake'); void el.offsetWidth; el.classList.add('gk-shake'); };

  /* a tile played in steps: miss() charges a life for EVERY wrong move and
     says whether play can go on (false = no lives left, the round is over) */
  K.slips = ctx => {
    let alive = true;
    return { miss(given){ if (alive) alive = ctx.answer(false, given); return alive; } };
  };

  /* an input that grows with what is typed, sitting inside the sentence */
  K.grow = inp => { const f = () => { inp.style.width = Math.max(7, inp.value.length + 2) + 'ch'; }; inp.addEventListener('input', f); f(); };

  K.style('gk-base', `
.gk-ring{display:inline-grid;place-items:center;flex:none;border-radius:50%;background:var(--ring-core,#201E1C);color:var(--ring-ink,#E5D1B8);
  box-shadow:0 0 0 5px var(--ring-sage,#8AA79C),0 6px 14px -6px rgba(20,17,14,.5);font-family:var(--f-display,system-ui);font-weight:800}
.gk-shake{animation:gkShake .42s}
@keyframes gkShake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
.gk-settle{animation:gkSettle .35s ease-out}
@keyframes gkSettle{0%{transform:scale(1.08)}100%{transform:none}}
.gk-in{font:inherit;font-weight:700;color:var(--accent-ink,#8A6440);background:rgba(20,17,14,.06);border:none;border-bottom:2px solid var(--ink,#232C31);
  padding:.05em .35em;margin:0 .15em;min-width:7ch;border-radius:var(--r-box,16px) 3px 0 0;outline:none}
.gk-in:focus{background:rgba(221,142,88,.12)}
.gk-in:disabled{opacity:1}
.gk-good{background:var(--right-soft,rgba(74,107,92,.12));color:var(--right,#4A6B5C);border-radius:var(--r-tap,999px);padding:0 .4em;font-weight:700}
.gk-hint{font-family:var(--f-display,system-ui);font-size:.82rem;letter-spacing:0;color:var(--faint,#8B7B78)}
@media(prefers-reduced-motion:reduce){.gk-shake,.gk-settle{animation:none}}`);

  /* the turn-over card, shared by Pairs and Flip */
  K.style('gk-cardflip', `
.fc-stage{perspective:1200px;margin:.5rem 0 .2rem}
.fc-card{position:relative;min-height:12rem;transform-style:preserve-3d;transition:transform .55s cubic-bezier(.3,.7,.2,1)}
.fc-card.fc-over{transform:rotateY(180deg)}
.fc-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:var(--r-box,16px);background:var(--sheet,#FEFCF9);
  box-shadow:0 1px 0 rgba(20,17,14,.08),0 16px 32px -18px rgba(20,17,14,.55);padding:1.3rem 1.3rem 1.1rem;display:flex;flex-direction:column}
.fc-back{align-items:center;justify-content:center;gap:1rem;cursor:pointer;
  background:repeating-linear-gradient(135deg,var(--sheet,#FEFCF9) 0 14px,rgba(229,209,184,.38) 14px 28px)}   /* the back of a card: paper and a wash of the home page's sand */
.fc-back:focus-visible{outline:2px solid var(--accent-ink);outline-offset:3px}
.fc-back .gk-ring{width:5.6rem;height:5.6rem;min-width:5.6rem;font-size:1.05rem;padding:.4rem .9rem;text-align:center;line-height:1.15}
.fc-front{transform:rotateY(180deg);justify-content:center;gap:1rem}
.fc-front .cg-line{margin:0;font-size:clamp(1.05rem,3vw,1.25rem);line-height:1.8}
.fc-corner{align-self:flex-end;margin:-.4rem -.4rem -.3rem 0}   /* its own line: a long clue never sits on the sentence */
.fc-corner .gk-ring{width:auto;min-width:2.6rem;height:2.6rem;font-size:.62rem;padding:0 .6rem;border-radius:999px;text-align:center;line-height:1.1;letter-spacing:.06em;box-shadow:0 0 0 3px var(--ring-sage,#8AA79C)}
/* a word longer than its disc stretches the ring into a pill, keeping core and rim */
.gk-pill{width:auto!important;border-radius:999px!important}
.fc-act{font-size:.92rem;color:var(--dim);line-height:1.5;margin:0}
.fc-row{display:flex;justify-content:flex-end}
@media(prefers-reduced-motion:reduce){.fc-card{transition:none}}`);
})();
