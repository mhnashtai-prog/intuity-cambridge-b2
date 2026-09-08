/* ═══════════════════════════════════════════════════════════════════════
   WRITING — THE SHARED HEADER AND FOOTER
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var B = document.body;
var GENRE = B.getAttribute('data-writing') || '';
var STAGE = (B.getAttribute('data-stage') || '').toLowerCase();

var GENRES = {
  essays:   { label:'Essay',   part:'Part 1', back:'/skills/writing/writing-door.html',
              stages:{ question:'/skills/writing/essays/essay-question.html',
                       plan:    '/skills/writing/essays/essay-plan.html',
                       model:   '/skills/writing/essays/essay-model.html',
                       sample:  '/skills/writing/essays/essay-sample.html' } },
  reviews:  { label:'Review',  part:'Part 2', back:'/skills/writing/writing-door.html',
              stages:{ question:'/skills/writing/reviews/review-question-selector.html',
                       plan:    '/skills/writing/reviews/review-plan.html',
                       model:   '/skills/writing/reviews/reviews-cards',
                       sample:  '/skills/writing/reviews/review-sample.html' } },
  reports:  { label:'Report',  part:'Part 2', back:'/skills/writing/writing-door.html',
              stages:{ question:'/skills/writing/reports/report-question-selector.html',
                       plan:    '/skills/writing/reports/report-plan.html',
                       model:   '/skills/writing/reports/report-model.html',
                       sample:  '/skills/writing/reports/report-sample.html' } },
emails:   { label:'Email',   part:'Part 2', back:'/skills/writing/writing-door.html',
            stages:{ question:'/skills/writing/emails/email-question.html',
                     plan:    '/skills/writing/emails/email-plan.html',
                     model:   '/skills/writing/emails/emails-cards.html',
                     sample:  '/skills/writing/emails/email-sample.html' } },
  articles: { label:'Article', part:'Part 2', back:'/skills/writing/writing-door.html',
              stages:{ question:'/skills/writing/articles/article-question.html',
                       model:   '/skills/writing/articles/article-model.html',
                       sample:  '/skills/writing/articles/article-sample.html' } },
  story:    { label:'Story',   part:'Part 2', back:'/skills/writing/writing-door.html',
              stages:{ question:'/skills/writing/narrative/narrative-question.html',
                       sample:  '/skills/writing/narrative/narrative-sample.html' } }
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

function header() {
  var h = el('header', 'header');
  var top = el('div', 'header-top');
  var back = el('a', 'back-link', '\u2190 Writing');
  back.href = G.back; back.target = '_top';
  var title = el('div', 'header-title');
  title.appendChild(el('div', 'app-title', 'INTUITY'));
  title.appendChild(el('div', 'app-subtitle', G.label + ' \u00b7 ' + (G.part || '')));
  var spacer = el('span', 'header-spacer');
  var mute = el('button', 'mute'); mute.type = 'button';
  mute.setAttribute('aria-label', 'Sound');
  spacer.appendChild(mute);
  spacer.appendChild(document.createTextNode('Level '));
  var b = el('b', null, 'B2'); spacer.appendChild(b);
  top.appendChild(back); top.appendChild(title); top.appendChild(spacer);
  h.appendChild(top);

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

  var filts = shell.querySelectorAll(
    '.filter-bar, .topic-tabs, .register-bar, .nav-tabs, .mode-toggle'
  );
  for (var fi = 0; fi < filts.length; fi++) {
    filts[fi].classList.add('wr-filters');
    h.appendChild(filts[fi]);
  }

  return h;
}

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

var shell = document.querySelector('.shell, .container') || B;

function firstIn(root, sels) {
  for (var i = 0; i < sels.length; i++) {
    var n = root.querySelector(sels[i]);
    if (n) return n;
  }
  return null;
}

var oldTop = firstIn(shell, ['.topbar', ':scope > .header', '.header-row']);
if (oldTop && oldTop.classList.contains('header-row') && oldTop.parentNode) {
  oldTop = oldTop.parentNode;
}
var newTop = header();
if (oldTop && oldTop.parentNode) oldTop.parentNode.replaceChild(newTop, oldTop);
else shell.insertBefore(newTop, shell.firstChild);

var oldFoot = firstIn(shell, ['.foot', '.bottom-nav', '.control-bar']);
var newFoot = foot();
if (oldFoot && oldFoot.parentNode) oldFoot.parentNode.replaceChild(newFoot, oldFoot);
else shell.appendChild(newFoot);

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
