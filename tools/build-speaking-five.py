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
P[1]={"about":ABOUT,"task":"part1","n":1,"name":"Part 1","part":"Interview","secs":[15,25],
 "how":"A Part 1 answer in five: buy a second, answer, give a reason, add an example from your life, then the other side. About twenty seconds, about you.",
 "nameAsk":{"kick":"Your answer","title":"What's your answer?","aim":"Pick the one that's true for you. Your five will be about it.","placeholder":"Your answer"},
 "subjects":[
  S("free","Free time","an activity","activities","playing football","What do you enjoy doing in your free time?",["playing football","gaming with friends","drawing","going to the beach"]),
  S("school","School","a subject","subjects","history","What's your favourite subject at school?",["history","maths","English","PE"]),
  S("people","People","a person","people","my grandmother","Who do you admire most?",["my grandmother","my older sister","my football coach","my mum"]),
  S("future","The future","a place","places","Lisbon","Where would you like to live in the future?",["Lisbon","London","a small village","somewhere by the sea"])],
 "slots":[
  slot("Buy time","buy a second to think, without going silent","buy time","Which one gives you a second to think?",
   [W("That's an interesting question, actually.","interesting"),W("Hmm, let me think about that for a second.","think"),W("Oh, that's a tricky one.","tricky")]),
  slot("Answer","answer the question straight away","answer","Which one answers the question straight away?",
   [W("Well, I'd say it has to be {X}.","say"),W("To be honest, I'd have to say {X}.","honest"),W("Without a doubt, it's {X}.","doubt")]),
  slot("Reason","say why","give a reason","Which one gives your reason?",
   [W("The main reason is that …","reason"),W("I'd say that's mostly because …","mostly"),W("What I really love is that …","love")]),
  slot("Example","add an example from your own life","give an example","Which one adds an example from your life?",
   [W("For example, last weekend I …","example"),W("This is especially true when …","especially"),W("Just to give you an example, …","give")]),
  slot("The other side","add the other side, so the answer doesn't stop too soon","add the other side","Which one adds the other side?",
   [W("Having said that, I have to admit that …","admit"),W("Although, to be fair, …","fair"),W("The only problem is that …","problem")],True)]}
P[2]={"about":ABOUT,"task":"part2","n":2,"name":"Part 2","part":"Long turn","secs":[50,60],
 "how":"A Part 2 minute in five: what the photos share, how they differ, a careful guess, another possibility, then the question answered. Same five, any photos.",
 "nameAsk":{"kick":"Your photos","title":"What do both photos show?","aim":"Pick how you'd say it. Your first sentence will use it.","placeholder":"Both photos show…"},
 "subjects":[
  S("work","Work","a scene","scenes","people working","Compare the photographs and say what might be difficult for the people in these situations.",["people working","people doing their jobs","people trying to get work done"],scene="Photo 1: colleagues in a meeting · Photo 2: someone working alone in a café"),
  S("sport","Sport","a scene","scenes","people keeping fit","Compare the photographs and say why the people have chosen to exercise in these ways.",["people keeping fit","people doing sport","people exercising"],scene="Photo 1: a woman running alone in a park · Photo 2: a team playing basketball"),
  S("holidays","Holidays","a scene","scenes","people on holiday","Compare the photographs and say what the people might enjoy about these holidays.",["people on holiday","people enjoying their free time","people relaxing away from home"],scene="Photo 1: a family on a busy beach · Photo 2: two friends camping in the mountains"),
  S("learning","Learning","a scene","scenes","people learning","Compare the photographs and say why the people are learning in these ways.",["people learning","people studying","young people learning something new"],scene="Photo 1: a class with a teacher · Photo 2: a teenager learning online at home")],
 "slots":[
  slot("What they share","open with what both photos share","say what they share","Which one opens your minute?",
   [W("I feel that in many ways these pictures are similar: they both show {X}.","similar"),W("Both pictures show {X}, but in very different ways.","different"),W("The common theme in both pictures is {X}.","common")]),
  slot("How they differ","say how the photos differ, in one sentence","show the difference","Which one shows the difference?",
   [W("While the first picture shows …","while"),W("By contrast, the second picture shows …","contrast"),W("Compared to the second picture, the first looks …","compared")]),
  slot("A guess","guess what is happening, without being too certain","make a careful guess","Which one makes a careful guess?",
   [W("It is likely that the people in the first picture …","likely"),W("It looks as if they …","looks"),W("I get the impression that …","impression")]),
  slot("Another possibility","add a second guess","add a second guess","Which one adds a second guess?",
   [W("Another possibility is that …","possibility"),W("On the other hand, they could be …","could"),W("They might also be …","might")]),
  slot("Answer the question","answer the question printed above the photos","answer the question","Which one answers the question on the page?",
   [W("So, to answer the question, I'd say …","answer"),W("Overall, I think the people in the second picture …","overall"),W("As far as I'm concerned, …","concerned")])]}
P[3]={"about":ABOUT,"task":"part3","n":3,"name":"Part 3","part":"Collaborate","secs":[20,40],
 "how":"Part 3 in five: start the discussion, invite your partner in, react, move on, then decide together. It's a conversation, not two speeches.",
 "nameAsk":{"kick":"Your idea","title":"Which one will you talk about?","aim":"Pick one of the ideas on the examiner's card. You'll start with it.","placeholder":"An idea"},
 "subjects":[
  S("tech","Technology","an idea","ideas","learning online","How useful are these things for teenagers?",["learning online","keeping in touch with friends","finding information","being creative"]),
  S("family","Family","an idea","ideas","eating meals together","How enjoyable are these ways of spending time with your family?",["eating meals together","going on holiday","playing games at home","watching films"]),
  S("town","Your town","an idea","ideas","a skate park","How could these things make a town better for young people?",["a skate park","free concerts","a youth club","better buses"]),
  S("school","School","an idea","ideas","school trips","How important are these things for a good school?",["friendly teachers","school trips","sports facilities","clubs after school"])],
 "slots":[
  slot("Start it","start the discussion with one idea","start","Which one starts the discussion?",
   [W("Shall we start with {X}? I think it's really useful, because …","start"),W("Why don't we begin with {X}?","begin"),W("Let's start with {X}, shall we?","shall")]),
  slot("Ask your partner","invite your partner in","ask your partner","Which one invites your partner in?",
   [W("What do you think? Do you agree?","agree"),W("How do you feel about {X}?","feel"),W("What's your opinion on this one?","opinion")]),
  slot("React","react to what your partner just said","react","Which one reacts to your partner?",
   [W("That's a good point, but …","point"),W("I see what you mean, but …","mean"),W("Exactly, and another thing is …","another")]),
  slot("Move on","move the discussion to the next idea","move on","Which one moves the discussion on?",
   [W("Shall we move on to the next one?","move"),W("What about this one over here?","about"),W("OK, let's talk about something else.","else")]),
  slot("Decide","reach a decision together","decide","Which one helps you decide together?",
   [W("I'd probably go for {X}, because …","probably"),W("So, are we agreed on {X}?","agreed"),W("I think we should choose {X}.","choose")])]}
P[4]={"about":ABOUT,"task":"part4","n":4,"name":"Part 4","part":"Discuss","secs":[30,45],
 "how":"A Part 4 answer in five: your opinion first, a reason, an example, the other side, then a clear ending. This is where you sound like an adult.",
 "nameAsk":{"kick":"The question","title":"What will you talk about?","aim":"Pick a topic. The examiner asks what you think about it.","placeholder":"A topic"},
 "subjects":[
  S("school","School","a topic","topics","learning about money at school","What do you think about {X}?",["learning about money at school","school uniforms","homework at weekends","mobile phones in class"],askBad="what people on the other side say"),
  S("tech","Technology","a topic","topics","social media","What do you think about {X}?",["social media","robots doing our jobs","online friendships","video games"],askBad="what people on the other side say"),
  S("city","Where we live","a topic","topics","living in a big city","What do you think about {X}?",["living in a big city","public transport","cars in city centres","tourism"],askBad="what people on the other side say")],
 "slots":[
  slot("Your opinion","give your opinion in your first sentence","give your opinion","Which one gives your opinion first?",
   [W("When it comes to {X}, I personally think that …","personally"),W("Personally, I think that {X} is …","think"),W("As far as I'm concerned, {X} is …","concerned")]),
  slot("Reason","support your opinion with a reason","give a reason","Which one gives your reason?",
   [W("The main reason is that …","reason"),W("The reason I think this is that …","think"),W("One reason is that …","one")]),
  slot("Example","make it real with an example","give an example","Which one adds an example?",
   [W("A good example of this is …","good"),W("For example, in my town …","example"),W("Take my school, for example.","take")]),
  slot("The other side","show you can see the other side","show the other side","Which one shows the other side?",
   [W("Having said that, some people argue that …","argue"),W("On the other hand, it could be said that …","said"),W("Not everyone agrees, though, because …","everyone")],True),
  slot("Bring it home","end clearly, or hand it to your partner","end clearly","Which one ends your answer clearly?",
   [W("So, on the whole, I'd say …","whole"),W("All in all, I believe that …","believe"),W("That's what I think. What about you?","about")])]}
import re
for n,d in P.items():
    d["version"]=1
    # sanity: every hide is a word in its sentence
    for s in d["slots"]:
        for w in s["ways"]:
            words=[re.sub(r"[^a-z0-9']","",x.lower().replace("’","'")) for x in w["t"].split()]
            assert w["hide"] in words,(n,w)
    json.dump(d,open(f"data/speaking/five/part{n}.json","w"),ensure_ascii=False,indent=1)
print("ok")
