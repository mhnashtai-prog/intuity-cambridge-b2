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
    var s = document.createElement('script'); s.src = '/tools/be2-map.js?v=21'; s.onload = fn; document.head.appendChild(s);
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
    '.cc-head .rf-head{padding:0 2px .9rem;margin-top:-8px}' +
    '.rf-top{display:grid;grid-template-columns:1fr auto 1fr;align-items:center}' +
    '.rf-top .back-link{justify-self:start;font:700 .6875rem/1 Geist,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#9C9186;text-decoration:none;white-space:nowrap}' +
    '.rf-title{display:flex;flex-direction:column;align-items:center;line-height:1.1}' +
    '.rf-word{font:900 1.09rem/1.1 Geist,system-ui,sans-serif;letter-spacing:.2em;color:#14110E}' +
    '.rf-sub{font:600 .6875rem/1.1 Geist,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#5C5852;margin-top:.1rem}' +
    '.rf-head + .roof{margin-top:calc(-.35rem - 1px)}' +
    '.rf-hide{display:none!important}' +
    /* ONE HEADER ON ALL FOUR LEARN IT TABS (16 Nov 2026, a learner's review): the task line is the
       task picker (with its chevron) and the sound button sits on the right, as on In five and Models */
    '.rf-pick{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:.3rem;font:600 .6875rem/1.1 Geist,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#5C5852;margin-top:.1rem;-webkit-tap-highlight-color:transparent}' +
    '.rf-pick svg{width:9px;height:9px}' +
    '.rf-pick:focus-visible,.rf-snd:focus-visible{outline:2px solid #C2956E;outline-offset:3px;border-radius:4px}' +
    '.rf-snd{all:unset;cursor:pointer;justify-self:end;display:grid;place-items:center;width:32px;height:32px;color:#14110E;margin-right:2px}' +
    '.rf-snd.off{color:#9C9186}' +
    '.rf-sheet{position:fixed;inset:0;z-index:9000;display:flex;align-items:flex-end;justify-content:center;background:rgba(20,17,14,.32)}' +
    '.rf-sheet>div{width:min(100%,32rem);background:#FAF8F5;border-radius:18px 18px 0 0;padding:20px 16px calc(20px + env(safe-area-inset-bottom,0px))}' +
    '.rf-sheet h3{margin:0 0 12px;font:600 .6875rem/1 "Geist Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:#7A7068}' +
    '.rf-sheet .o{display:flex;flex-wrap:wrap;gap:8px}' +
    '.rf-sheet a{padding:10px 14px;border-radius:999px;background:rgba(20,17,14,.06);font:500 .9rem/1 Geist,system-ui,sans-serif;color:#14110E;text-decoration:none}' +
    '.rf-sheet a.on{background:#14110E;color:#FAF8F5}';
  var NAME = { essays: 'Essay', emails: 'Email / Letter', articles: 'Article', reviews: 'Review', reports: 'Report', story: 'Story' };
  var ORDER = ['essays', 'emails', 'articles', 'reviews', 'story', 'reports'];
  function wirePick(b, hit) {
    if (!b) return;
    b.onclick = function () {
      var T = BE2_MAP.taskRoofs[hit.key], tpl = T && T.items.filter(function (x) { return x.name === hit.roof.items[hit.i].name; })[0];
      var sh = document.createElement('div'); sh.className = 'rf-sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-label', 'Choose a task');
      sh.innerHTML = '<div><h3>Choose a task</h3><div class="o">' + ORDER.filter(function (k) { return !tpl || !tpl.only || tpl.only.indexOf(k) >= 0; }).map(function (k) {
        var V = BE2_MAP.taskVars[k], u = tpl ? tpl.url.replace(/\{k\}/g, k).replace(/\{print\}/g, V.print).replace(/\{topic\}/g, V.topic) : 'skills/writing/gate.html?task=' + k;
        return '<a href="/' + u + '"' + (k === hit.task ? ' class="on" aria-current="page"' : '') + '>' + NAME[k] + '</a>'; }).join('') + '</div></div>';
      sh.onclick = function (e) { if (e.target === sh) sh.remove(); };
      document.body.appendChild(sh);
    };
  }
  function wireSound(b) {
    if (!b) return;
    var paint = function () { var on = !window.SFX || SFX.isOn();
      b.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="none"/>' +
        (on ? '<path d="M15.5 9.2a4 4 0 0 1 0 5.6"/><path d="M18 6.8a7.4 7.4 0 0 1 0 10.4"/>' : '<path d="M16 9.5l5 5M21 9.5l-5 5"/>') + '</svg>';
      b.setAttribute('aria-label', on ? 'Sound on' : 'Sound off'); b.classList.toggle('off', !on); };
    if (!window.SFX) { var s = document.createElement('script'); s.src = '/skills/grammar-rules/intuity-sound.js?v=2'; s.onload = paint; document.head.appendChild(s); }
    b.onclick = function () { if (window.SFX) SFX.toggle(); paint(); };
    paint();
  }
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
          '<div class="rf-title"><div class="rf-word">INTUITY</div><button type="button" class="rf-pick rf-sub" aria-haspopup="dialog" aria-label="Change task: ' + NAME[hit.task] + '">' + label +
          ' <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>' +
          '<button type="button" class="rf-snd" aria-label="Sound"></button></div>';
        native.parentNode.insertBefore(hd, native); native.classList.add('rf-hide');
        wirePick(hd.querySelector('.rf-pick'), hit); wireSound(hd.querySelector('.rf-snd'));
        document.body.style.background = '#F3F1ED';   /* the page colour of the others (the landing page's ground) */
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

/* ESSAY ROUTES (17 Nov 2026): on the essay pages, the six types read as two routes and three extras */
(function () { try { if (!/essay|[?&](type|task)=essays|[?&]type=fa/i.test(location.pathname + location.search)) return;
  if (document.querySelector('script[src*="essay-routes.js"]')) return;
  var s = document.createElement('script'); s.src = '/tools/essay-routes.js?v=5'; s.defer = true; (document.head || document.documentElement).appendChild(s); } catch (e) {} })();
