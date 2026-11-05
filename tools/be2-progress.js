/* ═══════════════════════════════════════════════════════════════════════
   Be2FIRST — PROGRESS: THE STREAK AND THE REVIEW DECK  ·  v1
   Loaded on every page by /tools/be2-brand.js.

   One question decides what a student sees next: what did they get wrong,
   and have they got it right since? Every activity reports its answers here:

       Be2.answer('similar-words', { id, prompt, answer, given, correct,
                                     meaning?, rule?, href? });

   A wrong answer joins the review deck. It then comes back FOUR more times,
   further apart each time, and leaves only after the fourth (5 Nov 2026,
   from Michael's class: two checks in two days fade before the exam).
       wrong                 → in the deck, due today (back to the start)
       right                 → due again in 1, then 3, then 7, then 21 days
       right a 4th time      → learnt: it leaves the deck
   The gaps are a sensible choice, not a magic schedule: what matters (the
   spacing research, e.g. Cepeda et al. 2008) is more than two checks,
   spread over weeks. A second right answer on the same day changes nothing.
   Right answers join too, not only misses: about 1 in 4 (picked by the
   day, so a page can't reroll it), first check in 3 days. A round that
   asks for it (keep: true, the phrase recall) puts every answer in.
   AT MOST 12 A DAY: the review page shows the oldest-due cards first and
   stops at 12 reviewed today; the rest wait for tomorrow.
   Decks from before this carry over: a card's right answers so far count
   as its first checks.
   Any answer, right or wrong, marks today as a practice day, which is all
   a streak is.

   Games that already call INTUITY.log (intuity-log.js) feed this too, with
   no change to the game: the log is wrapped the moment it appears.

   Everything stays in this browser, like intuity-log.js: no accounts, no
   server, nothing about a student leaves the device.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.Be2 && window.Be2.answer) return;

  var REVIEW = 'be2.review.v1', DAYS = 'be2.days.v1', DONE = 'be2.reviewed.v1', MAX_CARDS = 300;
  var GAPS = [1, 3, 7, 21], DAILY = 12;

  function read(k, f) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : f; } catch (e) { return f; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function today() {
    var d = new Date();   /* the student's own calendar day, not UTC */
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function dayAfter(s) {
    var p = s.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] + 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function dayBefore(s) {
    var p = s.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] - 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function addDays(s, n) { for (var i = 0; i < n; i++) s = dayAfter(s); return s; }
  /* about 1 in 4 right answers join the deck: fixed for the card and the day */
  function sampled(key) { var h = 0, t = key + '|' + today(); for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return (h >>> 0) % 4 === 0; }
  function fill(c, r) {
    if (r.prompt) c.prompt = String(r.prompt).slice(0, 400);
    if (r.answer != null) c.answer = String(r.answer).slice(0, 200);
    if (r.given) c.given = String(r.given).slice(0, 160);
    if (r.meaning) c.meaning = String(r.meaning).slice(0, 200);
    if (r.rule) c.rule = String(r.rule).slice(0, 200);
    if (r.href) c.href = String(r.href);
    if (r.kind) c.kind = r.kind;
  }

  /* Human names for the places answers come from. */
  var NAMES = {
    'similar-words': 'Similar Words', 'topic-vocabulary': 'Topic Vocabulary',
    'academic-vocabulary-sets': 'Academic Vocabulary', 'phrasal-verbs': 'Phrasal Verbs',
    'gerunds-infinitives': 'Gerunds & Infinitives', 'conditionals': 'Conditionals',
    'master-part4': 'Use of English · Part 4', 'full-test': 'Full test',
    'uoe-part1': 'Use of English · Part 1', 'uoe-part2': 'Use of English · Part 2',
    'uoe-part3': 'Use of English · Part 3', 'uoe-part4': 'Use of English · Part 4',
    'which-task': 'Writing · Which task?', 'five-reviews': 'Your review in five',
  };
  var SHEET = { fa: 'For & Against essay', ps: 'Problems & Solutions essay', ce: 'Cause & Effect essay', ad: 'Agree & Disagree essay',
    op: 'Opinion essay', st: 'Speculation & Trends essay', ar: 'Article', ef: 'Formal email', ei: 'Informal email', rv: 'Review', rp: 'Report', sy: 'Story' };
  function topicName(t) {
    if (NAMES[t]) return NAMES[t];
    var ph = /^phrases-(\w+)$/.exec(String(t || ''));
    if (ph) return 'Phrases · ' + (SHEET[ph[1]] || ph[1]);
    var rw = /-rewrite$/.test(String(t || ''));
    var s = String(t || '').replace(/-rewrite$/, '').replace(/-(data|gapfill|complete|rules)$/, '').replace(/[-_]+/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1) + (rw ? ' · Rewrite' : '');
  }

  function markDay() {
    var days = read(DAYS, []), t = today();
    if (days[days.length - 1] !== t) { days.push(t); write(DAYS, days.slice(-400)); }
  }

  var Be2 = {
    answer: function (topic, r) {
      if (!topic || !r || r.id == null) return;
      markDay();
      var deck = read(REVIEW, {}), key = topic + '::' + r.id, c = deck[key];
      if (r.correct) {
        if (c) {
          /* right on a day the card was already answered right: no proof yet */
          if (c.rday !== today()) {
            var st = (c.step != null ? c.step : (c.rights || 0)) + 1;
            c.step = c.rights = st; c.rday = today(); c.last = today();
            if (st > GAPS.length) delete deck[key]; else c.due = addDays(today(), GAPS[st - 1]);
          }
        } else if (r.prompt && r.answer != null && (r.keep || sampled(key))) {
          /* a right answer joins too: checked again in a few days */
          c = deck[key] = { topic: topic, id: String(r.id), misses: 0, first: today(), rday: today(), last: today() };
          c.step = c.rights = r.keep ? 1 : 2; c.due = addDays(today(), GAPS[c.step - 1]);
          fill(c, r);
        }
      } else {
        c = deck[key] = c || { topic: topic, id: String(r.id), misses: 0, rights: 0, first: today() };
        c.misses++; c.rights = c.step = 0; c.rday = null; c.due = today(); c.last = today();
        fill(c, r);
      }
      /* keep the deck small: the oldest, least-missed cards go first */
      var keys = Object.keys(deck);
      if (keys.length > MAX_CARDS) {
        keys.sort(function (a, b) { return (deck[a].misses - deck[b].misses) || (deck[a].last < deck[b].last ? -1 : 1); });
        keys.slice(0, keys.length - MAX_CARDS).forEach(function (k) { delete deck[k]; });
      }
      write(REVIEW, deck);
    },

    /* Cards DUE to review, most-missed and most recent first. A card from
       before due dates (no `due`) is due now. */
    review: function (limit) {
      var deck = read(REVIEW, {}), t = today();
      var list = Object.keys(deck).filter(function (k) { return !deck[k].due || deck[k].due <= t; })
        .map(function (k) { var c = deck[k]; c.key = k; c.topicName = topicName(c.topic); return c; });
      /* the card waiting longest first, then the most missed */
      list.sort(function (a, b) { var da = a.due || '', db = b.due || ''; return (da < db ? -1 : da > db ? 1 : 0) || (b.misses - a.misses) || (a.last < b.last ? 1 : -1); });
      return limit ? list.slice(0, limit) : list;
    },
    /* the 12 a day: how many the review page will still show today */
    dueToday: function () {
      var d = read(DONE, {}), done = d.day === today() ? d.n : 0;
      return Math.min(this.review().length, Math.max(0, DAILY - done));
    },
    reviewedToday: function () { var d = read(DONE, {}); return d.day === today() ? d.n : 0; },
    /* the review page calls this once per card shown and marked */
    countReviewed: function () { var d = read(DONE, {}); d = d.day === today() ? d : { day: today(), n: 0 }; d.n++; write(DONE, d); },
    daily: DAILY,

    /* Consecutive practice days ending today (or yesterday: a streak is not
       lost until a whole day has passed without practice). */
    streak: function () {
      var days = read(DAYS, []);
      if (!days.length) return 0;
      var set = {}; days.forEach(function (d) { set[d] = 1; });
      var d = today();
      if (!set[d]) { d = dayBefore(d); if (!set[d]) return 0; }
      var n = 0; while (set[d]) { n++; d = dayBefore(d); }
      return n;
    },
    /* every card in the deck, due or not (for "N waiting for tomorrow") */
    deckSize: function () { return Object.keys(read(REVIEW, {})).length; },
    /* the sentence of a passage that holds a gap marker, so a review card
       shows one sentence, not the whole text */
    around: function (text, marker) {
      var t = Array.isArray(text) ? text.join(' ') : String(text || ''), i = t.indexOf(marker);
      if (i < 0) return '';
      var st = Math.max(t.lastIndexOf('. ', i), t.lastIndexOf('? ', i), t.lastIndexOf('! ', i), t.lastIndexOf('\n', i));
      st = st < 0 ? 0 : st + 1;
      var en = t.slice(i + marker.length).search(/[.!?]['\u2019"]?(\s|$)/);
      en = en < 0 ? t.length : i + marker.length + en + 1;
      return t.slice(st, en).replace(/\s+/g, ' ').trim();
    },
    practisedToday: function () { var days = read(DAYS, []); return days[days.length - 1] === today(); },
    topicName: topicName
  };
  window.Be2 = Be2;

  /* ── Feed from intuity-log.js, without touching any game ──
     Its items are ids chosen by each game. Only ids that read as language
     ("take off", "afford") become review cards; a bare id like "q12" still
     counts towards the streak but would make a meaningless card. */
  function wrapLog() {
    var L = window.INTUITY;
    if (!L || !L.log || L.log.__be2) return !!(L && L.log && L.log.__be2);
    var orig = L.log;
    L.log = function (topic, item, correct, extra) {
      try {
        var words = /^[A-Za-z][A-Za-z' ,.\-]{1,40}$/.test(String(item)) && !/^(q|t|s|item|test)\d/i.test(String(item));
        if (words) Be2.answer(topic, { id: item, prompt: String(item), kind: 'phrase', correct: !!correct, href: location.pathname });
        else markDay();
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    L.log.__be2 = true;
    return true;
  }
  if (!wrapLog()) {
    var tries = 0, t = setInterval(function () { if (wrapLog() || ++tries > 40) clearInterval(t); }, 250);
  }
})();
