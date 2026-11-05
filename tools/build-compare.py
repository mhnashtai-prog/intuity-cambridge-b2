"""COMPARE · more examples for every card (5 Nov 2026).

Writes data/writing/compare-examples.json: for each text type (essay, article,
review, report) and each part (intro, body, concl), every paragraph of that
part in the app's model texts, with the words that give the type away marked
[[like this]]. The giveaway words come from Michael's own portfolio sheets
(data/writing/portfolio.json: op = opinion essay, ar, rv, rp) plus the linkers
the model texts use, split at "…" and "/" into fragments of two words or more.
Rerun after editing the model texts or the portfolio."""
import json, re, os
R = os.path.join(os.path.dirname(__file__), '..')
W = os.path.join(R, 'skills', 'writing')
port = json.load(open(os.path.join(R, 'data', 'writing', 'portfolio.json')))

STOP = set('a an the is are was were be been it this that these those to of in on for with and or but as at by from so than then there their they we you i my our your its it\u2019s it\'s not no more most very can could would will may might should has have had do does did what which who how when where why all any some one'.split())
def fragments(sheet):
    out = set()
    for b in port['sheets'][sheet].get('bands', []):
        for col in b.get('cols', []):
            for it in col:
                it = re.sub(r'\*\*|\|\|.*$|\(.*?\)|^[>#=!]+\s*', '', it)
                for part in re.split(r'…|\.\.\.|/|;|\?|:', it):
                    w = re.sub(r'[“”"]', '', part).strip(' ,.-–—')
                    words = [x.lower() for x in re.findall(r"[A-Za-z\u2019']+", w)]
                    if len(words) >= 2 and len(w) >= 9 and any(x not in STOP for x in words): out.add(w)
    return out

EXTRA = {
 'essay': ['This is because', 'For example', 'For instance', 'As a result', 'Consequently', 'On the whole', 'All things considered',
           'While there are many advantages', 'The main advantage of', 'The key disadvantage of', 'In conclusion', 'To sum up',
           'On the other hand', 'Furthermore', 'Moreover', 'Hence', 'In my opinion', 'It is often argued that'],
 'article': ['I’ll never forget', 'For me personally', 'Whether you agree or not', 'Have you ever', 'Imagine', 'Let’s face it',
             'Believe it or not', 'the best thing about', 'What makes it'],
 'review': ['I would highly recommend', 'I visited', 'By far the best', 'What makes this', 'is definitely worth', 'I can assure you',
            'For anyone who', 'this is a must', 'The only downside', 'On the downside', 'I would recommend'],
 'report': ['The main objective of this report', 'This report is based on', 'It is generally agreed that', 'One positive aspect',
            'one major concern', 'By far the worst aspect', 'This is mainly due to', 'One key recommendation would be',
            'it may be worth considering', 'Taking everything into account', 'it seems clear that', 'In order to improve']
}
LEX = {'essay': fragments('op') | set(EXTRA['essay']), 'article': fragments('ar') | set(EXTRA['article']),
       'review': fragments('rv') | set(EXTRA['review']), 'report': fragments('rp') | set(EXTRA['report'])}

def mark(text, lex):
    spans = []
    low = text.lower()
    for ph in sorted(lex, key=len, reverse=True):
        p = ph.lower().replace('’', "'")
        t = low.replace('’', "'")
        i = t.find(p)
        while i >= 0:
            j = i + len(p)
            if (i == 0 or not t[i-1].isalnum()) and (j == len(t) or not t[j].isalnum()) and not any(a < j and i < b for a, b in spans):
                spans.append((i, j))
            i = t.find(p, j)
    for a, b in sorted(spans, reverse=True):
        text = text[:a] + '[[' + text[a:b] + ']]' + text[b:]
    return text

strip = lambda h: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', h)).strip()
OUT = {k: {'intro': [], 'body': [], 'concl': []} for k in LEX}
def add(kind, part, src, tag, t, hd=None, hd2=None, t2=None):
    x = {'src': src, 'tag': tag, 't': mark(t, LEX[kind])}
    # an article that opens with a question: the question is the giveaway
    if kind == 'article' and part == 'intro':
        m = re.match(r'^([^.!?]{8,}\?)', t)
        if m and not x['t'].startswith('[['): x['t'] = '[[' + m.group(1) + ']]' + mark(t[len(m.group(1)):], LEX[kind])
    if hd: x['hd'] = hd
    if hd2: x['hd2'] = hd2; x['t2'] = mark(t2, LEX[kind])
    OUT[kind][part].append(x)

for s in json.load(open(os.path.join(W, 'essays', 'data', 'samples.json')))['opinion']:
    ps = [strip(p) for p in re.findall(r'<p>(.*?)</p>', s['styles']['default'], re.S)]
    if len(ps) < 3: continue
    n = len(ps)
    add('essay', 'intro', s['title'], 'Paragraph 1', ps[0])
    add('essay', 'body', s['title'], 'Paragraph 2 of %d' % n, ps[1])   # the first argument: one per essay is enough to compare
    add('essay', 'concl', s['title'], 'Paragraph %d' % n, ps[-1])

for k, x in json.load(open(os.path.join(W, 'articles', 'data', 'article-samples.json'))).items():
    if k in ('meta', 'changes') and not x.get('default'): continue
    ps = [' '.join(p['sentences']) for p in x.get('default', [])]
    if len(ps) < 3: continue
    n = len(ps); src = x.get('title') or k
    add('article', 'intro', src, 'Paragraph 1', ps[0])
    for i in range(1, n - 1): add('article', 'body', src, 'Paragraph %d of %d' % (i + 1, n), ps[i])
    add('article', 'concl', src, 'Paragraph %d' % n, ps[-1])

for k, x in json.load(open(os.path.join(W, 'reviews', 'data', 'samples.json'))).items():
    ps = [' '.join(p['sentences']) for p in x.get('default', [])]
    if len(ps) < 3: continue
    n = len(ps); src = k.replace('-', ' ').capitalize()
    add('review', 'intro', src, 'Paragraph 1', ps[0])
    for i in range(1, n - 1): add('review', 'body', src, 'Paragraph %d of %d' % (i + 1, n), ps[i])
    add('review', 'concl', src, 'Paragraph %d' % n, ps[-1])

for x in json.load(open(os.path.join(W, 'reports', 'data', 'report-samples.json')))['reports']:
    secs = [(h.strip(), strip(c)) for h, c in re.findall(r'section-heading">([^<]+)</div><div\s+class="section-content">(.*?)</div></div>', x['styles']['default'], re.S)]
    if len(secs) < 3: continue
    intro = [s for s in secs if s[0] == 'Introduction']
    concl = [s for s in secs if s[0] == 'Conclusion']
    mid = [s for s in secs if s[0] not in ('Introduction', 'Conclusion')]
    rec = [s for s in mid if s[0].lower().startswith('recommend')]
    body = [s for s in mid if s not in rec]
    if intro: add('report', 'intro', x['title'], 'Introduction', intro[0][1], hd='Introduction')
    for i in range(0, len(body), 2):
        pair = body[i:i + 2]
        if len(pair) == 2: add('report', 'body', x['title'], 'Two sections', pair[0][1], hd=pair[0][0], hd2=pair[1][0], t2=pair[1][1])
        else: add('report', 'body', x['title'], 'Section', pair[0][1], hd=pair[0][0])
    end = rec[:1] + concl[:1]
    if len(end) == 2: add('report', 'concl', x['title'], 'Two sections', end[0][1], hd=end[0][0], hd2=end[1][0], t2=end[1][1])
    elif end: add('report', 'concl', x['title'], 'Section', end[0][1], hd=end[0][0])

json.dump(OUT, open(os.path.join(R, 'data', 'writing', 'compare-examples.json'), 'w'), ensure_ascii=False, indent=1)
for k in OUT: print(k, {p: len(v) for p, v in OUT[k].items()})
