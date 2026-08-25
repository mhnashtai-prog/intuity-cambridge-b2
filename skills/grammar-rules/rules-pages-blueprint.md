# INTUITY — Explore Mode Blueprint

Reference for porting Explore + Map to the remaining topics.
Built from `tenses-*` (the blueprint) and `conditionals-*` (the first port).

**Status:** tenses ✅ · conditionals ✅ · 10 remaining

---

## 1. Files per topic

| File | Role | Shared? |
|---|---|---|
| `<topic>-rules.html` | Explore host — tabs, section list, map overlay | per topic |
| `<topic>-play.html` | The map (wave + poster) | per topic, near-identical |
| `<topic>-practice.html` | Practice | existing |
| `<topic>-gapfill.html` | Quiz | existing |
| `<topic>-data.json` | All content for the topic | per topic |

`-play.html` differs between topics **only in the adapter block**. Everything
below it — wave, poster, layout — must stay byte-identical. If you find
yourself editing the renderer for one topic, that change belongs in all of them.

---

## 2. Host → map contract

The host opens the map in an overlay iframe:

```
<topic>-play.html
  ?rule=<rule id>        which rule (zero, first, …); or &index=<n>
  &section=<n>           which section within that rule
  &primary=before|after  sentence ordering (see §4)
  &json=<resolved url>   the data file that ACTUALLY loaded
```

The map posts back when its Back button is pressed:

```js
parent.postMessage({ intuity: 'showList' }, '*');
```

The host listens for that, plus X / backdrop / Escape. All four must work.

### Section indices must account for chunking

The map holds **6 nodes**. A set with more than 6 examples becomes several
sections there, so `setIdx` is *not* `section`:

```js
function sectionIndexOf(tab, setIdx){
  let n = 0;
  for (let i = 0; i < setIdx; i++){
    const len = (tab.sets[i].examples || []).length;
    n += Math.max(1, Math.ceil(len / 6));
  }
  return n;
}
```

Conditionals has 5 per set so it looks unnecessary — it isn't. Collocations
has 10–15 and will break without it.

---

## 3. Data shapes

Four shapes exist. The adapter normalises all of them to `useCases`.

| Shape | Topics |
|---|---|
| `sets[]` of `{before, after}` | comparatives, conditionals, inversion, linking-words, miscellaneous, passive-voice, past-modals, reported-speech — **8** |
| `useCases[]` of sentences | tenses |
| `sets[]` of plain sentences | collocations |
| keyed by verb | phrasal-verbs — **does not fit the map** |

**Phrasal verbs is out of scope.** It's lexical, not transformational, and has
no sequence for the wave to express. It already has purpose-built pages.

### Guards

`<<...>>` marks the target language, `**...**` sometimes wraps it too. Strip
both for display; keep the contents as markers. They drive the cue label and
the bolding, so `TIME_RE` is a last resort, not the primary path.

---

## 4. `PRIMARY` — which sentence is the card

**This differs by topic and gets it wrong silently.**

- **Conditionals:** `before`/`after` are two orderings of the *same* sentence
  (`If you heat water, it boils` / `Water boils if you heat it`).
  → `PRIMARY = 'before'` (canonical if-first). `after` shows as the variant.
- **Inversion, reported speech, passive:** `after` is the *target being taught*.
  → `PRIMARY = 'after'`. `before` shows as the source.

Set it once at the top of the adapter. The host must pass the same value it
uses for its own list, or the two surfaces show different sentences.

---

## 5. Cue labels

The cue is the poster headline. It comes from the markers, not the sentence.

- **Tenses:** the time expression — `EVERY DAY`
- **Conditionals:** the *verb pair* — `HEAT → BOILS`

```js
function cueFromMarks(marks){
  if (!marks || !marks.length) return '';
  if (marks.length >= 2) return marks[0] + ' → ' + marks[1];
  return marks[0];
}
```

Pick whatever teaches the pattern for that topic. A single word rarely does.

---

## 6. The poster (modal)

| Token | Value | Why |
|---|---|---|
| ground | `#D4CEBE` (`STD_GROUND`) | **one ground for every topic** |
| type | `#14110E` | near-black, warm — not `#000` |
| radius | `4px` | printed sheet, not card |
| entry | `scale(.94) → 1` | not a slide-up |
| cue | Anton, `clamp(2.4rem, 12.5vw, 4.4rem)`, solid black | |
| structure | JetBrains Mono, chip `rgba(20,17,14,.09)` | the grammar itself |
| accent | node's palette tone, as a **block** | colour = position, not topic |

Per-topic grounds were built and dropped: the poster only opens from inside a
topic you already chose, so the colour carried no information. One ground makes
the poster a recognisable object — matching the EXPLORE badge, which is also
identical everywhere.

Accent legibility is computed, not hardcoded: tones are deepened by 14% until
they clear the ground by 55 luminance points. Node 5's near-black and node 3's
pale sand both need it.

Order on the poster: **kick → cue → structure → sentence → variant → note.**
`structure` and `explanation` stay separate — the first is the rule, the second
is commentary. Concatenating them buries the rule in grey prose.

---

## 7. The wave

One cosine, one equation. Not assembled from segments.

```js
const LAM   = 2 * gap;                 // wavelength = two rows
const waveX = y => cx + side * amp * Math.cos(2*Math.PI * (y - y0) / LAM);
```

Anchors alternate sides at equal spacing, which *is* a cosine sampled at its
peaks — so it passes through every anchor exactly, and the slope at each peak
is zero, giving vertical tangents free. Tails are the same cosine sampled
past the end anchors; there is no join to hide.

Two rules that are easy to break:

- **Rows must come from the card count**, via `layoutFor(n)` — never a fixed
  list of six. See §8.
- **Centre and amplitude from the RANGE, not the mean.** With an odd number of
  anchors one side has an extra member and a mean centre drifts off true.

---

## 8. Pitfalls that have already cost time

**Fixed 6-row layout crashes short sections.** `tightDots` looks up a pill that
was never rendered, `getBoundingClientRect()` throws, and the entire RAF block
dies — taking the cosine, taper and end dots with it. The placeholder bezier
survives, so it *looks* like an old design rather than an error.
→ `⚠️ tenses-play.html still has this.` Fine only while every tenses section
has exactly 6 examples.

**`hidden` loses to CSS.** Hiding the WATCH panel with the `hidden` attribute
did nothing, because `.watch-mode{display:block}` overrides it. Delete markup
rather than hiding it — then guard every orphaned `getElementById`, especially
ones running at top level, which kill the whole script.

**Presentation attributes lose to CSS too.** The taper sets `stroke` as an XML
attribute; any CSS `stroke` rule silently wins. `.taper` and `.endDot` must
carry geometry only.

**Host chrome overlaps the iframe.** The host's round close button sits at
top-right, exactly where the map's counter is — reading as `0 ✕6`. The map sets
`body.embedded` when `window.parent !== window` and adds 46px clearance.

**Data filenames don't match what the launcher builds.** The site constructs
`<topic>-rules.json`, but conditionals' file is `conditionals-data.json`.
The host tries the requested URL, then falls back, and records `RESOLVED_JSON`
to hand the map a URL that actually loads.
→ Worth fixing centrally rather than repeating the fallback 11 times.

---

## 9. Explore host — required refinements

Ported from tenses. Check each when doing a new topic.

- [ ] **No WATCH/LIST toggle.** List is the only view.
- [ ] **EXPLORE badge per section** — gold gradient, compass, spring easing.
      The badge is the trigger, not the whole card (the card holds selectable text).
- [ ] **Compact header.** Chrome ≈51px, not 118px:
      header `margin-bottom .6rem` / `padding .15rem 0`;
      subtitle `.62rem` / `letter-spacing .14em` / `margin-bottom .2rem`;
      mode selector `margin-bottom .55rem`; tabs `margin-bottom .9rem`.
- [ ] **Section title is plain gold type** — no filled bar behind it.
- [ ] **Highlights are marked words, not chips** — colour and weight only.
- [ ] Map overlay + all four close paths wired.
- [ ] `?json=` honoured, with fallback.

### Not yet ported

Tenses' header is **sticky** and carries a `LEVEL B2-C1` badge. Conditionals'
is neither. This needs markup restructuring, not spacing tweaks — and should be
done **once as a shared header** across all twelve, not eleven separate times.

---

## 10. Order of work per topic

1. **Reconcile the JSON first.** Several topics have both `-data.json` and
   `-rules.json` and they are **not** duplicates — they diverged. Diff before
   merging; content lost here is not recoverable later.
2. Copy `conditionals-play.html` → `<topic>-play.html`; change the adapter's
   default JSON path and `PRIMARY`.
3. Copy the host wiring into `<topic>-rules.html` (§2), apply §9 checklist.
4. Verify: section count, cue quality, 5- and 6-card sections both render the
   wave with terminal dots.

---

## 11. Open decisions

- **Data naming.** Standardise on `<topic>-rules.json`, or give the launcher a
  per-topic path map. Either beats the fallback in 11 files.
- **Shared header** across all topics (§9).
- **Shared renderer.** Eleven `-play.html` files means eleven places to fix the
  next wave change. A single `explore-map.html` taking `?topic=` was built and
  works; per-topic filenames can redirect to it if the naming matters.
- **`<i></i>` in the poster kick line.** CSS for the accent block exists; the
  element was never added. Decide: coloured block, or pure black-on-neutral.
