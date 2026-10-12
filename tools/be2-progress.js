/* ═══════════════════════════════════════════════════════════════════════
   Be2FIRST — PROGRESS: THE STREAK AND THE REVIEW DECK  ·  v1
   Loaded on every page by /tools/be2-brand.js.

   One question decides what a student sees next: what did they get wrong,
   and have they got it right since? Every activity reports its answers here:

       Be2.answer('similar-words', { id, prompt, answer, given, correct,
                                     meaning?, rule?, href? });

   A wrong answer joins the review deck; two right answers later (in the
   deck or anywhere else) take it out. Any answer, right or wrong, marks
   today as a practice day, which is all a streak is.

   Games that already call INTUITY.log (intuity-log.js) feed this too, with
   no change to the game: the log is wrapped the moment it appears.

   Everything stays in this browser, like intuity-log.js: no accounts, no
   server, nothing about a student leaves the device.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.Be2 && window.Be2.answer) return;

  var REVIEW = 'be2.review.v1', DAYS = 'be2.days.v1', MAX_CARDS = 120;

  function read(k, f) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : f; } catch (e) { return f; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function today() {
    var d = new Date();   /* the student's own calendar day, not UTC */
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function dayBefore(s) {
    var p = s.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] - 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* Human names for the places answers come from. */
  var NAMES = {
    'similar-words': 'Similar Words', 'topic-vocabulary': 'Topic Vocabulary',
    'academic-vocabulary-sets': 'Academic Vocabulary', 'phrasal-verbs': 'Phrasal Verbs',
    'gerunds-infinitives': 'Gerunds & Infinitives', 'conditionals': 'Conditionals',
    'master-part4': 'Use of English · Part 4', 'full-test': 'Full test'
  };
  function topicName(t) {
    if (NAMES[t]) return NAMES[t];
    var s = String(t || '').replace(/-(data|gapfill|complete|rules)$/, '').replace(/[-_]+/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
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
        if (c) { c.rights = (c.rights || 0) + 1; c.last = today(); if (c.rights >= 2) delete deck[key]; }
      } else {
        c = deck[key] = c || { topic: topic, id: String(r.id), misses: 0, rights: 0, first: today() };
        c.misses++; c.rights = 0; c.last = today();
        if (r.prompt) c.prompt = String(r.prompt).slice(0, 400);
        if (r.answer != null) c.answer = String(r.answer).slice(0, 160);
        if (r.given) c.given = String(r.given).slice(0, 160);
        if (r.meaning) c.meaning = String(r.meaning).slice(0, 200);
        if (r.rule) c.rule = String(r.rule).slice(0, 200);
        if (r.href) c.href = String(r.href);
        if (r.kind) c.kind = r.kind;
      }
      /* keep the deck small: the oldest, least-missed cards go first */
      var keys = Object.keys(deck);
      if (keys.length > MAX_CARDS) {
        keys.sort(function (a, b) { return (deck[a].misses - deck[b].misses) || (deck[a].last < deck[b].last ? -1 : 1); });
        keys.slice(0, keys.length - MAX_CARDS).forEach(function (k) { delete deck[k]; });
      }
      write(REVIEW, deck);
    },

    /* Cards to review, most-missed and most recent first. */
    review: function (limit) {
      var deck = read(REVIEW, {});
      var list = Object.keys(deck).map(function (k) { var c = deck[k]; c.key = k; c.topicName = topicName(c.topic); return c; });
      list.sort(function (a, b) { return (b.misses - a.misses) || (a.last < b.last ? 1 : -1); });
      return limit ? list.slice(0, limit) : list;
    },

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
