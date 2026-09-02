/* ═══════════════════════════════════════════════════════════════════════
   INTUITY — PRACTICE ENGINE
   One engine, twelve topics. Each page is a thin shell that sets
   window.PRACTICE = { data, scoreKey, mode } and links this file.

   Replaces 3,422 lines of inline JS across twelve pages. gapfill.js has run
   every quiz since the rework; this is the same arrangement, and the
   conditionals page's own note already said it was the obvious next move
   and that the file was written to make it easy. It was: nothing here
   touches the DOM outside #contentContainer, #testSelector, #practiceStrip
   and #actionBar.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var CFG = window.PRACTICE || {};
var DATA_URL  = new URLSearchParams(location.search).get('json')
             || '../../data/grammar-rules/' + CFG.data + '.json';
var SCORE_KEY = CFG.scoreKey;
/* 'transform' (eleven topics) or 'choice' (collocations). The exercise
   differs; everything around it does not. */
var MODE      = CFG.mode || 'transform';

var allTests = [], currentTest = 0, isChecked = false, testScores = {};
var answers = {};
var $ = function (id) { return document.getElementById(id); };
var esc = function (v) {
  return String(v).replace(/[&<>"]/g, function (c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
  });
};

/* ── WHO DRAWS THE TABS ──
   The host keeps every navigation control in one header, so when it says it
   will draw them we hide ours. It must ANNOUNCE that: an older host that
   never listens would otherwise leave the student with no way to change set
   at all. Default is to keep our own. */
var EMBEDDED = window.parent !== window;
var hostDrawsTabs = false;

/* THE FRAME IS THE SCROLLER, NOT THE WINDOW. window.scrollTo moves nothing
   here, so after Check the score banner was inserted at the top of a page
   the student was still looking at the bottom of. */
function scrollTop() {
  var el = document.scrollingElement || document.body;
  try { el.scrollTo({ top:0, behavior:'smooth' }); } catch (e) { el.scrollTop = 0; }
}

/* ═══ DATA ══════════════════════════════════════════════════════════════
   Four shapes exist across the topics, all of them valid, none of them
   worth rewriting: each data file is also read by that topic's quiz, map or
   games. The engine accepts all four rather than making ten files agree.

     practice[]                  most topics, and the bare arrays
     {practice:[…]}              conditionals, passive voice, phrasal verbs
     {practice:{tests:[…]}}      gerunds
     {tests:[…]}                 fallback

   Items are `examples` (original/keyword/before/after/answer) or
   `transformations` (sentence1/keyWord/sentence2/answer) or, for choice
   mode, `questions` (sentence/options/correct/explanation). */
function unwrap(raw) {
  var p = Array.isArray(raw) ? raw : (raw.practice || raw.tests);
  if (p && !Array.isArray(p)) p = p.tests || p.sets;
  return p;
}

/* sentence2 carries the gap as a run of underscores — "I am _____ science
   fiction novels." — where the shared shape wants the two halves either
   side of it. Split on the run and KEEP the surrounding spaces: the input
   sits inline between two spans, so " science fiction novels." must keep
   its leading space or the field welds itself to the next word.

   Checked against every transformation in the repo: all 120 split. If one
   ever lacks the marker the whole sentence becomes the `before` half and
   the field lands at the end — wrong, but readable, which is the right way
   for this to fail. */
function fromTransformation(t) {
  var s2 = String(t.sentence2 || ''), m = s2.match(/_{2,}/);
  return {
    original: t.sentence1,
    keyword:  t.keyWord || t.keyword,
    before:   m ? s2.slice(0, m.index) : s2,
    after:    m ? s2.slice(m.index + m[0].length) : '',
    answer:   t.answer,
    /* "fond of reading" and "very fond of reading" are both right and the
       data says so; marking the second wrong teaches the opposite of the
       rule. The old inline engines all ignored this field. */
    alternatives: t.alternativeAnswers || t.alternatives || []
  };
}

/* Long set names are cut for the chip and the remainder goes to the strip.
   Phrasal verbs names its sets "Test 3 - Advanced with Multiple Changes";
   five of those in a header wrap to three rows on a phone, and the part
   that distinguishes them is the numeral. Topics with short titles are
   unaffected — there is no separator to find. */
function titleOf(s) {
  var t = String(s.title || s.setTitle || ''), cut = t.indexOf(' - ');
  return cut > -1 ? t.slice(0, cut) : t;
}
function descriptorOf(s) {
  var t = String(s.title || s.setTitle || ''), cut = t.indexOf(' - ');
  return [cut > -1 ? t.slice(cut + 3) : (s.theme || ''), s.difficulty]
           .filter(Boolean).join(' · ');
}

function loadScores() {
  try { testScores = JSON.parse(localStorage.getItem(SCORE_KEY) || '{}'); }
  catch (e) { testScores = {}; }
}
function saveScores() {
  try { localStorage.setItem(SCORE_KEY, JSON.stringify(testScores)); } catch (e) {}
}

function loadData() {
  fetch(DATA_URL, { cache:'no-store' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (raw) {
      var sets = unwrap(raw);
      if (!sets || !sets.length) throw new Error('no practice sets in the data file');
      allTests = sets.map(function (s) {
        return {
          title:      titleOf(s),
          descriptor: descriptorOf(s),
          items: MODE === 'choice'
            ? (s.questions || s.examples || [])
            : (s.examples || (s.transformations || []).map(fromTransformation))
        };
      });
      loadScores();
      renderTestSelector();
      loadTest(0);
    })
    .catch(function (err) {
      $('contentContainer').innerHTML =
        '<div class="error">The exercises did not load.<br>' + esc(err.message) + '</div>';
    });
}

/* ═══ TABS ══════════════════════════════════════════════════════════════ */
function publishTests() {
  if (!EMBEDDED) return;
  parent.postMessage({
    intuity:'tests', mode:'practice',
    /* A percentage rather than a tick, so a 60% is visible as a reason to go
       back and not just as "done". */
    titles: allTests.map(function (t, i) {
      var s = testScores['test' + i];
      return s ? t.title + ' (' + s.percentage + '%)' : t.title;
    }),
    active: currentTest
  }, '*');
}

window.addEventListener('message', function (e) {
  if (!e.data) return;
  if (e.data.intuity === 'setTest') loadTest(e.data.index);
  if (e.data.intuity === 'hostTabs' && !hostDrawsTabs) {
    hostDrawsTabs = true;
    renderTestSelector();
  }
});

function renderTestSelector() {
  publishTests();
  var sel = $('testSelector');
  if (!sel) return;
  if (EMBEDDED && hostDrawsTabs) { sel.style.display = 'none'; return; }
  sel.style.display = '';
  sel.innerHTML = '';
  allTests.forEach(function (t, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'test-btn' + (i === currentTest ? ' active' : '');
    var sc = testScores['test' + i];
    b.textContent = t.title + (sc ? ' (' + sc.percentage + '%)' : '');
    b.onclick = function () { loadTest(i); };
    sel.appendChild(b);
  });
}

/* ═══ THE BOARD ═════════════════════════════════════════════════════════ */
function loadTest(index) {
  if (index == null || index < 0 || index >= allTests.length) return;
  currentTest = index;
  isChecked = false;
  Object.keys(answers).forEach(function (k) { delete answers[k]; });
  renderTestSelector();
  renderTest();
  updateStrip();
  $('actionBar').style.display = 'flex';
  resetActions();
  scrollTop();
}

function autoExpand(inp) {
  inp.style.width = 'auto';
  var w = Math.max(inp.scrollWidth + 4, 8 * parseFloat(getComputedStyle(inp).fontSize));
  inp.style.width = Math.min(w, inp.parentElement.clientWidth) + 'px';
}

function gapSplit(sentence) {
  var s = String(sentence || ''), m = s.match(/_{2,}/);
  return m ? [s.slice(0, m.index), s.slice(m.index + m[0].length)] : [s, ''];
}

function itemHTML(item, i) {
  var body;
  if (MODE === 'choice') {
    var parts = gapSplit(item.sentence);
    body =
      '<div class="sentence2">' + esc(parts[0]) +
        '<span class="slot" id="slot-' + i + '"></span>' + esc(parts[1]) + '</div>' +
      /* radiogroup, not a list of buttons: a screen reader then announces
         "1 of 4" and arrow keys move between them, which is what a set of
         mutually exclusive choices is. */
      '<div class="opts" role="radiogroup" aria-label="Question ' + (i + 1) + '">' +
        (item.options || []).map(function (o, j) {
          return '<button type="button" class="opt" role="radio" aria-checked="false" ' +
            'data-q="' + i + '" data-o="' + j + '">' + esc(o) + '</button>';
        }).join('') +
      '</div>';
  } else {
    body =
      (item.original ? '<div class="sentence1">' + esc(item.original) + '</div>' : '') +
      '<div class="keyword">' + esc(String(item.keyword || '').toUpperCase()) + '</div>' +
      '<div class="sentence2">' +
        (item.before ? '<span class="sentence2-part">' + esc(item.before) + '</span>' : '') +
        '<input type="text" class="answer-input" id="in-' + i + '" data-i="' + i + '" ' +
               'placeholder="…" autocomplete="off" autocapitalize="none" ' +
               'autocorrect="off" spellcheck="false">' +
        (item.after ? '<span class="sentence2-part">' + esc(item.after) + '</span>' : '') +
      '</div>';
  }
  return '<div class="question-card"><div class="q-row">' +
      '<div class="q-number">' + (i + 1) + '</div>' +
      '<div class="q-body">' + body +
        '<div class="feedback" id="fb-' + i + '">' +
          '<div class="feedback-label"></div><div class="feedback-answer"></div>' +
        '</div>' +
      '</div></div></div>';
}

function renderTest() {
  var test = allTests[currentTest];
  $('contentContainer').innerHTML = test.items.map(itemHTML).join('');

  if (MODE === 'choice') {
    $('contentContainer').querySelectorAll('.opt').forEach(function (b) {
      b.addEventListener('click', function () { choose(+b.dataset.q, +b.dataset.o); });
    });
  } else {
    $('contentContainer').querySelectorAll('.answer-input').forEach(function (inp) {
      inp.addEventListener('input', function () {
        answers[inp.dataset.i] = inp.value;
        inp.classList.toggle('has-value', !!inp.value);
        autoExpand(inp);
        updateStrip();
      });
      autoExpand(inp);
    });
  }
  $('practiceStrip').style.display = 'flex';
  /* Falls back to the instruction every topic shows, so a set without a
     descriptor is never a blank label. */
  $('setDescriptor').textContent = test.descriptor ||
    (MODE === 'choice' ? 'Choose the natural collocation' : 'Rewrite using the key word');
}

function choose(qi, oi) {
  if (isChecked) return;
  answers[qi] = oi;
  var item = allTests[currentTest].items[qi];
  document.querySelectorAll('.opt[data-q="' + qi + '"]').forEach(function (b) {
    var on = +b.dataset.o === oi;
    b.classList.toggle('chosen', on);
    b.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  var slot = $('slot-' + qi);
  slot.textContent = (item.options || [])[oi] || '';
  slot.classList.add('filled');
  updateStrip();
}

function isAnswered(i) {
  return MODE === 'choice' ? answers[i] != null : !!(answers[i] || '').trim();
}

function updateStrip() {
  var test = allTests[currentTest];
  var done = test.items.filter(function (_, i) { return isAnswered(i); }).length;
  $('practiceTally').textContent = done + '/' + test.items.length;
  $('practiceDots').innerHTML = test.items.map(function (_, i) {
    return '<div class="practice-dot' + (isAnswered(i) ? ' answered' : '') + '"></div>';
  }).join('');
}

/* ═══ MARKING ═══════════════════════════════════════════════════════════
   Phones convert ' to ’, and a Portuguese keyboard gives ´ from the dead
   key beside Enter, so "can´t" has to match "can't" or every negative marks
   wrong for a learner using the keyboard in front of them. Same list as the
   quiz. */
function normalize(v) {
  return String(v || '').toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B\u02BC\u02B9\u02BB\u00B4\u0060\u2032]/g, "'")
    .replace(/[.,!?]+$/, '')
    .trim().replace(/\s+/g, ' ');
}

function markTransform(item, i, revealOnly) {
  var inp = $('in-' + i), fb = $('fb-' + i);
  var given = normalize(inp.value);
  var ok = given === normalize(item.answer) ||
           (item.alternatives || []).some(function (a) { return normalize(a) === given; });
  inp.classList.remove('has-value');
  inp.classList.add(ok ? 'correct' : 'incorrect');
  inp.readOnly = true;
  if (!ok && !revealOnly) {
    fb.classList.add('show');
    fb.querySelector('.feedback-label').textContent = 'Answer';
    fb.querySelector('.feedback-answer').textContent = item.answer;
  }
  return ok;
}

function markChoice(item, i, revealOnly) {
  var right = item.correct, given = answers[i], ok = given === right;
  document.querySelectorAll('.opt[data-q="' + i + '"]').forEach(function (b) {
    var j = +b.dataset.o;
    b.disabled = true;
    b.classList.remove('chosen');
    if (j === right) b.classList.add('is-answer');
    else if (j === given) b.classList.add('is-wrong');
  });
  var slot = $('slot-' + i);
  /* On a right answer — and on every answer once "Show answers" is pressed —
     the slot holds the CORRECT word, so the sentence on screen is always one
     the student can read back as true English. A wrong choice left sitting in
     the gap would be the one thing on the page teaching the collocation that
     isn't. */
  if (ok || revealOnly) {
    slot.textContent = item.options[right];
    slot.classList.remove('incorrect');
    slot.classList.add('filled', 'correct');
  } else {
    slot.classList.add('incorrect');
  }
  var fb = $('fb-' + i);
  if (!ok && !revealOnly && item.explanation) {
    fb.classList.add('show');
    fb.querySelector('.feedback-label').textContent = 'Why';
    fb.querySelector('.feedback-answer').textContent = item.explanation;
  } else if (revealOnly) {
    fb.classList.remove('show');
  }
  return ok;
}

function mark(i, revealOnly) {
  var item = allTests[currentTest].items[i];
  return MODE === 'choice' ? markChoice(item, i, revealOnly)
                           : markTransform(item, i, revealOnly);
}

function checkAnswers() {
  var test = allTests[currentTest], correct = 0;
  test.items.forEach(function (_, i) { if (mark(i, false)) correct++; });

  isChecked = true;
  var total = test.items.length;
  var percentage = Math.round(correct / total * 100);
  testScores['test' + currentTest] =
    { correct:correct, total:total, percentage:percentage, at:new Date().toISOString() };
  saveScores();
  renderTestSelector();

  $('contentContainer').insertAdjacentHTML('afterbegin',
    '<div class="score-banner"><div class="score-text">' + correct + '/' + total + '</div>' +
    '<div class="score-label">' + percentage + '% correct</div></div>');

  $('clearBtn').textContent = 'Try again';
  $('checkBtn').textContent = 'Show answers';
  $('checkBtn').onclick = showAnswers;
  scrollTop();
}

function showAnswers() {
  var test = allTests[currentTest];
  test.items.forEach(function (item, i) {
    if (MODE === 'choice') { mark(i, true); return; }
    var inp = $('in-' + i);
    if (!inp.classList.contains('incorrect')) return;
    inp.value = item.answer;
    inp.classList.remove('incorrect');
    inp.classList.add('correct');
    autoExpand(inp);
    $('fb-' + i).classList.remove('show');
  });
  $('checkBtn').disabled = true;
}

function clearAnswers() {
  var banner = document.querySelector('.score-banner');
  if (banner) banner.remove();
  Object.keys(answers).forEach(function (k) { delete answers[k]; });
  isChecked = false;
  /* Choice mode re-renders because its buttons are disabled in place;
     transform mode clears the fields it already has. Both end identical. */
  if (MODE === 'choice') {
    renderTest();
  } else {
    allTests[currentTest].items.forEach(function (_, i) {
      var inp = $('in-' + i);
      inp.value = '';
      inp.readOnly = false;
      inp.classList.remove('correct', 'incorrect', 'has-value');
      autoExpand(inp);
      $('fb-' + i).classList.remove('show');
    });
  }
  resetActions();
  updateStrip();
  scrollTop();
}

function resetActions() {
  $('clearBtn').textContent = 'Clear';
  $('checkBtn').textContent = 'Check';
  $('checkBtn').disabled = false;
  $('checkBtn').onclick = checkAnswers;
}
/* Bound ONCE, via onclick, because resetActions() reassigns checkBtn.onclick
   to showAnswers after marking. An addEventListener here as well meant a
   single tap fired checkAnswers twice — two score banners, and the second
   pass re-marking inputs that had already been judged. */
$('clearBtn').onclick = clearAnswers;

loadData();
})();
