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
- The two-row header of mode selectors and the pendulum gate are deliberate: once a pupil learns how one page works, every other page follows suit. Keep them; never count them as clutter in an audit.
- Judge a page first by whether it delivers what it promises pedagogically: the B2 First papers the app covers (Reading, Use of English, Writing, Speaking), and general grammar and vocabulary learning for pupils who use the app beyond the exam.
- Listening is not part of the app (owner's decision, 12 Nov 2026). Don't propose it, and don't claim the app covers all five skills or every paper.
- Pupils sit both B2 First and B2 First for Schools, prepared the same way (they are told the differences in writing, speaking and reading). Keep both the report and the story.
- Minimise taps. Games should have tension: a check, a score, a run and a personal best (`tools/intuity-cheer.js` for sound and glitter).
- Bump the `?v=` query on a shared script or stylesheet when you change it, so phones don't keep an old copy.
