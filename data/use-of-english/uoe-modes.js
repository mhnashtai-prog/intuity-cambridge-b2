/* ═══════════════════════════════════════════════════════════════════════
   USE OF ENGLISH — THE VIEW TOGGLE

   Parts 2, 3 and 4 each already HAVE two readings of a test — classic and
   guided, the whole test or one section at a time. What they lacked was
   the control multiple choice has: the pill pair sitting on the top-right
   corner of the card it reshapes.

   They had a slider instead, inside the card, and three things were wrong
   with it. It sat in the thing it reshapes, so the control moved when you
   used it. It was written twice per page — once in the classic container
   and once rebuilt by renderGuidedMode() — so the two copies could
   disagree. And a two-state switch labelled on both sides never says
   which side is on: you read "Text · Chunks" and still have to look at
   the card to know where you are. A pill pair marks the active one.

   TWO OPTIONS, NOT THREE. Every engine here defines exactly two:
   `currentMode` is 'classic' or 'guided' and renderGuidedMode() shows one
   section. A third button would have nothing behind it. Word formation's
   per-sentence material is real but it is a DATASET — the "Single
   sentences" tab in the row above — not a third view of a passage, and
   putting it in this control would say the wrong thing about what it is.

   ONE LINE PER PAGE:
     <body data-uoe-modes="Full text|Paragraph">
     <script src="/data/use-of-english/uoe-modes.js?v=2"></script>
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var spec = document.body.getAttribute('data-uoe-modes');
  if (!spec) return;
  var labels = spec.split('|').map(function (s) { return s.trim(); }).filter(Boolean);
  if (labels.length !== 2) return;

  /* The pages declare `let currentMode` at script top level, which is not
     reachable on window — so this control cannot read their state and must
     not try. It keeps its own, and stays in step because it is the only
     thing left that can change the mode: the sliders are hidden in
     uoe.css and nothing else calls toggleMode().

     Index 0 matches every page's `let currentMode = 'classic'`. */
  var at = 0;

  var row = document.createElement('div');
  row.className = 'viewrow';
  var tog = document.createElement('div');
  tog.className = 'viewtog';
  tog.setAttribute('role', 'group');
  tog.setAttribute('aria-label', 'How much to show');
  row.appendChild(tog);

  var btns = labels.map(function (label, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'viewbtn' + (i === 0 ? ' active' : '');
    b.textContent = label;
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.addEventListener('click', function () {
      if (i === at || typeof window.toggleMode !== 'function') return;
      window.toggleMode();
      at = i;
      paint();
      /* Switching view replaces the card under you; without this the page
         keeps a scroll position that belonged to the other layout. */
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); }
      catch (e) { window.scrollTo(0, 0); }
    });
    tog.appendChild(b);
    return b;
  });

  function paint() {
    btns.forEach(function (b, i) {
      b.classList.toggle('active', i === at);
      b.setAttribute('aria-pressed', i === at ? 'true' : 'false');
    });
  }

  /* Directly above the card, inside the same container — the toggle belongs
     to the card, not to the page header, and multiple choice puts it in
     exactly this place. */
  function place() {
    var card = document.getElementById('classicContainer');
    if (!card || !card.parentNode) return false;
    card.parentNode.insertBefore(row, card);
    return true;
  }
  if (!place()) {
    document.addEventListener('DOMContentLoaded', place);
  }
})();
