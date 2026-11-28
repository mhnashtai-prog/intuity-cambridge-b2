/* INTUITY · TOPIC PAGES START PLAYING (11 Nov 2026, from the likability audit)
   Loaded at the end of each grammar topic page (tenses-rules.html and its nine
   siblings), after the page's own script, whose functions it uses by name.
   1 · The first visit opens on Learn, as before. From the second visit on, the
       page opens on Practice: the pupil has read the rules once, and the next
       thing is to use them. Learn is still one tap away in the header.
   2 · (28 Nov 2026) Removed: Gap-fill and Rewrite wait on the pendulum until the
       pupil picks a set (the owner's rule: they always pick a set first).
   A ?mode= in the address still wins: a teacher's link or a game's way back. */
(function () {
  var KEY = 'intuity.topic.' + location.pathname, P = new URLSearchParams(location.search);
  function get(k) { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(KEY + k, String(v)); } catch (e) {} }

  /* 2 · (removed 28 Nov 2026, the owner: the pendulum showed for a moment, then a set appeared by
     itself.) The pupil always picks the set: the gate is a decision, and it waits for it. */

  /* 1 · second visit on: open on Practice */
  var seen = get('.seen');
  set('.seen', 1);
  if (seen && !P.get('mode') && document.querySelector('.mode-btn[data-mode="quiz"]') && typeof window.switchMode === 'function') {
    try { if (typeof window.mountFrames === 'function') window.mountFrames(); window.switchMode('quiz'); } catch (e) {}
    /* the header's Learn / Practise / Play switch follows the mode now open */
    setTimeout(function () { var row = document.querySelector('.mode-selector'); if (!row) return;
      row.__mgShown = null; row.classList.add('mg-sync'); row.classList.remove('mg-sync'); }, 250);
  }
})();
