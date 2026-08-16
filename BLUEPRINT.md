# INTUITY — grammar topic blueprint

Established by the phrasal verbs topic, August 2026. Seven pages, one data
file, no duplication. Every remaining topic converges on this.

---

## 1. One data file per topic

`data/grammar-rules/<topic>-data.json` — every page of the topic reads this
and nothing else.

Before the merge, phrasal verbs read five files across two folders, and the
217 phrasal-verb definitions existed in four separate places. A correction to
one copy silently failed to reach the others. One file makes that class of
bug impossible rather than merely unlikely.

**Rule:** if two pages in a topic need the same fact, they read the same key.
Never two files, never two folders.

### Top-level shape

| key | holds | read by |
|---|---|---|
| `title`, `level`, `version` | topic metadata | any |
| `note` | why the file is shaped this way, for the next person | nobody — humans only |
| *reference data* | the facts of the grammar itself | explore, rules |
| *exercise groups* | the sets a student steps through | play, quiz, gapfill, game |
| `practice` | transformation / production tests | practice |
| `game` | matching rounds | quiz |

The reference/exercise split is the important one. Reference data describes
the language; exercise data is material built from it. They change for
different reasons and at different rates.

---

## 2. Names must mean one thing

The merge's only real hazard was `verbs`, which meant **a dict of 26 verbs
mapped to their particles** in one file and **a list of 10 exercise groups**
in another. Merging naively would have had one silently overwrite the other
and break three pages.

Resolved by renaming the exercise list to `groups` and leaving `verbs` as
reference data. That rename — not the file paths — was the substance of the
work, and it is why seven pages needed editing.

**Rule:** before merging any two files, list their top-level keys and check
for a name used with two meanings. Do this first; it dictates everything else.

---

## 3. Item schema for gap-fill sets

```json
{
  "id": 1,
  "text": "The grass is wet. It _____ (rain) last night.",
  "answer": "must have rained",
  "alternatives": ["might have rained"],
  "highlightVerb": "is wet",
  "blanks": 2
}
```

- `text` — the gap is exactly `_____ (hint)`. Five underscores, one space,
  parenthesised hint. Anything else fails to parse and the item vanishes.
- `answer` — the canonical form. Two-blank items join halves with ` / `.
- `alternatives` — an array, always present, possibly empty. The older
  `alternativeAnswer` string capped each item at two accepted forms, so an
  item could take the contraction or the full form but never both.
- `highlightVerb` — **the cue, not the answer.** See below.
- `blanks` — omit for one gap; `2` for causatives and correlatives.
- `helper` — a scaffolding chip shown beside the sentence. Only for text that
  is *not* in the sentence; if it is in the sentence, it is a cue, so use
  `highlightVerb` instead.

### The cue is not the answer

`highlightVerb` marks the evidence a student reads to choose the answer. It
must appear **in the sentence outside the gap**, or it silently renders
nothing — which looks exactly like no cue at all.

The suite's original failure: `highlightVerb` was set to the lemma, which is
the same word as the bracketed hint. The renderer strips the hint before
highlighting, so the cue could never match. 119 of 130 items failed silently.

Cue by set type:

| set | the cue is | example |
|---|---|---|
| deduction / certainty | the evidence clause | `"is wet"`, `"are off"` |
| criticism / ability | the contrast clause | `"but I didn't"` |
| conditionals | the if-clause | `"If I had known"` |
| passive, tense choice | the time adverbial | `"tomorrow"`, `"last year"` |
| gerunds / infinitives | the governing verb or phrase | `"enjoy"`, `"can't help"` |

Where the sentence inflects the trigger (`deny` → `denied`, `give up` →
`gave up`), the cue takes the **inflected** form as it appears in the text.

---

## 4. Pages are thin shells

Four typed gap-fill quizzes share `gapfill.css` and `gapfill.js`; each page is
~1.4KB and sets `window.QUIZ_DATA`. Before extraction, each carried its own
24KB copy of the same engine, and every fix had to be applied five times by
hand — which is how they drifted apart in the first place.

**Rule:** a fix belongs in one file. If applying it means editing more than
one page, extract the shared part first.

### What the shared engine guarantees

- Smart apostrophes: phones produce `’`, so `wouldn't` must match `wouldn’t`.
- Focus is never stolen: the footer lives in its own container, so updating
  it cannot replace the input a student is typing into.
- Two-blank items count as answered only when **both** halves are filled.
- User text is escaped before it reaches an HTML attribute.
- An unparsable item says so on the page instead of disappearing.

---

## 5. Composition by iframe, not by query string

The topic shell embeds its modes:

```js
iframe.src = 'phrasal-verbs-gapfill.html';
```

It does **not** pass the data file down as `?json=`. The embedded page knows
its own source. The other topics' shells do pass `?json=`, pointing at their
`-rules.json` — which has no gap-fill content — so the quiz pages carry a
guard that ignores any parameter not naming a quiz data file. Once a topic
is merged, the guard becomes redundant and the parameter should go.

---

## 6. Order of work for a topic

1. **Inventory.** List every page in the topic and every JSON each one
   fetches. Grep for `.json` — do not assume the page set from filenames.
   Phrasal verbs turned out to have seven pages, not six; the seventh read
   the key that was being renamed and would have broken silently.
2. **Collision check.** List top-level keys across all the topic's files and
   find any name used with two meanings.
3. **Merge**, leaving duplicated content in place. Rename only what collides.
4. **Patch every page**: one fetch path, and any renamed key.
5. **Verify statically** that each page's key accesses exist in the merged
   file, and that no stale key survives anywhere.
6. **Deploy data first, then pages.** Pages first means a 404, and the
   server's HTML error page produces a confusing `Unexpected token '<'`.
7. **Delete the superseded files** once live.
8. **Dedupe content** as a separate pass, since it needs rendering changes.

---

## 7. Still outstanding across the suite

- Meanings remain duplicated inside the merged phrasal file: `phrasalVerbs`,
  `groups[].items[].meaning`, `game[].pairs[].meaning`.
- 130 items in past modals and passive voice have no cue, awaiting the
  per-set rules in §3.
- Switching tabs wipes a student's answers with no warning.
- The footer appears only at 100% completion, so skipping one item leaves no
  Submit button and no explanation of why.
- Passive voice item 6 is in the active voice, inside the SIMPLE PASSIVE set.
- Passive items 11 and 12 have `helper` chips that contradict their own
  accepted alternatives.
- Wrong answers show the correct form but not the rule. Both `rule` (gerunds)
  and `explanation` (rules data) exist and say why — once a topic is merged,
  they are in the same file as the items and can finally be shown.
