/* ═══════════════════════════════════════════════════════════════════════
   PART 1 · MULTIPLE CHOICE — THE ENGINE

   One file behind both pages, on the pattern vocab.js already set for the
   vocabulary trio: a page is a shell plus a config object, and everything
   else is here.

     multiple-choice.html         window.MC = { mode:'sentences', … }
     multiple-choice-texts.html   window.MC = { mode:'texts', … }

   WHY ONE ENGINE AND TWO PAGES, WHICH IS NOT A CONTRADICTION
   The two exercises differ in exactly one place: what a unit is. A set is
   eight independent sentences; a passage is one piece of writing whose
   gaps lean on each other. Everything else — the banks, the tests, the
   tooltip, the marking, the overlay — is the same job on different nouns.

   So the DATA stays in two shapes and two files, because a renderer that
   branches on shape at every step is where the bugs were. But the parts
   that never differ live here once. Below, exactly three functions ask
   which mode they are in: units(), cardHTML() and advance(). Nothing else
   in this file knows.

   THE POOL AND THE TOOLTIP
   Similar Words puts its five words in a pool above the card, because
   there the words ARE a closed set — each used once, so elimination is a
   real strategy and a leftover word is a signal. Multiple choice is the
   opposite: four options at gap 3 have nothing to do with the four at gap
   4, the same word can be right twice, and elimination buys nothing. A
   pool of 32 words above a passage would be unreadable AND would falsely
   imply they were a set. So the options arrive at the gap, in a tooltip,
   and the gap stays editable until Submit.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var CFG = window.MC || {};
var TEXTS = CFG.mode === 'texts';

var BANKS = [];    /* one per dataset; null where a file is not written yet */
var bi = 0;        /* which dataset  — a bank of sets, or a gap density */
var DOC = null;    /* the file in play, when it carries page-level fields */
var TESTS = [];    /* its tests — sets of sentences, or texts */
var si = 0;        /* which test */
var qi = 0;        /* which unit, in the paged view: sentence or paragraph */
var answers = {};  /* key -> answer. Sentences key by index and store a
                      LETTER; texts key by gap number and store an option
                      index. Nothing outside the two renderers reads it,
                      so the two shapes never meet. */
var marked = false;
var view = 'full';

function $(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}
function sfx(n) { try { if (window.SFX && SFX[n]) SFX[n](); } catch (e) {} }
var LETTER = ['A','B','C','D'];

/* ── LOADING ────────────────────────────────────────────────────────────
   Every dataset is asked for at once and a miss is not an error — it is a
   density, or a bank, that has not been written yet. `null` means exactly
   that, and the tab arrives disabled rather than absent: a dead tab reading
   "12 gaps" tells a student the ladder exists and where they are on it. */
Promise.all((CFG.datasets || []).map(function (d) {
  return fetch(d.path, { cache:'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { return j ? adopt(j) : null; })
    .catch(function () { return null; });
})).then(function (list) {
  BANKS = list;
  var first = BANKS.findIndex(function (b) { return b; });
  if (first < 0) throw new Error('nothing available yet');
  paintBanks();
  loadBank(first);
}).catch(function (err) {
  $('board').innerHTML = '<div class="loading">Couldn\u2019t load ('
    + esc(err.message) + ').</div>';
});

/* The one place a file's own shape is read. After this, a bank is just
   {doc, tests} and the rest of the engine is shape-blind. */
function adopt(j) {
  if (TEXTS) {
    var t = (j.tests || []).filter(function (x) {
      return x.text && x.text.length && x.questions && x.questions.length;
    });
    return t.length ? { doc:j, tests:t } : null;
  }
  var s = (j.sets || []).filter(function (x) { return x.sentences && x.sentences.length; })
                        .map(function (x) { return { items:x.sentences }; });
  return s.length ? { doc:j, tests:s } : null;
}

function loadBank(i) {
  if (!BANKS[i]) return;
  bi = i; DOC = BANKS[i].doc; TESTS = BANKS[i].tests;
  paintBanks(); loadTest(0);
}
function loadTest(i) {
  si = (i + TESTS.length) % TESTS.length;
  qi = 0; answers = {}; marked = false;
  paintTests(); render();
}
var T = function () { return TESTS[si]; };

/* ── THE ROWS ───────────────────────────────────────────────────────────
   Four levels of choice, four controls, one home each: which exercise
   (header links, in the page), which bank or density (set-tabs), which
   test (the dots), how much of it (the view toggle). */
function paintBanks() {
  $('setTabs').innerHTML = (CFG.datasets || []).map(function (d, i) {
    var ready = !!BANKS[i];
    return '<button class="vtab' + (i === bi ? ' active' : '') + '" type="button" data-i="' + i + '"'
      + (ready ? '' : ' disabled aria-disabled="true" title="Not written yet"') + '>'
      + esc(d.name) + (ready ? ' <span class="pct">' + BANKS[i].tests.length + '</span>' : '')
      + '</button>';
  }).join('');
  $('setTabs').querySelectorAll('.vtab').forEach(function (b) {
    b.onclick = function () { if (!b.disabled && +b.dataset.i !== bi) loadBank(+b.dataset.i); };
  });
  paintTests(); syncHeader();
}

/* The tests as dots between the arrows. The dots ARE the label — which test
   you are on and how many there are, read at a glance, where "Test 1 of 10"
   needed reading. */
function paintTests() {
  if (!TESTS.length) { $('tdots').innerHTML = ''; return; }
  $('tdots').innerHTML = TESTS.map(function (t, i) {
    return '<button class="tdot' + (i === si ? ' cur' : '') + '" type="button" data-i="' + i
      + '" role="tab" aria-selected="' + (i === si) + '" aria-label="'
      + esc(TEXTS ? (t.title || ('Text ' + (i + 1))) : ('Test ' + (i + 1))) + '"></button>';
  }).join('');
  $('tdots').querySelectorAll('.tdot').forEach(function (b) {
    b.onclick = function () { if (+b.dataset.i !== si) loadTest(+b.dataset.i); };
  });
  $('prevSet').disabled = si === 0;
  $('nextSet').disabled = si === TESTS.length - 1;
}

/* ── UNITS ── one of the three functions that knows the mode.
   A unit is what the paged view shows one of: a sentence, or a paragraph. */
function units() {
  return TEXTS ? T().text : T().items;
}
function gapsIn(para) {
  return [].map.call(String(para).match(/\{(\d+)\}/g) || [], function (m) {
    return +m.slice(1, -1);
  });
}
function questions() {
  return TEXTS ? T().questions : T().items;
}
function keyOf(q, i) { return TEXTS ? q.number : i; }
function answered() {
  return questions().filter(function (q, i) { return answers[keyOf(q, i)] !== undefined; }).length;
}
function isRight(q, i) {
  var a = answers[keyOf(q, i)];
  return TEXTS ? a === q.correct : a === q.answer;
}

/* Options arrive one of two ways and are normalised once, here:
   "A) march" in the sentence banks, a plain array in the text files. */
function optionsOf(q) {
  return (q.options || []).map(function (o, i) {
    var m = TEXTS ? null : String(o).match(/^\s*([A-D])\s*\)\s*(.*)$/);
    return m ? { key:m[1], word:m[2].trim() } : { key:(TEXTS ? i : ''), word:String(o).trim() };
  });
}
function wordFor(q, key) {
  var hit = optionsOf(q).filter(function (p) { return p.key === key; })[0];
  return hit ? hit.word : '';
}

/* ── THE CARD ── the second function that knows the mode. */
function cardHTML() {
  var qs = questions();
  var head = '<div class="mc-kick">' + esc(bankLabel()) +
    '<span class="right">' + esc(progressLabel()) + '</span></div>';

  if (TEXTS) {
    var paras = view === 'full' ? T().text : [T().text[qi]];
    return '<div class="mc-card passage">' + head +
      '<div class="mc-title">' + esc(T().title) + '</div>' +
      (view === 'full' && DOC.rubric ? '<div class="mc-rubric">' + esc(DOC.rubric) + '</div>' : '') +
      '<div class="mc-text">' + paras.map(function (p) {
        return '<p>' + esc(p).replace(/\{(\d+)\}/g, function (_, n) { return gapHTML(+n); }) + '</p>';
      }).join('') + '</div></div>';
  }

  var shown = view === 'full' ? qs.map(function (_, i) { return i; }) : [qi];
  return '<div class="mc-card' + (view === 'one' ? ' solo' : '') + '">' + head +
    shown.map(function (i) {
      return '<div class="mc-line"><span class="mc-num">' +
        String(i + 1).padStart(2, '0') + '</span><span class="mc-text">' +
        esc(String(qs[i].q)).replace(/_{2,}/, gapHTML(i)) + '</span></div>';
    }).join('') + '</div>';
}

function gapHTML(k) {
  var qs = questions();
  if (TEXTS) {
    var ex = T().example;
    if (ex && k === ex.number) {
      return '<button class="gapbtn eg" data-k="' + k + '" disabled>' +
             esc(ex.options[ex.correct]) + '</button>';
    }
  }
  var q = TEXTS ? qs.filter(function (x) { return x.number === k; })[0] : qs[k];
  if (!q) return '';
  var i = TEXTS ? qs.indexOf(q) : k;
  var a = answers[k], has = a !== undefined;
  var ok = marked && has && isRight(q, i);
  var bad = marked && has && !ok;
  var shown = has ? (TEXTS ? q.options[a] : wordFor(q, a)) : '\u00a0\u00a0\u00a0\u00a0';
  return '<button class="gapbtn' + (has ? ' filled' : '') + (ok ? ' ok' : '') + (bad ? ' no' : '') +
    '" data-k="' + k + '" data-n="' + k + '">' + esc(shown) + '</button>' +
    (bad ? '<span class="fix">' + esc(TEXTS ? q.options[q.correct] : wordFor(q, q.answer)) + '</span>' : '');
}

function bankLabel() {
  var d = (CFG.datasets || [])[bi];
  return TEXTS ? ('Part 1 · ' + (d ? d.name : '')) : ((d ? d.name : '') + ' · Test ' + (si + 1));
}
function progressLabel() {
  var qs = questions();
  if (view === 'full') return answered() + ' / ' + qs.length + ' answered';
  return (TEXTS ? 'Paragraph ' : 'Sentence ') + (qi + 1) + ' of ' + units().length;
}

function render() {
  $('board').innerHTML = cardHTML();
  $('board').querySelectorAll('.gapbtn:not(.eg)').forEach(function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); openTip(b, +b.dataset.k); });
  });
  paintDots(); paintBar();
}

/* One dot per question, always — in the paged view a dot may belong to a
   unit you are not on, so it moves you there first, then opens it. */
function paintDots() {
  var qs = questions();
  var here = view === 'one' && TEXTS ? gapsIn(T().text[qi]) : null;
  $('qdots').innerHTML = qs.map(function (q, i) {
    var k = keyOf(q, i), a = answers[k], c = 'qdot';
    if (marked && a !== undefined) c += isRight(q, i) ? ' ok' : ' no';
    else if (a !== undefined) c += ' filled';
    if (view === 'one' && (TEXTS ? here.indexOf(k) > -1 : i === qi)) c += ' cur';
    return '<button class="' + c + '" data-k="' + k + '" aria-label="Question ' + (i + 1) + '"></button>';
  }).join('');
  $('qdots').querySelectorAll('.qdot').forEach(function (d) {
    d.onclick = function () {
      var k = +d.dataset.k;
      if (view === 'one') {
        var idx = TEXTS
          ? T().text.findIndex(function (p) { return gapsIn(p).indexOf(k) > -1; })
          : k;
        if (idx > -1 && idx !== qi) { qi = idx; render(); }
      }
      var g = $('board').querySelector('.gapbtn[data-k="' + k + '"]');
      if (g) {
        g.scrollIntoView({ behavior:'smooth', block:'center' });
        setTimeout(function () { openTip(g, k); }, 280);
      }
    };
  });
}

function paintBar() {
  var paged = view === 'one', n = units().length;
  ['btnPrev','btnRepeat','btnNext'].forEach(function (id) {
    $(id).style.display = paged ? '' : 'none';
  });
  $('btnPrev').disabled = qi === 0;
  $('btnNext').disabled = qi === n - 1;
  var all = questions().every(function (q, i) { return answers[keyOf(q, i)] !== undefined; });
  $('btnSubmit').disabled = !all || marked;
  $('btnSubmit').textContent = marked ? 'Marked' : 'Submit';
}

/* ── THE TOOLTIP ────────────────────────────────────────────────────────
   Anchored under its own gap, pulled back inside the viewport when the gap
   sits near an edge — a tooltip off the screen is worse than none — and
   flipped above when there is no room below. */
function openTip(btn, k) {
  if (marked) return;
  var qs = questions();
  var q = TEXTS ? qs.filter(function (x) { return x.number === k; })[0] : qs[k];
  if (!q) return;
  var tip = $('tip');
  document.querySelectorAll('.gapbtn.open').forEach(function (b) { b.classList.remove('open'); });
  btn.classList.add('open');

  tip.innerHTML = '<div class="tip-head">' + (TEXTS ? 'Gap ' + k : 'Choose one') + '</div>' +
    optionsOf(q).map(function (p, i) {
      var key = TEXTS ? i : p.key;
      return '<button class="tip-opt' + (answers[k] === key ? ' chosen' : '') +
        '" data-key="' + key + '"><span class="let">' + (TEXTS ? LETTER[i] : p.key) + '</span>' +
        esc(p.word) + '</button>';
    }).join('');
  tip.querySelectorAll('.tip-opt').forEach(function (o) {
    o.onclick = function (e) {
      e.stopPropagation();
      choose(k, TEXTS ? +o.dataset.key : o.dataset.key);
    };
  });

  tip.classList.add('show');
  var r = btn.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
  var x = Math.max(8, Math.min(r.left + r.width / 2 - tw / 2, window.innerWidth - tw - 8));
  var y = (r.bottom + th + 8 > window.innerHeight) ? r.top + window.scrollY - th - 8
                                                   : r.bottom + window.scrollY + 8;
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
function closeTip() {
  $('tip').classList.remove('show');
  document.querySelectorAll('.gapbtn.open').forEach(function (b) { b.classList.remove('open'); });
}
document.addEventListener('click', function (e) { if (!e.target.closest('.tip')) closeTip(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeTip(); });
window.addEventListener('scroll', closeTip, { passive:true });

function choose(k, val) {
  answers[k] = val;
  sfx('tick');
  closeTip();
  render();
  advance();
}

/* ── ADVANCE ── the third and last function that knows the mode.
   Sentences move on after every answer: each is independent, so there is
   nothing to take away. A passage moves on only when the whole paragraph
   is done — its gaps lean on each other, and leaving mid-paragraph removes
   the context that decides the rest. */
function advance() {
  if (view !== 'one') return;
  if (TEXTS) {
    var here = gapsIn(T().text[qi]).filter(function (n) {
      var ex = T().example; return !(ex && n === ex.number);
    });
    var done = here.every(function (n) { return answers[n] !== undefined; });
    if (done && qi < T().text.length - 1) setTimeout(function () { qi++; render(); }, 320);
    return;
  }
  if (qi < units().length - 1) setTimeout(function () { qi++; render(); }, 260);
}

/* ── MARKING ────────────────────────────────────────────────────────────
   A percentage on its own tells a student nothing to do next, so the sheet
   lists what was missed and what it should have been — and, where the data
   carries them, WHY. Part 1 turns on collocation and fixed phrase far more
   often than on meaning, so the reason is the transferable part. */
function submit() {
  var qs = questions();
  if (marked || !qs.every(function (q, i) { return answers[keyOf(q, i)] !== undefined; })) return;
  marked = true;
  var got = qs.filter(function (q, i) { return isRight(q, i); }).length;
  if (view === 'one') qi = 0;
  render();

  var pct = Math.round(got / qs.length * 100);
  $('ovEm').textContent    = pct === 100 ? '\uD83C\uDFC6' : pct >= 75 ? '\uD83C\uDF89' : pct >= 50 ? '\uD83D\uDC4D' : '\uD83D\uDCDA';
  $('ovTitle').textContent = pct === 100 ? 'Perfect' : pct >= 75 ? 'Strong' : pct >= 50 ? 'Getting there' : 'Keep going';
  $('ovScore').textContent = got + ' / ' + qs.length + ' correct \u00b7 ' + pct + '%';
  /* A class, not an inline colour — the bars have to agree with the words
     and the dots, and three places hard-coding the same pair is how they
     stop agreeing. uoe.css owns the colour. */
  $('ovBars').innerHTML = qs.map(function (q, i) {
    return '<div class="ov-bar ' + (isRight(q, i) ? 'ok' : 'no') + '"></div>';
  }).join('');

  var missed = qs.filter(function (q, i) { return !isRight(q, i); });
  $('ovMiss').innerHTML = missed.length
    ? '<div class="ov-miss-h">Worth another look</div>' + missed.map(function (q) {
        var i = qs.indexOf(q), k = keyOf(q, i), a = answers[k];
        var yours = TEXTS ? q.options[a] : wordFor(q, a);
        var right = TEXTS ? q.options[q.correct] : wordFor(q, q.answer);
        var note = q.distractors && q.distractors[yours];
        return '<div class="ov-miss-i">' + String(TEXTS ? k : i + 1).padStart(2, '0') +
          ' \u00b7 <s>' + esc(yours) + '</s> \u2192 <b>' + esc(right) + '</b>' +
          (q.why ? '<span class="ov-miss-w">' + esc(q.why) + '</span>' : '') +
          (note ? '<span class="ov-miss-w">' + esc(yours) + ' \u2014 ' + esc(note) + '</span>' : '') +
          '</div>';
      }).join('')
    : '';
  saveScore(pct);
  sfx(pct === 100 ? 'fanfare' : 'bowlLow');
  $('ov').classList.add('show');
}

/* Progress, kept the way the vocabulary pages keep it — the one capability
   Similar Words had that these pages did not. Per bank and test, so a tab
   can eventually report a score the way .vtab .pct already can. */
function saveScore(pct) {
  if (!CFG.scoreKey) return;
  try {
    var all = JSON.parse(localStorage.getItem(CFG.scoreKey) || '{}');
    (all[bi] = all[bi] || {})[si] = pct;
    localStorage.setItem(CFG.scoreKey, JSON.stringify(all));
  } catch (e) {}
}

/* ── WIRING ─────────────────────────────────────────────────────────── */
$('btnSubmit').onclick = submit;
$('btnPrev').onclick = function () { if (qi > 0) { qi--; render(); } };
$('btnNext').onclick = function () { if (qi < units().length - 1) { qi++; render(); } };
$('btnRepeat').onclick = function () {
  if (TEXTS) gapsIn(T().text[qi]).forEach(function (n) { delete answers[n]; });
  else delete answers[qi];
  marked = false; render();
};
$('prevSet').onclick = function () { loadTest(si - 1); };
$('nextSet').onclick = function () { loadTest(si + 1); };
$('ovClose').onclick = function () { $('ov').classList.remove('show'); };
$('ovAgain').onclick = function () {
  $('ov').classList.remove('show'); answers = {}; marked = false; qi = 0; render();
};
$('ovNext').onclick = function () {
  $('ov').classList.remove('show');
  if (si < TESTS.length - 1) { loadTest(si + 1); return; }
  /* Past the last test, step UP a bank rather than back to one just
     finished — the ladder is the point of having several. */
  var next = BANKS.findIndex(function (b, i) { return b && i > bi; });
  if (next > -1) loadBank(next); else loadTest(0);
};

document.querySelectorAll('.viewbtn').forEach(function (b) {
  b.onclick = function () {
    if (b.classList.contains('active')) return;
    document.querySelectorAll('.viewbtn').forEach(function (x) { x.classList.remove('active'); });
    b.classList.add('active');
    view = b.dataset.view; qi = 0; closeTip(); render();
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

/* The header wraps to different heights at every width and the rows below
   are sticky against --header-h, so it is measured rather than guessed. */
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
