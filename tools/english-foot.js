/* INTUITY · USE OF ENGLISH FOOTER (25 Nov 2026, the owner: "the same trimming" as Speaking
   and Writing, "always improving and making it more alluring").
   Four rings, one per Part. A Part's pages share one footer, as Speaking's and Writing's do:
     Practise  the Part as in the paper (its exam text): where the ring lands
     Learn     the Master page's Explore (the words and traps, with real sentences)
     Drill     the Master page's Practice (one sentence at a time)
     Game      the Challenge board for the Part
   Nothing here switches to another Part. The page's own bottom bar (Submit, Check · Skip)
   stands just above this footer. It is lifted, not moved: the drill pages redraw it and look
   for it where they put it. (None of these pages pins its body, the cause of Writing's
   iPhone gap.)
   Back: the exam text goes to the menu; Learn, Drill and Game go back to their Part.
   Include on a page:  <script src="/tools/english-foot.js?v=1" defer></script> */
(function () {
  'use strict';
  var PARTS = {
    1: { name: 'Part 1', exam: '/skills/use-of-english/multiple-choice/multiple-choice-texts.html', master: '/skills/use-of-english/multiple-choice/master-part1.html', game: 'uoe-part1' },
    2: { name: 'Part 2', exam: '/skills/use-of-english/gap-fill/gap-fill.html', master: '/skills/use-of-english/gap-fill/master-part2.html', game: 'uoe-part2' },
    3: { name: 'Part 3', exam: '/skills/use-of-english/word-formation/word-formation.html', master: '/skills/use-of-english/word-formation/word-families.html', game: 'word-formation' },
    4: { name: 'Part 4', exam: '/skills/use-of-english/word-transformation/word-transformation.html', master: '/skills/use-of-english/word-transformation/master-part4.html', game: 'uoe-part4' }
  };
  var GAME = function (n) { return '/skills/challenge/challenge.html?board=1&section=vocabulary&topic=' + PARTS[n].game; };
  var P = new URLSearchParams(location.search), path = location.pathname;

  function partOf() {
    for (var n in PARTS) {
      if (path === PARTS[n].exam || path === PARTS[n].master) return +n;
      if (/\/challenge\/challenge\.html$/.test(path) && P.get('topic') === PARTS[n].game) return +n;
    }
    return 0;
  }
  function hereOf(n) {
    if (path === PARTS[n].exam) return 'practise';
    if (path === PARTS[n].master) return P.get('mode') === 'explore' ? 'learn' : 'drill';
    return 'game';
  }

  function draw() {
    var n = partOf(); if (!n) return true;
    if (!document.body || document.querySelector('.ef-foot')) return !!document.body;
    var here = hereOf(n), D = PARTS[n];
    var pills = [['practise', 'Practise', D.exam], ['learn', 'Learn', D.master + '?mode=explore'], ['drill', 'Drill', D.master + '?mode=practice'], ['game', 'Game', GAME(n)]];
    var css = document.createElement('style');
    css.textContent =
      '.ef-foot{position:fixed;left:0;right:0;bottom:0;z-index:45;display:flex;flex-direction:column;align-items:stretch;background:#F3F1ED;border-top:1px solid rgba(20,17,14,.1);padding:.55rem 12px calc(.55rem + env(safe-area-inset-bottom,0px))}' +
      '.ef-st{align-self:center;display:flex;gap:2px;padding:3px;border-radius:999px;background:rgba(20,17,14,.07)}' +
      '.ef-s{font:700 .6875rem/1 Geist,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#8A8378;text-decoration:none;padding:.6rem .85rem;border-radius:999px;white-space:nowrap;-webkit-tap-highlight-color:transparent}' +
      '.ef-s.on{background:#FAF8F5;color:#14110E;box-shadow:0 1px 2px rgba(20,17,14,.12)}' +
      '.ef-s:focus-visible{outline:2px solid #C2956E;outline-offset:2px}' +
      '@media(max-width:380px){.ef-s{padding:.6rem .6rem;letter-spacing:.05em}}' +
      /* the page's own bar stands on the footer; what floated above the bar floats above both */
      '.mk-bar,#bar.bar,#footer.footer{bottom:var(--ef-h,58px)!important;padding-bottom:.6rem!important}' +
      '.ri-pill{bottom:calc(var(--ef-h,58px) + var(--eb-h,60px) + 10px)!important}' +
      '.help-link{bottom:calc(var(--ef-h,58px) + var(--eb-h,60px) + 8px)!important}.toast{bottom:calc(var(--ef-h,58px) + var(--eb-h,60px) + 24px)!important}' +
      'body.has-ef-foot{padding-bottom:calc(var(--ef-h,58px) + var(--eb-h,60px) + 16px)!important}' +
      /* CRITICISM-FREE (25 Nov 2026, the owner, after Writing): what the pupil wrote is never struck
         through or painted red; it stays, quiet and grey, beside the right answer. Missed dots and
         bars are grey, not rust. Scoped to Use of English: the stylesheets are shared. */
      'body.has-ef-foot{--wrong:#9A6A3C;--wrong-soft:rgba(154,106,60,.1);--tile-no-ink:#8C857B;--tile-no-bg:rgba(20,17,14,.05)}' +
      'body.has-ef-foot .mk-gap.done.no,body.has-ef-foot .gap.incorrect,body.has-ef-foot .answer-input.incorrect,body.has-ef-foot .answer-user,' +
        'body.has-ef-foot .option.incorrect,body.has-ef-foot .option-large.incorrect,body.has-ef-foot .opt.no,body.has-ef-foot .watch .no,body.has-ef-foot .aff.miss,body.has-ef-foot .gapbtn.no' +
        '{text-decoration:none!important;color:#8C857B!important}' +
      'body.has-ef-foot .mk-dot.no,body.has-ef-foot .mk-ov-bars i.no,body.has-ef-foot .qdot.no,body.has-ef-foot .ov-bar.no,body.has-ef-foot .dots i.no{background:#CFC8BD!important}' +
      'body.has-ef-foot .mk-t.miss::after{background:#C2956E!important}' +
      /* the Master pages' Explore · Practice · Challenge row is now this footer */
      'body.has-ef-foot #modes{display:none!important}' +
      '@media print{.ef-foot{display:none!important}}';
    document.head.appendChild(css);
    var f = document.createElement('nav'); f.className = 'ef-foot'; f.setAttribute('aria-label', 'Use of English ' + D.name + ': practise, learn, drill, game');
    f.innerHTML = '<div class="ef-st">' + pills.map(function (p) {
      return '<a class="ef-s be2-nohit' + (p[0] === here ? ' on" aria-current="page' : '') + '" href="' + p[2] + '" target="_top">' + p[1] + '</a>';
    }).join('') + '</div>';
    document.body.appendChild(f); document.body.classList.add('has-ef-foot');
    var fit = function () {
      document.documentElement.style.setProperty('--ef-h', f.offsetHeight + 'px');
      var bar = document.querySelector('.mk-bar, #bar.bar, #footer.footer');
      document.documentElement.style.setProperty('--eb-h', (bar ? bar.offsetHeight : 0) + 'px');
    };
    if (window.MutationObserver) { var t = 0; new MutationObserver(function () { clearTimeout(t); t = setTimeout(fit, 60); }).observe(document.body, { childList: true, subtree: true }); }
    if (window.ResizeObserver) new ResizeObserver(fit).observe(f);
    fit(); addEventListener('resize', fit);
    /* back: the exam text is the Part's entry; everything else goes back to it */
    var back = function () {
      if (here === 'practise') return;
      var b = document.querySelector('.back-link'); if (!b) return;
      if (b.getAttribute('href') !== D.exam) { b.setAttribute('href', D.exam); b.textContent = '← ' + D.name; }
    };
    back(); setTimeout(back, 600); setTimeout(back, 2000);
    return true;
  }
  function go() { var t = 0; (function r() { if (!draw() && ++t < 30) setTimeout(r, 100); })(); }
  if (document.readyState !== 'loading') go(); else document.addEventListener('DOMContentLoaded', go);
})();
