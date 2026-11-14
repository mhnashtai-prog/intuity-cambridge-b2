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
    var s = document.createElement('script'); s.src = '/tools/be2-map.js?v=6'; s.onload = fn; document.head.appendChild(s);
  }
  var CSS = '.roof{display:flex;justify-content:center;gap:.8em;margin:3px 0 0;white-space:nowrap}' +
    '.roof a{position:relative;display:inline-block;padding:7px 0 6px;font:600 .58rem/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.1em;' +
    'text-transform:uppercase;text-decoration:none;color:#8A847C;-webkit-tap-highlight-color:transparent}' +
    '.roof a::before{content:"";position:absolute;inset:-8px -6px}' +           /* a 44px-tall target without a taller line */
    '.roof a.on{color:#14110E;box-shadow:inset 0 -2px 0 #C2956E}' +
    '.roof a:focus-visible{outline:2px solid #C2956E;outline-offset:3px}' +
    '.roofed .back-link{white-space:nowrap}' +
    '.roofed .app-subtitle,.roofed #ccSub{display:none!important}';
  function build() {
    var hit = BE2_MAP.roofOf(location.pathname + location.search); if (!hit) return true;
    /* under the subtitle's place, or under INTUITY where a page has no subtitle (Models) */
    var sub = document.querySelector('.app-subtitle, #ccSub') || document.querySelector('.header-title .app-title');
    if (!sub) return false;   /* some pages draw their header late */
    if (document.querySelector('nav.roof')) return true;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var nav = document.createElement('nav'); nav.className = 'roof'; nav.setAttribute('aria-label', hit.roof.name);
    nav.innerHTML = hit.roof.items.map(function (x, i) {
      return '<a href="/' + x.url + '"' + (i === hit.i ? ' class="on" aria-current="page"' : '') + ' target="_top">' + x.name + '</a>';
    }).join('');
    sub.parentNode.insertBefore(nav, sub.nextSibling);
    document.documentElement.classList.add('roofed');
    return true;
  }
  ready(function () { withMap(function () {
    var n = 0; (function go() { if (!build() && ++n < 30) setTimeout(go, 100); })();
  }); });
})();
