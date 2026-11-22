#!/usr/bin/env python3
"""
Cut the one-take MP3s of FIVE-TAKES.txt into named clips (22 Nov 2026).

    python3 tools/split-five-takes.py path/to/five-maya-p1.mp3 [more.mp3 …]

For each take, finds its silences (the 2-second breaks), checks the number of pieces
against audio/speaking/five-takes.json, and writes each piece to audio/speaking/ under its
clip's file name, with 0.15 s of air kept at each end. A take whose count does not match
is reported and not cut (re-generate it, or say which line went missing).
Then run python3 tools/speaking-lines.py to add the clips to manifest.json.
"""
import json, pathlib, re, subprocess, sys
OUT = pathlib.Path('audio/speaking')
plan = json.load(open(OUT / 'five-takes.json'))
def pieces(mp3, noise, gap):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', mp3, '-af', f'silencedetect=noise={noise}dB:d={gap}', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    dur = float(re.search(r'Duration: (\d+):(\d+):([\d.]+)', r).groups()[2]) + 60*float(re.search(r'Duration: (\d+):(\d+)', r).group(2)) + 3600*float(re.search(r'Duration: (\d+)', r).group(1))
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', r)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', r)]
    cuts, t = [], 0.0
    for s, e in zip(starts, ends + [dur] * (len(starts) - len(ends))):
        if s - t > 0.3: cuts.append((max(0, t - .15), s + .15))
        t = e
    if dur - t > 0.3: cuts.append((max(0, t - .15), dur))
    return cuts
for mp3 in sys.argv[1:]:
    name = pathlib.Path(mp3).name
    if name not in plan: print('?', name, 'is not a take in five-takes.json'); continue
    want = plan[name]
    for noise, gap in ((-40, 1.2), (-35, 1.0), (-45, 1.4), (-30, .9)):
        cuts = pieces(mp3, noise, gap)
        if len(cuts) == len(want): break
    if len(cuts) != len(want):
        print('✗', name, f'{len(cuts)} pieces, {len(want)} lines: not cut'); continue
    for (a, b), f in zip(cuts, want):
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', mp3, '-ss', f'{a:.3f}', '-to', f'{b:.3f}',
                        '-c:a', 'libmp3lame', '-q:a', '3', str(OUT / f)], check=True)
    print('✓', name, len(want), 'clips')
