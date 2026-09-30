/* ═══ CHALLENGE GAME · DEFUSE ═══════════════════════════════════════════
   Bomb Defusal in one cell: the sentence, four wires, a fuse. Cut the wire
   with the right form before the fuse burns down. Letting it burn out
   counts as a wrong cut — a life in Game mode — and the fuse relights,
   shorter, for another try.
   Receptive, like Choose: it plays the Choose rounds,
   so it changes the pressure, never the question.
   Game only: the Exam has no clock inside a cell.
   Agreement: see choose.js. `accepts` says which rounds this game can play.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const CSS = `
.cg-fuse{height:6px;background:var(--rule);margin:.2rem 0 1rem;overflow:hidden}
.cg-fuse i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#F0B35A,#DD8E58 60%,#C4402F);transform-origin:left;transition:transform .2s linear}
.cg-fuse.cg-hot i{animation:cgHot .5s steps(2) infinite}
@keyframes cgHot{50%{opacity:.45}}
.cg-lead{font-size:.95rem;color:var(--dim);margin:0 0 .35rem}
.cg-wires{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.4rem}
.cg-wire{position:relative;font:inherit;font-size:.96rem;font-weight:600;text-align:left;padding:.85rem .8rem .85rem 1.6rem;border:1px solid var(--rule);background:#fff;color:var(--ink);cursor:pointer;overflow:hidden}
.cg-wire::before{content:'';position:absolute;left:0;top:0;bottom:0;width:.55rem;background:var(--w)}
.cg-wire.cg-ok{background:#DCEFE2} .cg-wire.cg-no{background:#F6DDD7;text-decoration:line-through;opacity:.7}
.cg-wire:disabled{cursor:default}
@media(max-width:420px){.cg-wires{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.cg-fuse.cg-hot i{animation:none}}`;
  const WIRES = ['#C4402F','#2F6FB0','#D9A21B','#1F7A4A'];
  let styled = false;

  (window.ChallengeGames = window.ChallengeGames || {}).defuse = {
    title:'Defuse', kind:'game', skill:'receptive',
    accepts: r => r.game === 'choose' && Array.isArray(r.options) && r.options.length === 4,   /* the situation rounds are Swing's */
    solution: r => r.answer,
    render(host, r, ctx){
      if (!styled){ const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); styled = true; }
      const pen = (r.src || r.game) === 'pendulum';
      const lead = pen ? (r.active != null ? r.active : r.context) : '';
      const line = pen ? (r.passive != null ? r.passive : r.line) : r.prompt;
      host.innerHTML = `<div class="cg-fuse" id="cgFuse"><i></i></div>
        ${lead ? `<p class="cg-lead">${ctx.esc(lead)}</p>` : ''}
        <p class="cg-line">${ctx.esc(line).replace('___', '<span class="cg-blank" id="cgBlank">&nbsp;</span>')}</p>
        <div class="cg-wires">${ctx.shuffle(r.options).map((o, k) =>
          `<button class="cg-wire" type="button" style="--w:${WIRES[k]}" data-o="${ctx.esc(o)}">${ctx.esc(o)}</button>`).join('')}</div>`;
      const fuse = host.querySelector('#cgFuse'), bar = fuse.firstElementChild;
      let secs = 20, left = secs, t = null;
      const stop = () => { clearInterval(t); t = null; };
      const lock = () => { stop(); host.dataset.locked = '1'; host.querySelectorAll('.cg-wire').forEach(x => x.disabled = true); };
      const light = () => { left = secs; fuse.classList.remove('cg-hot'); bar.style.transform = 'scaleX(1)';
        stop(); t = setInterval(() => {
          if (!host.isConnected){ stop(); return; }            /* card closed: the fuse goes out */
          left -= .2; bar.style.transform = 'scaleX(' + Math.max(0, left / secs) + ')';
          if (left <= 5) fuse.classList.add('cg-hot');
          if (left <= 0){ stop(); if (host.dataset.locked) return;
            const again = ctx.answer(false, 'the fuse ran out');
            if (again){ secs = Math.max(8, secs - 5); light(); } else lock(); }
        }, 200); };
      host.querySelectorAll('.cg-wire').forEach(b => b.onclick = () => {
        if (host.dataset.locked) return;
        const ok = b.dataset.o === r.answer;
        b.classList.add(ok ? 'cg-ok' : 'cg-no');
        if (ok){ const bl = host.querySelector('#cgBlank'); if (bl) bl.textContent = r.answer; }
        const again = ctx.answer(ok, b.dataset.o);
        if (again){ b.disabled = true; } else lock();
      });
      light();
    }
  };
})();
