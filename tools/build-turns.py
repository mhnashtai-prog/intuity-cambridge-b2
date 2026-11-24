"""Join each candidate's turn (every stage of it) into one recording.

24 Nov 2026 (the owner: Part 2 'pauses in the middle' of a minute on the iPhone). A turn
was played as one clip per stage, so a minute meant five fetches mid-speech; on a phone
network one can stall. Each turn is now one file: the stages with 0.3 s between them,
as recorded. The page plays the joined file when there is one, the stages otherwise.
Run after the stage clips exist, then tools/speaking-lines.py (it registers them).
"""
import hashlib, json, pathlib, re, subprocess, tempfile
ROOT = pathlib.Path('.'); OUT = ROOT / 'audio' / 'speaking'; DATA = ROOT / 'skills' / 'speaking' / 'data'
def norm(t):
    t = str(t).lower().replace('’', "'").replace('‘', "'")
    return re.sub(r'\s+', ' ', re.sub(r"[^a-z0-9' ]+", ' ', t)).strip()
def fname(role, text): return f"{role}-{hashlib.sha1(norm(text).encode()).hexdigest()[:10]}.mp3"
M = json.load(open(OUT / 'manifest.json'))['lines']
turns = []
def take(stages):
    t = [s['t'] for s in stages]
    if len(t) > 1: turns.append(t)
for f, walk in (('part1-dialogues.json', lambda d: [tn['stages'] for tp in d['topics'] for tn in tp['turns']]),
                ('part1-model.json', lambda d: [tn['stages'] for tn in d['turns']]),
                ('part2-dialogues.json', lambda d: [p[k] for p in d['pairs'] for k in ('tomas', 'beatriz', 'tomasFollow', 'beatrizFollow')]),
                ('part3-dialogues.json', lambda d: [tn['stages'] for tk in d['tasks'] for ph in ('discuss', 'decide') for tn in tk[ph]])):
    p = DATA / f
    if p.exists():
        for st in walk(json.load(open(p, encoding='utf-8'))): take(st)
made = skip = 0
index = {}
with tempfile.TemporaryDirectory() as tmp:
    sil = pathlib.Path(tmp) / 'gap.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', '0.3', str(sil)], check=True)
    for t in turns:
        files = [M.get(norm(x)) for x in t]
        if not all(files): skip += 1; continue
        out = OUT / fname('joined', ' '.join(t)); index[norm(' '.join(t))] = out.name
        if out.exists(): continue
        inputs, n = [], 0
        for i, fl in enumerate(files):
            inputs += ['-i', str(OUT / fl)]; n += 1
            if i < len(files) - 1: inputs += ['-i', str(sil)]; n += 1
        fc = ''.join(f'[{i}:a]aresample=44100,aformat=channel_layouts=mono[a{i}];' for i in range(n)) + ''.join(f'[a{i}]' for i in range(n)) + f'concat=n={n}:v=0:a=1[o]'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', fc, '-map', '[o]', '-ar', '44100', '-ac', '1', '-b:a', '96k', str(out)], check=True)
        made += 1
(OUT / 'joined.json').write_text(json.dumps(index, ensure_ascii=False, indent=0), encoding='utf-8')
print(f'joined turns: {made} made, {len(turns) - made - skip} already there, {skip} waiting for clips')
