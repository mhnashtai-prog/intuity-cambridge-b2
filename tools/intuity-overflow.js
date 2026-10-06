/* ═══════════════════════════════════════════════════════════════════════
   INTUITY — OVERFLOW ROWS  ·  v2  (the pill)
   ═══════════════════════════════════════════════════════════════════════

   ONE FILE, ONE LINE PER PAGE. Put this in <head>, directly after the
   shell stylesheet, WITHOUT defer:

     <link rel="stylesheet" href="/data/grammar-rules/intuity-shell.css?v=7">
     <script src="/data/grammar-rules/intuity-overflow.js?v=2"></script>

   Why <head> and why no defer: the CSS below is injected the moment this
   file runs, before the browser paints anything, so a long row is born as
   one line. Loaded at the end of <body>, the row would paint wrapped for a
   frame and then jump — the exact header movement this file exists to end.

   WHAT IT DOES. Every row matching ROWS is a single line. While it fits,
   it is centred text exactly as before and no arrows exist. The moment its
   content is wider than the space, two chevrons appear outside the track,
   the last item is cut hard at the edge, and the arrows grey out at each
   end — the Massimo Dutti selector. Shrink the window and it converts back.

   Rows built later by a page's own script (set tabs after a fetch, tabs
   rebuilt on every click) are picked up on their own. A page never calls
   anything.

   WHAT IT DOES NOT TOUCH, deliberately:
     .mode-selector — a mode row that overflows has too many modes. That is
                      an editorial fix, not a scrolling one.
     .seg           — two to four views never need scrolling.
     anything else  — only registered selectors, never "any wide element".

   AUDIT. Open any page with ?audit in the URL. Anything in the header
   that overflows but is not registered is outlined in red and listed in
   the console, along with any page that scrolls sideways.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.IntuityOverflow) return;              // pasted twice: run once

  /* THE ONE LIST. Add a selector here, or put data-overflow on a row. */
  var ROWS = '.set-tabs, .affix-row, [data-overflow]';
  var ACTIVE = '.active, .on, [aria-current], [aria-selected="true"]';
  /* Rows whose chosen item is marked by the pill. The affix row is left
     out: its chips are already outlined objects, and a pill behind a chip
     would be a fill behind a fill. */
  var PILL = '.set-tabs, [data-overflow]';

  /* ── CSS ─────────────────────────────────────────────────────────────
     Width limits move from the row to the wrapper, so the row can fill
     the space between the arrows. Centred only while it fits: centring an
     overflowing flex row pushes its first items off the left edge, where
     no amount of scrolling reaches them. */
  var css = [
    '.ovf{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;',
    '  width:100%;max-width:var(--w-read,40rem);margin:.2rem auto 0}',
    '.ovf:has(> .hidden){display:none}',
    '.ovf > .ovf-row{grid-column:2;min-width:0;max-width:none;margin:0;position:relative;',
    /* no side padding inside the track: scroll-snap would align the first
       item past it and the row would never report being at its start */
    '  padding-left:0;padding-right:0;scroll-padding-inline:0;',
    '  flex-wrap:nowrap !important;justify-content:center;overflow-x:auto;overflow-y:hidden;',
    '  scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;',
    '  overscroll-behavior-x:contain;-webkit-mask-image:none;mask-image:none}',
    '.ovf > .ovf-row::-webkit-scrollbar{display:none}',
    '.ovf > .ovf-row > *{flex:none;scroll-snap-align:start}',
    '.ovf.is-overflowing > .ovf-row{justify-content:flex-start}',
    /* the rows a page writes before this file runs: one line from first paint */
    '.set-tabs,.affix-row,[data-overflow]{flex-wrap:nowrap}',

    '.ovf-btn{display:none;align-items:center;justify-content:center;width:28px;height:28px;',
    '  padding:0;border:none;background:none;cursor:pointer;color:var(--ink,#1B1712);',
    '  transition:color .15s,opacity .15s}',
    '.ovf-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.4;',
    '  stroke-linecap:round;stroke-linejoin:round}',
    '.ovf.is-overflowing > .ovf-btn{display:flex}',
    '.ovf-prev{grid-column:1}.ovf-next{grid-column:3}',
    '.ovf.at-start > .ovf-prev,.ovf.at-end > .ovf-next{color:var(--rule,#D6D1C8);cursor:default}',
    '@media (hover:hover){.ovf-btn:hover{opacity:.6}',
    '  .ovf.at-start > .ovf-prev:hover,.ovf.at-end > .ovf-next:hover{opacity:1}}',
    '@media (pointer:coarse){.ovf-btn{width:36px;height:44px}}',

    /* ── THE PILL ──────────────────────────────────────────────────────
       Compact, flat, light grey: the iOS fill (systemGray at 12%), no
       shadow, no rim. ONE pill per row that slides from tab to tab, so the
       eye follows the choice instead of watching one mark vanish and
       another appear. It lives inside the track, so it scrolls with the
       tabs. Override the tint per page with --ovf-pill. */
    '.ovf-row.has-pill{isolation:isolate}',
    '.ovf-row.has-pill > *{position:relative;z-index:1}',
    '.ovf-row.has-pill > .ovf-pill{position:absolute;z-index:0;left:0;top:0;width:0;height:0;',
    '  border-radius:999px;background:var(--ovf-pill,rgba(118,118,128,.12));pointer-events:none;',
    '  opacity:0;scroll-snap-align:none}',
    '.ovf-row.has-pill > .ovf-pill.is-shown{opacity:1}',
    '.ovf-row.has-pill > .ovf-pill.moving{transition:transform .34s cubic-bezier(.2,1.4,.4,1),',
    '  width .26s cubic-bezier(.2,.8,.2,1),opacity .15s}',
    /* the pill replaces the underline; weight stays, so the choice is never
       carried by a tint alone */
    '.ovf-row.has-pill > .active::after,.ovf-row.has-pill > [aria-current]::after,',
    '.ovf-row.has-pill > [aria-selected="true"]::after{display:none !important}',
    '.ovf-row.has-pill > .vtab{padding-left:.7rem;padding-right:.7rem}',
    '@media (prefers-reduced-motion:reduce){.ovf-row.has-pill > .ovf-pill.moving{transition:opacity .15s}}',

    '.ovf-audit{outline:2px dashed #C0392B !important;outline-offset:2px}'
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'intuity-overflow';
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var CHEV = {
    prev: '<svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5"/></svg>',
    next: '<svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5"/></svg>'
  };

  /* ── ONE ROW ───────────────────────────────────────────────────────── */
  function arrow(dir) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ovf-btn ovf-' + dir;
    /* A pointer convenience. Keyboard users tab through the real tabs, and
       focusing one scrolls the track by itself. */
    b.tabIndex = -1;
    b.setAttribute('aria-hidden', 'true');
    b.innerHTML = CHEV[dir];
    return b;
  }

  function enhance(row) {
    if (row.__ovf || row.closest('.ovf-btn')) return;
    row.__ovf = true;

    var wrap = document.createElement('div');
    wrap.className = 'ovf';
    var prev = arrow('prev'), next = arrow('next');
    row.parentNode.insertBefore(wrap, row);
    wrap.appendChild(prev);
    wrap.appendChild(row);
    wrap.appendChild(next);
    row.classList.add('ovf-row');

    var lastActive = null, queued = false;

    /* THE PILL. A page's own script often rebuilds its tabs with
       innerHTML = '', which takes the pill with it. So the pill is
       re-inserted whenever it is missing, starting from where the old one
       last stood — the slide survives the rebuild. */
    var usePill = row.matches(PILL), pill = null, pillAt = null;
    if (usePill) row.classList.add('has-pill');

    function placePill(act) {
      if (!usePill) return;
      if (!act) { if (pill) pill.classList.remove('is-shown'); return; }
      var fresh = false;
      if (!pill || pill.parentNode !== row) {
        pill = document.createElement('span');
        pill.className = 'ovf-pill';
        pill.setAttribute('aria-hidden', 'true');
        row.insertBefore(pill, row.firstChild);
        fresh = true;
      }
      var inset = Math.max(2, Math.round(act.offsetHeight * 0.14));
      var to = { x: act.offsetLeft, y: act.offsetTop + inset,
                 w: act.offsetWidth, h: act.offsetHeight - inset * 2 };
      if (fresh) {
        pill.classList.remove('moving');
        var from = pillAt || to;                   // first ever: no slide
        pill.style.width = from.w + 'px';
        pill.style.height = from.h + 'px';
        pill.style.transform = 'translate(' + from.x + 'px,' + from.y + 'px)';
        void pill.offsetWidth;                     // commit the start
      }
      pill.classList.add('moving', 'is-shown');
      pill.style.width = to.w + 'px';
      pill.style.height = to.h + 'px';
      pill.style.transform = 'translate(' + to.x + 'px,' + to.y + 'px)';
      pillAt = to;
    }

    function update() {
      queued = false;
      /* Measured against the WRAPPER, not the row: the arrows take space
         from the row when they appear, so testing the row would flip it
         back and forth at the boundary. */
      var over = row.scrollWidth > wrap.clientWidth + 1;
      wrap.classList.toggle('is-overflowing', over);
      var x = row.scrollLeft, max = row.scrollWidth - row.clientWidth;
      wrap.classList.toggle('at-start', !over || x <= 1);
      wrap.classList.toggle('at-end', !over || x >= max - 1);

      /* Bring the chosen item into view, but only when the choice CHANGES.
         Re-centring on every mutation would fight a student mid-swipe. */
      var act = row.querySelector(ACTIVE);
      placePill(act);
      if (act && act !== lastActive) {
        lastActive = act;
        if (over) centre(act, false);
      }
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }

    /* offsetLeft against the row (position:relative), and scrollTo on the
       row itself — scrollIntoView would also scroll the page. */
    function centre(el, smooth) {
      var left = el.offsetLeft - (row.clientWidth - el.offsetWidth) / 2;
      row.scrollTo({ left: Math.max(0, left), behavior: smooth && !reduce.matches ? 'smooth' : 'auto' });
    }

    function page(dir) {
      if (wrap.classList.contains(dir < 0 ? 'at-start' : 'at-end')) return;
      /* 80% of the visible width: the item cut at the edge becomes the
         first whole one, so nothing is skipped between two taps. */
      row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: reduce.matches ? 'auto' : 'smooth' });
    }
    prev.addEventListener('click', function () { page(-1); });
    next.addEventListener('click', function () { page(1); });

    row.addEventListener('scroll', queue, { passive: true });
    row.addEventListener('focusin', function (e) {
      if (e.target !== row && wrap.classList.contains('is-overflowing')) centre(e.target, true);
    });

    if (window.ResizeObserver) {
      var ro = new ResizeObserver(queue);
      ro.observe(wrap);
      ro.observe(row);
    } else {
      window.addEventListener('resize', queue);
    }
    /* tabs rebuilt, renamed or re-activated by the page's own script */
    /* The pill's own moves are not news: answering them would schedule an
       update every frame, forever. */
    new MutationObserver(function (recs) {
      for (var i = 0; i < recs.length; i++) {
        var r = recs[i];
        if (r.target === pill) continue;
        if (r.type === 'childList' && r.addedNodes.length === 1 && r.addedNodes[0] === pill && !r.removedNodes.length) continue;
        return queue();
      }
    }).observe(row, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ['class', 'aria-selected', 'aria-current', 'hidden']
    });
    /* web fonts change every width once they land */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);

    update();
  }

  /* ── THE PAGE ──────────────────────────────────────────────────────── */
  function scan(root) {
    var list = (root || document).querySelectorAll(ROWS);
    for (var i = 0; i < list.length; i++) enhance(list[i]);
  }

  function audit() {
    var found = [];
    var header = document.querySelectorAll('header, .header');
    for (var h = 0; h < header.length; h++) {
      var els = header[h].querySelectorAll('*');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.closest('.ovf')) continue;
        var cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.display === 'inline') continue;
        if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
          el.classList.add('ovf-audit');
          found.push(el);
        }
      }
    }
    var sideways = document.documentElement.scrollWidth > window.innerWidth + 1;
    console.group('%cINTUITY overflow audit', 'font-weight:bold');
    console.log(found.length ? found.length + ' unregistered overflowing element(s):' : 'Header: nothing unregistered overflows.');
    found.forEach(function (el) { console.log(el); });
    console.log(sideways ? 'PAGE scrolls sideways (' + document.documentElement.scrollWidth + 'px > ' + window.innerWidth + 'px).' : 'Page: no sideways scroll.');
    console.groupEnd();
  }

  function start() {
    scan();
    /* rows inserted later anywhere on the page */
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; scan(); });
    }).observe(document.body, { childList: true, subtree: true });

    if (/[?&]audit\b/.test(location.search)) {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(audit, 300); });
      else setTimeout(audit, 600);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.IntuityOverflow = { refresh: scan, audit: audit, rows: ROWS };
})();
