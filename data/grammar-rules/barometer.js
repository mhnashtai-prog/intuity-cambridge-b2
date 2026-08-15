#!/usr/bin/env node
/*
  barometer.js — does a grammar topic earn its place?

  Fetches every page and data file of every topic from the live repo and
  scores them on what can actually be measured. Judgement — whether a page
  is *fun*, whether a fourteen-year-old opens it twice — is not in here and
  should not be: those belong to the person who teaches them. What this does
  is stop opinion having to carry the whole load, by settling the questions
  that have right answers.

  Reported on the Cambridge scale, because that is the currency the students
  are already scored in and it makes a weak page read as a distance to travel
  rather than a verdict.

    node barometer.js              every topic
    node barometer.js conditionals one topic, with detail
*/

const RAW = 'https://raw.githubusercontent.com/mhnashtai-prog/intuity-cambridge-b2/main';

const TOPICS = ['conditionals','past-modals','passive-voice','gerunds-infinitives',
                'tenses','comparatives','reported-speech','linking-words',
                'inversion','miscellaneous','phrasal-verbs'];

/* Each measure says what good looks like and what it is worth. The weights
   are the argument: coverage of the teaching matters more than polish. */
const MEASURES = [
  { key:'data',        max:15, label:'One data file for the topic' },
  { key:'engine',      max:15, label:'Shares the engine, not a copy of it' },
  { key:'integrity',   max:20, label:'Every item parses and marks itself' },
  { key:'cues',        max:15, label:'Items show the evidence for the answer' },
  { key:'explains',    max:15, label:'A wrong answer says why' },
  { key:'modes',       max:10, label:'More than one way in' },
  { key:'mobile',      max: 5, label:'Works on a phone' },
  { key:'quiet',       max: 5, label:'No dead weight (speech, orphans)' },
];
const TOTAL = MEASURES.reduce((n,m) => n + m.max, 0);

/* 140–190, anchored where the exam anchors: 160 a pass, 173 a B, 180 an A. */
function scale(pct){
  const A = [[0,140],[0.60,160],[0.72,173],[0.80,180],[1,190]];
  for (let i=1;i<A.length;i++){
    const [a0,s0]=A[i-1],[a1,s1]=A[i];
    if (pct<=a1) return Math.round(s0+(pct-a0)/(a1-a0)*(s1-s0));
  }
  return 190;
}
const grade = s => s>=180?'A':s>=173?'B':s>=160?'C':'D';

async function get(path){
  try{
    const r = await fetch(RAW + '/' + path + '?cb=' + Math.random());
    return r.ok ? await r.text() : null;
  }catch(e){ return null; }
}

function parseSentence(item){
  const t = item.text || '';
  if (item.blanks === 2){
    let m = t.match(/(.*?)_____(.*?)_____ \(([^)]+)\)(.*)/);
    if (m) return { pre:m[1], mid:m[2], post:m[4] };
    m = t.match(/(.*?)_____(.*?)_____(.*)/);
    return m ? { pre:m[1], mid:m[2], post:m[3] } : null;
  }
  let m = t.match(/(.*?)_____ \(([^)]+)\)(.*)/);
  if (m) return { pre:m[1], mid:'', post:m[3] };
  m = t.match(/(.*?)_____(.*)/);
  return m ? { pre:m[1], mid:'', post:m[2] } : null;
}

const norm = a => String(a||'').toLowerCase()
  .replace(/[\u2018\u2019\u201A\u201B\u02BC\u02B9\u02BB\u00B4\u0060\u00AB\u00BB\u2032]/g,"'")
  .trim().replace(/\s+/g,' ');

function cueLives(item, seg){
  const raw = item.highlightVerb !== undefined ? item.highlightVerb : item.keywords;
  const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
  if (!list.length) return false;
  const vis = [seg.pre,seg.mid,seg.post].join(' ');
  return list.some(c => new RegExp('\\b'+String(c).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(vis));
}

async function audit(topic){
  const notes = [], score = {};

  /* which pages exist, and what each one fetches */
  const pages = {}, refs = new Set();
  for (const p of ['rules','practice','gapfill','play','quiz','explore','game','cinema']){
    const html = await get('skills/grammar-rules/' + topic + '-' + p + '.html');
    if (!html) continue;
    pages[p] = html;
    (html.match(/[A-Za-z0-9._-]+\.json/g) || [])
      .filter(j => !/^(response|r|res)\.json$/.test(j)).forEach(j => refs.add(j));
    const q = html.match(/QUIZ_DATA = '([^']+)'/);
    if (q) refs.add(q[1] + '.json');
  }
  if (!Object.keys(pages).length) return null;

  /* 1. one data file */
  score.data = refs.size === 1 ? 15 : refs.size === 2 ? 8 : 3;
  if (refs.size !== 1) notes.push(refs.size + ' data files: ' + [...refs].join(', '));

  /* 2. shared engine */
  const shells = Object.values(pages).filter(h => /QUIZ_DATA/.test(h)).length;
  const fat = Object.values(pages).filter(h => h.length > 15000 && /<script>/.test(h)).length;
  score.engine = shells ? 15 : fat > 1 ? 4 : 8;
  if (!shells) notes.push('no shared engine — ' + fat + ' pages carry their own');

  /* 3–5. the data itself */
  let items=0, parsed=0, selfmark=0, cued=0, explained=0;
  for (const ref of refs){
    const raw = await get('data/grammar-rules/' + ref) || await get('skills/grammar-rules/' + ref);
    if (!raw) { notes.push('missing data file: ' + ref); continue; }
    let d; try { d = JSON.parse(raw); } catch(e){ notes.push('invalid JSON: ' + ref); continue; }
    const tests = (d.gapfill && d.gapfill.tests) || d.tests || [];
    const hasRules = !!(d.rules || (d.gapfill && d.rules));
    for (const t of tests) for (const it of (t.sentences || [])){
      items++;
      const seg = parseSentence(it);
      if (!seg) continue;
      parsed++;
      const accepted = [it.answer, ...(it.alternatives||[]), it.alternativeAnswer].filter(Boolean).map(norm);
      if (accepted.includes(norm(it.answer))) selfmark++;
      if (cueLives(it, seg)) cued++;
      if (it.rule || (hasRules && it.rule !== undefined)) explained++;
    }

    /* A topic may be built round matching rather than gap-filling — phrasal
       verbs pairs a phrase with a meaning and never has a sentence to parse.
       Measuring it against a gap-fill schema would fail it for being a
       different, and better, kind of exercise, so it is judged on the terms
       it actually sets: does every item carry a phrase, a meaning, and a
       sentence showing it in use? */
    for (const g of (d.groups || [])) for (const it of (g.items || [])){
      items++;
      if (it.particle && it.meaning) parsed++;
      if (it.particle && it.meaning) selfmark++;
      if (it.example) cued++;            // the example sentence is the evidence
      if (it.meaning) explained++;       // a wrong tap names what it did mean
    }
  }
  const pc = n => items ? n/items : 0;
  score.integrity = items ? Math.round(20 * (pc(parsed)*0.5 + pc(selfmark)*0.5)) : 0;
  score.cues      = Math.round(15 * pc(cued));
  score.explains  = Math.round(15 * pc(explained));
  if (items && parsed < items)   notes.push((items-parsed) + ' items never render');
  if (items && cued < items)     notes.push((items-cued) + ' items have no cue');
  if (items && explained < items) notes.push((items-explained) + ' items explain nothing when wrong');

  /* 6. ways in */
  const modes = Object.keys(pages).length;
  score.modes = Math.min(10, modes * 3);
  const playable = ['game','play','cinema','quiz'].some(k => pages[k]);
  if (!playable) notes.push('nothing to play — only read-and-type');

  /* 7. phone */
  const mob = Object.values(pages).filter(h => /viewport/.test(h) &&
    (/@media[^{]*max-width/.test(h) || /gapfill\.css/.test(h))).length;
  score.mobile = mob === Object.keys(pages).length ? 5 : mob ? 3 : 0;

  /* 8. dead weight */
  const speech = Object.values(pages).some(h => /speechSynthesis/.test(h));
  score.quiet = speech ? 0 : 5;
  if (speech) notes.push('still carries speech synthesis');

  const got = MEASURES.reduce((n,m) => n + (score[m.key]||0), 0);
  const s = scale(got/TOTAL);
  return { topic, score, got, pct: got/TOTAL, scale: s, grade: grade(s),
           items, modes: Object.keys(pages), notes };
}

(async () => {
  const only = process.argv[2];
  const list = only ? TOPICS.filter(t => t === only) : TOPICS;
  const rows = [];
  for (const t of list){
    const r = await audit(t);
    if (r) rows.push(r);
  }
  rows.sort((a,b) => b.scale - a.scale);

  console.log('');
  console.log('INTUITY — grammar barometer');
  console.log('');
  console.log('topic                 items  score  grade   weakest measure');
  console.log('─'.repeat(74));
  for (const r of rows){
    const weakest = MEASURES
      .map(m => ({ m, share: (r.score[m.key]||0)/m.max }))
      .sort((a,b) => a.share - b.share)[0];
    console.log(
      r.topic.padEnd(21) +
      String(r.items).padStart(5) +
      String(r.scale).padStart(7) +
      ('  ' + r.grade).padStart(7) + '   ' +
      (weakest.share >= 1 ? '—' : weakest.m.label));
  }
  console.log('─'.repeat(74));
  const avg = rows.reduce((n,r) => n + r.scale, 0) / rows.length;
  console.log('suite average'.padEnd(21) + ''.padStart(5) + String(Math.round(avg)).padStart(7) +
              ('  ' + grade(Math.round(avg))).padStart(7));

  /* what each topic below an A would need */
  const short = rows.filter(r => r.scale < 180);
  if (!only && short.length){
    console.log('');
    console.log('to reach 180 (grade A):');
    for (const r of short){
      const need = [];
      for (const m of MEASURES){
        const lost = m.max - (r.score[m.key]||0);
        if (lost > 0) need.push({ label:m.label, lost });
      }
      need.sort((a,b) => b.lost - a.lost);
      const top = need.slice(0,2).map(n => n.label + ' (+' + n.lost + ')').join(', ');
      console.log('  ' + r.topic.padEnd(20) + (180 - r.scale) + ' points away — ' + top);
    }
  }

  if (only && rows[0]){
    const r = rows[0];
    console.log('');
    console.log(r.topic + ' — measure by measure');
    for (const m of MEASURES){
      const v = r.score[m.key] || 0;
      const bar = '█'.repeat(Math.round(v/m.max*12)).padEnd(12,'·');
      console.log('  ' + bar + ' ' + String(v).padStart(2) + '/' + String(m.max).padEnd(3) + m.label);
    }
    if (r.notes.length){
      console.log('');
      console.log('  what is costing it:');
      r.notes.forEach(n => console.log('    · ' + n));
    }
    console.log('');
    console.log('  ways in: ' + r.modes.join(', '));
  }
  console.log('');
})();
