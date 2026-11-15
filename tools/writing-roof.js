/* INTUITY · THE ROOF TABS (14 Nov 2026)
   The Writing menu has nine tiles; three of them are roofs (Look it up,
   Practise, Test yourself), each over a few pages (tools/be2-map.js, ROOFS).
   On every page under a roof, this script puts the roof's tabs in the title
   line under INTUITY, in place of the grey subtitle, so moving between the
   pages feels like one page. Each page keeps its own two header rows, which
   is why the tabs live in the title line and not in a third row.
   Include on a page:  <script src="/tools/writing-roof.js?v=1" defer></script> */
(function () {
  'use strict';
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function withMap(fn) {
    if (window.BE2_MAP && BE2_MAP.roofOf) return fn();
    var s = document.createElement('script'); s.src = '/tools/be2-map.js?v=13'; s.onload = fn; document.head.appendChild(s);
  }
  /* THE WRITING TAB (14 Nov 2026): the section tab every Writing page already
     uses (Games, the Sentence pages, How it's marked): mono, 11px, bold, a
     caramel underline on the chosen one, no fill. */
  var CSS = '.roof{display:flex;justify-content:center;gap:.25rem;margin:-.55rem 0 .35rem;white-space:nowrap;flex-wrap:wrap}' +
    '.roof a{position:relative;display:inline-block;padding:.5rem .4rem .35rem;font:700 .6875rem/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.1em;' +
    'text-transform:uppercase;text-decoration:none;color:#9A948B;-webkit-tap-highlight-color:transparent}' +
    '.roof a.on{color:#14110E;box-shadow:inset 0 -2px 0 #C2956E}' +
    '.roof a:focus-visible{outline:2px solid #C2956E;outline-offset:2px}' +
    '.roofed .back-link{white-space:nowrap}' +
    /* the Level badge makes way for the tabs (it said the same on every page) */
    '.roofed .header-spacer:not(:has(button,a,svg)){visibility:hidden}' +
    '.roofed:not(.roofed-task) .app-subtitle,.roofed #ccSub{display:none!important}' +
    /* THE TASK HEADER (14 Nov 2026, the owner: the three Learn it pages must look
       alike). Pages behind a task door that draw their own top (In five, Cards,
       Essentials) get the house header instead: the back link to the task, INTUITY,
       the task and its Part, then the tabs. Its measures are intuity-shell.css's. */
    '.rf-head{max-width:40rem;margin:0 auto;padding:calc(env(safe-area-inset-top,0px) + .55rem) 16px .9rem;box-sizing:border-box;background:transparent}' +
    '.cc-head .rf-head{padding:0 2px .9rem;margin-top:-6px}' +
    '.rf-top{display:grid;grid-template-columns:1fr auto 1fr;align-items:center}' +
    '.rf-top .back-link{justify-self:start;font:700 .6875rem/1 Geist,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#9C9186;text-decoration:none;white-space:nowrap}' +
    '.rf-title{display:flex;flex-direction:column;align-items:center;line-height:1.1}' +
    '.rf-word{font:900 1.09rem/1.1 Geist,system-ui,sans-serif;letter-spacing:.2em;color:#14110E}' +
    '.rf-sub{font:600 .6875rem/1.1 Geist,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#5C5852;margin-top:.1rem}' +
    '.rf-head + .roof{margin-top:-.35rem}' +
    '.rf-hide{display:none!important}';
  var NAME = { essays: 'Essay', emails: 'Email / Letter', articles: 'Article', reviews: 'Review', reports: 'Report', story: 'Story' };
  function build() {
    var here = location.pathname + location.search;
    var hit = (BE2_MAP.taskRoofOf && BE2_MAP.taskRoofOf(here)) || BE2_MAP.roofOf(here); if (!hit) return true;
    if (document.querySelector('nav.roof')) return true;
    /* behind a task door: one header everywhere (see THE TASK HEADER above) */
    if (hit.task) {
      var label = NAME[hit.task] + ' · ' + (hit.task === 'essays' ? 'Part 1' : 'Part 2');
      var own = document.querySelector('.header-top');
      if (!own) {
        var native = document.querySelector('.topbar, .cc-top, header.ihead');
        if (!native) return false;   /* drawn late */
        var hd = document.createElement('header'); hd.className = 'rf-head';
        hd.innerHTML = '<div class="rf-top header-top"><a class="back-link" href="/skills/writing/gate.html?task=' + hit.task + '" target="_top">← ' + NAME[hit.task].replace(' / Letter', '') + '</a>' +
          '<div class="rf-title"><div class="rf-word">INTUITY</div><div class="rf-sub">' + label + '</div></div><span></span></div>';
        native.parentNode.insertBefore(hd, native); native.classList.add('rf-hide');
        document.body.style.background = '#F3F1EC';   /* the page colour of the others */
      } else {
        /* the house header is there: back to the task, and its second line names the
           task (kept so, since some pages rewrite it after loading); a picker already does */
        var bl = own.querySelector('.back-link');
        if (bl) {
          var home = '/skills/writing/gate.html?task=' + hit.task, word = '← ' + NAME[hit.task].replace(' / Letter', '');
          var hold = function () { if (bl.getAttribute('href') !== home) bl.setAttribute('href', home); if (bl.textContent !== word) bl.textContent = word; };
          bl.onclick = null; hold();
          /* some pages set their own back link after loading (Recall): the task stays home */
          new MutationObserver(hold).observe(bl, { attributes: true, attributeFilter: ['href'], childList: true, characterData: true, subtree: true });
        }
        var s2 = own.querySelector('.app-subtitle');
        if (s2 && !s2.querySelector('button')) {
          var keep = function () { if (s2.textContent !== label) s2.textContent = label; };
          keep(); new MutationObserver(keep).observe(s2, { childList: true, characterData: true, subtree: true });
        }
      }
      document.documentElement.classList.add('roofed-task');
    }
    /* under the subtitle's place, or under INTUITY where a page has no subtitle (Models) */
    var sub = document.querySelector('.header-top .app-subtitle, .header-top .rf-sub, #ccSub') || document.querySelector('.header-title .app-title') || document.querySelector('.topbar .brand');
    if (!sub) return false;   /* some pages draw their header late */
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var nav = document.createElement('nav'); nav.className = 'roof'; nav.setAttribute('aria-label', hit.roof.name);
    nav.innerHTML = hit.roof.items.map(function (x, i) {
      return '<a href="/' + x.url + '"' + (i === hit.i ? ' class="on" aria-current="page"' : '') + ' target="_top">' + x.name + '</a>';
    }).join('');
    /* the full width under the title line (four tabs do not fit beside the back
       link); where a page has no title row, just under its subtitle */
    var top = sub.closest('.header-top, .topbar');
    if (top && top.parentNode.classList.contains('rf-head')) top = top.parentNode;
    if (top) top.parentNode.insertBefore(nav, top.nextSibling); else sub.parentNode.insertBefore(nav, sub.nextSibling);
    document.documentElement.classList.add('roofed');
    return true;
  }
  ready(function () { withMap(function () {
    var n = 0; (function go() { if (!build() && ++n < 30) setTimeout(go, 100); })();
  }); });
})();
