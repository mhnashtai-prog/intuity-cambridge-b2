/* INTUITY · FROM THE SECOND VISIT, OPEN ON PRACTICE (11 Nov 2026, the likability audit)
   For pages whose first screen is a long list to read (Collocations, Idiomatic
   Expressions, Descriptive Words). The first visit shows the list, as before;
   from the second visit on, the page opens on its own practice mode by tapping
   that mode's button for the pupil. The list stays one tap away.
   Use, at the end of <body>:  <script src="/tools/second-visit.js?v=1" data-open="#segQuiz"></script>
   A ?mode= (or ?view=) in the address wins. */
(function () {
  var me = document.currentScript, sel = me && me.getAttribute('data-open');
  if (!sel) return;
  var KEY = 'intuity.seen.' + location.pathname, seen = null;
  try { seen = localStorage.getItem(KEY); localStorage.setItem(KEY, '1'); } catch (e) {}
  var P = new URLSearchParams(location.search);
  if (!seen || P.get('mode') || P.get('view')) return;
  function go() { var b = document.querySelector(sel); if (b && !b.classList.contains('active')) b.click(); }
  if (document.readyState === 'complete') setTimeout(go, 250); else addEventListener('load', function () { setTimeout(go, 250); });
})();
