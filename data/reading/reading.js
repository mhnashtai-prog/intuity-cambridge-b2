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
      return (j && j.cards && j.cards.length) ? j : null;
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

var T     = function () { return BANKS[bi]; };
var cards = function () { return T().cards; };

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

function paintDots() {
  var n = cards().length;
  $('tdots').innerHTML = cards().map(function (c, i) {
    var a = answers[i], cls = 'tdot';
    if (marked && a !== undefined) cls += (a === c.answer ? ' ok' : ' no');
    else if (a !== undefined) cls += ' filled';
    if (view === 'one' && i === qi) cls += ' cur';
    return '<button class="' + cls + '" type="button" data-i="' + i +
           '" aria-label="Question ' + (i + 1) + '"></button>';
  }).join('');
  $('tdots').querySelectorAll('.tdot').forEach(function (b) {
    b.onclick = function () {
      var i = +b.dataset.i;
      if (view === 'one') { qi = i; render(); return; }
      var el = $('board').querySelector('.rd-q[data-i="' + i + '"]');
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

function render() {
  var t = T(), done = Object.keys(answers).length;
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
  var n = cards().length;
  var all = cards().every(function (_, i) { return answers[i] !== undefined; });
  var one = view === 'one';
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
function closeSheet() { $('rdSheet').classList.remove('show'); }

function choose(i, k) {
  answers[i] = k;
  sfx('tick');
  closeSheet();
  render();
  /* Per question, answering moves you on: each chunk is self-contained,
     so there is no context to take away — unlike a Use of English passage,
     where the gaps lean on each other and the card waits. */
  if (view === 'one' && qi < cards().length - 1) {
    setTimeout(function () { qi++; render(); }, 280);
  }
}

/* ── MARKING ────────────────────────────────────────────────────────────
   Reading Parts 5 and 6 are worth TWO marks a question in the real exam;
   Part 7 is worth one. Scoring every part out of one makes a Reading
   percentage mean something Cambridge does not mean by it, so the weight
   comes from the config rather than being assumed. */
function submit() {
  var cs = cards();
  if (marked || !cs.every(function (_, i) { return answers[i] !== undefined; })) return;
  marked = true;
  var got = cs.filter(function (c, i) { return answers[i] === c.answer; }).length;
  var w = CFG.marksPerQuestion || 1;
  render();

  var pct = Math.round(got / cs.length * 100);
  $('ovEm').textContent    = pct === 100 ? '\uD83C\uDFC6' : pct >= 75 ? '\uD83C\uDF89' : pct >= 50 ? '\uD83D\uDC4D' : '\uD83D\uDCDA';
  $('ovTitle').textContent = pct === 100 ? 'Perfect' : pct >= 75 ? 'Strong' : pct >= 50 ? 'Getting there' : 'Keep going';
  $('ovScore').textContent = (got * w) + ' / ' + (cs.length * w) + ' marks \u00b7 ' + pct + '%';
  $('ovBars').innerHTML = cs.map(function (c, i) {
    return '<div class="ov-bar ' + (answers[i] === c.answer ? 'ok' : 'no') + '"></div>';
  }).join('');

  var missed = cs.map(function (c, i) { return { c:c, i:i }; })
                 .filter(function (o) { return answers[o.i] !== o.c.answer; });
  $('ovMiss').innerHTML = missed.length
    ? '<div class="ov-miss-h">Worth another look</div>' + missed.map(function (o) {
        return '<div class="ov-miss-i">' + String(o.i + 1).padStart(2, '0') + ' \u00b7 <s>' +
          esc(o.c.choices[answers[o.i]]) + '</s> \u2192 <b>' + esc(o.c.choices[o.c.answer]) + '</b>' +
          /* Neutral label, because half of these are glosses rather than
             quotations and "the text says" would be false for those. */
          (o.c.highlight ? '<span class="ov-miss-w">Evidence: ' + esc(o.c.highlight) + '</span>' : '') +
          '</div>';
      }).join('')
    : '';
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
$('btnNext').onclick = function () { if (qi < cards().length - 1) { qi++; render(); } };
$('prevSet').onclick = function () { if (qi > 0) { qi--; render(); } };
$('nextSet').onclick = function () { if (qi < cards().length - 1) { qi++; render(); } };
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
