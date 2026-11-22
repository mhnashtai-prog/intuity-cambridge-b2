#!/usr/bin/env python3
"""
One-take scripts for the lines Speaking in five still needs (22 Nov 2026).

    python3 tools/build-five-takes.py

Reads audio/speaking/LINES.csv and manifest.json, keeps the 'maya' lines and the examiner
lines of Speaking in five that have no recording yet, and writes:
  audio/speaking/FIVE-TAKES.txt   sections to paste into ElevenLabs, one generation each,
                                   a 2-second break between lines (as ALL-SAMARA-SCRIPTS.txt)
  audio/speaking/five-takes.json  for each section's MP3, the clip file names in order, so
                                   the take can be cut at its silences into named clips
Each section stays under 25 lines and 4,500 characters (ElevenLabs takes 5,000 a generation,
and grows unsteady with many breaks in one).
"""
import csv, json, pathlib
OUT = pathlib.Path('audio/speaking')
done = set(json.load(open(OUT / 'manifest.json'))['lines'].values())
rows = [r for r in csv.DictReader(open(OUT / 'LINES.csv', encoding='utf-8'))
        if r['file'] not in done and (r['role'] == 'maya' or r['where'].startswith('in five'))]
BR = ' <break time="2s" />'
SET = {'maya': 'Samara X · Multilingual v2 · Speed 0.91 · Stability 50 · Similarity 75 · Style 0 · Speaker boost on',
       'examiner': 'the examiner voice of the earlier examiner lines · Multilingual v2'}
sections = []
for role in ('maya', 'examiner'):
    for part in ('1', '2', '3', '4'):
        L = [r for r in rows if r['role'] == role and r['part'] == part]
        chunk, size = [], 0
        for r in L:
            n = len(r['text']) + len(BR) + 1
            if chunk and (size + n > 4500 or len(chunk) >= 25):
                sections.append((role, part, chunk)); chunk, size = [], 0
            chunk.append(r); size += n
        if chunk: sections.append((role, part, chunk))
txt = ['SPEAKING IN FIVE — the lines still to record (' + str(len(rows)) + ' clips)',
       'ONE generation per section: copy the lines between the rules, generate, download,',
       'and send me the MP3 with the name given. Don’t remove the breaks: they are where I cut.',
       'Lines ending in “…” trail off on purpose, as if Maya is about to go on.', '']
plan = {}
for k, (role, part, chunk) in enumerate(sections, 1):
    same = [s for s in sections if s[0] == role and s[1] == part]
    tag = '' if len(same) == 1 else '-' + 'abcdefgh'[same.index((role, part, chunk))]
    name = f'five-{role}-p{part}{tag}.mp3'
    plan[name] = [r['file'] for r in chunk]
    who = 'MAYA' if role == 'maya' else 'EXAMINER'
    txt += [f'════════ {k:02d} · {who} · PART {part}{tag.upper().replace("-", " ")} · {len(chunk)} lines  (save as: {name}) ════════',
            'Voice: ' + SET[role], '']
    txt += [r['text'] + BR for r in chunk]
    txt += ['', '']
(OUT / 'FIVE-TAKES.txt').write_text('\n'.join(txt), encoding='utf-8')
(OUT / 'five-takes.json').write_text(json.dumps(plan, indent=1), encoding='utf-8')
print(len(rows), 'lines in', len(sections), 'sections')
for n, f in plan.items(): print(' ', n, len(f))
