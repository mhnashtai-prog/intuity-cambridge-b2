# Speaking recordings

`LINES.csv` lists every line the Speaking pages say aloud — 1,799 of them — with the
file name each recording must have.

| Column | Meaning |
| --- | --- |
| `file` | save the recording under exactly this name, e.g. `examiner-b94ffad362.mp3` |
| `role` | examiner or candidate |
| `part` | Speaking Part 1–4 |
| `voice` | who says it: the examiner, or the named candidate and whether male or female |
| `where` | the question or task it belongs to |
| `text` | the exact words to record |

## Adding recordings

1. Record lines in ElevenLabs and save each under its `file` name.
2. Put the MP3s in this folder (or send them to Claude as one zip).
3. Run `python3 tools/speaking-lines.py` from the repo root. It rebuilds
   `manifest.json` from the files that are actually here.
4. Commit and push.

A line with a recording plays it; a line without one keeps the browser voice. So the app
works with none, some or all of the recordings, and the job can be done a part at a time.
Suggested order: the 85 examiner lines first (they set the tone of every task), then Part 1.

File names come from the words. If a line's words change in the data, it becomes a new
line with a new file name, and the old recording simply stops being used.

## The voices (ElevenLabs, Multilingual v2)

Written down on 13 Nov 2026, so nobody has to search the history again.

| Who | ElevenLabs voice | Settings |
| --- | --- | --- |
| Beatriz (Parts 3–4, default) | Georgia K · Warm, Engaging Customer Care | speed 1.00 · stability 50 · similarity 75 · style 0 · speaker boost |
| Tomás (Parts 3–4, default) | Christopher · Smooth, calm and very English | speed 1.00 · stability 50 · similarity 75 · style 0 · speaker boost |
| Maya (drills, Phrase Bank) | Samara X | speed 0.91 · style exaggeration 0 |
| Drill partner | Julian | |
| Examiner | not written down; by pitch and voice colour it matches Samara X (Maya), although LINES.csv says "male" | |

A line's file is named from its words alone, so two speakers who say the same words share one
recording. A retake recorded in one take per speaker (Part 3 Technology, 13 Nov) is cut into its
pieces and joined into its own `turn-*.mp3` files directly, so it never overwrites a shared line.

