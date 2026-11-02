# MASTER · PART 2 — the B2 rewrite (2 Nov 2026)
#
# Why: the October set was correct but read B1. 110 of 163 items were ten words or fewer,
# only 8 had more than one clause, and the words tested did not follow the 24 real papers
# (which 14 gaps there, 2 items here; what 8 → 1; if 12 → 3; into 5 → 0; but 4 → 0), while
# 32 items tested Part 1 vocabulary (collocations, particles of known phrasal verbs).
#
# What this does:
#  · every item becomes a short text (one or two sentences, B2 vocabulary) in which the
#    gap is decided by its context; ids and answer keys are kept wherever the point is
#    the same, so a learner's Ring history still lines up
#  · fixed phrases are gapped on the grammar word (___ the other hand → on), as Part 2 does
#  · eleven collocation items move to Master · Part 1 (their options already make a
#    four-way multiple choice); they leave Part 2
#  · new items fill the words the real papers test most
#  · alternatives were checked for every gap: `alt` = also right, `o` = always wrong there
# Writes master-part2.json, the Part 2 Board (challenge-uoe-part2.json), and appends the
# moved items to master-part1.json and the Part 1 Board.
import json,os,random
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')+'/'
I=[]
def it(id,tab,typ,s,a,alt,o,why): I.append({'id':id,'tab':tab,'type':typ,'s':s,'a':a,'alt':alt,'o':o,'why':why})

# ── PREPOSITIONS ─────────────────────────────────────────────────────────
it('p2-p1','prep','prep','Mia has always been brilliant ___ anything involving numbers, so nobody was surprised when she chose to study engineering.','at',['with'],['in','on','for'],'Brilliant / good at something. Good with numbers is also right.')
it('p2-p2','prep','prep','After months of planning, we are really looking forward ___ finally getting on the plane.','to',[],['for','at','on'],'Look forward to + -ing: to is a preposition here, so the verb takes -ing.')
it('p2-p3','prep','prep','Daniel arrived forty minutes after the start. He apologised ___ keeping everyone waiting and blamed the traffic.','for',[],['about','of','to'],'Apologise for (doing) something.')
it('p2-p4','prep','prep','Whether we hold the barbecue in the garden or not will depend ___ the weather on the day.','on',['upon'],['of','in','from'],'Depend on (or upon).')
it('p2-p5','prep','prep','Although the team lost the final, the coach said she had never been prouder ___ her players.','of',[],['for','with','about'],'Proud of — and prouder of.')
it('p2-p6','prep','prep','Nobody in the office was surprised ___ the news that Alex had resigned; he had been unhappy for months.','at',['by'],['of','for','on'],'Surprised at or by.')
it('p2-p7','prep','prep','We have already missed the last train, so there is no point ___ rushing to the station now.','in',[],['of','for','to'],'There is no point in + -ing.')
it('p2-p8','prep','prep','Lucy has become increasingly interested ___ Japanese culture since her trip to Kyoto, and she is now learning the language.','in',[],['on','for','about'],'Interested in.')
it('p2-p9','prep','prep','The airline has still not given passengers a reason ___ the delay, which has left hundreds of them stranded.','for',[],['of','about','to'],'A reason for something.')
it('p2-b26','prep','prep','Many people who are afraid ___ flying find that the fear disappears once they understand how planes work.','of',[],['from','about','for'],'Afraid of.')
it('p2-b27','prep','prep','In spite ___ the rain, thousands of fans stayed until the very end of the concert.','of',[],['from','to','for'],'In spite of + noun phrase (despite has no of).')
it('p2-b28','prep','prep','The final was postponed because ___ the storm, which had flooded part of the stadium.','of',[],['to','by','for'],'Because of + noun phrase. Because alone needs a clause.')
it('p2-b29','prep','prep','Why not cycle to work instead ___ sitting in traffic every morning? It is cheaper, and you will get some exercise too.','of',[],['to','for','from'],'Instead of + -ing.')
it('p2-b30','prep','prep','The town is famous ___ its seafood, so make sure you try the local fish while you are there.','for',[],['of','about','with'],'Famous for.')
it('p2-b31','prep','prep','I have not heard from Sara ___ almost a month. I hope nothing has happened to her.','for',['in'],['since','during','from'],'For + a length of time (in also works after a negative).')
it('p2-b32','prep','prep','At first glance, the new logo looks very similar ___ the old one, but the colours are slightly brighter.','to',[],['with','as','from'],'Similar to.')
it('p2-b33','prep','prep','In addition ___ her full-time job, Rosa volunteers at an animal shelter every weekend.','to',[],['with','of','for'],'In addition to + noun or -ing.')
it('p2-b34','prep','prep','I was introduced ___ my future business partner at a friend’s wedding, of all places.','to',[],['with','at','for'],'Introduce someone to someone.')
it('p2-b35','prep','prep','Before you start the course, it helps to be familiar ___ the basic vocabulary of economics.','with',[],['to','of','about'],'Familiar with something you know. (Something is familiar to you.)')
it('p2-b36','prep','prep','The bridge, which was designed ___ a team of young engineers, has won several international awards.','by',[],['from','of','with'],'By + the agent in a passive sentence.')
it('p2-b37','prep','prep','Strong winds prevented the ferry ___ leaving the harbour, so we spent an extra night on the island.','from',[],['of','to','for'],'Prevent someone / something from + -ing.')
it('p2-b38','prep','prep','___ to a recent survey, most teenagers spend more than four hours a day online.','according',[],['owing','due','thanks'],'According to + a source of information.')
it('p2-b39','prep','prep','___ from a few minor delays, the whole trip went exactly as we had planned.','apart',['aside'],['except','besides','away'],'Apart from means except for.')
it('p2-b40','prep','prep','My grandmother worries ___ everything, from the weather to whether we are eating properly.','about',['over'],['of','on','with'],'Worry about.')
it('p2-b41','prep','prep','After two years of general medicine, Dr Khan decided to specialise ___ children’s heart conditions.','in',[],['on','at','for'],'Specialise in.')
it('p2-n01','prep','prep','The old cinema in the town centre is going to be turned ___ a modern arts centre next year.','into',[],['to','in','for'],'Turn something into something: a change of form.')
it('p2-n02','prep','prep','We had only just set off when we ran ___ some old friends we had not seen for years.','into',['across'],['onto','to','at'],'Run into (or across) someone: meet them by chance.')
it('p2-n03','prep','prep','Some students find it hard to cope ___ the pressure of exams, so the school now offers relaxation classes.','with',[],['for','about','of'],'Cope with.')
it('p2-n04','prep','prep','The price of a ticket has gone up ___ five euros, from twenty to twenty-five.','by',[],['of','with','at'],'By + the size of a change: up by five euros.')
it('p2-n05','prep','prep','The flight was full, so we were lucky to get seats at all, let alone seats next ___ each other.','to',[],['by','with','of'],'Next to.')

# ── LINKERS ──────────────────────────────────────────────────────────────
it('p2-l1','link','link','___ the hotel was a long way from the beach, we really enjoyed our stay there.','although',['though','while','whilst'],['despite','however','because'],'Although + a full clause.')
it('p2-l2','link','link','The match went ahead ___ the heavy rain, and both teams played remarkably well.','despite',[],['although','however','because'],'Despite + a noun phrase. Although needs a clause.')
it('p2-l3','link','link','Could you text me as soon ___ you land? I want to know you have arrived safely.','as',[],['so','than','that'],'As soon as.')
it('p2-l4','link','link','Many students take a part-time job in ___ to pay for their studies.','order',[],['case','place','time'],'In order to + infinitive: purpose.')
it('p2-l5','link','link','The children were not allowed to leave the table ___ everyone had finished eating.','until',['till','before'],['unless','during','since'],'Until gives the time when something changes.')
it('p2-l6','link','link','The flat is in a great location; ___, it is far too expensive for a student like me.','however',['nevertheless','nonetheless','still','yet','unfortunately','sadly'],['therefore','moreover','although'],'However links two contrasting ideas and takes a comma.')
it('p2-l7','link','link','We will miss the start of the film ___ we leave in the next five minutes.','unless',[],['if','until','when'],'Unless means if not.')
it('p2-b01','link','link','I have emailed the museum to ask ___ students can get a discount on weekdays.','if',['whether'],['that','what','which'],'If or whether introduces an indirect yes/no question.')
it('p2-b02','link','link','He walked into the meeting an hour late and sat down as ___ nothing had happened.','though',['if'],['soon','well','long'],'As though or as if + past perfect for an unreal comparison.')
it('p2-b03','link','link','The course teaches practical cooking skills as ___ as the basics of nutrition.','well',[],['good','soon','long'],'As well as means and also.')
it('p2-b04','link','link','Some of my classmates love living in the city, ___ others cannot wait to move back to the countryside.','while',['whereas','whilst','but'],['despite','however','unless'],'While or whereas shows a contrast between two groups.')
it('p2-b05','link','link','The guide spoke slowly and clearly ___ that everyone in the group could follow her.','so',[],['such','in','as'],'So that + clause shows purpose.')
it('p2-b06','link','link','Pack a warm jumper in ___ the evenings get cold. It is often windy up in the mountains.','case',[],['order','time','spite'],'In case + clause: as a precaution.')
it('p2-b07','link','link','You are welcome to borrow my camera as ___ as you promise to look after it.','long',[],['well','far','much'],'As long as means on condition that.')
it('p2-b08','link','link','Make sure you book a table in advance; ___, you might not get a seat on a Saturday night.','otherwise',[],['however','therefore','instead'],'Otherwise means if you do not.')
it('p2-b09','link','link','The storm meant we could not go to the beach, so we visited the aquarium ___.','instead',[],['however','therefore','besides'],'Instead at the end means in place of the thing just mentioned.')
it('p2-b10','link','link','I am not going to change my mind about the job, even ___ they offer me more money.','if',['though'],['so','when','as'],'Even if + a possible future situation.')
it('p2-b11','link','link','I still cannot decide ___ to study medicine or law next year.','whether',[],['if','what','which'],'Whether + to-infinitive. If cannot be used here.')
it('p2-b12','link','link','___ hard I try, I can never remember people’s names at parties.','however',[],['although','whatever','even'],'However + adjective or adverb means no matter how.')
it('p2-b13','link','link','It was not ___ I got home that I realised I had left my laptop on the train.','until',['till'],['when','since','before'],'Not until marks the point when something first happened.')
it('p2-s6','link','struct','The interviewer asked me ___ I had ever worked in a team before.','if',['whether'],['that','what','which'],'Reported yes/no question: if or whether.')
it('p2-n06','link','link','___ I had known how busy the restaurant would be, I would have booked a table.','if',[],['when','unless','as'],'Third conditional: if + past perfect, would have + past participle.')
it('p2-n07','link','link','Call me at any time ___ you need anything — even in the middle of the night.','if',['whenever','when'],['unless','though','despite'],'If (or whenever) introduces the condition.')
it('p2-n09','link','link','Not only did the new manager reduce costs, ___ she also improved staff morale.','but',[],['and','so','yet'],'Not only … but (also).')
it('p2-n10','link','link','___ the youngest of five children, Leo had to learn to stand up for himself from an early age.','as',['being'],['like','for','since'],'As here means in the role or position of.')
it('p2-n11','link','link','I had hardly closed my eyes ___ the phone started ringing.','when',['before'],['than','then','while'],'Hardly … when (no sooner … than is the matching pair).')

# ── AUXILIARIES AND STRUCTURES ───────────────────────────────────────────
it('p2-s1','aux','struct','I wish I ___ more free time during the week; I hardly ever get to see my friends.','had',[],['have','has','did'],'Wish + past simple for a present regret.')
it('p2-s3','aux','struct','That cough sounds terrible. You ___ better see a doctor before it gets any worse.','had',[],['would','should','have'],'Had better + bare infinitive: strong advice.')
it('p2-s4','aux','struct','It was an unforgettable day for Sara. Not only ___ she win the race, but she also broke the national record.','did',[],['had','was','does'],'Inversion after not only needs an auxiliary.')
it('p2-s5','aux','struct','The kitchen window ___ broken by a football during the match last night, so it has to be replaced.','was',['got'],['has','had','is'],'Passive, past simple: was + past participle.')
it('p2-a01','aux','aux','By the time we finally found the cinema, the film ___ already started.','had',[],['has','was','did'],'Past perfect: finished before another past action.')
it('p2-a02','aux','aux','A new bridge has ___ built across the river to reduce traffic in the town centre.','been',[],['being','be','was'],'Present perfect passive: has been + past participle.')
it('p2-a03','aux','aux','The names of the winners will ___ announced at the end of the ceremony.','be',[],['being','been','are'],'Future passive: will be + past participle.')
it('p2-a04','aux','aux','Most teenagers hate ___ told what to do, especially by their parents.','being',[],['been','be','having'],'Passive gerund: being + past participle, after verbs like hate and avoid.')
it('p2-a05','aux','aux','I ___ not realise how late it was until I looked at my phone and saw five missed calls.','did',[],['was','have','am'],'Past simple negative: did not + base verb.')
it('p2-a06','aux','aux','Leo enjoys swimming, and so ___ his younger brother, who trains every morning before school.','does',[],['is','has','do'],'So + auxiliary + subject. Enjoys → so does.')
it('p2-a07','aux','aux','My grandfather ___ to be a fisherman before he opened his restaurant by the harbour.','used',[],['would','was','did'],'Used to for past states. Would cannot be used for states like be.')
it('p2-a08','aux','aux','It ___ have been Tom who called you this morning. He is on a plane to Brazil right now.','cannot',['can’t','couldn’t'],['must','might','should'],'Cannot have + past participle: you are sure it was impossible.')
it('p2-a09','aux','aux','I should ___ listened to my parents when they told me to start revising earlier.','have',[],['had','be','has'],'Should have + past participle: a past mistake.')
it('p2-a10','aux','aux','The restaurant was so busy yesterday that we ___ to wait an hour for a table.','had',[],['must','have','should'],'The past of have to is had to. Must has no past form.')
it('p2-a11','aux','aux','All the players ___ been asked to bring their passports, so please check that you have yours.','have',[],['has','are','were'],'Present perfect passive with a plural subject: have been asked.')
it('p2-a12','aux','aux','By this time next year, I ___ have finished my degree and started my first job.','will',['shall','should','may','might'],['did','had','must'],'Future perfect: will have + past participle.')
it('p2-a13','aux','aux','Little ___ she know that her friends had organised a surprise party for her.','did',[],['had','was','does'],'Negative adverbials such as little, never and hardly are followed by inversion.')
it('p2-n12','aux','struct','The tickets sold out in less than an hour, and so ___ the extra dates they added the next day.','did',[],['are','had','have'],'So + auxiliary + subject. Sold → so did.')
it('p2-n14','aux','struct','___ I known about the strike, I would have taken a taxi to the airport.','had',[],['have','if','did'],'Had I known = If I had known. The inversion replaces if.')
it('p2-n15','aux','aux','When we were children, our grandmother ___ tell us a story every night before bed.','would',[],['was','did','had'],'Would for repeated past actions. (Used would need two words: used to tell.)')
it('p2-n16','aux','aux','I would rather ___ go to the party if Lucy is not going to be there.','not',[],['no','to','don’t'],'Would rather + not + base verb.')
it('p2-n17','aux','aux','You did not need to bring a present — but it is lovely, thank you! You really should not ___.','have',[],['had','be','to'],'Should not have (brought it): the participle is left out because it is clear.')

# ── PRONOUNS AND RELATIVES ───────────────────────────────────────────────
it('p2-r1','pron','rel','The student ___ sits next to me in maths has just moved here from Canada.','who',['that'],['which','whose','whom'],'Who (or that) for people as the subject.')
it('p2-r2','pron','rel','We had a long chat with a neighbour ___ son plays for the national team.','whose',[],['who','which','whom'],'Whose shows possession.')
it('p2-r3','pron','rel','Sintra is the town ___ my parents first met, so we go back there every summer.','where',[],['which','when','what'],'Where for places, when a full clause follows.')
it('p2-r4','pron','rel','Our flight was cancelled at the last minute, ___ meant we had to spend the night at the airport.','which',[],['that','what','it'],'Which after a comma refers back to the whole idea before it.')
it('p2-r5','pron','rel','I will never forget the day ___ I passed my driving test. I drove around for hours!','when',['that'],['which','where','what'],'When for times.')
it('p2-a14','pron','pron','Nobody showed Tom how to play the guitar; he taught ___ by watching videos online.','himself',[],['him','his','itself'],'Reflexive pronoun: the subject and the object are the same person.')
it('p2-a15','pron','pron','Did you two enjoy ___ at the festival? You both look exhausted!','yourselves',[],['yourself','you','ourselves'],'Enjoy + reflexive pronoun. You two → yourselves.')
it('p2-a16','pron','pron','Although they live on opposite sides of the world, the two cousins speak to each ___ every day.','other',[],['another','one','others'],'Each other: a reciprocal pronoun.')
it('p2-a17','pron','pron','___ is often said that first impressions are the ones that count.','it',[],['there','this','which'],'It is said that … : it stands for the that-clause.')
it('p2-a18','pron','pron','___ used to be a cinema on this corner, but it closed down when I was a child.','there',[],['it','this','here'],'There + be introduces something that existed.')
it('p2-a19','pron','pron','My laptop finally stopped working last week, so I have had to buy a new ___.','one',[],['it','that','ones'],'One replaces a countable noun when it is a different thing.')
it('p2-a20','pron','rel','The museum, ___ opened in 1998, attracts thousands of visitors every year.','which',[],['that','who','what'],'After a comma (non-defining clause) use which, not that.')
it('p2-a21','pron','rel','The receptionist to ___ I spoke was extremely helpful and found us a better room.','whom',[],['who','which','that'],'Preposition + whom for people.')
it('p2-a22','pron','pron','___ surprised me most about the city was how friendly everyone was.','what',[],['that','which','it'],'What means the thing that.')
it('p2-a23','pron','pron','I felt so ill that I did not eat ___ for the whole day.','anything',['much'],['nothing','something','none'],'Anything in negative sentences. Nothing would make a double negative.')
it('p2-a24','pron','pron','Group projects are popular with students because they allow ___ to learn from each other.','them',[],['they','their','it'],'Object pronoun after allow.')
it('p2-a25','pron','pron','The city is famous for ___ ancient walls, which were built by the Romans.','its',[],['it’s','their','his'],'Its, with no apostrophe, is the possessive of it.')
it('p2-n20','pron','pron','I find ___ difficult to concentrate when there is music playing in the background.','it',[],['this','that','very'],'Find it + adjective + to-infinitive: it stands for the infinitive.')
it('p2-n21','pron','pron','Of all the films I saw this year, the ___ I enjoyed most was a small Iranian drama.','one',[],['it','that','which'],'The one = the film.')
it('p2-n22','pron','pron','Nobody really knows ___ happened to the ship after it left the harbour in 1872.','what',[],['that','which','whose'],'What = the thing that.')
it('p2-n23','pron','pron','Now that she is eighteen, Ana would love a flat of her ___.','own',[],['self','alone','one'],'Of your own.')
it('p2-n24','pron','rel','Anyone ___ wants to join the trip should sign up by Friday.','who',['that'],['which','whose','whom'],'Anyone who … : who for people.')
it('p2-n25','pron','pron','I would appreciate ___ if you could reply by the end of the week.','it',[],['this','that','you'],'Appreciate it if … : it stands for the if-clause.')
it('p2-n26','pron','rel','Many of the people ___ I interviewed had never travelled abroad.','whom',['who','that'],['which','whose','what'],'Object of the relative clause: whom, who or that.')

# ── QUANTITY ─────────────────────────────────────────────────────────────
it('p2-q1','quant','quant','Can you get some milk on your way home? There is not ___ left in the fridge.','any',['much'],['some','no','none'],'Not any: any in negatives. Milk is uncountable.')
it('p2-q2','quant','quant','Very ___ people turned up to the meeting, so it was postponed until next week.','few',[],['little','many','much'],'Very few + countable noun: almost none.')
it('p2-q3','quant','quant','We do not have ___ time left, so let us focus on the most important points.','much',['enough','any'],['many','lot','few'],'Much with uncountable nouns in negatives.')
it('p2-q4','quant','quant','I tried both of the shortcuts you suggested, but ___ of them worked.','neither',[],['none','either','both'],'Neither is for two things.')
it('p2-q5','quant','quant','I invited six friends to my party, but ___ of them could come, so I celebrated with my family instead.','none',[],['neither','any','no'],'None is for more than two.')
it('p2-q6','quant','quant','At sixteen, you are not old ___ to vote, but you can get a part-time job.','enough',[],['so','too','as'],'Enough comes after the adjective.')
it('p2-a26','quant','det','We visited four countries in two weeks, and ___ one was completely different from the last.','each',['every'],['all','any','both'],'Each or every + one, for the members of a group taken separately.')
it('p2-a27','quant','det','We have not quite finished the exercise. Could we have ___ ten minutes, please?','another',[],['other','more','else'],'Another + number + plural noun means that many more.')
it('p2-a28','quant','det','Some people relax by doing sport, while ___ prefer to read or watch films.','others',['some','many'],['other','another','the'],'Others means other people. No noun follows.')
it('p2-a29','quant','det','I have two brothers, and ___ of them work in IT, like my father.','both',[],['all','either','each'],'Both of + plural pronoun, for two people.')
it('p2-a30','quant','det','I spent the ___ weekend revising for my biology exam, so I did not go out once.','whole',['entire'],['all','every','full'],'The whole + singular noun.')
it('p2-a31','quant','det','It rained ___ day yesterday, so we stayed indoors and played board games.','all',[],['whole','every','each'],'All day means from morning to night.')
it('p2-a32','quant','det','Who would you say is ___ best player in your team at the moment?','the',[],['a','most','more'],'The before a superlative.')
it('p2-a33','quant','det','Hardly ___ students signed up for the trip, so the school had to cancel it.','any',[],['some','no','many'],'Hardly any means almost none.')
it('p2-a34','quant','det','There is not ___ point in complaining now; the decision has already been made.','much',['any'],['many','some','no'],'Not much or not any with uncountable nouns.')
it('p2-a35','quant','det','I have made ___ few friends since I moved here, so I do not feel lonely any more.','a',[],['the','some','very'],'A few is positive (some). Few alone is negative (hardly any).')
it('p2-a36','quant','det','___ four years, the Olympic Games are held in a different country.','every',[],['each','all','any'],'Every + number + plural noun for regular intervals.')
it('p2-a37','quant','det','I have ___ idea where I left my keys. Have you seen them anywhere?','no',[],['not','none','any'],'No idea. Not and none cannot go directly before a noun.')
it('p2-n30','quant','det','The buses run ___ twenty minutes during the week, but less often at weekends.','every',[],['each','all','any'],'Every + number + plural noun for regular intervals.')
it('p2-n31','quant','det','After ___ the effort she had put into her project, she deserved to win first prize.','all',[],['every','whole','each'],'All the + noun.')
it('p2-n32','quant','quant','Most ___ the people I spoke to at the conference had travelled from abroad.','of',[],['from','for','with'],'Most of the + plural noun.')
it('p2-n33','quant','det','Once ___ week, the whole family gets together for lunch at my grandmother’s house.','a',['every','per'],['the','one','all'],'Once a week: a means each here.')
it('p2-n34','quant','det','The two teams scored three goals ___, so the match went to penalties.','each',[],['every','both','all'],'Each after a number: three goals for every team.')
it('p2-n35','quant','det','There is ___ doubt that the internet has changed the way we learn.','no',['little'],['not','none','any'],'There is no doubt that … .')

# ── COMPARISON ───────────────────────────────────────────────────────────
it('p2-b14','comp','comp','Martin was ___ tired after the night shift that he fell asleep on the bus home.','so',[],['such','too','enough'],'So + adjective + that + result.')
it('p2-b15','comp','comp','It was ___ a beautiful evening that we decided to eat outside.','such',[],['so','too','very'],'Such + a + adjective + noun + that + result.')
it('p2-b16','comp','comp','I was far ___ shocked by the news to say anything at all.','too',[],['so','very','much'],'Too + adjective + to-infinitive.')
it('p2-b17','comp','comp','The concert was far better ___ any of us had expected.','than',[],['then','as','that'],'Comparative + than. Watch the spelling: than, not then.')
it('p2-b18','comp','comp','My new phone is not nearly as fast ___ my old one was, which is really frustrating.','as',[],['so','than','like'],'Not (nearly) as + adjective + as.')
it('p2-b19','comp','comp','The more you practise speaking, ___ more confident you will feel in the exam.','the',[],['a','much','so'],'The + comparative, the + comparative.')
it('p2-b20','comp','comp','The longer we waited for news, the ___ anxious we became.','more',[],['most','much','very'],'The + comparative, the + comparative. Anxious takes more.')
it('p2-b21','comp','comp','This is by far the ___ challenging course I have ever taken.','most',['least'],['more','very','much'],'By far + superlative.')
it('p2-b22','comp','comp','The new model is ___ more expensive than the old one, but it is also much faster.','much',['far','even','still','slightly','considerably','significantly'],['very','too','so'],'Much, far, even or still can strengthen a comparative. Very cannot.')
it('p2-b23','comp','comp','No sooner had we sat down at our table ___ the waiter brought us the menu.','than',[],['when','then','that'],'No sooner … than. Hardly … when is the matching pair.')
it('p2-b24','comp','comp','Doctors recommend that we eat ___ sugar and more vegetables.','less',[],['fewer','lower','least'],'Less with uncountable nouns. Fewer is for countable nouns.')
it('p2-b25','comp','comp','There were so ___ people at the concert that we could hardly move.','many',[],['much','lot','more'],'So many + countable noun + that + result.')
it('p2-n40','comp','comp','The film was so long ___ half the audience had fallen asleep before the end.','that',[],['as','than','which'],'So + adjective + that + result.')
it('p2-n41','comp','comp','Try to get here as early ___ you can — the best seats go very quickly.','as',[],['than','so','that'],'As + adverb + as you can.')

# ── PHRASES: fixed phrases, phrasal verbs, verb patterns ─────────────────
it('p2-f1','phrase','fixed','It took me a while, but I eventually got used ___ driving on the left.','to',[],['for','with','at'],'Get used to + -ing.')
it('p2-f2','phrase','fixed','To be honest, I would rather stay at home ___ go out in this weather.','than',[],['then','that','to'],'Would rather … than.')
it('p2-f3','phrase','fixed','As far ___ I am concerned, the new timetable is a big improvement.','as',[],['so','like','long'],'As far as I am concerned: in my opinion.')
it('p2-f4','phrase','fixed','Maria has been working at the hospital ___ she finished her degree in 2019.','since',[],['for','from','during'],'Since + the starting point, with the present perfect.')
it('p2-f5','phrase','fixed','I am sure he did not break your phone ___ purpose; it just slipped out of his hand.','on',[],['by','for','with'],'On purpose = deliberately.')
it('p2-v1','phrase','pv','Could you look ___ my cat while I am on holiday? She only needs feeding twice a day.','after',[],['into','at','up'],'Look after = take care of.')
it('p2-v2','phrase','pv','The outdoor concert was called ___ at the last minute because of a storm warning.','off',[],['out','up','away'],'Call off = cancel.')
it('p2-v3','phrase','pv','She grew ___ in a small fishing village, which is why she still loves the sea.','up',[],['out','over','off'],'Grow up.')
it('p2-v4','phrase','pv','We ran ___ of petrol on the motorway and had to walk two kilometres to a garage.','out',[],['off','away','down'],'Run out of = have none left.')
it('p2-c02','phrase','pv','We set ___ at dawn so that we would reach the top of the mountain before midday.','off',['out'],['up','down','over'],'Set off (or out) = start a journey.')
it('p2-c03','phrase','pv','Scientists have carried ___ a series of tests on the new vaccine, and the results are promising.','out',[],['off','up','away'],'Carry out tests, research, a survey.')
it('p2-c04','phrase','pv','Although the forecast was terrible, the weather turned ___ to be perfect for our picnic.','out',[],['up','off','over'],'Turn out to be = prove to be in the end.')
it('p2-c05','phrase','pv','After years of trying, my uncle finally managed to give ___ smoking.','up',[],['out','off','away'],'Give up = stop doing.')
it('p2-c06','phrase','pv','While tidying the attic, I came ___ some old photos of my grandparents’ wedding.','across',['upon'],['along','over','through'],'Come across = find by chance.')
it('p2-c07','phrase','pv','Could you find ___ what time the museum opens on Sundays?','out',[],['up','off','over'],'Find out = discover information.')
it('p2-c08','phrase','pv','If you keep spending money like that, you will end ___ with nothing left by the end of the month.','up',[],['out','off','in'],'End up = find yourself in a situation at the end.')
it('p2-c09','phrase','pv','The manager promised to deal ___ our complaint as soon as possible.','with',[],['on','by','at'],'Deal with.')
it('p2-c10','phrase','pv','I get ___ really well with my new flatmates, which makes sharing a kitchen much easier.','on',['along'],['up','off','by'],'Get on (or along) with someone.')
it('p2-c11','phrase','pv','Nothing can make ___ for all the time we lost while the train was delayed.','up',[],['out','off','over'],'Make up for = compensate for.')
it('p2-c12','phrase','pv','I cannot put up ___ this noise any longer — I am going to speak to the neighbours.','with',[],['to','for','on'],'Put up with = tolerate.')
it('p2-c13','phrase','fixed','The train is quicker. ___ the other hand, the bus is much cheaper.','on',[],['in','at','by'],'On the other hand introduces the opposite point.')
it('p2-c14','phrase','fixed','We talked about going away for the weekend, but in the ___ we decided to stay at home.','end',[],['finish','last','close'],'In the end = finally, after some time.')
it('p2-c15','phrase','fixed','___ first, I found the city overwhelming, but after a few weeks I felt completely at home.','at',[],['in','on','by'],'At first = in the beginning (before a change).')
it('p2-c16','phrase','fixed','The factory closed last year. ___ a result, hundreds of people lost their jobs.','as',[],['for','in','by'],'As a result.')
it('p2-c17','phrase','fixed','There were a few problems with the hotel, but ___ the whole we had a wonderful holiday.','on',[],['in','at','by'],'On the whole = generally.')
it('p2-c18','phrase','fixed','___ the way, did you remember to buy the tickets for Saturday?','by',[],['on','in','for'],'By the way introduces a new topic.')
it('p2-c19','phrase','fixed','I cannot come to the party. I have too much work and, ___ any case, I do not really feel well.','in',[],['on','at','by'],'In any case = anyway.')
it('p2-c20','phrase','fixed','You are welcome to stay with us ___ the time being, until you find a flat of your own.','for',[],['in','at','on'],'For the time being = for now.')
it('p2-c21','phrase','fixed','Your table will be ready in about ten minutes. ___ the meantime, can I get you something to drink?','in',[],['at','on','for'],'In the meantime = while you wait.')
it('p2-c22','phrase','fixed','Some birds, ___ instance, can sleep while they are flying.','for',[],['as','in','by'],'For instance = for example.')
it('p2-c23','phrase','fixed','I am so sorry about your vase. I knocked it over ___ accident when I was cleaning.','by',[],['on','with','in'],'By accident = not on purpose.')
it('p2-s2','phrase','struct','The students were made ___ rewrite the whole essay because they had copied it from the internet.','to',[],['for','that','of'],'Passive of make takes a to-infinitive.')
it('p2-c34','phrase','verb','My brother suggested ___ we should leave early to avoid the traffic.','that',[],['to','for','if'],'Suggest that + clause (never suggest to do).')
it('p2-c35','phrase','verb','She finally admitted that it ___ been her who broke the window.','had',[],['is','was','did'],'Reported past: it had been her.')
it('p2-c36','phrase','verb','The new president is said ___ be very popular with young voters.','to',[],['for','that','by'],'Be said to + infinitive.')
it('p2-c37','phrase','verb','My parents have always encouraged me ___ follow my dreams, even when they seemed unrealistic.','to',[],['for','that','of'],'Encourage someone to do something.')
it('p2-c38','phrase','verb','He promised me ___ he would never be late again — but he was late the very next day.','that',[],['what','if','to'],'Promise (someone) that + clause.')
it('p2-c40','phrase','verb','We left very early so ___ not to get stuck in the rush-hour traffic.','as',[],['that','to','much'],'So as not to + infinitive: negative purpose.')
it('p2-c41','phrase','verb','Please do not hesitate ___ contact me if you have any questions.','to',[],['for','of','on'],'Hesitate to do something.')
it('p2-c42','phrase','verb','Personally, I prefer spending time outdoors ___ sitting in front of a screen.','to',['over'],['than','from','for'],'Prefer A to B.')
it('p2-c43','phrase','verb','Even though we offered to split the bill, he insisted ___ paying for everyone.','on',[],['in','at','for'],'Insist on + -ing.')
it('p2-n08','phrase','fixed','The room had nothing ___ a small bed and a broken lamp, so we left the next morning.','but',['except'],['than','only','more'],'Nothing but = only.')
it('p2-n50','phrase','fixed','The trip was ___ from perfect: it rained every day and our luggage got lost.','far',[],['away','long','much'],'Far from perfect = not at all perfect.')
it('p2-n51','phrase','fixed','I did not enjoy the film ___ all; in fact, I left before the end.','at',[],['in','on','for'],'Not … at all = not in any way.')
it('p2-n52','phrase','fixed','Do not worry about the money. You can pay me back ___ you like — there is no hurry.','whenever',['when'],['unless','although','until'],'Whenever = at any time.')

# ── MORE OF WHAT THE PAPERS TEST MOST (which, what, so, the, one, all, a, into) ──
it('p2-m01','pron','rel','She told us she had never been abroad, ___ surprised everyone in the class.','which',[],['that','what','it'],'Which after a comma refers back to the whole idea.')
it('p2-m02','pron','rel','The village, ___ can only be reached by boat, has fewer than a hundred inhabitants.','which',[],['that','who','where'],'Non-defining clause about a thing: which, never that.')
it('p2-m03','pron','rel','The main reason for ___ I chose this university was its excellent library.','which',[],['that','what','whom'],'Preposition + which for things.')
it('p2-m04','pron','rel','We stayed in a small hotel, the owner of ___ was a retired chef.','which',[],['whose','that','who'],'The owner of which = whose owner.')
it('p2-m05','pron','pron','___ I like most about living by the sea is the fresh air in the morning.','what',[],['that','which','it'],'What = the thing that.')
it('p2-m06','pron','pron','I cannot believe ___ a mess the children have made of the kitchen!','what',[],['such','how','so'],'What + a + noun in exclamations.')
it('p2-m07','pron','pron','No matter ___ you decide, I will support you.','what',[],['that','it','whose'],'No matter what = whatever.')
it('p2-m08','comp','comp','Will the weather be good enough for the picnic? I hope ___ — we have already bought all the food.','so',[],['it','that','this'],'I hope so: so replaces the clause.')
it('p2-m09','comp','comp','I have ___ much homework this week that I have not had time to go out at all.','so',[],['such','too','very'],'So much + uncountable noun + that.')
it('p2-m10','quant','det','Is this ___ first time you have been to Lisbon? You seem to know your way around.','the',['your'],['a','one','this'],'The first time + present perfect.')
it('p2-m11','comp','comp','___ older I get, the more I appreciate my parents’ advice.','the',[],['as','more','so'],'The + comparative, the + comparative.')
it('p2-m12','quant','quant','Regular exercise is ___ of the best ways to reduce stress.','one',[],['some','any','each'],'One of the + superlative + plural noun.')
it('p2-m13','quant','det','Thank you for ___ your help with the move; I could not have done it without you.','all',[],['every','whole','each'],'All + possessive + noun.')
it('p2-m14','quant','det','What ___ beautiful view! I could sit here for hours.','a',[],['the','an','such'],'What a + adjective + singular noun.')
it('p2-m15','prep','prep','She burst ___ tears when she heard that she had won the scholarship.','into',[],['in','out','to'],'Burst into tears / laughter.')

# ── TO PART 1: collocations, where the word itself is the test ──────────
TO_P1=[
 ('p1-x01','Over two hundred runners took ___ in the charity race on Sunday.','part',['place','care','turn'],'Take part in = participate.'),
 ('p1-x02','The wedding will take ___ in a small church overlooking the sea.','place',['part','care','turn'],'Take place = happen (events).'),
 ('p1-x03','Please make ___ that you lock the door when you leave the building.','sure',['true','right','safe'],'Make sure (that) = check.'),
 ('p1-x04','Students are expected to pay ___ to the teacher during lessons.','attention',['care','interest','concern'],'Pay attention to.'),
 ('p1-x05','It was lovely to meet you. Let’s keep in ___ now that you’re moving abroad.','touch',['reach','link','line'],'Keep in touch.'),
 ('p1-x06','You should take ___ of the good weather and go for a walk.','advantage',['use','benefit','profit'],'Take advantage of.'),
 ('p1-x07','She has made great ___ in her English since she started the course.','progress',['process','result','gain'],'Make progress (uncountable).'),
 ('p1-x08','Social media plays a major ___ in how young people communicate.','part',['place','game','piece'],'Play a part (or role) in.'),
 ('p1-x09','He caught ___ of a rare eagle as he walked through the forest.','sight',['view','look','glimpse'],'Catch sight of = suddenly see.'),
 ('p1-x10','It is important that we all do our ___ to protect the environment.','best',['most','better','good'],'Do your best.'),
 ('p1-x11','The family bakery went out of ___ after thirty years.','business',['work','trade','money'],'Go out of business = close because it failed.'),
]

if __name__=='__main__':
  ids=[x['id'] for x in I]; assert len(ids)==len(set(ids)), 'duplicate id'
  for x in I:
    assert x['s'].count('___')==1, x['id']
    assert not set(map(str.lower,x['o']))&set(map(str.lower,[x['a']]+x['alt'])), x['id']+' option is also an answer'
  p='data/use-of-english/gapfill/master-part2.json'; D=json.load(open(ROOT+p))
  D['meta']['provenance']=('Rewritten for B2 on 2 November 2026 (tools/build-master-part2.py): every gap now sits in a short text whose context decides it, '
    'fixed phrases are gapped on the grammar word as Part 2 does, eleven collocation items moved to Master · Part 1, and new items added for the words '
    'the real papers test most. Built on the October review of the pantry drafts (cloze.js–cloze4.js), whose answer checks are kept. '
    'Frequencies are counted from the 312 gaps of 24 past B2 First Part 2 texts (the Use of English Portfolio); a word that is one of several accepted answers counts once for that gap.')
  D['items']=I
  json.dump(D,open(ROOT+p,'w'),ensure_ascii=False,indent=1)
  # the Part 2 Board plays the Master page's own items
  b='data/challenge/challenge-uoe-part2.json'; B=json.load(open(ROOT+b)); T=D['meta']['tabs']
  B['rounds']=[{'id':x['id'],'part':'UoE2','game':'opencloze','prompt':x['s'],'answer':[x['a']]+x['alt'],'note':x['why'],'tag':T[x['tab']]} for x in I]
  json.dump(B,open(ROOT+b,'w'),ensure_ascii=False,indent=1)
  # the moved collocations join Master · Part 1 and its Board
  p1='data/use-of-english/multiple-choice/master-part1.json'; D1=json.load(open(ROOT+p1))
  have={x['id'] for x in D1['items']}
  new=[{'id':i,'tab':'colloc','type':'colloc','s':s,'a':a,'o':o,'why':w} for i,s,a,o,w in TO_P1 if i not in have]
  D1['items']+=new; json.dump(D1,open(ROOT+p1,'w'),ensure_ascii=False,indent=1)
  b1='data/challenge/challenge-uoe-part1.json'; B1=json.load(open(ROOT+b1))
  r0=next(r for r in B1['rounds'] if r['id'].startswith('p1-'))
  hb={r['id'] for r in B1['rounds']}
  for x in new:
    if x['id'] in hb: continue
    B1['rounds'].append({'id':x['id'],'part':'UoE1','game':'choose','prompt':x['s'],'options':random.Random(x['id']).sample([x['a']]+x['o'],4),'answer':x['a'],'note':x['why'],'tag':D1['meta']['tabs']['colloc']})
  json.dump(B1,open(ROOT+b1,'w'),ensure_ascii=False,indent=1)
  from collections import Counter
  import statistics
  print(len(I),'items ·',Counter(x['tab'] for x in I))
  print('median words',statistics.median(len(x['s'].split()) for x in I),'· ≤10 words',sum(len(x['s'].split())<=10 for x in I))
  F=D['freq']; have=Counter(w.lower() for x in I for w in [x['a']]+x['alt'])
  print([(w,F[w],have.get(w,0)) for w in list(F)[:25]])
  print('part1 +',len(new))
