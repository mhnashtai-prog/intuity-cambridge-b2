/* ═══════════════════════════════════════════════════════════════════════
   WRITING — THE SHARED HEADER AND FOOTER

   Forty pages, one script. It does not rewrite them: it replaces the two
   pieces of furniture they all already have, in place, leaving everything
   between untouched.

   Every writing page is built the same way, which is what makes this
   possible:

     .shell
       .topbar        back-link · INTUITY · spacer     ← replaced
       .filter-bar    or .topic-tabs / .register-bar   ← restyled, kept
       .stage         the content                      ← never touched
       .foot          Question / Plan / Model / Sample ← replaced

   TWO LINES PER PAGE:
     <body data-writing="essays" data-stage="question">
     <script src="/data/writing/writing-chrome.js?v=1"></script>

   WHY THE STAGE ROW STAYS AT THE BOTTOM
   Use of English and Reading put their view toggle at the top of the card.
   These pages put the four stages within thumb reach instead, and on a
   phone that is simply better — the stage row is the most-pressed control
   in the section and the top of a 390px screen is the hardest place to
   reach. So this script keeps the position and only changes the shape.
   If anything, the idea should travel the other way.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var B = document.body;
var GENRE = B.getAttribute('data-writing') || '';
var STAGE = (B.getAttribute('data-stage') || '').toLowerCase();

/* The four stages, and where each genre keeps them. A genre is a config
   object — the same move that turned four Use of English monoliths into
   one engine. Adding a genre is adding an entry, not editing this file. */
var GENRES = {
  essays:   { label:'Essay',   back:'/index.html?openModal=writing',
              stages:{ question:'/skills/writing/essays/essay-question.html',
                       plan:    '/skills/writing/essays/essay-plan.html',
                       model:   '/skills/writing/essays/essay-model.html',
                       sample:  '/skills/writing/essays/essay-sample.html' } },
  reviews:  { label:'Review',  back:'/index.html?openModal=writing',
              stages:{ question:'/skills/writing/reviews/review-question-selector.html',
                       plan:    '/skills/writing/reviews/review-structure.html',
                       model:   '/skills/writing/reviews/review-builder.html',
                       sample:  '/skills/writing/reviews/review-sample.html' } },
  reports:  { label:'Report',  back:'/index.html?openModal=writing',
              stages:{ question:'/skills/writing/reports/report-question-selector.html',
                       plan:    '/skills/writing/reports/report-structure-practice.html',
                       model:   '/skills/writing/reports/report-sentence-builder.html',
                       sample:  '/skills/writing/reports/report-sample.html' } },
  emails:   { label:'Email',   back:'/index.html?openModal=writing',
              stages:{ question:'/skills/writing/emails/email-question.html',
                       plan:    '/skills/writing/emails/email-plan.html',
                       model:   '/skills/writing/emails/email-model.html',
                       sample:  '/skills/writing/emails/email-sample.html' } },
  articles: { label:'Article', back:'/index.html?openModal=writing',
              stages:{ question:'/skills/writing/articles/article-question.html' } },
  story:    { label:'Story',   back:'/index.html?openModal=writing',
              stages:{ question:'/skills/writing/narrative/narrative-question.html' } }
};
var G = GENRES[GENRE];
if (!G) return;

var ORDER = ['question','plan','model','sample'];
var NAMES = { question:'Question', plan:'Plan', model:'Model', sample:'Sample' };

function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

/* ── THE HEADER ─────────────────────────────────────────────────────────
   The shell's own: back-link, INTUITY with a subtitle, level badge and
   mute. Built rather than pasted into forty files, so a change to it is a
   change to one line here.

   The old .topbar is REPLACED, not hidden — it holds only a back-link, a
   brand and a spacer, all of which the new header carries. Hiding it would
   leave its height behind. */
function header() {
  var h = el('header', 'header');

  var top = el('div', 'header-top');
  var back = el('a', 'back-link', '\u2190 Writing');
  back.href = G.back; back.target = '_top';
  var title = el('div', 'header-title');
  title.appendChild(el('div', 'app-title', 'INTUITY'));
  title.appendChild(el('div', 'app-subtitle', G.label + ' \u00b7 ' + (NAMES[STAGE] || '')));
  var spacer = el('span', 'header-spacer');
  var mute = el('button', 'mute'); mute.type = 'button';
  mute.setAttribute('aria-label', 'Sound');
  spacer.appendChild(mute);
  spacer.appendChild(document.createTextNode('Level '));
  var b = el('b', null, 'B2'); spacer.appendChild(b);
  top.appendChild(back); top.appendChild(title); top.appendChild(spacer);
  h.appendChild(top);

  /* The genre row. Navigation, not a view toggle — each genre is its own
     set of pages — so links, exactly as Reading's Part 5/6/7 row is. */
  var nav = el('nav', 'mode-selector');
  nav.setAttribute('aria-label', 'Writing task');
  Object.keys(GENRES).forEach(function (k) {
    if (k === GENRE) {
      var cur = el('span', 'mode-btn active', GENRES[k].label);
      cur.setAttribute('aria-current', 'page');
      nav.appendChild(cur);
    } else {
      var a = el('a', 'mode-btn', GENRES[k].label);
      a.href = GENRES[k].stages.question;
      nav.appendChild(a);
    }
  });
  h.appendChild(nav);

  /* The page's own filter row — topics, registers, categories — moves
     inside the header where every other section keeps that choice. It is
     MOVED rather than rebuilt: the page's script owns its contents and
     must keep finding it. */
  var filt = document.querySelector('.filter-bar, .topic-tabs, .register-bar');
  if (filt) { filt.classList.add('wr-filters'); h.appendChild(filt); }

  return h;
}

/* ── THE STAGE ROW ──────────────────────────────────────────────────────
   Rebuilt as links rather than onclick handlers, so a long-press opens in
   a new tab and the browser shows where each one goes. A stage with no
   page for this genre is rendered disabled rather than omitted: the four
   stages are a promise the menu already makes, and a row that changes
   length between genres would break it. */
function foot() {
  var f = el('div', 'wr-foot');
  var pill = el('div', 'wr-stages');
  pill.setAttribute('role', 'group');
  pill.setAttribute('aria-label', 'Stage');
  ORDER.forEach(function (k) {
    var url = G.stages[k];
    if (k === STAGE || !url) {
      var s = el('span', 'wr-stage' + (k === STAGE ? ' active' : ' off'), NAMES[k]);
      if (k === STAGE) s.setAttribute('aria-current', 'page');
      pill.appendChild(s);
    } else {
      var a = el('a', 'wr-stage', NAMES[k]);
      a.href = url;
      pill.appendChild(a);
    }
  });
  f.appendChild(pill);
  return f;
}

/* ── SWAP ───────────────────────────────────────────────────────────── */
var shell = document.querySelector('.shell') || B;
var oldTop = document.querySelector('.topbar');
var newTop = header();
if (oldTop && oldTop.parentNode) oldTop.parentNode.replaceChild(newTop, oldTop);
else shell.insertBefore(newTop, shell.firstChild);

var oldFoot = document.querySelector('.foot');
var newFoot = foot();
if (oldFoot && oldFoot.parentNode) oldFoot.parentNode.replaceChild(newFoot, oldFoot);
else shell.appendChild(newFoot);

/* The pages' own navTo() is now unused, but leaving it defined costs
   nothing and removing it would mean editing forty files. */

(function () {
  var mb = newTop.querySelector('.mute'); if (!mb) return;
  function paint() {
    var on = !window.SFX || SFX.isOn();
    mb.textContent = on ? '\uD83D\uDD0A' : '\uD83D\uDD07';
    mb.classList.toggle('off', !on);
  }
  mb.onclick = function () { if (window.SFX) SFX.toggle(); paint(); };
  paint();
})();

/* The header is fixed and wraps to different heights, so the content below
   is measured against it rather than guessing. */
function sync() {
  document.documentElement.style.setProperty('--header-h', newTop.offsetHeight + 'px');
  document.documentElement.style.setProperty('--foot-h', newFoot.offsetHeight + 'px');
}
sync();
addEventListener('resize', sync);
addEventListener('orientationchange', function () { setTimeout(sync, 120); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
if (window.ResizeObserver) {
  new ResizeObserver(sync).observe(newTop);
  new ResizeObserver(sync).observe(newFoot);
}
})();
