Be2FIRST: How the Work Was Done
13/10/2026 · @Majid Nashtai
I made every code change to Be2FIRST, from editing files to publishing them. You never had to copy, paste or upload a file to GitHub. The work was a partnership all the same: you made the teaching decisions, held the ElevenLabs account and recorded the audio in your own browser, because my workspace could not reach ElevenLabs.
How I worked on the code
I worked on my own copy of the repository and sent each finished change back to GitHub. Netlify then published it to be2first.com without anyone doing anything.
1. A copy, not a live link. At the start of a session I cloned the GitHub repository into a private cloud workspace. I edited that copy, so nothing on the live site changed until I chose to send it.
2. Editing. I changed pages, scripts and data files directly. For the Speaking answers I did not hand-edit the JSON. I wrote builder scripts that hold the simpler wording and check every answer for banned words, sentence length and speaking time, then generate the JSON.
3. Testing before sending. I ran the pages in a headless browser (Playwright) with sound and speech stubbed out. That way I could check that every line found its MP3 and nothing fell back to the robot voice. I checked the recorded voices by measuring their pitch, so a male voice in a female slot would show up.
4. Sending it back. Each change went up as a commit with a short note on what changed and why. Before each push I pulled any newer changes from GitHub, so nothing you or anyone else did was overwritten. Between 11 and 13 October that came to 50 commits.
5. Publishing. Netlify watches the repository and rebuilds the site on every push, usually within a minute or two. When a page still looked old for you, the cause was the browser's cache, and a hard refresh (Ctrl+F5) fixed it.
The one thing my workspace could not do was reach ElevenLabs, because its network only allows a short list of sites. That shaped how the audio was made (next sections).
What I built and changed
I wrote all the code and content changes below. The direction for each came from you.
Area
What changed
Brand
INTUITY renamed to Be2FIRST across the site, ready for be2first.com
Part 1 answers
All 105 answers rewritten in plainer English a 15-year-old B2 student can say, keeping the expansion (answer, reason, example)
Part 2
24 long turns and 24 follow-ups simplified; each turn kept to 45–56 seconds
Part 3
Two passes of simplification; British slang and dashes removed, long sentences split, "What's your opinion?" and "To add to that" used for turn-taking
Part 4
90 answers, each with an opinion opener and a clear reason. The four phrases you asked for (In my view, The way I see it, I really think, My own view is that) rotate 11–12 times each
Voice Studio
A page in the site's tools folder that records every Speaking line through your ElevenLabs account, in your browser, and packs the MP3s into one zip
Recovery
A "Find my recordings" step that rebuilds a lost zip from your ElevenLabs history, without spending credits; it recovered 740 Part 3 files
Audio player
The pages play the real recording for each line and only fall back to the browser voice if one is missing; files are preloaded so there are no gaps
Part 3 joins
The 740 short Part 3 pieces were joined into 270 whole turns with natural pauses, so a turn sounds like one person speaking
Screen tidy-up
The small boxes in the middle of Explore removed; sentences not being spoken now fade to 60% instead of a pale grey
How the recordings got into the app
You recorded every MP3; I did everything after the zip arrived. My workspace could not reach ElevenLabs, so I built Voice Studio to run in your browser, where it could.
The zips you attached here were the only file hand-off in the whole job, and they came to me, not to GitHub. Every file name is worked out from the sentence's own words, so the app finds the right recording without a list kept by hand.
What you did
You never touched GitHub during this work, but the app would not exist without the parts only you could do.
• Set the teaching direction. You decided the answers should be simpler but keep the expansion, that Part 4 must model opinion and justification, and which phrases to use. You also judged each part by ear ("the closest to a very well-structured FCE pattern" for Part 2, "the best of the speaking package" for Part 4).
• Ran the ElevenLabs account. You made the API keys, set their permissions, and spent and tracked the credits (67,458 of 131,000 left, renewing on 12 November).
• Chose the voices. You picked Samara as examiner, found the UK voices and pasted their IDs into Voice Studio.
• Recorded every MP3. You pressed Record in Voice Studio for all four parts, re-recorded Part 2 when voices got mixed up, and recovered Part 3 from your history.
• Delivered the audio. You attached the finished zips in this chat. That was the only hand-off of files, and it went to me, not to GitHub.
• Tested it for real. You checked the live site on PC and phone, caught the stale Part 3 audio, the grey text and the broken gaps, fixed your microphone setting, and tried the app with your own class.
• Set up the foundations earlier. The GitHub repository, the Netlify site and the be2first.com domain were set up under your accounts before this stage of the work.
Mistakes and fixes
Not everything worked first time, and some of the mistakes were mine. Each one below is now fixed.
Problem
Whose
Fix
API keys appeared in two screenshots
Shared
You deleted those keys; only the Voice Studio key remains
"Just a sample" picked new lines on every press, costing extra credits
Mine
The sample is now a fixed set of 3 lines per speaker
Key rejected or missing permission
Setup
Voice Studio now shows ElevenLabs' own error and stops at the first refusal, saying which permission to tick
Library voices failed with conflict errors
ElevenLabs limit
Automatic retries, one recording at a time for pasted voices
Only 16–20 files could be attached per message
Chat limit
Switched to one zip per batch
Voices mixed up in Part 2
Dropdown confusion
I checked every file by pitch; you re-recorded Part 2
Re-recorded files kept old audio in browsers
Mine
Each file now carries a fingerprint, so a new recording is always fetched
Part 3 sounded choppy, with missing examiner and long pauses
Mine
Pieces joined into whole turns and preloaded
I said Netlify deploys were paused
Mine
False alarm from a misleading check; you confirmed Part 4 was live and I withdrew it
Old Part 1 text still showing
Browser cache
Ctrl+F5
Microphone recorded only 1 second
Device setting
You picked the right microphone in Chrome's site settings
Where things stand
All four Speaking parts are fully voiced and live on be2first.com: 1,895 recorded lines plus 270 joined Part 3 turns, about 86 MB. Every page was tested with no fallback to the browser voice, and self-recording works.
Part
Examiner lines
Candidate lines
1
35
310
2
24
144
3
29
740 (played as 270 turns)
4
33
580
Still open:
[ ] A Delete button for your own recordings
[ ] Part 3: run Discuss and Decide as one continuous exchange
[ ] Games for the pages that don't have one yet
[ ] Similar Words sets 53, 104, 108 and 113
[ ] Fill the empty Essays › Phrases and Assessment › Help pages
