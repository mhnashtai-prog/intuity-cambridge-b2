import json, re, sys

def S(m, t, marks=(), wrong=(), alts=()):
    s = {"m": m, "t": t}
    if marks: s["marks"] = list(marks)
    if alts: s["alts"] = list(alts)
    if wrong: s["wrong"] = [{"t": a, "why": b} for a, b in wrong]
    return s

def A(why, *segs): return {"why": why, "segs": list(segs)}

# Reusable wrong answers that teach the same lesson in different clothes
FORMAL = "Correct, but it sounds like a letter to the council. Part 1 is a chat: sound like you, not like a textbook."
STOCK  = "The examiner hears this fifty times a day. It fills the silence without telling them anything about you."

D = {
 "version": 2,
 "title": "Speaking Part 1 — react, answer, expand",
 "note": ("Three 14-year-olds from Madeira: Bia (Funchal), Tomás (Câmara de Lobos), Leonor (Santana). "
          "Each answer is stored once, in speaking order; its shape is simply the moves it contains. "
          "Every answer lands between 15 and 20 seconds at 2.5 words a second — build.py checks this. "
          "No answer uses all five moves: the shape is chosen for the question, never recited."),
 "tip": ("There's no recipe. A big, happy question can take a reaction and one story. A tricky one needs a 'but'. "
         "Pick two or three moves that fit, and say them like you mean them."),
 "moves": {
  "x": {"name": "React",    "hint": "how the question makes you feel, before you answer it",
        "ask": "Now put a reaction in front — how does the question make you feel?"},
  "a": {"name": "Answer",   "hint": "say it straight, in one go",
        "ask": "Start with the answer."},
  "r": {"name": "Reason",   "hint": "why — the part the examiner could never guess",
        "ask": "Now say why."},
  "e": {"name": "Example",  "hint": "one real moment: a day, a place, a person",
        "ask": "Now prove it with one real moment."},
  "c": {"name": "Contrast", "hint": "the 'but' — the other side that makes it sound real",
        "ask": "Now add the 'but'."}
 },
 "voices": [
  {"id": "bia", "tab": "Bia", "fem": True,
   "who": "Beatriz, 14. Lives above a café near the market in Funchal. Bodyboards, films dance videos, talks fast."},
  {"id": "tomas", "tab": "Tomás", "fem": False,
   "who": "Tomás, 14. Câmara de Lobos. Gamer, Marítimo fan, dry sense of humour, softer than he lets on."},
  {"id": "leonor", "tab": "Leonor", "fem": True,
   "who": "Leonor, 14. Santana, on the rainy north coast. Draws all the time, misses her cousins in Jersey."}
 ],
 "topics": [
  # ───────────────────────── WEEKENDS
  {"id": "weekend", "tab": "Weekends", "question": "What do you usually do at the weekend?",
   "answers": {
    "bia": A("A big, happy question: a reaction and one vivid story are enough. Nobody needs a reason for loving the beach.",
      S("x", "Oh, weekends are everything to me!", ["Oh,"],
        wrong=[("Well, that's a good question.", STOCK),
               ("I would say that weekends are an important time for young people.", FORMAL)],
        alts=["Honestly? I live for weekends.", "Oh my god, weekends are the best."]),
      S("a", "If the sea's calm, I'm at Praia Formosa with my bodyboard by nine, and my friends turn up whenever they wake up.",
        ["If the sea's calm", "whenever"]),
      S("e", "Last Sunday we stayed till sunset, and I got home so sunburnt that my mum just looked at me and sighed.",
        ["Last Sunday", "so sunburnt that"],
        wrong=[("I do lots of fun things with my friends at the beach.", "That's the answer again, only vaguer. An example is one day you could film."),
               ("The beach is good because it is near my house.", "That's a reason, not an example — and it's the weakest part of the story.")])),
    "tomas": A("'Not much' could be a dead end. The contrast at the end turns it into something funny and a bit honest.",
      S("x", "Honestly? Not that much, and I'm fine with that.", ["Honestly?"],
        wrong=[("That is an interesting question.", STOCK),
               ("Oh, I absolutely adore my weekends!", "Nothing wrong with the English — but it isn't Tomás, and the answer after it says he does nothing. A reaction has to match what follows.")],
        alts=["Not much, to be honest.", "Ha — nothing exciting, I'm afraid."]),
      S("a", "I sleep in, play online with my cousin, and on Sundays we all have lunch at my grandparents' in Estreito.",
        ["sleep in", "on Sundays"]),
      S("c", "Mind you, by Sunday night I'm actually bored enough to miss school, which is a bit sad.",
        ["Mind you", "bored enough to", "which is a bit sad"],
        wrong=[("On the other hand, I also like weekends.", "A 'but' that doesn't turn anywhere. The contrast has to push against what you just said."),
               ("However, there are many disadvantages to weekends for teenagers.", FORMAL)])),
    "leonor": A("'It depends' buys a second to think, and 'used to … but now' shows a change of heart — that's the complex bit.",
      S("x", "It depends which weekend, to be honest.", ["It depends", "to be honest"],
        wrong=[("Weekend is very nice.", "Too thin for B2, and a little ungrammatical. React with a feeling or a hesitation, not a label."),
               ("Let me think about this question carefully.", "Sounds like stalling in an exam, because it is. 'It depends…' does the same job naturally.")],
        alts=["Ooh, it kind of depends.", "Well, that changes a lot."]),
      S("a", "Every other Saturday I help my aunt at her stall at the Santana market, selling bolo do caco and honey cake.",
        ["Every other Saturday"]),
      S("r", "I used to hate getting up at six, but now I actually love it, because all the old ladies know my name.",
        ["used to", "but now", "actually"],
        wrong=[("I help my aunt because she has a stall.", "That repeats the answer. A reason adds what the examiner couldn't know."),
               ("The main reason is that it provides me with useful work experience.", FORMAL)]))
   }},
  # ───────────────────────── WHERE YOU LIVE
  {"id": "home", "tab": "Where you live", "question": "What's the area where you live like?",
   "answers": {
    "bia": A("The reaction and the contrast pull in opposite directions — noisy, but loved; lovely, but uphill. That tension sounds like a real opinion.",
      S("x", "Oh, it's so noisy — but I love it.", ["so noisy", "but I love it"],
        wrong=[("My area is located in the south of the island.", "That's geography, not a reaction. Say how you feel about it first."),
               ("Well, that's a good question.", STOCK)],
        alts=["Honestly, it's chaos, in a good way.", "Loud! Really loud."]),
      S("a", "We live right in the centre of Funchal, near the market, so there's always music, tourists and cruise ships.",
        ["right in the centre", "there's always"]),
      S("c", "The only problem is the hills. Walking home from school is basically a workout, and I'm always late.",
        ["The only problem is", "basically"],
        wrong=[("Also, there are many shops and restaurants.", "More of the same. 'Also' adds; a contrast turns."),
               ("Nevertheless, the area presents certain challenges for residents.", FORMAL)])),
    "tomas": A("No reaction: a flat question, a flat start. The feeling arrives in the reason instead, and the example makes it hit.",
      S("a", "It's a fishing town, Câmara de Lobos, so most mornings the whole place smells of fish.",
        ["so most mornings"]),
      S("r", "People think that's gross, but to me it just smells like home.",
        ["People think", "but to me"],
        wrong=[("It smells of fish because there are a lot of fishing boats.", "True, but obvious. The reason worth saying is why he doesn't mind."),
               ("I live there because my parents live there.", "Technically a reason, but it answers a question nobody asked.")]),
      S("e", "My uncle still goes out in his boat at five, and sometimes he wakes me up to go with him.",
        ["still", "sometimes he wakes me up"],
        wrong=[("There are many fishermen in my town, for example.", "'For example' doesn't make it an example. One person, one morning — that's an example."),
               ("I really like the sea very much.", "A feeling, not a moment. Show it with something that happened.")])),
    "leonor": A("Reason and contrast do the complex work: it's lonely, but it's beautiful. Both are true, and she says both.",
      S("x", "Well, it's very green — and very wet!", ["Well,"],
        wrong=[("It is a rural area with a high level of rainfall.", FORMAL),
               ("That is an interesting question.", STOCK)],
        alts=["Ha — rainy. That's the first word.", "Green. Everything is green."]),
      S("a", "I live in Santana, on the north coast, where it rains most days in winter.",
        ["where it rains"]),
      S("r", "It's an hour from Funchal, so it can feel a bit lonely.",
        ["so it can feel"],
        wrong=[("It is very green because it rains a lot.", "A science fact, not her reason. The reason should explain how living there feels."),
               ("I like it because it's nice.", "Empty. 'Nice' tells the examiner nothing.")]),
      S("c", "But when the fog rolls in over the mountains, honestly, it's like living in a film.",
        ["But when", "it's like"],
        wrong=[("But it's also very rainy.", "That's the same side as before. A contrast has to swing back the other way."),
               ("In contrast, urban areas offer more opportunities.", FORMAL)]))
   }},
  # ───────────────────────── HOMETOWN
  {"id": "hometown", "tab": "Hometown", "question": "Would you like to live in your hometown when you're older?",
   "answers": {
    "bia": A("A genuinely hard question, so she says so. The reason is honest and a little cheeky — the island is small.",
      S("x", "Ooh, that's a hard one.", ["Ooh,", "that's a hard one"],
        wrong=[("Yes.", "An answer, not a reaction — and a closed door. Show the question made you think."),
               ("This question requires careful consideration.", FORMAL)],
        alts=["Hmm, I really don't know.", "Oh, I go back and forth on that."]),
      S("a", "Part of me wants to go to Lisbon or even London for university and just see what's out there.",
        ["Part of me wants", "what's out there"]),
      S("r", "Madeira's amazing, but it's so small that everyone knows your business — and I mean everyone.",
        ["so small that", "and I mean everyone"],
        wrong=[("I want to go to university in Lisbon or London.", "That's the answer again. Why does she want to leave?"),
               ("Because big cities offer better educational opportunities.", "Could be anyone's answer. Hers is about gossip — personal beats generic.")])),
    "tomas": A("A quick 'yes', then complicated. The example is what proves the contrast isn't just a phrase — his family has lived it.",
      S("a", "Yeah, I think so. My whole family's here, and I'd miss the sea too much.",
        ["I'd miss", "too much"]),
      S("c", "Although, to be fair, there aren't many jobs, so I might not get to choose.",
        ["Although, to be fair", "might not get to"],
        wrong=[("Although I like it a lot.", "'Although' needs a real opposite after it. This agrees with everything before."),
               ("However, the employment situation is unfavourable.", FORMAL)]),
      S("e", "My brother moved to Lisbon for work last year, and my mum still gets upset about it.",
        ["last year", "still gets upset"],
        wrong=[("For example, lots of people leave Madeira.", "A statistic in disguise. One person you know is worth ten 'lots of people'."),
               ("My brother is older than me.", "True and specific — but it doesn't prove anything he just said.")])),
    "leonor": A("She's torn, and she shows it with one memory instead of explaining it. The dash does the turning.",
      S("x", "Honestly? I go back and forth on it.", ["Honestly?", "go back and forth"],
        wrong=[("Well, that's a good question.", STOCK),
               ("Absolutely, one hundred per cent!", "Fine for a different person — but the rest of her answer is torn, so this reaction would be a lie.")],
        alts=["Ooh, I really don't know.", "That's the big question, isn't it?"]),
      S("a", "I'd love to come back one day, but not straight away.",
        ["I'd love to", "not straight away"]),
      S("e", "When I stayed with my cousins in Jersey last summer, I loved it — but after two weeks I really missed my grandma's cooking.",
        ["When I stayed", "after two weeks"],
        wrong=[("Jersey is an island in the English Channel.", "A fact about Jersey, not a moment from her life."),
               ("For instance, I like other countries.", "Vague. Where, when, what happened?")]))
   }},
  # ───────────────────────── SCHOOL
  {"id": "study", "tab": "School", "question": "What's your favourite subject at school?",
   "answers": {
    "bia": A("A cheeky reaction the examiner will smile at, then a reason that's really about her. Short question, short answer.",
      S("x", "Is it really bad if I say PE?", ["Is it really bad if"],
        wrong=[("My favourite subject is Physical Education.", "That's the answer, not a reaction — and a bit stiff. The joke is the reaction."),
               ("There are many subjects at my school.", "Avoiding the question. React to it instead.")],
        alts=["PE, obviously — is that allowed?", "Oh, easy. PE."]),
      S("a", "It's the one lesson where I'm not watching the clock the whole time.",
        ["the one lesson where"]),
      S("r", "I just can't sit still for fifty minutes — my teachers say I've got way too much energy.",
        ["I just can't", "way too much"],
        wrong=[("PE is good for your health and fitness.", "A poster in the school corridor. Her reason is about her, not about health."),
               ("I like PE because it's my favourite.", "Circular: the reason repeats the question.")])),
    "tomas": A("No reaction: the answer is the surprise, and 'which surprises people' does the reacting for him. The example is a scene.",
      S("a", "History, which surprises people, because I'm not exactly a model student.",
        ["which surprises people", "not exactly"]),
      S("r", "Our teacher tells it like a story, with all the gossip and the betrayals, so it doesn't feel like studying.",
        ["tells it like a story", "so it doesn't feel like"],
        wrong=[("History is important because we learn about the past.", "Every textbook says this. His reason is the teacher."),
               ("I like it because I'm good at History.", "Possible, but thin — and it contradicts 'not a model student'.")]),
      S("e", "Last week it was the Romans, and he acted out Julius Caesar getting stabbed. Best lesson ever.",
        ["Last week", "acted out", "Best lesson ever."],
        wrong=[("For example, we study lots of different periods.", "A list, not a moment. What happened in one lesson?"),
               ("The Romans were a very powerful empire.", "A fact about Rome, not his example.")])),
    "leonor": A("Reaction, answer, then a 'but' that isn't about the subject at all — it's about her dad. That's the complexity.",
      S("x", "Oh, Art, without a doubt.", ["without a doubt"],
        wrong=[("I think it's probably Art, maybe.", "Hedging on something she's sure about. Save the hedge for hard questions."),
               ("That is an interesting question.", STOCK)],
        alts=["Art. Easy.", "Oh, Art — no contest."]),
      S("a", "It's the only place where I can put my headphones in and just get lost in what I'm drawing.",
        ["the only place where", "get lost in"]),
      S("c", "The annoying thing is, my dad keeps saying art won't get me a job, so I'm doing extra Maths too, which I hate.",
        ["The annoying thing is", "keeps saying", "which I hate"],
        wrong=[("But I also like Portuguese a little bit.", "A second favourite isn't a contrast; it just splits the answer."),
               ("On the other hand, Art has some disadvantages as a subject.", FORMAL)]))
   }},
  # ───────────────────────── FREE TIME
  {"id": "freetime", "tab": "Free time", "question": "What do you like doing in your free time?",
   "answers": {
    "bia": A("Straight in — she's too excited to react first. The reason admits it sounds silly; the example proves it isn't.",
      S("a", "I'm obsessed with making dance videos with my best friend.", ["I'm obsessed with"]),
      S("r", "It sounds silly, but it's how we switch off after school.", ["It sounds silly, but", "switch off"],
        wrong=[("Dancing is a very popular activity among teenagers.", "A survey result, not her reason."),
               ("I make them because I like making them.", "Circular. What does it do for her?")]),
      S("e", "Last month we filmed one in the cable car up to Monte, and an old couple from Germany joined in.",
        ["Last month", "joined in"],
        wrong=[("We film lots of videos in different places.", "Vague. One place, one day, one thing that happened."),
               ("Monte is a village above Funchal.", "Tourist-guide fact. The example is the moment, not the place.")])),
    "tomas": A("He admits the obvious, then flips it: it's not about the game. That's a reason with an idea in it.",
      S("x", "Gaming, mostly — I won't lie.", ["I won't lie"],
        wrong=[("In my free time I enjoy a variety of hobbies.", FORMAL),
               ("Well, that's a good question.", STOCK)],
        alts=["Ha — gaming. Obviously.", "Honestly? Mostly gaming."]),
      S("a", "I play with the same four friends most nights, and we talk the whole time.", ["the whole time"]),
      S("r", "So for me it's not really about the game — it's how we stay in touch, since we all go to different schools now.",
        ["it's not really about", "stay in touch", "since"],
        wrong=[("Games are good because they are fun and exciting.", "Anyone could say it. His real reason is his friends."),
               ("Some people think gaming is bad for teenagers.", "That's a debate for Part 4, not his reason.")])),
    "leonor": A("She predicts the examiner's reaction before they have it. Then one misty morning does all the persuading.",
      S("x", "Oh, this is going to sound really old-fashioned.", ["this is going to sound"],
        wrong=[("I have a very interesting hobby.", "Telling the examiner it's interesting. Let the answer be interesting instead."),
               ("That is an interesting question.", STOCK)],
        alts=["Promise you won't laugh?", "Okay, don't judge me."]),
      S("a", "I go walking along the levadas with my dad on Sunday mornings.", ["on Sunday mornings"]),
      S("e", "Last time we did Caldeirão Verde, and it was so misty we could barely see the waterfall.",
        ["Last time", "so misty we could barely"],
        wrong=[("Walking is a good form of exercise.", "A health fact, not an example."),
               ("There are many levadas in Madeira, for example.", "'For example' at the end doesn't turn a fact into a memory.")]))
   }},
  # ───────────────────────── TRAVEL
  {"id": "travel", "tab": "Travel", "question": "Do you enjoy travelling?",
   "answers": {
    "bia": A("The reaction already hints at a 'but' — 'well, the being-there part'. The contrast pays it off.",
      S("x", "Oh, I love it — well, the being-there part.", ["well, the being-there part"],
        wrong=[("Travelling is something that many people enjoy.", FORMAL),
               ("Yes, I enjoy travelling.", "Just the question turned into an answer. React first.")],
        alts=["Oh, yes — mostly.", "I love it. Well… sort of."]),
      S("a", "Every summer we take the ferry to Porto Santo, and the beach there just goes on forever.",
        ["Every summer", "just goes on forever"]),
      S("c", "The ferry, on the other hand, is a nightmare: two and a half hours of feeling sick. Every single time.",
        ["on the other hand", "Every single time."],
        wrong=[("On the other hand, Porto Santo is also beautiful.", "Still the good side. The ferry is the other side."),
               ("However, travelling can be expensive for families.", "A general 'but'. Hers is about her stomach — personal wins.")])),
    "tomas": A("A surprising 'no' needs a reason fast, and the reason needs proof. Anyone from Madeira will recognise this one.",
      S("a", "Not really, and I blame the airport.", ["I blame"]),
      S("r", "The runway's famous for strong winds, so flights get cancelled all the time.",
        ["famous for", "all the time"],
        wrong=[("I don't like travelling because I don't enjoy it.", "Circular — it just repeats the answer."),
               ("Airports are big buildings with many people.", "A description of airports, not his reason.")]),
      S("e", "Last Christmas we were stuck in Lisbon for two days, and my little sister cried the whole time.",
        ["Last Christmas", "were stuck", "the whole time"],
        wrong=[("For example, many flights are cancelled.", "That's the reason again. The example is one trip that went wrong."),
               ("Lisbon is the capital of Portugal.", "A fact about Lisbon, not a moment from his life.")])),
    "leonor": A("A wish, the honest reason she can't, and a 'but' that turns the problem into ambition. Complex without a single long word.",
      S("x", "I'd love to travel more, honestly.", ["I'd love to"],
        wrong=[("Travel is very important in the modern world.", FORMAL),
               ("Well, that's a good question.", STOCK)],
        alts=["Oh, I wish I could!", "I'd love to — if I could."]),
      S("a", "I've only been off the island twice, both times to see my cousins in Jersey.",
        ["I've only been", "both times"]),
      S("r", "Flying from here is expensive, and my parents never get holidays at the same time.",
        ["never", "at the same time"],
        wrong=[("I've been to Jersey twice to see my cousins.", "That's the answer again. Why only twice?"),
               ("Because travelling is good for learning about other cultures.", "That's why people should travel, not why she hasn't.")]),
      S("c", "But honestly, that just makes me want it more.", ["But honestly", "just makes me want it more"],
        wrong=[("But my cousins also travel a lot.", "About the cousins, not about her. The 'but' should turn her story."),
               ("Nevertheless, there are many benefits to travelling.", FORMAL)]))
   }}
 ],
 "phraseBank": [
  {"heading": "Reacting — when you love it", "note": "Say the feeling first. The answer can wait two seconds.",
   "phrases": ["Oh, I love it!", "Honestly? It's the best.", "Oh my god, yes.", "Oh, …is everything to me."]},
  {"heading": "Reacting — when you need a second", "note": "Buying time sounds natural if it sounds like you're really thinking.",
   "phrases": ["Ooh, that's a hard one.", "It depends, to be honest.", "Hmm, I go back and forth on that.", "That's the big question, isn't it?"]},
  {"heading": "Reacting — when you're not that keen", "note": "Being negative is fine. Being flat isn't — give the 'no' some personality.",
   "phrases": ["Not really, if I'm honest.", "Ha — not much, and I'm fine with that.", "I won't lie, …", "This is going to sound weird, but…"]},
  {"heading": "Saying it straight", "note": "One sentence, the real answer. Put the detail in, not the preamble.",
   "phrases": ["Most weekends I…", "Every other Saturday…", "It's the one … where…", "Part of me wants to…"]},
  {"heading": "Saying why", "note": "The reason is the part the examiner couldn't guess. Make it about you.",
   "phrases": ["The thing is, …", "It's not really about … — it's…", "I used to …, but now…", "It sounds silly, but…"]},
  {"heading": "Proving it", "note": "One real moment. If you could film it, it's an example.",
   "phrases": ["Last Sunday, …", "Last time we…, and…", "When I stayed with…, …", "My brother…, and my mum still…"]},
  {"heading": "The 'but'", "note": "A contrast has to turn. 'Also' adds; 'but' swings back the other way.",
   "phrases": ["Mind you, …", "The only problem is…", "The annoying thing is, …", "Although, to be fair, …", "But honestly, that just makes me…"]}
 ]
}

def secs(t): return round(len([w for w in t.split() if re.search(r'[A-Za-z0-9]', w)])/2.5)
bad = 0
for t in D["topics"]:
    for vid, a in t["answers"].items():
        tot = sum(secs(s["t"]) for s in a["segs"])
        shape = "".join(s["m"] for s in a["segs"])
        ms = [s["m"] for s in a["segs"]]
        ok = 15 <= tot <= 20 and "a" in ms and len(ms) < 5 and len(set(ms)) == len(ms)
        if ms[0] == "x" or "x" not in ms: pass
        if "x" in ms and ms[0] != "x": ok = False
        for s in a["segs"]:
            for m in s.get("marks", []):
                if m not in s["t"]: print("MARK MISSING", t["id"], vid, m); ok = False
            if s["m"] != "a" and len(s.get("wrong", [])) < 2: print("NO DISTRACTORS", t["id"], vid, s["m"]); ok = False
        print(f"{'  ' if ok else '!!'} {t['id']:9} {vid:7} {shape:5} {tot}s")
        bad += not ok
json.dump(D, open("/mnt/user-data/outputs/part1-answers.json", "w"), ensure_ascii=False, indent=1)
print("bad:", bad)
