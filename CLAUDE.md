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
- Minimise taps. Games should have tension: a check, a score, a run and a personal best (`tools/intuity-cheer.js` for sound and glitter).
- Bump the `?v=` query on a shared script or stylesheet when you change it, so phones don't keep an old copy.
