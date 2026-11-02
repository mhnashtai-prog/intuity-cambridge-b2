# THE ULTIMATE CHALLENGE · WRITING
# Its own rounds, never played on a Board: every sentence comes from the real sample texts
# (essays, emails, articles, reviews, reports, stories), never from the Board's phrase lists.
# It tests the three parts of every task: the introduction, the body and the conclusion.
#   ultimate-writing-<task>.json : one task  ·  ultimate-writing-all.json : every task mixed
import json,random,re,html,os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')+'/'
W=ROOT+'skills/writing/'
def clean(t):
  t=html.unescape(re.sub(r'<[^>]+>','',t)).replace('«','').replace('»','').replace('**','')
  return re.sub(r'\s+',' ',t).strip()
def split(t):
  t=clean(t)
  return [x.strip() for x in re.split(r'(?<=[.!?])\s+(?=[A-Z“"‘\'])',t) if x.strip()]
PARTS=[]   # {task, part: intro|body|concl, sents, src}
def add(task,part,sents,src):
  sents=[clean(s) for s in sents if clean(s)]
  if sents: PARTS.append({'task':task,'part':part,'sents':sents,'src':src})
def pos(i,n): return 'intro' if i==0 else 'concl' if i==n-1 else 'body'

# essays — the default text of the 25 samples, minus the paragraphs the Essay Board already orders
board=json.load(open(ROOT+'data/challenge/challenge-writing-essay.json'))
used={tuple(r['words']) for r in board['rounds'] if r['game']=='order'}
for s in json.load(open(W+'essays/data/samples.json'))['opinion']:
  ps=re.findall(r'<p>(.*?)</p>',s['styles']['default'],re.S)
  for i,p in enumerate(ps):
    x=split(p)
    x=[re.sub(r'^((?:In the first place|For one thing|First of all|Firstly)), to start with, ',r'\1, ',y) for y in x]
    if tuple(x) in used: continue
    add('essay',pos(i,len(ps)),x,s['id'])
# emails — formal and informal samples
for reg,L in json.load(open(W+'emails/data/email-samples.json')).items():
  if reg=='meta': continue
  for k,x in L.items():
    ps=x['default']
    for i,p in enumerate(ps): add('email',pos(i,len(ps)),p['sentences'],reg+'-'+k)
# articles
for k,x in json.load(open(W+'articles/data/article-samples.json')).items():
  if k in('meta','changes'): continue
  ps=x['default']
  for i,p in enumerate(ps): add('article',pos(i,len(ps)),p['sentences'],k)
# reviews — default and the first alternative
for k,x in json.load(open(W+'reviews/data/samples.json')).items():
  for st in ('default','alternative1'):
    ps=x.get(st) or []
    for i,p in enumerate(ps): add('review',pos(i,len(ps)),p['sentences'],k+'/'+st)
# reports — default and professional; the heading names the part
for x in json.load(open(W+'reports/data/report-samples.json'))['reports']:
  for st in ('default','professional'):
    secs=re.findall(r'section-heading">([^<]+)</div><div\s+class="section-content">(.*?)</div></div>',x['styles'][st],re.S)
    for i,(h,c) in enumerate(secs):
      part='intro' if h.strip()=='Introduction' else 'concl' if h.strip()=='Conclusion' else 'body'
      add('report',part,split(c),x['id']+'/'+st)
# stories
for s in json.load(open(W+'narrative/data/narrative-samples.json'))['samples']:
  ps=s['paragraphs']
  for i,p in enumerate(ps): add('story',pos(i,len(ps)),split(p['text']),s['id'])

TASK={'essay':'Essay','email':'Email','article':'Article','review':'Review','report':'Report','story':'Story'}
# what each part is called in each task, as the pages call it
NAME={'essay':('Introduction','Body paragraph','Conclusion'),'email':('Opening','Main part','Closing'),
      'article':('Opening','Development','Closing'),'review':('Introduction','Features','Recommendation'),
      'report':('Introduction','Findings / Recommendations','Conclusion'),'story':('Beginning','Middle','Ending')}
IX={'intro':0,'body':1,'concl':2}
WHAT={'intro':'introduction','body':'body paragraph','concl':'conclusion'}
WHY={'essay':'an essay discusses a question and gives a balanced or personal view','email':'an email speaks to one reader — greeting, purpose, sign-off',
     'article':'an article talks to the readers of a magazine — questions, “you”, a lively tone','review':'a review describes and judges something, then recommends it',
     'report':'a report is formal: aim, findings, recommendations, headings','story':'a story is told in the past, with a scene, a surprise and an ending'}
CLUE={'intro':'It opens: it sets the scene or says why you are writing.','body':'It develops a point: details, reasons, examples.','concl':'It closes: it sums up, recommends or looks back.'}

def okS(s): return 35<=len(s)<=230 and not re.match(r'^(Dear|Hi|Hey|Yours|Love|Best|Cheers|Take care)\b',s)
def lead(p): return p['sents'][0] if okS(p['sents'][0]) else next((s for s in p['sents'] if okS(s)),None)
# no order round where the model's own order is not the only sensible one: the essay samples'
# introductions and conclusions follow a template with the aim line in an odd place, a report's
# findings can be listed in any order, and one story opens on the action before the scene
NOORDER={('essay','intro'),('essay','concl'),('report','body'),('story','intro')}
def okOrder(p): return 3<=len(p['sents'])<=5 and all(len(s)<=260 for s in p['sents']) and (p['task'],p['part']) not in NOORDER

def build(tasks,R,key,cap):
  P=[p for p in PARTS if p['task'] in tasks]; rounds=[]; n={}
  def rid(g): n[g]=n.get(g,0)+1; return f'wu-{key}-{g}-{n[g]}'
  one=len(tasks)==1; t0=tasks[0]
  lab=lambda t,part:NAME[t][IX[part]] if one else ('Introduction','Body paragraph','Conclusion')[IX[part]]
  # ORDER — real paragraphs, a third each of introductions, bodies and conclusions
  for part in ('intro','body','concl'):
    pool=[p for p in P if p['part']==part and okOrder(p)]; R.shuffle(pool)
    if not one:   # spread the tasks: round-robin
      by={t:[p for p in pool if p['task']==t] for t in tasks}; pool=[]
      while any(by.values()):
        for t in tasks:
          if by[t]: pool.append(by[t].pop())
    for p in pool[:cap['order']]:
      rounds.append({'id':rid('order'),'game':'order','unit':'sentences','prompt':f'Rebuild the {TASK[p["task"]].lower()}’s {NAME[p["task"]][IX[part]].lower().split(" /")[0]}.',
        'words':p['sents'],'note':f'From a model {TASK[p["task"]].lower()}. '+CLUE[part],'tag':TASK[p['task']]+' · '+WHAT[part]})
  leads=[(p,lead(p)) for p in P]; leads=[(p,s) for p,s in leads if s]; R.shuffle(leads)
  if not one:   # every task in turn, so the essays (the most samples) don't fill the set
    by={t:[x for x in leads if x[0]['task']==t] for t in tasks}; leads=[]
    while any(by.values()):
      for t in tasks:
        if by[t]: leads.append(by[t].pop())
  # CHOOSE — where does this sentence belong?
  for p,s in leads[:cap['where']]:
    opts=[lab(p['task'],x) for x in ('intro','body','concl')]
    rounds.append({'id':rid('where'),'game':'choose','prompt':f'Where in the {TASK[p["task"]].lower()} does this sentence belong?  “{s}”',
      'options':opts,'answer':lab(p['task'],p['part']),'note':CLUE[p['part']],'tag':TASK[p['task']]+' · '+WHAT[p['part']]})
  # SORT IN THREE — two openings, two body sentences, two closings (plays as Sort in the Game too)
  bp={k:[s for p,s in leads if p['part']==k] for k in ('intro','body','concl')}
  for k in range(cap.get('sort3',0)):
    if any(len(v)<2*(k+1) for v in bp.values()): break
    items=[[x,j] for j,part in enumerate(('intro','body','concl')) for x in bp[part][2*k:2*k+2]]
    rounds.append({'id':rid('sort3'),'game':'sort','prompt':'Beginning, middle or end? Sort the sentences.',
      'bins':[lab(t0,x) for x in ('intro','body','concl')],'items':items,'note':' '.join(CLUE.values()),'tag':'Introduction / Body / Conclusion'})
  # SORT — openings against closings
  ins=[s for p,s in leads if p['part']=='intro']; outs=[s for p,s in leads if p['part']=='concl']
  for k in range(min(cap['sort'],len(ins)//3,len(outs)//3)):
    a,b=lab(t0,'intro'),lab(t0,'concl')
    rounds.append({'id':rid('sort'),'game':'sort','prompt':'Opening or closing? Sort the sentences.','bins':[a,b] if one else ['Introduction','Conclusion'],
      'items':[[x,0] for x in ins[3*k:3*k+3]]+[[x,1] for x in outs[3*k:3*k+3]],'note':CLUE['intro']+' '+CLUE['concl'],'tag':'Introduction / Conclusion'})
  # ODD — three openings and one closing (or the other way round)
  for k in range(cap['odd']):
    flip=k%2; A,B=(outs,ins) if flip else (ins,outs)
    if len(A)<3*(k+1) or len(B)<k+1: break
    good=R.sample(A,3); bad=R.choice(B)
    word=('a conclusion','an introduction') if flip else ('an introduction','a conclusion')
    rounds.append({'id':rid('odd'),'game':'odd','prompt':f'Three come from {word[0]}. Tap the one from {word[1]}.','options':good+[bad],'answer':bad,
      'note':CLUE['intro' if flip else 'concl'],'tag':'Introduction / Conclusion'})
  if not one:
    # CHOOSE — which task is this from? (essay and article are never offered together: both can argue)
    # only openings and closings: a body sentence can belong to more than one task.
    # Tasks that can sound alike are never offered together.
    ALIKE=[{'essay','article'},{'review','report'},{'review','article'}]
    for p,s in [x for x in leads if x[0]['part']!='body'][:cap['which']]:
      t=p['task']; others=[x for x in tasks if x!=t and {x,t} not in ALIKE]
      opts=[TASK[t]]+[TASK[x] for x in R.sample(others,3)]
      rounds.append({'id':rid('which'),'game':'choose','prompt':f'Which task is this sentence from?  “{s}”','options':opts,'answer':TASK[t],
        'note':f'{TASK[t]}: {WHY[t]}.','tag':'Which task?'})
    # MATCH — four sentences, four tasks
    for k in range(cap['match']):
      ts=R.sample(tasks,4)
      if any(a<=set(ts) for a in ALIKE): continue
      pairs=[]
      for t in ts:
        c=[s for p,s in leads if p['task']==t and p['part']!='body']; pairs.append([R.choice(c),TASK[t]])
      rounds.append({'id':rid('match'),'game':'match','prompt':'Match each sentence to its task.','pairs':pairs,
        'note':' · '.join(f'{TASK[t]}: {WHY[t]}' for t in ts)+'.','tag':'Which task?'})
  else:
    # MATCH — four sentences, four parts (only tasks with a clear four-part shape)
    if t0=='report':
      byh=[p for p in P if p['task']=='report']
      sec={'Introduction':[lead(p) for p in byh if p['part']=='intro'],'Conclusion':[lead(p) for p in byh if p['part']=='concl'],
           'Recommendations':[lead(p) for p in byh if p['part']=='body' and re.search(r'recommend|suggest|should|would be advisable|essential',p['sents'][0],re.I)],
           'Findings':[lead(p) for p in byh if p['part']=='body' and not re.search(r'recommend|suggest|should|advisable|essential',' '.join(p['sents']),re.I)]}
      sec={k:[x for x in v if x] for k,v in sec.items()}
      for k in range(cap['match']):
        rounds.append({'id':rid('match'),'game':'match','prompt':'Match each sentence to its section.','pairs':[[R.choice(v),h] for h,v in sec.items()],
          'note':'Introduction → Findings → Recommendations → Conclusion.','tag':'Report sections'})
  return rounds

if __name__=='__main__':
  from collections import Counter
  keys=list(TASK)
  for i,t in enumerate(keys):
    R=random.Random(20261102+100+i)
    rs=build([t],R,t,{'order':10,'where':16,'sort':4,'odd':6,'match':6,'sort3':6})
    json.dump({'version':1,'section':'writing','topic':TASK[t],'level':'B2','ultimate':True,
      'about':'The Ultimate Challenge’s own rounds: never played on the Board. Every sentence comes from the model '+TASK[t].lower()+'s, never from the Board’s phrase lists. Built by tools/build-writing-ultimate.py.',
      'exam':['choose','sort','match','odd','order'],'productive':4,'rounds':rs},open(ROOT+f'data/challenge/ultimate-writing-{t}.json','w'),ensure_ascii=False,indent=1)
    print(t,len(rs),dict(Counter(r['game'] for r in rs)),Counter(p['part'] for p in PARTS if p['task']==t))
  R=random.Random(20261102+999)
  rs=build(keys,R,'all',{'order':12,'where':24,'which':30,'sort':6,'odd':8,'match':40,'sort3':8})
  json.dump({'version':1,'section':'writing','topic':'All tasks','level':'B2','ultimate':True,
    'about':'The Ultimate Challenge across every writing task: introductions, body paragraphs and conclusions from the model texts, and which task each sentence belongs to. Never played on a Board. Built by tools/build-writing-ultimate.py.',
    'exam':['choose','sort','match','odd','order'],'productive':4,'rounds':rs},open(ROOT+'data/challenge/ultimate-writing-all.json','w'),ensure_ascii=False,indent=1)
  print('all',len(rs),dict(Counter(r['game'] for r in rs)))
  # the Game on "All tasks" plays every Board together
  json.dump({'version':1,'section':'writing','topic':'All tasks','level':'B2','exam':['choose','sort','match','odd','order'],'productive':4,'rounds':[],
    'imports':[{'file':f'/data/challenge/challenge-writing-{t}.json'} for t in keys]},open(ROOT+'data/challenge/challenge-writing-all.json','w'),ensure_ascii=False,indent=1)
