/* ═══ CHALLENGE GAME · SORT ═════════════════════════════════════════════
   The Gerunds game's way of sorting: the cards come off a deck one at a
   time, and each goes to its pile. A right pile takes the card and its
   ring counts up; a wrong pile throws it back. The piles fill as you go,
   so the two categories build up in front of the learner.
   Receptive, like Sort it. Every wrong pile costs a life (see game-kit.js)
   and the card then goes to the pile it belongs to, marked as missed: the
   penalty costs something and still teaches, and the same card can't be
   tried again on the other pile.
   Keys: 1, 2, 3 for the piles.
   Round: { prompt, bins: ["A","B"], items: [["item",0],…], note }
   22 Nov 2026 (the owner: "the clock is ticking away"):
   · THE CLOCK. Each card burns its own fuse, Defuse's ring: about five
     seconds for a short card, up to ten for a long one. Burning out counts
     as a wrong pile. The fuse pauses while the card is closed.
   · IT COMES BACK. A missed card still goes to its own pile, marked, and
     then returns once at the end of the deck. Sorted right the second time,
     its mark turns into a tick: the mistake is fixed in front of the pupil.
   · BOTH WORK. An item may name two piles: ["It is often argued that …",[0,1]].
     Either pile is right, and the card says so ("Works in both").
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const K = window.GameKit;
  K.style('gk-sort', `
.sg-deck{position:relative;display:grid;place-items:center;min-height:7.2rem;margin:.4rem 0 .2rem;padding-top:2.9rem}
.sg-deck::before,.sg-deck::after{content:'';position:absolute;inset:.5rem 12% auto;height:calc(100% - 1rem);background:var(--sheet,#FEFCF9);border-radius:var(--r-box,16px);
  box-shadow:0 1px 0 rgba(20,17,14,.06);transform:translate(6px,6px) rotate(1.5deg);z-index:0}
.sg-deck::after{transform:translate(3px,3px) rotate(.6deg)}
.sg-deck.sg-last::before,.sg-deck.sg-last::after{display:none}
.sg-card{position:relative;z-index:1;width:76%;min-height:6rem;display:grid;place-items:center;text-align:center;padding:1rem 1.2rem;background:var(--sheet,#FEFCF9);
  border-radius:var(--r-box,16px);box-shadow:0 1px 0 rgba(20,17,14,.08),0 14px 28px -16px rgba(20,17,14,.5);font-family:var(--f-display);font-weight:700;
  font-size:clamp(1rem,3vw,1.2rem);line-height:1.4;color:var(--ink)}
.sg-card.sg-go-0{animation:sgGo0 .32s ease-in forwards}.sg-card.sg-go-1{animation:sgGo1 .32s ease-in forwards}.sg-card.sg-go-2{animation:sgGo2 .32s ease-in forwards}
@keyframes sgGo0{to{transform:translate(-40%,90%) scale(.4);opacity:0}}
@keyframes sgGo1{to{transform:translate(40%,90%) scale(.4);opacity:0}}
@keyframes sgGo2{to{transform:translate(0,90%) scale(.4);opacity:0}}
.sg-card.sg-in{animation:sgIn .25s ease-out}
@keyframes sgIn{from{transform:translateY(-10px);opacity:0}}
.sg-count{z-index:2}
.sg-piles{display:grid;gap:.6rem}
.sg-pile{display:flex;flex-direction:column;align-items:stretch;gap:.5rem;font:inherit;text-align:left;padding:.8rem .8rem .7rem;border:1px dashed var(--rule);
  border-radius:var(--r-box,16px);background:transparent;cursor:pointer;min-height:6.5rem;transition:background .15s,border-color .15s}
.sg-pile:hover:not(:disabled){background:rgba(138,167,156,.10);border-color:var(--ring-sage,#8AA79C)}
.sg-head{display:flex;align-items:center;gap:.7rem}
.sg-head .gk-ring{width:2.2rem;height:2.2rem;font-size:.9rem;box-shadow:0 0 0 3px var(--ring-sage,#8AA79C)}
.sg-head b{font-family:var(--f-display);font-size:.95rem;color:var(--ink)}
.sg-pile ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.25rem}
.sg-pile li{font-size:.84rem;line-height:1.35;color:var(--sentence);background:var(--sheet,#FEFCF9);border-radius:var(--r-box,16px);padding:.25rem .45rem}
.sg-pile.sg-wrong{border-color:var(--wrong,#B4653A);background:rgba(180,81,58,.07)}
.sg-pile li.sg-missed{color:var(--wrong,#B4653A)}
.sg-pile li.sg-missed::after{content:' \u2715';font-size:.72em;margin-left:.3em}
.sg-pile:disabled{cursor:default}
@media(prefers-reduced-motion:reduce){.sg-card{animation:none!important}}
.sg-top{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;z-index:2}
.sg-fuse{flex:none;width:2.6rem;height:2.6rem;position:relative}
.sg-fuse svg{display:block;width:100%;height:100%;transform:rotate(-90deg)}
.sg-fuse .c{fill:var(--ring-core,#201E1C)}.sg-fuse .t{fill:none;stroke:rgba(20,17,14,.12);stroke-width:5}
.sg-fuse .b{fill:none;stroke:var(--ring-sage,#8AA79C);stroke-width:5;stroke-linecap:round;transition:stroke .3s}
.sg-fuse.hot .b{stroke:var(--wrong,#B4653A)}
.sg-fuse b{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--f-display,system-ui);font-weight:800;font-size:.8rem;color:#F3E7D6}
.sg-again{position:absolute;left:50%;top:-.55rem;transform:translateX(-50%);font:600 .62rem/1 var(--f-mono,monospace);letter-spacing:.16em;text-transform:uppercase;
  color:var(--sheet,#FEFCF9);background:var(--wrong,#B4653A);padding:.3rem .5rem;border-radius:999px}
.sg-both{min-height:1.1rem;margin-bottom:.5rem;text-align:center;font:600 .7rem/1 var(--f-mono,monospace);letter-spacing:.14em;text-transform:uppercase;color:var(--right,#4F6B61);opacity:0;transition:opacity .2s}
.sg-both.on{opacity:1}
.sg-pile li.sg-fixed{color:var(--sentence)}.sg-pile li.sg-fixed::after{content:' \u2713';color:var(--right,#4F6B61)}
.sg-pile li.sg-two::after{content:' \u21C4';font-size:.8em;color:var(--right,#4F6B61);margin-left:.3em}
/* three piles on a phone: the ring above the name, and each placed card kept to two lines */
.sg-piles.sg-3 .sg-pile{min-width:0;padding:.6rem .5rem .55rem;min-height:5.5rem}
.sg-piles.sg-3 .sg-head{flex-direction:column;align-items:flex-start;gap:.35rem}
.sg-piles.sg-3 .sg-head b{font-size:.82rem}
.sg-piles.sg-3 li{font-size:.72rem;line-height:1.3;padding:.2rem .35rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-height:calc(2.6em + .4rem)}
.sg-pile{min-width:0}
@media(prefers-reduced-motion:reduce){.sg-fuse .b{transition:none}}`);

  (window.ChallengeGames = window.ChallengeGames || {}).sortgame = {
    title:'Sort', kind:'game', skill:'receptive',
    accepts: r => r.game === 'sort' && Array.isArray(r.bins) && r.bins.length >= 2 && r.bins.length <= 3 && Array.isArray(r.items) && r.items.length,
    solution: r => r.bins.map((b, k) => b + ': ' + r.items.filter(x => [].concat(x[1]).includes(k)).map(x => x[0]).join(', ')).join(' · '),
    render(host, r, ctx){
      const R = 26, C = 2 * Math.PI * R;
      const binsOf = it => [].concat(it[1]);
      const deck = ctx.shuffle(r.items).map(it => ({ w: it[0], bins: binsOf(it), again: false }));
      const life = K.slips(ctx), placed = r.bins.map(() => []), names = r.bins;
      let at = 0, busy = false, secs = 6, left = 6, tm = null, last = 0;
      const fuseFor = w => Math.max(5, Math.min(10, Math.round(3.5 + w.length * 0.06)));
      host.innerHTML = `<p class="cg-prompt">${ctx.esc(r.prompt)} Send each card to its pile before the ring burns out.</p>
        <div class="sg-deck" id="sgDeck"><div class="sg-top"><span class="sg-fuse" id="sgFuse" role="timer" aria-label="Seconds left"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="c" cx="32" cy="32" r="${R - 4}"/><circle class="t" cx="32" cy="32" r="${R}"/><circle class="b" id="sgBurn" cx="32" cy="32" r="${R}" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="0"/></svg><b id="sgSecs"></b></span><span class="gk-hint sg-count" id="sgCount"></span></div>
          <div class="sg-card" id="sgCard"></div></div><div class="sg-both" id="sgBoth" aria-live="polite"></div>
        <div class="sg-piles${r.bins.length === 3 ? ' sg-3' : ''}" style="grid-template-columns:repeat(${r.bins.length},minmax(0,1fr))">${r.bins.map((b, k) =>
          `<button class="sg-pile" type="button" data-bin="${k}"><span class="sg-head"><span class="gk-ring">0</span><b>${ctx.esc(b)}</b></span><ul></ul></button>`).join('')}</div>`;
      const card = host.querySelector('#sgCard'), count = host.querySelector('#sgCount'), piles = [...host.querySelectorAll('.sg-pile')];
      const fuse = host.querySelector('#sgFuse'), burn = host.querySelector('#sgBurn'), sl = host.querySelector('#sgSecs'), both = host.querySelector('#sgBoth');
      const drawFuse = () => { const f = Math.max(0, left / secs); burn.setAttribute('stroke-dashoffset', (C * (1 - f)).toFixed(2)); sl.textContent = Math.ceil(Math.max(0, left)); fuse.classList.toggle('hot', left <= 2.5); };
      const stop = () => { clearInterval(tm); tm = null; };
      const run = () => { stop(); last = performance.now(); drawFuse();
        tm = setInterval(() => { const now = performance.now();
          if (!host.isConnected){ stop(); return; }
          if (host.offsetParent === null || busy){ last = now; return; }        /* closed, or a card in flight: the fuse waits */
          left -= (now - last) / 1000; last = now; drawFuse();
          if (left <= 0){ stop(); drop(-1); } }, 100); };
      const show = () => {
        const c = deck[at];
        card.className = 'sg-card sg-in'; card.innerHTML = ctx.esc(c.w) + (c.again ? '<span class="sg-again">Again</span>' : '');
        count.textContent = (at + 1) + ' / ' + deck.length;
        host.querySelector('#sgDeck').classList.toggle('sg-last', at >= deck.length - 1);
        secs = left = fuseFor(c.w); run();
      };
      const lock = () => { stop(); host.dataset.locked = '1'; piles.forEach(p => p.disabled = true); document.removeEventListener('keydown', key); };
      const given = () => r.bins.map((b, k) => b + ': ' + placed[k].join(', ')).join(' · ');
      const ring = pile => { const g = pile.querySelector('.gk-ring'); g.textContent = pile.querySelectorAll('li:not(.sg-ghost)').length; g.classList.remove('gk-settle'); void g.offsetWidth; g.classList.add('gk-settle'); };
      /* k = the pile tapped; -1 = the fuse burnt out */
      const drop = k => {
        if (host.dataset.locked || busy || !host.isConnected) return;
        const c = deck[at], right = k >= 0 && c.bins.includes(k);
        let missed = false;
        if (!right){
          K.shake(card);
          if (k >= 0){ const wrong = piles[k]; wrong.classList.add('sg-wrong'); setTimeout(() => wrong.classList.remove('sg-wrong'), 450); }
          if (!life.miss(given() + ' · ' + c.w + ' → ' + (k >= 0 ? names[k] : 'out of time'))){ lock(); return; }
          missed = true;
        }
        stop();
        const bin = right ? k : c.bins[0], pile = piles[bin];
        if (right && c.bins.length > 1){ both.textContent = 'Works in both: ' + c.bins.map(b => names[b]).join(' and '); both.classList.add('on'); setTimeout(() => both.classList.remove('on'), 1300); }
        busy = true;
        setTimeout(() => card.classList.add('sg-go-' + (r.bins.length === 3 ? [0, 2, 1][bin] : Math.min(bin, 2))), missed ? 450 : 0);   /* three piles: left, middle, right */
        setTimeout(() => {
          if (c.again){ if (right && c.li) c.li.className = 'sg-fixed'; }   /* its card is already in the pile */
          else {
            const li = document.createElement('li'); li.textContent = c.w;
            if (missed) li.className = 'sg-missed'; else if (c.bins.length > 1) li.className = 'sg-two';
            pile.querySelector('ul').appendChild(li); placed[bin].push(c.w); ring(pile);
            if (missed && !c.again) deck.push({ w: c.w, bins: c.bins, again: true, li });   /* it comes back once, at the end */
          }
          at++; busy = false;
          if (at >= deck.length){ stop(); card.remove(); fuse.remove(); count.textContent = 'All sorted'; ctx.answer(true, given()); lock(); }
          else show();
        }, missed ? 750 : 300);
      };
      const key = e => { const n = +e.key; if (n >= 1 && n <= r.bins.length && host.isConnected) drop(n - 1); else if (!host.isConnected) document.removeEventListener('keydown', key); };
      piles.forEach(p => p.onclick = () => drop(+p.dataset.bin));
      document.addEventListener('keydown', key);
      show();
    }
  };
})();
