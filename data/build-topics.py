"""
Build a topic rules page from the conditionals blueprint.

WHY A GENERATOR AND NOT TEN COPIES
Ten hand-edited copies is how the three headers drifted apart before the
shell existed. Everything topic-specific is a value in TOPICS below; the
markup exists once. Re-running this after the blueprint changes brings every
topic forward at the same moment.

TWO SENTENCE LAYOUTS, CHOSEN PER TOPIC
  'column'  one marked item per example  -> subject | mark | rest, the tenses
            geometry: the marks align in one grey column and the set can be
            read down as a paradigm.
  'clause'  two marked items per example -> two grey clause fields, the
            conditionals geometry: the pair of columns IS the rule.
The data decides which is honest; see the audit in the chat. A topic whose
examples are single-mark cannot use 'clause' — there is no second clause to
put in the second column.
"""
import io, json, os, re, sys

REPO = '/home/claude/repo'
SKILLS = os.path.join(REPO, 'skills/grammar-rules')
DATA = os.path.join(REPO, 'data/grammar-rules')

TOPICS = {
    'inversion': dict(
        title='Inversion', subtitle='B2 First Inversion',
        data='inversion-data.json', layout='column',
        game=None),
    'collocations': dict(
        title='Collocations', subtitle='B2 First Collocations',
        data='collocations-rules.json', layout='column',
        game=None),
    'linking-words': dict(
        title='Linking Words', subtitle='B2 First Linking Words',
        data='linking-words-data.json', layout='column',
        game=None),
}

# ── the one-mark renderer, swapped in for topics using 'column' ──────────
COLUMN_CSS = """/* ── THE VERB COLUMN ─────────────────────────────────────────────────────
   One grid owns the whole set, so every example shares two measured columns:
   the opening is as wide as the longest opening, the mark column as wide as
   the longest marked item. That is what makes the grey a straight edge —
   nothing is hard-coded, so editing an example cannot put the column out of
   true.

   Once the marks share a left edge the set can be read DOWN as well as
   across, and the pattern the set exists to teach becomes visible before
   anyone states it. */
.exs{display:grid;
  grid-template-columns:max-content max-content minmax(0,1fr);
  row-gap:0;margin-bottom:1rem;
  font-family:var(--f-read);font-size:11pt;line-height:1.35;color:var(--sentence)}
.ex{display:contents}

.ex-pre,.ex-post{padding-block:.34rem;align-self:center}
.ex-pre{padding-right:.8em}
.ex-post{padding-left:.8em}

/* Flat fill, no rim, no shadow — a rim would read as an input the student is
   meant to type into, and Explore is read. Body font stays serif; the mark
   takes the grotesk, so the two are told apart by voice rather than colour. */
.ex-vb{font-family:var(--f-verb);font-size:12pt;font-weight:600;
  letter-spacing:-.008em;line-height:1.25;color:var(--verb-ink);
  background:var(--verb);padding:.3rem .85rem;text-align:center;
  white-space:nowrap;align-self:center}
.ex:not(:last-child) .ex-vb{box-shadow:inset 0 -1px 0 var(--verb-rule)}
.ex:first-child .ex-vb{border-radius:.6rem .6rem 0 0}
.ex:last-child  .ex-vb{border-radius:0 0 .6rem .6rem}

/* A second marked item keeps the tint but stays in the line. */
.ex .vb{display:inline-block;background:var(--verb);color:var(--verb-ink);
  font-family:var(--f-verb);font-weight:600;border-radius:.42rem;
  padding:.04em .42em}

/* An example with no mark degrades to a plain line rather than guessing. */
.ex.plain{grid-column:1/-1;display:block;padding:.42rem 0 .42rem .9rem;
  border-left:1px solid var(--rule)}
.ex .marker-inline{color:var(--target);font-weight:700}

/* ── PHONE ──
   Three cells fit a phone as long as the opening is short, which the audit
   confirmed for every set in these topics. Only the padding tightens. */
@media(max-width:640px){
  .exs{font-size:10.5pt}
  .ex-pre{padding-right:.55em}
  .ex-post{padding-left:.55em}
  .ex-vb{padding-inline:.6rem}
}
"""

COLUMN_JS = """/* ── ONE SENTENCE ────────────────────────────────────────────────────────
   The data marks the item being taught in <<…>>. The first mark takes the
   column; any later one keeps the tint but stays in the line. An unmarked
   example falls back to a plain line, so a set can be edited without the
   layout breaking. */
function renderExample(raw){
  const parts = String(raw).split(/<<([^>]+)>>/);
  if(parts.length < 2) return '<div class="ex plain">' + render(raw) + '</div>';
  const tail = parts.slice(2).map((seg, i) =>
    i % 2 ? '<span class="vb">' + esc(seg) + '</span>' : render(seg)).join('');
  return '<div class="ex">' +
    '<span class="ex-pre">' + render(parts[0]) + '</span>' +
    '<span class="ex-vb">'  + esc(parts[1])    + '</span>' +
    '<span class="ex-post">'+ tail             + '</span>' +
  '</div>';
}

"""


def build(topic, cfg):
    src = io.open(os.path.join(SKILLS, 'conditionals-rules.html'), encoding='utf-8').read()
    h = src

    # ── swap the sentence layout when the topic is single-mark ──────────
    if cfg['layout'] == 'column':
        a = h.index('/* \u2500\u2500 TWO CLAUSE COLUMNS \u2500\u2500')
        b = h.index('@media (min-width:900px)')
        # keep the projection block that follows
        h = h[:a] + COLUMN_CSS + '\n' + h[b:]

        a = h.index('/* \u2500\u2500 SPLITTING A CONDITIONAL \u2500\u2500')
        b = h.index('function paintList(){')
        h = h[:a] + COLUMN_JS + h[b:]

    # ── topic-specific values ───────────────────────────────────────────
    h = h.replace('<title>INTUITY — Conditionals</title>',
                  '<title>INTUITY — %s</title>' % cfg['title'])
    h = h.replace('<div class="app-subtitle">B2 First Conditionals</div>',
                  '<div class="app-subtitle">%s</div>' % cfg['subtitle'])
    h = h.replace("const DEF   = '../../data/grammar-rules/conditionals-data.json';",
                  "const DEF   = '../../data/grammar-rules/%s';" % cfg['data'])
    h = h.replace("'../../data/grammar-rules/conditionals.json'",
                  "'../../data/grammar-rules/%s.json'" % topic)
    h = h.replace("f1.setAttribute('src','conditionals-practice.html?v='+BUILD)",
                  "f1.setAttribute('src','%s-practice.html?v='+BUILD)" % topic)
    h = h.replace("f2.setAttribute('src','conditionals-gapfill.html?v='+BUILD)",
                  "f2.setAttribute('src','%s-gapfill.html?v='+BUILD)" % topic)
    h = h.replace("PLAY + '?topic=conditionals'", "PLAY + '?topic=%s'" % topic)
    h = h.replace('<iframe id="slidesFrame" title="Conditionals map"></iframe>',
                  '<iframe id="slidesFrame" title="%s map"></iframe>' % cfg['title'])
    h = h.replace("Couldn\\'t load the conditionals.",
                  "Couldn\\'t load the %s." % cfg['title'].lower())

    # ── the fourth mode: a reserved GAME slot ───────────────────────────
    old_game = '<a class="mode-btn" href="/skills/grammar-rules/conditionals-decide">Decide</a>'
    if cfg['game']:
        new_game = '<a class="mode-btn" href="/skills/grammar-rules/%s">%s</a>' % (
            cfg['game']['href'], cfg['game']['label'])
    else:
        # The slot is HELD, not hidden. Four modes on every topic means a
        # student learns one header once; a mode that vanishes on some topics
        # teaches them to re-read it every time. Disabled says "not yet",
        # which is true, where absence says "never", which is not.
        new_game = ('<span class="mode-btn mode-soon" aria-disabled="true" '
                    'title="Game coming for this topic">Game</span>')
    h = h.replace(old_game, new_game, 1)

    if not cfg['game']:
        h = h.replace('.markers{margin-bottom:1.1rem}',
"""/* A held slot, not a missing one. Same width and rhythm as a live mode so
   the header does not reflow when the game arrives. */
.mode-soon{opacity:.38;cursor:default;pointer-events:none}

.markers{margin-bottom:1.1rem}""", 1)

    out = os.path.join(SKILLS, '%s-rules.html' % topic)
    io.open(out, 'w', encoding='utf-8').write(h)
    return out, len(h)


if __name__ == '__main__':
    for t, c in TOPICS.items():
        p, n = build(t, c)
        print('built %-28s %6d bytes  [%s]' % (os.path.basename(p), n, c['layout']))
