/* INTUITY · THE CHECK MOMENT (11 Nov 2026, from the four-way report)
   The grammar Practice and Gap-fill engines check a whole set at once (with one
   more try for the wrong ones, which stays). They checked silently. Now the
   Check is the reward:
   · the right answers light up one after another, a small tick and a little
     glitter each; a wrong one gets the quiet low note
   · the progress dots become the round bar: sage for right first time,
     caramel for right on the second try, clay for wrong
   · the score line gains the longest run of right-first-time answers and a
     best per set kept on the phone ("New best")
   · the end: the fanfare and fireworks for a perfect set, a fanfare for a new
     best, a jingle otherwise
   Loads intuity-sound.js and intuity-cheer.js itself when the page has not.
   CheckReward.play({ els:[...], ok:[...], first:[...], dots:Element|null,
                      score:n, total:n, key:'gapfill.tenses.3', at:Element })
     → returns the line to show: "Longest run 6 · New best" */
(function (g) {
  function load(src, cb) {
    var s = document.createElement('script'); s.src = src; s.onload = cb; s.onerror = cb; document.head.appendChild(s);
  }
  if (!g.SFX) load('/skills/grammar-rules/intuity-sound.js', function () { if (!g.Cheer) load('/tools/intuity-cheer.js?v=2'); });
  else if (!g.Cheer) load('/tools/intuity-cheer.js?v=2');
  var css = '.cr-dots{display:flex;gap:4px}.cr-dots i{flex:1;height:5px;border-radius:3px;background:#E3DED5;transition:background .3s}' +
    '.cr-dots i.ok{background:#8AA79C}.cr-dots i.ok2{background:#C9A57F}.cr-dots i.no{background:#D8B4A3}' +
    '.cr-line{display:block;margin-top:.35rem;font:500 .74rem/1.4 "Geist Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:#6B655C}' +
    '.cr-line b{color:#14110E}.cr-line .new{color:#8E6238;font-weight:700}' +
    '@keyframes crPop{0%{transform:scale(1)}40%{transform:scale(1.08)}100%{transform:scale(1)}}.cr-pop{animation:crPop .35s ease}' +
    '@media (prefers-reduced-motion:reduce){.cr-pop{animation:none}}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);
  function cheer(f, a) { try { if (g.Cheer) g.Cheer[f](a); } catch (e) {} }
  function best(k) { try { return +localStorage.getItem('intuity.best.' + k) || 0; } catch (e) { return 0; } }
  function keep(k, v) { try { localStorage.setItem('intuity.best.' + k, String(v)); } catch (e) {} }
  g.CheckReward = {
    /* the first Check with mistakes: the ones already right tick green, one after another */
    ticks: function (els) {
      var k = 0;
      els.forEach(function (el) { if (!el) return; var d = 120 + (k++) * 110;
        setTimeout(function () { el.classList.remove('cr-pop'); void el.offsetWidth; el.classList.add('cr-pop'); cheer('tick', el); }, d); });
    },
    play: function (o) {
      var n = o.els.length, run = 0, longest = 0;
      for (var i = 0; i < n; i++) { if (o.ok[i] && o.first[i]) { run++; longest = Math.max(longest, run); } else run = 0; }
      /* the cascade: one answer every 110 ms, at most about 1.5 s for a set of ten */
      var step = Math.min(110, 1400 / Math.max(1, n));
      o.els.forEach(function (el, i) {
        setTimeout(function () {
          if (el) { el.classList.remove('cr-pop'); void el.offsetWidth; el.classList.add('cr-pop'); }
          if (o.ok[i]) cheer('tick', el); else if (i === o.ok.indexOf(false)) cheer('soft');
        }, 120 + i * step);
      });
      if (o.dots) o.dots.innerHTML = o.els.map(function (_, i) { return '<i class="' + (o.ok[i] ? (o.first[i] ? 'ok' : 'ok2') : 'no') + '"></i>'; }).join('');
      if (o.dots) o.dots.classList.add('cr-dots');
      var b = best(o.key), nb = o.score > b; if (nb) keep(o.key, o.score);
      setTimeout(function () {
        if (o.score === o.total) cheer('finale');
        else if (nb && b) cheer('streak', o.at);
        else cheer('done', o.at);
      }, 260 + n * step);
      return (longest >= 2 ? 'Longest run <b>' + longest + '</b> · ' : '') +
        (nb ? (b ? '<span class="new">New best</span> · beat ' + b + '/' + o.total : 'First score to beat') : b ? 'Best <b>' + b + '/' + o.total + '</b>' : 'First score to beat');
    }
  };
})(window);
