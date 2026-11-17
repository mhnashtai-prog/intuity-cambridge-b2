/* INTUITY · ESSAY ROUTES (17 Nov 2026, the owner, after learner 2: "six essay types, but the
   exam has one essay").
   Every B2 First essay asks for the pupil's view with reasons ("…giving reasons for your
   point of view"). So the six coursebook types are shown as two ROUTES to that view and
   three sets of EXTRA phrases for what the question is about:
     Your view (Opinion; Agree & Disagree is the same essay and is folded in) · Both sides
     (For & Against) · Problems · Causes · The future
   The data keeps its own names (other code looks them up), so this script only changes
   what the pupil reads: the strip items, the kickers, and one line above the strip.
   Include on a page:  <script src="/tools/essay-routes.js?v=4" defer></script> */
(function () {
  'use strict';
  var MAP = {
    'for & against': 'Both sides', 'opinion': 'Your view', 'agree & disagree': 'Your view',
    'problems & solutions': 'Problems', 'problem & solution': 'Problems', 'cause & effect': 'Causes',
    'speculation & trends': 'The future', 'speculation, generalisation & trends': 'The future'
  };
  var HIDE = 'agree & disagree';            /* a second "Your view" in a strip would only confuse */
  var KICK = /(^|·\s*|\s)(For & Against|Opinion|Agree & Disagree|Problems & Solutions|Cause & Effect|Speculation, Generalisation & Trends|Speculation & Trends)(?=\s*(·|$))/;
  /* 17 Nov 2026 (the owner, after a real paper): the question does not pick the extras, the pupil
     does; the link opens Maya's clip, one real question answered five ways */
  var NOTE = 'Every essay gives your view, with reasons. Choose a route; borrow any extras you like.';
  /* the clip as a ring, the Daily 5 ring of the landing page (12 Nov 2026): dark, rimmed, "5 WAYS",
     with a caramel play mark on its edge, so it reads as something to watch */
  var CLIP = '<a class="routes-clip" href="/skills/writing/how-essay.html" aria-label="Watch: one question, five ways"><b>5</b><small>WAYS</small></a>';
  var CSS = '.routes-note{margin:.2rem auto .55rem;max-width:34rem;padding:0 16px;text-align:center;font:400 .8125rem/1.4 Geist,system-ui,sans-serif;color:#7A7068}' +
    '.routes-x{display:none!important}' +
    '.routes-note.has-clip{display:flex;align-items:center;gap:14px;text-align:left}' +
    '.routes-note .rn-t{flex:1}' +
    '.routes-clip{position:relative;flex:none;width:58px;height:58px;border-radius:50%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;' +
      'border:1.5px solid #C9C1B4;background:#14110E;color:#F7F5F1;text-decoration:none;box-shadow:0 0 0 3px rgba(250,248,245,.95),0 8px 18px -10px rgba(20,17,14,.6);-webkit-tap-highlight-color:transparent;transition:transform .18s}' +
    '.routes-clip b{font:400 1.35rem/1 Anton,Impact,sans-serif}' +
    '.routes-clip small{font:600 .5rem/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.18em;padding-left:.18em;color:#E5D1B8}' +
    '.routes-clip::after{content:"";position:absolute;right:-5px;bottom:-3px;width:20px;height:20px;border-radius:50%;background:#C2956E;box-shadow:0 0 0 2px #FAF8F5;' +
      'background-image:linear-gradient(transparent,transparent);-webkit-mask:none}' +
    '.routes-clip::before{content:"";position:absolute;right:2px;bottom:3.5px;z-index:1;border-left:7px solid #fff;border-top:4.5px solid transparent;border-bottom:4.5px solid transparent}' +
    '.routes-clip:active{transform:scale(.95)}.routes-clip:focus-visible{outline:2px solid #C2956E;outline-offset:3px}';
  function norm(s) { return String(s || '').replace(/\s+/g, ' ').replace(/&amp;/g, '&').trim().toLowerCase(); }

  function pass() {
    var seen = [];
    /* the strip items: a button, link or tab whose whole text is a type name */
    document.querySelectorAll('button, a, [role="tab"], .tab, .chip').forEach(function (el) {
      if (el.closest('.routes-note') || el.children.length > 2) return;
      var full = norm(el.textContent), cnt = /\s*\(\d+\)$/.exec(full), t = cnt ? full.slice(0, cnt.index) : full;   /* "Opinion (11)" */
      if (!MAP[t]) return;
      if (t === HIDE) { el.classList.add('routes-x'); return; }
      /* change only the text node, so the element keeps its icons and handlers */
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
      while ((n = walker.nextNode())) { if (norm(n.nodeValue)) { var cv = /\s*\(\d+\)\s*$/.exec(n.nodeValue); n.nodeValue = MAP[t] + (cv ? cv[0] : ''); break; } }
      if (el.parentElement && seen.indexOf(el.parentElement) < 0) seen.push(el.parentElement);
    });
    /* kickers and titles ("Part 1 · For & Against") */
    var tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), x;
    while ((x = tw.nextNode())) {
      var v = x.nodeValue; if (!v || v.length > 80) continue;
      var m = KICK.exec(v); if (!m) continue;
      var p = x.parentElement; if (!p || p.closest('script,style,.routes-note,#cMain .fc-in,.fc-in')) continue;
      x.nodeValue = v.replace(KICK, function (all, a, name) { return a + MAP[norm(name)]; });
    }
    /* one line above the first strip that shows the routes */
    /* the line goes where the pupil chooses a type (Essentials, the question list), not on Build,
       which stays one calm card */
    if (!document.querySelector('.routes-note') && !/build\.html/.test(location.pathname)) {
      var strip = seen.filter(function (s) { return s.querySelectorAll('button, a, [role="tab"]').length >= 3; })[0];
      if (strip) {
        var row = strip.closest('nav, .tabs, .filter-bar, .wr-types, .subjects, [role="tablist"]') || strip;
        if (row.parentNode && getComputedStyle(row.parentNode).display.indexOf('flex') >= 0 && getComputedStyle(row.parentNode).flexDirection !== 'column') row = row.parentNode;
        var note = document.createElement('p'); note.className = 'routes-note has-clip'; var tx = document.createElement('span'); tx.className = 'rn-t'; tx.textContent = NOTE; note.appendChild(tx); note.insertAdjacentHTML('beforeend', CLIP);
        row.parentNode.insertBefore(note, row);
      }
    }
  }
  function start() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    pass();
    var busy = false;
    new MutationObserver(function () { if (busy) return; busy = true; requestAnimationFrame(function () { pass(); busy = false; }); })
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState !== 'loading') start(); else document.addEventListener('DOMContentLoaded', start);
})();
