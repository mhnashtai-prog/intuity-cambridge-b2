/* ═══ SPEAKING · THE MOVES A STUDENT SKIPS COME BACK (be2-moves-memory.js) ═══
   3 Nov 2026, from the pedagogical audit: the Speaking pages remembered
   nothing about a student between visits, so a move skipped in every Talk
   (Speculating, Conceding…) was never brought back.

   After each Talk the moves left unticked are kept ON THIS DEVICE (nothing
   leaves it). Next time, on any card of the same Part, those pills wear a
   caramel ring and one line says which move to work on: in Practice, a tap
   on the pill opens that move's drill (be2-focus-drill.js). A move ticked
   in a later Talk is cleared.

   It reads only what the page already has as globals (stage, ORDER, D,
   cDone, cLeft, LIM or TALK, renderMoves, clockStop) and wraps two of them.
   Loaded on Parts 1, 2 and 4 (Part 3 is a role-play without ticks).
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var page = /part1\b/.test(location.pathname) ? 1 : /part2/.test(location.pathname) ? 2 : /part4/.test(location.pathname) ? 4 : 0;
  if (!page || typeof window.renderMoves !== 'function' || typeof window.clockStop !== 'function') return;
  var KEY = 'be2.speaking.skipped.p' + page;
  var read = function () { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
  var write = function (m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} };
  var limit = function () { return typeof window.LIM === 'number' ? window.LIM : (typeof window.TALK === 'number' ? window.TALK : 0); };
  var nameOf = function (k) { try { return window.D.moves[k].name; } catch (e) { return String(k); } };

  var st = document.createElement('style');
  st.textContent = '#moves .mv.mm-skip{box-shadow:0 0 0 2px #C2956E;position:relative}' +
    '#mmNote{margin:.45rem 0 0;font-size:.8rem;line-height:1.4;color:var(--quiet,#5C5852);text-align:center}' +
    '#mmNote b{color:var(--ink,#14110E)}';
  (document.head || document.documentElement).appendChild(st);

  /* after a Talk: what was skipped is remembered, what was said is cleared */
  var stop0 = window.clockStop;
  window.clockStop = function (reveal) {
    try {
      var ran = limit() - (window.cLeft || 0);
      if (window.stage === 'talk' && ran >= 5 && Array.isArray(window.ORDER) && Array.isArray(window.cDone)) {
        var m = read(), day = new Date().toISOString().slice(0, 10);
        window.ORDER.forEach(function (k) {
          if (window.cDone.indexOf(k) > -1) delete m[k];
          else m[k] = { n: ((m[k] && m[k].n) || 0) + 1, last: day };
        });
        write(m);
      }
    } catch (e) {}
    return stop0.apply(this, arguments);
  };

  /* every time the pills are drawn: ring the skipped ones, say which */
  var draw0 = window.renderMoves;
  window.renderMoves = function () {
    var out = draw0.apply(this, arguments);
    try {
      var m = read(), box = document.getElementById('moves');
      if (!box || !Array.isArray(window.ORDER)) return out;
      var skipped = window.ORDER.filter(function (k) { return m[k]; });
      Array.prototype.forEach.call(box.children, function (el, i) {
        var k = window.ORDER[i];
        el.classList.toggle('mm-skip', !!m[k]);
        if (m[k]) el.title = 'Left out last time';
      });
      var note = document.getElementById('mmNote');
      if (!skipped.length || window.stage === 'talk') { if (note) note.remove(); return out; }
      /* below the whole row (play button + pills), never inside it */
      var row = box.parentNode, host = row && row.parentNode ? row : box;
      if (!note) { note = document.createElement('p'); note.id = 'mmNote'; }
      if (note.previousSibling !== host) host.parentNode.insertBefore(note, host.nextSibling);
      var names = skipped.map(nameOf);
      note.innerHTML = 'Last time you left out <b>' + names.join('</b>, <b>') + '</b>. ' +
        (window.stage === 'practice' ? 'Tap ' + (names.length > 1 ? 'one' : 'it') + ' to drill that move.' : 'Drill it in Practice.');
    } catch (e) {}
    return out;
  };
})();
