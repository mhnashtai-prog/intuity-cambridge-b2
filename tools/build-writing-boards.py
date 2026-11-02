# Boards for the Part 2 writing tasks (and the Story), in the same shape as the Essay Board.
# Expressions come from the Writing Portfolio (data/writing/portfolio.json) and the cue cards
# (data/writing/cue-generator.json); a few plain B2 extras are marked # +.
# Each task: pools of expressions by job → sort / match / odd / choose rounds, plus "order"
# rounds that rebuild the task's skeleton one part per line.
import json,random,os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')+'/'
def tidy(s):
  s=s.replace('...','…').strip()
  if s[-1] not in '.!?…,”"' : s+=' …'
  return s
def P(*xs): return [tidy(x) for x in xs]

TASKS={}
# ════════════════ EMAIL ════════════════════════════════════════════════
E={
 'greet_f':P('Dear Sir or Madam,','Dear Ms Lopes,','Dear Mr Silva,','Dear Hiring Manager,'),
 'greet_i':P('Hi Tom,','Hey Tom!','Hi Sue,','Hi there,'),
 'why_app':P('I am writing with reference to your advertisement for the position of …','I would like to apply for the role of … recently advertised in …','I am interested in applying for the post of …','I am writing to apply for the summer position advertised on your website.'),
 'why_req':P('I am writing to enquire about …','I would like to request further information regarding …','I saw your advertisement for … and would like to ask …','I am writing to enquire about the summer English course advertised on your website.'),
 'apply':P('During the past few years, I have worked as','My duties have included …, which has helped me develop','I have experience of working with','I am particularly interested in this position as it would allow me to','I consider myself responsible, friendly and hardworking.','I speak English, Portuguese and basic French, which would be useful when dealing with guests.'),
 'ask':P('Could you please tell me whether … ?','I would also like to know if','Would it be possible to receive details about … ?','I am planning to …, so I would appreciate information on','I would be grateful if you could provide more details about'),
 'end_app':P('I very much hope you will consider my application.','I would be delighted to attend an interview at your convenience.','Thank you for considering my application.'),
 'end_req':P('I would be grateful if you could reply at your earliest convenience.','Thank you very much for your assistance.','I look forward to hearing from you soon.'),
 'react_news':P('It was great to get your message!','I’m so happy to hear you’re planning to visit!','That’s wonderful news — I can’t wait to see you!','You can’t imagine how pleased I am that you’re coming!'),
 'react_adv':P('Thanks for your email — I’m so glad you told me!','Sorry to hear you’re having trouble with …','I’ve been thinking about what you said about …','Congratulations on your news! That’s amazing!'),
 'plans':P('You should definitely visit …','We could go to …','There’s so much to see and do here.','I think you’d really enjoy','Why don’t we go together to … ?','You can stay at my place if you like.','Don’t worry about transport — I’ll pick you up from the station.'),
 'advice':P('If I were you, I’d','Have you thought about … ?','You ought to think about … before deciding.','From my own experience, … is really worth it.','On the other hand, you might want to consider','You could always … if you’re not sure.','I think you should'),
 'end_news':P('Can’t wait to see you!','Write soon and tell me your exact dates.','Really looking forward to seeing you!','Can’t wait to catch up!'),
 'end_adv':P('Let me know what you decide!','Best of luck — I’m sure you’ll make the right choice!','I can’t wait to hear how it goes.','Keep in touch and tell me everything!'),
 'sign_f':P('Yours faithfully,','Yours sincerely,'),
 'sign_i':P('Love,','Best wishes,','Cheers,','All the best,'),
}
E['why_f']=E['why_app']+E['why_req']; E['end_f']=E['end_app']+E['end_req']+P('I look forward to hearing from you.')
E['react']=E['react_news']+E['react_adv']; E['end_i']=E['end_news']+E['end_adv']
E['formal']=E['why_f']+E['apply']+E['ask']+E['end_f']
E['informal']=E['react']+E['plans']+E['advice']+E['end_i']
TASKS['email']=dict(label='Email',short='Email',focus='Email, Part 2: formal or informal, opening or closing — and every part of the email in the right order.',
 pools=E,
 sorts=[('Formal','Informal','formal','informal',6,'Formal emails are polite and full: I am writing to … / I would be grateful if … . Informal emails are chatty: contractions, exclamations, Can’t wait!'),
        ('Opening','Closing','why_f','end_f',3,'The opening says why you are writing; the closing thanks them and asks for a reply.'),
        ('Opening','Closing','react','end_i',3,'A friendly opening reacts to their news; a friendly closing looks forward to the next step.'),
        ('Job application','Request','apply','ask',4,'An application talks about you — experience and qualities. A request asks them questions.'),
        ('Making plans','Giving advice','plans','advice',4,'Plans suggest what you can do together; advice tells your friend what you would do.')],
 jobs={'greet_f':'formal greeting','greet_i':'friendly greeting','why_f':'says why you are writing','apply':'sells your experience','ask':'asks for information',
       'end_f':'formal ending','react':'reacts to their news','plans':'suggests a plan','advice':'gives advice','end_i':'friendly ending'},
 why={'greet_f':'opens a formal email','greet_i':'opens an email to a friend','why_f':'gives the reason for writing','apply':'tells them what you can do',
      'ask':'asks a polite question','end_f':'closes a formal email','react':'answers your friend’s news','plans':'suggests something to do together',
      'advice':'tells your friend what to do','end_i':'closes an email to a friend'},
 clash=[{'end_f','end_i'},{'greet_f','greet_i'},{'react','end_i'},{'why_f','end_f'}],
 odds=[('formal','Three are formal. Tap the informal one.',['informal']),('informal','Three are informal. Tap the formal one.',['formal']),
       ('ask','Three ask for information. Tap the one that doesn’t.',['apply','end_f']),('advice','Three give advice. Tap the one that doesn’t.',['plans','react','end_i']),
       ('react','Three react to a friend’s news. Tap the one that doesn’t.',['advice','plans']),('end_f','Three can end a formal email. Tap the one that can’t.',['end_i','why_f'])],
 fixed=[{'prompt':'You started with “Dear Sir or Madam,”. How do you sign off?','options':['Yours faithfully,','Yours sincerely,','Love,','Cheers,'],'answer':'Yours faithfully,','note':'Dear Sir or Madam (no name) → Yours faithfully.','tag':'sign-off'},
        {'prompt':'You started with “Dear Ms Lopes,”. How do you sign off?','options':['Yours sincerely,','Yours faithfully,','Love,','Best wishes,'],'answer':'Yours sincerely,','note':'Dear Ms Lopes (a name) → Yours sincerely.','tag':'sign-off'},
        {'prompt':'You are writing to a friend. Which sign-off fits?','options':['Love,','Yours faithfully,','Yours sincerely,','I look forward to hearing from you.'],'answer':'Love,','note':'Love, / Best wishes, / Cheers, are for friends.','tag':'sign-off'},
        {'prompt':'Which greeting starts a job application?','options':['Dear Sir or Madam,','Hey Tom!','Hi there,','Love,'],'answer':'Dear Sir or Madam,','note':'A job application is formal: Dear Sir or Madam, or Dear Ms … .','tag':'greeting'}],
 orders=[('Build the job application.',[('greet_f',None),('why_app',None),('apply',None),('end_app',None),('sign_f',None)],6),
         ('Build the request email.',[('greet_f',None),('why_req',None),('ask',None),('end_req',None),('sign_f',None)],6),
         ('Build the email to your friend.',[('greet_i',None),('react_news',None),('plans',None),('end_news',None),('sign_i',None)],6),
         ('Build the email to your friend.',[('greet_i',None),('react_adv',None),('advice',None),('end_adv',None),('sign_i',None)],6)],
 order_note='Greeting → why you are writing → the main point → polite ending → sign-off.')

# ════════════════ ARTICLE ══════════════════════════════════════════════
A={
 'title':['“Small Changes, Big Results”','“Why Do We Love Sintra?”','“Food for Thought!”','“A Weekend to Remember”','“Is Less Really More?”','“Life Without Screens?”'],  # + last three
 'hook_q':P('Who has never imagined … ?','Why do so many people attach such importance to … ?','What is it about … that draws people to … ?','Are you finding it hard to … ?','Have you ever wondered why … ?'),
 'hook_s':P('There seems to be something irresistible about …','Few can resist the appeal of …','It’s hard to deny that … plays a huge part in our lives.','Faced with the task of describing …, it is perfectly natural for people to …'),
 'describe':P('What makes it so special is','My ideal … would feature','There’s so much to see and do.','The views from the hills are stunning.'),
 'opinion':P('For me personally, the best thing about … is','One of the key things I love about … is','As far as I’m concerned, … is of great importance.','To be honest, I think'),
 'story':P('I’ll never forget the time when','If I had to choose one example, it would be','When I visited last spring, I','I still remember the day'),
 'close':P('If you haven’t tried …, make sure you do — you won’t regret it!','It’s hard to imagine life without …','In short, there’s something truly unforgettable about …','Whether you love it or not, there’s no denying that … leaves a lasting impression.','Why not start today?'),
 'report':P('The aim of this report is to','The information was collected through a questionnaire.','It was generally agreed that','One key recommendation would be to','To sum up, the findings clearly show that'),
}
A['hook']=A['hook_q']+A['hook_s']; A['article']=A['hook']+A['opinion']+A['close']; A['develop']=A['describe']+A['opinion']+A['story']
TASKS['article']=dict(label='Article',short='Article',focus='Article, Part 2: hook the reader, talk to them, and close with style — and the article’s parts in order.',
 pools=A,
 sorts=[('Opening','Closing','hook','close',4,'An opening hooks the reader with a question or a bold statement; a closing leaves them with a final thought or an invitation.'),
        ('Question hook','Statement hook','hook_q','hook_s',4,'A question hook asks the reader something; a statement hook claims something they will want to read about.'),
        ('Your opinion','A short story','opinion','story',4,'Opinion: what you love or think. Story: one real moment — I’ll never forget the time when … .'),
        ('Article','Report','article','report',4,'An article talks to the reader and sounds alive; a report is formal and impersonal.')],
 jobs={'title':'is a title','hook_q':'asks the reader a question','hook_s':'hooks with a statement','describe':'describes it','opinion':'gives your opinion','story':'tells a short story','close':'ends the article'},
 why={'title':'names the article and sparks curiosity','hook_q':'pulls the reader in with a question','hook_s':'pulls the reader in with a bold claim','describe':'paints a picture',
      'opinion':'says what you think','story':'shares one real moment','close':'leaves the reader with a final thought','report':'belongs in a report, not an article'},
 clash=[{'hook_q','title'},{'describe','opinion'}],
 odds=[('hook','Three can open an article. Tap the one that closes it.',['close']),('close','Three can close an article. Tap the one that opens it.',['hook']),
       ('article','Three sound like an article. Tap the one from a report.',['report']),('story','Three tell a short story. Tap the one that doesn’t.',['opinion','describe']),
       ('opinion','Three give your opinion. Tap the one that doesn’t.',['story','hook_q']),('hook_q','Three are question hooks. Tap the one that isn’t.',['hook_s'])],
 fixed=[{'prompt':'Which is the best title for an article?','options':['“Small Changes, Big Results”','Report on student health','I am writing to tell you about health.','Dear Sir or Madam,'],'answer':'“Small Changes, Big Results”','note':'A title sparks curiosity: short, catchy, maybe a question or a play on words.','tag':'title'},
        {'prompt':'Which is the best title for an article?','options':['“Why Do We Love Sintra?”','Sintra: findings and recommendations','The aim of this article','Yours faithfully,'],'answer':'“Why Do We Love Sintra?”','note':'A question makes a great title.','tag':'title'},
        {'prompt':'Who is an article written for?','options':['The readers of a magazine or website','Your boss','A company you want a job from','Your teacher, as a formal report'],'answer':'The readers of a magazine or website','note':'An article talks to its readers — use “you”, questions and a lively tone.','tag':'reader'}],
 orders=[('Build the article.',[('title',None),('hook',None),('develop',None),('close',None)],12)],
 order_note='Title → hook the reader → develop it (describe, give your opinion or tell a short story) → close with style.')

# ════════════════ REVIEW ═══════════════════════════════════════════════
V={
 'scene':P('When it comes to choosing a …, the number of options can be overwhelming.','Choosing a … can be a real challenge; however, … is certainly an option worth considering.','If you are looking for a …, then … could be the perfect option for you.','Selecting the right … is never easy, but … definitely deserves your attention.','Are you on the lookout for a … ? If so, … could be exactly what you need.','Have you ever wondered what makes a truly great … ?'),
 'name':P('Known for its …, … has been a favourite among tourists for years.','Located in …, it remains an emblematic … .','Regarded as one of the best …, few … can rival it.','By far one of the best … is …','Having heard so much about …, I was curious to see whether it lived up to its reputation.'),
 'first':P('The thing that is most likely to impress you is','The first thing that stands out is','What impressed me most was','The real strength of … lies in its'),
 'next':P('The other feature which I found most impressive is','Anyone interested in … will be especially impressed by','If you happen to appreciate …, you will love','Apart from that, I was also impressed by'),
 'standout':P('By far the best feature is','What truly steals the show is','Hands down, the finest part is','By far the most appealing aspect of … is'),
 'down':P('However, some drawbacks exist.','The only downside is that','My only criticism is that','It is a shame that','On the negative side,'),
 'recommend':P('I can assure you that … will not disappoint anyone who is','This is a … which you cannot afford to miss.','For anyone who is interested in …, it is an absolute must.','I guarantee that … will leave a lasting impression on you.','I would highly recommend … to anyone who'),
 'report':P('The aim of this report is to','The information was collected through a questionnaire.','It was generally agreed that','One key recommendation would be to','In conclusion, as can be seen from the findings,'),
}
V['intro']=V['scene']+V['name']; V['praise']=V['first']+V['next']+V['standout']; V['review']=V['scene']+V['praise']+V['recommend']
TASKS['review']=dict(label='Review',short='Review',focus='Review, Part 2: catch the reader, praise the features, admit a drawback and recommend — in the right order.',
 pools=V,
 sorts=[('Introduction','Recommendation','intro','recommend',4,'The introduction catches the reader and names what you are reviewing; the recommendation says who should go, read or buy.'),
        ('Praise','Criticism','praise','down',4,'Praise shows what is good; a drawback shows you are fair — a good review has both.'),
        ('Catch the reader','Introduce it','scene','name',4,'First catch the reader (choosing a … is never easy); then introduce it (Known for its …, Located in …).'),
        ('Review','Report','review','report',4,'A review is personal and persuasive; a report is formal, with findings and recommendations.')],
 jobs={'scene':'catches the reader','name':'introduces it','first':'the first feature','next':'another feature','standout':'the best feature','down':'admits a drawback','recommend':'recommends it'},
 why={'scene':'catches the reader’s attention','name':'says what it is and why it is known','first':'opens the features','next':'adds another feature',
      'standout':'saves the best till last','down':'gives the negative side','recommend':'tells the reader to go for it','report':'belongs in a report, not a review'},
 clash=[{'first','next'},{'first','standout'},{'next','standout'}],
 odds=[('recommend','Three recommend it. Tap the one that doesn’t.',['scene','down']),('praise','Three praise it. Tap the drawback.',['down']),
       ('down','Three give a drawback. Tap the one that doesn’t.',['praise']),('review','Three sound like a review. Tap the one from a report.',['report']),
       ('scene','Three catch the reader. Tap the one that doesn’t.',['recommend','down']),('standout','Three present the best feature. Tap the one that doesn’t.',['down','scene'])],
 fixed=[{'prompt':'Where does “I guarantee that … will leave a lasting impression on you.” go?','options':['The recommendation','The introduction','The first feature','The drawback'],'answer':'The recommendation','note':'I guarantee / I can assure you … close the review.','tag':'recommends it'},
        {'prompt':'Where does “The other feature which I found most impressive is …” go?','options':['After the first feature','In the introduction','In the recommendation','At the very start'],'answer':'After the first feature','note':'The other feature … follows the first one.','tag':'another feature'}],
 orders=[('Build the review.',[('scene',None),('name',None),('first',None),('next',None),('recommend',None)],6),
         ('Build the review.',[('scene',None),('first',None),('standout',None),('down',None),('recommend',None)],6)],
 order_note='Catch the reader → introduce it → features (first, next, the best) → any drawback → recommend it.')

# ════════════════ REPORT ═══════════════════════════════════════════════
R_={
 'aim':P('The aim of this report is to','The main objective of this report is to assess','This report aims to provide a summary of','The purpose of this report is to examine','This report is intended to give an overview of','This report focuses on'),
 'method':P('The information was collected through a questionnaire conducted among','The findings are drawn from interviews and feedback obtained during','This report is based on my personal views and experience.','The information was collected through a survey among students.'),
 'general':P('It was generally agreed that','There was a broad consensus that','Many visitors referred to … as the best part of','It was generally felt that'),
 'praise':P('By far the best aspect of … was that','What made … so interesting was that','One positive aspect of … is that','The highlight of … was'),
 'crit':P('One major concern expressed by … was that','By far the worst aspect of … was that','… is far from ideal, since','This is mainly due to the fact that','Less satisfactory, however, was'),
 'recommend':P('One key recommendation would be to','In order to …, I would strongly recommend','It is essential that the school','If we were to …, one key recommendation would be to','To improve …, it is essential that'),
 'conclude':P('Taking everything into account, it seems clear that','The main conclusion to be drawn is that','In conclusion, as can be seen from the findings,','To sum up, the findings clearly show that','In summary, it can be concluded that'),
 'article':P('Who has never imagined … ?','There seems to be something irresistible about …','I’ll never forget the time when','If you haven’t tried …, make sure you do — you won’t regret it!','For me personally, the best thing about … is'),
}
R_['intro']=R_['aim']+R_['method']; R_['report']=R_['aim']+R_['general']+R_['recommend']+R_['conclude']
TASKS['report']=dict(label='Report',short='Report',focus='Report, Part 2: aim and method, findings that praise and criticise, recommendations and conclusion — in order.',
 pools=R_,
 sorts=[('Aim','Method','aim','method',4,'The aim says what the report is for; the method says where the information comes from.'),
        ('Praising','Criticising','praise','crit',4,'Findings are balanced: what worked well and what did not.'),
        ('Recommendation','Conclusion','recommend','conclude',4,'A recommendation says what should be done; the conclusion sums up the findings.'),
        ('Report','Article','report','article',4,'A report is formal and impersonal; an article talks to the reader and sounds alive.')],
 jobs={'aim':'states the aim','method':'says where the information comes from','general':'gives the general view','praise':'praises','crit':'criticises','recommend':'recommends','conclude':'concludes'},
 why={'aim':'says what the report is for','method':'explains how the information was collected','general':'reports what most people think','praise':'highlights the positive',
      'crit':'points out a problem','recommend':'says what should be done','conclude':'sums up the findings','article':'belongs in an article, not a report'},
 clash=[{'general','praise'},{'recommend','conclude'}],
 odds=[('aim','Three state the aim. Tap the one that doesn’t.',['method','conclude']),('crit','Three criticise. Tap the one that praises.',['praise']),
       ('praise','Three praise. Tap the one that criticises.',['crit']),('conclude','Three conclude. Tap the one that doesn’t.',['aim','general']),
       ('report','Three sound like a report. Tap the one from an article.',['article']),('recommend','Three recommend. Tap the one that doesn’t.',['crit','method'])],
 fixed=[{'prompt':'A report needs …','options':['headings for each section','a catchy question as the title','Dear Sir or Madam,','a short story about you'],'answer':'headings for each section','note':'Reports use clear headings: Introduction, Findings, Recommendations, Conclusion.','tag':'headings'},
        {'prompt':'Which heading comes last in a report?','options':['Conclusion','Introduction','Findings','Method'],'answer':'Conclusion','note':'Introduction → Findings → Recommendations → Conclusion.','tag':'headings'}],
 orders=[('Build the report.',[('aim',None),('method',None),('praise',None),('crit',None),('recommend',None)],6),
         ('Build the report.',[('aim',None),('general',None),('crit',None),('recommend',None),('conclude',None)],6)],
 order_note='Aim → method → findings (general view, praise, criticism) → recommendation → conclusion.')

# ════════════════ STORY ════════════════════════════════════════════════
S={
 'scene':P('It was a cold, grey morning and everyone was still asleep.','The sun was shining when Anna set off for the beach.','Anna had been waiting for this day for weeks.','It all began one rainy afternoon, when Anna was alone at home.','I still remember the summer when we moved to the coast.'),
 'hint':P('At first, everything seemed perfectly normal.','She had no idea that this day would change everything.','Little did she know that …','Nobody could have guessed what was about to happen.'),
 'happens':P('A few minutes later, …','Just then, …','Without warning, …','Suddenly, she heard a loud crash.','To her horror, …','She couldn’t believe her eyes when …'),
 'react':P('Without thinking twice, she …','Heart pounding, she …','Taking a deep breath, she …','It turned out that …','Only then did she realise that …'),
 'ending':P('In the end, …','Looking back, she realised that …','It was a day she would never forget.','From that day on, she never … again.'),
}
S['begin']=S['scene']+S['hint']
TASKS['story']=dict(label='Story',short='Story',focus='Story: set the scene, hint, surprise, react and end — in the right order.',
 pools=S,
 sorts=[('Beginning','Ending','begin','ending',4,'A beginning sets the scene and hints; an ending looks back on what happened.'),
        ('Something happens','They react','happens','react',4,'Suddenly / Just then / Without warning bring the event; Heart pounding / Taking a deep breath show the reaction.'),
        ('Set the scene','Hint at what’s coming','scene','hint',4,'The scene: when, where, the weather, the mood. The hint: something is about to change.')],
 jobs={'scene':'sets the scene','hint':'hints at what’s coming','happens':'something happens','react':'shows the reaction','ending':'ends the story'},
 why={'scene':'says when, where and the mood','hint':'builds suspense','happens':'brings the surprise','react':'shows how she responds','ending':'looks back at the end'},
 clash=[],
 odds=[('happens','Three bring a surprise. Tap the one that doesn’t.',['ending','scene']),('ending','Three end a story. Tap the one that doesn’t.',['scene','hint']),
       ('react','Three show a reaction. Tap the one that doesn’t.',['scene','ending']),('hint','Three hint at what’s coming. Tap the one that doesn’t.',['ending','react']),
       ('scene','Three set the scene. Tap the one that doesn’t.',['ending','react'])],
 fixed=[{'prompt':'Which one builds suspense at the start?','options':['Little did she know that …','In the end, …','From that day on, she never … again.','Looking back, she realised that …'],'answer':'Little did she know that …','note':'Little did she know … hints that something big is coming.','tag':'hints at what’s coming'}],
 orders=[('Build the story.',[('scene',None),('hint',None),('happens',None),('react',None),('ending',None)],8)],
 order_note='Set the scene → hint at what’s coming → something happens → the reaction → the ending.')

ASK={'formal greeting':'Which one is a formal greeting?','friendly greeting':'Which one is a friendly greeting?','formal ending':'Which one ends a formal email?',
 'friendly ending':'Which one ends an email to a friend?','is a title':'Which one is a title?','the first feature':'Which one introduces the first feature?',
 'another feature':'Which one adds another feature?','the best feature':'Which one presents the best feature?','something happens':'Which one brings a surprise?'}
# ════════════════ build ════════════════════════════════════════════════
def Q(x):
  x=x.strip('“”').rstrip(' ,'); return '“'+x+'” —'
def build(key,T,seed):
  R=random.Random(seed); pools=T['pools']; rounds=[]; n={}
  def rid(k): n[k]=n.get(k,0)+1; return f'w{key[:2]}-{k}-{n[k]}'
  for a,b,pa,pb,times,note in T['sorts']:
    for _ in range(times):
      items=[[x,0] for x in R.sample(pools[pa],3)]+[[x,1] for x in R.sample(pools[pb],3)]
      rounds.append({'id':rid('sort'),'game':'sort','prompt':'Sort the expressions.','bins':[a,b],'items':items,'note':note,'tag':a+' / '+b})
  jobs=list(T['jobs'])
  for _ in range(12):
    while True:
      ks=R.sample(jobs,4)
      if not any(c<=set(ks) for c in T['clash']): break
    used=set(); pairs=[]
    for k in ks:
      x=R.choice([y for y in pools[k] if y not in used]); used.add(x); pairs.append([x,T['jobs'][k]])
    rounds.append({'id':rid('match'),'game':'match','prompt':'Match each expression to its job.','pairs':pairs,
      'note':' · '.join(f'{Q(p[0])} {T["why"][k]}' for p,k in zip(pairs,ks))+'.','tag':T['label']+' by job'})
  for k,prompt,others in T['odds']:
    for _ in range(2):
      o=R.choice(others); bad=R.choice([x for x in pools[o] if x not in pools[k]]); good=R.sample(pools[k],3)
      rounds.append({'id':rid('odd'),'game':'odd','prompt':prompt,'options':good+[bad],'answer':bad,
        'note':f'{Q(bad)} {T["why"].get(o,T["jobs"].get(o,""))}.','tag':T['jobs'].get(k,k)})
  for k in jobs:
    others=[o for o in jobs if o!=k and not any({o,k}<=c for c in T['clash'])]
    if len(others)<3: continue
    ans=R.choice(pools[k]); opts=[ans]+[R.choice(pools[o]) for o in R.sample(others,3)]
    rounds.append({'id':rid('choose'),'game':'choose','prompt':ASK.get(T['jobs'][k],'Which one '+T['jobs'][k]+'?'),
      'options':opts,'answer':ans,'note':f'{Q(ans)} {T["why"][k]}.','tag':T['jobs'][k]})
  for f in T['fixed']:
    rounds.append(dict({'id':rid('choose'),'game':'choose'},**f))
  seen=set()
  for prompt,slots,times in T['orders']:
    made=0; tries=0
    while made<times and tries<500:
      tries+=1
      words=[R.choice(pools[s]) for s,_ in slots]
      if key=='email' and slots[-1][0]=='sign_f': words[-1]='Yours faithfully,' if words[0] in ('Dear Sir or Madam,','Dear Hiring Manager,') else 'Yours sincerely,'
      if tuple(words) in seen: continue
      seen.add(tuple(words)); made+=1
      rounds.append({'id':rid('order'),'game':'order','unit':'sentences','prompt':prompt,'words':words,'note':T['order_note'],'tag':'Order of the '+T['label'].lower()})
  return rounds

if __name__=='__main__':
  from collections import Counter
  for i,(key,T) in enumerate(TASKS.items()):
    rounds=build(key,T,20261102+i)
    out={'version':1,'section':'writing','topic':T['label'],'level':'B2',
      'source':'Expressions from the Writing Portfolio (data/writing/portfolio.json) and the cue cards (data/writing/cue-generator.json). Built by tools/build-writing-boards.py, 2 Nov 2026.',
      'exam':['choose','sort','match','odd','order'],'productive':4,'rounds':rounds}
    json.dump(out,open(ROOT+f'data/challenge/challenge-writing-{key}.json','w'),ensure_ascii=False,indent=1)
    print(key,len(rounds),dict(Counter(r['game'] for r in rounds)))
