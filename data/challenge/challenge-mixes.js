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
      groups.push({ id: topicId + '-mix-' + (k + 1), label: 'Set ' + (k + 1),
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
      else if (/challenge\.html\?board=1/.test(h)) a.setAttribute('href', '/skills/challenge/challenge.html?board=1&topic=' + encodeURIComponent(topic.id));   /* Board replaced Forge */
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
                          topics:[['adjectives','Adjectives'],['adverbs','Adverbs'],['collective-nouns','Collective nouns'],['descriptive-verbs','Verbs']] },
    /* Phrasal Verbs 1. Defuse plays the verb groups (one tab per verb, as on
       the page); Forge plays the key word transformations. */
    'phrasal-verbs':    { label:'Phrasal Verbs', url:'/data/grammar-rules/phrasal-verbs-data.json', kind:'phrasal',
                          home:'/skills/grammar-rules/phrasal-verbs-quiz.html', games:['defuse','forge'],
                          nav:[['learn','Learn','?mode=learn'],['quiz','Quiz','?mode=quiz'],['gap','Practice','?mode=gap'],['match','Match','?mode=match']] }
  };
  const MAX_MIX = 25;

  /* ── phrasal verbs ────────────────────────────────────────────────────
     DEFUSE. The options are PARTICLES, as in the page's own Quiz, and the
     verb stands in the sentence just before the gap. Offering whole phrasal
     verbs ("take off") would be wrong wherever the sentence needs "comes
     with" or "has been putting about" — a third of the examples. The verb is
     marked, so the learner sees which one they are completing.
     FORGE. The transformations already carry the answer in its right form
     (takes after, came down with), so the tiles are its words plus the
     forms the question tempts: the verb's other form, and three of its
     other particles. */
  const IRREG = { gave:'give', given:'give', took:'take', taken:'take', broke:'break', broken:'break', came:'come',
    got:'get', gotten:'get', went:'go', gone:'go', ran:'run', kept:'keep', brought:'bring', made:'make', held:'hold',
    caught:'catch', dealt:'deal', set:'set', put:'put', cut:'cut', saw:'see', seen:'see', fell:'fall', left:'leave' };
  const PAST = { give:'gave', take:'took', break:'broke', come:'came', get:'got', go:'went', run:'ran', keep:'kept',
    bring:'brought', make:'made', hold:'held', catch:'caught', deal:'dealt', see:'saw', fall:'fell', leave:'left' };
  function lemma(w, verbs){
    const x = w.toLowerCase();
    if (IRREG[x]) return IRREG[x];
    if (verbs[x]) return x;
    for (const cut of [/ies$/, /ing$/, /ed$/, /es$/, /s$/]){
      const s = x.replace(cut, cut.source === 'ies$' ? 'y' : '');
      if (verbs[s]) return s; if (verbs[s + 'e']) return s + 'e';
      if (/(.)\1$/.test(s) && verbs[s.slice(0, -1)]) return s.slice(0, -1);
    }
    return null;
  }
  function otherForm(w, base){
    if (w.toLowerCase() !== base) return base;
    return PAST[base] || (base.endsWith('e') ? base + 'd' : base + 'ed');
  }
  function pvDefuse(d){
    return (d.groups || []).map(g => ({
      label: g.label.replace(/^MIX (\d)$/, 'Mix $1'), key: g.id, desc: 'Phrasal Verbs \u00b7 ' + g.label,
      items: (g.items || []).map(it => {
        const verb = it.verb || g.id, m = String(it.example || '').match(/_{3,}/);
        if (!m || !Array.isArray(it.options) || it.options.length !== 4 || !it.options.includes(it.particle)) return null;
        const before = it.example.slice(0, m.index).replace(/\s+$/, '');
        return { cue: (before ? before + ' ' : '') + verb, after: it.example.slice(m.index + m[0].length).trim(),
                 mark: [verb], answer: it.particle, options: it.options.slice(),
                 note: verb + ' ' + it.particle + ' \u2014 ' + (it.meaning || ''), tense: verb + ' ' + it.particle };
      }).filter(Boolean)
    }));
  }
  function pvForge(d){
    const verbs = d.verbs || {};
    return (d.practice || []).map((test, k) => ({
      label: 'Test ' + (k + 1), desc: test.title || 'Key word transformations',
      items: (test.transformations || []).map(tr => {
        const m = String(tr.sentence2 || '').match(/_{3,}/); if (!m) return null;
        const answer = String(tr.answer).trim().split(/\s+/); if (answer.length < 2) return null;
        const base = lemma(answer[0], verbs), extra = [];
        if (base){
          extra.push(otherForm(answer[0], base));
          (verbs[base] || []).forEach(p => p.split(' ').forEach(w => {
            if (extra.length < 4 && !answer.some(a => a.toLowerCase() === w) && !extra.includes(w)) extra.push(w); }));
        }
        const before = tr.sentence2.slice(0, m.index).trim();
        return { cue: tr.sentence1.trim() + ' \u2192 ' + before, after: tr.sentence2.slice(m.index + m[0].length).trim(),
                 mark: [], answer, bank: answer.concat(extra), note: 'Key word: ' + String(tr.keyWord || '').toUpperCase(),
                 tense: 'Key word ' + String(tr.keyWord || '').toUpperCase() };
      }).filter(Boolean)
    }));
  }

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

  async function loadVocab(id, shape){
    const v = VOCAB[id]; if (!v) throw new Error('No vocabulary set called "' + id + '"');
    shape = shape || 'choice';
    if (shape === 'forge' && v.kind !== 'phrasal') throw new Error(v.label + ' has no Forge rounds');
    const d = await (await fetch(v.url || (VBASE + v.file), { cache:'no-store' })).json();
    const tests = [];                                   /* [{ label, desc, items, key }] */
    if (v.kind === 'phrasal'){
      (shape === 'forge' ? pvForge(d) : pvDefuse(d)).forEach(x => tests.push(x));
    } else if (v.kind === 'topics'){
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
    /* the page's current verb rides along as ?verb=take — open on that tab */
    try { const u = new URL(location.href), verb = u.searchParams.get('verb');
      if (verb && !u.searchParams.get('set')){ const g = groups.find(x => x.id === id + '-' + verb);
        if (g){ u.searchParams.set('set', g.id); history.replaceState(null, '', u); } } } catch(e){}
    return { vocab: Object.assign({ id }, v), groups };
  }

  /* The header on a vocabulary run: the page's own siblings, then Defuse. */
  function dressVocab(v, here){
    here = here || 'defuse';
    const sub = document.querySelector('.app-subtitle'); if (sub) sub.textContent = v.label.length > 16 ? v.label : v.label + ' \u00b7 B2 First';
    document.title = 'INTUITY \u2014 ' + v.label + ' \u00b7 ' + (here === 'forge' ? 'Forge' : 'Defuse');
    const lv = document.querySelector('.header-spacer b'); if (lv) lv.textContent = 'B2';
    const back = document.querySelector('.back-link');
    const homeUrl = v.home.charAt(0) === '/' ? v.home : VPAGE + v.home;
    if (back){ back.textContent = '\u2190 Vocabulary'; back.onclick = null; back.removeAttribute('onclick'); back.setAttribute('href', homeUrl); }
    const row = document.querySelector('.mode-selector'); if (!row) return;
    const nav = v.nav || [[v.id, v.label, v.home]];
    const link = page => page.charAt(0) === '?' ? homeUrl + page : page.charAt(0) === '/' ? page : VPAGE + page;
    const games = { defuse:['Defuse','/skills/grammar-rules/tenses-defuse'], forge:['Forge','/skills/grammar-rules/tenses-forge'] };
    row.innerHTML = nav.map(([, label, page]) => `<a class="mode-btn" href="${link(page)}">${label}</a>`).join('')
      + (v.games || ['defuse']).map(g => g === here ? `<span class="mode-btn active">${games[g][0]}</span>`
          : `<a class="mode-btn" href="${games[g][1]}?vocab=${encodeURIComponent(v.id)}">${games[g][0]}</a>`).join('');
  }

  window.ChallengeMixes = { load, dress, RULES, loadVocab, dressVocab, VOCAB };
})();

/* ═══ DEFUSE'S MODE ROW, FROM THE TOPIC'S OWN PAGE ══════════════════════════
   Defuse is one document for every topic, so its row was written for tenses
   and rewritten for the topic only after the sentences loaded: a student who
   tapped Board early landed on the tenses Board, and a topic's Game never
   appeared at all. Now the links are put right the moment the page opens,
   and the row is then copied from the topic's own page, exactly as the Board
   does, so Explore · Practice · Quiz · Game · Defuse · Board read the same
   on every page of a topic. */
(function(){
  if (!/tenses-(defuse|forge)/.test(location.pathname)) return;
  var id = new URLSearchParams(location.search).get('topic');
  var RULES = { passive:'passive-voice-rules', tenses:'tenses-rules', conditionals:'conditionals-rules',
    'past-modals':'past-modals-rules', comparatives:'comparatives-rules', reported:'reported-speech-rules',
    linking:'linking-words-rules', inversion:'inversion-rules', gerunds:'gerunds-infinitives-rules',
    misc:'miscellaneous-rules' };
  if (!id || !RULES[id]) return;
  var here = /tenses-forge/.test(location.pathname) ? 'Forge' : 'Defuse';
  var page = '/skills/grammar-rules/' + RULES[id];
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function quick(){
    document.querySelectorAll('.mode-selector a.mode-btn').forEach(function(a){
      var h = a.getAttribute('href') || '';
      if (/tenses-rules/.test(h)) a.setAttribute('href', h.replace('tenses-rules', RULES[id]));
      else if (/challenge\.html\?board=1/.test(h)) a.setAttribute('href', '/skills/challenge/challenge.html?board=1&topic=' + encodeURIComponent(id));
    });
  }
  function full(){
    fetch(page + '.html', { cache:'no-store' }).then(function(r){ return r.text(); }).then(function(html){
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var src = doc.querySelector('.mode-selector'), row = document.querySelector('.mode-selector');
      if (!src || !row) return;
      var out = [];
      Array.prototype.forEach.call(src.children, function(el){
        var label = el.textContent.trim(), m = el.dataset && el.dataset.mode, href = el.getAttribute && el.getAttribute('href');
        if (!label || el.classList.contains('mode-soon')) return;
        if (label.toLowerCase() === here.toLowerCase()) { out.push('<span class="mode-btn active" aria-current="page">' + esc(here) + '</span>'); return; }
        var go = m ? page + '?mode=' + m : href ? (function(u){ return u.pathname + u.search; })(new URL(href, location.origin + page)) : '';
        if (go) out.push('<a class="mode-btn" href="' + esc(go) + '">' + esc(label) + '</a>');
      });
      if (out.length) row.innerHTML = out.join('');
    }).catch(function(){});
  }
  function go(){ quick(); full(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
