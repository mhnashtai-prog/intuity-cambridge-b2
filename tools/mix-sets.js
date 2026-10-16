/* MIX SETS — Set 1, Set 2, Set 3 for Gap-fill and Rewrite, like Defuse.

   The sub-point sets (Zero, First, Second…) tell the student which structure
   every item needs before they read a word. A mix does not: its tab says
   "Set 2", and the items come from every sub-point, interleaved, so the
   student has to recognise what each sentence wants. That decision is what
   the exam tests, and it is the one thing the labelled sets never practise.

   Built from the topic's own sets, so there is nothing to write or keep in
   step: a sentence added to a sub-point set turns up in the mixes too.

     · the same composition on every visit and every device (seeded by the
       data file), so a teacher can say "everyone do Set 2" and a score
       stays attached to the same ten sentences;
     · no sentence appears in two mixes while unused ones remain;
     · two-ish from each sub-point per mix, then shuffled;
     · up to three mixes, fewer if the topic is small.

   build(sets, key, opts) → new set objects to append after the topic's own.
     key   the property holding a set's items ('sentences' or 'items')
     opts  { seed, per = 10, max = 3, strip = fn(item) → item }            */
(function () {
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(list, rand) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function build(sets, key, opts) {
    opts = opts || {};
    var per = opts.per || 10, max = opts.max == null ? 3 : opts.max;
    var rand = rng(hash(String(opts.seed || 'mix')));
    var pools = sets.map(function (s) { return shuffle((s && s[key]) || [], rand); })
                    .filter(function (p) { return p.length; });
    if (pools.length < 2) return [];
    var total = pools.reduce(function (n, p) { return n + p.length; }, 0);
    var count = Math.min(max, Math.floor(total / per));
    var out = [], next = pools.map(function () { return 0; }), k = 0;
    for (var m = 0; m < count; m++) {
      var items = [], guard = 0;
      while (items.length < per && guard++ < per * pools.length * 4) {
        var p = k++ % pools.length;
        if (next[p] >= pools[p].length) {
          /* every pool drained: reuse from the start rather than end short */
          if (next.every(function (n, i) { return n >= pools[i].length; })) next = next.map(function () { return 0; });
          continue;
        }
        var it = pools[p][next[p]++];
        if (items.indexOf(it) === -1) items.push(it);
      }
      items = shuffle(items, rand).map(function (it) {
        var c = JSON.parse(JSON.stringify(it));
        return opts.strip ? opts.strip(c) : c;
      });
      /* No descriptor: the strip keeps the task instruction ("Rewrite using
         the key word"), which matters more than saying it is mixed. */
      var set = { id: 'set' + (m + 1), title: 'Set ' + (m + 1), mix: true };
      set[key] = items;
      out.push(set);
    }
    return out;
  }

  window.MixSets = { build: build };
})();
