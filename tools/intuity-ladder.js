/* INTUITY — one ladder for every game.
   ------------------------------------------------------------------
   Before this, five games each drew their own five marks. The colours
   happened to match; nothing else did. Crown meant 29 in Descent, 26 in
   Hunt, 30 in the gerunds Board and 10 in Pairs, and Rack and Pegs had
   no ladder at all — so a child who reached Crown in one game and
   Ember in another learned nothing from the comparison.

   Forcing one set of numbers would be worse: twelve typed cards and
   twenty-nine falling rows are not the same quantity. What is shared is
   the meaning. Each game declares what a strong round looks like for it,
   and the ladder places the five marks as fractions of that. Crown then
   means the same thing everywhere — you finished strong — while the
   arithmetic stays honest per game.

       <script src="intuity-ladder.js"></script>

       LADDER.mount('#ladder', { target: 16 });   // once, per round
       const reached = LADDER.set(hits);          // after every answer
       if (reached >= 0) flash(LADDER.name(reached), LADDER.colour(reached));

   set() returns the index of a mark newly reached, or -1. The page keeps
   its own banner, so each game can celebrate in its own voice.
   ------------------------------------------------------------------ */
(function (global) {
  'use strict';

  var NAMES = ['Spark', 'Ember', 'Flame', 'Blaze', 'Crown'];
  var COLS  = ['#cdbf8e', '#e8935a', '#ff7a45', '#ff4d4d', '#ffd94a'];

  /* Fractions of a strong round. These reproduce Descent's original
     curve (3, 8, 14, 21, 29 out of ~29) almost exactly, so the pacing
     that was already tuned by hand is preserved. */
  var STOPS = [0.10, 0.27, 0.48, 0.72, 1.00];

  var CSS = [
    '.il{display:flex;align-items:center;justify-content:center;gap:.45rem}',
    '.il-mark{display:flex;flex-direction:column;align-items:center;gap:.14rem;width:36px}',
    '.il-dot{width:14px;height:14px;border-radius:50%;background:none;',
      'border:2px solid var(--il-idle,rgba(255,255,255,.3));transition:all .3s}',
    '.il-lbl{font-family:"DM Mono",ui-monospace,monospace;font-size:.4rem;letter-spacing:.08em;',
      'text-transform:uppercase;color:var(--il-label,rgba(255,255,255,.45));transition:color .3s}',
    '.il-mark.on .il-dot{border-color:currentColor;background:currentColor;box-shadow:0 0 10px currentColor}',
    '.il-mark.on .il-lbl{color:var(--il-label-on,#fff)}',
    '.il-link{width:12px;height:1px;background:var(--il-link,rgba(255,255,255,.22));transition:background .3s}',
    '.il-link.on{background:var(--il-link-on,#C9A961)}'
  ].join('');

  var host = null, marks = [], at = -1;

  function style(){
    if (document.getElementById('il-style')) return;
    var s = document.createElement('style');
    s.id = 'il-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  var LADDER = {

    /* target: the number of correct answers that counts as a strong round
       in this game. Everything else follows from it. */
    mount: function (sel, opts) {
      style();
      host = typeof sel === 'string' ? document.querySelector(sel) : sel;
      if (!host) return;
      var target = Math.max(1, (opts && opts.target) || 10);
      marks = STOPS.map(function (f) { return Math.max(1, Math.round(f * target)); });
      /* No two marks may share a number, or a round would climb two at
         once and the banner would flash twice on one answer. */
      for (var i = 1; i < marks.length; i++)
        if (marks[i] <= marks[i-1]) marks[i] = marks[i-1] + 1;
      at = -1;
      host.className = 'il';
      host.innerHTML = NAMES.map(function (n, i) {
        return (i ? '<div class="il-link" data-l="' + i + '"></div>' : '') +
          '<div class="il-mark" data-m="' + i + '" style="color:' + COLS[i] + '">' +
            '<div class="il-dot"></div><div class="il-lbl">' + n + '</div>' +
          '</div>';
      }).join('');
      return marks.slice();
    },

    /* Returns the index of a mark newly reached, or -1. */
    set: function (score) {
      if (!host) return -1;
      var m = -1, i;
      for (i = 0; i < marks.length; i++) if (score >= marks[i]) m = i;
      if (m === at) return -1;
      at = m;
      for (i = 0; i < NAMES.length; i++){
        var el = host.querySelector('[data-m="' + i + '"]');
        if (el) el.classList.toggle('on', i <= at);
        var lk = host.querySelector('[data-l="' + i + '"]');
        if (lk) lk.classList.toggle('on', i <= at);
      }
      return m;
    },

    at:      function (){ return at; },
    marks:   function (){ return marks.slice(); },
    name:    function (i){ return NAMES[i] || ''; },
    colour:  function (i){ return COLS[i] || ''; },
    names:   function (){ return NAMES.slice(); },

    /* How many more for the next mark — for an end screen that says what
       to aim at rather than only what happened. */
    toNext: function (score){
      for (var i = 0; i < marks.length; i++) if (score < marks[i]) return marks[i] - score;
      return 0;
    }
  };

  global.LADDER = LADDER;
})(window);
