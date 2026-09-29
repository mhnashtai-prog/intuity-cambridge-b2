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

  window.ChallengeMixes = { load, dress, RULES };
})();
