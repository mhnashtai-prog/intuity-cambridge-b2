"""
Per-topic patches, applied by build_topic.py AFTER the blueprint is stamped.

WHY THIS FILE EXISTS
A topic's page was hand-edited after generation and the next `build_topic.py`
run silently reverted it — the generator overwrites, which is the whole point
of it. Anything a topic needs beyond the blueprint has to be expressed here,
where regeneration carries it forward instead of erasing it.
"""

# ── shown by every topic whose data has a before/after pair ─────────────
AFTER_IS_THE_LESSON = """/* ── WHICH HALF IS THE LESSON ────────────────────────────────────────────
   Every example carries both halves. `before` is the ordinary version;
   `after` is the same idea written with the structure the set teaches. The
   blueprint renders `before`, which is right for topics that mark one item
   inside an ordinary sentence — and wrong here, where the ordinary sentence
   is what the student is being moved away from. */
const PRIMARY = 'after';"""

STRIP_CSS = """/* ── THE STRIP ──
   The items the set teaches, in brick, above the sentences that show them in
   use — the relationship tenses has between time markers and examples. */
.markers{margin-bottom:1.1rem}
.markers-t{font-family:var(--f-mono);font-size:.56rem;color:var(--dim);
  text-transform:uppercase;letter-spacing:.12em;margin-bottom:.55rem}
.markers-l{display:flex;flex-wrap:wrap;gap:.4rem .9rem}
.marker{color:var(--target);font-size:.86rem;font-weight:600}

"""

RIGHT_ALIGN = """/* ── A STRAIGHT EDGE AT THE COLUMN ──
   In tenses the openings are one or two words, so left-aligning still leaves
   a tidy edge at the grey. Here they run from three words to seven, and
   left-aligned they give a ragged inner edge with the column pushed right.
   Right-aligned, every opening ENDS flush against the field: the ragged edge
   moves outside, where nothing has to line up. */
.ex-pre{padding-right:.8em;text-align:right}
.ex-pre:empty{padding-right:0}"""

LINKERS_FN = """/* The items actually used in a set, collected from its own examples and
   de-duplicated. Derived rather than authored, so the strip can never
   disagree with the sentences under it. */
function linkersIn(set){
  const seen = [];
  (set.examples || []).forEach(e => {
    const raw = e[PRIMARY] != null ? e[PRIMARY] : e.after;
    String(raw).replace(/<<([^>]+)>>/g, (_, w) => {
      const k = w.trim();
      if(k && !seen.some(s => s.toLowerCase() === k.toLowerCase())) seen.push(k);
      return '';
    });
  });
  return seen;
}

function paintList(){"""

COVERAGE = """    /* per set: which items have already been demonstrated */
    const shown = new Set();
    const exs = (set.examples||[]).map(e => {
      const raw = e[PRIMARY] != null ? e[PRIMARY] : e.after;
      /* ── EVERY WORD IN THE STRIP GETS SHOWN ONCE ──
         Alternatives after " / " each used to get a row, which doubled the
         block into near-repetition; taking only the first dropped words the
         strip still promised. So: the first phrasing always, a later one only
         when it introduces something not yet demonstrated. */
      const rows = [];
      String(raw).split(' / ').forEach((alt, i) => {
        const words = (alt.match(/<<([^>]+)>>/g) || [])
          .map(w => w.replace(/<<|>>/g, '').trim().toLowerCase());
        const isNew = words.some(w => w && !shown.has(w));
        if(i === 0 || isNew){
          words.forEach(w => shown.add(w));
          rows.push(renderExample(alt));
        }
      });
      return rows.join('');
    }).join('');"""

CARD_WITH_STRIP = """    const linkers = linkersIn(set);
    const strip = linkers.length
      ? '<div class="markers"><div class="markers-t">Ways to say it</div>' +
        '<div class="markers-l">' +
        linkers.map(w => '<span class="marker">' + esc(w) + '</span>').join('') +
        '</div></div>'
      : '';
    return '<div class="card"><div class="card-head">' +
             '<div class="uc-title">' + esc(set.setTitle) + '</div>' +
             '<button class="explore-btn" type="button" data-sec="' + i + '">Explore</button>' +
           '</div>' + strip + '<div class="exs">' + exs + '</div></div>';"""

PLAIN_UNDER = """    const exs = (set.examples||[]).map(e => {
      const raw = e[PRIMARY] != null ? e[PRIMARY] : e.after;
      /* The ordinary sentence under the transformed one. An inversion is only
         unusual against the sentence it inverts; without it the column is a
         list of odd word orders with nothing to be odd against. */
      return renderExample(raw) +
             (e.before ? '<div class="ex-plainform">' +
                render(String(e.before).replace(/\\*\\*/g,'')) + '</div>' : '');
    }).join('');"""

PLAIN_CSS = """/* The ordinary sentence, under the form that transforms it — small and
   quiet, so the eye lands on the taught structure first. */
.ex-plainform{grid-column:1/-1;font-family:var(--f-read);font-size:9.5pt;
  color:var(--faint);padding:.1rem 0 .55rem .2rem}

"""

STRIP_ASTERISKS = """function renderExample(raw){
  /* The transformed forms are written **<<like this>>** — a bold wrapper left
     from a renderer that showed them inline. The grey field is the emphasis
     now, so the asterisks are stripped rather than drawn. */
  raw = String(raw).replace(/\\*\\*/g, '');
  const parts = String(raw).split(/<<([^>]+)>>/);"""

BASE_EXS = """    const exs = (set.examples||[]).map(e => {
      const raw = e[PRIMARY] != null ? e[PRIMARY] : e.after;
      return renderExample(raw);
    }).join('');"""

BASE_CARD = """    return '<div class="card"><div class="card-head">' +
             '<div class="uc-title">' + esc(set.setTitle) + '</div>' +
             '<button class="explore-btn" type="button" data-sec="' + i + '">Explore</button>' +
           '</div><div class="exs">' + exs + '</div></div>';"""


def apply(topic, h):
    if topic == 'linking-words':
        h = h.replace("const PRIMARY = 'before';", AFTER_IS_THE_LESSON, 1)
        h = h.replace(".cards{display:flex;flex-direction:column;gap:1.1rem}",
                      STRIP_CSS + ".cards{display:flex;flex-direction:column;gap:1.1rem}", 1)
        h = h.replace(".ex-pre{padding-right:.8em}", RIGHT_ALIGN, 1)
        h = h.replace("function paintList(){", LINKERS_FN, 1)
        h = h.replace(BASE_EXS, COVERAGE, 1)
        h = h.replace(BASE_CARD, CARD_WITH_STRIP, 1)

    elif topic == 'inversion':
        h = h.replace("const PRIMARY = 'before';", AFTER_IS_THE_LESSON, 1)
        h = h.replace("function renderExample(raw){\n  const parts = String(raw).split(/<<([^>]+)>>/);",
                      STRIP_ASTERISKS, 1)
        h = h.replace(BASE_EXS, PLAIN_UNDER, 1)
        h = h.replace(".cards{display:flex;flex-direction:column;gap:1.1rem}",
                      PLAIN_CSS + ".cards{display:flex;flex-direction:column;gap:1.1rem}", 1)
        h = h.replace(".ex-pre{padding-right:.8em}",
"""/* 135 of the 155 inversions front the marked phrase, so the opening cell is
   empty and the column starts hard against the left edge. Give it air only
   when it IS empty, so the sets that do have an opening keep alignment. */
.ex-pre{padding-right:.8em}
.ex-pre:empty{padding-right:0}
.ex-pre:empty + .ex-vb{margin-left:.2rem}""", 1)
    return h
