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
