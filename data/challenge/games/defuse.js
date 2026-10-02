/* ═══ CHALLENGE GAME · DEFUSE ═══════════════════════════════════════════
   Bomb Defusal in one cell: the sentence, four wires, a fuse. Cut the wire
   with the right form before the fuse burns down. Letting it burn out
   counts as a wrong cut — a life in Game mode — and the fuse relights,
   shorter, for another try.
   Receptive, like Choose: it plays the Choose rounds,
   so it changes the pressure, never the question.
   Game only: the Exam has no clock inside a cell.

   THE FUSE IS THE RING. It used to be a 6px bar, which read as a progress
   line, not a fuse. It is now the product's ring, as on the Defuse page:
   the seconds left in the core, the rim burning down around them, turning
   clay for the last five seconds. The rim takes the page's --ring-sage, so
   it is caramel in Game mode like every other ring on the card.

   THE FUSE REMEMBERS. Closing the card and opening it again used to light
   a fresh 20 seconds with every wire back, so the pressure was optional.
   The time left and the wires already cut are now kept on the round, so a
   card reopened carries on exactly where it was.
   It also PAUSES while the card is closed. A closed card stays on the page,
   only hidden, and the old fuse kept burning there: left long enough it ran
   out unseen and took lives from a card nobody was looking at. Now no life
   is lost behind a closed card, and none is given back by closing one.
   A new run draws fresh copies of the rounds, so nothing leaks between runs.

   Agreement: see choose.js. `accepts` says which rounds this game can play.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const R = 26, C = 2 * Math.PI * R;          /* the ring's radius and rim length, in a 64-unit box */
  const CSS = `
.df-top{display:flex;align-items:center;gap:1rem;margin:.9rem 0 .4rem}
.df-top .df-text{flex:1;min-width:0}
.df-top .cg-line{margin:.2rem 0}
.df-ring{flex:none;width:3.6rem;height:3.6rem;position:relative}
.df-ring svg{display:block;width:100%;height:100%;transform:rotate(-90deg)}
.df-ring .df-core{fill:var(--ring-core,#201E1C)}
.df-ring .df-track{fill:none;stroke:rgba(20,17,14,.12);stroke-width:5}
.df-ring .df-burn{fill:none;stroke:var(--ring-sage,#8AA79C);stroke-width:5;stroke-linecap:round;transition:stroke .3s}
.df-ring.df-hot .df-burn{stroke:var(--wrong,#B4653A)}
.df-ring b{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--f-display,system-ui);font-weight:800;
  font-size:1.05rem;color:var(--ring-ink,#E5D1B8);font-variant-numeric:tabular-nums}
.df-ring.df-hot b{animation:dfHot .5s steps(2) infinite}
@keyframes dfHot{50%{opacity:.45}}
.cg-lead{font-size:.95rem;color:var(--dim);margin:0 0 .35rem}
.cg-wires{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.6rem}
.cg-wire{position:relative;font:inherit;font-size:.96rem;font-weight:600;text-align:left;padding:.85rem 1rem .85rem 1.7rem;border:1px solid var(--rule);border-radius:var(--r-tap,999px);background:var(--sheet,#FEFCF9);color:var(--ink);cursor:pointer;overflow:hidden}
.cg-wire::before{content:'';position:absolute;left:0;top:0;bottom:0;width:.7rem;background:var(--w)}
.cg-wire.cg-ok{background:var(--right-soft,rgba(74,107,92,.12))} .cg-wire.cg-no{background:var(--wrong-soft,rgba(180,101,58,.13));text-decoration:line-through;opacity:.7}
.cg-wire:disabled{cursor:default}
@media(max-width:420px){.cg-wires{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.df-ring.df-hot b{animation:none}.df-ring .df-burn{transition:none}}`;
  /* four wires in the home page's own tones — sage, caramel, sand, charcoal —
     so a wire's colour says "a different wire", never "right" or "wrong" */
  const WIRES = ['#708A81','#C2956E','#E5D1B8','#484641'];
  let styled = false;

  (window.ChallengeGames = window.ChallengeGames || {}).defuse = {
    title:'Defuse', kind:'game', skill:'receptive',
    accepts: r => r.game === 'choose' && Array.isArray(r.options) && r.options.length === 4,   /* the situation rounds are Swing's */
    solution: r => r.answer,
    render(host, r, ctx){
      if (!styled){ const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); styled = true; }
      /* the fuse's state lives on the round, so closing the card can't reset it */
      const st = r._fuse || (r._fuse = { secs:20, left:20, cut:[] });
      const pen = (r.src || r.game) === 'pendulum';
      const lead = pen ? (r.active != null ? r.active : r.context) : '';
      const line = pen ? (r.passive != null ? r.passive : r.line) : r.prompt;
      if (!st.order) st.order = ctx.shuffle(r.options);          /* the wires stay where they were */
      host.innerHTML = `<div class="df-top"><div class="df-text">
          ${lead ? `<p class="cg-lead">${ctx.esc(lead)}</p>` : ''}
          <p class="cg-line">${ctx.esc(line).replace('___', '<span class="cg-blank" id="cgBlank">&nbsp;</span>')}</p></div>
          <div class="df-ring" id="dfRing" role="timer" aria-label="Seconds left">
            <svg viewBox="0 0 64 64" aria-hidden="true"><circle class="df-core" cx="32" cy="32" r="${R - 4}"/>
              <circle class="df-track" cx="32" cy="32" r="${R}"/><circle class="df-burn" id="dfBurn" cx="32" cy="32" r="${R}"
              stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="0"/></svg><b id="dfSecs"></b></div></div>
        <div class="cg-wires">${st.order.map((o, k) =>
          `<button class="cg-wire${st.cut.includes(o) ? ' cg-no' : ''}" type="button" style="--w:${WIRES[k]}" data-o="${ctx.esc(o)}"${st.cut.includes(o) ? ' disabled' : ''}>${ctx.esc(o)}</button>`).join('')}</div>`;
      const ring = host.querySelector('#dfRing'), burn = host.querySelector('#dfBurn'), secs = host.querySelector('#dfSecs');
      let t = null, last = 0;
      const draw = () => {
        const f = Math.max(0, st.left / st.secs);
        burn.setAttribute('stroke-dashoffset', (C * (1 - f)).toFixed(2));
        secs.textContent = Math.ceil(Math.max(0, st.left));
        ring.classList.toggle('df-hot', st.left <= 5);
      };
      const stop = () => { clearInterval(t); t = null; };
      const lock = () => { stop(); st.done = true; host.dataset.locked = '1'; host.querySelectorAll('.cg-wire').forEach(x => x.disabled = true); };
      const run = () => {
        stop(); last = performance.now(); draw();
        t = setInterval(() => {
          const now = performance.now();
          if (!host.isConnected){ stop(); return; }          /* another card opened: this one is gone */
          if (host.offsetParent === null){ last = now; return; }   /* card closed: the fuse pauses */
          st.left -= (now - last) / 1000; last = now; draw();
          if (st.left <= 0){ stop(); if (host.dataset.locked) return;
            const again = ctx.answer(false, 'the fuse ran out');
            if (again){ st.secs = Math.max(8, st.secs - 5); st.left = st.secs; run(); } else lock(); }
        }, 100);
      };
      host.querySelectorAll('.cg-wire').forEach(b => b.onclick = () => {
        if (host.dataset.locked || b.disabled) return;
        const ok = b.dataset.o === r.answer;
        b.classList.add(ok ? 'cg-ok' : 'cg-no');
        if (ok){ const bl = host.querySelector('#cgBlank'); if (bl) bl.textContent = r.answer; }
        const again = ctx.answer(ok, b.dataset.o);
        if (again){ b.disabled = true; st.cut.push(b.dataset.o); } else lock();
      });
      if (st.done) lock(); else run();
    }
  };
})();
