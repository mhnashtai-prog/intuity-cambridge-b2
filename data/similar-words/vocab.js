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
var DATA_URL  = '/data/similar-words/' + CFG.data + '.json';
var SCORE_KEY = CFG.scoreKey;
var PER_TEST  = 5;                    /* the data's own setsPerTest */

var sets = [], tests = [], currentTest = 0, isChecked = false, scores = {};
/* answers[setIndex][lineIndex] = the chosen word, or undefined. Keyed on the
   set rather than flat, because a test holds five independent cards and a
   word used in card 2 must stay available in card 3. */
var answers = {};
var picked  = null;                   /* {set, word} — armed, awaiting a gap */

/* ── ALL / ONE ───────────────────────────────────────────────────────────
   'all'  five cards down the page
   'one'  a single card, prev/next in the action bar
   Remembered globally rather than per topic: a child who needs one card at
   a time needs it on both pages, and being asked twice is being asked once
   too often. */
/* ── SOUND BELONGS TO ONE VIEW ONLY ──────────────────────────────────────
   ALL view is a worksheet: five cards, scanned, worked at the student's own
   pace, and quite possibly on thirty tablets in one room. ONE view is the
   immersive arrangement — a single card with the whole screen — and that is
   the one that can carry sound without becoming a noise problem.

   So the speaker only appears when the view is ONE, and nothing plays in
   ALL. SFX itself is the shared module every game already uses, reading the
   same device-wide mute, so a child who silenced Forge arrives already
   silent. */
function snd(name) {
  if (view !== 'one') return;
  /* window.SFX throughout, never a bare SFX. This file runs inside a strict
     IIFE, and reaching for an undeclared global there is a ReferenceError
     rather than undefined — so on any page where the sound module failed to
     load, the FIRST tap would throw and take the whole exercise with it.
     The one thing that must never break is the lesson. */
  var S = window.SFX;
  if (S && S.isOn && S.isOn() && S[name]) { try { S[name](); } catch (e) {} }
}

var VIEW_KEY = 'intuity_vocab_view';
var view = 'all', hereCard = 0;
try { view = localStorage.getItem(VIEW_KEY) || 'all'; } catch (e) {}

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
/* ═══ THE POOL ORDER ════════════════════════════════════════════════════
   ALL SIXTY Topic Vocabulary sets were authored with the answers in order:
   word 1 into gap 1, word 2 into gap 2, straight down. Similar Words has
   none of this in 115 sets, and Academic Vocabulary none in 5, so it was
   one dataset rather than a house habit — but in that dataset it was total.

   A student who notices can score 100% on all sixty sets WITHOUT READING A
   SINGLE SENTENCE. And they will notice: it survives one card. What is left
   is a test of whether you spotted the pattern, which is not what the page
   is for and, worse, is invisible in the scores — a run of perfect results
   that means nothing.

   Fixed here rather than in the data, for three reasons. It repairs all
   sixty sets at once instead of sixty hand edits. It is immune to the next
   set anyone authors the same way. And a fresh order EVERY TIME is better
   than a fixed random one: a student who repeats a set cannot lean on where
   a word sat last time, so the second attempt tests the words again rather
   than testing the memory of a layout.

   The sentences are deliberately NOT shuffled. Their order is sometimes
   authored — a set can build — and shuffling them changes the reading for
   no gain. It is the mapping from pool to gap that has to be unguessable,
   and permuting one side is enough to break it.

   Fisher-Yates on a copy of the words, with `correct` remapped through the
   permutation, so nothing downstream can tell the difference: the pool is
   still an array of words, `correct` is still an index into it. */
function shufflePool(set) {
  var words = set.words || [], n = words.length;
  if (n < 2) return set;

  function build(order) {
    var where = [];                     /* old index → new index */
    order.forEach(function (was, now) { where[was] = now; });
    return {
      setNumber: set.setNumber,
      label: set.label,
      words: order.map(function (was) { return words[was]; }),
      sentences: (set.sentences || []).map(function (s) {
        var moved = { text: s.text, correct: where[s.correct] };
        if (s.hint) moved.hint = s.hint;
        return moved;
      })
    };
  }

  /* THE TEST IS THE OUTCOME, NOT THE PERMUTATION.
     The first version of this rejected the identity shuffle, which is the
     obvious guard and the wrong one. Sequential means "gap i is answered by
     word i" AFTER the remap, and a set that started scrambled can land there
     by luck — measured over 36,000 runs, 2.9% of them did. Rejecting the
     identity permutation cannot catch that, because the permutation was not
     the identity; the RESULT was. So the loop checks the thing that actually
     matters and rerolls until it is false. */
  function sequential(out) {
    return out.sentences.length > 1 &&
           out.sentences.every(function (s, i) { return s.correct === i; });
  }

  var order = words.map(function (_, i) { return i; }), out;
  for (var attempt = 0; attempt < 24; attempt++) {
    for (var i = n - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = order[i]; order[i] = order[j]; order[j] = t;
    }
    out = build(order);
    if (!sequential(out)) return out;
  }
  /* Twenty-four rerolls without an acceptable order is effectively
     impossible, but "effectively" is not a guarantee and this function must
     not be able to return the one arrangement it exists to prevent. A single
     rotation cannot be sequential for n > 1, so it always terminates. */
  return build(order.slice(1).concat(order[0]));
}

function loadData() {
  fetch(DATA_URL, { cache:'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (d) {
      sets = (d.sets || []).map(shufflePool);
      if (!sets.length) throw new Error('no sets in the data file');
      var per = d.setsPerTest || PER_TEST;
      for (var i = 0; i < sets.length; i += per) tests.push(sets.slice(i, i + per));
      loadScores();
      buildTabs();
      setView(view);          /* paints the toggle before the first render */
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
  /* The row scrolls sideways, so the active tab can be off screen — on test
     19 of 23 a student would arrive looking at test 1 with no sign of where
     they are. Bring it into view without moving the page itself. */
  var act = wrap.querySelector('.vtab.active');
  if (act && act.scrollIntoView) {
    try { act.scrollIntoView({ inline:'center', block:'nearest', behavior:'smooth' }); }
    catch (e) { wrap.scrollLeft = act.offsetLeft - wrap.clientWidth / 2; }
  }
}

/* ═══ THE BOARD ═════════════════════════════════════════════════════════ */
function loadTest(i) {
  if (i < 0 || i >= tests.length) return;
  currentTest = i;
  isChecked = false;
  answers = {};
  picked = null;
  hereCard = 0;
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
    ? '<h2 class="poster-head">' + esc(set.label) + '</h2>'
    : '';
  var pool = set.words.map(function (w, wi) {
    return '<button class="poster-pill word" type="button" data-s="' + si + '" data-w="' + wi +
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
        /* THE HINT. Present only where the data carries one — Academic
           Vocabulary does, Similar Words does not, and the markup simply
           does not appear on a set without them. It names the semantic
           feature that separates the right word from the seven distractors
           ("refer to something without detail" for MENTION), which is the
           one thing a synonym list can never tell you.

           Hidden until Check, deliberately. Shown before, it turns retrieval
           into recognition: the student matches a gloss to a word instead of
           reaching for it. Shown after a wrong answer, it is the correction
           doing its job — not "no", but "here is the distinction you
           missed", at the moment the student still cares. */
        (s.hint ? '<span class="hint" hidden>' + esc(s.hint) + '</span>' : '') +
      '</div></div>';
  }).join('');
  return '<div class="poster">' +
    '<div class="poster-kick"><i></i>' + esc(kick) + '</div>' + head +
    '<div class="pool">' + pool + '</div>' +
    '<div class="lines">' + lines + '</div>' +
  '</div>';
}

function setView(v) {
  view = v;
  try { localStorage.setItem(VIEW_KEY, v); } catch (e) {}
  var sb = $('sndBtn');
if (sb) sb.onclick = function () {
  if (window.SFX && window.SFX.toggle) { window.SFX.toggle(); paintSnd(); snd('tick'); }
};
document.querySelectorAll('.view-btn').forEach(function (b) {
    b.classList.toggle('active', b.dataset.view === v);
    b.setAttribute('aria-pressed', b.dataset.view === v ? 'true' : 'false');
  });
  var b = $('sndBtn');
  if (b) { b.classList.toggle('show', v === 'one'); paintSnd(); }
  render();
  updateStrip();
}

function paintSnd() {
  var b = $('sndBtn');
  if (!b) return;
  var on = !!(window.SFX && window.SFX.isOn && window.SFX.isOn());
  b.classList.toggle('on', on);
  b.setAttribute('aria-pressed', on ? 'true' : 'false');
  b.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
  b.innerHTML = on
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>';
}

function goCard(i) {
  var n = tests[currentTest].length;
  hereCard = Math.max(0, Math.min(n - 1, i));
  picked = null;
  render();
  updateStrip();
  var el = document.scrollingElement || document.body;
  try { el.scrollTo({ top:0, behavior:'smooth' }); } catch (e) { el.scrollTop = 0; }
}

function render() {
  var all = tests[currentTest];
  /* ONE view renders only the card in front of the student — not five with
     four hidden. A hidden card's inputs are still focusable and still in the
     tab order, so a keyboard user would tab straight into a card they cannot
     see. Rendering one means there is only one. */
  var solo = view === 'one' && !isChecked;
  var list = solo ? [all[hereCard]] : all;
  var base = solo ? hereCard : 0;
  /* n4 / n5 so the stylesheet can size the type by how much there is to
     read. CSS cannot count sentences; the engine can, and it is one word. */
  var n = solo ? all[hereCard].sentences.length : 0;
  $('board').className = solo ? ('board one n' + n) : 'board';
  /* The body carries it too, so the strip and the action bar can tighten
     with the card rather than each rule having to reach up through .board. */
  document.body.classList.toggle('solo', solo);
  $('board').innerHTML = list.map(function (set, k) { return cardHTML(set, base + k); }).join('');
  $('board').querySelectorAll('.word').forEach(function (b) {
    b.addEventListener('click', function () { pick(+b.dataset.s, +b.dataset.w); });
  });
  navButtons();
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
  /* Placement, not correctness — nothing is judged until Check, and a sound
     implying otherwise would be lying. `tick` is deliberately almost
     nothing: a card dealt, not an answer approved. The bowl is kept for the
     moment a card is complete. */
  var st = setAt(si);
  snd(Object.keys(answers[si]).length === st.sentences.length ? 'correct' : 'tick');
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

  var dots = $('dots'), one = view === 'one' && !isChecked;
  dots.classList.toggle('cards', one);
  if (one) {
    /* One dot per CARD. With four cards off screen, where you are in the
       test is the thing you cannot otherwise see; how many gaps are filled
       in the card in front of you is already visible in the card. */
    dots.innerHTML = tests[currentTest].map(function (set, si) {
      var filled = Object.keys(answers[si] || {}).length === set.sentences.length;
      return '<div class="dot' + (si === hereCard ? ' here' : (filled ? ' done' : '')) +
             '" role="button" tabindex="0" data-c="' + si + '" ' +
             'aria-label="Card ' + (si + 1) + '"></div>';
    }).join('');
    dots.querySelectorAll('.dot').forEach(function (el) {
      el.addEventListener('click', function () { goCard(+el.dataset.c); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goCard(+el.dataset.c); }
      });
    });
  } else {
    dots.innerHTML = tests[currentTest].map(function (set, si) {
      return set.sentences.map(function (_, li) {
        return '<div class="dot' + ((answers[si] || {})[li] ? ' answered' : '') + '"></div>';
      }).join('');
    }).join('');
  }
  navButtons();
  /* ── CHECK IS LOCKED UNTIL THE TEST IS FINISHED ──────────────────────
     It used to unlock on the FIRST answer, and Check marks the whole test —
     so one stray tap at 3/20 scored the other seventeen as wrong and wrote
     15% into the tab. A number the student did not earn and cannot read.

     `done < total`, not `done === 0`. In ONE view that means all five cards,
     which is right for the same reason: the score is the test's, so the test
     has to be done. The tally beside it already says 3/20, and the button
     says what is missing rather than just refusing. */
  var left = total - done;
  var btn = $('checkBtn');
  btn.disabled = left > 0;
  btn.title = left > 0
    ? left + (left === 1 ? ' sentence left' : ' sentences left')
    : 'Mark the test';
  btn.setAttribute('aria-label', left > 0
    ? 'Check — ' + left + ' still to answer' : 'Check your answers');
}

/* Check stays live in ONE view. A student may well finish card three and
   want to know, and forcing them through two more cards first is the page
   deciding when they are ready. Checking marks the whole test and drops
   back to ALL, so every answer is on screen with its correction. */
function navButtons() {
  var prev = $('prevBtn'), next = $('nextBtn');
  if (!prev || !next) return;
  var on = view === 'one' && !isChecked;
  prev.hidden = next.hidden = !on;
  if (!on) return;
  prev.disabled = hereCard === 0;
  next.disabled = hereCard === tests[currentTest].length - 1;
  next.textContent = 'Card ' + (hereCard + 2 > tests[currentTest].length ? '' : hereCard + 2) + ' →';
  if (next.disabled) next.textContent = 'Next →';
}

/* ═══ MARKING ═══════════════════════════════════════════════════════════ */
function checkAnswers() {
  /* Belt and braces. The button is disabled above, but this is the function
     that writes a permanent score, and it should not depend on a class
     somewhere else having been applied correctly. */
  var filled = 0, want = 0;
  tests[currentTest].forEach(function (set, si) {
    want += set.sentences.length;
    filled += Object.keys(answers[si] || {}).length;
  });
  if (filled < want || isChecked) return;

  var correct = 0, total = 0;
  /* ORDER MATTERS. Marking always shows the WHOLE test, so in ONE view the
     board has to be re-rendered back to five cards BEFORE the marks are
     written into it — otherwise the list holds the single visible card and
     marking card two writes into nothing. A score of 14/20 with sixteen
     answers behind a Next button is a number without its reasons. */
  isChecked = true;
  render();
  var cards = $('board').querySelectorAll('.poster');
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
      var line = slot.parentElement;
      if (!ok) {
        var a = line.querySelector('.answer');
        a.textContent = want;
        a.hidden = false;
      }
      /* The hint is revealed on a miss only. After a correct answer it would
         be an explanation of something the student has just demonstrated
         they did not need, and every line carrying one flattens the page
         back into a wall of glosses. */
      var h = line.querySelector('.hint');
      if (h && !ok) h.hidden = false;
    });
  });
  paint();
  updateStrip();

  var pct = Math.round(correct / total * 100);
  /* fanfare only for a clean test — three bowls a fifth apart, the same
     instrument as a single right answer, so a milestone sounds like more of
     the same thing rather than a different game. Otherwise the low, brief
     note: a wrong answer should be heard, not punished. */
  snd(correct === total ? 'fanfare' : (correct >= total / 2 ? 'correct' : 'wrong'));

  scores['test' + currentTest] = { correct:correct, total:total, percentage:pct,
                                   at:new Date().toISOString() };
  saveScores();
  buildTabs();

  /* `clean` is the only distinction drawn. A child on 18/20 should not be
     shown a diminished version of a celebration they can see they missed —
     they get the same arrival, and the caramel rule is what perfect adds. */
  $('board').insertAdjacentHTML('afterbegin',
    '<div class="score-banner' + (correct === total ? ' clean' : '') + '">' +
    '<div class="score-text" id="scoreText">0/' + total + '</div>' +
    '<div class="score-label">' + pct + '% correct</div></div>');
  countUp($('scoreText'), correct, total);

  $('clearBtn').textContent = 'Try again';
  $('checkBtn').disabled = true;
  var el = document.scrollingElement || document.body;
  try { el.scrollTo({ top:0, behavior:'smooth' }); } catch (e) { el.scrollTop = 0; }
}

/* ── THE COUNT RUNS UP ───────────────────────────────────────────────────
   Not decoration: a number that climbs is a number you watch, and watching
   it is the half-second in which finishing registers as having happened.
   Fast — 620ms, eased out — because it must not become something to sit
   through on the twentieth test.

   Stepped by FRAME rather than by integer, so 4/20 and 19/20 take the same
   time. Counting one per tick would make a low score flash past and a high
   one drag, which is exactly backwards. */
function countUp(el, to, total) {
  if (!el) return;
  /* window-qualified, like window.SFX above and for the same reason: a bare
     global inside this strict IIFE is a ReferenceError on any host that
     lacks it, and the thing it would take down is the score the student
     just earned. */
  var mm = window.matchMedia;
  var still = mm && mm('(prefers-reduced-motion: reduce)').matches;
  if (still || to === 0) { el.textContent = to + '/' + total; return; }
  var t0 = null, DUR = 620;
  function step(ts) {
    if (t0 === null) t0 = ts;
    var k = Math.min(1, (ts - t0) / DUR);
    el.textContent = Math.round((1 - Math.pow(1 - k, 3)) * to) + '/' + total;
    if (k < 1) window.requestAnimationFrame(step); else el.textContent = to + '/' + total;
  }
  if (!window.requestAnimationFrame) { el.textContent = to + '/' + total; return; }
  window.requestAnimationFrame(step);
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
$('prevBtn').onclick  = function () { goCard(hereCard - 1); };
$('nextBtn').onclick  = function () { goCard(hereCard + 1); };
document.querySelectorAll('.view-btn').forEach(function (b) {
  b.addEventListener('click', function () { if (view !== b.dataset.view) setView(b.dataset.view); });
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && picked) { picked = null; paint(); }
});

loadData();
})();
