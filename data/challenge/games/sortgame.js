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
   Agreement: see choose.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const K = window.GameKit;
  K.style('gk-sort', `
.sg-deck{position:relative;display:grid;place-items:center;min-height:7.2rem;margin:.4rem 0 1rem}
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
.sg-count{position:absolute;right:0;top:0;z-index:2}
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
@media(prefers-reduced-motion:reduce){.sg-card{animation:none!important}}`);

  (window.ChallengeGames = window.ChallengeGames || {}).sortgame = {
    title:'Sort', kind:'game', skill:'receptive',
    accepts: r => r.game === 'sort' && Array.isArray(r.bins) && r.bins.length >= 2 && Array.isArray(r.items) && r.items.length,
    solution: r => r.bins.map((b, k) => b + ': ' + r.items.filter(x => x[1] === k).map(x => x[0]).join(', ')).join(' · '),
    render(host, r, ctx){
      const deck = ctx.shuffle(r.items), life = K.slips(ctx), placed = r.bins.map(() => []);
      let at = 0, busy = false;
      host.innerHTML = `<p class="cg-prompt">${ctx.esc(r.prompt)} Send each card to its pile.</p>
        <div class="sg-deck" id="sgDeck"><span class="gk-hint sg-count" id="sgCount"></span><div class="sg-card" id="sgCard"></div></div>
        <div class="sg-piles" style="grid-template-columns:repeat(${r.bins.length},1fr)">${r.bins.map((b, k) =>
          `<button class="sg-pile" type="button" data-bin="${k}"><span class="sg-head"><span class="gk-ring">0</span><b>${ctx.esc(b)}</b></span><ul></ul></button>`).join('')}</div>`;
      const card = host.querySelector('#sgCard'), count = host.querySelector('#sgCount'), piles = [...host.querySelectorAll('.sg-pile')];
      const show = () => {
        card.className = 'sg-card sg-in'; card.textContent = deck[at][0];
        count.textContent = (at + 1) + ' / ' + deck.length;
        host.querySelector('#sgDeck').classList.toggle('sg-last', at >= deck.length - 1);
      };
      const lock = () => { host.dataset.locked = '1'; piles.forEach(p => p.disabled = true); document.removeEventListener('keydown', key); };
      const given = () => r.bins.map((b, k) => b + ': ' + placed[k].join(', ')).join(' · ');
      const drop = k => {
        if (host.dataset.locked || busy || !host.isConnected) return;
        const [w, bin] = deck[at];
        let missed = false;
        if (bin !== k){
          const wrong = piles[k];
          K.shake(card); wrong.classList.add('sg-wrong'); setTimeout(() => wrong.classList.remove('sg-wrong'), 450);
          if (!life.miss(given() + ' · ' + w + ' → ' + r.bins[k])){ lock(); return; }
          missed = true;                  /* still alive: the card goes where it belongs, marked */
        }
        const pile = piles[bin];
        busy = true; placed[bin].push(w);
        setTimeout(() => card.classList.add('sg-go-' + Math.min(bin, 2)), missed ? 450 : 0);
        setTimeout(() => {
          const li = document.createElement('li'); li.textContent = w; if (missed) li.className = 'sg-missed';
          pile.querySelector('ul').appendChild(li);
          const ring = pile.querySelector('.gk-ring'); ring.textContent = placed[bin].length; ring.classList.remove('gk-settle'); void ring.offsetWidth; ring.classList.add('gk-settle');
          at++; busy = false;
          if (at >= deck.length){ card.remove(); count.textContent = 'All sorted'; ctx.answer(true, given()); lock(); }
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
