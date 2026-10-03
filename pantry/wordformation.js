/* ═══════════════════════════════════════════════════════════════════════
   INTUITY — WORD FORMATION
   One bank, two modes. Explore is the resource; Practice is generated from
   the same entries, so the exercise and the resource cannot drift apart.

   The bank is BASE WORD -> forms. A learner arrives holding a word
   (decide) and needs the form the sentence wants (decision? decisive?).
   Each form carries its class (verb/noun/adjective/adverb), its affix and
   whether the affix is a prefix or a suffix.

   THREE AXES, ONE CARD
     Toggle  Prefixes | Suffixes   which kind of affix is shown
     Set row Verbs · Nouns · Adjectives · Adverbs · Mix 1-3
             the CLASS of word being formed. A base word appears under
             every class it has a form in, showing only those forms.
             Mix 1-3 are fixed thirds of the bank (every third base word),
             all classes together, in file order, for revision.
   A set with nothing in it for the chosen toggle gets no tab: a tab for an
   empty family is a promise the data does not keep.

   PRACTICE follows the collocations page: ten cards down the page, picks
   only SELECT, nothing is judged until Check, and Check stays disabled
   until all ten are answered.

   TWO QUESTION TYPES. A form that carries `alts` in the data is asked as
   an AFFIX-ONLY item ("do not ____cook it": over / under / re / pre):
   every prefix, and the sound-alike endings. Everything else is asked as
   a WHOLE-WORD item, which is the right test where the spelling change
   is the point (happy -> happiness). Whole-word distractors, in order: the item's OWN avoid
   forms (importence, happyness — what learners really write), then the
   base word's forms in OTHER classes (right word, wrong class), then
   random forms of the same class from elsewhere in the set.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var DATA_URL = '../../data/similar-words/wordformation.json';
var SCORE_KEY = 'wordformation_scores';

var SETS = [
  { k:'verb',      label:'Verbs',      cls:'verb' },
  { k:'noun',      label:'Nouns',      cls:'noun' },
  { k:'adjective', label:'Adjectives', cls:'adjective' },
  { k:'adverb',    label:'Adverbs',    cls:'adverb' },
  { k:'mix1',      label:'Mix 1',      mix:0 },
  { k:'mix2',      label:'Mix 2',      mix:1 },
  { k:'mix3',      label:'Mix 3',      mix:2 }
];
var CLS_LABEL = { verb:'verb', noun:'noun', adjective:'adjective', adverb:'adverb' };
var CLS_SHORT = { verb:'v', noun:'n', adjective:'adj', adverb:'adv' };
var KIND_LABEL = { suffix:'Suffix', prefix:'Prefix' };

var BANK = null, kind = 'suffix', mode = 'browse';
var shown = [], si = 0;            /* the sets that have content, and which is open */
var items = [], scores = {};
var picks = [], isChecked = false, score = 0, results = [];

var $ = function (id) { return document.getElementById(id); };
var esc = function (v) {
  return String(v).replace(/[&<>"]/g, function (c) {
    return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c];
  });
};
function an(w) { return /^[aeiou]/i.test(w) ? 'an ' + w : 'a ' + w; }

function snd(name) {
  var S = window.SFX;
  if (S && S.isOn && S.isOn() && S[name]) { try { S[name](); } catch (e) {} }
}

/* ═══ DATA ══════════════════════════════════════════════════════════════ */
/* ONE SCRIPT, TWO PAGES. The INTUITY page fetches the bank; the standalone
   build inlines it as window.WORDFORMATION_DATA, so it needs no server. */
function start(d) {
  BANK = d;
  try { scores = JSON.parse(localStorage.getItem(SCORE_KEY) || '{}'); } catch (e) {}
  refreshSets(null);
  buildTabs();
  show();
}

function load() {
  if (window.WORDFORMATION_DATA) { start(window.WORDFORMATION_DATA); return; }
  fetch(DATA_URL, { cache:'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(start)
    .catch(function (e) {
      $('board').innerHTML = '<div class="error">The bank did not load.<br>' + esc(e.message) + '</div>';
    });
}

/* The entries a set holds for the current toggle: [{n, forms}]. A class set
   keeps only the forms of that class; a mix keeps them all. */
function view(set) {
  var out = [], idx = 0;
  BANK.nodes.forEach(function (n) {
    var fs = n.forms.filter(function (f) { return f.type === kind; });
    if (!fs.length) return;
    if (set.mix !== undefined) {
      if ((idx++) % 3 !== set.mix) return;
    } else {
      fs = fs.filter(function (f) { return f.cls === set.cls; });
    }
    if (fs.length) out.push({ n:n, forms:fs });
  });
  return out;
}

/* Rebuild which tabs exist for the current toggle, keeping the open set if
   it still exists. */
function refreshSets(keepKey) {
  shown = SETS.filter(function (s) { return view(s).length > 0; });
  si = 0;
  if (keepKey) {
    shown.forEach(function (s, i) { if (s.k === keepKey) si = i; });
  }
}

function scoreKey(s) { return kind + ':' + s.k; }
function cur() { return shown[si]; }

function buildTabs() {
  var wrap = $('setTabs');
  wrap.innerHTML = shown.map(function (s, i) {
    var sc = scores[scoreKey(s)];
    return '<button class="vtab' + (i === si ? ' active' : '') + '" type="button" data-i="' + i + '">' +
      esc(s.label) + (sc ? ' <span class="pct">' + sc.percentage + '%</span>' : '') +
      '</button>';
  }).join('');
  wrap.querySelectorAll('.vtab').forEach(function (b) {
    b.addEventListener('click', function () { si = +b.dataset.i; buildTabs(); show(); });
  });
}

function noteFor(s) {
  var n = BANK.notes && BANK.notes[kind];
  if (!n) return '';
  return n[s.cls || 'mix'] || '';
}

/* ═══ EXPLORE ═══════════════════════════════════════════════════════════ */
/* The form is shown inside its example in full ink, so the pairing is read
   as a pairing. The surface is the stored form itself — never a stem. */
function markUp(ex, surface) {
  var i = ex.toLowerCase().indexOf(surface.toLowerCase());
  if (i < 0) return esc(ex);
  return esc(ex.slice(0, i)) + '<b>' + esc(ex.substr(i, surface.length)) + '</b>' +
         esc(ex.slice(i + surface.length));
}

function cardHTML(entry, mixed) {
  var n = entry.n, fs = entry.forms;
  var visible = {};
  fs.forEach(function (f) { visible[f.w] = true; });

  var cols = fs.map(function (f) {
    return '<div class="col ' + (f.strength === 'strong' ? 'strong' : '') + '">' +
      '<div class="wc"><div class="w">' + esc(f.w) + '</div>' +
      '<div class="aff">' + esc(f.affix) + ' · ' + CLS_SHORT[f.cls] + '</div></div>' +
      '<div class="eg">' + markUp(f.example, f.w) + '</div></div>';
  }).join('');

  /* Only the avoid forms that belong to a form on screen. */
  var av = n.avoid.filter(function (a) { return visible[a.for]; });
  var avoid = av.length
    ? '<div class="avoid"><div class="avoid-label">Not these</div>' +
      av.map(function (a) {
        return '<div class="av"><div class="w">' + esc(a.w) + '</div>' +
          '<div class="why">' + esc(a.why) + '</div></div>';
      }).join('') + '</div>'
    : '';

  var note = n.note ? '<div class="wf-note">' + esc(n.note) + '</div>' : '';

  return '<div class="card poster">' +
    '<div class="kick"><i></i>' + KIND_LABEL[kind] + (mixed ? '' : ' · ' + esc(CLS_LABEL[fs[0].cls])) + '</div>' +
    '<h2 class="node">' + esc(n.node) + '</h2>' +
    '<div class="cols">' + cols + '</div>' + avoid + note +
  '</div>';
}

function renderBrowse() {
  var s = cur(), ns = view(s), note = noteFor(s);
  $('board').className = 'bank';
  $('board').innerHTML =
    (note ? '<div class="pat-note">' + esc(note) + '</div>' : '') +
    ns.map(function (e) { return cardHTML(e, s.mix !== undefined); }).join('');
  $('tally').textContent = ns.length + (ns.length === 1 ? ' word' : ' words');
  $('actionBar').style.display = 'none';
}

/* ═══ PRACTICE ══════════════════════════════════════════════════════════ */
function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* An AFFIX-ONLY item: the learner sees the sentence with the base word and a
   gap where the prefix or ending goes, and chooses the affix alone
   ("do not ____cook it"). It tests the decision that matters, which affix,
   without letting a learner pass by recognising a correctly spelled whole
   word. Used for every form that carries `alts` in the data: all prefixes,
   and the sound-alike endings (-able/-ible, -ent/-ant, -ence/-ance, -ous...). */
function affixItem(n, f) {
  var bare = f.affix.replace(/-/g, '');
  var pre = f.type === 'prefix';
  var rest = pre ? f.w.slice(bare.length) : f.w.slice(0, f.w.length - bare.length);
  var why = {};
  f.alts.forEach(function (a) {
    var ab = a.replace(/-/g, '');
    var made = pre ? ab + rest : rest + ab;
    var r = f.altwhy && f.altwhy[a];
    if (!r) {
      var hit = n.avoid.filter(function (x) { return x.w === made; })[0];
      r = hit ? hit.why : 'That does not make the word wanted here: ' + f.w + '.';
    }
    why[a] = r;
  });
  return {
    type:'affix', node:n.node, cls:f.cls, kind:f.type, affix:f.affix,
    word:f.w, answer:f.affix, example:f.example,
    options:shuffle([f.affix].concat(f.alts)), why:why,
    rule: /^(im|il|ir)-$/.test(f.affix)
      ? 'in- becomes im- before p or m, il- before l and ir- before r.' : ''
  };
}

function buildItems() {
  var entries = view(cur()), pool = [];
  entries.forEach(function (e) {
    e.forms.forEach(function (f) { pool.push({ w:f.w, cls:f.cls }); });
  });
  items = [];
  entries.forEach(function (e) {
    var n = e.n;
    e.forms.forEach(function (f) {
      if (f.alts && f.alts.length === 3) { items.push(affixItem(n, f)); return; }

      var opts = [f.w], why = {};
      /* 1 · what learners actually write for THIS form */
      n.avoid.forEach(function (a) {
        if (a.for === f.w && opts.indexOf(a.w) < 0 && opts.length < 4) {
          opts.push(a.w); why[a.w] = a.why;
        }
      });
      /* 2 · the same base word in another class: right word, wrong class */
      shuffle(n.forms.slice()).forEach(function (g) {
        if (g.cls !== f.cls && opts.length < 4 && opts.indexOf(g.w) < 0) {
          opts.push(g.w);
          why[g.w] = 'That is the ' + g.cls + ' form. The gap needs ' + an(f.cls) + '.';
        }
      });
      /* 3 · other forms of the same class, to make the number up */
      shuffle(pool.slice()).forEach(function (p) {
        if (p.cls === f.cls && opts.length < 4 && opts.indexOf(p.w) < 0) opts.push(p.w);
      });
      /* a set too small to supply a class-matched pool: take anything */
      shuffle(pool.slice()).forEach(function (p) {
        if (opts.length < 3 && opts.indexOf(p.w) < 0) opts.push(p.w);
      });
      items.push({
        type:'word', node:n.node, cls:f.cls, kind:f.type, affix:f.affix,
        word:f.w, answer:f.w, example:f.example,
        options:shuffle(opts.slice(0, 4)), why:why, rule:''
      });
    });
  });
  shuffle(items);
  /* Ten is a sitting. */
  items = items.slice(0, 10);
}

function qHTML(it, idx) {
  var ex = it.example, k = ex.toLowerCase().indexOf(it.word.toLowerCase());
  var stem, kick;
  if (it.type === 'affix') {
    var bare = it.affix.replace(/-/g, ''), pre = it.kind === 'prefix';
    kick = KIND_LABEL[it.kind] + ' · choose the ' + (pre ? 'prefix' : 'ending');
    if (k < 0) {
      stem = esc(ex);
    } else {
      var gapEl = '<span class="gap affix" id="gap' + idx + '"></span>';
      var restLen = it.word.length - bare.length;
      stem = esc(ex.slice(0, k)) + (pre
        ? gapEl + '<b>' + esc(ex.substr(k + bare.length, restLen)) + '</b>'
        : '<b>' + esc(ex.substr(k, restLen)) + '</b>' + gapEl) +
        esc(ex.slice(k + it.word.length));
    }
    it.cap = pre && k >= 0 && ex.charAt(k) !== ex.charAt(k).toLowerCase();
  } else {
    kick = KIND_LABEL[it.kind] + ' · form the ' + it.cls;
    stem = k < 0 ? esc(ex)
      : esc(ex.slice(0, k)) + '<span class="gap" id="gap' + idx + '"></span>' + esc(ex.slice(k + it.word.length));
  }
  return '<div class="card poster q" id="q' + idx + '">' +
    '<div class="kick"><i></i>' + esc(kick) + '</div>' +
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
  $('board').innerHTML = items.map(qHTML).join('');
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

/* A choice, not yet a verdict. Same pick again clears it; a different pick
   in the same question just moves the mark. */
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
  var left = items.length - done;
  var btn = $('checkBtn');
  if (!isChecked) {
    btn.disabled = left > 0;
    btn.title = left > 0 ? left + (left === 1 ? ' question left' : ' questions left') : 'Mark the set';
  }
}

/* Marks every question at once. Only reachable when every pick is made, and
   it does not trust the disabled state alone: this writes a permanent score. */
/* What goes in the gap once marked: an affix item shows the bare affix
   (over, ible), capitalised when the sentence starts with it. */
function gapText(it, v) {
  if (it.type !== 'affix') return v;
  var t = v.replace(/-/g, '');
  return it.cap ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}
/* The build, in the order it is written: a prefix goes BEFORE the base. */
function buildText(it) {
  var left = it.kind === 'prefix' ? it.affix + ' + ' + it.node : it.node + ' + ' + it.affix;
  return '<b>' + esc(it.word) + '</b> = ' + esc(left);
}

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
    var g = $('gap' + idx);
    if (g) g.textContent = gapText(it, ok ? it.answer : got);
    q.querySelectorAll('.pick').forEach(function (b) {
      b.disabled = true;
      b.classList.remove('picked');
      var w = it.options[+b.dataset.o];
      if (w === it.answer) b.classList.add('is-answer');
      else if (w === got) b.classList.add('is-wrong');
    });

    /* Wrong: the reason for the exact option chosen, then the build. Right:
       the build, so the pattern is seen once more. The in-/im-/il-/ir- rule
       is added whenever it is the point of the item. */
    var rule = it.rule ? '<br>' + esc(it.rule) : '';
    var note = $('why' + idx);
    note.innerHTML = (ok ? '' : (it.why[got]
        ? '<b>' + esc(got) + '</b> — ' + esc(it.why[got])
        : '<b>' + esc(got) + '</b> does not fit here.') + '<br>') +
      buildText(it) + rule;
    note.classList.add('show');
    q.classList.add(ok ? 'pop' : 'shake');
  });

  updateTally();
  finish();
}

function finish() {
  var pct = Math.round(score / items.length * 100);
  scores[scoreKey(cur())] = { correct:score, total:items.length, percentage:pct };
  try { localStorage.setItem(SCORE_KEY, JSON.stringify(scores)); } catch (e) {}
  buildTabs();
  snd(score === items.length ? 'fanfare' : (score >= items.length / 2 ? 'correct' : 'wrong'));

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
  if (!shown.length) {
    $('board').innerHTML = '<div class="error">Nothing in the bank for this view yet.</div>';
    $('actionBar').style.display = 'none';
    return;
  }
  if (mode === 'browse') { renderBrowse(); $('dots').innerHTML = ''; }
  else { buildItems(); renderPractice(); }   /* renderPractice binds checkBtn itself */
  var el = document.scrollingElement || document.body;
  try { el.scrollTo({ top:0, behavior:'smooth' }); } catch (e) { el.scrollTop = 0; }
}

document.querySelectorAll('[data-mode]').forEach(function (b) {
  b.addEventListener('click', function () {
    if (mode === b.dataset.mode) return;
    mode = b.dataset.mode;
    document.querySelectorAll('[data-mode]').forEach(function (x) {
      var on = x.dataset.mode === mode;
      x.classList.toggle('active', on);   /* .mode-btn.active on INTUITY */
      x.classList.toggle('on', on);       /* .seg button.on on the standalone */
      x.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $('stripLabel').textContent = mode === 'browse'
      ? 'The forms that go with each word'
      : 'Choose the correct form';
    show();
  });
});

/* Prefixes <-> Suffixes. The open set survives the switch when it still
   has content on the other side; otherwise the first tab opens. */
document.querySelectorAll('#affixSeg button').forEach(function (b) {
  b.addEventListener('click', function () {
    if (!BANK || kind === b.dataset.kind) return;
    var keep = cur() && cur().k;
    kind = b.dataset.kind;
    document.querySelectorAll('#affixSeg button').forEach(function (x) {
      var on = x.dataset.kind === kind;
      x.classList.toggle('on', on);
      x.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    refreshSets(keep);
    buildTabs();
    show();
  });
});

$('clearBtn').onclick = function () { show(); };

load();
})();
