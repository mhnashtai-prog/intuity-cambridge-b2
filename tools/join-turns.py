"""Join each Part 3 turn's segment recordings into one MP3 per turn.

Part 3 is recorded piece by piece (start · view · reason · hand back), so each
piece can be highlighted and drilled. Played one after another, though, every
piece carries its own silence and its own download, and a turn sounds broken.
This joins the pieces of every turn into one file: silence trimmed from each
piece, a short natural gap inside a sentence (80 ms) and a longer one after a
full stop (280 ms). No new recording, no credits.

Writes audio/speaking/turn-<hash>.mp3 and audio/speaking/turns.json
({normalised full turn text: file}); tools/speaking-lines.py adds those to the
manifest, and tools/be2-voice.js plays them when the page speaks a whole turn.
Run after new Part 3 recordings:  python3 tools/join-turns.py && python3 tools/speaking-lines.py
"""
import hashlib, json, pathlib, re, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'audio' / 'speaking'
sys.path.insert(0, str(ROOT / 'tools'))

def norm(t):
    t = str(t).lower().replace('’', "'").replace('‘', "'")
    return re.sub(r'\s+', ' ', re.sub(r"[^a-z0-9' ]+", ' ', t)).strip()
def fname(role, text): return f"{role}-{hashlib.sha1(norm(text).encode()).hexdigest()[:10]}.mp3"

TRIM = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,"
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse")

D = json.loads((ROOT / 'skills/speaking/data/part3-talk.json').read_text(encoding='utf-8'))
index, made, skipped = {}, 0, 0
for t in D['tasks']:
    for alt in t['alts']:
        for part in ('discuss', 'decide'):
            for tn in alt[part]['turns']:
                segs = [s['t'] for s in tn['segs']]
                if len(segs) < 2: continue
                files = [OUT / fname('candidate', s) for s in segs]
                if not all(f.exists() for f in files): skipped += 1; continue
                full = ' '.join(segs)
                name = f"turn-{hashlib.sha1(norm(full).encode()).hexdigest()[:10]}.mp3"
                index[norm(full)] = name
                if (OUT / name).exists(): continue
                ins, parts = [], []
                for i, (f, s) in enumerate(zip(files, segs)):
                    ins += ['-i', str(f)]
                    parts.append(f"[{i}:a]aresample=44100,aformat=channel_layouts=mono,{TRIM}[s{i}]")
                chain = []
                for i, s in enumerate(segs):
                    chain.append(f"[s{i}]")
                    if i < len(segs) - 1:
                        gap = 0.28 if re.search(r'[.!?]["\']?$', s.strip()) else 0.08
                        parts.append(f"anullsrc=r=44100:cl=mono,atrim=duration={gap}[g{i}]")
                        chain.append(f"[g{i}]")
                parts.append("".join(chain) + f"concat=n={len(chain)}:v=0:a=1[out]")
                cmd = ['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(parts),
                       '-map', '[out]', '-ac', '1', '-ar', '44100', '-b:a', '64k', str(OUT / name)]
                subprocess.run(cmd, check=True)
                made += 1
(OUT / 'turns.json').write_text(json.dumps(index, ensure_ascii=False, indent=0), encoding='utf-8')
print(f"{made} turn files made · {len(index)} turns joined · {skipped} turns waiting for recordings")
