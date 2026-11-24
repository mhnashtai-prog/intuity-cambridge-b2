#!/usr/bin/env python3
"""
Join the model Part 1 into one recording (24 Nov 2026).

    python3 tools/build-part1-model.py

Reads skills/speaking/data/part1-model.json and audio/speaking/manifest.json: for each
turn, the examiner's question, then each stage of the answer. Silences trimmed, every
clip levelled to -18 LUFS, 0.7 s after a question, 0.3 s between stages, 1 s after an
answer. Writes audio/speaking/full/part1-model.mp3 and its script (.txt). Run it again
whenever a voice is re-recorded.
"""
import json, re, subprocess, tempfile, os
norm = lambda t: re.sub(r'\s+', ' ', re.sub(r"[^a-z0-9' ]+", ' ', t.lower().replace('’', "'"))).strip()
m = json.load(open('audio/speaking/manifest.json'))['lines']
D = json.load(open('skills/speaking/data/part1-model.json', encoding='utf-8'))
W = tempfile.mkdtemp(); parts = []; k = [0]
def clip(f):
    k[0] += 1; o = f'{W}/c{k[0]:03d}.wav'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'audio/speaking/' + f, '-af',
        'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-18:TP=-1.5:LRA=11',
        '-ar', '44100', '-ac', '1', o], check=True); return o
def gap(s):
    k[0] += 1; o = f'{W}/g{k[0]:03d}.wav'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', str(s), o], check=True); return o
txt = ['B2 FIRST SPEAKING · PART 1 · THE MODEL INTERVIEW (Funchal)', 'Examiner: Maya · Beatriz: the safe answer · Tomás: the stronger answer', '']
parts.append(gap(0.4))
for it in D.get('intro', []):   # Maya introduces herself, the candidates give their names
    f = m.get(norm(it['t']))
    if f: parts += [clip(f), gap(0.9)]
    txt.append(('EXAMINER' if it['who'] == 'examiner' else D['cast'][it['who']]['name'].upper()) + ': ' + it['t'])
txt.append('')
for tn in D['turns']:
    parts += [clip(m[norm(tn['q'])]), gap(0.8)]; txt.append('EXAMINER: ' + tn['q'])
    for i, st in enumerate(tn['stages']):
        parts += [clip(m[norm(st['t'])]), gap(0.3 if i < len(tn['stages']) - 1 else 1.0)]
    txt.append(D['cast'][tn['who']]['name'].upper() + ': ' + ' '.join(st['t'] for st in tn['stages'])); txt.append('')
open(f'{W}/l.txt', 'w').write(''.join(f"file '{p}'\n" for p in parts))
os.makedirs('audio/speaking/full', exist_ok=True)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{W}/l.txt', '-c:a', 'libmp3lame', '-q:a', '2', 'audio/speaking/full/part1-model.mp3'], check=True)
open('audio/speaking/full/part1-model.txt', 'w', encoding='utf-8').write('\n'.join(txt))
print('audio/speaking/full/part1-model.mp3', subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'audio/speaking/full/part1-model.mp3'], capture_output=True, text=True).stdout.strip(), 's')
