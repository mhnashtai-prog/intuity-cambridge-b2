/* INTUITY CHEER (8 Nov 2026): the Board games' celebration, for any page.
   Taken from skills/challenge/boardgame.html and challenge.html so the
   writing pages feel like the rest of the app: the struck bowl for a right
   answer, a burst of glitter from what was got right, a jingle for a run,
   fireworks and a fanfare at a finish line.

   Cheer.right(el, first)  a right answer: bowl (first try) or pop, glitter from el
   Cheer.soft()            a wrong answer: no buzzer, a quiet low bowl
   Cheer.run(n, el)        n right in a row: every 5th is a jingle and a bigger burst
   Cheer.done(el)          a finish line (an essay built, a checklist complete): jingle + glitter
   Cheer.finale()          the big one: fanfare and fireworks across the screen
   Cheer.tick(el)          a small pop on a tick or a save

   Sound follows the app-wide mute (skills/grammar-rules/intuity-sound.js, SFX);
   glitter and fireworks follow reduced motion. Load intuity-sound.js first. */
(function (global) {
  var calm = global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLS = ['#C2956E', '#E9C98F', '#8AA79C', '#F6F1E6', '#DD8E58', '#4A6B5C'];
  var cv = null, cx = null, parts = [], raf = 0;
  function sfx(n) { try { if (global.SFX && SFX.isOn() && SFX[n]) SFX[n](); } catch (e) {} }
  function canvas() {
    if (cv) return true;
    if (!document.body) return false;
    cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9500';
    document.body.appendChild(cv); cx = cv.getContext('2d'); size();
    addEventListener('resize', size);
    return true;
  }
  function size() { if (!cv) return; var d = global.devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  function step() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(function (p) { return p.life > 0; });
    parts.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.vy += .09; p.vx *= .985; p.life -= p.decay;
      cx.globalAlpha = Math.max(0, p.tw ? p.life * (.5 + .5 * Math.sin(p.life * 40)) : p.life); cx.fillStyle = p.c;
      cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, Math.PI * 2); cx.fill();
    });
    cx.globalAlpha = 1;
    raf = parts.length ? requestAnimationFrame(step) : 0;
  }
  function burstAt(x, y, n, pow) {
    if (calm || !canvas()) return;
    for (var k = 0; k < n; k++) {
      var a = Math.random() * Math.PI * 2, v = (2 + Math.random() * 5) * pow * 2;
      parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5 * pow, life: 1, decay: .012 + Math.random() * .012,
        s: 1.5 + Math.random() * 2.5 * pow + 1, c: COLS[(Math.random() * COLS.length) | 0], tw: Math.random() < .3 });
    }
    if (!raf) raf = requestAnimationFrame(step);
  }
  function from(el, n, pow) {
    if (!el || !el.getBoundingClientRect) { burstAt(innerWidth / 2, innerHeight / 2, n, pow); return; }
    var r = el.getBoundingClientRect(); burstAt(r.left + r.width / 2, r.top + r.height / 2, n, pow);
  }
  /* a tick that pops in: any element gets a short spring */
  function pop(el) {
    if (calm || !el || !el.animate) return;
    try { el.animate([{ transform: 'scale(.85)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.6,.5,1)' }); } catch (e) {}
  }
  global.Cheer = {
    right: function (el, first) { sfx(first === false ? 'pop' : 'correct'); pop(el); from(el, first === false ? 10 : 18, first === false ? .45 : .55); },
    soft: function () { sfx('bowlLow'); },
    run: function (n, el) { if (n > 0 && n % 5 === 0) { setTimeout(function () { sfx('jingle'); from(el, 46, .9); }, 260); return true; } return false; },
    done: function (el) { sfx('jingle'); pop(el); from(el, 50, .9); },
    finale: function () {
      sfx('fanfare');
      if (calm) return;
      for (var k = 0; k < 7; k++) (function (k) { setTimeout(function () {
        burstAt(innerWidth * (.15 + Math.random() * .7), innerHeight * (.12 + Math.random() * .5), 70, 1); sfx(k % 2 ? 'pop' : 'rise'); }, k * 260); })(k);
    },
    tick: function (el) { sfx('tick'); pop(el); from(el, 8, .35); }
  };
})(window);
