/* ======================================================================
   INTUITY — what happened, item by item

   Every game already knows whether an answer was right. None of them has
   ever written it down, so a score survives a session and the reason for it
   does not: which phrases a child keeps missing, which ones they got right
   the first time, whether last week made any difference.

   That is the difference between "they enjoyed it" and "it worked", and it
   is the whole question October is meant to answer.

   Usage, from any game:

       INTUITY.log('phrasal-verbs', 'take off', true, { game:'board' });
       INTUITY.session('phrasal-verbs', 'board', { kept:28, fell:3 });

   Nothing here talks to a server. It writes to this browser and stays
   there until someone exports it, which keeps a class set of tablets
   simple and keeps the data in the school.
====================================================================== */
(function (global) {
  'use strict';

  const KEY = 'intuity.items.v2';
  const SESSION_KEY = 'intuity.sessions.v2';
  const MAX_SESSIONS = 400;          // roughly a term of daily play

  /* A tablet in a school may have storage disabled or full. Losing the log
     must never take the game down with it, so every read and write is
     guarded and falls back to memory for the rest of the session. */
  let memory = null, usable = true;
  function read(key, fallback) {
    if (!usable) return (memory && memory[key]) || fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { usable = false; return fallback; }
  }
  function write(key, value) {
    memory = memory || {};
    memory[key] = value;
    if (!usable) return;
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { usable = false; }
  }

  /* An anonymous mark for the device, so several tablets can be exported and
     told apart without anyone typing a name. No child is identified. */
  function deviceId() {
    let id = read('intuity.device', null);
    if (!id) {
      id = 'd' + Math.random().toString(36).slice(2, 8);
      write('intuity.device', id);
    }
    return id;
  }

  const today = () => new Date().toISOString().slice(0, 10);

  const INTUITY = {

    /* One answer. `item` is whatever the game calls the thing — a phrase, a
       trigger, a sentence id — and stays stable so the same item can be
       followed across weeks. */
    log(topic, item, correct, extra) {
      if (!topic || !item) return;
      const all = read(KEY, {});
      const t = all[topic] = all[topic] || {};
      const rec = t[item] = t[item] || { seen: 0, right: 0, wrong: 0, first: today(), last: null, games: {} };

      rec.seen++;
      correct ? rec.right++ : rec.wrong++;
      rec.last = today();

      const game = (extra && extra.game) || 'unknown';
      const g = rec.games[game] = rec.games[game] || { seen: 0, right: 0 };
      g.seen++; if (correct) g.right++;

      /* The shape of the last ten attempts, newest last: "wwrrr" reads at a
         glance as someone who has just got it. */
      rec.trail = ((rec.trail || '') + (correct ? 'r' : 'w')).slice(-10);

      write(KEY, all);
    },

    /* One sitting at one game. Kept separately from the items so a session
       can be counted even when a game reports no item detail. */
    session(topic, game, stats) {
      const list = read(SESSION_KEY, []);
      list.push(Object.assign({
        at: new Date().toISOString(),
        day: today(),
        device: deviceId(),
        topic: topic || 'unknown',
        game: game || 'unknown'
      }, stats || {}));
      write(SESSION_KEY, list.slice(-MAX_SESSIONS));
    },

    items()    { return read(KEY, {}); },
    sessions() { return read(SESSION_KEY, []); },
    device()   { return deviceId(); },

    /* The items a learner keeps getting wrong, worst first. This is the
       list a teacher actually wants: not a score, but what to reteach. */
    trouble(topic, limit) {
      const all = read(KEY, {});
      const rows = [];
      Object.keys(all).forEach(tp => {
        if (topic && tp !== topic) return;
        Object.keys(all[tp]).forEach(item => {
          const r = all[tp][item];
          if (r.seen < 2) return;                    // one miss is not a pattern
          rows.push({ topic: tp, item, seen: r.seen, wrong: r.wrong,
                      rate: r.wrong / r.seen, trail: r.trail || '', last: r.last });
        });
      });
      rows.sort((a, b) => b.rate - a.rate || b.wrong - a.wrong);
      return limit ? rows.slice(0, limit) : rows;
    },

    /* Did it stick? Compares the first half of a learner's attempts at each
       item with the second half. This is the measure that separates a game
       they enjoyed from a game that taught them something — and it needs
       weeks of data, not one lesson. */
    progress(topic) {
      const all = read(KEY, {});
      let early = 0, earlyN = 0, late = 0, lateN = 0;
      Object.keys(all).forEach(tp => {
        if (topic && tp !== topic) return;
        Object.keys(all[tp]).forEach(item => {
          const t = all[tp][item].trail || '';
          if (t.length < 4) return;
          const half = Math.floor(t.length / 2);
          for (let i = 0; i < t.length; i++) {
            const right = t[i] === 'r';
            if (i < half) { earlyN++; if (right) early++; }
            else          { lateN++;  if (right) late++;  }
          }
        });
      });
      return {
        early: earlyN ? early / earlyN : null,
        late:  lateN  ? late  / lateN  : null,
        items: Object.keys(all[topic] || {}).length || null
      };
    },

    /* Export as CSV, because a teacher has a spreadsheet and not a database.
       One row per item, so it can be sorted by whatever matters that week. */
    csv() {
      const all = read(KEY, {});
      const out = ['device,topic,item,seen,right,wrong,wrong_rate,trail,first_seen,last_seen'];
      const dev = deviceId();
      Object.keys(all).forEach(tp => Object.keys(all[tp]).forEach(item => {
        const r = all[tp][item];
        const safe = s => '"' + String(s).replace(/"/g, '""') + '"';
        out.push([dev, safe(tp), safe(item), r.seen, r.right, r.wrong,
                  (r.wrong / r.seen).toFixed(2), r.trail || '', r.first, r.last].join(','));
      }));
      return out.join('\n');
    },

    /* Everything, for merging several tablets later. */
    dump() {
      return JSON.stringify({ device: deviceId(), exported: new Date().toISOString(),
                              items: read(KEY, {}), sessions: read(SESSION_KEY, []) }, null, 2);
    },

    clear() { write(KEY, {}); write(SESSION_KEY, []); }
  };

  global.INTUITY = INTUITY;
})(window);
