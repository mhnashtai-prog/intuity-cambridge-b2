/* ═══════════════════════════════════════════════════════════════════════
   USE OF ENGLISH — THE MODE ROW

   Every exam page already HAS two readings of a test. What differed was
   where you switched between them, and what they were called:

     multiple-choice     a header row      Full test / One at a time
     gap-fill            a slider in the   Text / Chunks
     word-formation      card, duplicated  Text / Chunks
     word-transformation in both views     Text / Chunks

   Three problems with the slider. It sits INSIDE the card it reshapes, so
   the control moves when you use it. It is written twice per page — once
   in the classic container and once rebuilt by renderGuidedMode — so the
   two copies can disagree. And a two-state switch labelled on both sides
   never says which side is on; you read "Text · Chunks" and still have to
   look at the card to know where you are.

   A row of two buttons has none of that: it lives in the header where the
   mode row lives on every other page in the product, it is written once,
   and the active one is marked by weight and an underline.

   This file injects that row and hides the sliders. It does NOT touch any
   page's rendering — it calls the toggleMode() each page already defines.

   ONE LINE PER PAGE:
     <body data-uoe-modes="Full text|Paragraph">
     <script src="/data/use-of-english/uoe-modes.js?v=1"></script>

   Word transformation has no passage to chunk, so its two readings are a
   sheet of six sentences or one at a time — same mechanism, honest labels:
     <body data-uoe-modes="All six|One at a time">
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var spec = document.body.getAttribute('data-uoe-modes');
  if (!spec) return;
  var labels = spec.split('|').map(function (s) { return s.trim(); });
  if (labels.length !== 2) return;

  /* The pages declare `let currentMode` at script top level, which is NOT
     reachable on window — so this row cannot read their state, and must
     not try. It keeps its own instead, and stays in step because it is the
     only control left that can change the mode: the sliders are hidden by
     uoe.css and nothing else calls toggleMode().

     Starting at 0 matches every page's `let currentMode = 'classic'`. */
  var at = 0;

  var row = document.createElement('div');
  row.className = 'mode-selector uoe-modes';
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', 'How to show this test');

  var btns = labels.map(function (label, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mode-btn' + (i === 0 ? ' active' : '');
    b.textContent = label;
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.addEventListener('click', function () {
      if (i === at) return;                  /* already here */
      if (typeof window.toggleMode !== 'function') return;
      window.toggleMode();
      at = i;
      paint();
      /* Switching view replaces the card under you; without this the page
         holds a scroll position that belonged to the other layout. */
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); }
      catch (e) { window.scrollTo(0, 0); }
    });
    row.appendChild(b);
    return b;
  });

  function paint() {
    btns.forEach(function (b, i) {
      b.classList.toggle('active', i === at);
      b.setAttribute('aria-pressed', i === at ? 'true' : 'false');
    });
  }

  /* Placed after the dataset row so the header reads outward-in: where you
     are, which set, then how to show it. */
  var header = document.querySelector('.header');
  if (!header) return;
  var sets = header.querySelector('.uoe-sets');
  if (sets && sets.parentNode === header) header.insertBefore(row, sets.nextSibling);
  else header.appendChild(row);

  /* The header changed height, and the shell holds --header-h to keep the
     sticky content clear of it. */
  function sync() {
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
  sync();
  addEventListener('resize', sync);
  if (window.ResizeObserver) new ResizeObserver(sync).observe(header);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
})();
