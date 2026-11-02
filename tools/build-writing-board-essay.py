import json,random,re,html
R=random.Random(20261102)
import os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')+'/'
E=json.load(open(ROOT+'skills/writing/essays/data/essay-cards-models.json'))
S=json.load(open(ROOT+'skills/writing/essays/data/samples.json'))
dots=lambda s:s.replace('...','…')
# ── pools of expressions, by job ─────────────────────────────────────────
INTRO=[dots(x) for x in E['shared']['background']]
CONC=sorted({dots(x) for t in E['types'].values() for x in t['close']['summary']})
J={
 'reason':['This is because …','This is due to …','The reason for this is that …','This stems from …','given that …','since …'],
 'example':['For example, …','For instance, …','A clear example of this is …','This can be seen in …','In particular, …'],
 'result':['As a result, …','Consequently, …','Therefore, …','For this reason, …','This leads to …','Thus, …'],
 'contrast':['However, …','On the other hand, …','By contrast, …','Nevertheless, …','whereas …'],
 'compare':['Similarly, …','Likewise, …','In the same way, …','By the same token, …'],
 'add':['Moreover, …','Furthermore, …','In addition, …','What is more, …','Besides, …'],
 'again':['In other words, …','That is to say, …','To put it another way, …','Put simply, …'],
 'mine':['In my view, …','From my point of view, …','As far as I am concerned, …','It seems to me that …','It is my sincere belief that …'],
 'others':['It is often argued that …','It is widely held that …','It is commonly known that …','It is often maintained that …'],
}
J['conclude']=[c+' …' if not c.endswith('…') else c for c in CONC if not c.startswith('Looking ahead')]
JOB={'reason':'gives a reason','example':'gives an example','result':'gives a result','contrast':'shows a contrast','compare':'compares',
     'add':'adds another point','again':'rephrases the point','conclude':'starts the conclusion'}
WHY={'reason':'explains why','example':'shows a real case','result':'says what happens because of it','contrast':'turns to the other side',
     'compare':'shows something alike','add':'adds a point','again':'says the same thing more simply','conclude':'sums up at the end',
     'mine':'gives your opinion','others':'reports what other people think'}
rounds=[]; n={}
def rid(k): n[k]=n.get(k,0)+1; return f'we-{k}-{n[k]}'
# ── SORT: two jobs, three cards each ─────────────────────────────────────
SORTS=[('Introduction','Conclusion',INTRO,J['conclude'],'An introduction sets the scene; a conclusion sums up and gives your verdict.'),
       ('Adds a point','Contrast',J['add'],J['contrast'],'Moreover / Furthermore keep going in the same direction; However / On the other hand turn the other way.'),
       ('Reason','Result',J['reason'],J['result'],'A reason answers “why?”; a result answers “so what happened?”.'),
       ('Example','Comparison',J['example'],J['compare'],'An example shows a real case; Similarly / Likewise show something that works the same way.'),
       ('Your opinion','Other people',J['mine'],J['others'],'In my view / As far as I am concerned are yours; It is often argued that … reports other people.')]
for a,b,pa,pb,note in SORTS:
  for _ in range(4):
    items=[[x,0] for x in R.sample(pa,3)]+[[x,1] for x in R.sample(pb,3)]
    rounds.append({'id':rid('sort'),'game':'sort','prompt':'Sort the expressions.','bins':[a,b],'items':items,'note':note,'tag':a+' / '+b})
# ── MATCH: four expressions, four jobs ───────────────────────────────────
mk=list(JOB)
for _ in range(12):
  ks=R.sample(mk,4)
  rounds.append({'id':rid('match'),'game':'match','prompt':'Match each expression to its job.','pairs':[[R.choice(J[k]),JOB[k]] for k in ks],
    'note':' · '.join(f'{J[k][0].replace(" …","")} {WHY[k]}' for k in ks)+'.','tag':'Linkers by job'})
# ── ODD ONE OUT: three do the job, one doesn't ───────────────────────────
ODD=[('conclude','Three can start a conclusion. Tap the one that can’t.',['add','example','reason']),
     ('reason','Three give a reason. Tap the one that doesn’t.',['result','example','contrast']),
     ('example','Three give an example. Tap the one that doesn’t.',['result','add','contrast']),
     ('add','Three add another point. Tap the one that doesn’t.',['contrast','conclude','result']),
     ('contrast','Three show a contrast. Tap the one that doesn’t.',['add','compare','example']),
     ('mine','Three give your own opinion. Tap the one that doesn’t.',['others'])]
for k,prompt,others in ODD:
  for _ in range(2):
    o=R.choice(others); bad=R.choice(J[o]); good=R.sample(J[k],3)
    rounds.append({'id':rid('odd'),'game':'odd','prompt':prompt,'options':good+[bad],'answer':bad,
      'note':f'{bad.replace(" …","")} {WHY[o]}.','tag':JOB.get(k,'opinion')})
# ── CHOOSE: which one does this job? one option from each of four jobs ──
for k in ['reason','example','result','contrast','add','conclude','again','compare']:
  ask=JOB[k]
  others=R.sample([x for x in JOB if x!=k and not {x,k}<= {'add','compare'}],3)
  for _ in range(1):
    ans=R.choice(J[k]); opts=[ans]+[R.choice(J[o]) for o in others]
    rounds.append({'id':rid('choose'),'game':'choose','prompt':f'Which expression {ask}?','options':opts,'answer':ans,
      'note':f'{ans.replace(" …","")} {WHY[k]}.','tag':JOB[k]})
# ── ORDER: real body paragraphs from the 25 sample essays ────────────────
def sents(p):
  t=html.unescape(re.sub(r'<[^>]+>','',p)).strip()
  t=re.sub(r'^((?:In the first place|For one thing|First of all|Firstly)), to start with, ',r'\1, ',t)   # the samples' doubled signposts
  return [x.strip() for x in re.split(r'(?<=[.!?])\s+(?=[A-Z])',t) if x.strip()]
RE_R=r'^(This is because|This is due to|The reason for this is|This stems from|This happens because)'
RE_E=r'^(For example|For instance|A clear example|In particular|To illustrate)'
RE_S=r'^(As a result|Consequently|Therefore|Thus|Hence|This means|In this way)'
paras=[]
for s in S['samples'] if 'samples' in S else list(S.values())[0]:
  for st in ['default','alternative1','alternative2']:
    h=s.get('styles',{}).get(st)
    if not h: continue
    ps=re.findall(r'<p>(.*?)</p>',h,re.S)
    for p in ps[1:-1]:
      x=sents(p)
      if len(x)==4 and re.match(RE_R,x[1]) and re.match(RE_E,x[2]) and re.match(RE_S,x[3]) and not re.match(RE_R+'|'+RE_E+'|'+RE_S,x[0]):
        paras.append((s['id'],x))
R.shuffle(paras); seen=set(); picked=[]
for sid,x in paras:
  if x[0] in seen or x[0].count(',')>=2 and re.match(r'^\w+( \w+)?, in addition',x[0]): continue
  if sum(1 for q in picked if q[0]==sid)>=1: continue
  seen.add(x[0]); picked.append((sid,x))
for sid,x in picked[:24]:
  rounds.append({'id':rid('order'),'game':'order','unit':'sentences','prompt':'Build the paragraph.','words':x,
    'note':'Topic sentence → reason (This is because …) → example (For example …) → result (As a result …).','tag':'Paragraph order'})
out={'version':1,'section':'writing','topic':'Essay','level':'B2',
 'source':'Expressions from the Essay cue cards and models (data/writing/cue-generator.json, skills/writing/essays/data/essay-cards-models.json); paragraphs from the 25 sample essays (skills/writing/essays/data/samples.json). Generated 2 Nov 2026, then checked by hand.',
 'exam':['choose','sort','match','odd','order'],'productive':4,'rounds':rounds}
json.dump(out,open(ROOT+'data/challenge/challenge-writing-essay.json','w'),ensure_ascii=False,indent=1)
from collections import Counter
print(Counter(r['game'] for r in rounds), len(paras), len(picked))
