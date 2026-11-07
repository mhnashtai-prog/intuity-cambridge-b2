#!/usr/bin/env python3
"""
THE ESSAY BANK — one list of phrases, every page built from it (Nov 2026)

Before: four files each held their own copy of the essay phrases, and 87% of
the 684 phrases lived in only one of them, so a phrase learnt on one page
could be missing on the next. Now:

  data/writing/bank/essay-phrases.json   every phrase, merged from the four
                                          (the audit list)
  data/writing/bank/essay-marks.json     the teacher's marks: keep / star / cut
                                          (exported from the audit page)
  data/writing/bank/essays.json          THE BANK: the two above, joined —
                                          written by this script

and this script writes the essay part of each page's own file from the bank:

  data/writing/portfolio.json                 Essentials (the sheet)
  data/writing/cue-generator.json             On paper (cue cards)
  skills/writing/essays/data/essay-cards-models.json
                                              Model tab + Model Generator
  data/writing/five/essays.json               Your essay in five

What it does to each:
  cut   the phrase is removed wherever it appears
  star  the safe choice: cue card 1 (go:true), first and bold in Essentials,
        first in the Model's pool, first way in the five
  keep  (and unmarked) stays; a kept phrase missing from a page is added to
        the matching slot, so no page is a dead end. The five is a curated
        drill of three ways a slot, so nothing is added to it.

Run:  python3 tools/writing-bank/build.py            (report only)
      python3 tools/writing-bank/build.py --apply    (write the files)
"""
import json, re, sys, os, collections

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
P = lambda *a: os.path.join(ROOT, *a)
APPLY = '--apply' in sys.argv

CODES = ['fa', 'op', 'ad', 'ps', 'ce', 'st']
LONG = {'fa': 'for-against', 'op': 'opinion', 'ad': 'agree-disagree', 'ps': 'problem-solution',
        'ce': 'cause-effect', 'st': 'speculation-trends'}
NAME = {'fa': 'For & Against', 'op': 'Opinion', 'ad': 'Agree & Disagree', 'ps': 'Problems & Solutions',
        'ce': 'Cause & Effect', 'st': 'Speculation & Trends', 'all': 'All essay types'}
CODE_OF = {v: k for k, v in NAME.items()}

# ── the same text rules as the audit, so a page's phrase finds its row ──
def clean(t):
    t = str(t); t = re.sub(r'\*\*', '', t); t = re.sub(r'^\s*>\s*', '', t)
    t = re.sub(r'\[[^\]]*\]|\{[^}]*\}', '…', t); t = t.replace('...', '…')
    t = re.sub(r'…(\s*…)+', '…', t); t = re.sub(r'…\.+', '…', t); t = re.sub(r'\s+', ' ', t).strip()
    return t
def key(t):
    k = clean(t).lower().replace('’', "'")
    k = re.sub(r'[\s…,.;:!?]+$', '', k); k = re.sub(r'^[\s…]+', '', k)
    return re.sub(r'\s+', ' ', k)

ROWS = json.load(open(P('data/writing/bank/essay-phrases.json')))
try: MARKS = json.load(open(P('data/writing/bank/essay-marks.json')))
except FileNotFoundError: MARKS = {}
for r in ROWS: r['m'] = MARKS.get(r['id'], 'keep')
INDEX = {}
for r in ROWS: INDEX[(CODE_OF[r['ty']], r['pa'], key(r['t']))] = r
def row(code, part, text):
    return INDEX.get((code, part, key(text))) or INDEX.get(('all', part, key(text)))

# body slots: what each page calls the same slot, per essay type
BODY = {  # slot -> (portfolio column, cue step labels (first is filled), model pools (first is filled))
 'fa': {'For': (0, ['Advantages'], ['keyFor']), 'Against': (1, ['Disadvantages', 'Turn'], ['keyAgainst'])},
 'ad': {'For': (0, ['Arguments for'], ['keyOpen', 'keyMore']), 'Against': (1, ['Arguments against', 'Your position'], [])},
 'ps': {'Solutions': (0, ['Solutions', 'Who acts'], ['keyOpen', 'keyMore']), 'Results': (1, ['Results'], [])},
 'ce': {'Causes': (0, ['Causes'], ['keyOpen', 'keyMore']), 'Effects': (1, ['Effects'], [])},
 'op': {'Reasons': (0, ['First reason', 'Second reason', 'Third reason'], ['keyOpen', 'keyMore'])},
 'st': {'Predictions': (0, ['Predict', 'Condition', 'Long term'], ['keyOpen', 'keyMore'])},
}
# every name a page gives a body slot -> the shared slot
NAMES = {
 'fa': {'For': 'For', 'Advantages': 'For', 'Against': 'Against', 'Disadvantages': 'Against', 'Turn': 'Against'},
 'ad': {'For': 'For', 'Arguments for': 'For', 'Main point': 'For', 'Further point': 'For',
        'Against': 'Against', 'Arguments against': 'Against', 'Your position': 'Against'},
 'ps': {'Solutions': 'Solutions', 'Who acts': 'Solutions', 'Main point': 'Solutions', 'Further point': 'Solutions', 'Results': 'Results'},
 'ce': {'Causes': 'Causes', 'Main point': 'Causes', 'Further point': 'Causes', 'Effects': 'Effects'},
 'op': {}, 'st': {},
}
def body_slot(code, sl):
    """the bank row's slot name (as any page named it) -> the shared slot"""
    if code in ('op', 'st'): return list(BODY[code])[0]
    for n in sl.split(' / '):
        if n in NAMES[code]: return NAMES[code][n]
    return None
def is_frame(t):   # a whole frame a student can start a sentence with
    return bool(t) and t[0].isupper()
def to_fragment(t):  # "The main advantage of … is that" -> "the main advantage of ..."
    if not re.match(r'^(The|One|A|An|Another|My|This|Its)\b', t): return None
    head = t.split('…')[0].strip().rstrip(',')
    return head[0].lower() + head[1:] + ' ...'
def to_cue(t):       # "Few people would deny that …" -> "Few people would deny that"
    t = re.sub(r'\s*…\s*$', '', t)
    return t.replace('…', '[topic]')

REPORT = collections.defaultdict(lambda: collections.Counter())
def note(page, what, n=1): REPORT[page][what] += n

def kept(code, part, pick):
    return [r for r in ROWS if CODE_OF[r['ty']] in (code,) and r['pa'] == part and r['m'] != 'cut' and pick(r)]

# ── 1. Essentials: data/writing/portfolio.json ───────────────────────────
def build_portfolio():
    D = json.load(open(P('data/writing/portfolio.json')))
    for c in CODES:
        sh = D['sheets'][c]
        for b in sh['bands']:
            part = {'Introduction': 'Introduction', 'Arguments': 'Body', 'Conclusion': 'Conclusion'}[b['label']]
            tags = b.get('tags') or []
            for i, col in enumerate(b['cols']):
                out, seen = [], set()
                for ph in col:
                    r = row(c, part, ph)
                    if r and r['m'] == 'cut': note('Essentials', 'cut'); continue
                    seen.add(key(ph)); out.append(ph)
                # add kept phrases this column is missing
                if part == 'Introduction': want = ['Set the scene', 'Say what you will do'][i] if i < 2 else None; pick = lambda r: want in r['sl'].split(' / ')
                elif part == 'Conclusion': pick = lambda r: 'Verdict' in r['sl'].split(' / ')
                else:
                    slots = [s for s, v in BODY[c].items() if v[0] == i]
                    pick = lambda r: body_slot(c, r['sl']) in slots
                for r in kept(c, part, pick):
                    if key(r['t']) in seen or not is_frame(r['t']): continue
                    out.append(r['t']); seen.add(key(r['t'])); note('Essentials', 'added')
                # the starred phrase leads its column, in bold
                st = [ph for ph in out if (row(c, part, ph) or {}).get('m') == 'star']
                if st:
                    out = [ph for ph in out if ph not in st]
                    lead = ['**' + clean(ph).replace('**', '') + '**' for ph in st]
                    out = lead + out; note('Essentials', 'starred', len(st))
                b['cols'][i] = out
    return D

# ── 2. Cue cards: data/writing/cue-generator.json ────────────────────────
def build_cue():
    D = json.load(open(P('data/writing/cue-generator.json')))
    for t in D['types']:
        c = t['id']
        if c not in CODES: continue
        for p in t['paras']:
            part = 'Introduction' if p['name'] == 'Introduction' else 'Conclusion' if p['name'] == 'Conclusion' else 'Body'
            for s in p['steps']:
                if s.get('support'): continue
                items, seen = [], set()
                for it in s['items']:
                    r = row(c, part, it['t'])
                    if r and r['m'] == 'cut': note('Cue cards', 'cut'); continue
                    seen.add(key(it['t'])); items.append(it)
                if part == 'Introduction': pick = lambda r: s['label'] in r['sl'].split(' / ')
                elif part == 'Conclusion': pick = lambda r: 'Verdict' in r['sl'].split(' / ')
                else:
                    sl = [k for k, v in BODY[c].items() if s['label'] in v[1]]
                    # a slot spread over several steps fills only its first step
                    pick = (lambda r: body_slot(c, r['sl']) in sl) if sl and BODY[c][sl[0]][1][0] == s['label'] else (lambda r: False)
                for r in kept(c, part, pick):
                    if key(r['t']) in seen or not is_frame(r['t']): continue
                    items.append({'t': to_cue(r['t']), 'h': '', 'go': False}); seen.add(key(r['t'])); note('Cue cards', 'added')
                if not items: continue
                st = [i for i, it in enumerate(items) if (row(c, part, it['t']) or {}).get('m') == 'star']
                if st:
                    for it in items: it['go'] = False
                    items[st[0]]['go'] = True; note('Cue cards', 'starred')
                s['items'] = items
    return D

# ── 3. Model tab + Model Generator: essay-cards-models.json ──────────────
def build_model():
    D = json.load(open(P('skills/writing/essays/data/essay-cards-models.json')))
    def pool(lst, code, part, pick=None, frag=False):
        out, seen = [], set()
        for ph in lst:
            r = row(code, part, ph)
            if r and r['m'] == 'cut': note('Model', 'cut'); continue
            seen.add(key(ph)); out.append(ph)
        if pick:
            for r in kept(code, part, pick):
                t = to_fragment(r['t']) if frag else r['t'].replace('…', '...')
                if not t or key(t) in seen: continue
                out.append(t); seen.add(key(t)); note('Model', 'added')
        st = [ph for ph in out if (row(code, part, ph) or {}).get('m') == 'star']
        if st: out = st + [ph for ph in out if ph not in st]; note('Model', 'starred', len(st))
        return out
    S = D['shared']
    S['background'] = pool(S['background'], 'all', 'Introduction')
    for c in CODES:
        T = D['types'][LONG[c]]
        T['open']['aim'] = pool(T['open']['aim'], c, 'Introduction', lambda r: 'Say what you will do' in r['sl'].split(' / '))
        T['close']['verdict'] = pool(T['close']['verdict'], c, 'Conclusion')
        for k, v in list(T['argue'].items()):
            if k in ('bodyPlan', 'signpostPlan') or not isinstance(v, list): continue
            slots = [s for s, x in BODY[c].items() if k in x[2]]
            first = slots and BODY[c][slots[0]][2][0] == k
            T['argue'][k] = pool(v, c, 'Body', (lambda r: body_slot(c, r['sl']) in slots) if first else None, frag=True)
    return D

# ── 4. Your essay in five: data/writing/five/essays.json ─────────────────
def build_five():
    D = json.load(open(P('data/writing/five/essays.json')))
    for sl in D['slots']:
        part = {'Introduction': 'Introduction', 'Conclusion': 'Conclusion'}.get(sl['part'], 'Body')
        ways = [w for w in sl['ways'] if (row('all', part, w['t']) or {}).get('m') != 'cut'] or sl['ways'][:1]
        note('Your essay in five', 'cut', len(sl['ways']) - len(ways))
        st = [w for w in ways if (row('all', part, w['t']) or {}).get('m') == 'star']
        if st: ways = st[:1] + [w for w in ways if w is not st[0]]; note('Your essay in five', 'starred')
        sl['ways'] = ways
    return D

OUT = {
    'data/writing/portfolio.json': build_portfolio(),
    'data/writing/cue-generator.json': build_cue(),
    'skills/writing/essays/data/essay-cards-models.json': build_model(),
    'data/writing/five/essays.json': build_five(),
}
BANK = {'note': 'THE ESSAY BANK. Every essay phrase once, with the teacher\'s mark. Edit marks in '
                'essay-marks.json (or the audit page) and run tools/writing-bank/build.py --apply; '
                'never edit the four page files\' essay phrases by hand.',
        'counts': dict(collections.Counter(r['m'] for r in ROWS)),
        'phrases': [{'id': r['id'], 'type': r['ty'], 'part': r['pa'], 'slot': r['sl'], 't': r['t'], 'mark': r['m']} for r in ROWS]}

for page, c in REPORT.items(): print(f'{page:20}', dict(c))
print('bank:', BANK['counts'])
if APPLY:
    for f, d in OUT.items():
        # keep each file's own indent and ending, so a diff shows only phrase changes
        old = open(P(f)).read(); lines = old.split('\n')
        ind = next((len(x) - len(x.lstrip(' ')) for x in lines[1:] if x.strip()), 1)
        with open(P(f), 'w') as fh:
            json.dump(d, fh, ensure_ascii=False, indent=ind)
            if old.endswith('\n'): fh.write('\n')
    with open(P('data/writing/bank/essays.json'), 'w') as fh: json.dump(BANK, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('written')
else:
    print('(report only: add --apply to write)')
