# INTUITY · Cambridge B2

A static site for teenage Cambridge B2 learners. Netlify publishes the `main` branch automatically.

## Going live

The owner wants finished changes live without asking:

- Commit straight to `main` and push. Do not open a pull request or leave work on a side branch, because Netlify only publishes `main`. Work left on branches never reaches the pupils (this happened on 9 Nov 2026 with four unmerged pull requests).
- Before pushing, check the changed pages: they open on a phone-sized screen (390 px wide) with no console errors, and any changed JSON is valid.
- If another session's work is waiting on a branch or in an open pull request, merge it into `main` once it passes the same checks.

## Working style

- Change things only when they help pupils learn. Skip anything pedagogically counterproductive.
- Every modal card shares one look: the FiveCard architecture (`tools/five-card.js`/`.css`).
- Speaking is practice now (owner's decision after the pupils' verdict, 23 Nov 2026: "too many entry gates"). The menu has four rings, one per Part, each opening `skills/speaking/test.html?part=N`: that Part only, practised at once (Maya, the examiner, asks; the pupil answers); that Part's topics in the header (never the other Parts); that Part's Structures, Drills and Games as footer pills (Writing's pill row). The whole test is the menu's Full test pill. Don't put a gate, step or explanation back in front of the practice. Structures, Drills and Games teach what Practise teaches (the same moves, labels, topics and chunks, from the Tomás and Beatriz dialogue files), and none of them lets a pupil switch to another Part. Writing follows the same way (owner's decision, 25 Nov 2026): a task's ring opens its Model at once (the entry: a page that needs no thinking, with a Watch ring for the task's clip; the gate is gone); the footer is Practise, Basics, Exercises, Game (`tools/writing-foot.js`), the last three options only; Practise is a slim track above the footer, Model, Question, Plan, Sample, Write it; back inside a task leads to its Model, the Model leads to the Writing menu, and nothing switches to another task.
- The two-row header of mode selectors and the pendulum gate are deliberate: once a pupil learns how one page works, every other page follows suit. Keep them; never count them as clutter in an audit.
- Judge a page first by whether it delivers what it promises pedagogically: the B2 First papers the app covers (Reading, Use of English, Writing, Speaking), and general grammar and vocabulary learning for pupils who use the app beyond the exam.
- Listening is not part of the app (owner's decision, 12 Nov 2026). Don't propose it, and don't claim the app covers all five skills or every paper.
- Pupils sit both B2 First and B2 First for Schools, prepared the same way (they are told the differences in writing, speaking and reading). Keep both the report and the story.
- Minimise taps. Games should have tension: a check, a score, a run and a personal best (`tools/intuity-cheer.js` for sound and glitter).
- Writing is criticism-free (owner's decision, 25 Nov 2026; the other menus follow one at a time). On a Writing page nothing the pupil does is called wrong, a mistake, missed, weak or a slip: a miss is "Not yet" with the answer shown, and it comes back next time. Nothing is taken away: no lives, no strikes that end a board, no step drops (a miss keeps its step), no D grade. No red: soft rust or caramel at most, and no crosses on tiles. Feedback on a pupil's own text leads with what they did well and gives at most three polishes. How it's marked shows what earns a 5 and a 3, never Band 1 as a verdict. A Portuguese-speaker slip is taught as a contrast between the two languages ("From Portuguese"), not as a warning. Tension stays: the check, the score (more for a first try), the clock, the run, the personal best. The shared boards (`skills/challenge/challenge.html`, `boardgame.html`, `tools/report-it.js`) do this only for `section=writing` (their `CALM` flag), so Grammar and Vocabulary are unchanged until their turn.
- Bump the `?v=` query on a shared script or stylesheet when you change it, so phones don't keep an old copy.
