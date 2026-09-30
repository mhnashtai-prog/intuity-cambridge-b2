/* ═══ CHALLENGE → MIXES ═════════════════════════════════════════════════
   One source of truth per topic. Defuse and Forge were written for the
   tenses mix files; this turns any topic's /data/challenge/challenge-*.json
   into the same groups they already read, so every topic gets both games
   without a second copy of its sentences.

     ChallengeMixes.load(topicId, 'choice')  → Defuse groups
       item { cue, after, answer, options[4], note, tense }
     ChallengeMixes.load(topicId, 'forge')   → Forge groups
       item { cue, after, answer:[words], bank:[tiles], note, tense }

   Rounds used: choose (prompt with ___) and pendulum (context/line or
   active/passive, imports included). Both have one gap and four options.
   The situation or the active sentence goes in front of the cue, because
   without it the gap can't be decided.

   Mixes are cut in file order, interleaving the two games, so a mix holds
   the same sentences on every visit: both games keep a per-item memory of
   misses keyed on mix + position, and a shuffled cut would scramble it.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const BASE = '/data/challenge/';
  const COLORS = ['#61b5ed','#c084fc','#5ED39B','#fb923c','#E86A5C','#FFD94A','#C9A961','#f472b6'];
  const PER_MIX = 16;
  let topicsP = null;

  function topics(){
    if (!topicsP) topicsP = fetch(BASE + 'challenge-topics.json', { cache:'no-store' })
      .then(r => r.json()).then(d => d.sections[0].topics);
    return topicsP;
  }

  function splitGap(s){
    const i = String(s).indexOf('___');
    if (i < 0) return null;
    return { before: s.slice(0, i).trim(), after: s.slice(i + 3).trim() };
  }

  /* one round → { cue, after, answer, options, note, tense } or null */
  function asChoice(r){
    if (!Array.isArray(r.options) || r.options.length !== 4 || !r.options.includes(r.answer)) return null;
    let lead = '', line = '';
    if (r.game === 'choose') line = r.prompt;
    else if (r.game === 'pendulum'){
      line = r.passive != null ? r.passive : r.line;
      lead = r.active != null ? r.active : (r.context || '');
    } else return null;
    const g = splitGap(line || ''); if (!g) return null;
    const cue = lead ? (lead.replace(/\s+$/, '') + ' \u2192 ' + g.before).trim() : g.before;
    return { cue, after: g.after, answer: r.answer, options: r.options.slice(),
             note: r.note || '', tense: r.tag || '' };
  }

  /* the tiles: the answer's words, then every other word the wrong options
     use — so the distractors are exactly the forms the question tempts */
  function asForge(c){
    const answer = c.answer.trim().split(/\s+/);
    const inAns = new Set(answer.map(w => w.toLowerCase()));
    const extra = [];
    c.options.forEach(o => { if (o === c.answer) return;
      o.trim().split(/\s+/).forEach(w => { const k = w.toLowerCase();
        if (!inAns.has(k) && !extra.some(x => x.toLowerCase() === k)) extra.push(w); }); });
    return { cue: c.cue, after: c.after, answer, bank: answer.concat(extra.slice(0, 5)),
             note: c.note, tense: c.tense };
  }

  function interleave(a, b){
    const out = []; for (let i = 0; i < Math.max(a.length, b.length); i++){
      if (i < a.length) out.push(a[i]); if (i < b.length) out.push(b[i]); } return out;
  }

  async function load(topicId, shape){
    const list = await topics();
    const t = list.find(x => x.id === topicId);
    if (!t || !t.file) throw new Error('No Challenge topic called "' + topicId + '"');
    const d = await (await fetch(BASE + t.file, { cache:'no-store' })).json();
    let rounds = (d.rounds || []).slice();
    for (const im of d.imports || []){
      try { const x = await (await fetch(im.file, { cache:'no-store' })).json();
            (x.rounds || []).forEach(r => rounds.push(Object.assign({ game: im.game }, r))); } catch(e){}
    }
    const ch = rounds.filter(r => r.game === 'choose').map(asChoice).filter(Boolean);
    const pe = rounds.filter(r => r.game === 'pendulum').map(asChoice).filter(Boolean);
    let items = interleave(ch, pe);
    if (shape === 'forge') items = items.map(asForge);
    const n = Math.max(1, Math.ceil(items.length / PER_MIX)), size = Math.ceil(items.length / n);
    const groups = [];
    for (let k = 0; k < n; k++){
      const part = items.slice(k * size, (k + 1) * size); if (!part.length) continue;
      groups.push({ id: topicId + '-mix-' + (k + 1), label: 'Mix ' + (k + 1),
                    color: COLORS[k % COLORS.length], desc: (d.topic || t.label) + ' \u00b7 ' + part.length + ' sentences',
                    items: part });
    }
    return { topic: { id: topicId, label: d.topic || t.label, rules: RULES[topicId] || null }, groups };
  }

  /* each Challenge topic's rules page, for the header's Explore / Practice / Quiz */
  const RULES = {
    passive:'passive-voice-rules', tenses:'tenses-rules', conditionals:'conditionals-rules',
    'past-modals':'past-modals-rules', comparatives:'comparatives-rules', reported:'reported-speech-rules',
    linking:'linking-words-rules', inversion:'inversion-rules', gerunds:'gerunds-infinitives-rules',
    misc:'miscellaneous-rules'
  };

  /* the header: subtitle, the rules links, and Defuse ↔ Forge carrying ?topic= */
  function dress(topic, here){
    const sub = document.querySelector('.app-subtitle'); if (sub) sub.textContent = 'B2 First ' + topic.label;
    document.title = 'INTUITY \u2014 ' + topic.label + ' \u00b7 ' + (here === 'defuse' ? 'Defuse' : 'Forge');
    document.querySelectorAll('.mode-selector a.mode-btn').forEach(a => {
      const h = a.getAttribute('href') || '';
      if (/tenses-rules/.test(h) && topic.rules) a.setAttribute('href', h.replace('tenses-rules', topic.rules));
      else if (/tenses-(defuse|forge)/.test(h)) a.setAttribute('href', h.split('?')[0] + '?topic=' + encodeURIComponent(topic.id));
    });
  }


  /* ═══ VOCABULARY ════════════════════════════════════════════════════════
     The same groups for Defuse, from the vocabulary files the pages already
     read. Word-bank sets ({ words:[…], sentences:[{ text, correct }] }) give
     each sentence four options: the right word and three others from the
     SAME set — the near-synonyms or the same family, which are exactly the
     words the page teaches the learner to tell apart. A four-word set gives
     all four; a larger one gives three, picked from the sentence itself so a
     sentence always gets the same three. One mix is one of the page's own
     tests (five sets), split in two when it runs past 25 sentences, so
     Defuse's tabs line up with the page's numbered tabs. */
  const VBASE = '/data/similar-words/', VPAGE = '/skills/similar-words/';
  const WORDBANK_TRIO = [['similar-words','Similar Words','vocabulary.html'],
                         ['topic-vocabulary','Topic Vocabulary','topic-vocabulary.html'],
                         ['academic','Academic','academic-vocabulary.html']];
  const VOCAB = {
    'similar-words':    { label:'Similar Words',          file:'similar-words.json',             home:'vocabulary.html',        nav:WORDBANK_TRIO },
    'topic-vocabulary': { label:'Topic Vocabulary',       file:'topic-vocabulary.json',          home:'topic-vocabulary.html',  nav:WORDBANK_TRIO },
    'academic':         { label:'Academic Vocabulary',    file:'academic-vocabulary-sets.json',  home:'academic-vocabulary.html', nav:WORDBANK_TRIO },
    'collocations':     { label:'Collocations',           file:'data-collocations-gapfill.json', home:'collocations.html' },
    'collective':       { label:'Collective Expressions', file:'collective-expressions-data.json', home:'collective-expressions-master.html', kind:'questions' },
    /* Descriptive Words' (Expression Master's) own Practice questions, one tab per topic tab on
       the page: the same twenty sentences, now against the clock */
    'expressions':      { label:'Descriptive Words', url:'/skills/similar-words/data/master-practice.json', home:'collective-expressions-master.html', kind:'topics',
                          topics:[['adjectives','Adjectives'],['adverbs','Adverbs'],['collective-nouns','Collective nouns'],['descriptive-verbs','Verbs']] }
  };
  const MAX_MIX = 25;

  function seedOf(s){ let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function pickOthers(words, correct, text){
    const others = words.filter((_, i) => i !== correct);
    if (others.length <= 3) return others;
    let h = seedOf(text); const pool = others.slice(), out = [];
    while (out.length < 3){ h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0; out.push(pool.splice(h % pool.length, 1)[0]); }
    return out;
  }
  function gapItem(text, answer, options, note, tag){
    const m = String(text).match(/_{3,}/); if (!m) return null;
    return { cue: text.slice(0, m.index).trim(), after: text.slice(m.index + m[0].length).trim(),
             answer, options, note: note || '', tense: tag || '' };
  }

  async function loadVocab(id){
    const v = VOCAB[id]; if (!v) throw new Error('No vocabulary set called "' + id + '"');
    const d = await (await fetch(v.url || (VBASE + v.file), { cache:'no-store' })).json();
    const tests = [];                                   /* [{ label, desc, items, key }] */
    if (v.kind === 'topics'){
      v.topics.forEach(([key, label]) => {
        const items = (d[key] || []).filter(q => Array.isArray(q.options) && q.options.length === 4 && q.options.includes(q.correct))
          .map(q => gapItem(q.sentence, q.correct, q.options.slice(), q.explanation, label)).filter(Boolean);
        tests.push({ label, desc: v.label + ' \u00b7 ' + label, items, key });
      });
    } else if (v.kind === 'questions'){
      const cats = d.expressions || {}, by = {};
      (d.practiceQuestions || []).forEach(q => {
        if (!Array.isArray(q.options) || q.options.length !== 4 || !q.options.includes(q.correct)) return;
        const it = gapItem(q.sentence, q.correct, q.options.slice(), q.explanation, (cats[q.category] || {}).title);
        if (it) (by[q.category] = by[q.category] || []).push(it);
      });
      Object.keys(by).forEach(c => tests.push({ label: (cats[c] && cats[c].title) || c, desc: v.label, items: by[c] }));
    } else {
      const sets = d.sets || [], per = d.setsPerTest || 5;
      for (let i = 0; i < sets.length; i += per){
        const block = sets.slice(i, i + per), items = [];
        block.forEach(s => (s.sentences || []).forEach(q => {
          const w = s.words || [], a = w[q.correct]; if (a == null) return;
          const it = gapItem(q.text, a, [a].concat(pickOthers(w, q.correct, q.text)), '', s.label || s.topic || '');
          if (it && it.options.length === 4) items.push(it);
        }));
        const names = block.map(s => s.label || s.topic).filter(x => x && x !== 'None');
        tests.push({ label: 'Test ' + (tests.length + 1), desc: names.length ? names.join(' \u00b7 ') : v.label, items });
      }
    }
    const groups = [];
    tests.forEach((t, k) => {
      const n = Math.max(1, Math.ceil(t.items.length / MAX_MIX)), size = Math.ceil(t.items.length / n);
      for (let j = 0; j < n; j++){
        const part = t.items.slice(j * size, (j + 1) * size); if (part.length < 4) continue;
        groups.push({ id: id + '-' + (t.key || (k + 1)) + (n > 1 ? 'abc'[j] : ''), label: t.label + (n > 1 ? ' ' + 'ABC'[j] : ''),
                      color: COLORS[groups.length % COLORS.length], desc: t.desc, items: part });
      }
    });
    return { vocab: Object.assign({ id }, v), groups };
  }

  /* The header on a vocabulary run: the page's own siblings, then Defuse. */
  function dressVocab(v){
    const sub = document.querySelector('.app-subtitle'); if (sub) sub.textContent = v.label.length > 16 ? v.label : v.label + ' \u00b7 B2 First';
    document.title = 'INTUITY \u2014 ' + v.label + ' \u00b7 Defuse';
    const lv = document.querySelector('.header-spacer b'); if (lv) lv.textContent = 'B2';
    const back = document.querySelector('.back-link');
    if (back){ back.textContent = '\u2190 Vocabulary'; back.onclick = null; back.removeAttribute('onclick'); back.setAttribute('href', VPAGE + v.home); }
    const row = document.querySelector('.mode-selector'); if (!row) return;
    const nav = v.nav || [[v.id, v.label, v.home]];
    row.innerHTML = nav.map(([, label, page]) => `<a class="mode-btn" href="${VPAGE + page}">${label}</a>`).join('')
      + '<span class="mode-btn active">Defuse</span>';
  }

  window.ChallengeMixes = { load, dress, RULES, loadVocab, dressVocab, VOCAB };
})();
