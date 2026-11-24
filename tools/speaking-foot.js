/* ═══════════════════════════════════════════════════════════════════════
   SPEAKING · THE PART'S FOOTER (24 Nov 2026)
   The owner: when I open Structures, the footer with the four options should
   stay as it is, so I can go back. One footer for the four pages of a Part,
   Writing's pill row, the page you are on lit:
     Practise    skills/speaking/test.html?part=N
     Structures  skills/speaking/five.html?part=N
     Drills      Maya's drill for the Part (mirror.html for Part 1)
     Games       skills/speaking/useful-expressions.html?part=N&view=play
   The Part comes from ?part=N (mirror.html is Part 1). Without a Part the page
   is not inside a Part, and no footer is drawn.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var P = new URLSearchParams(location.search), path = location.pathname;
  var part = /\/mirror\.html$/.test(path) ? 1 : Math.max(0, Math.min(4, +(P.get('part') || 0) || 0));
  if (!part) return;
  var here = /\/test\.html$/.test(path) ? 'practise' : /\/five\.html$/.test(path) ? 'structures'
    : /\/(drills|mirror)\.html$/.test(path) ? 'drills' : /\/useful-expressions\.html$/.test(path) ? 'games' : '';
  if (!here) return;
  var DRILL = {1:'/skills/speaking/mirror.html?back=' + encodeURIComponent('?part=1'), 2:'/skills/speaking/drills.html?part=2&area=longturn2',
               3:'/skills/speaking/drills.html?part=3&area=discussion3', 4:'/skills/speaking/drills.html?part=4&area=opinion4'}[part];
  var ITEMS = [['practise','Practise','/skills/speaking/test.html?part=' + part],
               ['structures','Structures','/skills/speaking/five.html?part=' + part],
               ['drills','Drills',DRILL],
               ['games','Games','/skills/speaking/useful-expressions.html?part=' + part + '&view=play']];
  var css = document.createElement('style');
  css.textContent =
    '.sp-foot{position:fixed;left:0;right:0;bottom:0;z-index:210;display:flex;justify-content:center;background:var(--screen,#F3F1ED);border-top:1px solid rgba(20,17,14,.12);padding:.6rem 1rem calc(.6rem + env(safe-area-inset-bottom))}' +
    '.sp-foot .sp-st{display:flex;gap:.1rem;background:rgba(20,17,14,.06);border-radius:999px;padding:.2rem}' +
    '.sp-foot .sp-s{font:700 .6875rem/1 Geist,system-ui,sans-serif;letter-spacing:.07em;text-transform:uppercase;padding:.55rem .8rem;border-radius:999px;color:rgba(20,17,14,.5);text-decoration:none}' +
    '.sp-foot .sp-s.on{background:#FAF8F5;color:#14110E;box-shadow:0 1px 2px rgba(20,17,14,.10)}' +
    '.sp-foot .sp-s:focus-visible{outline:2px solid #C2956E;outline-offset:2px}' +
    '@media(max-width:380px){.sp-foot .sp-s{padding:.5rem .55rem;letter-spacing:.04em}}' +
    'body.has-sp-foot{padding-bottom:calc(3.6rem + env(safe-area-inset-bottom))}';
  document.head.appendChild(css);
  function draw(){
    if (document.querySelector('.sp-foot')) return;
    var nav = document.createElement('nav');
    nav.className = 'sp-foot'; nav.setAttribute('aria-label', 'Part ' + part);
    nav.innerHTML = '<div class="sp-st" role="group">' + ITEMS.map(function(it){
      return it[0] === here ? '<span class="sp-s on" aria-current="page">' + it[1] + '</span>'
                            : '<a class="sp-s" href="' + it[2] + '">' + it[1] + '</a>';
    }).join('') + '</div>';
    document.body.appendChild(nav); document.body.classList.add('has-sp-foot');
  }
  if (document.body) draw(); else document.addEventListener('DOMContentLoaded', draw);
})();
