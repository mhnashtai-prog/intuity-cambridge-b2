/* ═══════════════════════════════════════════════════════════════════════
   WRITING — THE SHARED HEADER AND FOOTER
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var B = document.body;
var GENRE = B.getAttribute('data-writing') || '';
var STAGE = (B.getAttribute('data-stage') || '').toLowerCase();

var GENRES = {
  essays:   { label:'Essay',   part:'Part 1', back:'/index.html?openModal=writing',
              /* the type row on every stage, in the Model's order */
              /* the "your turn" route (7 Nov 2026): one line to try on paper,
                 then the sample as feedback, then four checks, one per criterion */
              turn:'Write your introduction on paper, using one line from this card.',
              checks:[['Content','I covered both notes and added an idea of my own.'],
                      ['Communicative Achievement','It sounds right for a teacher: formal, no contractions, my opinion clear.'],
                      ['Organisation','An introduction, two or three body paragraphs and a conclusion, each with one job.'],
                      ['Language','I used two or more phrases from the cards, changed to fit my question.']],
              types:[['for-against','For & Against'],['opinion','Opinion'],['agree-disagree','Agree & Disagree'],
                     ['problem-solution','Problems & Solutions'],['cause-effect','Cause & Effect'],['speculation-trends','Speculation & Trends']],
              stages:{ question:'/skills/writing/essays/essay-question.html',
                       plan:    '/skills/writing/essays/essay-plan.html',
                       model:   '/skills/writing/essays/essay-model.html',
                       generate:'/skills/writing/build.html?type=essays',
                       sample:  '/skills/writing/essays/essay-sample.html' } },
      reviews:  { label:'Review',  part:'Part 2', back:'/index.html?openModal=writing',
              turn:'Write your opening on paper, using one line from this card.',
              checks:[['Content','I described it, covered every point in the question and said who it is for.'],
                      ['Communicative Achievement','It sounds like a review: lively, it talks to the reader, my opinion is clear.'],
                      ['Organisation','A title, an opening, a paragraph for each feature, a recommendation to finish.'],
                      ['Language','I used two or more phrases from the cards, changed to fit my question.']],
              stages:{ question:'/skills/writing/reviews/review-question-selector.html',
                       plan:    '/skills/writing/reviews/review-plan.html',
                       model:   '/skills/writing/reviews/reviews-cards.html',
                       generate:'/skills/writing/build.html?type=reviews',
                       sample:  '/skills/writing/reviews/review-sample.html' } },
    reports:  { label:'Report',  part:'Part 2', back:'/index.html?openModal=writing',
              turn:'Write your introduction on paper (the aim), using one line from this card.',
              checks:[['Content','I covered every point the question asks for and made a recommendation.'],
                      ['Communicative Achievement','It sounds like a report: formal and factual, no chatty language.'],
                      ['Organisation','A title and clear headings: introduction, findings, recommendation.'],
                      ['Language','I used two or more phrases from the cards, changed to fit my question.']],
              stages:{ question:'/skills/writing/reports/report-question-selector.html',
                       plan:    '/skills/writing/reports/report-plan.html',
                       model:   '/skills/writing/reports/reports-cards.html',
                       generate:'/skills/writing/build.html?type=reports',
                       sample:  '/skills/writing/reports/report-sample.html' } },
emails:   { label:'Email',   part:'Part 2', back:'/index.html?openModal=writing',
            turn:'Write your greeting and first line on paper, using one line from this card.',
            checks:[['Content','I answered every question in the message and gave all the information asked for.'],
                    ['Communicative Achievement','The tone fits the reader: formal for an organisation, friendly for a friend.'],
                    ['Organisation','A greeting, an opening, a paragraph for each point and a suitable ending.'],
                    ['Language','I used two or more phrases from the cards, changed to fit my question.']],
            stages:{ question:'/skills/writing/emails/email-question.html',
                     plan:    '/skills/writing/emails/email-plan.html',
                     model:   '/skills/writing/emails/email-model.html',
                       generate:'/skills/writing/build.html?type=emails',
                     sample:  '/skills/writing/emails/email-sample.html' } },
  articles: { label:'Article', part:'Part 2', back:'/index.html?openModal=writing',
              turn:'Write your title and opening (the hook) on paper, using one line from this card.',
              checks:[['Content','I answered every question in the task and gave examples of my own.'],
                      ['Communicative Achievement','It talks to the reader: a catchy title, a question or two, my own voice.'],
                      ['Organisation','A title, an opening that hooks, a paragraph for each point, a closing thought.'],
                      ['Language','I used two or more phrases from the cards, changed to fit my question.']],
              stages:{ question:'/skills/writing/articles/article-question.html',
                       model:   '/skills/writing/articles/article-model.html',
                       generate:'/skills/writing/build.html?type=articles',
                       sample:  '/skills/writing/articles/article-sample.html' } },
  story:    { label:'Story',   part:'Part 2', back:'/index.html?openModal=writing',
              turn:'Write your first two sentences on paper, using one line from this card.',
              checks:[['Content','I used the sentence or words the task gives, and the story makes sense.'],
                      ['Communicative Achievement','It keeps the reader hooked: feelings, a little suspense, a real ending.'],
                      ['Organisation','A beginning, a middle where something happens and an ending, linked by time words.'],
                      ['Language','Past tenses used well, plus two or more phrases from the cards.']],
              stages:{ question:'/skills/writing/narrative/narrative-question.html',
                       model:   '/skills/writing/narrative/narrative-cards.html',
                       generate:'/skills/writing/build.html?type=story',
                       sample:  '/skills/writing/narrative/narrative-sample.html' } }
};

var G = GENRES[GENRE];
if (!G) return;

/* THE LEAN HEADER (7 Nov 2026), Essay first as the blueprint. A study
   screen, not a newspaper: one line for where you are (back · task and
   type in one picker), the chosen question in one grey line, and the four
   stages at the bottom as numbered steps with a Next button. The brand,
   the level chip and the two tab rows go: they repeated what the card
   already says and put twelve ways out above the language. If it works,
   the other tasks join by adding their key here. */
var LEAN = /^(essays|reviews|reports|emails|articles|story)$/.test(GENRE);   /* 7 Nov 2026: every task, after the Essay blueprint */

/* Oct 2026: the task journey and the Model Generator are two separate
   things. The portfolio slide is the only place that leads to both, so the
   stage bar no longer offers Generate. (stages.generate stays: the
   generator's own task tabs use it.) */
var ORDER = ['question','plan','model','sample'];
var NAMES = { question:'Question', plan:'Plan', model:'Model', generate:'Generate', sample:'Sample' };

function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function header() {
  if (LEAN) return leanHeader();
  var h = el('header', 'header');
  var top = el('div', 'header-top');
  var back = el('a', 'back-link', '\u2190 Writing');
  back.href = G.back; back.target = '_top';
  /* Came here from a portfolio slide of this task? Go back to that slide. */
  try {
    var ret = JSON.parse(sessionStorage.getItem('intuity.sheetReturn') || 'null');
    if (ret && ret.task === GENRE && /^\/skills\/writing\/(sheet|gate)\.html/.test(ret.url)) {
      back.href = ret.url; back.textContent = '\u2190 ' + (ret.label || 'Structure');
    }
  } catch (e) {}
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
    /* inside the generator, only tasks the generator has (no Story) */
    if (STAGE === 'generate' && !GENRES[k].stages.generate) return;
    if (k === GENRE) {
      var cur = el('span', 'mode-btn active', GENRES[k].label);
      cur.setAttribute('aria-current', 'page');
      nav.appendChild(cur);
    } else {
      var a = el('a', 'mode-btn', GENRES[k].label);
      /* inside the generator, the task tabs stay in the generator */
      a.href = (STAGE === 'generate' && GENRES[k].stages.generate) ||
        /* 7 Nov 2026: inside "Your … in five", the task tabs stay in the five (same mode) */
        (STAGE === 'five' && '/skills/writing/five.html?task=' + k + (/[?&]mode=mine\b/.test(location.search) || (document.querySelector('.wr-stage.active[data-m="mine"]')) ? '&mode=mine' : '')) ||
        GENRES[k].stages.question;
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

function backLink() {
  var back = el('a', 'back-link', '\u2190 Writing');
  back.href = G.back; back.target = '_top';
  try {
    var ret = JSON.parse(sessionStorage.getItem('intuity.sheetReturn') || 'null');
    if (ret && ret.task === GENRE && /^\/skills\/writing\/(sheet|gate)\.html/.test(ret.url)) {
      back.href = ret.url; back.textContent = '\u2190 ' + (ret.label || 'Structure');
    }
  } catch (e) {}
  return back;
}
/* the question the student chose on the Question page, if there is one */
function chosenId() {
  try { var q = JSON.parse(sessionStorage.getItem('currentQuestion') || 'null'); return q && (q.questionId || q.id) || ''; } catch (e) { return ''; }
}
var DONE_KEY = 'intuity.wr.done.' + GENRE;
function doneList() { try { return JSON.parse(localStorage.getItem(DONE_KEY) || '[]'); } catch (e) { return []; } }
function markDone(id) { if (!id) return; var d = doneList(); if (d.indexOf(id) < 0) d.push(id); try { localStorage.setItem(DONE_KEY, JSON.stringify(d)); } catch (e) {} }
function chosenQuestion() {
  try {
    var q = JSON.parse(sessionStorage.getItem('currentQuestion') || 'null');
    var t = q && (q.mainQuestion || q.question || q.text);
    if (t) return String(t);
  } catch (e) {}
  try { var s2 = sessionStorage.getItem('current' + G.label + 'Question'); if (s2) return s2; } catch (e) {}
  return '';
}
function leanHeader() {
  var css = document.createElement('style');
  css.textContent =
    '.wr-lean{padding:calc(10px + env(safe-area-inset-top,0px)) var(--gutter,1rem) 10px!important}' +
    '.wr-lean .header-top{display:grid!important;grid-template-columns:1fr auto 1fr!important;align-items:center;gap:10px;padding:0!important;margin:0!important}' +
    '.wr-lean .header-title{order:0!important;grid-column:auto!important;display:flex;flex-direction:column;align-items:center;text-align:center}' +
    '.wr-lean .wr-right{justify-self:end}' +
    '.wr-lean .back-link{flex:none}' +
    '.wr-lean .wr-right{display:flex;align-items:center;gap:4px;min-width:0}' +
    '.wr-pick{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin-top:2px;padding:3px 6px 3px 8px;border-radius:8px;font:600 .6875rem/1.2 var(--f-display,"Geist",system-ui,sans-serif);letter-spacing:.2em;text-transform:uppercase;color:#4A443E}' +
    '.wr-pick span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.wr-pick::after{content:"";flex:none;width:5px;height:5px;margin:-3px 2px 0 0;border-right:1.5px solid #8A8378;border-bottom:1.5px solid #8A8378;transform:rotate(45deg)}' +
    '.wr-pick:active{background:rgba(20,17,14,.06)}.wr-pick:focus-visible{outline:2px solid #B0865C;outline-offset:2px}' +
    '.wr-lean .mute{padding:8px!important}' +
    '.wr-tabs{position:relative;display:flex;align-items:center;margin-top:8px;height:40px}' +
    /* start-aligned: a centred row wider than the screen hides its first tabs */
    '.wr-tabs .wr-filters{flex:1;min-width:0;margin:0!important;justify-content:flex-start!important}' +
    '.wr-arr{all:unset;flex:none;width:28px;height:32px;display:grid;place-items:center;cursor:pointer;color:#6B655C;font:500 1.2rem/1 var(--f-body,"Geist",system-ui,sans-serif);transition:opacity .2s}' +
    '.wr-arr[hidden]{display:grid!important;opacity:0;pointer-events:none}' +
    '.wr-arr:focus-visible{outline:2px solid #B0865C;outline-offset:-2px;border-radius:6px}' +
    '.wr-q{all:unset;display:block;box-sizing:border-box;width:100%;margin-top:6px;cursor:pointer;font:400 .8125rem/1.4 var(--f-body,"Geist",system-ui,sans-serif);color:#6B655C;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.wr-q b{font-weight:500;color:#9A5A2C;font-family:"Geist Mono",ui-monospace,monospace;font-size:.6875rem;letter-spacing:.12em;margin-right:6px}' +
    '.wr-q.open{white-space:normal}' +
    '.wr-q.hint{color:#8A8378}' +
    '.wr-done{font-style:normal;font-weight:500;color:#3F6B4E;margin-right:6px}' +
    'a.wr-q{text-decoration:none}' +
    '.wr-typerow a.ttab{text-decoration:none}' +
    'body[data-stage="plan"] .kq{display:none!important}' +
    'body[data-stage="plan"] .card-scroll{padding-top:2.4rem!important}' +
    '.wr-sheet-bg{position:fixed;inset:0;z-index:90;background:rgba(20,17,14,.35)}' +
    '.wr-sheet{position:fixed;left:0;right:0;bottom:0;z-index:91;max-height:80vh;overflow:auto;background:#FAF8F5;border-radius:16px 16px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 30px rgba(20,17,14,.18)}' +
    '.wr-sheet h3{margin:4px 0 8px;font:500 .6875rem/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:#8A8378}' +
    '.wr-sheet h3+div{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}' +
    '.wr-opt{all:unset;cursor:pointer;padding:10px 14px;border-radius:999px;background:rgba(20,17,14,.06);font:500 .9rem/1 var(--f-body,"Geist",system-ui,sans-serif);color:#14110E}' +
    '.wr-opt.on{background:#14110E;color:#FAF8F5}' +
    '.wr-opt:focus-visible{outline:2px solid #B0865C;outline-offset:2px}';
  document.head.appendChild(css);

  /* 7 Nov, after the first look: the INTUITY wordmark stays (without it the
     page left the app); its subtitle, "ESSAY · PART 1 ▾", is the task picker.
     The type row stays visible: one tap, no sheet. */
  var h = el('header', 'header wr-lean');
  var top = el('div', 'header-top');
  top.appendChild(backLink());
  var title = el('div', 'header-title');
  title.appendChild(el('div', 'app-title', 'INTUITY'));
  var pick = el('button', 'wr-pick'); pick.type = 'button';
  pick.setAttribute('aria-haspopup', 'dialog');
  var lab = el('span', null, G.label + ' \u00b7 ' + (G.part || '')); pick.appendChild(lab);
  pick.setAttribute('aria-label', 'Change task: ' + G.label);
  title.appendChild(pick);
  top.appendChild(title);
  var right = el('div', 'wr-right');
  var mute = el('button', 'mute'); mute.type = 'button'; mute.setAttribute('aria-label', 'Sound');
  right.appendChild(mute);
  top.appendChild(right);
  h.appendChild(top);

  /* the page's type row, with an arrow at each end that shows (and reaches)
     the types beyond the edge; an arrow fades when its end is in view */
  /* ONE HEADER FOR ALL FOUR STAGES (7 Nov 2026): the same three rows, the
     same height, on Question, Plan, Model and Sample. A page with no type
     row of its own (Plan, Sample) gets one: the chosen question's type is
     lit, and another type goes back to Question, filtered to it. */
  var filts = Array.prototype.slice.call(shell.querySelectorAll('.filter-bar, .topic-tabs, .register-bar, .nav-tabs, .mode-toggle'));
  if (!filts.length && G.types) {
    var cq = null; try { cq = JSON.parse(sessionStorage.getItem('currentQuestion') || 'null'); } catch (e) {}
    var ct = cq && String(cq.essayType || cq.type || '').toLowerCase();
    var tr = el('div', 'topic-tabs wr-typerow');
    G.types.forEach(function (t) {
      var a = el(t[0] === ct ? 'span' : 'a', 'ttab' + (t[0] === ct ? ' active' : ''), t[1]);
      if (t[0] === ct) a.setAttribute('aria-current', 'true');
      else a.href = G.stages.question + '?type=' + t[0];
      tr.appendChild(a);
    });
    filts = [tr];
  }
  for (var fi = 0; fi < filts.length; fi++) {
    var row = filts[fi]; row.classList.add('wr-filters');
    var wrap = el('div', 'wr-tabs');
    var la = el('button', 'wr-arr', '\u2039'), ra = el('button', 'wr-arr', '\u203A');
    la.type = ra.type = 'button'; la.setAttribute('aria-label', 'Earlier types'); ra.setAttribute('aria-label', 'More types');
    wrap.appendChild(la); wrap.appendChild(row); wrap.appendChild(ra); h.appendChild(wrap);
    (function (row, la, ra) {
      var step = function (d) { row.scrollBy({ left: d * Math.max(120, row.clientWidth * 0.7), behavior: 'smooth' }); };
      la.onclick = function () { step(-1); }; ra.onclick = function () { step(1); };
      var ends = function () {
        var over = row.scrollWidth > row.clientWidth + 2;
        la.hidden = !over || row.scrollLeft <= 2;
        ra.hidden = !over || row.scrollLeft + row.clientWidth >= row.scrollWidth - 2;
      };
      row.addEventListener('scroll', ends, { passive: true });
      addEventListener('resize', ends);
      if (window.MutationObserver) new MutationObserver(function () { setTimeout(ends, 60); }).observe(row, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
      setTimeout(ends, 120);
    })(row, la, ra);
  }

  /* the question line, always there so the header never changes height:
     the chosen question on Plan, Model and Sample (the Plan card no longer
     repeats it); on Question, what to do; before any choice, a way back */
  var q = chosenQuestion();
  var ql = el(STAGE === 'question' || q ? 'button' : 'a', 'wr-q');
  ql.appendChild(el('b', null, 'Q'));
  if (STAGE === 'question') {
    ql.type = 'button'; ql.classList.add('hint');
    var nd = doneList().length;
    ql.appendChild(document.createTextNode('Swipe to a question, then Plan it' + (nd ? ' \u00b7 ' + nd + ' done' : '')));
  } else if (q) {
    ql.type = 'button';
    if (doneList().indexOf(chosenId()) >= 0) { var dm = el('i', 'wr-done', '\u2713 Done'); ql.appendChild(dm); }
    ql.appendChild(document.createTextNode(q));
    ql.setAttribute('aria-label', 'Your question: ' + q);
    ql.onclick = function () { ql.classList.toggle('open'); sync(); };
  } else {
    ql.href = G.stages.question; ql.classList.add('hint');
    ql.appendChild(document.createTextNode('Choose a question \u203A'));
  }
  h.appendChild(ql);

  function close() {
    var a = document.querySelector('.wr-sheet'), b = document.querySelector('.wr-sheet-bg');
    if (a) a.remove(); if (b) b.remove(); pick.focus();
  }
  pick.onclick = function () {
    var bg = el('div', 'wr-sheet-bg'); bg.onclick = close;
    var sh = el('div', 'wr-sheet'); sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-label', 'Choose a task');
    sh.appendChild(el('h3', null, 'Task'));
    var tk = el('div');
    Object.keys(GENRES).forEach(function (k) {
      var o = el(k === GENRE ? 'button' : 'a', 'wr-opt' + (k === GENRE ? ' on' : ''), GENRES[k].label);
      if (k === GENRE) { o.type = 'button'; o.onclick = close; o.setAttribute('aria-current', 'page'); }
      else o.href = GENRES[k].stages[STAGE] || GENRES[k].stages.question;
      tk.appendChild(o);
    });
    sh.appendChild(tk);
    document.body.appendChild(bg); document.body.appendChild(sh);
    var first = sh.querySelector('.wr-opt.on') || sh.querySelector('.wr-opt'); if (first) first.focus();
  };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.querySelector('.wr-sheet')) close(); });
  return h;
}

/* the stages this student has opened for this task, this session */
function seenStages() {
  var k = 'intuity.wr.seen.' + GENRE, seen = [];
  try { seen = JSON.parse(sessionStorage.getItem(k) || '[]'); } catch (e) {}
  if (STAGE && seen.indexOf(STAGE) < 0) seen.push(STAGE);
  try { sessionStorage.setItem(k, JSON.stringify(seen)); } catch (e) {}
  return seen;
}
/* YOUR TURN (Model) → COMPARE (Sample) → CHECK YOURS. Research on model
   texts: learners notice most in a model after trying the task themselves,
   so the Model asks for one line on paper and the Sample is read as
   feedback; four checks, one per criterion, close the question. */
var CMP_KEY = 'intuity.wr.compare.' + GENRE;
function turnStrip() {
  if (STAGE === 'model' && G.turn && G.stages.sample) {
    var d = el('div', 'wr-turn'), t = el('span');
    t.appendChild(el('b', null, 'Your turn')); t.appendChild(document.createTextNode(G.turn));
    var a = el('a', 'be2-nohit', 'Compare \u203A'); a.href = G.stages.sample;
    a.onclick = function () { try { sessionStorage.setItem(CMP_KEY, '1'); } catch (e) {} };
    d.appendChild(t); d.appendChild(a); return d;
  }
  if (STAGE === 'sample' && G.checks) {
    var cmp = false; try { cmp = sessionStorage.getItem(CMP_KEY) === '1'; sessionStorage.removeItem(CMP_KEY); } catch (e) {}
    var d2 = el('div', 'wr-turn'), t2 = el('span');
    t2.appendChild(el('b', null, cmp ? 'Compare' : 'Finished?'));
    t2.appendChild(document.createTextNode(cmp ? 'What did the sample do that yours did not?' : 'Check your own ' + G.label.toLowerCase() + ' against four points.'));
    var bt = el('button', 'be2-nohit', 'Check yours'); bt.type = 'button'; bt.onclick = openCheck;
    d2.appendChild(t2); d2.appendChild(bt); return d2;
  }
  return null;
}
function openCheck() {
  var close = function () { var a = document.querySelector('.wr-sheet'), b = document.querySelector('.wr-sheet-bg'); if (a) a.remove(); if (b) b.remove(); };
  close();
  var bg = el('div', 'wr-sheet-bg'); bg.onclick = close;
  var sh = el('div', 'wr-sheet'); sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-label', 'Check your ' + G.label.toLowerCase());
  sh.appendChild(el('h3', null, 'Check yours'));
  sh.appendChild(el('p', 'wr-lead', 'Read your ' + G.label.toLowerCase() + ' on paper. Tick what is true.'));
  G.checks.forEach(function (c) {
    var lb = el('label', 'wr-ck'), cb = el('input'); cb.type = 'checkbox';
    var tx = el('span'); tx.appendChild(el('b', null, c[0])); tx.appendChild(document.createTextNode(c[1]));
    lb.appendChild(cb); lb.appendChild(tx); sh.appendChild(lb);
  });
  var acts = el('div', 'wr-acts');
  var more = el('a', null, 'Full checklist \u203A'); more.href = '/skills/writing/sentence-structure/band-descriptors.html?tab=check';
  var done = el('button', null, 'Done with this question'); done.type = 'button';
  done.onclick = function () { markDone(chosenId()); close(); location.href = G.stages.question; };
  acts.appendChild(more); acts.appendChild(done); sh.appendChild(acts);
  document.body.appendChild(bg); document.body.appendChild(sh);
  var f = sh.querySelector('input'); if (f) f.focus();
}

function leanFoot() {
  var css = document.createElement('style');
  css.textContent =
    '.wr-foot.wr-steps{flex-direction:column;align-items:center;gap:8px}' +
    '.wr-row{display:flex;align-items:center;gap:8px}' +
    '.wr-turn{box-sizing:border-box;width:100%;max-width:560px;display:flex;align-items:center;gap:10px;padding:8px 8px 8px 12px;background:#F3EADF;border-left:3px solid #B0865C;font:400 .8125rem/1.35 var(--f-body,"Geist",system-ui,sans-serif);color:#3A3530}' +
    '.wr-turn b{display:block;font:500 .625rem/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#9A5A2C;margin-bottom:3px}' +
    '.wr-turn span{flex:1;min-width:0}' +
    '.wr-turn button,.wr-turn a{all:unset;flex:none;cursor:pointer;padding:8px 12px;border-radius:999px;background:#14110E;color:#FAF8F5;font:500 .8125rem/1 var(--f-body,"Geist",system-ui,sans-serif);white-space:nowrap}' +
    '.wr-turn button:focus-visible,.wr-turn a:focus-visible{outline:2px solid #B0865C;outline-offset:2px}' +
    '.wr-ck{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px solid rgba(20,17,14,.1);cursor:pointer}' +
    '.wr-ck input{flex:none;width:20px;height:20px;margin:2px 0 0;accent-color:#14110E}' +
    '.wr-ck b{display:block;font:500 .625rem/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#9A5A2C;margin-bottom:4px}' +
    '.wr-ck span{font:400 .95rem/1.45 var(--f-body,"Geist",system-ui,sans-serif);color:#2A2622}' +
    '.wr-sheet p.wr-lead{margin:0 0 6px;font:400 .95rem/1.45 var(--f-body,"Geist",system-ui,sans-serif);color:#4A443E}' +
    '.wr-acts{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:14px}' +
    '.wr-acts a{color:#6B655C;font:500 .875rem/1 var(--f-body,"Geist",system-ui,sans-serif)}' +
    '.wr-acts button{all:unset;cursor:pointer;padding:12px 18px;border-radius:999px;background:#14110E;color:#FAF8F5;font:500 .95rem/1 var(--f-body,"Geist",system-ui,sans-serif)}' +
    '.wr-steps .wr-stage{display:inline-flex;align-items:center;gap:5px;padding:.5rem .7rem}' +
    '.wr-steps .wr-stage i{font-style:normal;font-family:"Geist Mono",ui-monospace,monospace;font-weight:500;font-size:.625rem;letter-spacing:0;width:15px;height:15px;border-radius:50%;display:inline-grid;place-items:center;border:1px solid currentColor;opacity:.7}' +
    '.wr-steps .wr-stage.seen i{background:#B0865C;border-color:#B0865C;color:#FAF8F5;opacity:1}' +
    '.wr-steps .wr-stage.active i{background:#14110E;border-color:#14110E;color:#FAF8F5;opacity:1}' +
    '.wr-next{flex:none;display:inline-grid;place-items:center;width:40px;height:40px;border-radius:50%;background:#14110E;color:#FAF8F5;text-decoration:none;font:500 1.25rem/1 var(--f-body,"Geist",system-ui,sans-serif);padding-bottom:2px;box-sizing:border-box}' +
    '.wr-next:active{transform:scale(.95)}.wr-next:focus-visible{outline:2px solid #B0865C;outline-offset:2px}' +
    '@media(max-width:400px){.wr-steps .wr-stage{padding:.45rem .5rem;letter-spacing:.04em}.wr-steps .wr-stage i{display:none}.wr-steps .wr-stage::before{content:attr(data-n);font-family:"Geist Mono",ui-monospace,monospace;font-weight:500;opacity:.6;margin-right:3px}}';
  document.head.appendChild(css);
  var f = el('div', 'wr-foot wr-steps');
  var pill = el('div', 'wr-stages'); pill.setAttribute('role', 'group'); pill.setAttribute('aria-label', 'Stages');
  var seen = seenStages(), list = ORDER.filter(function (k) { return G.stages[k]; }), n = 0;
  ORDER.forEach(function (k) {
    var url = G.stages[k]; if (!url && k !== STAGE) return;   /* a task without a Plan shows three steps, not a grey fourth */
    n++;
    var cls = 'wr-stage' + (k === STAGE ? ' active' : !url ? ' off' : (seen.indexOf(k) >= 0 ? ' seen be2-nohit' : ' be2-nohit'));
    var s = el(k === STAGE || !url ? 'span' : 'a', cls);
    if (url) { s.appendChild(el('i', null, String(n))); s.setAttribute('data-n', n); }
    s.appendChild(document.createTextNode(NAMES[k]));
    if (k === STAGE) s.setAttribute('aria-current', 'step');
    else if (url) s.href = url;
    pill.appendChild(s);
  });
  var row = el('div', 'wr-row'); row.appendChild(pill);
  var strip = turnStrip(); if (strip) f.appendChild(strip);
  f.appendChild(row);
  var i = list.indexOf(STAGE), nxt = i >= 0 && i < list.length - 1 ? list[i + 1] : null;
  if (nxt) {
    var a = el('a', 'wr-next be2-nohit', '\u203A'); a.href = G.stages[nxt];
    a.setAttribute('aria-label', 'Next: ' + NAMES[nxt]); a.title = 'Next: ' + NAMES[nxt];
    row.appendChild(a);
  }
  return f;
}

function foot() {
  if (LEAN) return leanFoot();
  var f = el('div', 'wr-foot');
  var pill = el('div', 'wr-stages');
  pill.setAttribute('role', 'group');
  pill.setAttribute('aria-label', 'Stage');
  ORDER.forEach(function (k) {
    var url = G.stages[k];
    if (k === 'generate' && !url) return;   /* Story has no generator */
    if (k === STAGE || !url) {
      var s = el('span', 'wr-stage' + (k === STAGE ? ' active' : ' off'), NAMES[k]);
      if (k === STAGE) s.setAttribute('aria-current', 'page');
      pill.appendChild(s);
    } else {
      /* be2-nohit: the touch-screen hit area would reach above the footer
         and catch taps meant for the card arrows just over it */
      var a = el('a', 'wr-stage be2-nohit', NAMES[k]);
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
/* the generator stands alone: no stage bar into the task journey */
var newFoot = null;
/* a page with modes of its own (Your review in five) brings its own
   .wr-foot pill: it is kept, and measured like ours */
if (oldFoot && oldFoot.classList.contains('wr-foot')) newFoot = oldFoot;
else if (STAGE !== 'generate') {
  newFoot = foot();
  if (oldFoot && oldFoot.parentNode) oldFoot.parentNode.replaceChild(newFoot, oldFoot);
  else shell.appendChild(newFoot);
}

(function () {
  var mb = newTop.querySelector('.mute'); if (!mb) return;
  function paint() {
    var on = !window.SFX || SFX.isOn();
    /* drawn, not an emoji (5 Nov): the same line weight as the app's other marks */
    mb.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="none"/>' +
      (on ? '<path d="M15.5 9.2a4 4 0 0 1 0 5.6"/><path d="M18 6.8a7.4 7.4 0 0 1 0 10.4"/>' : '<path d="M16 9.5l5 5M21 9.5l-5 5"/>') + '</svg>';
    mb.setAttribute('aria-pressed', on ? 'false' : 'true');
    mb.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
    mb.classList.toggle('off', !on);
  }
  mb.onclick = function () { if (window.SFX) SFX.toggle(); paint(); };
  paint();
})();

function sync() {
  document.documentElement.style.setProperty('--header-h', newTop.offsetHeight + 'px');
  document.documentElement.style.setProperty('--foot-h', (newFoot ? newFoot.offsetHeight : 0) + 'px');
}
sync();
addEventListener('resize', sync);
addEventListener('orientationchange', function () { setTimeout(sync, 120); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
if (window.ResizeObserver) {
  new ResizeObserver(sync).observe(newTop);
  if (newFoot) new ResizeObserver(sync).observe(newFoot);
}

/* A filter row that slides (phones) keeps its chosen tab in view: pages
   build their rows after loading, so watch them and centre the active one
   inside its own row, never scrolling the page. */
function centreActive(row) {
  if (row.scrollWidth <= row.clientWidth + 2) return;
  var on = row.querySelector('.active, .on, [aria-selected="true"]');
  /* lean header: the row has arrows, so it only makes sure the chosen type
     is in view, and the first type sits at the start rather than centred */
  if (LEAN) {
    if (!on) return;
    var l = on.offsetLeft - row.offsetLeft, r = l + on.offsetWidth;
    if (l < row.scrollLeft) row.scrollLeft = Math.max(0, l - 8);
    else if (r > row.scrollLeft + row.clientWidth) row.scrollLeft = r - row.clientWidth + 8;
    return;
  }
  if (on) row.scrollLeft = on.offsetLeft - (row.clientWidth - on.offsetWidth) / 2;
}
/* Plan pages: the plan says WHAT to say, the Model says HOW. Where a plan
   section leads with a language stem ("The documentary explores …",
   "This report is based on"), the overview hides the stem and leads with
   the student's first idea; the stem waits in the section's card, where
   stem and ideas meet. Essays already lead with claims, and Email's
   headings are the task's own content, so only Reviews and Reports. */
if (B.getAttribute('data-stage') === 'plan' && /^(reviews|reports)$/.test(B.getAttribute('data-writing') || '')) {
  var ELL = /(\u2026|\.\.\.)\s*$/;
  var mark = function () {
    Array.prototype.forEach.call(document.querySelectorAll('.keysview .key'), function (k) {
      var idea = k.querySelector('.k-note-idea');
      if (idea && ELL.test(idea.textContent) && k.querySelector('.k-suptext')) k.classList.add('stemmed');
    });
    Array.prototype.forEach.call(document.querySelectorAll('.keysview .ksig'), function (g) {
      if (g.querySelectorAll('.ks-note').length > 1) g.classList.add('stemmed');
    });
  };
  mark();
  if (window.MutationObserver) new MutationObserver(mark).observe(B, { childList: true, subtree: true });
}

/* Sample pages: the Full / Paragraphs switch joins the X-ray row, which
   saves a whole line and pulls the text up. A toolbar left with nothing
   in it folds away. */
if (B.getAttribute('data-stage') === 'sample') {
  var vt = document.querySelector('.card-toolbar .view-toggle'), xr = document.querySelector('.xray-row');
  if (vt && xr) {
    xr.appendChild(vt);
    xr.classList.add('has-view');
    var tb = document.querySelector('.card-toolbar');
    if (tb && !tb.querySelector('button')) tb.style.display = 'none';
  }
}

/* Model pages: a flat iOS pill beside Cards · Phrases opens the Model
   Generator on the subject the student is looking at. Pages keep that
   subject in a global TYPE (essays, reviews, reports) or, for emails, in
   currentRegister + currentType. */
/* Oct 2026: switched off — the journey no longer crosses into the generator. */
if (false && STAGE === 'model' && G.stages.generate) {
  var css = document.createElement('style');
  css.textContent =
    '.wr-gen{display:inline-flex;align-items:center;gap:.35rem;height:30px;padding:0 .9rem 0 .8rem;border-radius:999px;' +
    'background:rgba(118,118,128,.12);color:#1c1c1e;text-decoration:none;font:600 .8125rem/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Geist",system-ui,sans-serif;' +
    'letter-spacing:-.01em;white-space:nowrap;transition:background .15s}' +
    '.wr-gen:hover{background:rgba(118,118,128,.2)}.wr-gen:active{background:rgba(118,118,128,.28)}' +
    '.wr-gen i{font-style:normal;color:rgba(60,60,67,.6);font-size:1rem;line-height:1}' +
    '.mode-row.has-gen{display:flex!important;justify-content:center!important;align-items:center;gap:.6rem;flex-wrap:wrap}' +
    /* relative, not static: a static pill let the touch-screen hit area
       (be2-system.css, an absolute ::before) escape to the page and swallow
       taps on Phrases and the arrows — students landed in the Generator */
    '.mode-row.has-gen > *{grid-column:auto!important;justify-self:auto!important;margin:0!important;position:relative!important;inset:auto!important}' +
    '.wr-gen-row{display:flex;justify-content:center;padding:.45rem 1rem .15rem}';
  document.head.appendChild(css);
  var gen = el('a', 'wr-gen');
  gen.href = G.stages.generate;
  gen.appendChild(document.createTextNode('Model Generator'));
  gen.appendChild(el('i', null, '\u203A'));
  gen.addEventListener('click', function () {
    var sub = '';
    try { if (typeof TYPE !== 'undefined' && TYPE) sub = String(TYPE); } catch (e) {}
    try {
      if (!sub && typeof currentRegister !== 'undefined')
        sub = currentRegister + (typeof currentType !== 'undefined' && currentType ? '-' + String(currentType).toLowerCase() : '');
    } catch (e) {}
    if (sub) gen.href = G.stages.generate + '&subject=' + encodeURIComponent(sub);
  });
  var row = document.querySelector('.mode-row');
  if (row) { row.classList.add('has-gen'); row.appendChild(gen); }
  else {
    var wrap = el('div', 'wr-gen-row'); wrap.appendChild(gen);
    if (newTop.nextSibling) newTop.parentNode.insertBefore(wrap, newTop.nextSibling); else newTop.parentNode.appendChild(wrap);
  }
}

Array.prototype.forEach.call(document.querySelectorAll('.wr-filters'), function (row) {
  centreActive(row);
  if (window.MutationObserver) new MutationObserver(function () { centreActive(row); })
    .observe(row, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-selected'] });
});
})();
