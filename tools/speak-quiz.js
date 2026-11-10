/* INTUITY · SPEAKING QUIZ KIT (10 Nov 2026)
   The writing pages' game layer, brought to the four Speaking Quizzes without a new
   row on screen:
   · a right pick plays the bowl and a little glitter; a wrong one a quiet low note
   · five first-time picks in a row: the fanfare
   · the card's own five dots become the round bar: sage = built without a slip,
     clay = built after a slip (they are coloured only in Quiz)
   · at the end of an answer, two buttons at most: the next sensible step first
     (built cleanly → say it yourself in Talk; after a slip → build it again),
     then the next question
   · when every question in the topic has been built: "4 / 5 without a slip" and
     a best kept on the phone, per Part and topic
   Needs intuity-sound.js and intuity-cheer.js loaded first (both optional). */
(function (g) {
  var RES = {}, RUN = 0, slipQ = false, slipStep = false;
  function cheer(f) { try { if (g.Cheer) g.Cheer[f].apply(null, [].slice.call(arguments, 1)); } catch (e) {} }
  function best(k) { try { return +localStorage.getItem('intuity.best.speak.' + k) || 0; } catch (e) { return 0; } }
  function keep(k, v) { try { localStorage.setItem('intuity.best.speak.' + k, String(v)); } catch (e) {} }
  g.SQ = {
    /* a new answer to build */
    start: function () { slipQ = false; slipStep = false; },
    /* a new step inside the answer */
    step: function () { slipStep = false; },
    right: function (el) {
      var first = !slipStep; cheer('right', el, first);
      if (first) { RUN++; if (RUN % 5 === 0) cheer('streak', el); } },
    wrong: function () { slipQ = true; slipStep = true; RUN = 0; cheer('soft'); },
    /* the class a dot wears in Quiz */
    cls: function (key) { return RES[key] ? ' q-' + RES[key] : ''; },
    /* the answer is built: returns the buttons and, when the topic is complete, its score */
    end: function (o) {   /* o: {key, keys:[...], part, topic, last:bool, dot:Element, nextLabel?} */
      var r = slipQ ? 'no' : 'ok'; RES[o.key] = r;
      if (o.dot) { o.dot.classList.remove('q-ok', 'q-no'); o.dot.classList.add('q-' + r); }
      var acts = '<div class="sq-acts">' +
        (r === 'ok' ? '<button class="tool on" type="button" data-sq="talk">Now say it yourself →</button>'
                    : '<button class="tool on" type="button" data-again="1">Build it again</button>') +
        '<button class="tool" type="button" data-sq="next">' + (o.nextLabel || (o.last ? 'Next topic →' : 'Next question →')) + '</button></div>';
      var all = o.keys.every(function (k) { return RES[k]; }), score = '', big = null;
      if (all) {
        var n = o.keys.filter(function (k) { return RES[k] === 'ok'; }).length, t = o.keys.length,
            bk = o.part + '.' + o.topic, b = best(bk), nb = n > b;
        if (nb) keep(bk, n);
        score = '<p class="sq-score"><b>' + n + ' / ' + t + '</b> built without a slip' +
          (nb ? (b ? ' · <span class="new">new best</span>' : '') : ' · best ' + b + ' / ' + t) + '</p>';
        setTimeout(function () { if (n === t) cheer('finale'); else if (nb && b) cheer('streak', document.querySelector('.sq-score b')); else cheer('done', document.querySelector('.sq-score b')); }, 250);
      } else {
        setTimeout(function () { var h = document.querySelector('.res h2'); if (r === 'ok') cheer('done', h); else cheer('tick', h); }, 150);
      }
      return score + acts;
    }
  };
  /* the look: dots and the two buttons, the same on every Part */
  var css = '.dots button.q-ok::after{background:#8AA79C}.dots button.q-no::after{background:#C9A57F}' +
    '.dots button.on.q-ok::after,.dots button.on.q-no::after{box-shadow:0 0 0 2px var(--card,#FAF8F5),0 0 0 3.5px #14110E}' +
    '.sq-acts{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.9rem}' +
    '.sq-score{margin:.9rem 0 0;font-size:.95rem;color:var(--dim,#5C5852)}.sq-score b{color:var(--ink,#14110E);font-size:1.15rem}' +
    '.sq-score .new{color:#8E6238;font-weight:600}';
  var s = document.createElement('style'); s.textContent = css; (document.head || document.documentElement).appendChild(s);
})(window);
