/* ═══════════════════════════════════════════════════════════════════════
   INTUITY — COLLOCATIONS
   One bank, two modes. Browse is the resource; Practice is generated from
   the same entries, so the exercise and the resource cannot drift apart.

   The bank is NODE -> collocates. The old file was organised by the
   adverb's function class, which meant the question a learner actually
   asks — which adverb goes with COLD — could not be asked of it at all.

   PRACTICE IS NOW A SCROLL, NOT A DECK.
   It used to hold one question on screen with a Next button, the only mode
   in the product built that way while Browse, and every "all sets" view
   elsewhere, lays its cards down the page. That made Practice read as a
   different, older exercise rather than the same card in its quiz form.
   All ten questions render up front, in one card.

   MARKING MOVED TO CHECK, TO MATCH SIMILAR WORDS AND TOPIC VOCABULARY.
   A tap used to mark that one question immediately — right there before the
   next one was even visible. That made sense while only one question was
   ever on screen, but next to nine others waiting it reads as ten separate
   micro-tests rather than one. Every other quiz in the product marks
   nothing until Check, and Check itself stays disabled until all ten are
   answered — a partial mark is a number the student did not earn. Tapping a
   pick now only SELECTS it; nothing is judged, and it can be changed, right
   up until Check is pressed. */
(function () {
'use strict';

var DATA_URL = '../../data/similar-words/collocations-bank.json';
var SCORE_KEY = 'collocations_scores';

var BANK = null, PATS = [], pat = 0, mode = 'browse';
var items = [], scores = {};
/* picks[i] = the OPTION INDEX chosen for question i, or undefined — a
   selection, not a verdict. Nothing is judged until Check, so this is all
   that exists before then; `results` and `score` only get filled in once
   checkAnswers() runs. */
var picks = [], isChecked = false, score = 0, results = [];

var $ = function (id) { return document.getElementById(id); };
var esc = function (v) {
  return String(v).replace(/[&<>"]/g, function (c) {
    return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c];
  });
};

function snd(name) {
  var S = window.SFX;
  if (S && S.isOn && S.isOn() && S[name]) { try { S[name](); } catch (e) {} }
}

/* ═══ DATA ══════════════════════════════════════════════════════════════ */
function load() {
  fetch(DATA_URL, { cache:'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (d) {
      BANK = d;
      /* Only patterns that actually have nodes. A tab for an empty family
         is a promise the data does not keep. */
      PATS = Object.keys(d.patterns).filter(function (k) {
        return d.nodes.some(function (n) { return n.pattern === k; });
      });
      try { scores = JSON.parse(localStorage.getItem(SCORE_KEY) || '{}'); } catch (e) {}
      buildTabs();
      show();
    })
    .catch(function (e) {
      $('board').innerHTML = '<div class="error">The bank did not load.<br>' + esc(e.message) + '</div>';
    });
}

function nodesIn(p) {
  return BANK.nodes.filter(function (n) { return n.pattern === p; });
}

function buildTabs() {
  var wrap = $('setTabs');
  wrap.innerHTML = PATS.map(function (k, i) {
    var s = scores[k];
    return '<button class="vtab' + (i === pat ? ' active' : '') + '" type="button" data-i="' + i + '">' +
      esc(BANK.patterns[k].label) + (s ? ' <span class="pct">' + s.percentage + '%</span>' : '') +
      '</button>';
  }).join('');
  wrap.querySelectorAll('.vtab').forEach(function (b) {
    b.addEventListener('click', function () { pat = +b.dataset.i; buildTabs(); show(); });
  });
}

/* ═══ BROWSE ════════════════════════════════════════════════════════════ */
/* The collocate is shown inside its example in full ink, so the pairing is
   read as a pairing rather than as a word and a sentence that happen to be
   next to each other. `form` is the surface the example uses — made, not
   make — and it is stored rather than stemmed, because a stemmer that
   guesses wrong bolds the wrong word and nothing on screen says so. */
function markUp(ex, surface) {
  var i = ex.toLowerCase().indexOf(surface.toLowerCase());
  if (i < 0) return esc(ex);
  return esc(ex.slice(0, i)) + '<b>' + esc(ex.substr(i, surface.length)) + '</b>' +
         esc(ex.slice(i + surface.length));
}

function cardHTML(n) {
  var cols = n.collocates.map(function (c) {
    return '<div class="col ' + (c.strength === 'strong' ? 'strong' : '') + '">' +
      '<div class="w">' + esc(c.w) + '</div>' +
      '<div class="eg">' + markUp(c.example, c.form || c.w) + '</div></div>';
  }).join('');
  var avoid = n.avoid.length ? '<div class="avoid"><div class="avoid-label">Not with</div>' +
    n.avoid.map(function (a) {
      return '<div class="av"><div class="w">' + esc(a.w) + '</div>' +
             '<div class="why">' + esc(a.why) + '</div></div>';
    }).join('') + '</div>' : '';
  return '<div class="card">' +
    '<div class="kick"><i></i>' + esc(BANK.patterns[n.pattern].label) + '</div>' +
    '<h2 class="node">' + esc(n.node) + '</h2>' +
    '<div class="cols">' + cols + '</div>' + avoid +
  '</div>';
}

function renderBrowse() {
  var ns = nodesIn(PATS[pat]);
  $('board').className = 'bank';
  $('board').innerHTML =
    '<div class="pat-note">' + esc(BANK.patterns[PATS[pat]].note) + '</div>' +
    ns.map(cardHTML).join('');
  $('tally').textContent = ns.length + (ns.length === 1 ? ' word' : ' words');
  $('actionBar').style.display = 'none';
}

/* ═══ PRACTICE ══════════════════════════════════════════════════════════
   Generated from the bank. Options are the right partner, then the node's
   OWN avoid words, then collocates from other nodes in the same pattern.

   The avoid words first is the entire point. A random wrong option teaches
   nothing — a learner rejects it on sound without thinking. "very cold" and
   "utterly cold" are the answers they actually give, so meeting them here,
   and being told which is weak and which is wrong, IS the lesson. */
function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function buildItems() {
  var ns = nodesIn(PATS[pat]);
  var pool = [];
  ns.forEach(function (n) {
    n.collocates.forEach(function (c) { pool.push(c.w); });
  });
  items = [];
  ns.forEach(function (n) {
    n.collocates.forEach(function (c) {
      var opts = [c.w];
      n.avoid.forEach(function (a) { if (opts.indexOf(a.w) < 0) opts.push(a.w); });
      shuffle(pool.slice()).forEach(function (w) {
        if (opts.length < 4 && opts.indexOf(w) < 0) opts.push(w);
      });
      items.push({
        node: n.node,
        pos: n.pos,
        answer: c.w,
        surface: c.form || c.w,
        example: c.example,
        options: shuffle(opts.slice(0, 4)),
        /* keyed by option so the reason can be shown for the exact wrong
           answer the student chose, not a general note about the node */
        why: n.avoid.reduce(function (m, a) { m[a.w] = a.why; return m; }, {})
      });
    });
  });
  shuffle(items);
  /* Ten is a sitting. The verb+noun family has sixty collocates and nobody
     works through sixty gaps in one go. */
  items = items.slice(0, 10);
}

/* ── EVERY QUESTION, ONE CARD, DOWN THE PAGE ─────────────────────────────
   `.q + .q` in colloc.css already draws a rule between one question and
   the next — that CSS was written for exactly this arrangement, so nothing
   there needs to change. Only the id needs to carry the question's own
   index now, since ten of these sit in the DOM at once rather than one. */
function qHTML(it, idx) {
  var ex = it.example, sf = it.surface;
  var k = ex.toLowerCase().indexOf(sf.toLowerCase());
  var stem = k < 0 ? esc(ex)
    : esc(ex.slice(0, k)) + '<span class="gap" id="gap' + idx + '"></span>' + esc(ex.slice(k + sf.length));
  return '<div class="q" id="q' + idx + '">' +
    '<div class="kick"><i></i>' + esc(BANK.patterns[PATS[pat]].label) + '</div>' +
    '<h2 class="node">' + esc(it.node) + '</h2>' +
    '<div class="stem">' + stem + '</div>' +
    '<div class="picks">' + it.options.map(function (o, j) {
      return '<button class="pick" type="button" data-i="' + idx + '" data-o="' + j + '">' + esc(o) + '</button>';
    }).join('') + '</div>' +
    '<div class="why-note" id="why' + idx + '"></div>' +
  '</div>';
}

function renderPractice() {
  $('board').className = 'board quiz';
  $('board').innerHTML = '<div class="card">' +
    items.map(qHTML).join('') +
  '</div>';
  $('board').querySelectorAll('.pick').forEach(function (b) {
    b.addEventListener('click', function () { selectOption(+b.dataset.i, +b.dataset.o); });
  });
  $('actionBar').style.display = 'flex';
  $('checkBtn').style.display = '';
  $('checkBtn').textContent = 'Check';
  $('checkBtn').disabled = true;
  $('checkBtn').onclick = checkAnswers;
  updateTally();
}

/* ── SELECT: A CHOICE, NOT YET A VERDICT ─────────────────────────────────
   Tapping a pick only records it. Tapping the SAME pick again clears it —
   the only way back for a student who changed their mind — and tapping a
   different one in the same question just moves the mark, the way choosing
   again on a multiple-choice sheet does. Nothing here is correct or wrong
   yet; that only exists after Check. */
function selectOption(idx, oi) {
  if (isChecked) return;
  picks[idx] = (picks[idx] === oi) ? undefined : oi;
  paintPick(idx);
  updateTally();
}

function paintPick(idx) {
  var q = $('q' + idx);
  q.querySelectorAll('.pick').forEach(function (b) {
    b.classList.toggle('picked', +b.dataset.o === picks[idx]);
  });
}

function updateTally() {
  var done = picks.filter(function (p) { return p !== undefined; }).length;
  $('tally').textContent = done + '/' + items.length;
  $('dots').innerHTML = items.map(function (_, i) {
    var c = 'dot';
    if (isChecked) { if (results[i] === true) c += ' answered'; else if (results[i] === false) c += ' answered miss'; }
    else if (picks[i] !== undefined) c += ' answered';
    return '<div class="' + c + '"></div>';
  }).join('');
  /* Locked until every question has a pick — a test marked at 3/10 writes a
     score the other seven never earned. The button says what is missing
     rather than just refusing. */
  var left = items.length - done;
  var btn = $('checkBtn');
  if (!isChecked) {
    btn.disabled = left > 0;
    btn.title = left > 0 ? left + (left === 1 ? ' question left' : ' questions left') : 'Mark the set';
  }
}

/* ── CHECK MARKS EVERY QUESTION AT ONCE ──────────────────────────────────
   Only reachable once every pick is made (see updateTally). Belt and
   braces: this is the function that writes a permanent score, so it does
   not trust the disabled state alone. */
function checkAnswers() {
  var done = picks.filter(function (p) { return p !== undefined; }).length;
  if (done < items.length || isChecked) return;
  isChecked = true;
  score = 0;

  items.forEach(function (it, idx) {
    var got = it.options[picks[idx]], ok = got === it.answer;
    results[idx] = ok;
    if (ok) score++;

    var q = $('q' + idx);
    q.classList.add('done'); if (!ok) q.classList.add('miss');
    /* The gap ends up holding the RIGHT partner on a correct answer and the
       chosen one on a wrong answer, struck through — so the student sees
       what they wrote and what was wanted, rather than one instead of the
       other. */
    $('gap' + idx).textContent = ok ? it.surface : got;
    q.querySelectorAll('.pick').forEach(function (b) {
      b.disabled = true;
      b.classList.remove('picked');
      var w = it.options[+b.dataset.o];
      if (w === it.answer) b.classList.add('is-answer');
      else if (w === got) b.classList.add('is-wrong');
    });

    var note = $('why' + idx);
    if (!ok) {
      note.innerHTML = it.why[got]
        ? '<b>' + esc(got) + '</b> — ' + esc(it.why[got])
        : '<b>' + esc(it.answer) + '</b> is the partner here.';
      note.classList.add('show');
    } else if (it.why[it.answer]) {
      note.classList.add('show');
      note.innerHTML = esc(it.why[it.answer]);
    }
    q.classList.add(ok ? 'pop' : 'shake');
  });

  updateTally();
  finish();
}

function finish() {
  var pct = Math.round(score / items.length * 100);
  scores[PATS[pat]] = { correct:score, total:items.length, percentage:pct };
  try { localStorage.setItem(SCORE_KEY, JSON.stringify(scores)); } catch (e) {}
  buildTabs();
  snd(score === items.length ? 'fanfare' : (score >= items.length / 2 ? 'correct' : 'wrong'));

  /* Prepended above the ten marked questions, not in place of them — every
     answer and its correction is still on screen below the score. */
  $('board').insertAdjacentHTML('afterbegin',
    '<div class="score-banner' + (score === items.length ? ' clean' : '') + '">' +
    '<div class="score-text">' + score + '/' + items.length + '</div>' +
    '<div class="score-label">' + pct + '% correct</div></div>');

  $('checkBtn').disabled = true;
  $('clearBtn').textContent = 'Try again';

  var el = document.scrollingElement || document.body;
  try { el.scrollTo({ top:0, behavior:'smooth' }); } catch (e) { el.scrollTop = 0; }
}

/* ═══ MODES ═════════════════════════════════════════════════════════════ */
function show() {
  picks = []; isChecked = false; score = 0; results = [];
  $('clearBtn').textContent = 'New set';
  if (mode === 'browse') { renderBrowse(); $('dots').innerHTML = ''; }
  else { buildItems(); renderPractice(); }   /* renderPractice binds checkBtn itself */
  var el = document.scrollingElement || document.body;
  try { el.scrollTo({ top:0, behavior:'smooth' }); } catch (e) { el.scrollTop = 0; }
}

document.querySelectorAll('.mode-btn[data-mode]').forEach(function (b) {
  b.addEventListener('click', function () {
    if (mode === b.dataset.mode) return;
    mode = b.dataset.mode;
    document.querySelectorAll('.mode-btn[data-mode]').forEach(function (x) {
      x.classList.toggle('active', x.dataset.mode === mode);
    });
    $('stripLabel').textContent = mode === 'browse'
      ? 'The partners that go with each word'
      : 'Choose the partner that fits';
    show();
  });
});

$('clearBtn').onclick = function () { show(); };

load();
})();
