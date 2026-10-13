"""Speaking Part 2 — part2-turn.json, v4.

The 60 seconds in three chunks — Similarities · Differences · Speculating —
on the school's frame. The frame stays; the key expressions rotate across
Default, Alternative 1 and Alternative 2; the content in [[brackets]] is what
students replace with their own ideas, and becomes the blanks in the pattern.

Photos and facts are the original eight pairs, so every sentence matches
what students see. Run: python3 build-part2.py part2-turn.json
"""
import json, re, sys

# ── the photos, exactly as they were ──
PHOTOS = {
 "work": [("Office Meeting", "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800"),
          ("Working in Café", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800")],
 "social": [("City at Night", "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800"),
            ("Study Group", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800")],
 "entertainment": [("Cinema", "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"),
                   ("Board Games", "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800")],
 "shopping": [("Shopping Mall", "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=800"),
              ("Local Market", "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800")],
 "outdoor": [("Beach at Sunset", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"),
             ("Mountain Hiking", "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800")],
 "learning": [("Students Studying", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"),
              ("Family at Home", "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800")],
 "sports": [("Team Sports", "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800"),
            ("Individual Gym Training", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800")],
 "travel": [("City Tourism", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800"),
            ("Nature Adventure", "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800")],
}

# ── the key expressions: x-ray lights these up wherever they appear ──
BANK = ["I feel that in many ways", "the two pictures are similar", "They both show", "In some ways",
 "the two pictures are quite alike", "In both of them we can see", "There are obvious similarities between the two photos",
 "What they have in common is that", "While the first picture shows", "the second picture shows", "by contrast",
 "Whereas the first photo shows", "the second one shows", "The first picture shows",
 "Starting with the first picture", "If we look at the first picture", "To begin with the first photo",
 "Turning to the second picture", "In the second photo, however", "On the other hand",
 "it looks as if", "it seems as though", "I get the impression that", "my guess is that", "there's every chance that",
 "It's likely that", "It's possible that", "is likely", "are likely to", "certainly", "probably", "could be", "might",
 "must", "seems to be", "seem to be", "look as if", "I'd say", "I believe", "not only", "but also"]

def marks_for(t, bank=None):
    out, taken = [], []
    for p in sorted(bank or BANK, key=len, reverse=True):
        i = t.find(p)
        if i < 0 or any(a < i + len(p) and i < b for a, b in taken): continue
        taken.append((i, i + len(p))); out.append(p)
    return out

DESCRIBE = "Pure description. The examiner can see the pictures — say what you think is happening, and why."
TOOSURE  = "Too certain. You can't know from a photo — 'might', 'could', 'it looks as if' keep it honest."
NODIFF   = "That's another similarity. The differences sentence needs 'while', 'whereas' or 'by contrast'."
VAGUEDIF = "No contrast and nothing specific. Name the difference in one sentence."

def turn(why, sim, dif, spe, wrong_desc, wrong_sure, wrong_same):
    return {"why": why, "segs": [
        {"m": "sim", "t": sim},
        {"m": "dif", "t": dif, "wrong": [{"t": wrong_same, "why": NODIFF},
            {"t": "In the first picture there are some people. In the second picture there are some people too.", "why": VAGUEDIF}]},
        {"m": "spe", "t": spe, "wrong": [{"t": wrong_desc, "why": DESCRIBE}, {"t": wrong_sure, "why": TOOSURE}]}]}

WHY = ["The school frame: 'I feel that in many ways…', 'While… the second…', 'Starting with the first picture, it looks as if…'. Every blank is yours to fill.",
       "Same frame, new expressions: 'In some ways…quite alike', '…; by contrast,…', 'If we look at the first picture, it seems as though…'.",
       "Same frame, new expressions again: 'There are obvious similarities…', 'Whereas…', 'To begin with the first photo, I get the impression that…'."]

T = []
def task(id_, tab, q, briefs, a, b, c, wd, ws, wsame):
    T.append({"id": id_, "tab": tab, "question": q,
              "photos": [{"title": PHOTOS[id_][i][0], "brief": briefs[i], "src": PHOTOS[id_][i][1],
                          "license": "Unsplash licence", "licenseUrl": "https://unsplash.com/license"} for i in (0, 1)],
              "alts": [{"turn": turn(WHY[i], *x, wd, ws, wsame)} for i, x in enumerate((a, b, c))]})

task("work", "Work", "Compare the two photographs and say what might be difficult for the people in these situations.",
 ("A group of colleagues in a meeting around an office table.", "Someone working alone on a laptop in a café."),
 ("I feel that in many ways the two pictures are similar. They both show people [[working]].",
  "While the first picture shows [[colleagues in a meeting]], the second picture shows [[someone working alone in a café]].",
  "Starting with the first picture, it looks as if [[the meeting]] might [[be long and serious]]. The hardest part is probably [[agreeing on a decision, because everyone has different ideas]]. Some people might also [[feel nervous about speaking in front of their boss]]. On the other hand, the [[person in the café]] could be [[a student]]. Working there is likely [[to be more relaxing]], but it might be difficult [[to concentrate with all the noise]]. And I believe that working like this is not only [[more distracting]] but also [[lonelier]], because there's nobody to ask for help."),
 ("In some ways, the two pictures are quite alike. In both of them we can see people [[trying to work]].",
  "The first picture shows [[a meeting in an office]]; by contrast, the second picture shows [[a person working alone in a café]].",
  "If we look at the first picture, it seems as though [[the colleagues are discussing something important]]. I'd say the biggest difficulty is probably [[the pressure]]. They may have to [[agree on something before the meeting ends]], and it isn't easy to [[keep everyone happy]]. Turning to the second picture, my guess is that [[this person wanted a change from the office]]. It's possible that [[the café helps at first]], but after a while [[the noise]] could make it difficult to [[think clearly]]. They might also [[spend too much money on coffee]]!"),
 ("There are obvious similarities between the two photos. What they have in common is that they show people [[at work]].",
  "Whereas the first photo shows [[a team working together in an office]], the second one shows [[someone working alone in a café]].",
  "To begin with the first photo, I get the impression that [[the meeting isn't going very well]]. They must [[have a lot to discuss]], and maybe [[not everyone agrees]]. It's likely that [[some of them want to impress their boss]]. In the second photo, however, the person seems to be [[working at their own speed]]. The difficulty here is probably [[the opposite]]. There's nobody around [[to help or check their work]], so they have to [[organise themselves]], which isn't easy for everyone."),
 "In the first picture there's a long table, some laptops and a big window.",
 "The people in the meeting are definitely arguing about money.",
 "Both pictures also show people using laptops.")

task("social", "Social", "Compare the two photographs and say how the people might be feeling in these situations.",
 ("A crowded city street at night, full of lights and people.", "A group of students studying together in a library."),
 ("I feel that in many ways the two pictures are similar. They both show people [[surrounded by other people]].",
  "While the first picture shows [[a busy city street at night]], the second picture shows [[a group of students in a library]].",
  "Starting with the first picture, it looks as if [[everyone is in a hurry]]. Some of them might [[feel excited by the lights and the noise]]. But others could [[feel a bit lonely]], even with so many people around. On the other hand, the [[students in the second picture]] could be [[preparing for an exam together]]. They are likely to [[feel some pressure]], but I believe that studying with friends makes it not only [[less stressful]] but also [[a lot more fun]]."),
 ("In some ways, the two pictures are quite alike. In both of them we can see people [[in the same place]].",
  "The first picture shows [[strangers walking through a busy city at night]]; by contrast, the second picture shows [[friends studying together in a library]].",
  "If we look at the first picture, it seems as though [[nobody is talking to anyone else]]. I'd say most people probably feel [[a bit tired]]. Maybe [[they're going home after a long day at work]]. Turning to the second picture, my guess is that [[the students are helping each other]]. They might be [[quite stressed about their work]], but it's possible that [[working together makes it easier]]. They probably feel [[more confident as a group]], and they seem to be [[enjoying it]]."),
 ("There are obvious similarities between the two photos. What they have in common is that they show people [[in busy places]].",
  "Whereas the first photo shows [[a crowd of strangers in the city]], the second one shows [[a small group of friends in a library]].",
  "To begin with the first photo, I get the impression that [[people are in a hurry and not looking at each other]]. They must [[be used to the noise and the crowds]], but some of them might [[feel a bit lonely]]. It's likely that [[tourists find it exciting]], though. In the second photo, however, the students seem to be [[enjoying each other's company]]. They might have [[an important exam soon]], but they look as if they feel [[calm and confident]], because [[they're not studying alone]]."),
 "In the first picture there are lots of lights, cars and tall buildings.",
 "Everyone in the city is definitely unhappy.",
 "Both pictures also show lots of people.")

task("entertainment", "Entertainment", "Compare the two photographs and say why the people might have chosen to spend their time in these ways.",
 ("People watching a film in a cinema.", "A family playing a board game together at home."),
 ("I feel that in many ways the two pictures are similar. They both show people [[enjoying their free time]].",
  "While the first picture shows [[people watching a film at the cinema]], the second picture shows [[a family playing a board game at home]].",
  "Starting with the first picture, it looks as if [[they might want to forget about everyday life for a couple of hours]]. Watching a film on a big screen is certainly [[more exciting than watching it at home]], and the sound is [[much better]]. On the other hand, the [[family in the second picture]] could be [[spending a quiet evening together]]. Playing games like this is likely [[to be much cheaper]]. And I believe it is not only [[more relaxing]] but also [[better for talking to each other]]."),
 ("In some ways, the two pictures are quite alike. In both of them we can see people [[having fun]].",
  "The first picture shows [[an audience in a dark cinema]]; by contrast, the second picture shows [[a family sitting round a table with a board game]].",
  "If we look at the first picture, it seems as though [[the audience wants a special experience]]. I'd say they probably chose the cinema because [[you can't get a screen that big at home]]. Maybe [[it's a new film they really wanted to see]]. Turning to the second picture, my guess is that [[the parents wanted the children to stop using screens for a while]]. It's possible that [[they play games every weekend]], and they seem to be [[having a lot of fun together]]."),
 ("There are obvious similarities between the two photos. What they have in common is that they show people [[relaxing and having fun]].",
  "Whereas the first photo shows [[a crowd of people at the cinema]], the second one shows [[a family at home playing together]].",
  "To begin with the first photo, I get the impression that [[these people just want to relax and watch something]]. They must [[have been waiting for this film]], and maybe [[it's a special weekend plan]]. In the second photo, however, the family seem to be [[taking part, not just watching]]. It's likely that [[they chose a board game because everyone can play]], from the youngest to the oldest. They look as if they're [[really enjoying their time together]]."),
 "In the first picture the room is dark and there are red seats.",
 "The people at the cinema are definitely watching a horror film.",
 "Both pictures also show people sitting down.")

task("shopping", "Shopping", "Compare the two photographs and say what might be enjoyable or frustrating about shopping in these places.",
 ("A big, modern shopping mall with lots of stores.", "A local market with individual stalls."),
 ("I feel that in many ways the two pictures are similar. They both show places where people [[go shopping]].",
  "While the first picture shows [[a big, modern shopping centre]], the second picture shows [[a traditional market with small stalls]].",
  "Starting with the first picture, it looks as if [[the shoppers might like having all the shops in one place]]. This is certainly [[easier]], especially when it's raining. However, it could be [[frustrating when it's crowded and everything is expensive]]. On the other hand, the [[people at the market]] could be [[looking for fresh, local food]]. Shopping there is likely [[to be more personal]], and I believe it's not only [[cheaper]] but also [[more fun]]. But it might be frustrating [[if it's very hot]]."),
 ("In some ways, the two pictures are quite alike. In both of them we can see people [[buying things]].",
  "The first picture shows [[a shopping centre with lots of big shops]]; by contrast, the second picture shows [[a market with small sellers]].",
  "If we look at the first picture, it seems as though [[it's a busy day]]. I'd say the best part is probably [[that you can find everything quickly]], but it might be frustrating [[to wait in long queues]]. Turning to the second picture, my guess is that [[people come here for the atmosphere]]. It's possible that [[they can ask for a better price]], which could be [[fun]]. But the crowds and the heat might [[make it less enjoyable]], especially [[in the middle of summer]]."),
 ("There are obvious similarities between the two photos. What they have in common is that they show people [[shopping]].",
  "Whereas the first photo shows [[a modern indoor shopping centre]], the second one shows [[a busy local market]].",
  "To begin with the first photo, I get the impression that [[it's very organised and comfortable]]. The shoppers must [[like comparing prices easily]], and maybe [[they're spending the whole day there]]. It's likely that [[the only problem is that it feels a bit cold and impersonal]]. In the second photo, however, the market seems to be [[full of colour and noise]]. People might [[enjoy talking to the sellers]], but they could get frustrated [[if the thing they want is already sold]]!"),
 "In the first picture there are shops on two floors and a glass roof.",
 "Everyone at the market is definitely a tourist.",
 "Both pictures also show things for sale.")

task("outdoor", "Outdoor", "Compare the two photographs and say why the people might have decided to spend their time in these ways.",
 ("A peaceful beach at sunset.", "Someone hiking in the mountains."),
 ("I feel that in many ways the two pictures are similar. They both show [[people spending time in nature]].",
  "While the first picture shows [[a peaceful beach at sunset]], the second picture shows [[someone hiking in the mountains]].",
  "Starting with the first picture, it looks as if [[the people there might want to escape from a busy life]]. Watching the sunset on a beach is certainly [[one of the most relaxing things you can do]]. On the other hand, the [[hiker in the second picture]] could be [[someone who loves a challenge]]. Hiking like this is likely [[to be much harder]], and they would [[need to be quite fit]]. But I believe it's not only [[great exercise]] but also [[very rewarding when you reach the top]]."),
 ("In some ways, the two pictures are quite alike. In both of them we can see [[beautiful natural places]].",
  "The first picture shows [[a quiet beach at the end of the day]]; by contrast, the second picture shows [[a hiker on a mountain path]].",
  "If we look at the first picture, it seems as though [[this is a place to slow down]]. I'd say someone would probably come here [[to relax after work]]. Maybe they want [[to watch the sun go down and forget their problems]]. Turning to the second picture, my guess is that [[the hiker wants a real challenge]]. It's possible that [[they've been planning this trip for months]], and they seem to be [[really enjoying it]], even if [[their legs are probably tired]]."),
 ("There are obvious similarities between the two photos. What they have in common is that they show [[people getting away from the city]].",
  "Whereas the first photo shows [[a calm beach]], the second one shows [[a difficult mountain walk]].",
  "To begin with the first photo, I get the impression that [[people go there to rest]]. Anyone there must [[be looking for peace and quiet]], and maybe [[they've had a stressful week]]. In the second photo, however, the hiker seems to be [[looking for adventure]]. It's likely that [[they enjoy testing themselves]], and they might have [[chosen the mountains for the amazing views]]. I'd say [[both of them want a break from their routine]], but in very different ways."),
 "In the first picture the sky is orange and the sea is calm.",
 "The hiker is definitely a professional climber.",
 "Both pictures also show the sky.")

task("learning", "Learning", "Compare the two photographs and say what the people might be learning from these experiences.",
 ("University students studying together in a library.", "A parent at home helping young children with a tablet."),
 ("I feel that in many ways the two pictures are similar. They both show people [[learning something]].",
  "While the first picture shows [[students studying together in a library]], the second picture shows [[a parent helping young children with a tablet at home]].",
  "Starting with the first picture, it looks as if [[the students might be preparing for an exam]]. They are certainly [[learning their subject]], but they are probably also learning [[how to work as a team]]. On the other hand, the [[children in the second picture]] could be [[learning numbers, colours or new words]]. Learning like this is likely [[to feel more like a game]]. And I believe it helps them develop not only [[their knowledge]] but also [[their concentration]]."),
 ("In some ways, the two pictures are quite alike. In both of them we can see people [[concentrating on learning]].",
  "The first picture shows [[students working in a library]]; by contrast, the second picture shows [[young children learning through play at home]].",
  "If we look at the first picture, it seems as though [[the students are sharing ideas]]. I'd say they're probably learning [[to explain things clearly and listen to each other]]. That's just as important as [[the subject itself]]. Turning to the second picture, my guess is that [[the children are playing an educational game]]. It's possible that [[they're learning to follow instructions]], and they seem to be [[enjoying it so much that they don't notice they're learning]]."),
 ("There are obvious similarities between the two photos. What they have in common is that they show people [[learning new things]].",
  "Whereas the first photo shows [[older students working as a group]], the second one shows [[small children who need an adult to help them]].",
  "To begin with the first photo, I get the impression that [[the students have a deadline soon]]. They must [[be learning to organise their time]], and maybe [[they're learning a lot from each other too]]. In the second photo, however, the children seem to be [[learning the basics]]. It's likely that [[the parent is teaching them letters or numbers]], and they might also be learning [[to be patient and wait for their turn]]. That's quite difficult at that age!"),
 "In the first picture there are books, laptops and a big table.",
 "The children are definitely learning English.",
 "Both pictures also show people sitting at a table.")

task("sports", "Sports", "Compare the two photographs and say what skills the people might be developing through these activities.",
 ("A team playing football together on a field.", "Someone working out alone in a gym."),
 ("I feel that in many ways the two pictures are similar. They both show people [[doing sport and keeping fit]].",
  "While the first picture shows [[a team playing football]], the second picture shows [[someone training alone in a gym]].",
  "Starting with the first picture, it looks as if [[the players might be in the middle of a match]]. They're certainly [[getting fitter]], but they're probably also developing [[teamwork and communication]], because they have to [[pass the ball and trust each other]]. On the other hand, the [[person in the gym]] could be [[following a training plan]]. Training like this is likely [[to make them stronger]]. And I believe it develops not only [[the body]] but also [[self-discipline]], because [[nobody is there to motivate them]]."),
 ("In some ways, the two pictures are quite alike. In both of them we can see people [[being active]].",
  "The first picture shows [[a group of football players]]; by contrast, the second picture shows [[a person training on their own]].",
  "If we look at the first picture, it seems as though [[the game is quite competitive]]. I'd say the players are probably learning [[to think quickly and react to their teammates]]. They also need [[to stay calm under pressure]]. Turning to the second picture, my guess is that [[this person has a personal goal]]. It's possible that [[they're preparing for a competition]], and they seem to be developing [[the motivation to train without anyone watching]]. That skill helps in everything."),
 ("There are obvious similarities between the two photos. What they have in common is that they show people [[exercising]].",
  "Whereas the first photo shows [[a team sport outdoors]], the second one shows [[someone training alone indoors]].",
  "To begin with the first photo, I get the impression that [[the players know each other well]]. They must [[be developing their coordination]], and maybe [[they're learning how to win and lose together]]. In the second photo, however, the person seems to be [[focused on their own progress]]. It's likely that [[they're getting stronger]]. They might also be learning [[to set goals and keep going]], even [[on days when they don't feel like training]]."),
 "In the first picture the players are wearing coloured shirts and there's a ball.",
 "The football players are definitely professionals.",
 "Both pictures also show people wearing sports clothes.")

task("travel", "Travel", "Compare the two photographs and say what might make these travel experiences memorable for the people.",
 ("Tourists visiting famous buildings and landmarks in a city.", "Someone on an adventure in nature, by a lake in the mountains."),
 ("I feel that in many ways the two pictures are similar. They both show people [[travelling and exploring]].",
  "While the first picture shows [[tourists visiting famous places in a city]], the second picture shows [[someone on an adventure in nature]].",
  "Starting with the first picture, it looks as if [[the tourists might be on a short city holiday]]. Seeing famous buildings in real life is certainly [[exciting]], and they'll probably remember [[the photos they took and the food they tried]]. On the other hand, the [[traveller in the second picture]] could be [[looking for peace and quiet]]. Being somewhere like this is likely [[to feel very special]]. And I believe the experience will be not only [[more relaxing]] but also [[more memorable]]."),
 ("In some ways, the two pictures are quite alike. In both of them we can see people [[discovering new places]].",
  "The first picture shows [[a busy city full of tourists]]; by contrast, the second picture shows [[a quiet natural landscape]].",
  "If we look at the first picture, it seems as though [[everyone is trying to see as much as possible]]. I'd say what they'll remember most is probably [[standing in front of a famous building they've only seen on TV]]. Turning to the second picture, my guess is that [[the traveller wanted to get away from the crowds]]. It's possible that [[they'll remember the silence more than anything]], and they seem to be [[completely relaxed]]."),
 ("There are obvious similarities between the two photos. What they have in common is that they show people [[on holiday]].",
  "Whereas the first photo shows [[a trip to a historic city]], the second one shows [[a trip into nature]].",
  "To begin with the first photo, I get the impression that [[the tourists are learning about the history of the place]]. They must [[be taking lots of photos]], and maybe [[they'll share them with their friends]]. In the second photo, however, the traveller seems to be [[stopping to enjoy the view]]. It's likely that [[they'll remember this place for years]], and they might feel [[very close to nature]], far away from [[phones and traffic]]."),
 "In the first picture there are old buildings and a lot of people.",
 "The traveller in the second picture is definitely lost.",
 "Both pictures also show beautiful places.")

# ── the examiner's set-up line and the partner's question ──
# In the exam the examiner names the photos' theme ("They show…") before the
# task, and after the minute asks the OTHER candidate a short question about
# the same photos (about 30 seconds). Both added from the FCE model interviews.
FOLLOW = {
 "work": ("They show people working in different places.", "Which of these places would you prefer to work in?", (
   ("That's a difficult one, but I'd rather work [[in the café]].", "I imagine [[an office meeting like that]] would make me [[quite nervous]], and a café is [[much more relaxed than an office]].", "I suppose I might [[get distracted by the noise]], but at least I could [[take a break whenever I wanted]]."),
   ("To be honest, I'd prefer [[the office]].", "I think working with [[a team]] is [[more motivating than working alone]], and you can always [[ask someone for help]].", "In a café, I imagine I'd [[spend the whole morning watching people instead of working]]!"),
   ("I'd definitely choose [[the café]].", "I suppose [[the office]] is [[more professional]], but for me [[a café]] is [[far more creative]].", "But [[the noise and the music]] could be a problem if I [[had to concentrate on something difficult]].")) ),
 "social": ("They show people in busy places.", "Which of these places would you rather be in?", (
   ("I'd rather be [[in the library with my friends]].", "I imagine [[a crowded street at night]] would be [[exciting for a while]], but [[it would soon get tiring]].", "Studying together is [[much more relaxing than being in a crowd of strangers]], and you [[get help when you're stuck]]."),
   ("Personally, I'd choose [[the city at night]].", "I love [[the lights and the energy]], and I suppose it feels [[more exciting than a quiet library]].", "I'd probably [[go with a group of friends]], though, so I wouldn't [[feel lonely in the crowd]]."),
   ("That's a difficult one.", "I'd say [[the library]], because I'd feel [[more comfortable with people I know]].", "I imagine [[the street]] would be [[far too noisy and busy]] for me, especially [[after a long day at school]].")) ),
 "entertainment": ("They show people spending their free time in different ways.", "Which of these would you rather do on a Saturday evening?", (
   ("I'd rather [[go to the cinema]].", "I imagine [[the big screen and the sound]] make [[a film far more exciting than at home]].", "Board games are fun, but I suppose they [[can take hours, and someone always gets angry when they lose]]!"),
   ("To be honest, I'd prefer [[a board game at home]].", "It's [[much cheaper than the cinema]], and you can [[actually talk to each other]].", "I suppose it depends on [[who you're with]], though. With [[the wrong people]], it could be [[a very long evening]]!"),
   ("I'd definitely choose [[the cinema]].", "I think going out is [[more special than staying in]], especially at the weekend.", "I imagine [[my family]] would rather [[stay at home]], but I'd [[try to convince them to come with me]].")) ),
 "shopping": ("They show people shopping in different places.", "Where do you prefer to go shopping?", (
   ("I prefer [[the local market]].", "I imagine [[the food]] is [[fresher than in a supermarket]], and [[the sellers]] are [[much friendlier]].", "I suppose [[a shopping centre]] is [[more practical]] when the weather's bad, though, because [[everything is inside]]."),
   ("To be honest, I'd rather go to [[a shopping centre]].", "Everything is [[in one place]], so it's [[much quicker than walking round a market]].", "I imagine [[markets]] are [[more fun for tourists who want to see local life]]."),
   ("That depends on [[what I'm buying]].", "For [[clothes]] I'd choose [[the shopping centre]], but for [[fruit and vegetables]] I'd say [[the market]] is [[far better]].", "I suppose I like [[a bit of both]], as long as [[it isn't too crowded]].")) ),
 "outdoor": ("They show people spending time outdoors.", "Which of these places would you prefer to visit?", (
   ("I'd rather go to [[the beach]].", "I imagine [[watching the sunset there]] would be [[really peaceful]], and it's [[much less tiring than climbing a mountain]]!", "I suppose I'm [[not very sporty]], so [[a long walk up a mountain]] isn't [[my idea of a holiday]]."),
   ("Personally, I'd prefer [[the mountains]].", "I think [[hiking]] is [[more of an adventure than lying on a beach]], and the views must be [[amazing]].", "I imagine I'd [[feel really proud when I reached the top]], and I'd [[sleep really well]] afterwards!"),
   ("That's a difficult one, because [[I love both]].", "I suppose [[the beach]] is [[more relaxing]], but [[the mountains]] would be [[more memorable]].", "I'd probably choose [[the hike]], as long as [[the weather was good and I had the right shoes]].")) ),
 "learning": ("They show people learning in different situations.", "Where do you find it easier to learn?", (
   ("I find it easier to learn [[at home]].", "It's [[much quieter than a classroom]], and I imagine I can [[ask my parents]] if I'm stuck.", "I suppose I [[concentrate better]] on my own, because [[nobody is chatting next to me]]."),
   ("To be honest, I learn better [[with other students]].", "I think explaining things to [[each other]] makes them [[clearer than reading alone]].", "I imagine I'd [[get bored]] studying at home all day, and I'd [[probably spend the time on my phone]]."),
   ("Well, I'd say it depends on [[the subject]].", "For [[maths]] I'd rather [[study with friends]], but for [[reading]] I'd say home is [[far better]].", "I suppose everyone [[learns in a different way]], so [[it's good to have both options]].")) ),
 "sports": ("They show people doing different kinds of exercise.", "Would you rather play a team sport or train on your own?", (
   ("I'd rather play [[a team sport]].", "I imagine training [[alone in a gym]] would be [[much more boring than playing with friends]].", "I suppose I need [[other people]] to [[motivate me]], and [[winning together]] feels [[much better than winning alone]]."),
   ("Personally, I'd prefer [[training on my own]].", "I can [[go whenever I want]], which is [[more flexible than team practice]].", "I imagine [[a team]] would also [[put more pressure on me]], because [[everyone expects you to play well]]."),
   ("That's a difficult one, to be honest.", "I suppose [[team sports]] are [[more fun]], but [[the gym]] is [[better for getting fit quickly]].", "I'd probably choose [[a team]], because [[I like the social side and making new friends]].")) ),
 "travel": ("They show people on different kinds of trips.", "Which kind of trip would you enjoy more?", (
   ("I'd enjoy [[the city trip]] more.", "I imagine [[the museums and the food]] would be [[far more interesting than walking for hours]].", "I suppose I'm [[a city person]]. I'd rather [[explore streets and cafés than sleep in a tent]]!"),
   ("To be honest, I'd prefer [[the nature trip]].", "I think [[being in the mountains]] is [[much more relaxing than a crowded city]].", "I imagine it would also be [[cheaper]], and [[a good chance to forget about my phone]]."),
   ("It depends on [[who I'm with]].", "With [[my family]] I'd choose [[the city]], but with [[friends]] I'd say [[an adventure]] would be [[more fun]].", "I suppose [[trying different things]] is the best part of travelling, so [[I'd happily do both]].")) ),
}
FBANK = ["That's a difficult one", "To be honest", "Personally", "I'd rather", "I'd prefer", "I'd definitely choose",
         "I'd choose", "I'd say", "I imagine", "I suppose", "It depends on", "That depends on", "though",
         "much more", "far more", "much less", "more", "than", "far better", "as long as", "I'd probably"]
FWHY = ["Choose, give one reason with a comparison, then add a second thought.",
        "Same shape: choose, compare, then look at the other side.",
        "Same shape again: 'It depends on…' is a good way in when you like both."]
for tk in T:
    theme, fq, alts = FOLLOW[tk["id"]]
    tk["theme"] = theme
    tk["followUp"] = fq
    for i, (x, a, r) in enumerate(alts):
        tk["alts"][i]["follow"] = {"why": FWHY[i], "segs": [{"m": "x", "t": x}, {"m": "a", "t": a}, {"m": "r", "t": r}]}

# ── plain teenage B2 (Oct 2026): the same rule as Part 1 ──
BANNED = ["Mind you", "Ha ", "Ooh", "Hmm", "Honestly?", "every chance", "freelancer", "immersive", "stamina", "de-stress",
          "push their limits", "chain stores", "bargain", "people-watching", "making a day", "under one roof", "teasing",
          "sold out", "switch", "invisible", "thrilling", "smoothly", "self-discipline which", "—", "all about"]
def plain(t, where):
    n = 0
    for b in BANNED:
        if b in t: print("BANNED", repr(b), where); n += 1
    for sent in re.split(r"(?<=[.!?;])\s+", t):
        if len(sent.split()) > 26: print("LONG", len(sent.split()), where, sent[:60]); n += 1
    return n

# ── build ──
def secs(t): return round(len([w for w in t.split() if re.search(r'[A-Za-z0-9]', w)])/2.5)
clean = lambda t: re.sub(r'\[\[(.*?)\]\]', r'\1', t)
blank = lambda t: re.sub(r'\[\[(.*?)\]\]', '___', t)
bad = 0
for tk in T:
    for i, alt in enumerate(tk["alts"]):
        fb = alt.get("follow")
        if fb:
            fb["frame"] = "\n".join(blank(s["t"]) for s in fb["segs"])
            for s in fb["segs"]:
                s["t"] = clean(s["t"]); s["marks"] = marks_for(s["t"], FBANK); bad += plain(s["t"], tk["id"] + " follow")
            fs = sum(secs(s["t"]) for s in fb["segs"])
            fok = 15 <= fs <= 30
            print(f"{'  ' if fok else '!!'} {tk['id']:14} {['Default','Alt 1','Alt 2'][i]:8} follow-up {fs}s")
            bad += not fok
        blk = alt["turn"]
        blk["frame"] = "\n".join(blank(s["t"]) for s in blk["segs"])
        for s in blk["segs"]:
            s["t"] = clean(s["t"]); s["marks"] = marks_for(s["t"]); bad += plain(s["t"], tk["id"] + " turn")
            if re.search(r"\bhere\b.*\bhere\b", s["t"]): print("HERE", tk["id"], i); bad += 1
        sec = [secs(s["t"]) for s in blk["segs"]]; tot = sum(sec)
        ok = 45 <= tot <= 56 and sec[2] >= 30
        print(f"{'  ' if ok else '!!'} {tk['id']:14} {['Default','Alt 1','Alt 2'][i]:8} sim {sec[0]:2}s  dif {sec[1]:2}s  spe {sec[2]:2}s  = {tot}s")
        bad += not ok

D = {
 "version": 5, "part": 2,
 "title": "Speaking Part 2 — one pair of photos, one card",
 "note": ("Eight photo pairs. The minute in three chunks — Similarities, Differences, Speculating — on the school frame. "
          "Default, Alternative 1 and Alternative 2 keep the frame and rotate the key expressions. Built by build-part2.py."),
 "tip": "One sentence of similarities, one of differences — then spend the rest of the minute speculating to answer the question.",
 "modes": {"turn": {"label": "1 minute", "limit": 60, "band": [50, 60], "order": ["sim", "dif", "spe"]},
           "follow": {"label": "Your partner's question", "limit": 30, "band": [15, 30], "order": ["x", "a", "r"]}},
 "moves": {
  "sim": {"name": "Similarities", "hint": "one or two sentences: what the pictures share", "ask": "Start with the similarities."},
  "dif": {"name": "Differences", "hint": "one sentence with 'while', 'whereas' or 'by contrast'", "ask": "Now the difference — in one sentence."},
  "x": {"name": "Choose", "hint": "say which one, straight away", "ask": "Start by choosing."},
  "a": {"name": "Compare", "hint": "one reason, with a comparison: 'much more … than'", "ask": "Now give a reason — compare the two."},
  "r": {"name": "Add", "hint": "a second thought: 'I suppose…', 'I imagine…'", "ask": "Now add one more thought."},
  "spe": {"name": "Speculating", "hint": "answer the question for each picture — guess, don't describe", "ask": "Now speculate: answer the question for each picture."}
 },
 "voices": [{"id": "default", "tab": "Default", "fem": True}, {"id": "alt1", "tab": "Alternative 1", "fem": False},
            {"id": "alt2", "tab": "Alternative 2", "fem": True}],
 "tasks": T,
 "phraseBank": [
  {"heading": "1 · Similarities — opening", "note": "One or two sentences, then move on.",
   "phrases": ["I feel that in many ways the two pictures are similar.", "Both pictures show…", "In both pictures we can see…",
               "There are obvious similarities between the two photos.", "The common theme in both pictures is…",
               "What they have in common is that…"]},
  {"heading": "1 · Similarities — detail", "note": "",
   "phrases": ["Similarly, in the second picture…", "Likewise, the other picture shows…", "Just like in the first picture, the second one also…",
               "In the same way…", "Neither picture shows…", "Both of them seem to be…"]},
  {"heading": "2 · Differences — opening", "note": "One sentence with a contrast word is enough.",
   "phrases": ["While the first picture shows…, the second picture shows…", "The first picture shows…; by contrast, the second picture shows…",
               "Whereas the first image is…, the second is…", "However, there are some clear differences.",
               "On the other hand, the second picture is quite different.", "The main difference is that…", "One major contrast is…"]},
  {"heading": "2 · Differences — detail", "note": "",
   "phrases": ["Unlike the first picture, the second one…", "In contrast to the first photo, which looks…, the second looks…",
               "The people in the first picture are… but in the second they are…"]},
  {"heading": "3 · Speculating — the heart of your minute", "note": "Don't just describe — guess. This is where your best grammar shows.",
   "phrases": ["Starting with the first picture, it looks as if…", "It looks as if… / It looks like…", "It seems as though…",
               "It is likely that…", "I imagine that…",
               "Probably… / Perhaps… / Maybe…"]},
  {"heading": "3 · Speculating — people, feelings, situation", "note": "",
   "phrases": ["They look as if they are enjoying themselves.", "She might be… / He might be feeling…", "They could be on holiday / at work / with family.",
               "She must be very… because…", "They can't be at home, because…", "They might have… / They must have…",
               "I would say they are…", "My guess is that they are…"]},
  {"heading": "3 · Speculating — structures examiners love", "note": "",
   "phrases": ["They seem to be …-ing", "They look like they are …-ing", "They are likely to be…", "It's possible that…",
               "I get the impression that…", "…is not only… but also…"]}
 ]
}
json.dump(D, open(sys.argv[1] if len(sys.argv) > 1 else "part2-turn.json", "w"), ensure_ascii=False, indent=1)
print("bad:", bad)
