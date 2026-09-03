/* ═══════════════════════════════════════════════════════════════════════
   INTUITY — VOCABULARY ENGINE
   One engine, two pages. Each is a shell that sets
   window.VOCAB = { data, scoreKey, title, subtitle, self } and links this.

   Similar Words (115 sets of 4) and Topic Vocabulary (60 sets of 5) are the
   same exercise at two sizes once the ten-word sets were split, so they
   share everything below. Same arrangement as practice.js and gapfill.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var CFG       = window.VOCAB || {};
var DATA_URL  = '../../data/similar-words/' + CFG.data + '.json';
var SCORE_KEY = CFG.scoreKey;
var PER_TEST  = 5;                    /* the data's own setsPerTest */

var sets = [], tests = [], currentTest = 0, isChecked = false, scores = {};
/* answers[setIndex][lineIndex] = the chosen word, or undefined. Keyed on the
   set rather than flat, because a test holds five independent cards and a
   word used in card 2 must stay available in card 3. */
var answers = {};
var picked  = null;                   /* {set, word} — armed, awaiting a gap */

var $ = function (id) { return document.getElementById(id); };
var esc = function (v) {
  return String(v).replace(/[&<>"]/g, function (c) {
    return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c];
  });
};

function loadScores() {
  try { scores = JSON.parse(localStorage.getItem(SCORE_KEY) || '{}'); }
  catch (e) { scores = {}; }
}
function saveScores() {
  try { localStorage.setItem(SCORE_KEY, JSON.stringify(scores)); } catch (e) {}
}

/* ═══ DATA ══════════════════════════════════════════════════════════════
   { title, level, setsPerTest, totalSets, sets:[ {setNumber, label,
     words:[…], sentences:[{text, correct}] } ] }

   `correct` is an index INTO words. It was renumbered when the ten-word
   sets were split into halves, and every one of the 300 pairings was
   checked afterwards — an index that points at the wrong word produces a
   page that renders perfectly and teaches the wrong thing, which is the
   kind of bug nothing catches by looking. */
function loadData() {
  fetch(DATA_URL, { cache:'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (d) {
      sets = d.sets || [];
      if (!sets.length) throw new Error('no sets in the data file');
      var per = d.setsPerTest || PER_TEST;
      for (var i = 0; i < sets.length; i += per) tests.push(sets.slice(i, i + per));
      loadScores();
      buildTabs();
      loadTest(0);
    })
    .catch(function (err) {
      $('board').innerHTML = '<div class="error">The exercises did not load.<br>' +
        esc(err.message) + '</div>';
    });
}

/* ═══ SET TABS ══════════════════════════════════════════════════════════
   Twenty-three of them for Similar Words, which is a lot of chips — but
   they are three characters wide and they replace the row of twenty-three
   grey dots the old page drew above the card. Dots that were only ever a
   tab row without labels. */
function buildTabs() {
  var wrap = $('setTabs');
  wrap.innerHTML = tests.map(function (_, i) {
    var s = scores['test' + i];
    return '<button class="vtab' + (i === currentTest ? ' active' : '') +
      '" type="button" data-i="' + i + '">' + (i + 1) +
      (s ? ' <span class="pct">' + s.percentage + '%</span>' : '') + '</button>';
  }).join('');
  wrap.querySelectorAll('.vtab').forEach(function (b) {
    b.addEventListener('click', function () { loadTest(+b.dataset.i); });
  });
}

/* ═══ THE BOARD ═════════════════════════════════════════════════════════ */
function loadTest(i) {
  if (i < 0 || i >= tests.length) return;
  currentTest = i;
  isChecked = false;
  answers = {};
  picked = null;
  buildTabs();
  render();
  updateStrip();
  resetActions();
  var el = document.scrollingElement || document.body;
  try { el.scrollTo({ top:0, behavior:'smooth' }); } catch (e) { el.scrollTop = 0; }
}

/* The gap is a run of underscores. Split on it and KEEP the surrounding
   spaces: the slot sits inline between two spans, so " through London
   attracted…" must keep its leading space or the word welds itself to the
   next one. */
function gapSplit(t) {
  var s = String(t || ''), m = s.match(/_{2,}/);
  return m ? [s.slice(0, m.index), s.slice(m.index + m[0].length)] : [s, ''];
}

function cardHTML(set, si) {
  var kick = 'SET ' + set.setNumber;
  var head = set.label
    ? '<h2 class="topic">' + esc(set.label) + '</h2>'
    : '';
  var pool = set.words.map(function (w, wi) {
    return '<button class="word" type="button" data-s="' + si + '" data-w="' + wi +
           '">' + esc(w) + '</button>';
  }).join('');
  var lines = set.sentences.map(function (s, li) {
    var p = gapSplit(s.text);
    return '<div class="line">' +
      '<div class="num">' + (li + 1) + '</div>' +
      '<div class="text">' + esc(p[0]) +
        '<span class="slot" role="button" tabindex="0" ' +
              'data-s="' + si + '" data-l="' + li + '"></span>' +
        esc(p[1]) +
        '<span class="answer" hidden></span>' +
      '</div></div>';
  }).join('');
  return '<div class="card">' +
    '<div class="kick"><i></i>' + esc(kick) + '</div>' + head +
    '<div class="pool">' + pool + '</div>' +
    '<div class="lines">' + lines + '</div>' +
  '</div>';
}

function render() {
  $('board').innerHTML = tests[currentTest].map(cardHTML).join('');
  $('board').querySelectorAll('.word').forEach(function (b) {
    b.addEventListener('click', function () { pick(+b.dataset.s, +b.dataset.w); });
  });
  $('board').querySelectorAll('.slot').forEach(function (el) {
    el.addEventListener('click', function () { place(+el.dataset.s, +el.dataset.l); });
    /* A slot is a div doing a button's job, so it has to answer to the
       keyboard like one or it is unreachable without a mouse. */
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place(+el.dataset.s, +el.dataset.l); }
    });
  });
  paint();
}

/* ═══ CHOOSING ══════════════════════════════════════════════════════════
   Tap a word, tap a gap. Not typing: these are five given words and the
   exercise is choosing between them, so asking a child to spell
   "fidgeting" correctly tests something the lesson is not about. It also
   means a wrong answer is always a wrong CHOICE and never a typo. */
function pick(si, wi) {
  if (isChecked) return;
  var set = setAt(si), w = set.words[wi];
  if (isUsed(si, w)) return;
  picked = (picked && picked.set === si && picked.word === w) ? null : { set:si, word:w };
  paint();
}

function place(si, li) {
  if (isChecked) return;
  answers[si] = answers[si] || {};
  /* Tapping a full gap empties it and returns the word to the pool. That is
     the only way back for a student who changed their mind, and it must not
     need a Clear that wipes the other four. */
  if (answers[si][li]) { delete answers[si][li]; picked = null; paint(); updateStrip(); return; }
  if (!picked || picked.set !== si) return;     /* a word belongs to its own card */
  answers[si][li] = picked.word;
  picked = null;
  paint();
  updateStrip();
}

function setAt(si) { return tests[currentTest][si]; }
function isUsed(si, w) {
  var a = answers[si] || {};
  for (var k in a) if (a[k] === w) return true;
  return false;
}

function paint() {
  $('board').querySelectorAll('.word').forEach(function (b) {
    var si = +b.dataset.s, w = setAt(si).words[+b.dataset.w];
    var used = isUsed(si, w);
    b.classList.toggle('used', used);
    b.classList.toggle('picked', !!picked && picked.set === si && picked.word === w);
    b.disabled = isChecked || used;
  });
  $('board').querySelectorAll('.slot').forEach(function (el) {
    var si = +el.dataset.s, li = +el.dataset.l;
    var v = (answers[si] || {})[li];
    el.textContent = v || '';
    el.classList.toggle('filled', !!v && !isChecked);
    /* Armed: a word is chosen and this card's empty gaps are what can
       receive it. Only this card's — the caramel ring should not light up
       on four other cards the word does not belong to. */
    el.classList.toggle('armed', !isChecked && !!picked && picked.set === si && !v);
    el.classList.toggle('locked', isChecked);
  });
}

function updateStrip() {
  var total = 0, done = 0;
  tests[currentTest].forEach(function (set, si) {
    total += set.sentences.length;
    done += Object.keys(answers[si] || {}).length;
  });
  $('tally').textContent = done + '/' + total;
  var html = '', i = 0;
  tests[currentTest].forEach(function (set, si) {
    set.sentences.forEach(function (_, li) {
      html += '<div class="dot' + ((answers[si] || {})[li] ? ' answered' : '') + '"></div>';
      i++;
    });
  });
  $('dots').innerHTML = html;
  $('checkBtn').disabled = done === 0;
}

/* ═══ MARKING ═══════════════════════════════════════════════════════════ */
function checkAnswers() {
  var correct = 0, total = 0;
  var cards = $('board').querySelectorAll('.card');
  tests[currentTest].forEach(function (set, si) {
    set.sentences.forEach(function (s, li) {
      total++;
      var want = set.words[s.correct];
      var got  = (answers[si] || {})[li];
      var ok   = got === want;
      if (ok) correct++;
      var slot = cards[si].querySelector('.slot[data-l="' + li + '"]');
      slot.textContent = got || '';
      slot.classList.remove('filled', 'armed');
      slot.classList.add('locked', ok ? 'correct' : 'incorrect');
      if (!ok) {
        var a = slot.parentElement.querySelector('.answer');
        a.textContent = want;
        a.hidden = false;
      }
    });
  });
  isChecked = true;
  paint();

  var pct = Math.round(correct / total * 100);
  scores['test' + currentTest] = { correct:correct, total:total, percentage:pct,
                                   at:new Date().toISOString() };
  saveScores();
  buildTabs();

  $('board').insertAdjacentHTML('afterbegin',
    '<div class="score-banner"><div class="score-text">' + correct + '/' + total + '</div>' +
    '<div class="score-label">' + pct + '% correct</div></div>');

  $('clearBtn').textContent = 'Try again';
  $('checkBtn').disabled = true;
  var el = document.scrollingElement || document.body;
  try { el.scrollTo({ top:0, behavior:'smooth' }); } catch (e) { el.scrollTop = 0; }
}

function clearAnswers() { loadTest(currentTest); }

function resetActions() {
  $('clearBtn').textContent = 'Clear';
  $('checkBtn').textContent = 'Check';
  $('checkBtn').disabled = true;
}
/* Bound once via onclick, not addEventListener: resetActions may reassign,
   and two listeners on one button fires Check twice — two score banners and
   a second pass re-marking work already judged. */
$('clearBtn').onclick = clearAnswers;
$('checkBtn').onclick = checkAnswers;

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && picked) { picked = null; paint(); }
});

loadData();
})();
