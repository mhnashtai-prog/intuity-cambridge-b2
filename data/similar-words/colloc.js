/* ═══════════════════════════════════════════════════════════════════════
   INTUITY — COLLOCATIONS
   One bank, two modes. Browse is the resource; Practice is generated from
   the same entries, so the exercise and the resource cannot drift apart.

   The bank is NODE -> collocates. The old file was organised by the
   adverb's function class, which meant the question a learner actually
   asks — which adverb goes with COLD — could not be asked of it at all.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var DATA_URL = '../../data/similar-words/collocations-bank.json';
var SCORE_KEY = 'collocations_scores';

var BANK = null, PATS = [], pat = 0, mode = 'browse';
var items = [], answers = {}, isChecked = false, scores = {};

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
    '<div class="pos">' + esc(n.pos) + '</div>' +
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

function qHTML(it, i) {
  var ex = it.example, s = it.surface;
  var k = ex.toLowerCase().indexOf(s.toLowerCase());
  var stem = k < 0 ? esc(ex)
    : esc(ex.slice(0, k)) + '<span class="gap" id="gap-' + i + '"></span>' + esc(ex.slice(k + s.length));
  return '<div class="q" id="q-' + i + '">' +
    '<div class="stem">' + stem + '</div>' +
    '<div class="picks">' + it.options.map(function (o, j) {
      return '<button class="pick" type="button" data-q="' + i + '" data-o="' + j + '">' +
             esc(o) + '</button>';
    }).join('') + '</div>' +
    '<div class="why-note" id="why-' + i + '"></div></div>';
}

function renderPractice() {
  $('board').className = 'card';
  $('board').innerHTML = items.map(qHTML).join('');
  $('board').querySelectorAll('.pick').forEach(function (b) {
    b.addEventListener('click', function () { choose(+b.dataset.q, +b.dataset.o); });
  });
  $('actionBar').style.display = 'flex';
  updateTally();
}

function choose(qi, oi) {
  if (isChecked) return;
  answers[qi] = items[qi].options[oi];
  document.querySelectorAll('.pick[data-q="' + qi + '"]').forEach(function (b) {
    b.classList.toggle('chosen', +b.dataset.o === oi);
  });
  var gap = $('gap-' + qi);
  if (gap) gap.textContent = answers[qi];
  snd('tick');
  updateTally();
}

function updateTally() {
  var done = Object.keys(answers).length;
  $('tally').textContent = done + '/' + items.length;
  $('dots').innerHTML = items.map(function (_, i) {
    return '<div class="dot' + (answers[i] != null ? ' answered' : '') + '"></div>';
  }).join('');
  var left = items.length - done;
  var btn = $('checkBtn');
  btn.disabled = left > 0;
  btn.title = left > 0 ? left + ' left' : 'Mark the set';
}

function check() {
  var done = Object.keys(answers).length;
  if (done < items.length || isChecked) return;
  var correct = 0;
  items.forEach(function (it, i) {
    var got = answers[i], ok = got === it.answer;
    if (ok) correct++;
    var q = $('q-' + i);
    q.classList.add('done'); if (!ok) q.classList.add('miss');
    var gap = $('gap-' + i);
    /* The gap always ends up holding the RIGHT partner, so the sentence on
       screen is one the student can read back as true English. A wrong word
       left sitting in it would be the only thing on the page teaching the
       collocation that isn't. */
    if (gap) gap.textContent = ok ? it.surface : got;
    document.querySelectorAll('.pick[data-q="' + i + '"]').forEach(function (b) {
      b.disabled = true;
      var w = it.options[+b.dataset.o];
      if (w === it.answer) b.classList.add('is-answer');
      else if (w === got) b.classList.add('is-wrong');
    });
    if (!ok) {
      var note = $('why-' + i);
      note.innerHTML = it.why[got]
        ? '<b>' + esc(got) + '</b> — ' + esc(it.why[got])
        : '<b>' + esc(it.answer) + '</b> is the partner here.';
      note.classList.add('show');
    }
  });
  isChecked = true;
  var pct = Math.round(correct / items.length * 100);
  scores[PATS[pat]] = { correct:correct, total:items.length, percentage:pct };
  try { localStorage.setItem(SCORE_KEY, JSON.stringify(scores)); } catch (e) {}
  buildTabs();
  snd(correct === items.length ? 'fanfare' : (correct >= items.length / 2 ? 'correct' : 'wrong'));
  $('board').insertAdjacentHTML('afterbegin',
    '<div class="score-banner' + (correct === items.length ? ' clean' : '') + '">' +
    '<div class="score-text">' + correct + '/' + items.length + '</div>' +
    '<div class="score-label">' + pct + '% correct</div></div>');
  $('checkBtn').disabled = true;
  $('clearBtn').textContent = 'New set';
  var el = document.scrollingElement || document.body;
  try { el.scrollTo({ top:0, behavior:'smooth' }); } catch (e) { el.scrollTop = 0; }
}

/* ═══ MODES ═════════════════════════════════════════════════════════════ */
function show() {
  answers = {}; isChecked = false;
  $('clearBtn').textContent = 'New set';
  if (mode === 'browse') { renderBrowse(); $('dots').innerHTML = ''; }
  else { buildItems(); renderPractice(); }
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
$('checkBtn').onclick = check;

load();
})();
