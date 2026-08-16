#!/usr/bin/env node
/*
  migrate.js — bring a gapfill JSON onto the canonical schema.

    node migrate.js path/to/file.json            report only, writes nothing
    node migrate.js path/to/file.json --write    rewrite the file in place

  What it does:
    1. alternativeAnswer (string|null)  ->  alternatives (array, nulls dropped)
    2. drops highlightVerb when it cannot possibly match — i.e. when it only
       appears inside the bracketed hint, which the renderer strips out. A
       silently dead cue is worse than no cue: it looks configured.
    3. promotes a `helper` to highlightVerb when the helper text appears
       verbatim in the sentence. A cue that is already in the sentence should
       be highlighted in place, not repeated in a chip beside it.
    4. reports every item whose gap will not parse, and every remaining
       highlightVerb that does not match its sentence.
*/

const fs = require('fs');

const path = process.argv[2];
const write = process.argv.includes('--write');
if (!path) { console.error('usage: node migrate.js <file.json> [--write]'); process.exit(1); }

const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const tests = (data.gapfill && data.gapfill.tests) || [];

/* Mirror of the renderer's parser, so the audit sees exactly what the page
   will see. */
function parseSentence(item) {
  let m;
  if (item.blanks === 2) {
    m = item.text.match(/(.*?)_____(.*?)_____ \(([^)]+)\)(.*)/);
    if (m) return { pre: m[1], mid: m[2], hint: m[3], post: m[4] };
    m = item.text.match(/(.*?)_____(.*?)_____(.*)/);
    if (m) return { pre: m[1], mid: m[2], hint: '', post: m[3] };
    return null;
  }
  m = item.text.match(/(.*?)_____ \(([^)]+)\)(.*)/);
  if (m) return { pre: m[1], mid: '', hint: m[2], post: m[3] };
  return null;
}

function matches(needle, haystack) {
  if (!needle) return false;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\b' + escaped + '\\b', 'i').test(haystack);
}

const report = { unparsable: [], deadCue: [], promoted: [], stillUnmatched: [], legacy: 0, items: 0 };

for (const test of tests) {
  for (const item of test.sentences) {
    report.items++;
    const where = test.id + ' #' + item.id;

    /* 1. alternatives */
    if (!Array.isArray(item.alternatives)) {
      const legacy = item.alternativeAnswer;
      item.alternatives = legacy ? [legacy] : [];
      if (legacy) report.legacy++;
    }
    delete item.alternativeAnswer;

    /* 2 & 3. cues */
    const parsed = parseSentence(item);
    if (!parsed) { report.unparsable.push(where + ' — ' + item.text); continue; }

    const visible = [parsed.pre, parsed.mid, parsed.post].join(' ');

    if (item.highlightVerb && !matches(item.highlightVerb, visible)) {
      report.deadCue.push(where + ' — "' + item.highlightVerb + '" is not in the sentence');
      delete item.highlightVerb;
    }

    if (!item.highlightVerb && item.helper && matches(item.helper, visible)) {
      item.highlightVerb = item.helper;
      delete item.helper;
      report.promoted.push(where + ' — cue "' + item.highlightVerb + '" promoted from helper');
    }

    if (item.highlightVerb && !matches(item.highlightVerb, visible)) {
      report.stillUnmatched.push(where);
    }

    /* keep key order stable and predictable across the suite */
    const ordered = {};
    for (const k of ['id', 'text', 'answer', 'alternatives', 'highlightVerb', 'helper', 'blanks']) {
      if (item[k] !== undefined && item[k] !== null) ordered[k] = item[k];
    }
    for (const k of Object.keys(item)) if (!(k in ordered) && item[k] != null) ordered[k] = item[k];
    for (const k of Object.keys(item)) delete item[k];
    Object.assign(item, ordered);
  }
}

const line = (label, list) =>
  console.log('\n' + label + ' (' + list.length + ')' + (list.length ? '\n  ' + list.join('\n  ') : ''));

console.log('=== ' + path + ' — ' + report.items + ' items in ' + tests.length + ' tests ===');
console.log('\nlegacy alternativeAnswer migrated: ' + report.legacy);
line('UNPARSABLE — these never render', report.unparsable);
line('DEAD CUES REMOVED — highlightVerb absent from the sentence', report.deadCue);
line('CUES PROMOTED from helper', report.promoted);
line('STILL UNMATCHED — needs a human decision', report.stillUnmatched);

if (write) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log('\nwritten: ' + path);
} else {
  console.log('\n(report only — pass --write to apply)');
}
