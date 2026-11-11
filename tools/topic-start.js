/* INTUITY · TOPIC PAGES START PLAYING (11 Nov 2026, from the likability audit)
   Loaded at the end of each grammar topic page (tenses-rules.html and its nine
   siblings), after the page's own script, whose functions it uses by name.
   1 · The first visit opens on Learn, as before. From the second visit on, the
       page opens on Practice: the pupil has read the rules once, and the next
       thing is to use them. Learn is still one tap away in the header.
   2 · Practice and Rewrite no longer wait on an empty "Pick a set above"
       screen: the moment a frame announces its sets, the set the pupil played
       last on this topic (else the first) starts. The tabs are for switching.
   A ?mode= in the address still wins: a teacher's link or a game's way back. */
(function () {
  var KEY = 'intuity.topic.' + location.pathname, P = new URLSearchParams(location.search);
  function get(k) { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(KEY + k, String(v)); } catch (e) {} }

  /* 2 · start a set as soon as the frame says what its sets are */
  var gates = { practice: 'practiceGate', quiz: 'quizGate' };
  window.addEventListener('message', function (e) {
    var d = e.data; if (!d || d.intuity !== 'tests') return;
    var m = d.mode, g = document.getElementById(gates[m]);
    if (!g || !g.classList.contains('open') || !d.titles || !d.titles.length) return;
    var i = +get('.set.' + m) || 0; if (i >= d.titles.length) i = 0;
    setTimeout(function () { if (g.classList.contains('open') && typeof window.chooseSet === 'function') window.chooseSet(m, i); }, 60);
  });
  /* remember the set the pupil picks */
  if (typeof window.chooseSet === 'function') {
    var orig = window.chooseSet;
    window.chooseSet = function (mode, index) { set('.set.' + mode, index); return orig.apply(this, arguments); };
  }

  /* 1 · second visit on: open on Practice */
  var seen = get('.seen');
  set('.seen', 1);
  if (seen && !P.get('mode') && document.querySelector('.mode-btn[data-mode="quiz"]') && typeof window.switchMode === 'function') {
    try { if (typeof window.mountFrames === 'function') window.mountFrames(); window.switchMode('quiz'); } catch (e) {}
  }
})();
