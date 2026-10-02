/* ======================================================================
   INTUITY — the Ring: what to bring back, and when

   intuity-log.js writes down what happened. This decides what happens
   next: every item a learner gets wrong is kept here until it is fixed,
   and the Challenge and the Boards serve those items first.

   THE RULE: an item leaves the Ring once it has been answered right, first
   time, on TWO DIFFERENT DAYS. One right answer is not proof — on four
   options a quarter of guesses land — and two in the same sitting prove
   short-term memory, not learning. So:

       wrong                    → in the Ring, due now
       right, first day         → stays, due tomorrow
       right, a later day       → fixed: it leaves the Ring
       wrong again, at any time → back to the start

   A right answer on the same day as the last one changes nothing, so a
   learner can't clear the Ring by replaying one Board five times in a row.
   Items never missed are never stored: the Ring holds mistakes only.

   Usage:
       IntuityRing.miss(id, { topic:'conditionals', part:'UoE4' });
       IntuityRing.right(id);
       IntuityRing.isDue(id);           // true if it should be served now
       IntuityRing.count(ids);          // how many of these are due

   Everything stays in this browser. A device with storage disabled or full
   keeps working, with a memory that lasts until the page closes.
====================================================================== */
(function (global) {
  'use strict';

  const KEY = 'intuity.ring.v1';
  let memory = null, usable = true;

  function read() {
    if (!usable) return memory || {};
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : {}; }
    catch (e) { usable = false; return memory || {}; }
  }
  function write(all) {
    memory = all;
    if (!usable) return;
    try { localStorage.setItem(KEY, JSON.stringify(all)); }
    catch (e) { usable = false; }
  }

  /* days as YYYY-MM-DD in the learner's own time zone, so "tomorrow" means
     after their midnight, not the server's */
  const day = (offset) => {
    const d = new Date(); d.setDate(d.getDate() + (offset || 0));
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  const IntuityRing = {
    miss(id, meta) {
      if (!id) return;
      const all = read(), old = all[id] || {};
      all[id] = { topic: (meta && meta.topic) || old.topic || '', part: (meta && meta.part) || old.part || '',
                  box: 0, due: day(0), rday: null, misses: (old.misses || 0) + 1, since: old.since || day(0) };
      write(all);
    },

    right(id) {
      if (!id) return;
      const all = read(), rec = all[id];
      if (!rec || rec.rday === day(0)) return;      /* never missed, or already right today */
      rec.box += 1; rec.rday = day(0);
      if (rec.box >= 2) delete all[id];             /* right on two different days: fixed */
      else rec.due = day(1);
      write(all);
    },

    isDue(id) { const rec = id && read()[id]; return !!rec && rec.due <= day(0); },
    has(id)   { return !!(id && read()[id]); },

    /* how many of the given ids are due now — or, with no list, in the Ring at all */
    count(ids) {
      const all = read(), today = day(0);
      if (!ids) return Object.keys(all).length;
      let n = 0; ids.forEach(id => { const r = all[id]; if (r && r.due <= today) n++; });
      return n;
    },

    all()   { return read(); },
    clear() { write({}); }
  };

  global.IntuityRing = IntuityRing;
})(window);
