# INTUITY — what this is for

*Written for whoever picks this up next, including a future Claude. Read this
before `BLUEPRINT.md`: that one says how the code is built, this one says why.*

---

## The aim

A Cambridge B2 course that a fifteen-year-old opens without being told to.

Everything follows from that. The content has to be right — it is exam
preparation and a wrong answer key is worse than no page at all — but
correctness is the floor, not the goal. A page that is accurate and dull has
failed, because the student closes it and learns nothing.

Three things matter, in this order:

**Smart pages.** The data knows what it contains. Every item knows its rule,
its cue, its alternatives, its explanation — so a wrong answer can say why,
and a page can be checked by a machine rather than by eye. This is what makes
the rest possible.

**A modern interface.** These students spend their evenings in Discord and
mobile games. A page that looks like a photocopied worksheet is competing with
those and losing before the first sentence is read. Grammar is intimidating
enough as a word.

**Engagement that is earned.** Not decoration bolted onto an exercise. If the
mechanic is not enjoyable before the animation is added, the animation will not
save it. The test for any effect: does a child understand the game better with
it than without?

---

## How the work goes

**Experimental above everything.** Ideas arrive as pencil sketches on paper,
often photographed on a table. They are not specifications — they are the
start of an argument. Build the thing, look at it, change it. Eight games came
out of this in two days, and the best of them (a board of circles, a rack of
cards) came from a photograph of a children's toy, not from a plan.

**Say when an idea is wrong, and why.** Connect 4 was rejected because the
strategy and the grammar never touch. A radial menu was steered away from the
game and toward the topic screen, because sixteen spokes is a crowd. This is
wanted, not tolerated — an agreeable assistant is a useless one here.

**Screenshots are the real feedback.** Half the important faults this project
has found were invisible in code and obvious the moment a page was open:
a particle sitting before its verb, twenty-two circles when there should have
been thirty-six, a definition covered by the box celebrating the last answer.
Ask for a screenshot. Look at it properly.

**Verify, do not assume.** The live repo is public and can be fetched
directly. Check what is deployed rather than trusting what was sent. Run code
rather than reading it — a syntax check proves a file parses, not that it
works, and three separate bugs this week hid behind exactly that gap.

---

## Design rules already settled

These were argued for and decided. Change them deliberately, not by accident.

- **The table is dark; anything you pick up, place, claim or lose is light.**
  Aged card stock, ink text. It is how a board game looks on a table at night.
- **An egg carries the particle, and its fill is the state**: blue waiting,
  green right, brick lost. Same three colours in every game.
- **Gold is the app, not a piece.** It was doing four jobs at once and meaning
  none of them. It now touches the title and the chrome only.
- **Blue marks the evidence** — the cue in a gap-fill, the particle on a card.
- **The verb comes before the particle.** A game may bend many things but not
  the shape of the thing it teaches.
- **A penalty must cost something and still teach.** A card that closes
  unanswered shows the answer it wanted. A dead end teaches nothing.
- **The cue is not the answer.** Highlight the evidence a student reads to
  decide, never the thing they are being asked to produce.

---

## Where the judgement is not mine

Some questions are settled by measurement and some are not, and the difference
should be respected in both directions.

**Measurable, so measure it:** does every item parse, does every answer mark
itself, does a cue actually appear, does the layout fit the frame, is the text
readable at this contrast. `tools/barometer.html` scores every grammar topic
on the Cambridge scale and names what is costing it points.

**Not measurable, so ask:** whether a page is fun, whether the difficulty is
right for a Madeiran fifteen-year-old, whether an explanation sounds like a
teacher or a manual, whether a penalty sharpens or frustrates. Michael teaches
these students. Draft the words, then say plainly that they are a draft and
should be reworded.

---

## Starting a new conversation

Nothing carries over — not the sandbox, not the history. What survives is the
repository. A useful opening:

> My project is github.com/mhnashtai-prog/intuity-cambridge-b2 — a Cambridge
> B2 site. Fetch INTENT.md and BLUEPRINT.md from the root before we start.
> Verify against the live repo rather than assuming, and test code by running
> it rather than reading it.

Then work as before: sketches, prototypes, screenshots, arguments.

---

## What is still open

- Six of the eleven grammar topics have only three ways in. The games built
  for phrasal verbs generalise to any topic whose data has categories.
- Tenses and reported speech have no rule buckets, so nothing can sort them.
- Item-level logging is in three games (`tools/intuity-log.js`); the rest
  would take one line each.
- October: three games go to a class. The question is not which they enjoy
  first — novelty wins that — but which they choose *second*, and whether they
  score better on the same items a week later.
