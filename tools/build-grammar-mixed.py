"""Mixed grammar (3 Nov 2026): one Board and one Ultimate Challenge that draw
from every grammar topic, so a student must decide which structure a sentence
needs, as in the exam, instead of recognising one set's pattern.
  Board:    challenge-grammar-mixed.json imports the ten topic Boards (live).
  Ultimate: ultimate-grammar-mixed.json is built here from the ten Ultimate
            files (the engine reads an Ultimate's own rounds, not imports).
Rerun after editing any grammar Ultimate file."""
import json, os
D = os.path.join(os.path.dirname(__file__), '..', 'data', 'challenge')
T = json.load(open(os.path.join(D, 'challenge-topics.json')))
ids = [t['id'] for t in [s for s in T['sections'] if s['id'] == 'grammar'][0]['topics'] if t['id'] != 'grammar-mixed']
files = [t['file'] for t in [s for s in T['sections'] if s['id'] == 'grammar'][0]['topics'] if t['id'] != 'grammar-mixed']
board = {"version": 1, "section": "grammar", "topic": "Mixed grammar", "level": "B2",
         "about": "Rounds from every grammar topic, imported from the topic Boards.",
         "rounds": [], "imports": [{"file": "/data/challenge/" + f} for f in files]}
json.dump(board, open(os.path.join(D, 'challenge-grammar-mixed.json'), 'w'), ensure_ascii=False, indent=1)
rounds = []
for f in files:
    p = os.path.join(D, f.replace('challenge-', 'ultimate-', 1))
    if os.path.exists(p):
        rounds += json.load(open(p)).get('rounds', [])
ult = {"version": 1, "section": "grammar", "topic": "Mixed grammar", "level": "B2+", "ultimate": True,
       "about": "Every grammar topic's Ultimate rounds in one pool (built by tools/build-grammar-mixed.py).",
       "rounds": rounds}
json.dump(ult, open(os.path.join(D, 'ultimate-grammar-mixed.json'), 'w'), ensure_ascii=False, indent=1)
print(len(files), 'boards;', len(rounds), 'ultimate rounds')
