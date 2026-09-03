# Step 1 — the poster promoted, the shell made single

Two hygiene fixes and one component promotion. No page was redesigned; the
four legacy pages are untouched apart from a data path. This is the ground
being levelled before Academic Vocabulary is built on it.

---

## What changed

### The poster is now a shell component

The card had been authored twice — in `gerunds-sort.html` as `.card`, and
again in `vocab.css` as `.card`, where the header already admitted it was the
copy ("Lifted from gerunds-sort.html"). Two copies of one object is the exact
condition `intuity-shell.css` exists to prevent, so it went up rather than
being maintained twice.

The **vocab.css version is the one promoted**, because it is the later and
better-reasoned of the two. It had already found and fixed two things the
Sort version got wrong for a lesson page:

- Sort hard-codes the paper at `#ECE9E3`, which is correct against its own
  board `#EBE8E1` and wrong against `--screen #F3F1ED` — the same card reads
  as a **recess** rather than a sheet, because the ground is lighter than it.
- `--poster-soft` measures `#706D6A`: L\* 46.2 at chroma 2.16. Ash. Fine for
  Sort's short context line, wrong for body copy that *is* the reading.

Three things were reconciled in the promotion:

| | Before | Now |
|---|---|---|
| Paper | `#ECE9E3` hard-coded in two places | `--poster: var(--card)` |
| Mono | `--f-mono2:'Geist Mono'` — an alias for a face already named | `--f-mono`; the alias survives, deprecated |
| Name | `.card` | `.poster` |

The rename was not taste. **Eleven rules pages already define a `.card` of
their own** — `comparatives-rules`, `conditionals-rules`, `tenses-rules` and
eight more — so a `.card` in the shell would have restyled all eleven. It is
also the truer name: the thing has been called the poster in every comment
written about it since `explore-map.html`.

New in the shell, §13:

```
--poster --poster-ink --poster-body --poster-soft --poster-faint
--poster-rule --poster-fill --poster-fill-hi --caramel

.poster  .poster-kick  .poster-head  .poster-sub  .poster-body
.poster-rule  .poster-pill  .poster-chip  .poster.shake
```

`vocab.css` lost 72 lines and now contains only what a *vocabulary* page does
with the card: the pool, the gaps, the sentence numbering, the tally, the
sage accent.

**One convention worth keeping:** the pool markup is now
`class="poster-pill word"` — shell class for the material, page class for the
JavaScript hook. `vocab.js` still queries `.word` and nothing about its
behaviour moved.

### One cache-bust for one shared file

`?v=2` on 25 pages, `?v=4` on 13, `?v=5` on 5. The shell's own header says
drift is now "impossible"; the query string put it back, and pinned 25 pages
to the stylesheet from *before* the token overhaul. A returning student could
hold three different cached shells at once. Everything is `?v=6`.

If any page has looked subtly off-system and you couldn't find the rule
causing it — this is a likelier culprit than the page.

### One home for the data

`data/similar-words/` and `skills/similar-words/data/` held 13 of the same
files. Twelve were byte-identical; `functional-drills.json` differed by a
single trailing byte and **parsed equal**, so there was no divergence to
reconcile — but there was one file a byte away from becoming one.

`functional-english.json`, `quiz-data.json` and `expanded/` existed only under
`skills/` and were **moved, not deleted**. The ten pages that fetched
`'data/x.json'` document-relative — which resolved into the copy that was
about to go — are repointed at `/data/similar-words/` first, in the same
root-absolute idiom their `<link>` tags already use. `vocab.js` and
`colloc.js` no longer fetch `../../`, which only ever worked because every
consumer happened to sit exactly two directories deep.

---

## Applying it

```bash
cd intuity-cambridge-b2

# 1. the component (5 files)
cp shell/intuity-shell.css        data/grammar-rules/
cp vocabulary/vocab.css           data/similar-words/
cp vocabulary/vocab.js            data/similar-words/
cp vocabulary/colloc.css          data/similar-words/
cp vocabulary/colloc.js           data/similar-words/
cp spec/poster-spec.html          skills/similar-words/

# 2. the moves and deletes a patch can't carry cleanly
bash apply-hygiene.sh
```

`step-1.patch` is the same change set as a unified diff if you'd rather read
it than apply it (`git apply --stat step-1.patch`). It excludes `*.json`, so
the data move shows in the script rather than as 25,000 lines of noise.

`apply-hygiene.sh` is idempotent and verifies itself. Expect it to report
exactly **one** broken reference:
`/data/similar-words/prepositions-quiz.json`, from `quiz-shell.html`. That
file has never existed anywhere in the repo — a pre-existing bug in a page
outside the nine, left alone rather than guessed at.

---

## `poster-spec.html`

Open it at `/skills/similar-words/poster-spec.html`. It links **only** the
shell — no page stylesheet — so every specimen on it is painted by §13 alone.
If a card there looks wrong, the component is wrong, with nothing propping it
up and nothing to blame.

It carries the ground-swap harness: one button moves `--poster` between a
lesson page and Sort's darker board, which is the whole argument for
`--poster: var(--card)` demonstrated in a tap rather than argued in a
paragraph.

Use it as the regression check before each of the four conversions.

---

## Verified

- All three stylesheets parse clean (tinycss2, 0 errors); braces balanced.
- `vocab.js` and `colloc.js` pass `node --check`.
- Every class emitted by either engine resolves to a rule. This caught one
  real break: `colloc.js` emits `class="pos"`, which the rename to
  `.poster-sub` would have orphaned. Fixed.
- Every `/data/**.json` reference in `skills/**` resolves, except the one
  pre-existing case above.
- `apply-hygiene.sh` run twice on a clean checkout; second run is a no-op.

Not verified: nothing was rendered in a browser. The spec page is there so
that takes one open rather than a page-by-page audit.

---

## Next

`gerunds-sort.html` is **not** retrofitted here, deliberately. It doesn't link
the shell at all, and adding the link would restyle its header, HUD and bar in
one move — a second job with its own risk, not a footnote to this one. When
you take it: it needs only `--poster:#ECE9E3` to keep its darker paper, and
everything else comes across.

Then Academic Vocabulary, per the earlier plan — smallest legacy file, single
clean JSON, closest to what `vocab.js` already does.

One small thing noticed and left: `.vtab .pct` is declared inline, identically,
in three page `<style>` blocks. Same class of problem, two lines, worth folding
into §6 when you're next in the shell.


# Academic Vocabulary — converted, and cut in half

**1,107 lines → 95.** No new engine, no new stylesheet. It runs on `vocab.js`
and the promoted poster, which is what picking this page first was meant to
test. The poster held.

---

## First: is it worth keeping?

Half of it. The page had two data files and they are not the same quality.

**`academic-vocabulary.json` — the browse mode. Cut it.**

59 items, 274 alternatives, 31 example sentences. **89% of the alternatives
appear in no context at all.** The first entry is representative:

> say → state, declare, mention, remark, assert, claim, maintain, express,
> announce, comment

Those ten are not interchangeable, and the flat list says they are. A student
who learns it writes *"The minister remarked that new measures would be
introduced"* — grammatical, and wrong in register. At B2 that is one of the
most common lexical errors there is, and this is a page that teaches it. No
amount of restyling fixes a list whose *shape* asserts equivalence; it would
just put a good poster around it.

**`academic-vocabulary-gapfill.json` — the exercise. This is the page.**

It is the discrimination task the list can't be. Eight words, eight gaps,
each with a hint that names the distinguishing feature:

| gap | answer | hint |
|---|---|---|
| "During the meeting, she briefly ___ her concerns" | mention | refer to something without detail |
| "The witness ___ under oath that he had seen the defendant" | state | say formally or officially |

That is exactly the contrast the browse mode flattened. Every word is used
once, so the set can only be completed by telling all eight apart — you can't
finish it by knowing six and guessing.

So the conversion **drops the browse mode and keeps the exercise.** The 274
alternatives aren't deleted, they're demoted from content to raw material —
they're the source for more sets.

---

## The data was already in the right shape

`academic-vocabulary-gapfill.json` matched `vocab.js`'s contract almost
exactly — `setNumber`, `words`, `sentences[{text, correct}]`. Two changes:
`topic` → `label`, and the topic strings trimmed
("Communication Verbs - SAY alternatives" → "SAY alternatives", since the
header already says Academic Vocabulary). Output:
`academic-vocabulary-sets.json`.

Integrity checked: 5 sets, 8 words and 8 sentences each, every `correct`
index in range, **every word the answer to exactly one gap**, no set with a
dead distractor, all 40 gaps parseable, all 40 hints present.

---

## One engine change: hints

`vocab.js` gained `.hint`, and it's the only thing here that isn't a port.

It renders **only where the data carries one** — Similar Words sets have no
hints and the markup simply doesn't appear on them.

Two decisions worth stating, because both could have gone the other way:

**Hidden until Check.** Shown before, the hint turns retrieval into
recognition — the student matches a gloss to a word instead of reaching for
it, which is a materially easier task and not the one the exercise is for.

**Revealed on a miss only.** After a correct answer it explains something the
student just demonstrated they didn't need, and a hint under every line
flattens the card back into the wall of glosses this conversion exists to get
rid of. On a miss it's the correction doing its actual job: not "no", but
"here is the distinction you missed", while the student still cares.

Styled as italic body text on its own line with a short rule, deliberately
**not** in a tile — a tile means "a word goes here" everywhere else in the
product, and a gloss is not a ninth option.

---

## Also fixed here

The old page linked **no webfont at all**. It sat on the system stack while
the shell's `--f-display` and `--f-body` asked for Geist. That's the bug
affecting 26 shell pages; this is one of them, fixed in passing.

It's also now reachable. Academic Vocabulary was only ever linked from the
modal, so nobody who arrived at Similar Words could find it. It's the third
entry in the mode row now — Similar Words / Topic Vocabulary / Academic —
which is honest, because they're one exercise on three materials.

---

## Files

```
academic-vocabulary.html        → skills/similar-words/   (replaces 1,107 lines)
academic-vocabulary-sets.json   → data/similar-words/     (new)
vocab.js                        → data/similar-words/     (hint support)
vocab.css                       → data/similar-words/     (.hint)
```

Bump to `?v=5` for `vocab.js` / `vocab.css` across the three pages that use
them — Similar Words and Topic Vocabulary load the same files and must not
get a cached copy without the hint branch.

The legacy page is kept at `academic-vocabulary-legacy.html.bak` in the working
tree. Delete it once you've seen the new one run.

---

## Verified

Markup balanced. All nine element IDs the engine touches are present. Data
integrity as listed above. `node --check` on `vocab.js`, tinycss2 clean on
`vocab.css`. Not rendered in a browser — check it against `poster-spec.html`,
and check the hint by getting one wrong on purpose.

---

## The honest problem

**Five sets.** Similar Words has 115, Topic Vocabulary 60. Forty gaps is about
eight minutes, and the tab row will look thin next to its two siblings.

The content to fix that already exists — the 274 alternatives, with their
categories, are exactly the raw material. Turning them into sets means
authoring gapped sentences and hints that force real discrimination, which is
content work and a pedagogical judgement I'd want your input on rather than
doing silently: the whole point of the cut is that the *quality* of the
discrimination is what makes these sets worth doing.

I'd suggest 20–25 sets, from the strongest categories — Communication,
Thinking & Opinion, Very+Adjective, Change & Improvement. Say the word and
I'll draft a batch for you to mark up before I write the rest.

Otherwise: Descriptive Words next, four datasets, the real test of the engine.
