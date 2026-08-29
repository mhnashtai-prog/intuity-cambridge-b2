"""
tools/build_topic.py
────────────────────
Build a topic rules page from the conditionals blueprint.

    python3 tools/build_topic.py

Writes skills/grammar-rules/<topic>-rules.html for every entry in TOPICS,
overwriting whatever is there. Per-topic differences live in
tools/topic_patches.py — NOT in the generated file, which this script will
happily flatten on the next run.

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
import topic_patches

# Paths are worked out from this file's own location, so the script runs from
# anywhere — `python3 tools/build_topic.py` at the repo root, or from inside
# tools/ — rather than only from a hardcoded checkout.
HERE   = os.path.dirname(os.path.abspath(__file__))
REPO   = os.path.dirname(HERE)                       # tools/ -> repo root
SKILLS = os.path.join(REPO, 'skills/grammar-rules')
DATA   = os.path.join(REPO, 'data/grammar-rules')

TOPICS = {
    'inversion': dict(
        title='Inversion', subtitle='B2 First Inversion',
        data='inversion-data.json',
        practice_data='inversion-practice.json',
        quiz_data='inversion-data', layout='column',
        game=None),
    'collocations': dict(
        title='Collocations', subtitle='B2 First Collocations',
        data='collocations-rules.json',
        # No Practice page generated. collocations-practice.json is multiple
        # choice — {sentence, options, correct} — not the key-word
        # transformation every other topic uses, so the shared Practice page
        # cannot read it. Its original page is left in place until an MCQ
        # practice surface exists.
        practice_data=None,
        quiz_data='collocations-gapfill', layout='column',
        game=None),
    'linking-words': dict(
        title='Linking Words', subtitle='B2 First Linking Words',
        data='linking-words-data.json',
        practice_data='linking-words-practice.json',
        quiz_data='linking-words-data', layout='column',
        game=None),
    'passive-voice': dict(
        title='Passive Voice', subtitle='B2 First Passive Voice',
        data='passive-voice-data.json',
        practice_data=None,
        quiz_data='passive-voice-data', layout='column',
        game=None),
    'past-modals': dict(
        title='Past Modals', subtitle='B2 First Past Modals',
        data='past-modals-data.json',
        practice_data='past-modals-practice.json',
        quiz_data='past-modals-data', layout='column',
        game=None),
    'comparatives': dict(
        title='Comparatives', subtitle='B2 First Comparatives',
        data='comparatives-data.json',
        practice_data='comparatives-practice.json',
        quiz_data='comparatives-data', layout='column',
        game=None),
    'miscellaneous': dict(
        title='Miscellaneous', subtitle='B2 First Mixed Structures',
        data='miscellaneous-data.json',
        practice_data='miscellaneous-practice.json',
        quiz_data='miscellaneous-data', layout='column',
        game=None),
    'reported-speech': dict(
        title='Reported Speech', subtitle='B2 First Reported Speech',
        data='reported-speech-data.json',
        practice_data='reported-speech-practice.json',
        quiz_data='reported-speech-data', layout='twocol',
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
   A three-column grid cannot hold these sets at 390px. `max-content` sizes
   the opening column to the LONGEST opening in the set — "The hotel is
   centrally located." — and every row then pays for it, leaving the tail
   about one word wide, stacked vertically and running off the screen.

   Tenses survives the same grid on a phone because its openings are one or
   two words. These topics transform whole sentences, so their openings are
   whole clauses, and no amount of tightening buys the width back.

   So the row becomes a sentence again: the words flow, and the taught item
   keeps its grey as an inline chip. The column is lost — but the column was
   never readable here, and a sentence a student can actually read is worth
   more than an alignment they cannot see. */
@media(max-width:640px){
  .exs{display:block;font-size:11pt;line-height:1.5}
  .ex{display:block;padding:.42rem 0 .42rem .9rem;
      border-left:1px solid var(--rule);margin-bottom:.15rem}
  .ex-pre,.ex-post{display:inline;padding:0;text-align:left}
  .ex-vb{display:inline-block;background:var(--verb);color:var(--verb-ink);
      border-radius:.42rem;padding:.04em .5em;margin:0 .14em;
      box-shadow:none !important;white-space:normal}
  .ex-plainform{padding:.15rem 0 .1rem .9rem}
}
"""

TWOCOL_CSS = """/* ── TWO MARK COLUMNS ────────────────────────────────────────────────────
   Some structures teach a RELATIONSHIP between two forms rather than one
   form on its own. Reported speech is the clearest case: "She **said**
   (that) she **was** tired" — the lesson is that the second verb shifts back
   because of the first. One column can show a paradigm; it cannot show a
   dependency. Two can.

   Read down the left: said / told / asked. Down the right: was / were / had
   finished. The backshift is the pair of columns. */
.exs{display:grid;
  grid-template-columns:max-content max-content max-content max-content minmax(0,1fr);
  row-gap:0;margin-bottom:1rem;
  font-family:var(--f-read);font-size:11pt;line-height:1.35;color:var(--sentence)}
.ex{display:contents}

.ex-pre,.ex-mid,.ex-post{padding-block:.34rem;align-self:center}
.ex-pre{padding-right:.7em;text-align:right}
.ex-mid{padding-inline:.7em}
.ex-post{padding-left:.7em}

/* Neither mark is subordinate to the other — that is the point. */
.ex-v1,.ex-v2{font-family:var(--f-verb);font-size:12pt;font-weight:600;
  letter-spacing:-.008em;line-height:1.25;color:var(--verb-ink);
  background:var(--verb);padding:.3rem .8rem;text-align:center;
  white-space:nowrap;align-self:center}
.ex:not(:last-child) .ex-v1,.ex:not(:last-child) .ex-v2{
  box-shadow:inset 0 -1px 0 var(--verb-rule)}
.ex:first-child .ex-v1,.ex:first-child .ex-v2{border-radius:.6rem .6rem 0 0}
.ex:last-child  .ex-v1,.ex:last-child  .ex-v2{border-radius:0 0 .6rem .6rem}

.ex.plain{grid-column:1/-1;display:block;padding:.42rem 0 .42rem .9rem;
  border-left:1px solid var(--rule)}
/* a mark inside a plain line keeps the tint, just not the column */
.ex.plain .vb{display:inline-block;background:var(--verb);color:var(--verb-ink);
  font-family:var(--f-verb);font-weight:600;border-radius:.42rem;padding:.04em .42em}
.ex .marker-inline{color:var(--target);font-weight:700}

/* ── PHONE ──
   Five cells will not fit 390px. The row becomes a plain line with both
   marks tinted in place: same data, same colours, no alignment claimed
   where there is no room for it. */
@media(max-width:680px){
  .exs{display:block;font-size:11pt}
  .ex{display:block;padding:.42rem 0 .42rem .9rem;border-left:1px solid var(--rule)}
  .ex-pre,.ex-mid,.ex-post{display:inline;padding:0;text-align:left}
  .ex-v1,.ex-v2{display:inline-block;border-radius:.42rem;padding:.04em .5em;
    margin:0 .12em;box-shadow:none !important;font-size:11.5pt}
}
"""

TWOCOL_JS = """/* Split on the two marks: pre | mark | mid | mark | post. Anything that is
   not exactly that shape — one mark, three, none — keeps a plain line, so a
   set can be edited without the layout breaking. */
function renderExample(raw){
  raw = String(raw).replace(/\\*\\*/g, '');
  const parts = raw.split(/<<([^>]+)>>/);
  /* Not every example is a two-mark pair. Reported speech marks one item in
     the time-and-place sets ("she said she lived <<there>>"), and three or
     four in the sets that shift a verb AND a pronoun AND a time word. Only a
     clean pair can fill two columns; everything else keeps a plain line with
     every mark tinted where it falls, which is the honest rendering of a
     sentence that has more going on than two columns can hold. */
  if(parts.length !== 5){
    const inline = parts.map((seg,i) =>
      i % 2 ? '<span class="vb">' + esc(seg) + '</span>' : render(seg)).join('');
    return '<div class="ex plain">' + inline + '</div>';
  }
  return '<div class="ex">' +
    '<span class="ex-pre">' + render(parts[0]) + '</span>' +
    '<span class="ex-v1">'  + esc(parts[1])    + '</span>' +
    '<span class="ex-mid">' + render(parts[2]) + '</span>' +
    '<span class="ex-v2">'  + esc(parts[3])    + '</span>' +
    '<span class="ex-post">'+ render(parts[4]) + '</span>' +
  '</div>';
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


def build_practice(topic, cfg):
    """The Practice page, from the conditionals one.

    Only three things are topic-specific: the title, the data file and the
    localStorage key. The item shape is identical everywhere —
    original / keyword / before / answer / after — which is why one page can
    read every topic without a per-topic branch."""
    src = io.open(os.path.join(SKILLS, 'conditionals-practice.html'), encoding='utf-8').read()
    h = src
    h = h.replace('<title>INTUITY — Conditionals Practice</title>',
                  '<title>INTUITY — %s Practice</title>' % cfg['title'])
    h = h.replace("INTUITY - Conditionals Practice",
                  "INTUITY - %s Practice" % cfg['title'])
    h = h.replace("|| '../../data/grammar-rules/conditionals-data.json';",
                  "|| '../../data/grammar-rules/%s';" % cfg['practice_data'])
    h = h.replace("const SCORE_KEY = 'conditionals_practice_scores';",
                  "const SCORE_KEY = '%s_practice_scores';" % topic.replace('-', '_'))
    out = os.path.join(SKILLS, '%s-practice.html' % topic)
    io.open(out, 'w', encoding='utf-8').write(h)
    return os.path.basename(out), len(h)


def build_quiz(topic, cfg):
    """The Quiz page. A shell around the shared gapfill engine: the only
    topic-specific value is QUIZ_DATA, which names the file the engine reads.

    The old per-topic quiz pages linked a bare "gapfill.js" and "gapfill.css",
    which resolve to the copies in skills/ rather than the maintained ones in
    data/ — so they were running a different engine from tenses and
    conditionals, and none of this session's quiz fixes reached them."""
    src = io.open(os.path.join(SKILLS, 'conditionals-gapfill.html'), encoding='utf-8').read()
    h = src
    h = h.replace('<title>INTUITY — Conditionals Quiz</title>',
                  '<title>INTUITY — %s Quiz</title>' % cfg['title'])
    h = h.replace("window.QUIZ_DATA = 'conditionals-data';",
                  "window.QUIZ_DATA = '%s';" % cfg['quiz_data'])
    h = h.replace('title="Conditionals quiz"', 'title="%s quiz"' % cfg['title'])
    out = os.path.join(SKILLS, '%s-gapfill.html' % topic)
    io.open(out, 'w', encoding='utf-8').write(h)
    return os.path.basename(out), len(h)


def build(topic, cfg):
    src = io.open(os.path.join(SKILLS, 'conditionals-rules.html'), encoding='utf-8').read()
    h = src

    # ── swap the sentence layout when the topic is single-mark ──────────
    if cfg['layout'] == 'twocol':
        a = h.index('/* \u2500\u2500 TWO CLAUSE COLUMNS \u2500\u2500')
        b = h.index('@media (min-width:900px)')
        h = h[:a] + TWOCOL_CSS + '\n' + h[b:]
        a = h.index('/* \u2500\u2500 SPLITTING A CONDITIONAL \u2500\u2500')
        b = h.index('function paintList(){')
        h = h[:a] + TWOCOL_JS + h[b:]

    elif cfg['layout'] == 'column':
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

    # anything this topic needs beyond the blueprint
    h = topic_patches.apply(topic, h)

    out = os.path.join(SKILLS, '%s-rules.html' % topic)
    io.open(out, 'w', encoding='utf-8').write(h)
    return out, len(h)


if __name__ == '__main__':
    for t, c in TOPICS.items():
        p, n = build(t, c)
        print('built %-28s %6d bytes  [%s]' % (os.path.basename(p), n, c['layout']))
        if c.get('practice_data'):
            f, n = build_practice(t, c)
            print('      %-28s %6d bytes  [practice]' % (f, n))
        if c.get('quiz_data'):
            f, n = build_quiz(t, c)
            print('      %-28s %6d bytes  [quiz]' % (f, n))
