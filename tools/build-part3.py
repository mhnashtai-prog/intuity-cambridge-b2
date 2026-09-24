"""Speaking Part 3 — part3-talk.json (v3).

The school loop, turn after turn:
    Initiate → Express a view → Develop → Throw it to the other candidate
The partner catches it and runs the loop again, for two minutes (Discuss);
then the same loop for one minute, ending in an agreed choice (Decide).

Six tasks, one per Part 4 chapter, so each discussion leads into its Part 4
questions. Three pairs, the same as Part 4. Each turn names the prompt it is
about (0–4), so the page can light it up on the task card.
Run: python3 build-part3.py part3-talk.json
"""
import json, re, sys

V = [
 {"id": "default", "tab": "Default",       "a": "Beatriz", "b": "Tomás", "fem": True,  "bFem": False},
 {"id": "alt1",    "tab": "Alternative 1", "a": "Rodrigo", "b": "Inês",  "fem": False, "bFem": True},
 {"id": "alt2",    "tab": "Alternative 2", "a": "Leonor",  "b": "Diogo", "fem": True,  "bFem": False},
]

BANK = [
 # initiate
 "Shall we start with", "Why don't we begin with", "Let's start with", "What about", "How about", "Let's move on to",
 "Moving on to", "Another idea is", "Right,", "OK,", "Shall we talk about", "Let's think about", "Should we look at",
 "building on that", "to add to that", "following on from that", "That links to", "That connects to", "connects to",
 "I agree", "That's true", "That's a good point", "I see your point", "Absolutely", "Exactly", "Maybe, but", "I'm not so sure",
 "You're right", "Good point",
 # view
 "I think", "In my opinion", "For me,", "I'd say", "I reckon", "I believe", "Personally,", "It seems to me that",
 # develop
 "because", "The thing is", "For example", "For instance", "I mean,", "which means", "so", "especially", "Also,", "On the other hand",
 "That's why", "Plus,", "As well as that",
 # throw
 "What do you think", "Do you agree", "What's your view", "Don't you think", "How about you", "Would you agree", "What do you reckon",
 "What about you", "Wouldn't you say", "Does that make sense",
 # decide
 "So, which one", "I think we should go for", "Shall we go for", "Let's go for", "Shall we agree on", "So we agree", "We both think",
 "In the end", "Let's choose", "then",
]

def spans_of(t):
    out, taken = [], []
    for p in sorted(set(BANK), key=lambda x: (-len(x), x)):
        for m in re.finditer(r'(?<![A-Za-z])' + re.escape(p) + r'(?![A-Za-z])', t):
            i, j = m.start(), m.end()
            if any(a < j and i < b for a, b in taken): continue
            taken.append((i, j)); out.append(p); break
    return out, sorted(taken)

WORD = r'[^\s,.;:!?—\-\'’]+(?:[\s\'’\-]+[^\s,.;:!?—\-\'’]+)*'
def frame_of(t):
    _, spans = spans_of(t); out, k = [], 0
    for i, j in spans + [(len(t), len(t))]:
        gap = t[k:i]
        out.append(re.sub(WORD, '___', gap) if gap.strip(' ,.;:!?—-') else gap)
        out.append(t[i:j]); k = j
    f = re.sub(r'___(?:\s*[,—\-]?\s*___)+', '___', "".join(out))
    return re.sub(r'\s{2,}', ' ', f).strip()

# wrong options for the Quiz: how NOT to catch the partner's turn
W = [("Next one. Buying fewer clothes is good.", "It ignores your partner completely. Catch what they said before you move on."),
     ("Yes.", "One word drops the ball. Respond, then add your own view."),
     ("I don't know about this one.", "It stops the conversation. Even an uncertain view keeps it going."),
     ("I will talk about the next picture now.", "Part 3 isn't a monologue. Link to your partner, then take it forward."),
     ("That's wrong.", "Too blunt, and no reason. Disagree politely — 'I'm not so sure' — and say why."),
     ("As I said before, I already said my opinion.", "It repeats instead of developing. Respond to the new point.")]
_w = [0]
def wrongs():
    i = _w[0]; _w[0] = (i + 2) % len(W)
    return [{"t": W[i][0], "why": W[i][1]}, {"t": W[(i + 1) % len(W)][0], "why": W[(i + 1) % len(W)][1]}]

T = []
def task(id_, tab, q, prompts, decide, alts):
    """alts: three dicts {discuss:[turn…], decide:[turn…]}; turn = (who, prompt, [(move, text)…])."""
    T.append({"id": id_, "tab": tab, "question": q, "prompts": prompts, "decide": decide, "alts": alts})

def D(*turns): return [{"who": w, "p": p, "segs": [{"m": m, "t": t} for m, t in segs]} for w, p, segs in turns]

# ═══════════════════════════ 1 · TECHNOLOGY
task("tech", "Technology",
 "How useful are these for teenagers?",
 ["learning online", "keeping in touch with friends", "finding information", "being creative", "staying healthy"],
 "Which one do you think is the most useful for teenagers?",
 [ {"discuss": D(
    ("a", 0, [("i", "Shall we start with learning online?"), ("v", "I think it's really useful,"),
              ("d", "because you can watch a video again and again until you understand it."), ("t", "What do you think?")]),
    ("b", 0, [("i", "I agree, especially for subjects like Maths."), ("v", "But I think it's easy to get distracted,"),
              ("d", "because there are games and messages on the same screen."), ("t", "What about keeping in touch with friends?")]),
    ("a", 1, [("i", "That's a good point about distractions."), ("v", "For keeping in touch, I think technology is brilliant,"),
              ("d", "because my best friend moved to Lisbon and we still talk every day."), ("t", "Do you agree?")]),
    ("b", 1, [("i", "Absolutely."), ("v", "In my opinion, it's one of the most useful things,"),
              ("d", "especially for families who live on different islands or in other countries."), ("t", "Shall we talk about finding information?")]),
    ("a", 2, [("i", "OK."), ("v", "I think it's useful, but you have to be careful,"),
              ("d", "because not everything online is true."), ("t", "Don't you think?")]),
    ("b", 3, [("i", "You're right."), ("v", "And what about being creative? For me, that's the most exciting one,"),
              ("d", "because you can make music or films on your phone without spending any money."), ("t", "Would you agree?")]),
    ("a", 4, [("i", "Definitely."), ("v", "I'm not so sure about staying healthy, though."),
              ("d", "Fitness apps are good, but most people download them and forget about them after a week."), ("t", "What do you think?")])),
   "decide": D(
    ("a", -1, [("i", "So, which one shall we choose?"), ("v", "I think keeping in touch with friends is the most useful,"),
               ("d", "because being close to people is really important at our age."), ("t", "Do you agree?")]),
    ("b", -1, [("i", "I see your point, but"), ("v", "I'd say learning online is more useful in the long term,"),
               ("d", "because it helps you with school and your future."), ("t", "What do you think?")]),
    ("a", -1, [("i", "That's true."), ("v", "Maybe learning online helps more people,"),
               ("d", "because not everyone has friends far away."), ("t", "Shall we go for learning online, then?")]),
    ("b", -1, [("z", "OK, let's go for learning online then. We both think it's the most useful for teenagers.")]))},
  {"discuss": D(
    ("a", 2, [("i", "Why don't we begin with finding information?"), ("v", "For me, that's the most obvious one,"),
              ("d", "because we use the internet for everything, from homework to checking the bus times."), ("t", "What's your view?")]),
    ("b", 2, [("i", "I agree it's useful."), ("v", "But I'd say the problem is fake news."),
              ("d", "The thing is, a lot of people share things without checking them."), ("t", "How about learning online?")]),
    ("a", 0, [("i", "Good point."), ("v", "I'd say learning online is great for extra practice,"),
              ("d", "for example, I learnt a lot of English from YouTube videos."), ("t", "Don't you think?")]),
    ("b", 0, [("i", "That's true for languages."), ("v", "For me, though, nothing replaces a real teacher,"),
              ("d", "I mean, you can ask questions immediately and they explain it in a different way."), ("t", "What about being creative?")]),
    ("a", 3, [("i", "OK, being creative."), ("v", "I reckon that's where technology is really amazing,"),
              ("d", "because anyone can start a channel or make music in their bedroom."), ("t", "How about you?")]),
    ("b", 4, [("i", "Exactly."), ("v", "And for staying healthy, I'd say it depends on the person,"),
              ("d", "because some people love tracking their steps, but others find it stressful."), ("t", "What's your view?")]),
    ("a", 1, [("i", "I agree."), ("v", "Let's think about keeping in touch too. For me, that's the one we use most,"),
              ("d", "because we're on our group chats all day."), ("t", "Wouldn't you say?")])),
   "decide": D(
    ("b", -1, [("i", "So, which one is the most useful?"), ("v", "For me, it's finding information,"),
               ("d", "because we need it for school, for our hobbies, for everything."), ("t", "How about you?")]),
    ("a", -1, [("i", "That's a good point."), ("v", "I'd say keeping in touch is more important for teenagers, though,"),
               ("d", "because feeling lonely is a big problem at our age."), ("t", "What's your view?")]),
    ("b", -1, [("i", "I see what you mean."), ("v", "But I think we can keep in touch in other ways too,"),
               ("d", "like meeting up after school."), ("t", "Shall we agree on finding information?")]),
    ("a", -1, [("z", "OK, let's choose finding information. In the end, it helps teenagers with almost everything.")]))},
  {"discuss": D(
    ("a", 3, [("i", "Let's start with being creative."), ("v", "In my opinion, it's the best thing about technology,"),
              ("d", "because you can edit photos, make films or write music without expensive equipment."), ("t", "Would you agree?")]),
    ("b", 3, [("i", "Absolutely."), ("v", "I think it's especially good for shy people,"),
              ("d", "because they can show their talent without standing on a stage."), ("t", "What about staying healthy?")]),
    ("a", 4, [("i", "Maybe, but"), ("v", "I'm not so sure that technology helps us stay healthy."),
              ("d", "The thing is, we spend so much time sitting and looking at screens."), ("t", "What do you reckon?")]),
    ("b", 4, [("i", "That's true."), ("v", "But I'd say some apps really help,"),
              ("d", "for example, my mum uses one to remind her to drink water and go for a walk."), ("t", "Should we look at learning online?")]),
    ("a", 0, [("i", "OK."), ("v", "I believe learning online is useful for students who live far away,"),
              ("d", "especially in villages where there aren't many teachers or courses."), ("t", "Don't you think?")]),
    ("b", 1, [("i", "Exactly."), ("v", "And keeping in touch is similar — for people who live far from their friends, it's essential,"),
              ("d", "like my cousins in Venezuela."), ("t", "What do you reckon?")]),
    ("a", 2, [("i", "I agree."), ("v", "Another idea is finding information. I think it's useful,"),
              ("d", "but it's also why we don't remember things any more — we just search for them."), ("t", "Would you agree?")])),
   "decide": D(
    ("a", -1, [("i", "So, which one shall we choose?"), ("v", "I'd say being creative,"),
               ("d", "because it's the one that really makes technology fun and personal."), ("t", "What do you reckon?")]),
    ("b", -1, [("i", "I like that idea, but"), ("v", "I think keeping in touch helps more teenagers,"),
               ("d", "because everyone has friends and family, but not everyone is creative."), ("t", "Would you agree?")]),
    ("a", -1, [("i", "That's a fair point."), ("v", "Maybe you're right,"),
               ("d", "because feeling connected affects how happy you are."), ("t", "Shall we go for keeping in touch?")]),
    ("b", -1, [("z", "Yes, let's go for keeping in touch with friends then. So we agree it's the most useful for teenagers.")]))} ])

# ═══════════════════════════ 2 · SCHOOL & LEARNING
task("school", "School & learning",
 "How helpful might these be when preparing for exams?",
 ["studying with friends", "getting a tutor", "using apps and videos", "making a study timetable", "getting enough sleep"],
 "Which one do you think would be the most helpful?",
 [ {"discuss": D(
    ("a", 0, [("i", "Shall we start with studying with friends?"), ("v", "I think it can be really helpful,"),
              ("d", "because friends can explain things in a simpler way than teachers."), ("t", "What do you think?")]),
    ("b", 0, [("i", "I agree, but only with the right friends."), ("v", "In my opinion, some people just chat the whole time,"),
              ("d", "so nobody actually studies."), ("t", "What about getting a tutor?")]),
    ("a", 1, [("i", "That's true."), ("v", "I think a tutor is great if you're really struggling,"),
              ("d", "because they focus only on you and your problems."), ("t", "Do you agree?")]),
    ("b", 1, [("i", "Yes, but"), ("v", "I'd say it's quite expensive,"),
              ("d", "so not every family can pay for one, especially before exams when everyone wants one."), ("t", "Shall we talk about apps and videos?")]),
    ("a", 2, [("i", "OK."), ("v", "For me, they're really useful for revising,"),
              ("d", "for example, there are apps that turn your notes into quizzes."), ("t", "What do you think?")]),
    ("b", 3, [("i", "Good point."), ("v", "What about making a study timetable? I think it's the most boring one, but maybe the most important,"),
              ("d", "because it stops you leaving everything to the last week."), ("t", "Don't you think?")]),
    ("a", 4, [("i", "Absolutely."), ("v", "And getting enough sleep — I think people forget about that,"),
              ("d", "because they stay up late studying, and then they can't remember anything in the exam."), ("t", "Do you agree?")])),
   "decide": D(
    ("a", -1, [("i", "So, which one would be the most helpful?"), ("v", "I think making a timetable,"),
               ("d", "because if you plan well, you have time for everything else too."), ("t", "What do you think?")]),
    ("b", -1, [("i", "That's a good point."), ("v", "I'd say sleep is more important,"),
               ("d", "because even if you study a lot, you can't do well if you're exhausted."), ("t", "Do you agree?")]),
    ("a", -1, [("i", "I see your point."), ("v", "But a timetable can include sleep,"),
               ("d", "so it solves both problems."), ("t", "Shall we go for the timetable?")]),
    ("b", -1, [("z", "OK, you've convinced me. Let's go for making a study timetable then.")]))},
  {"discuss": D(
    ("a", 2, [("i", "Why don't we begin with apps and videos?"), ("v", "For me, they're the most fun way to revise,"),
              ("d", "because a good video explains in five minutes what took a whole lesson."), ("t", "What's your view?")]),
    ("b", 2, [("i", "I agree they're fun."), ("v", "But I'd say you can't learn everything from videos,"),
              ("d", "I mean, you also need to practise writing answers yourself."), ("t", "How about studying with friends?")]),
    ("a", 0, [("i", "OK."), ("v", "I reckon it works well for some subjects,"),
              ("d", "for example, testing each other on vocabulary is much better than doing it alone."), ("t", "Don't you think?")]),
    ("b", 0, [("i", "That's true."), ("v", "For me, though, I need silence to concentrate,"),
              ("d", "so I prefer to study alone and then meet friends to check."), ("t", "What about getting a tutor?")]),
    ("a", 1, [("i", "Good point."), ("v", "I'd say a tutor is helpful, but maybe not necessary for everyone,"),
              ("d", "because good teachers at school already give lots of help."), ("t", "How about you?")]),
    ("b", 3, [("i", "I agree."), ("v", "Moving on to a study timetable, I think it helps you feel less stressed,"),
              ("d", "because you can see that you have enough time."), ("t", "What's your view?")]),
    ("a", 4, [("i", "Exactly."), ("v", "And sleep is similar. I'd say it's the one everyone ignores,"),
              ("d", "because we think studying all night shows we're working hard."), ("t", "Wouldn't you say?")])),
   "decide": D(
    ("b", -1, [("i", "So, which one shall we choose?"), ("v", "For me, it's studying with friends,"),
               ("d", "because it makes revision less lonely and more motivating."), ("t", "How about you?")]),
    ("a", -1, [("i", "I'm not so sure."), ("v", "I'd say sleep is the most helpful,"),
               ("d", "because it affects everything — your memory, your mood, your concentration."), ("t", "What's your view?")]),
    ("b", -1, [("i", "That's true."), ("v", "I think you're right,"),
               ("d", "because it's the only one that helps in every subject."), ("t", "Shall we agree on sleep?")]),
    ("a", -1, [("z", "Yes, let's choose getting enough sleep. In the end, it helps everything else work.")]))},
  {"discuss": D(
    ("a", 3, [("i", "Let's start with making a study timetable."), ("v", "In my opinion, it's really helpful,"),
              ("d", "because it breaks a huge amount of work into small pieces."), ("t", "Would you agree?")]),
    ("b", 3, [("i", "Absolutely."), ("v", "I think it's especially good for people who panic before exams,"),
              ("d", "because they can see exactly what to do each day."), ("t", "What about getting enough sleep?")]),
    ("a", 4, [("i", "That's important too."), ("v", "I believe teenagers need more sleep than adults,"),
              ("d", "but most of us go to bed really late, especially with our phones."), ("t", "What do you reckon?")]),
    ("b", 4, [("i", "You're right."), ("v", "I'd say phones are the real problem,"),
              ("d", "because we tell ourselves 'five more minutes' and then it's midnight."), ("t", "Should we look at getting a tutor?")]),
    ("a", 1, [("i", "OK."), ("v", "I think a tutor can be very helpful,"),
              ("d", "for example, my cousin had one for Physics and her marks went up a lot."), ("t", "Don't you think?")]),
    ("b", 2, [("i", "Maybe, but"), ("v", "I think apps and videos can do a similar job for free,"),
              ("d", "which means everyone can use them, not just families with money."), ("t", "Would you agree?")]),
    ("a", 0, [("i", "That's a good point."), ("v", "Another idea is studying with friends. I'd say it's good for motivation,"),
              ("d", "because it's harder to give up when your friends are working."), ("t", "What do you reckon?")])),
   "decide": D(
    ("a", -1, [("i", "So, which one would be the most helpful?"), ("v", "I'd say using apps and videos,"),
               ("d", "because they're free and you can use them anywhere."), ("t", "What do you reckon?")]),
    ("b", -1, [("i", "That's true, but"), ("v", "I think a timetable is more helpful,"),
               ("d", "because without a plan, you just watch videos and don't organise anything."), ("t", "Would you agree?")]),
    ("a", -1, [("i", "Hmm, good point."), ("v", "You can't use the apps well without a plan,"),
               ("d", "so the timetable comes first."), ("t", "Shall we agree on the timetable?")]),
    ("b", -1, [("z", "Yes, let's go for making a study timetable then. We both think it helps the most.")]))} ])

# ═══════════════════════════ 3 · WORK & MONEY
task("money", "Work & money",
 "How good are these ideas for teenagers who want to earn money?",
 ["working in a café", "babysitting", "selling things online", "helping in a family business", "giving lessons to younger children"],
 "Which one would be the best way for a teenager to earn money?",
 [ {"discuss": D(
    ("a", 0, [("i", "Shall we start with working in a café?"), ("v", "I think it's a good idea in the summer,"),
              ("d", "because there are lots of tourists and cafés need extra help."), ("t", "What do you think?")]),
    ("b", 0, [("i", "I agree."), ("v", "But in my opinion, it's quite hard work,"),
              ("d", "because you're standing all day and some customers can be rude."), ("t", "What about babysitting?")]),
    ("a", 1, [("i", "That's true."), ("v", "I think babysitting is easier and you can do it in the evening,"),
              ("d", "so it doesn't affect school."), ("t", "Do you agree?")]),
    ("b", 1, [("i", "Yes, but"), ("v", "I'd say it's a big responsibility,"),
              ("d", "because if something happens to the child, it's your fault."), ("t", "Shall we talk about selling things online?")]),
    ("a", 2, [("i", "OK."), ("v", "For me, that's a really modern idea,"),
              ("d", "for example, some people sell their old clothes or things they make, like jewellery."), ("t", "What do you think?")]),
    ("b", 3, [("i", "Good point."), ("v", "What about helping in a family business? I think it's the safest option,"),
              ("d", "because you work with people who know you and trust you."), ("t", "Don't you think?")]),
    ("a", 4, [("i", "Absolutely."), ("v", "And giving lessons to younger children is a great idea too,"),
              ("d", "because you practise what you know and help someone at the same time."), ("t", "Do you agree?")])),
   "decide": D(
    ("a", -1, [("i", "So, which one is the best way?"), ("v", "I think giving lessons,"),
               ("d", "because it's safe, it pays well and it's good for your own learning."), ("t", "What do you think?")]),
    ("b", -1, [("i", "That's a good point."), ("v", "I'd say working in a café teaches you more about real work,"),
               ("d", "because you deal with customers and a boss."), ("t", "Do you agree?")]),
    ("a", -1, [("i", "I see your point."), ("v", "But lessons fit better with school,"),
               ("d", "because you can choose your hours."), ("t", "Shall we go for giving lessons?")]),
    ("b", -1, [("z", "OK, let's go for giving lessons to younger children then. It's the best balance.")]))},
  {"discuss": D(
    ("a", 2, [("i", "Why don't we begin with selling things online?"), ("v", "For me, it's the easiest to start,"),
              ("d", "because you just need a phone and some things you don't use any more."), ("t", "What's your view?")]),
    ("b", 2, [("i", "I agree it's easy."), ("v", "But I'd say you have to be careful,"),
              ("d", "because there are a lot of scams online, and teenagers are easy targets."), ("t", "How about babysitting?")]),
    ("a", 1, [("i", "Good point."), ("v", "I'd say babysitting is great for people who like children,"),
              ("d", "I mean, you get paid for playing games and watching films!"), ("t", "Don't you think?")]),
    ("b", 1, [("i", "Maybe, but"), ("v", "for me, it's harder than it looks,"),
              ("d", "because little kids can be exhausting, especially at bedtime."), ("t", "What about a family business?")]),
    ("a", 3, [("i", "OK."), ("v", "I reckon helping in a family business is a good start,"),
              ("d", "for example, my uncle has a restaurant, and I help there in August."), ("t", "How about you?")]),
    ("b", 0, [("i", "That sounds good."), ("v", "Moving on to working in a café, I think it's useful experience,"),
              ("d", "because you learn to be quick and organised."), ("t", "What's your view?")]),
    ("a", 4, [("i", "Exactly."), ("v", "And giving lessons — I'd say that's the most grown-up one,"),
              ("d", "because parents trust you with their child's education."), ("t", "Wouldn't you say?")])),
   "decide": D(
    ("b", -1, [("i", "So, which one shall we choose?"), ("v", "For me, it's helping in a family business,"),
               ("d", "because it's safe and you learn a lot."), ("t", "How about you?")]),
    ("a", -1, [("i", "I see your point, but"), ("v", "I'd say not everyone's family has a business,"),
               ("d", "so it's not possible for most teenagers."), ("t", "What's your view?")]),
    ("b", -1, [("i", "That's true."), ("v", "Then maybe working in a café, because anyone can apply,"),
               ("d", "especially in summer."), ("t", "Shall we agree on the café?")]),
    ("a", -1, [("z", "Yes, let's choose working in a café then. It's the one most teenagers can actually do.")]))},
  {"discuss": D(
    ("a", 4, [("i", "Let's start with giving lessons to younger children."), ("v", "In my opinion, it's a brilliant idea,"),
              ("d", "because older students often explain things in a way children understand."), ("t", "Would you agree?")]),
    ("b", 4, [("i", "Absolutely."), ("v", "I think it also helps you,"),
              ("d", "because teaching something is the best way to really learn it."), ("t", "What about selling things online?")]),
    ("a", 2, [("i", "OK."), ("v", "I believe it's good, but it's not a regular income,"),
              ("d", "because some weeks you sell nothing at all."), ("t", "What do you reckon?")]),
    ("b", 2, [("i", "That's true."), ("v", "But I'd say it teaches you about business,"),
              ("d", "like how to take good photos and set the right price."), ("t", "Should we look at working in a café?")]),
    ("a", 0, [("i", "Good idea."), ("v", "I think it's hard work,"),
              ("d", "but it's great for your confidence, especially if you have to speak English with tourists."), ("t", "Don't you think?")]),
    ("b", 1, [("i", "Exactly."), ("v", "And babysitting also builds confidence,"),
              ("d", "because you have to make decisions on your own."), ("t", "Would you agree?")]),
    ("a", 3, [("i", "I agree."), ("v", "Another idea is a family business. I'd say it's comfortable,"),
              ("d", "but maybe you don't learn as much, because your family is less strict with you."), ("t", "What do you reckon?")])),
   "decide": D(
    ("a", -1, [("i", "So, which one is the best?"), ("v", "I'd say working in a café,"),
               ("d", "because you learn real skills and practise your English."), ("t", "What do you reckon?")]),
    ("b", -1, [("i", "That's a good point."), ("v", "But I think giving lessons is better,"),
               ("d", "because the hours are flexible and it's less tiring."), ("t", "Would you agree?")]),
    ("a", -1, [("i", "Hmm, I'm not so sure."), ("v", "Both are good,"),
               ("d", "but the café teaches you more about real work."), ("t", "Shall we go for the café?")]),
    ("b", -1, [("z", "OK, you win — let's go for working in a café then.")]))} ])

# ═══════════════════════════ 4 · HEALTH & SPORT
task("health", "Health & sport",
 "How effective would these ideas be in helping students to be healthier?",
 ["healthier school meals", "more PE lessons", "an after-school sports club", "lessons about mental health", "banning fizzy drinks"],
 "Which one should schools do first?",
 [ {"discuss": D(
    ("a", 0, [("i", "Shall we start with healthier school meals?"), ("v", "I think they would be really effective,"),
              ("d", "because a lot of students eat lunch at school every day."), ("t", "What do you think?")]),
    ("b", 0, [("i", "I agree, but"), ("v", "in my opinion, the food also has to taste good,"),
              ("d", "or students just go to the café across the road."), ("t", "What about more PE lessons?")]),
    ("a", 1, [("i", "That's true."), ("v", "I think more PE would help,"),
              ("d", "because some students don't do any other exercise at all."), ("t", "Do you agree?")]),
    ("b", 1, [("i", "Yes, but"), ("v", "I'd say the timetable is already very full,"),
              ("d", "so it would be hard to add more lessons."), ("t", "Shall we talk about a sports club?")]),
    ("a", 2, [("i", "OK."), ("v", "For me, an after-school club is a great idea,"),
              ("d", "because students can choose a sport they actually enjoy."), ("t", "What do you think?")]),
    ("b", 3, [("i", "Good point."), ("v", "What about lessons about mental health? I think they're really important,"),
              ("d", "because stress and anxiety are big problems for teenagers now."), ("t", "Don't you think?")]),
    ("a", 4, [("i", "Absolutely."), ("v", "And banning fizzy drinks — I'm not so sure it would work,"),
              ("d", "because students would just buy them outside school."), ("t", "Do you agree?")])),
   "decide": D(
    ("a", -1, [("i", "So, which one should schools do first?"), ("v", "I think healthier meals,"),
               ("d", "because it affects every student, every day."), ("t", "What do you think?")]),
    ("b", -1, [("i", "That's a good point."), ("v", "I'd say mental health lessons are more urgent,"),
               ("d", "because a lot of students are really stressed."), ("t", "Do you agree?")]),
    ("a", -1, [("i", "I see your point."), ("v", "Maybe you're right,"),
               ("d", "because you can't be healthy if your mind isn't well."), ("t", "Shall we go for mental health lessons?")]),
    ("b", -1, [("z", "Yes, let's go for lessons about mental health then. We both think it's the most urgent.")]))},
  {"discuss": D(
    ("a", 2, [("i", "Why don't we begin with an after-school sports club?"), ("v", "For me, it's the most effective idea,"),
              ("d", "because it's fun, and people stay healthy when they enjoy something."), ("t", "What's your view?")]),
    ("b", 2, [("i", "I agree it's fun."), ("v", "But I'd say only the sporty students would go,"),
              ("d", "I mean, the people who really need exercise would probably stay at home."), ("t", "How about more PE lessons?")]),
    ("a", 1, [("i", "Good point."), ("v", "I'd say more PE is fairer,"),
              ("d", "because everyone has to do it, not just the students who like sport."), ("t", "Don't you think?")]),
    ("b", 1, [("i", "Maybe, but"), ("v", "for me, the problem is how PE is taught,"),
              ("d", "because if it's always competitive, the less sporty students hate it."), ("t", "What about fizzy drinks?")]),
    ("a", 4, [("i", "OK."), ("v", "I reckon banning them would help a bit,"),
              ("d", "for example, at my school the machine is always empty by lunchtime."), ("t", "How about you?")]),
    ("b", 0, [("i", "That's true."), ("v", "Moving on to school meals, I think they're the key,"),
              ("d", "because a good lunch gives you energy for the afternoon."), ("t", "What's your view?")]),
    ("a", 3, [("i", "Exactly."), ("v", "And lessons about mental health — I'd say they're just as important as food and sport,"),
              ("d", "because being healthy isn't only about your body."), ("t", "Wouldn't you say?")])),
   "decide": D(
    ("b", -1, [("i", "So, which one shall we choose?"), ("v", "For me, it's healthier school meals,"),
               ("d", "because every student eats, but not every student does sport."), ("t", "How about you?")]),
    ("a", -1, [("i", "That's a good point."), ("v", "I'd say the sports club is better, though,"),
               ("d", "because it makes exercise something you want to do."), ("t", "What's your view?")]),
    ("b", -1, [("i", "I see what you mean."), ("v", "But meals help everyone, even people who hate sport,"),
               ("d", "so they reach more students."), ("t", "Shall we agree on meals?")]),
    ("a", -1, [("z", "OK, let's choose healthier school meals then. In the end, they reach every student.")]))},
  {"discuss": D(
    ("a", 3, [("i", "Let's start with lessons about mental health."), ("v", "In my opinion, they're really needed,"),
              ("d", "because a lot of teenagers don't know how to deal with stress."), ("t", "Would you agree?")]),
    ("b", 3, [("i", "Absolutely."), ("v", "I think talking about it openly helps,"),
              ("d", "because people realise they're not the only ones who feel that way."), ("t", "What about banning fizzy drinks?")]),
    ("a", 4, [("i", "Maybe, but"), ("v", "I'm not so sure that banning things works."),
              ("d", "The thing is, when you ban something, teenagers want it even more!"), ("t", "What do you reckon?")]),
    ("b", 4, [("i", "That's true."), ("v", "I'd say it's better to explain why they're bad,"),
              ("d", "like how much sugar is in one can."), ("t", "Should we look at school meals?")]),
    ("a", 0, [("i", "OK."), ("v", "I believe healthier meals would make a big difference,"),
              ("d", "especially for students who don't eat well at home."), ("t", "Don't you think?")]),
    ("b", 1, [("i", "Exactly."), ("v", "And more PE lessons would help too,"),
              ("d", "because we sit down for most of the school day."), ("t", "Would you agree?")]),
    ("a", 2, [("i", "I agree."), ("v", "Another idea is an after-school club. I'd say it's good for making friends too,"),
              ("d", "which is also part of being healthy."), ("t", "What do you reckon?")])),
   "decide": D(
    ("a", -1, [("i", "So, which one should schools do first?"), ("v", "I'd say more PE lessons,"),
               ("d", "because moving more is the simplest way to be healthier."), ("t", "What do you reckon?")]),
    ("b", -1, [("i", "That's true, but"), ("v", "I think mental health lessons are more important right now,"),
               ("d", "because stress affects our sleep, our food, everything."), ("t", "Would you agree?")]),
    ("a", -1, [("i", "Good point."), ("v", "Stress affects everything else,"),
               ("d", "so it makes sense to start there."), ("t", "Shall we agree on mental health lessons?")]),
    ("b", -1, [("z", "Yes, let's go for lessons about mental health then. So we agree schools should start there.")]))} ])

# ═══════════════════════════ 5 · ENVIRONMENT & FUTURE
task("future", "Environment & future",
 "How much difference can young people make by doing these things?",
 ["recycling at home", "using public transport", "buying fewer clothes", "joining a beach clean-up", "eating less meat"],
 "Which one would make the biggest difference?",
 [ {"discuss": D(
    ("a", 0, [("i", "Shall we start with recycling at home?"), ("v", "I think it makes a difference,"),
              ("d", "because if every family recycles, it adds up to a lot less rubbish."), ("t", "What do you think?")]),
    ("b", 0, [("i", "I agree."), ("v", "In my opinion, it's also easy,"),
              ("d", "because you just need different bins in the kitchen."), ("t", "What about public transport?")]),
    ("a", 1, [("i", "That's true."), ("v", "I think using the bus is great for the environment,"),
              ("d", "because one bus takes dozens of cars off the road."), ("t", "Do you agree?")]),
    ("b", 1, [("i", "Yes, but"), ("v", "I'd say the buses need to be better first,"),
              ("d", "because people won't use them if they're always late."), ("t", "Shall we talk about buying fewer clothes?")]),
    ("a", 2, [("i", "OK."), ("v", "For me, that's a really important one,"),
              ("d", "because fast fashion creates a huge amount of waste."), ("t", "What do you think?")]),
    ("b", 3, [("i", "Good point."), ("v", "What about a beach clean-up? I think it's the most visible,"),
              ("d", "because you can actually see the difference the same day."), ("t", "Don't you think?")]),
    ("a", 4, [("i", "Absolutely."), ("v", "And eating less meat — I think it's a big one, but hard,"),
              ("d", "especially here, where espetada is part of every celebration!"), ("t", "Do you agree?")])),
   "decide": D(
    ("a", -1, [("i", "So, which one would make the biggest difference?"), ("v", "I think public transport,"),
               ("d", "because cars produce so much pollution."), ("t", "What do you think?")]),
    ("b", -1, [("i", "That's a good point."), ("v", "But teenagers don't drive yet,"),
               ("d", "so I'd say buying fewer clothes is something we can really control."), ("t", "Do you agree?")]),
    ("a", -1, [("i", "I see your point."), ("v", "You're right, we can decide that ourselves,"),
               ("d", "and it influences our friends too."), ("t", "Shall we go for buying fewer clothes?")]),
    ("b", -1, [("z", "OK, let's go for buying fewer clothes then. We both think it's the one we can really change.")]))},
  {"discuss": D(
    ("a", 3, [("i", "Why don't we begin with a beach clean-up?"), ("v", "For me, it's really satisfying,"),
              ("d", "because on an island you see how much plastic comes in from the sea."), ("t", "What's your view?")]),
    ("b", 3, [("i", "I agree it's satisfying."), ("v", "But I'd say it doesn't solve the real problem,"),
              ("d", "I mean, the plastic keeps coming back the next week."), ("t", "How about recycling?")]),
    ("a", 0, [("i", "Good point."), ("v", "I'd say recycling is more about the long term,"),
              ("d", "because it stops the rubbish before it reaches the sea."), ("t", "Don't you think?")]),
    ("b", 0, [("i", "Maybe, but"), ("v", "for me, the problem is that not everyone does it properly,"),
              ("d", "so a lot of it ends up in the wrong place anyway."), ("t", "What about eating less meat?")]),
    ("a", 4, [("i", "OK."), ("v", "I reckon it could make a big difference,"),
              ("d", "for example, producing beef uses a lot of water and land."), ("t", "How about you?")]),
    ("b", 1, [("i", "That's true."), ("v", "Moving on to public transport, I think it's great in Funchal,"),
              ("d", "but in the villages there are hardly any buses."), ("t", "What's your view?")]),
    ("a", 2, [("i", "Exactly."), ("v", "And buying fewer clothes — I'd say it's the easiest to start,"),
              ("d", "because you just don't buy something you don't need."), ("t", "Wouldn't you say?")])),
   "decide": D(
    ("b", -1, [("i", "So, which one shall we choose?"), ("v", "For me, it's recycling at home,"),
               ("d", "because every family can do it, every day."), ("t", "How about you?")]),
    ("a", -1, [("i", "I see your point, but"), ("v", "I'd say eating less meat makes a bigger difference,"),
               ("d", "because farming produces so much pollution."), ("t", "What's your view?")]),
    ("b", -1, [("i", "That's true."), ("v", "But it's much harder to convince people to change their food,"),
               ("d", "so recycling is more realistic."), ("t", "Shall we agree on recycling?")]),
    ("a", -1, [("z", "OK, let's choose recycling at home then. In the end, it's the one everyone can actually do.")]))},
  {"discuss": D(
    ("a", 2, [("i", "Let's start with buying fewer clothes."), ("v", "In my opinion, it's a really powerful idea,"),
              ("d", "because teenagers buy a lot of clothes, especially cheap ones."), ("t", "Would you agree?")]),
    ("b", 2, [("i", "Absolutely."), ("v", "I think swapping clothes with friends is a good solution,"),
              ("d", "because you get something new without buying anything."), ("t", "What about eating less meat?")]),
    ("a", 4, [("i", "Maybe, but"), ("v", "I'm not so sure teenagers can decide that."),
              ("d", "The thing is, our parents buy the food and cook the meals."), ("t", "What do you reckon?")]),
    ("b", 4, [("i", "That's true."), ("v", "But I'd say we can still choose,"),
              ("d", "for example, ordering a vegetarian option at school."), ("t", "Should we look at the beach clean-up?")]),
    ("a", 3, [("i", "OK."), ("v", "I believe it's good because it raises awareness,"),
              ("d", "especially when people post photos of all the rubbish they found."), ("t", "Don't you think?")]),
    ("b", 1, [("i", "Exactly."), ("v", "And public transport also makes a difference,"),
              ("d", "because if young people get used to it, they'll keep using it as adults."), ("t", "Would you agree?")]),
    ("a", 0, [("i", "I agree."), ("v", "Another idea is recycling. I'd say it's the most basic one,"),
              ("d", "but it only works if everyone does it, including shops and restaurants."), ("t", "What do you reckon?")])),
   "decide": D(
    ("a", -1, [("i", "So, which one would make the biggest difference?"), ("v", "I'd say using public transport,"),
               ("d", "because it builds a habit for life."), ("t", "What do you reckon?")]),
    ("b", -1, [("i", "That's a good point."), ("v", "I think buying fewer clothes is just as important,"),
               ("d", "because the fashion industry pollutes so much."), ("t", "Would you agree?")]),
    ("a", -1, [("i", "Hmm."), ("v", "Both are good, but transport affects the air we breathe every day,"),
               ("d", "so it makes a bigger difference."), ("t", "Shall we go for public transport?")]),
    ("b", -1, [("z", "Yes, let's go for using public transport then. So we agree it's the biggest difference.")]))} ])

# ═══════════════════════════ 6 · PEOPLE & SOCIETY
task("people", "People & society",
 "How enjoyable are these ways for teenagers to spend time with their families?",
 ["eating meals together", "going on holiday", "playing games at home", "doing sport together", "visiting grandparents"],
 "Which one would bring a family closer together?",
 [ {"discuss": D(
    ("a", 0, [("i", "Shall we start with eating meals together?"), ("v", "I think it's really enjoyable,"),
              ("d", "because it's the only time when the whole family is in the same room."), ("t", "What do you think?")]),
    ("b", 0, [("i", "I agree, but only without phones."), ("v", "In my opinion, if everyone is looking at a screen,"),
              ("d", "it's not really spending time together."), ("t", "What about going on holiday?")]),
    ("a", 1, [("i", "That's true."), ("v", "I think holidays are the most fun,"),
              ("d", "because everyone is relaxed and there's no school or work."), ("t", "Do you agree?")]),
    ("b", 1, [("i", "Yes, but"), ("v", "I'd say they can also be stressful,"),
              ("d", "because families spend twenty-four hours together and start arguing!"), ("t", "Shall we talk about playing games?")]),
    ("a", 2, [("i", "OK."), ("v", "For me, board games are great fun,"),
              ("d", "because even my grandparents can play, and everyone laughs a lot."), ("t", "What do you think?")]),
    ("b", 3, [("i", "Good point."), ("v", "What about doing sport together? I think it's a good idea,"),
              ("d", "because it's healthy and you share something active."), ("t", "Don't you think?")]),
    ("a", 4, [("i", "Absolutely."), ("v", "And visiting grandparents — I think teenagers sometimes find it boring,"),
              ("d", "but they always enjoy it more than they expected."), ("t", "Do you agree?")])),
   "decide": D(
    ("a", -1, [("i", "So, which one would bring a family closer?"), ("v", "I think eating meals together,"),
               ("d", "because it happens every day, not just once a year."), ("t", "What do you think?")]),
    ("b", -1, [("i", "That's a good point."), ("v", "I'd say holidays create stronger memories,"),
               ("d", "because you do new things together."), ("t", "Do you agree?")]),
    ("a", -1, [("i", "I see your point."), ("v", "But being close is about small moments every day,"),
               ("d", "not only big trips."), ("t", "Shall we go for meals together?")]),
    ("b", -1, [("z", "OK, let's go for eating meals together then. We both think the everyday moments matter most.")]))},
  {"discuss": D(
    ("a", 3, [("i", "Why don't we begin with doing sport together?"), ("v", "For me, it's the most enjoyable,"),
              ("d", "because my dad and I play padel on Sundays and we always have fun."), ("t", "What's your view?")]),
    ("b", 3, [("i", "That sounds fun."), ("v", "But I'd say not every family likes sport,"),
              ("d", "I mean, my parents would rather sit on the sofa!"), ("t", "How about going on holiday?")]),
    ("a", 1, [("i", "Good point."), ("v", "I'd say holidays are exciting,"),
              ("d", "but they're expensive, so most families only go once a year."), ("t", "Don't you think?")]),
    ("b", 1, [("i", "Maybe, but"), ("v", "for me, even a day trip counts,"),
              ("d", "like driving to Porto Moniz for lunch."), ("t", "What about visiting grandparents?")]),
    ("a", 4, [("i", "OK."), ("v", "I reckon it's really important,"),
              ("d", "because grandparents tell you stories about the family you'd never hear otherwise."), ("t", "How about you?")]),
    ("b", 0, [("i", "That's true."), ("v", "Moving on to meals, I think they're important but not always enjoyable,"),
              ("d", "because that's when parents ask about school!"), ("t", "What's your view?")]),
    ("a", 2, [("i", "Exactly."), ("v", "And games at home — I'd say they're the best for younger brothers and sisters,"),
              ("d", "because everyone can join in, even when they're only five or six."), ("t", "Wouldn't you say?")])),
   "decide": D(
    ("b", -1, [("i", "So, which one shall we choose?"), ("v", "For me, it's visiting grandparents,"),
               ("d", "because it connects three generations."), ("t", "How about you?")]),
    ("a", -1, [("i", "That's a good point."), ("v", "I'd say doing sport together is better,"),
               ("d", "because you work as a team."), ("t", "What's your view?")]),
    ("b", -1, [("i", "I see what you mean."), ("v", "But not every family can do sport,"),
               ("d", "while everyone can visit their grandparents."), ("t", "Shall we agree on grandparents?")]),
    ("a", -1, [("z", "OK, let's choose visiting grandparents then. In the end, it brings the whole family together.")]))},
  {"discuss": D(
    ("a", 2, [("i", "Let's start with playing games at home."), ("v", "In my opinion, it's really enjoyable,"),
              ("d", "because it's cheap and everyone can take part, from the youngest to the oldest."), ("t", "Would you agree?")]),
    ("b", 2, [("i", "Absolutely."), ("v", "I think it's also good because nobody uses their phone,"),
              ("d", "so you really talk to each other."), ("t", "What about eating meals together?")]),
    ("a", 0, [("i", "That's important too."), ("v", "I believe it's the simplest way to stay close,"),
              ("d", "especially when everyone is busy during the day."), ("t", "What do you reckon?")]),
    ("b", 0, [("i", "You're right."), ("v", "But I'd say it's hard in some families,"),
              ("d", "because parents work late or have different hours."), ("t", "Should we look at holidays?")]),
    ("a", 1, [("i", "OK."), ("v", "I think holidays are special because you discover new places together,"),
              ("d", "for example, our trip to Lisbon last year was the best week ever."), ("t", "Don't you think?")]),
    ("b", 4, [("i", "Exactly."), ("v", "And visiting grandparents is similar, but you learn about the past instead,"),
              ("d", "like how Madeira was when they were young."), ("t", "Would you agree?")]),
    ("a", 3, [("i", "I agree."), ("v", "Another idea is doing sport together. I'd say it's fun,"),
              ("d", "but maybe not for everyone in the family, especially older relatives."), ("t", "What do you reckon?")])),
   "decide": D(
    ("a", -1, [("i", "So, which one would bring a family closer?"), ("v", "I'd say going on holiday,"),
               ("d", "because shared adventures stay with you for years."), ("t", "What do you reckon?")]),
    ("b", -1, [("i", "That's true, but"), ("v", "I think playing games at home works better,"),
               ("d", "because you can do it every week, not just once a year."), ("t", "Would you agree?")]),
    ("a", -1, [("i", "Hmm, good point."), ("v", "Doing something often is probably more important,"),
               ("d", "so games at home win."), ("t", "Shall we agree on games at home?")]),
    ("b", -1, [("z", "Yes, let's go for playing games at home then. We both think it brings families closer.")]))} ])

# ── Extra turns: three at the end of each discussion (b, a, b), two before the final
# decision turn. Keys: task id → [Default, Alt 1, Alt 2].
X = {
"tech": [
 {"discuss": [
   ("b", 4, [("i","That's true about the apps."),("v","But I think staying healthy also means sleeping well,"),("d","and phones in bed are really bad for that, because the light keeps you awake."),("t","Do you agree?")]),
   ("a", 0, [("i","Definitely."),("v","That connects to learning online, actually —"),("d","if you study on a screen and then scroll in bed, your eyes never rest."),("t","What do you think?")]),
   ("b", 3, [("i","Good point."),("v","So maybe the answer is balance, like with being creative —"),("d","it's great to make things on your phone, but not every minute of the day."),("t","Don't you think?")])],
  "decide": [
   ("b", -1, [("i","Maybe, but"),("v","keeping in touch is also important,"),("d","especially for people with family abroad."),("t","Can we agree it's second?")]),
   ("a", -1, [("i","Yes, that's fair."),("v","It's a close second,"),("d","but learning online helps more people in more ways."),("t","So, are we decided?")])]},
 {"discuss": [
   ("b", 1, [("i","Exactly."),("v","But I'd say group chats can also cause problems,"),("d","I mean, people fall out over one message that sounded rude."),("t","Has that happened to you?")]),
   ("a", 1, [("i","All the time!"),("v","I think it's because you can't hear the tone of voice,"),("d","so a joke can look really serious on a screen."),("t","What's your view?")]),
   ("b", 2, [("i","You're right."),("v","That's why I'd say finding information and communicating need the same skill —"),("d","thinking before you believe something, or before you send it."),("t","Wouldn't you agree?")])],
  "decide": [
   ("b", -1, [("i","I know,"),("v","but finding information also helps us keep in touch with the world,"),("d","like knowing what's happening in the news."),("t","Does that make sense?")]),
   ("a", -1, [("i","It does."),("v","OK, I think it's the most useful overall,"),("d","because we use it for school and for our lives."),("t","Shall we go for it?")])]},
 {"discuss": [
   ("b", 2, [("i","That's so true."),("v","I think it also makes us lazy,"),("d","because we don't try to work things out any more, we just ask the internet."),("t","What do you reckon?")]),
   ("a", 3, [("i","Maybe."),("v","But that's why I'd say being creative is so important —"),("d","it uses technology to make something new, not just to find answers."),("t","Would you agree?")]),
   ("b", 4, [("i","Absolutely."),("v","And for staying healthy, maybe the best thing is to switch off sometimes,"),("d","like having one evening a week with no screens."),("t","Could you do that?")])],
  "decide": [
   ("b", -1, [("i","I know,"),("v","but creativity is only for some people,"),("d","while everyone needs to feel close to others."),("t","Do you see what I mean?")]),
   ("a", -1, [("i","Yes, I do."),("v","And keeping in touch is what most teenagers use technology for anyway,"),("d","so it matters to more of us."),("t","Shall we go for it?")])]}],
"school": [
 {"discuss": [
   ("b", 4, [("i","Exactly."),("v","I also think sleep and a timetable are connected,"),("d","because if you plan your revision, you don't need to stay up all night."),("t","Do you agree?")]),
   ("a", 0, [("i","That's true."),("v","And studying with friends could be part of the plan,"),("d","like one group session a week to check what you've learnt."),("t","What do you think?")]),
   ("b", 1, [("i","Good idea."),("v","I'd say a tutor only makes sense if the other things don't work,"),("d","because it's expensive and takes up a lot of time."),("t","Don't you think?")])],
  "decide": [
   ("b", -1, [("i","But"),("v","some people make a timetable and then don't follow it,"),("d","so it doesn't help them at all."),("t","What about that?")]),
   ("a", -1, [("i","That's true,"),("v","but it's the same with everything,"),("d","you still need to make the effort."),("t","So do we agree?")])]},
 {"discuss": [
   ("b", 2, [("i","That's so true."),("v","And apps can make it worse,"),("d","because some of them send you notifications at night to keep studying."),("t","Have you seen that?")]),
   ("a", 2, [("i","Yes!"),("v","I'd say you have to turn them off,"),("d","or you end up doing a quiz at midnight instead of sleeping."),("t","How about you?")]),
   ("b", 3, [("i","Same here."),("v","So maybe a timetable is the thing that holds everything together,"),("d","because it tells you when to use the apps and when to stop."),("t","What's your view?")])],
  "decide": [
   ("b", -1, [("i","I know,"),("v","but it's hard to sleep before exams because you're nervous,"),("d","so studying with friends might calm you down."),("t","What do you think?")]),
   ("a", -1, [("i","Maybe,"),("v","but sleep still comes first,"),("d","because tired people get more nervous, not less."),("t","Shall we decide?")])]},
 {"discuss": [
   ("b", 0, [("i","Absolutely."),("v","But you need to choose the right group,"),("d","because if one person is always on their phone, everyone gets distracted."),("t","Do you agree?")]),
   ("a", 1, [("i","Definitely."),("v","I think that's why some people prefer a tutor —"),("d","there's no one else to distract you, and you can't pretend you understand."),("t","What do you reckon?")]),
   ("b", 4, [("i","That's true."),("v","And we still haven't really talked about sleep. I'd say it's the one people give up first,"),("d","especially the night before an exam."),("t","Would you agree?")])],
  "decide": [
   ("b", -1, [("i","I know,"),("v","but apps are useless if you're too tired to think,"),("d","so sleep matters too."),("t","Could we choose that?")]),
   ("a", -1, [("i","Maybe,"),("v","but a good timetable includes sleep,"),("d","so it covers both."),("t","Does that work for you?")])]}],
"money": [
 {"discuss": [
   ("b", 4, [("i","Yes, and"),("v","I think it's good for your CV too,"),("d","because it shows you're responsible and good at explaining things."),("t","What do you think?")]),
   ("a", 2, [("i","That's true."),("v","Selling online can look good on a CV as well,"),("d","because you learn about photos, prices and customers."),("t","Do you agree?")]),
   ("b", 2, [("i","Maybe,"),("v","but I'd say it's riskier,"),("d","because sometimes people don't pay, or say the thing arrived broken."),("t","Don't you think?")])],
  "decide": [
   ("b", -1, [("i","That's true,"),("v","but not everyone is good at teaching,"),("d","so it's not for every teenager."),("t","What about that?")]),
   ("a", -1, [("i","Fair point."),("v","But it's the one that helps both people,"),("d","the child and the teenager."),("t","So are we agreed?")])]},
 {"discuss": [
   ("b", 3, [("i","That's lucky."),("v","But I'd say working for family can be hard too,"),("d","because it's difficult to say no when they need help."),("t","Don't you think?")]),
   ("a", 1, [("i","True."),("v","I think babysitting has the same problem,"),("d","because neighbours often expect you to help for free."),("t","Has that happened to you?")]),
   ("b", 0, [("i","Yes, actually!"),("v","That's why I'd say a café is clearer,"),("d","because you have a contract and a fixed salary."),("t","What's your view?")])],
  "decide": [
   ("b", -1, [("i","OK, but"),("v","café jobs are mostly in summer,"),("d","so what about the rest of the year?"),("t","Is that a problem?")]),
   ("a", -1, [("i","Not really."),("v","School comes first during the year anyway,"),("d","so a summer job is perfect."),("t","Shall we decide?")])]},
 {"discuss": [
   ("b", 3, [("i","That's true."),("v","But it's also less stressful,"),("d","especially for a first job, when you don't know what to do."),("t","Do you agree?")]),
   ("a", 4, [("i","Yes."),("v","And giving lessons is similar, because you're in a safe place,"),("d","usually at the child's house or online."),("t","What do you reckon?")]),
   ("b", 0, [("i","Exactly."),("v","So I'd say it depends on what you want —"),("d","safety and flexibility, or real experience like in a café."),("t","Which matters more to you?")])],
  "decide": [
   ("b", -1, [("i","That's true,"),("v","but cafés can be really busy in summer,"),("d","and some teenagers get very tired."),("t","Is that worth it?")]),
   ("a", -1, [("i","I think so,"),("v","because that's what real jobs are like,"),("d","and it's good to learn it young."),("t","Do you agree?")])]}],
"health": [
 {"discuss": [
   ("b", 4, [("i","That's true."),("v","But I'd say explaining why sugar is bad could be part of health lessons,"),("d","so they're connected."),("t","What do you think?")]),
   ("a", 3, [("i","Good idea."),("v","And mental health lessons could include things like sleep and food too,"),("d","because it's all linked."),("t","Do you agree?")]),
   ("b", 2, [("i","Absolutely."),("v","I also think a sports club helps mental health,"),("d","because exercise is great for stress."),("t","Don't you think?")])],
  "decide": [
   ("b", -1, [("i","And"),("v","if students feel better, they might eat and sleep better too,"),("d","so it helps with the rest."),("t","Wouldn't you say?")]),
   ("a", -1, [("i","Exactly."),("v","It's the base for everything else,"),("d","so it should come first."),("t","Are we decided?")])]},
 {"discuss": [
   ("b", 3, [("i","Absolutely."),("v","And I'd say teenagers need to learn how to talk about their feelings,"),("d","because a lot of people keep everything inside."),("t","Don't you think?")]),
   ("a", 2, [("i","Yes."),("v","A club can help with that too,"),("d","because when you're doing sport with friends, it's easier to talk."),("t","Has that happened to you?")]),
   ("b", 1, [("i","Actually, yes."),("v","But more PE would still reach more students,"),("d","because not everyone joins a club after school."),("t","What's your view?")])],
  "decide": [
   ("b", -1, [("i","And"),("v","healthier meals are also cheaper to organise,"),("d","because the school already serves lunch."),("t","Isn't that true?")]),
   ("a", -1, [("i","Good point."),("v","So it's easy to start straight away,"),("d","without changing the timetable."),("t","Shall we decide?")])]},
 {"discuss": [
   ("b", 2, [("i","Exactly."),("v","I'd say the problem is that clubs are usually for students who are already good at sport,"),("d","so beginners feel left out."),("t","Do you agree?")]),
   ("a", 1, [("i","Yes."),("v","That's why more PE might be fairer,"),("d","because everyone takes part, whatever their level."),("t","What do you reckon?")]),
   ("b", 0, [("i","Maybe."),("v","But food matters too,"),("d","because you can't do PE well on an empty stomach!"),("t","Wouldn't you say?")])],
  "decide": [
   ("b", -1, [("i","And"),("v","talking about stress might also help with sleep and food,"),("d","so it has a knock-on effect."),("t","Do you agree?")]),
   ("a", -1, [("i","I do."),("v","It's probably the change that helps the most students,"),("d","so it should be first."),("t","So we agree?")])]}],
"future": [
 {"discuss": [
   ("b", 4, [("i","Yes!"),("v","But I'd say you could eat less meat during the week,"),("d","and keep espetada for special occasions."),("t","Is that realistic?")]),
   ("a", 3, [("i","I think so."),("v","And the beach clean-up is a good way to start caring,"),("d","because once you see the plastic, you think twice about buying it."),("t","What do you think?")]),
   ("b", 2, [("i","Exactly."),("v","It's the same with clothes,"),("d","because when you learn how much waste there is, you stop buying so many."),("t","Do you agree?")])],
  "decide": [
   ("b", -1, [("i","Also,"),("v","if teenagers buy less, shops might change what they sell,"),("d","so it affects the whole industry."),("t","Don't you think?")]),
   ("a", -1, [("i","Good point."),("v","That's a big difference from something small,"),("d","so I'm convinced."),("t","Are we decided?")])]},
 {"discuss": [
   ("b", 2, [("i","That's true."),("v","But I'd say it's harder than it sounds,"),("d","because shops always have sales and new trends."),("t","Don't you think?")]),
   ("a", 3, [("i","Definitely."),("v","Maybe that's why the beach clean-up is so useful —"),("d","it shows you where all that stuff ends up."),("t","What's your view?")]),
   ("b", 0, [("i","Exactly."),("v","And that brings us back to recycling,"),("d","because it's the everyday habit that stops the problem at home."),("t","Wouldn't you say?")])],
  "decide": [
   ("b", -1, [("i","And"),("v","if young people recycle, they teach their parents too,"),("d","so it spreads."),("t","Isn't that true?")]),
   ("a", -1, [("i","That's a good point."),("v","It's the one that grows the most,"),("d","so it could make the biggest difference."),("t","Shall we decide?")])]},
 {"discuss": [
   ("b", 0, [("i","Exactly."),("v","I'd say people also need to know what goes in which bin,"),("d","because a lot of us get it wrong."),("t","Do you?")]),
   ("a", 0, [("i","Sometimes!"),("v","That's why I think schools should teach it,"),("d","like they do with road safety."),("t","What do you reckon?")]),
   ("b", 1, [("i","Good idea."),("v","And schools could encourage public transport too,"),("d","for example, with cheaper bus passes for students."),("t","Would you agree?")])],
  "decide": [
   ("b", -1, [("i","But"),("v","we can't take the bus everywhere,"),("d","especially in the mountains."),("t","Isn't that a problem?")]),
   ("a", -1, [("i","In some places, yes,"),("v","but most teenagers live near a bus route,"),("d","so it still helps a lot."),("t","Are we agreed?")])]}],
"people": [
 {"discuss": [
   ("b", 4, [("i","That's so true."),("v","My grandma always tells stories about Madeira in the past,"),("d","and I never get bored of them."),("t","Does yours?")]),
   ("a", 4, [("i","Yes, all the time!"),("v","I think grandparents also give you a different kind of advice,"),("d","because they're calmer than parents."),("t","What do you think?")]),
   ("b", 3, [("i","Definitely."),("v","And doing sport together is another way to connect generations,"),("d","like my grandad teaching me to fish."),("t","Do you agree?")])],
  "decide": [
   ("b", -1, [("i","OK, but"),("v","meals only work if people actually talk,"),("d","not just eat quickly and leave."),("t","What about that?")]),
   ("a", -1, [("i","True,"),("v","but if a family eats together every day, the talking comes naturally,"),("d","even about small things."),("t","So are we agreed?")])]},
 {"discuss": [
   ("b", 2, [("i","Exactly."),("v","But I'd say games can cause arguments too,"),("d","especially when someone loses!"),("t","Does that happen in your family?")]),
   ("a", 2, [("i","All the time!"),("v","But I think that's part of the fun,"),("d","because you laugh about it afterwards."),("t","What's your view?")]),
   ("b", 3, [("i","True."),("v","It's the same with sport — a bit of competition brings people together,"),("d","as long as nobody takes it too seriously and the winner doesn't show off."),("t","Wouldn't you say?")])],
  "decide": [
   ("b", -1, [("i","And"),("v","grandparents won't be here forever,"),("d","so the time with them is really special."),("t","Don't you think?")]),
   ("a", -1, [("i","That's true."),("v","It's something you might regret not doing,"),("d","so it matters the most."),("t","Shall we decide?")])]},
 {"discuss": [
   ("b", 3, [("i","True."),("v","I'd say it depends on the sport,"),("d","because a walk on a levada is something everyone can do."),("t","Would you agree?")]),
   ("a", 3, [("i","Good point."),("v","A walk is also a great time to talk,"),("d","because you're side by side and it feels less serious."),("t","What do you reckon?")]),
   ("b", 0, [("i","Exactly."),("v","That's a bit like meals,"),("d","where you talk without planning to."),("t","Don't you think?")])],
  "decide": [
   ("b", -1, [("i","And"),("v","games are cheap,"),("d","so every family can do them, rich or not."),("t","Isn't that important?")]),
   ("a", -1, [("i","Very."),("v","It's the fairest choice,"),("d","and it's really fun."),("t","Are we decided?")])]}],
}

for tk in T:
    for i, alt in enumerate(tk["alts"]):
        alt["discuss"] += D(*X[tk["id"]][i]["discuss"])
        ext = D(*X[tk["id"]][i]["decide"])
        if ext[0]["who"] == alt["decide"][-2]["who"]:          # keep the ball moving: alternate speakers
            for e in ext: e["who"] = "b" if e["who"] == "a" else "a"
        alt["decide"] = alt["decide"][:-1] + ext + alt["decide"][-1:]

# ── The school's eight functions. Each segment gets one: f 1–8. ──
FN = {1: ("Move on", "start a point, or move the discussion to a new prompt"),
      2: ("Opinion", "say what you think"),
      3: ("Justify", "a reason or an example that develops it"),
      4: ("Ask", "ask for your partner's opinion"),
      5: ("React", "show you heard your partner"),
      6: ("Agree / disagree", "politely — and say how far"),
      7: ("Build on", "take your partner's idea further"),
      8: ("Decide", "negotiate and reach a decision")}
MOVE  = r"^(Shall we (start with|talk about)|Why don't we begin|Let's (start|move on|think about)|Moving on|Another idea|Should we look at|What about|How about|OK, (being|how))"
BUILD = r"(building on that|to add to that|following on from that|connects to|links to|a bit like|same with|brings us back|is similar)"
DIS   = r"(^Maybe, but|I'm not so sure|I see your point, but|I see what you mean|That's true, but|^But\b|^Yes, but|^I know,|OK, but|not everyone)"
AGR   = r"^(I agree|Absolutely|Exactly|You're right|That's true|Definitely|Yes\b)"
def fn_of(seg, part, prompts):
    m, t = seg["m"], seg["t"]
    if part == "decide" and (m == "z" or (m == "t" and re.search(r"(go for|agree on|choose|decide|Can we agree|agreed|Does that work)", t))): return 8
    if re.search(BUILD, t) and m in ("i", "v", "d"): return 7
    if m == "i":
        if re.search(MOVE, t): return 1
        if re.search(DIS, t) or re.search(AGR, t): return 6
        return 5
    if m == "t" and any(p.split()[0] in t.lower() for p in prompts) and re.search(r"^(What about|How about|Shall we|Should we|Let's)", t): return 1
    return {"v": 2, "d": 3, "t": 4}.get(m, 2)

EDITS = {}   # (task, version, turn) → {"i": …, "v": …}: hand-written build-ons, filled in below
def apply_edits(tid, ai, part, turns):
    if part != "discuss": return
    for (t, a, k), ch in EDITS.items():
        if t == tid and a == ai:
            for s in turns[k]["segs"]:
                if s["m"] in ch: s["t"] = ch[s["m"]]

OPENERS = ["Exactly — and building on that,", "Yes, and to add to that,", "Right, and following on from that,"]
_op = [0]
def ensure_build_ons(turns, need=2):
    have = sum(1 for tn in turns for s in tn["segs"] if re.search(BUILD, s["t"]))
    for k in range(2, len(turns)):
        if have >= need: break
        tn, prev = turns[k], turns[k - 1]
        if tn["p"] != prev["p"] or tn["p"] < 0: continue
        i = next((s for s in tn["segs"] if s["m"] == "i"), None)
        v = next((s for s in tn["segs"] if s["m"] == "v"), None)
        if not i or not v or re.search(BUILD, i["t"]) or re.search(DIS, i["t"]) or re.search(r"\bbut\b", i["t"]): continue
        if not re.search(AGR + "|^(Good point|That's a good point|OK)", i["t"]): continue
        if re.match(r"(But|And|Also|So|Or)\b", v["t"]): continue          # "…to add to that, but…" would not be English
        i["t"] = OPENERS[_op[0] % 3]; _op[0] += 1
        if not v["t"].startswith(("I ", "I'", "I,")): v["t"] = v["t"][0].lower() + v["t"][1:]
        have += 1
    return have

# ═══════════════════════════ build + checks
def secs(t): return round(len([w for w in t.split() if re.search(r'[A-Za-z0-9]', w)])/2.5)
bad = 0
for tk in T:
    assert len(tk["prompts"]) == 5 and len(tk["alts"]) == 3, tk["id"]
    for i, alt in enumerate(tk["alts"]):
        for part, lo, hi in (("discuss", 100, 125), ("decide", 45, 65)):
            turns = alt[part]; tot = 0; covered = set()
            apply_edits(tk["id"], i, part, turns)
            builds = sum(1 for tn in turns for s in tn["segs"] if re.search(BUILD, s["t"])) if part == "discuss" else 0
            for n, tn in enumerate(turns):
                for s in tn["segs"]:
                    s["marks"] = spans_of(s["t"])[0]; s["f"] = fn_of(s, part, tk["prompts"])
                tn["frame"] = " ".join(frame_of(s["t"]) for s in tn["segs"])
                if n > 0: tn["wrong"] = wrongs()
                tot += sum(secs(s["t"]) for s in tn["segs"]) + (0.7 if n else 0)
                if tn["p"] >= 0: covered.add(tn["p"])
            tot = round(tot)
            alt[part] = {"turns": turns}
            ok = lo <= tot <= hi and all(t["who"] != turns[k-1]["who"] for k, t in enumerate(turns) if k)
            if part == "discuss": ok = ok and len(covered) == 5 and builds >= 2
            print(f"{'  ' if ok else '!!'} {tk['id']:7} {V[i]['tab']:14} {part:8} {len(turns)} turns {tot:3}s  prompts {sorted(covered)}  build-ons {builds}")
            bad += not ok

DATA = {
 "version": 3, "part": 3,
 "title": "Speaking Part 3 — talk it through, then decide",
 "note": ("Six tasks, one per Part 4 chapter. Each turn runs the school loop — catch it, give an opinion, justify it, ask your "
          "partner — and every phrase is tagged with one of the school's eight functions (f 1–8). Two minutes to discuss, one to decide. "
          "Three pairs, as in Part 4. Built by build-part3.py."),
 "tip": "Catch what your partner said, add your view, develop it — then throw it back. Keep the ball moving.",
 "script": {"intro": "Now, I'd like you to talk about something together for about two minutes. Here are some ideas and a question for you to discuss. First you have some time to look at the task.",
            "discuss": "Now, talk to each other about this.",
            "decide": "Thank you. Now you have about a minute to decide."},
 "modes": {
  "discuss": {"label": "Discuss · 2 min", "limit": 120, "band": [100, 120]},
  "decide":  {"label": "Decide · 1 min", "limit": 60, "band": [45, 60]}
 },
 "functions": {str(k): {"name": v[0], "hint": v[1]} for k, v in FN.items()},
 "order": ["i", "v", "d", "t", "z"],
 "moves": {
  "i": {"name": "Initiate", "hint": "start a point — or catch your partner's", "ask": "How does the turn begin?"},
  "v": {"name": "View", "hint": "say what you think", "ask": ""},
  "d": {"name": "Develop", "hint": "a reason or an example", "ask": ""},
  "t": {"name": "Throw", "hint": "hand it back to your partner", "ask": ""},
  "z": {"name": "Decide", "hint": "agree on one choice, together", "ask": ""}
 },
 "voices": V,
 "tasks": T,
 "phraseBank": [
  {"heading": "1 · Initiate / move the discussion", "note": "Start a point — or move on to a new prompt.",
   "phrases": ["Shall we start with…?", "Why don't we begin with…?", "Let's start with…", "What about…?", "Let's move on to…", "Moving on to…", "Another idea is…"]},
  {"heading": "2 · Give an opinion", "note": "",
   "phrases": ["I think…", "In my opinion,…", "For me,…", "I'd say…", "I reckon…", "I believe…"]},
  {"heading": "3 · Justify / develop an opinion", "note": "A reason or an example keeps your view alive.",
   "phrases": ["…, because…", "The thing is,…", "I mean,…", "For example,…", "…, especially…", "…, which means…"]},
  {"heading": "4 · Ask for your partner's opinion", "note": "End your turn with a question — the examiner is listening for it.",
   "phrases": ["What do you think?", "Do you agree?", "What's your view?", "Don't you think?", "How about you?", "Would you agree?", "What do you reckon?"]},
  {"heading": "5 · React to your partner", "note": "Show you heard them before you answer.",
   "phrases": ["That's a good point.", "Good idea.", "That sounds fun.", "That's so true.", "Really?", "Same here."]},
  {"heading": "6 · Agree / disagree politely", "note": "Say how far you agree.",
   "phrases": ["I agree.", "Absolutely.", "Exactly.", "You're right.", "That's true, but…", "I see your point, but…", "Maybe, but…", "I'm not so sure."]},
  {"heading": "7 · Build on your partner's idea", "note": "The move that turns two turns into one conversation.",
   "phrases": ["Exactly — and building on that,…", "Yes, and to add to that,…", "Right, and following on from that,…", "That links to what you said about…", "That connects to…", "It's the same with…"]},
  {"heading": "8 · Negotiate / reach a decision", "note": "The decision isn't marked — the negotiating is.",
   "phrases": ["So, which one shall we choose?", "I think we should go for…", "Shall we agree on…?", "You've convinced me.", "OK, let's go for… then.", "So we agree that…"]}
 ]
}
json.dump(DATA, open(sys.argv[1] if len(sys.argv) > 1 else "part3-talk.json", "w"), ensure_ascii=False, indent=1)
print("bad:", bad)
