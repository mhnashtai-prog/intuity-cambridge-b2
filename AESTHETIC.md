# INTUITY — how it looks, and why

*Third of three. `INTENT.md` says why the project exists, `BLUEPRINT.md` says how
the data is built, this one says how a page is made. Read all three before
changing any of them.*

*Every rule below was argued for. Change them deliberately, not by accident —
and if you change one, check what else it was holding up.*

---

## 1. There is one component

A **disc**. White, always. It appears in two states and never in any other.

**Pressed** — set into the page, with a rim. It belongs to the board. It is
never tappable. There is exactly one on a screen, and it holds the prompt: the
meaning, the sentence with the gap, the thing the student must read before
choosing.

**Raised** — sitting on the page, rimless. It belongs to the student. These are
the things that get tapped, chosen, kept and lost.

That distinction does the work a label would otherwise have to do. A child
learns it in one tap and never needs telling again.

### Why the prompt is a hole

Every screenshot this project had before August 2026 shared one fault: the text
the student had to read was the smallest thing on the page, sitting under the
answers. The eye went to the cards, because the cards were big — and the cards
are the options, which should be read *last*.

A large sunk disc makes the prompt physically unavoidable: biggest object,
centred, above the answers, and the only prose on screen. Reading order stops
being a hope and becomes a fact of the layout.

**Rule:** one pressed disc per screen. The moment there are two, the effect is
gone. This forbids a grid of twenty definition tiles, and that is intended.

---

## 2. Light

One lamp, upper left, everywhere in the suite. Every shadow in every file obeys
it. The moment one component lights from elsewhere, the set stops looking like
objects on one table.

- **Pressed:** dark band inside the upper-left wall, faint bounce at the lower
  right. Inside a hole, the wall *nearest* the light is the one in shadow —
  that inversion is what makes a recess read as a recess rather than a dome.
- **Raised:** shadow falls outward to the lower right. No inner shading.

### Flat faces, shaded edges

Depth comes from occlusion at the rim, never from a gradient across the face.

- The floor of a recess is **one solid tint**. A tone running edge to edge
  describes a curved or tilted surface, which reads as a dome.
- Blur exists only in the 4–8px at the rim.
- **Never pure white.** Highlights are warm off-greys at low alpha. Pure white
  at any alpha reads as gloss.
- No gloss, no glow, no reflection, no diffusion, no specular highlight.

The failure to avoid: three stacked white sources on one edge — a `0.72` white
border, a `0.96` white bevel and a `0.80` white bounce — which produce a bright
band about a millimetre wide and make the object look like plastic.

### The tonal drop

The floor of a recess must sit **5–9% darker** than the slab around it. Below
about 4%, no amount of edge work will register.

### Rim

**2–3% of the disc's width**, set proportionally so it holds at every size.
3px on a 150px disc; on an 80px card it must shrink with it. Below ~2% the
shadow band starts eating the rim.

Raised discs have **no rim at all**. On a mid-tone ground the ground itself
draws the edge, so a hairline has nothing left to do.

---

## 3. Colour has three channels and they never overlap

| channel | carries | varies by |
|---|---|---|
| the ground | which topic this is | page |
| the disc | nothing — it is always white | never |
| the egg | state | the student's answer |

The disc is white on every page of every topic, which is exactly why it can be
everywhere. It means nothing, so it can never contradict anything.

### The grounds

Desaturated mid-tones, all within a narrow lightness band, so one white, one
ink and one shadow recipe work on every page without per-page tuning.

```css
--ground-leaf:  #ADB77;   /* ⚠ five digits — invalid hex, needs settling */
--ground-stone: #D2CEC2;
--ground-sage:  #BDC8C4;
--ground-wheat: #DDBF8F;
--ground-moss:  #C9C7AF;
--ground-slate: #C0CAD2;
--ground-clay:  #D9B09D;
--ground-lichen:#B8B8AA;
--ground-linen: #DCD5CD;
```

Nine grounds against eleven grammar topics. Two still to find, and they should
be spaced well away from these in hue rather than filling the gaps between them
— several of the nine are already close enough to be mistaken for each other.

**The shadow is tinted with the ground's own hue, never black.** Take the
ground, darken it heavily, use that as the shadow colour. This is why the discs
sit *in* the scene instead of on top of it, and it is the one value that
changes per ground.

### The eggs

Blue, leafy green, wheat. Blue is the resting state; the other two are the
outcome.

```css
--egg-rest:  #61b5ed;
--egg-right: /* leafy green — settle the exact value */
--egg-lost:  /* wheat — settle the exact value */
```

**Known risk, unresolved.** A leafy-green egg on the leaf or moss ground, and a
wheat egg on the wheat or clay ground, are close enough in hue to disappear.
Either those grounds are dropped, or the eggs are set materially deeper in tone
than any ground so they always read as objects on the page rather than parts of
it. This must be settled before the palette ships — it is the one place in the
system where two channels can collide.

Note also that wheat was previously reserved for the app's chrome and nothing
else, on the grounds that gold had been doing four jobs and meaning none of
them. Using it as a state colour reverses that, and the chrome then needs
another colour or none.

---

## 4. The card

The raised disc holds **two words. Never a sentence.**

Verb slab on top, egg beneath it, both **inside** the disc — nothing hangs off
the silhouette, so the whole shape is the tap target and a thumb can never land
on state colour outside the card.

Definitions inside cards are what force 8px type, and 8px type is what makes a
screen look like a photocopied worksheet whatever colour it is painted. All
prose lives in the pressed disc.

**Minimum diameter 88px.** At 72px the verb falls to 12px and the egg to 9px,
which does not survive a phone in a lit room. This has an architectural
consequence: at 88px plus gaps a phone fits three cards across, not four, and
never sixteen.

### Shape follows the word

Round for short, square for long. `KEEP` fits a circle; `WOULDN'T` collapses to
12px in one, because the corners a long word needs are exactly what a circle
does not have. In a square of smaller total footprint it holds 17px.

Square corner radius: **24px**. Softer than that and it loses the geometry
without gaining the circle.

Same rule for the pressed disc: circle for a meaning, square for a sentence.

### Type

Verb: **Archivo Black**, the heaviest face in the set, as large as the disc
allows. Prompt: Space Grotesk 600. Egg: Space Grotesk 700.

Note: `phrasal-verbs-rack.html` specifies Archivo Black and never loads it, so
every verb on that page falls back to system sans at weight 400 — the thinnest
possible reading of a rule that asked for the heaviest. Check the font link
before blaming the design.

---

## 5. Motion

Phones do not appeal to children through decoration. They appeal through
**response**.

- **Every touch answers before the system knows anything.** A disc darkens or
  scales down the instant a finger lands — not when the answer is checked. That
  is the device saying *you touched me*, which is a different message from *you
  were right*, and almost no web exercise sends it.
- **Spring, not fade.** `cubic-bezier(.2,1.4,.4,1)`. Nothing on a phone moves
  at a constant speed.
- **Press is an action, not a decoration.** If every disc is pre-pressed, the
  effect is spent before the child touches anything.
- **Continuity.** A tapped thing becomes the next screen. Wholesale swaps are
  what make a site feel like a stack of pages.

---

## 6. Chrome

Roughly a third of every phone screen was going to a title, a subtitle, seven
mode tabs, a status line and a footer label — before a single card appeared.

A child in a game does not need telling which app they are in.

**Rule:** on a game screen, one back control and one number. Everything else
earns its place or goes. What reads as academic is not darkness or restraint —
it is uniformity, small type, dense labelling and a regular grid. The remedies
are scale contrast, much larger type, a broken grid, and one thing at a time.

---

## 7. Open

- The invalid ground hex, and the two egg values.
- The egg-versus-ground collision on four of the nine grounds.
- Whether the chrome keeps a colour once wheat becomes a state.
- Two more grounds for topics ten and eleven.
- Whether the grounds hold up on a phone at 30% brightness in a lit classroom.
  That is measurable and nobody has measured it. Michael's class can settle it
  in twenty minutes: the same screen in two treatments, and ask which one they
  would rather open.
