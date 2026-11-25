import json
W=lambda t,h:{"t":t,"hide":h}
def S(key,label,a,plural,eg,q,picks,ask="your own reason or example",askBad="a small problem with it",scene=None):
    d={"key":key,"label":label,"a":a,"plural":plural,"eg":eg,"q":q,"ask":ask,"askBad":askBad,"picks":picks}
    if scene: d["scene"]=scene
    return d
def slot(label,job,pick,q,ways,against=False):
    d={"part":label,"label":label,"job":job,"pick":pick,"q":q,"ways":ways}
    if against: d["against"]=True
    return d
ABOUT="Speaking in five (22 Nov 2026): the Writing 'in five' ladder for a Speaking Part. Five moves, one sentence each, the school's frames first (data/drills/speaking/*.json). {X} = what the pupil picks or types. 'q' on a subject is the examiner's question ({X} filled). 'secs' is the target length of the whole answer said aloud."
P={}
# 25 Nov 2026 (the owner): Structures teaches what Practise teaches. The moves and their labels are
# Tomás's and Beatriz's stages, the three ways in each move are alternatives from the repertoire (pupils
# vary their chunks), and the topics are the Part's topics in Practise.
ABOUT="Speaking in five (25 Nov 2026): the Writing 'in five' ladder for a Speaking Part, in the school's blueprint: the moves and labels of Practise (the Tomás and Beatriz models), three alternative chunks per move, the Part's Practise topics. {X} = what the pupil picks. 'q' is the examiner's question."
P[1]={"about":ABOUT,"task":"part1","n":1,"name":"Part 1","part":"Interview","secs":[15,25],
 "how":"A Part 1 answer in four moves: react with feeling, answer, develop it with a reason or an example (never both), then a contrast. About twenty seconds, about you.",
 "nameAsk":{"kick":"Your answer","title":"What's your answer?","aim":"Pick the one that's true for you. Your answer will be about it.","placeholder":"Your answer"},
 "subjects":[
  S("home","Home & family","a person","people","my dad","Who are you most like in your family?",["my dad","my mum","my grandmother","my older sister"]),
  S("city","City","a place","places","the seafront","Where's the best place to go with friends in your city?",["the seafront","the Lido","the shopping centre","the old town"]),
  S("routines","Routines","an activity","activities","football practice","What do you usually do in the evenings?",["football practice","my homework","chatting with friends","watching series"]),
  S("likes","Likes & dislikes","a food","foods","espetada","What kind of food do you like?",["espetada","pizza","sushi","my grandmother's soup"]),
  S("sports","Sports","a sport","sports","surfing","Is there a sport or hobby you enjoy?",["surfing","football","volleyball","dancing"]),
  S("school","School & future","a subject","subjects","English","What's your favourite subject?",["English","history","PE","maths"]),
  S("travel","Travel","a country","countries","Japan","Which country would you most like to visit?",["Japan","Brazil","Italy","the USA"])],
 "slots":[
  slot("React","react with feeling, before you answer","react","Which one reacts with feeling?",
   [W("Oh, that's an easy one!","easy"),W("Hmm, let me think for a second.","think"),W("Honestly, I love this question!","love")]),
  slot("Respond","answer the question straight away","respond","Which one answers the question?",
   [W("I'd say it's {X}.","say"),W("For me, it has to be {X}.","has"),W("I really like {X}.","really")]),
  slot("Develop","develop it: a reason OR an example, never both","develop it","Which one develops your answer?",
   [W("Mainly because …","mainly"),W("Especially when …","especially"),W("For example, last weekend I …","example")]),
  slot("Contrast","add a contrast, so the answer doesn't stop too soon","add a contrast","Which one adds a contrast?",
   [W("Although …","although"),W("Even though …","though"),W("The only problem is that …","problem")],True)]}
P[2]={"about":ABOUT,"task":"part2","n":2,"name":"Part 2","part":"Long turn","secs":[50,60],
 "how":"A Part 2 minute in five: what the photos share, how they differ, a guess that compares them, develop it, then the question answered. Same five, any photos.",
 "nameAsk":{"kick":"Your photos","title":"What do both photos show?","aim":"Pick how you'd say it. Your first sentence will use it.","placeholder":"people…"},
 "subjects":[
  S("work","Work","a scene","scenes","people working","Compare the photographs and say what might be difficult for the people in these situations.",["people working","people doing their jobs","people trying to concentrate"],scene="Photo 1: a team in a meeting · Photo 2: someone working alone in a café"),
  S("social","Social","a scene","scenes","people surrounded by others","Compare the photographs and say how the people might be feeling.",["people surrounded by others","young people together","people in busy places"],scene="Photo 1: a crowded street at night · Photo 2: students working in a library"),
  S("entertainment","Entertainment","a scene","scenes","people relaxing together","Compare the photographs and say why the people might have chosen these activities.",["people relaxing together","people having fun","people spending free time together"],scene="Photo 1: people at the cinema · Photo 2: a family playing a board game"),
  S("shopping","Shopping","a scene","scenes","people shopping","Compare the photographs and say what might be enjoyable or frustrating about shopping in these places.",["people shopping","places to buy things","people looking for bargains"],scene="Photo 1: a big shopping centre · Photo 2: a traditional market"),
  S("outdoor","Outdoor","a scene","scenes","people in nature","Compare the photographs and say why the people might have decided to spend time in these places.",["people in nature","people outdoors","people far from the city"],scene="Photo 1: a beach at sunset · Photo 2: someone hiking in the mountains"),
  S("learning","Learning","a scene","scenes","people learning","Compare the photographs and say what the people might be learning.",["people learning","people helping each other","people studying"],scene="Photo 1: students in a library · Photo 2: a parent helping children with a tablet"),
  S("sports","Sports","a scene","scenes","people doing exercise","Compare the photographs and say what skills the people might be developing.",["people doing exercise","people doing sport","people keeping fit"],scene="Photo 1: a football team · Photo 2: someone training alone in a gym"),
  S("travel","Travel","a scene","scenes","people travelling","Compare the photographs and say which trip might be more memorable.",["people travelling","people on holiday","people seeing something new"],scene="Photo 1: tourists in a city · Photo 2: an adventure by a mountain lake")],
 "slots":[
  slot("Similar","open with what both photos share","say what they share","Which one says what the photos share?",
   [W("Both photos show {X}.","both"),W("What both photos have in common is {X}.","common"),W("In both cases, I can see {X}.","cases")]),
  slot("Different","say how the photos differ, in one sentence","show the difference","Which one shows the difference?",
   [W("Whereas the first photo shows …, the second one shows …","whereas"),W("In the first photo …, but in the second photo …","but"),W("The first photo shows …, while the second …","while")]),
  slot("Guess","guess, comparing the people, with evidence","make a comparing guess","Which one makes a guess that compares?",
   [W("Judging by their faces, the people in the first photo might be more … than …","judging"),W("From the way they're standing, they look as if …","way"),W("The people in the second photo are probably …","probably")]),
  slot("Develop","develop your guess: a reason OR an example","develop it","Which one develops your guess?",
   [W("Mainly because …","mainly"),W("For example, …","example"),W("Maybe that's because …","maybe")]),
  slot("Answer","answer the question printed above the photos","answer the question","Which one answers the question on the page?",
   [W("So I'd say …","so"),W("Overall, I think the second situation is more … , although …","overall"),W("To answer the question, I think …","question")])]}
P[3]={"about":ABOUT,"task":"part3","n":3,"name":"Part 3","part":"Collaborate","secs":[20,40],
 "how":"Part 3 in five: move the discussion to an idea, give your opinion, disagree politely, give a reason, then decide together. A conversation, not two speeches.",
 "nameAsk":{"kick":"Your idea","title":"Which one will you talk about?","aim":"Pick one of the ideas on the examiner's card. You'll start with it.","placeholder":"An idea"},
 "subjects":[
  S("tech","Technology","an idea","ideas","learning online","How useful are these things for teenagers?",["learning online","keeping in touch","finding information","being creative"]),
  S("school","School & learning","an idea","ideas","studying with friends","How helpful are these things for students preparing for exams?",["studying with friends","getting a tutor","a study timetable","getting enough sleep"]),
  S("money","Work & money","an idea","ideas","working in a café","How good are these ways for teenagers to earn money?",["working in a café","babysitting","selling things online","giving lessons"]),
  S("health","Health & sport","an idea","ideas","healthier school meals","How could these things help students be healthier?",["healthier school meals","more PE lessons","an after-school sports club","lessons about mental health"]),
  S("future","Environment & future","an idea","ideas","recycling at home","How much difference could these things make to the environment?",["recycling at home","public transport","a beach clean-up","buying fewer clothes"]),
  S("people","People & society","an idea","ideas","eating meals together","How could these things bring a family closer?",["eating meals together","going on holiday","visiting grandparents","playing games at home"])],
 "slots":[
  slot("Move on","move the discussion to an idea","move on","Which one moves the discussion to an idea?",
   [W("Let's start with {X}.","start"),W("Shall we talk about {X}?","talk"),W("What about {X}?","about")]),
  slot("Opinion","give your opinion on it","give your opinion","Which one gives your opinion?",
   [W("In my opinion, it's …","opinion"),W("If you ask me, it's a great idea, because …","ask"),W("Personally, I believe it's …","believe")]),
  slot("Disagree","disagree politely with your partner","disagree politely","Which one disagrees politely?",
   [W("Really? I'm not so sure.","sure"),W("I see your point, but …","point"),W("That's a good point, but …","good")],True),
  slot("Reason","support it with a reason","give a reason","Which one gives a reason?",
   [W("Mainly because …","mainly"),W("That's why …","why"),W("The only problem is that …","problem")]),
  slot("Decide","reach a decision together","decide","Which one helps you decide together?",
   [W("So, which one shall we choose?","choose"),W("I'd go for {X}, because …","go"),W("OK, so we agree on {X}.","agree")])]}
P[4]={"about":ABOUT,"task":"part4","n":4,"name":"Part 4","part":"Discuss","secs":[30,45],
 "how":"A Part 4 answer in five: react, give your view about people in general, support it with a reason, admit the other side, then hold your view. That's how you maintain an opinion.",
 "nameAsk":{"kick":"The question","title":"What will you talk about?","aim":"Pick a topic. The examiner asks what you think about it.","placeholder":"A topic"},
 "subjects":[
  S("tech","Technology","a topic","topics","social media","What do you think about {X}?",["social media","phones at school","robots doing our jobs","young people's screen time"],askBad="what people on the other side say"),
  S("school","School & learning","a topic","topics","homework","What do you think about {X}?",["homework","online learning","cooking lessons at school","studying alone"],askBad="what people on the other side say"),
  S("money","Work & money","a topic","topics","part-time jobs for teenagers","What do you think about {X}?",["part-time jobs for teenagers","learning about money at school","saving money","working long hours"],askBad="what people on the other side say"),
  S("health","Health & sport","a topic","topics","fast food","What do you think about {X}?",["fast food","sport at school","footballers' salaries","exercise"],askBad="what people on the other side say"),
  S("future","Environment & future","a topic","topics","tourism on islands","What do you think about {X}?",["tourism on islands","fast fashion","free buses for teenagers","small changes for the planet"],askBad="what people on the other side say"),
  S("people","People & society","a topic","topics","video games","What do you think about {X}?",["video games","having lots of friends","growing up in a small town","following celebrities"],askBad="what people on the other side say")],
 "slots":[
  slot("React","react: show where you stand","react","Which one shows where you stand?",
   [W("That's a tricky one.","tricky"),W("Good question.","question"),W("It's hard to say.","hard")]),
  slot("Opinion","give your view, about people in general","give your view","Which one gives your view?",
   [W("When it comes to {X}, I think …","comes"),W("The way I see it, …","way"),W("From my point of view, it depends on …","point")]),
  slot("Reason","support your view with a reason","support it","Which one supports your view?",
   [W("The main reason is that …","main"),W("The reason is that …","reason"),W("That's because …","because")]),
  slot("Concede","admit the other side","admit the other side","Which one admits the other side?",
   [W("It's true that …","true"),W("Of course, …","course"),W("Admittedly, …","admittedly")],True),
  slot("Maintain","hold your view: come back to it","hold your view","Which one holds your view?",
   [W("Even so, …","even"),W("But overall, …","overall"),W("All the same, …","same")])]}
# the examiner's questions word for word as in Practise, so Maya's recordings are heard here too
for n,f in ((2,'part2-turn'),(3,'part3-talk')):
    src={t['id']:t['question'] for t in json.load(open(f'skills/speaking/data/{f}.json'))['tasks']}
    for sb in P[n]['subjects']:
        if sb['key'] in src: sb['q']=src[sb['key']]
import re
for n,d in P.items():
    d["version"]=2
    # sanity: every hide is a word in its sentence
    for s in d["slots"]:
        for w in s["ways"]:
            words=[re.sub(r"[^a-z0-9']","",x.lower().replace("’","'")) for x in w["t"].split()]
            assert w["hide"] in words,(n,w)
    json.dump(d,open(f"data/speaking/five/part{n}.json","w"),ensure_ascii=False,indent=1)
print("ok")
