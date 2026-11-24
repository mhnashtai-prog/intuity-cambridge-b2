#!/usr/bin/env python3
"""
Every line the Speaking pages say aloud, as a recording list. Run from the repo root:

    python3 tools/speaking-lines.py

Writes two files:
  audio/speaking/LINES.csv      — every line: file name to save it as, who says it, which
                                   part, and the exact words. Record each line in ElevenLabs
                                   and save it under that file name.
  audio/speaking/manifest.json  — only the lines whose MP3 is actually in audio/speaking/.
                                   tools/be2-voice.js reads this: a listed line plays the
                                   recording, any other line keeps the browser voice.

Run it again after adding recordings. File names come from the words themselves, so a
line keeps its file name however the data files are reordered; change the words and it
becomes a new line to record.
"""
import csv, hashlib, json, pathlib, re

ROOT = pathlib.Path('.')
OUT = ROOT / 'audio' / 'speaking'
SRC = ROOT / 'skills' / 'speaking' / 'data'

def norm(t):
    t = str(t).lower().replace('’', "'").replace('‘', "'")
    return re.sub(r'\s+', ' ', re.sub(r"[^a-z0-9' ]+", ' ', t)).strip()

def fname(role, text):
    return f"{role}-{hashlib.sha1(norm(text).encode()).hexdigest()[:10]}.mp3"

lines = {}   # norm(text) -> row

def add(text, role, part, voice, where):
    if not text or not str(text).strip(): return
    k = norm(text)
    if k in lines: return
    lines[k] = {'file': fname(role, text), 'role': role, 'part': part, 'voice': voice, 'where': where, 'text': str(text).strip()}

def voice_of(voices, alt_id, who='a'):
    v = next((x for x in voices if x.get('id') == alt_id), {})
    if who == 'b':
        return (v.get('b') or 'Candidate B') + (' · female' if v.get('bFem') else ' · male')
    name = v.get('a') or v.get('tab') or alt_id
    return f"{name} · {'female' if v.get('fem') else 'male'}"

# One walker for all four parts. Examiner lines live under question / followUp /
# handover (and Part 3's script); candidate lines are the `t` of every seg. The voice is
# read from where the seg sits: its answer's index under `alts` picks the speaker pair,
# `who` (Part 3) or a `partner` turn (Part 4) picks Candidate B.
def walk(o, part, V, where='', alt=None, b=False):
    if isinstance(o, dict):
        here = o.get('question') if isinstance(o.get('question'), str) else (o.get('id') or where)
        for k in ('question', 'followUp', 'handover', 'scenario', 'talkLine', 'decideLine'):
            if isinstance(o.get(k), str): add(o[k], 'examiner', part, 'Examiner · male', here)
        if isinstance(o.get('theme'), str):     # Part 2: said as "Here are your photographs. They show…"
            add('Here are your photographs. ' + o['theme'], 'examiner', part, 'Examiner · male', here)
        if isinstance(o.get('segs'), list):
            who_b = b or o.get('who') == 'b'
            vid = V[alt]['id'] if alt is not None and alt < len(V) else (V[0]['id'] if V else 'default')
            for sg in o['segs']:
                if isinstance(sg, dict) and isinstance(sg.get('t'), str):
                    add(sg['t'], 'candidate', part, voice_of(V, vid, 'b' if who_b else 'a'), here)
        for k, v in o.items():
            if k in ('segs', 'phraseBank', 'moves', 'functions', 'voices', 'modes', 'photos'): continue
            if k == 'alts' and isinstance(v, list):
                for n, a in enumerate(v): walk(a, part, V, here, n, b)
            else:
                walk(v, part, V, here, alt, b or k == 'partner')
    elif isinstance(o, list):
        for v in o: walk(v, part, V, where, alt, b)

for part, name in ((1, 'part1-answers'), (2, 'part2-turn'), (3, 'part3-talk'), (4, 'part4-views')):
    d = json.load(open(SRC / f'{name}.json')); V = d.get('voices', [])
    for k, line in (d.get('script') or {}).items(): add(line, 'examiner', part, 'Examiner · male', k)
    walk({k: v for k, v in d.items() if k not in ('script',)}, part, V)

# SPEAKING IN FIVE (22 Nov 2026): what skills/speaking/five.html and gate.html say aloud.
# Maya says each wording with each answer a pupil can pick (an open end is recorded with its
# "…", so her voice trails off as if to go on; the app matches it without the dots). The
# examiner asks each subject's question. Start here is Maya's thirty seconds for each Part.
FIVE = ROOT / 'data' / 'speaking' / 'five'
MAYA = 'Maya'
for n in (1, 2, 3, 4):
    f = FIVE / f'part{n}.json'
    if not f.exists(): continue
    d = json.load(open(f))
    for sub in d['subjects']:
        # 22 Nov 2026 (the owner: save credits): a line with the pupil's answer in it is recorded
        # for each topic's FIRST answer only, the one START takes; other answers keep the phone's voice
        for pi, x in enumerate(sub['picks']):
            q = sub['q'].replace('{X}', x)
            if pi == 0 or '{X}' not in sub['q']: add(q, 'examiner', n, 'Examiner · male', 'in five · ' + sub['label'])
            for sl in d['slots']:
                for w in sl['ways']:
                    if pi and '{X}' in w['t']: continue
                    t = w['t'].replace('{X}', x).replace('{a}', sub['a']).replace('{plural}', sub['plural'])
                    add(t, 'maya', n, MAYA, 'in five · ' + sl['label'])
# THE TEST (23 Nov 2026): the examiner's linking lines of skills/speaking/test.html; until
# Daniel records them they are shown, not spoken (the page never reads the examiner by phone)
for t, n in (("Good afternoon. My name's Maya. First of all, we'd like to know something about you.", 1),
             ("In this part of the test, I'm going to give each of you two photographs. I'd like you to talk about your photographs on your own for about a minute, and also to answer a short question about your partner's photographs.", 2),
             ("Thank you.", 2), ("Thank you. That is the end of the test.", 4)):
    add(t, 'examiner', n, 'Examiner · Maya', 'the test')
# THE MODEL PART 1 (24 Nov 2026): Beatriz (safe) and Tomás (stronger), one clip per stage
PM = ROOT / 'skills' / 'speaking' / 'data' / 'part1-model.json'
if PM.exists():
    pm = json.load(open(PM, encoding='utf-8'))
    for it in pm.get('intro', []):
        if it['who'] == 'examiner': add(it['t'], 'examiner', 1, 'Examiner · Maya', 'model Part 1 · intro')
        else: c = pm['cast'][it['who']]; add(it['t'], 'candidate', 1, c['name'] + ' · ' + c['voice'], 'model Part 1 · intro')
    for tn in pm['turns']:
        cast = pm['cast'][tn['who']]
        for st in tn['stages']:
            add(st['t'], 'candidate', 1, cast['name'] + ' · ' + cast['voice'], 'model Part 1 · ' + st['stage'])
# THE SEVEN PART 1 INTERVIEWS (24 Nov 2026): every topic in the school's pattern, Maya asking
PD = ROOT / 'skills' / 'speaking' / 'data' / 'part1-dialogues.json'
if PD.exists():
    pd = json.load(open(PD, encoding='utf-8'))
    for tp in pd['topics']:
        for tn in tp['turns']:
            add(tn['q'], 'examiner', 1, 'Examiner · Maya', 'Part 1 interview · ' + tp['id'])
            cast = pd['cast'][tn['who']]
            for st in tn['stages']:
                add(st['t'], 'candidate', 1, cast['name'] + ' · ' + cast['voice'], 'Part 1 interview · ' + tp['id'] + ' · ' + st['stage'])
# THE EIGHT PART 2 LONG TURNS (24 Nov 2026): similarities, differences, speculation
PD2 = ROOT / 'skills' / 'speaking' / 'data' / 'part2-dialogues.json'
if PD2.exists():
    pd2 = json.load(open(PD2, encoding='utf-8'))
    for pr in pd2['pairs']:
        for key, who in (('tomas', 'tomas'), ('beatriz', 'beatriz'), ('tomasFollow', 'tomas'), ('beatrizFollow', 'beatriz')):
            c = pd2['cast'][who]
            for st in pr[key]:
                add(st['t'], 'candidate', 2, c['name'] + ' · ' + c['voice'], 'Part 2 · ' + pr['id'] + ' · ' + key + ' · ' + st['stage'])
GATE = (ROOT / 'skills' / 'speaking' / 'gate.html').read_text(encoding='utf-8')
for m in re.finditer(r"(\d):\{name:'[^']*',min:'[^']*',share:\d+,page:'[^']*',\s*what:'([^']*)',\s*five:\[([^\]]*)\],\s*tip:'([^']*)'\}", GATE):
    n, what, five, tip = m.group(1), m.group(2), m.group(3), m.group(4)
    moves = [x.strip().strip("'") for x in five.split(',')]
    # the exact words gate.html's script() says
    add(f"Part {n}. {what} {tip} Five moves: {', '.join(moves)}.", 'maya', int(n), MAYA, 'Start here')

OUT.mkdir(parents=True, exist_ok=True)
rows = sorted(lines.values(), key=lambda r: (r['part'], r['role'] != 'examiner', r['voice'], r['where']))
with open(OUT / 'LINES.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=['file', 'role', 'part', 'voice', 'where', 'text'])
    w.writeheader(); w.writerows(rows)
present = {p.name for p in OUT.glob('*.mp3')}
import hashlib
manifest = {'note': 'Generated by tools/speaking-lines.py. Lists only recordings that exist. '
                    "'v' is a fingerprint of each file, so a re-recorded line is never played from an old cache.",
            'lines': {**{k: r['file'] for k, r in lines.items() if r['file'] in present},
                      # whole Part 3 turns, joined from their pieces by tools/join-turns.py
                      **{k: f for k, f in (json.loads((OUT / 'turns.json').read_text(encoding='utf-8')).items()
                                            if (OUT / 'turns.json').exists() else []) if f in present}},
            'v': {n: hashlib.md5((OUT / n).read_bytes()).hexdigest()[:8] for n in sorted(present)}}
(OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=0), encoding='utf-8')
by = {}
for r in rows: by.setdefault((r['part'], r['role']), 0); by[(r['part'], r['role'])] += 1
print(f"{len(rows)} lines to record · {len(manifest['lines'])} recorded so far")
for (p, role), n in sorted(by.items()): print(f"  Part {p} · {role:9} {n}")
