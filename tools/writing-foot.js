/* WRITING · ONE FOOTER FOR A TASK'S PAGES (25 Nov 2026)
   The owner, after Speaking: a task tile opens its practice at once (the question page,
   then Plan, Model, Guided, Write it: the step track), and the task's clever pages are
   footer pills, the same four everywhere, as in Speaking:
     Practise · Basics · Exercises · Game
   The task comes from the page (data-writing, ?task=, ?type=, the challenge's topic or the
   folder); the pill of the page you are on is lit. No pill leads to another task.
   The step track (writing-chrome.js, .wr-foot) sits just above this footer. */
(function () {
  'use strict';
  var Q = {
    essays:  '/skills/writing/essays/essay-question.html',
    emails:  '/skills/writing/emails/email-question.html',
    articles:'/skills/writing/articles/article-question.html',
    reviews: '/skills/writing/reviews/review-question-selector.html',
    reports: '/skills/writing/reports/report-question-selector.html',
    story:   '/skills/writing/narrative/narrative-question.html'
  };
  /* 25 Nov 2026 (the owner): the ring opens Basics; Practise opens the track at its first step, the Model */
  var MODEL = { essays:'/skills/writing/essays/essay-model.html', emails:'/skills/writing/emails/email-model.html', articles:'/skills/writing/articles/article-model.html',
    reviews:'/skills/writing/reviews/reviews-cards.html', reports:'/skills/writing/reports/reports-cards.html', story:'/skills/writing/narrative/narrative-cards.html' };
  var TOPIC = { essays:'essay', emails:'email', articles:'article', reviews:'review', reports:'report', story:'story' };
  var NAME = { essays:'Essay', emails:'Email', articles:'Article', reviews:'Review', reports:'Report', story:'Story' };
  var PRINT = { fa:'essays', op:'essays', ad:'essays', ps:'essays', ce:'essays', st:'essays', ar:'articles', rv:'reviews', rp:'reports', sy:'story' };

  function taskOf() {
    var P = new URLSearchParams(location.search), path = location.pathname, b = document.body;
    var k = (b && b.getAttribute('data-writing')) || P.get('task') || P.get('type') || '';
    if (Q[k]) return k;
    if (k === 'narrative') return 'story';
    var t = (P.get('type') || '').split(',')[0];
    if (PRINT[t]) return PRINT[t];
    if (/^e[fi]-/.test(t)) return 'emails';
    var m = /^writing-(\w+)/.exec(P.get('topic') || '');
    if (m) for (var x in TOPIC) if (TOPIC[x] === m[1]) return x;
    m = /\/skills\/writing\/(essays|emails|articles|reviews|reports|narrative)\//.exec(path);
    if (m) return m[1] === 'narrative' ? 'story' : m[1];
    return '';
  }
  function hereOf() {
    var path = location.pathname, st = (document.body.getAttribute('data-stage') || '').toLowerCase();
    if (/\/challenge\/challenge\.html$/.test(path)) return 'game';
    if (/\/writing\/(practice|recall)\.html$/.test(path)) return 'exercises';
    if (/\/writing\/(five|build|cue-cards-print|sheet)\.html$/.test(path) || st === 'five' || st === 'generate') return 'basics';
    return 'practise';
  }

  function draw() {
    var k = taskOf(); if (!k || document.querySelector('.wf-foot')) return !!k;
    var P = new URLSearchParams(location.search);
    if (/\/challenge\/challenge\.html$/.test(location.pathname) && P.get('section') !== 'writing') return true;
    var here = hereOf();
    var pills = [
      ['practise', 'Practise', MODEL[k]],   /* 25 Nov 2026 (the owner): the Model is the entry; the rest are options */
      ['basics', 'Basics', '/skills/writing/five.html?task=' + k],
      ['exercises', 'Exercises', '/skills/writing/practice.html?task=' + k],
      ['game', 'Game', '/skills/challenge/challenge.html?board=1&section=writing&topic=writing-' + TOPIC[k]]
    ];
    var css = document.createElement('style');
    css.textContent =
      '.wf-foot{position:fixed;left:0;right:0;bottom:0;z-index:41;display:flex;justify-content:center;background:#F3F1ED;border-top:1px solid rgba(20,17,14,.1);padding:.55rem 12px calc(.55rem + env(safe-area-inset-bottom,0px))}' +
      '.wf-st{display:flex;gap:2px;padding:3px;border-radius:999px;background:rgba(20,17,14,.07)}' +
      '.wf-s{font:700 .6875rem/1 Geist,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#8A8378;text-decoration:none;padding:.6rem .85rem;border-radius:999px;white-space:nowrap;-webkit-tap-highlight-color:transparent}' +
      '.wf-s.on{background:#FAF8F5;color:#14110E;box-shadow:0 1px 2px rgba(20,17,14,.12)}' +
      '.wf-s:focus-visible{outline:2px solid #C2956E;outline-offset:2px}' +
      '@media(max-width:380px){.wf-s{padding:.6rem .6rem;letter-spacing:.05em}}' +
      /* the step track (and any page's own bottom bar) stands just above the footer */
      '.wr-foot{bottom:var(--wf-h,58px)!important}' +
      'body.has-wf-foot{padding-bottom:calc(var(--wf-h,58px) + 76px)!important}' +
      '@media print{.wf-foot{display:none!important}}';
    document.head.appendChild(css);
    var f = document.createElement('nav'); f.className = 'wf-foot'; f.setAttribute('aria-label', NAME[k] + ': practise and help');
    f.innerHTML = '<div class="wf-st">' + pills.map(function (p) {
      return '<a class="wf-s be2-nohit' + (p[0] === here ? ' on" aria-current="page' : '') + '" href="' + p[2] + '" target="_top">' + p[1] + '</a>';
    }).join('') + '</div>';
    document.body.appendChild(f); document.body.classList.add('has-wf-foot');
    var fit = function () { document.documentElement.style.setProperty('--wf-h', f.offsetHeight + 'px'); };
    fit(); window.addEventListener('resize', fit);
    try { window.dispatchEvent(new Event('wf-foot')); } catch (e) {}   /* writing-chrome.js re-measures the room it keeps */
    /* Write it is the track's last step: its back goes to the question, never to the old gate */
    if (/\/writing\/write\.html$/.test(location.pathname)) {
      var bl = document.getElementById('back') || document.querySelector('.back-link');
      if (bl) { bl.href = MODEL[k]; bl.textContent = '← ' + NAME[k]; }
    }
    return true;
  }
  function go() { var n = 0; (function t() { if (!draw() && ++n < 30) setTimeout(t, 100); })(); }
  if (document.readyState !== 'loading') go(); else document.addEventListener('DOMContentLoaded', go);
})();
