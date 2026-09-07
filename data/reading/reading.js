/* ═══════════════════════════════════════════════════════════════════════
   READING — THE ENGINE

   A page is a shell plus a config object, the pattern vocab.js set for the
   vocabulary trio and mc.js took up for Use of English:

     window.RD = { part:5, texts:10, path:n => '…/multiple-choice' + n + '.json' };

   PART 5 TODAY. The shape is meant to take Parts 6 and 7 as well: the
   header, the rows, the dots, the modal and the marking are the same job
   on different nouns, exactly as they were across the four Use of English
   parts. What differs is what an OPTION is, and that is one function.

   THE DATA
   Each file is { title, subtitle, cards[] } and a card is
   { text, question, choices[4], answer, highlight }. The text is a chunk
   of the passage; `highlight` is the sentence that PROVES the answer, and
   it is present on all 76 cards across the ten texts. Nothing else in this
   product carries evidence like that.

   TWO VIEWS
     Per question   one chunk, one question — the default, because on a
                    phone this is the only readable form
     Full text      the chunks joined into the passage, questions below —
                    harder, and closer to what Cambridge actually sets,
                    where finding the evidence IS the skill

   Marking reveals the highlight inside the chunk. Before marking it would
   simply be the answer.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var CFG = window.RD || {};

/* ── TWO SHAPES, ONE ENGINE ──────────────────────────────────────────────
   'mc'  Part 5 — chunks, each with its own question and four choices
   'gap' Part 6 — ONE text with six gaps and SEVEN sentences

   The difference is not cosmetic. In Part 5 each question carries its own
   private options, so answering one tells you nothing about the next. In
   Part 6 the seven sentences are a CLOSED SET shared by six gaps: place
   one and it is gone, the field narrows, and elimination is a real
   strategy. That is most of what Part 6 tests, and it is why the old data
   — four private choices per gap — had to be replaced rather than styled.

   Everything above the card is identical either way: the header, the
   rows, the dots, the toggle, the bar, the overlay, the marking. Three
   functions ask which shape they are in, and nothing else does. */
var GAPPED = CFG.kind === 'gap';
var MATCH  = CFG.kind === 'match';

/* ── PART 7: WHY THIS ONE HAS NO MODAL ───────────────────────────────────
   The container follows the length of the option, and Part 7's options are
   the shortest in the product: a single letter, four to six of them.
   Measured across seven texts, the statements run to a median of 83
   characters and the sections to 366.

   So the letters go INLINE, in a row under the statement. A tooltip would
   cost a tap to open and a tap to choose where the row costs one, and a
   modal would hide the statement you are answering. Part 5 gets a modal
   because its options are whole sentences; Part 6 gets one because its
   sentences run to 133 characters. Part 7 needs neither, and giving it one
   for consistency would be consistency in the wrong place. */
var BANKS = [];   /* one per text; null where a file is missing */
var bi = 0;       /* which text */
var qi = 0;       /* which question, in the per-question view */
var answers = {}; /* question index -> option index */
var marked = false;
var view = 'one'; /* 'one' | 'full' */

function $(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}
function sfx(n) { try { if (window.SFX && SFX[n]) SFX[n](); } catch (e) {} }
var LETTER = ['A','B','C','D','E','F'];

/* ── LOADING ────────────────────────────────────────────────────────────
   Every text is asked for at once. A miss is not an error — it is a text
   that has not been written — so its tab arrives disabled rather than
   absent, and the row still says how long the ladder is. */
var wanted = [];
for (var n = 1; n <= (CFG.texts || 10); n++) wanted.push(n);

Promise.all(wanted.map(function (n) {
  return fetch(CFG.path(n), { cache:'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j) return null;
      if (GAPPED) return (j.text && j.sentences && j.answers) ? j : null;
      if (MATCH)  return (j.sections && j.questions && j.questions.length) ? j : null;
      return (j.cards && j.cards.length) ? j : null;
    })
    .catch(function () { return null; });
})).then(function (list) {
  BANKS = list;
  var first = BANKS.findIndex(function (b) { return b; });
  if (first < 0) throw new Error('no texts available');
  paintTexts();
  openText(first);
}).catch(function (err) {
  $('board').innerHTML = '<div class="loading">Couldn\u2019t load ('
    + esc(err.message) + ').</div>';
});

var T = function () { return BANKS[bi]; };

/* ONE OF THE THREE. A unit is what the dots count and what the paged view
   shows one of: a question card in Part 5, a gap in Part 6. */
function count() {
  if (GAPPED) return T().answers.length;
  if (MATCH)  return T().questions.length;
  return T().cards.length;
}
/* The section letters, in the order the paper prints them. */
function letters() { return Object.keys(T().sections || {}); }
function cards() { return T().cards || []; }

/* Which paragraph holds gap n. Read from the text rather than assumed, so
   a paragraph may hold any gaps in any arrangement. */
function paraOf(n) {
  var t = T().text || [];
  for (var i = 0; i < t.length; i++) {
    if (String(t[i]).indexOf('{' + n + '}') > -1) return i;
  }
  return 0;
}
/* Which sentences are already spent. A sentence placed at gap 3 is gone
   for gaps 4-6 — that is the whole exercise, so the bank has to say so. */
function usedBy(gap) {
  var out = {};
  for (var k in answers) if (+k !== gap) out[answers[k]] = true;
  return out;
}

/* ── THE ROWS ───────────────────────────────────────────────────────────
   Three levels of choice, three controls, one home each: which part
   (header links, in the page), which text (set-tabs), which question (the
   dots between the arrows). The view toggle is the fourth, and it asks a
   different question — how much of one text is on screen. */
function paintTexts() {
  $('setTabs').innerHTML = BANKS.map(function (b, i) {
    return '<button class="vtab' + (i === bi ? ' active' : '') + '" type="button" data-i="' + i + '"'
      + (b ? '' : ' disabled aria-disabled="true" title="Not written yet"') + '>'
      + 'Text ' + (i + 1) + '</button>';
  }).join('');
  $('setTabs').querySelectorAll('.vtab').forEach(function (b) {
    b.onclick = function () { if (!b.disabled && +b.dataset.i !== bi) openText(+b.dataset.i); };
  });
  syncHeader();
}

function openText(i) {
  if (!BANKS[i]) return;
  bi = i; qi = 0; answers = {}; marked = false;
  paintTexts(); render();
}

function rightFor(i) {
  if (GAPPED) return T().answers[i];
  /* Part 7 stores the answer as a LETTER, not an index — the sections are
     keyed by letter and so is the key. Compared as given, rather than
     converted, so nothing depends on the order of Object.keys. */
  if (MATCH)  return T().questions[i].answer;
  return cards()[i].answer;
}

function paintDots() {
  var n = count();
  var list = [];
  for (var k = 0; k < n; k++) list.push(k);
  $('tdots').innerHTML = list.map(function (i) {
    var a = answers[i], cls = 'tdot';
    if (marked && a !== undefined) cls += (a === rightFor(i) ? ' ok' : ' no');
    else if (a !== undefined) cls += ' filled';
    if (view === 'one' && i === qi) cls += ' cur';
    return '<button class="' + cls + '" type="button" data-i="' + i +
           '" aria-label="' + (GAPPED ? 'Gap ' : 'Question ') + (i + 1) + '"></button>';
  }).join('');
  $('tdots').querySelectorAll('.tdot').forEach(function (b) {
    b.onclick = function () {
      var i = +b.dataset.i;
      if (MATCH) {
        var st = $('board').querySelector('.rd-st[data-i="' + i + '"]');
        if (st) st.scrollIntoView({ behavior:'smooth', block:'center' });
        return;
      }
      if (view === 'one') { qi = i; render(); return; }
      var sel = GAPPED ? '.rd-gap[data-i="' + i + '"]' : '.rd-q[data-i="' + i + '"]';
      var el = $('board').querySelector(sel);
      if (el) el.scrollIntoView({ behavior:'smooth', block:'center' });
    };
  });
  $('prevSet').disabled = view !== 'one' || qi === 0;
  $('nextSet').disabled = view !== 'one' || qi === n - 1;
}

/* ── THE CARD ───────────────────────────────────────────────────────────*/
function passageHTML(card, i) {
  var t = esc(card.text);
  /* THE EVIDENCE, AND WHAT IT ACTUALLY IS.
     `highlight` is present on all 75 cards, but it is not one thing:
     measured across the ten texts, 39 are a literal quote from the chunk
     and 36 are a GLOSS — "admits he might have regrets in the future",
     "It didn't suit his personality". Roughly half and half.

     So the mark in the passage is attempted and not assumed. Where the
     string is found it is highlighted; where it is a gloss nothing is
     drawn, and the line survives to the review card instead, which reads
     it as a reason rather than a quotation. Better a missing mark than a
     mangled passage — and better than pretending a paraphrase is a
     sentence in the text. */
  if (marked && card.highlight) {
    var h = esc(card.highlight);
    if (t.indexOf(h) > -1) t = t.split(h).join('<span class="rd-evi">' + h + '</span>');
  }
  return '<div class="rd-passage"><p>' + t + '</p></div>';
}

function slotHTML(card, i) {
  var a = answers[i], has = a !== undefined;
  var ok = marked && has && a === card.answer;
  var bad = marked && has && !ok;
  var body = has
    ? '<span class="let">' + LETTER[a] + '</span><span>' + esc(card.choices[a]) + '</span>'
    : '<span class="let">?</span><span>Choose an answer</span>';
  return '<button class="rd-slot' + (has ? ' filled' : '') + (ok ? ' ok' : '') +
         (bad ? ' no' : '') + '" type="button" data-i="' + i + '"' +
         (marked ? ' disabled' : '') + '>' + body + '</button>' +
         (bad ? '<div class="rd-fix"><span class="let">' + LETTER[card.answer] +
                '</span><span>' + esc(card.choices[card.answer]) + '</span></div>' : '');
}

function questionHTML(card, i) {
  return '<div class="rd-q" data-i="' + i + '">' +
    '<div class="rd-qn">Question ' + (i + 1) + ' of ' + cards().length + '</div>' +
    '<div class="rd-qt">' + esc(card.question) + '</div>' +
    slotHTML(card, i) + '</div>';
}

/* ── THE GAP ───────────────────────────────────────────────────────────
   The same pill every gap in this product wears, with the number inside
   it — but wide, because what lands in it is a whole sentence rather than
   a word. Empty it shows its number and invites; filled it shows the
   sentence you placed. */
/* ── THE GAP, AS THE PAPER PRINTS IT ─────────────────────────────────────
   Cambridge sets a Part 6 gap as a SHORT numbered box on its own line:
   a rule running across the column with the question number in a small
   shaded square at the left. It is deliberately not the width of a
   sentence — the box marks the JOIN between two paragraphs, and a wide
   bar saying "Choose a sentence" made it look like a field to fill in
   rather than a seam to close.

   So empty, the gap is that box: number, short rule, nothing else.
   Filled, it opens out to show the sentence you placed, because at that
   point you need to read the paragraph back and hear whether it works —
   which is the only way to check a Part 6 answer. Two states, two
   shapes, and the empty one matches the printed paper. */
function gapHTML(i) {
  var a = answers[i], has = a !== undefined;
  var ok = marked && has && a === T().answers[i];
  var bad = marked && has && !ok;
  var cls = 'rd-gap' + (has ? ' filled' : ' empty') + (ok ? ' ok' : '') + (bad ? ' no' : '');
  var inner = '<span class="let">' + (i + 1) + '</span>' +
              (has ? '<span class="sen">' + esc(T().sentences[a]) + '</span>'
                   : '<span class="rule"></span>');
  return '<button class="' + cls + '" type="button" data-i="' + i + '"' +
    (marked ? ' disabled' : '') + '>' + inner + '</button>' +
    (bad ? '<div class="rd-fix"><span class="let">' + (i + 1) + '</span><span>' +
           esc(T().sentences[T().answers[i]]) + '</span></div>' : '');
}

function gappedHTML() {
  var t = T();
  var paras = view === 'full' ? t.text : [t.text[paraOf(qi + 1)]];
  return paras.map(function (p) {
    return '<p>' + esc(p).replace(/\{(\d+)\}/g, function (_, n) {
      n = +n;
      /* {0} IS THE WORKED EXAMPLE, not a gap.
         The schema numbers the example 0 and the gaps 1-6, exactly as the
         paper prints them — so the placeholders run 0…6 while `answers`
         has six entries. Without this branch {0} resolved to gapHTML(-1),
         which is answers[-1]: no gap, no letter, and a broken card on the
         opening paragraph of every text.

         Rendered filled and inert, like the example in Part 1: it is the
         paper's answer, not a slot you could have filled. */
      if (n === 0) {
        var ex = t.example;
        if (!ex) return '';
        return '<span class="rd-eg">' + esc(t.sentences[ex.sentence]) + '</span>';
      }
      return gapHTML(n - 1);
    }) + '</p>';
  }).join('');
}

/* ── PART 7 ──────────────────────────────────────────────────────────── */
function statementHTML(q, i) {
  var a = answers[i], has = a !== undefined;
  var ok = marked && has && a === rightFor(i);
  var bad = marked && has && !ok;
  return '<div class="rd-st" data-i="' + i + '">' +
    '<div class="rd-st-n">' + (q.number != null ? q.number : (i + 1)) + '</div>' +
    '<div class="rd-st-q">' + esc(q.question) + '</div>' +
    '<div class="rd-picks">' + letters().map(function (L) {
      var cls = 'rd-pick' + (a === L ? ' chosen' : '');
      if (marked && a === L) cls += ok ? ' ok' : ' no';
      if (marked && !ok && L === rightFor(i)) cls += ' key';
      return '<button class="' + cls + '" type="button" data-i="' + i +
             '" data-l="' + L + '"' + (marked ? ' disabled' : '') + '>' + L + '</button>';
    }).join('') + '</div>' +
    (bad ? '<div class="rd-st-fix">The answer is ' + esc(rightFor(i)) + '</div>' : '') +
  '</div>';
}

function sectionsHTML() {
  var t = T();
  return letters().map(function (L) {
    return '<div class="rd-sec">' +
      '<div class="rd-sec-l">' + L + '</div>' +
      '<div class="rd-sec-t">' + esc(t.sections[L]) + '</div>' +
    '</div>';
  }).join('');
}

function render() {
  var t = T(), done = Object.keys(answers).length;

  if (MATCH) {
    var head = '<div class="mc-kick">Part ' + esc(CFG.part) + ' &middot; ' +
      esc(t.title || ('Text ' + (bi + 1))) +
      '<span class="right">' + done + ' / ' + count() + ' matched</span></div>';
    /* SECTIONS FIRST BY DEFAULT is wrong for this part. In Part 7 the
       sections are reference — you skim them, then work the statements and
       go back. So the statements are the default view and the sections are
       one tap away, rather than 1,500 characters you must scroll past
       before reaching anything to do. */
    $('board').innerHTML = view === 'full'
      ? '<div class="mc-card">' + head +
        '<div class="rd-title">' + esc(t.title || '') + '</div>' +
        (t.subtitle ? '<div class="rd-sub">' + esc(t.subtitle) + '</div>' : '') +
        sectionsHTML() + '</div>'
      : '<div class="mc-card">' + head +
        t.questions.map(statementHTML).join('') + '</div>';

    $('board').querySelectorAll('.rd-pick:not([disabled])').forEach(function (b) {
      b.addEventListener('click', function () { choose(+b.dataset.i, b.dataset.l); });
    });
    paintDots(); paintBar();
    return;
  }

  if (GAPPED) {
    var head = '<div class="mc-kick">Part ' + esc(CFG.part) + ' &middot; ' +
      esc(t.title || ('Text ' + (bi + 1))) +
      '<span class="right">' + done + ' / ' + count() + ' placed</span></div>';
    $('board').innerHTML = '<div class="mc-card">' + head +
      (view === 'full'
        ? '<div class="rd-title">' + esc(t.title || '') + '</div>' +
          (t.subtitle ? '<div class="rd-sub">' + esc(t.subtitle) + '</div>' : '')
        : '') +
      '<div class="rd-passage">' + gappedHTML() + '</div></div>';
    $('board').querySelectorAll('.rd-gap:not([disabled])').forEach(function (b) {
      b.addEventListener('click', function () { openBank(+b.dataset.i); });
    });
    paintDots(); paintBar();
    return;
  }
  var head = '<div class="mc-kick">Part ' + esc(CFG.part) + ' &middot; ' +
    esc(t.title || ('Text ' + (bi + 1))) +
    '<span class="right">' + done + ' / ' + cards().length + ' answered</span></div>';

  if (view === 'one') {
    var c = cards()[qi];
    $('board').innerHTML = '<div class="mc-card">' + head +
      passageHTML(c, qi) + questionHTML(c, qi) + '</div>';
  } else {
    /* Full text: the chunks ARE the passage — joined, they are the text
       Cambridge prints. No extra data needed, which is why this view costs
       nothing to offer. */
    $('board').innerHTML = '<div class="mc-card">' + head +
      '<div class="rd-title">' + esc(t.title || '') + '</div>' +
      (t.subtitle ? '<div class="rd-sub">' + esc(t.subtitle) + '</div>' : '') +
      '<div class="rd-passage">' +
        cards().map(function (c, i) {
          var p = passageHTML(c, i);
          return p.replace('<div class="rd-passage">', '').replace('</div>', '');
        }).join('') +
      '</div></div>' +
      '<div class="mc-card" style="margin-top:1.1rem">' +
        '<div class="mc-kick">The questions</div>' +
        cards().map(questionHTML).join('') +
      '</div>';
  }

  $('board').querySelectorAll('.rd-slot:not([disabled])').forEach(function (b) {
    b.addEventListener('click', function () { openSheet(+b.dataset.i); });
  });
  paintDots(); paintBar();
}

function paintBar() {
  var n = count();
  var all = true;
  for (var z = 0; z < n; z++) if (answers[z] === undefined) all = false;
  var one = view === 'one' && !MATCH;
  ['btnPrev','btnNext'].forEach(function (id) { $(id).style.display = one ? '' : 'none'; });
  $('btnPrev').disabled = qi === 0;
  $('btnNext').disabled = qi === n - 1;
  var left = n - Object.keys(answers).length;
  $('btnSubmit').disabled = !all || marked;
  $('btnSubmit').textContent = marked ? 'Marked'
    : (left > 0 ? 'Submit \u2014 ' + left + ' to go' : 'Submit');
}

/* ── THE CHOICE CARD ────────────────────────────────────────────────────
   A modal rather than a tooltip, and the reason is measured: a Part 5
   option is a whole sentence — median 39 characters, longest 58 — where a
   Use of English option is one word. Four of these will not sit beside a
   gap on a phone. Part 7's options are single letters and go back to the
   tooltip. The container follows the length of the option. */
function openSheet(i) {
  if (marked) return;
  var c = cards()[i];
  $('rdKick').textContent = 'Question ' + (i + 1);
  $('rdQ').textContent = c.question;
  $('rdOpts').innerHTML = c.choices.map(function (o, k) {
    return '<button class="rd-opt' + (answers[i] === k ? ' chosen' : '') +
      '" type="button" data-k="' + k + '"><span class="let">' + LETTER[k] +
      '</span><span>' + esc(o) + '</span></button>';
  }).join('');
  $('rdOpts').querySelectorAll('.rd-opt').forEach(function (b) {
    b.onclick = function () { choose(i, +b.dataset.k); };
  });
  $('rdSheet').classList.add('show');
}
/* ── THE SENTENCE BANK ───────────────────────────────────────────────────
   Part 6's options are the longest in the product: median 82 characters,
   longest 133. So a modal, for the same measured reason as Part 5 — four
   of those will not sit beside a gap on a phone, let alone seven.

   What it borrows from Similar Words is the BEHAVIOUR, not the layout. A
   sentence already placed at another gap is struck through and left in
   position, never removed. Removing it would reflow the list under the
   thumb and, worse, would hide the thing the student is meant to be
   doing: counting what is left. Elimination is half of Part 6, and it
   only works if the field is visibly narrowing.

   The distractor is the seventh sentence and is never anyone's answer.
   Nothing in this card says which one it is — finding that out by
   exhausting the others is the exercise. */
function openBank(i) {
  if (marked) return;
  var t = T(), spent = usedBy(i);
  /* The example's sentence is spent before the student starts — it is
     already printed in the passage, and offering it would make one of the
     eight a free elimination. */
  if (t.example) spent[t.example.sentence] = true;
  $('rdKick').textContent = 'Gap ' + (i + 1);
  $('rdQ').textContent = 'Which sentence fits?';
  $('rdOpts').innerHTML = t.sentences.map(function (sen, k) {
    var used = !!spent[k];
    return '<button class="rd-opt' + (answers[i] === k ? ' chosen' : '') +
      (used ? ' used' : '') + '" type="button" data-k="' + k + '"' +
      (used ? ' disabled' : '') + '>' +
      '<span class="let">' + LETTER[k] + '</span><span>' + esc(sen) + '</span></button>';
  }).join('');
  $('rdOpts').querySelectorAll('.rd-opt:not([disabled])').forEach(function (b) {
    b.onclick = function () { choose(i, +b.dataset.k); };
  });
  $('rdSheet').classList.add('show');
}

function closeSheet() { $('rdSheet').classList.remove('show'); }

function choose(i, k) {
  /* Part 7 letters are NOT a closed set: a section can answer several
     statements, and often does. So no sentence is displaced, and nothing
     is struck through. Only Part 6 has a closed set. */
  if (GAPPED) {
    for (var g in answers) if (answers[g] === k) delete answers[g];
  }
  answers[i] = k;
  sfx('tick');
  closeSheet();
  render();
  /* Part 7 shows every statement at once, so there is nothing to advance
     to — moving the page under a student who is working down a list would
     lose their place. */
  if (MATCH) return;
  /* Per question, answering moves you on: each chunk is self-contained,
     so there is no context to take away — unlike a Use of English passage,
     where the gaps lean on each other and the card waits. */
  if (view === 'one' && qi < count() - 1) {
    setTimeout(function () { qi++; render(); }, 280);
  }
}

/* ── MARKING ────────────────────────────────────────────────────────────
   Reading Parts 5 and 6 are worth TWO marks a question in the real exam;
   Part 7 is worth one. Scoring every part out of one makes a Reading
   percentage mean something Cambridge does not mean by it, so the weight
   comes from the config rather than being assumed. */
function submit() {
  var n = count();
  var idx = []; for (var z = 0; z < n; z++) idx.push(z);
  if (marked || !idx.every(function (i) { return answers[i] !== undefined; })) return;
  marked = true;
  var got = idx.filter(function (i) { return answers[i] === rightFor(i); }).length;
  var w = CFG.marksPerQuestion || 1;
  render();

  var pct = Math.round(got / n * 100);
  $('ovEm').textContent    = pct === 100 ? '\uD83C\uDFC6' : pct >= 75 ? '\uD83C\uDF89' : pct >= 50 ? '\uD83D\uDC4D' : '\uD83D\uDCDA';
  $('ovTitle').textContent = pct === 100 ? 'Perfect' : pct >= 75 ? 'Strong' : pct >= 50 ? 'Getting there' : 'Keep going';
  $('ovScore').textContent = (got * w) + ' / ' + (n * w) + ' marks \u00b7 ' + pct + '%';
  $('ovBars').innerHTML = idx.map(function (i) {
    return '<div class="ov-bar ' + (answers[i] === rightFor(i) ? 'ok' : 'no') + '"></div>';
  }).join('');

  var missed = idx.filter(function (i) { return answers[i] !== rightFor(i); });
  if (MATCH) {
    $('ovMiss').innerHTML = missed.length
      ? '<div class="ov-miss-h">Worth another look</div>' + missed.map(function (i) {
          var q = T().questions[i];
          return '<div class="ov-miss-i">' + (q.number != null ? q.number : i + 1) +
            ' \u00b7 <s>' + esc(answers[i]) + '</s> \u2192 <b>' + esc(rightFor(i)) + '</b>' +
            '<span class="ov-miss-w">' + esc(q.question) + '</span></div>';
        }).join('')
      : '';
  }
  var opts = function (i) { return GAPPED ? T().sentences : cards()[i].choices; };
  if (MATCH) { finishScore(got, n, pct); return; }
  $('ovMiss').innerHTML = missed.length
    ? '<div class="ov-miss-h">Worth another look</div>' + missed.map(function (i) {
        var o = { i:i, c: GAPPED ? {} : cards()[i] };
        return '<div class="ov-miss-i">' + String(i + 1).padStart(2, '0') + ' \u00b7 <s>' +
          esc(opts(i)[answers[i]]) + '</s> \u2192 <b>' + esc(opts(i)[rightFor(i)]) + '</b>' +
          /* Neutral label, because half of these are glosses rather than
             quotations and "the text says" would be false for those. */
          (o.c.highlight ? '<span class="ov-miss-w">Evidence: ' + esc(o.c.highlight) + '</span>' : '') +
          '</div>';
      }).join('')
    : '';
  finishScore(got, n, pct);
}

/* The last three lines of submit(), shared — MATCH writes its own review
   list and then needs exactly this. */
function finishScore(got, n, pct) {
  saveScore(pct);
  sfx(pct === 100 ? 'fanfare' : 'bowlLow');
  $('ov').classList.add('show');
}

function saveScore(pct) {
  if (!CFG.scoreKey) return;
  try {
    var all = JSON.parse(localStorage.getItem(CFG.scoreKey) || '{}');
    all[bi] = pct;
    localStorage.setItem(CFG.scoreKey, JSON.stringify(all));
  } catch (e) {}
}

/* ── WIRING ─────────────────────────────────────────────────────────── */
$('btnSubmit').onclick = submit;
$('btnPrev').onclick = function () { if (qi > 0) { qi--; render(); } };
$('btnNext').onclick = function () { if (qi < count() - 1) { qi++; render(); } };
$('prevSet').onclick = function () { if (qi > 0) { qi--; render(); } };
$('nextSet').onclick = function () { if (qi < count() - 1) { qi++; render(); } };
$('rdClose').onclick = closeSheet;
$('rdSheet').addEventListener('click', function (e) { if (e.target === $('rdSheet')) closeSheet(); });
addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });

$('ovClose').onclick = function () { $('ov').classList.remove('show'); };
$('ovAgain').onclick = function () {
  $('ov').classList.remove('show'); answers = {}; marked = false; qi = 0; render();
};
$('ovNext').onclick = function () {
  $('ov').classList.remove('show');
  var next = BANKS.findIndex(function (b, i) { return b && i > bi; });
  openText(next > -1 ? next : BANKS.findIndex(function (b) { return b; }));
};

document.querySelectorAll('.viewbtn').forEach(function (b) {
  b.onclick = function () {
    if (b.classList.contains('active')) return;
    document.querySelectorAll('.viewbtn').forEach(function (x) { x.classList.remove('active'); });
    b.classList.add('active');
    view = b.dataset.view; qi = 0; closeSheet(); render();
    try { window.scrollTo({ top:0, behavior:'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  };
});

(function () {
  var b = $('mute'); if (!b) return;
  function paint() {
    var on = !window.SFX || SFX.isOn();
    b.textContent = on ? '\uD83D\uDD0A' : '\uD83D\uDD07';
    b.classList.toggle('off', !on);
  }
  b.onclick = function () { if (window.SFX) SFX.toggle(); paint(); };
  paint();
})();

function syncHeader() {
  var h = document.querySelector('.header');
  if (h) document.documentElement.style.setProperty('--header-h', h.offsetHeight + 'px');
}
addEventListener('resize', syncHeader);
addEventListener('orientationchange', function () { setTimeout(syncHeader, 120); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeader);
if (window.ResizeObserver) {
  var hh = document.querySelector('.header');
  if (hh) new ResizeObserver(syncHeader).observe(hh);
}
syncHeader();
})();
