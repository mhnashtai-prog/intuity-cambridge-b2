"""WHICH TASK IS THIS? (5 Nov 2026) — recognition before production.

Writes data/writing/which-task.json, used by
  · skills/writing/compare-test.html  (the "Test yourself" drill after Compare)
  · tools/build-writing-ultimate.py   (the Ultimate's "Which task?" rounds)

Every line comes from the app's model texts (the ones Compare shows) or from
the real exam questions, hand-picked so that ONE clue settles the answer.
The clue is marked [[like this]]; after each tap the drill and the Ultimate
light it up and give the one-line reason, so a wrong answer teaches too.

The four steps get harder:
  1  openings      — two choices: Essay or Article, Review or Report
  2  endings       — four choices
  3  exam questions — "Which task is this asking for?" (the task word hidden)
  4  body lines    — Review or Report: same attitude, only the voice differs
Rerun after editing this file:  python3 tools/build-which-task.py"""
import json, os, re
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
W = os.path.join(R, 'skills', 'writing')
PAIR = {'Essay': 'Article', 'Article': 'Essay', 'Review': 'Report', 'Report': 'Review'}
ALL4 = ['Essay', 'Article', 'Review', 'Report']

# step, answer, text with [[clue]], why (said after "Answer —")
ITEMS = [
 # One clue phrase, one answer: no clue is used twice, and no phrase that
 # gives one item away appears in an item with another answer (checked at
 # the end of this file). Michael, 5 Nov: students must learn the genre,
 # not a handful of stock phrases.
 # ── 1 · OPENINGS ───────────────────────────────────────────────────────
 (1, 'Essay', '[[It is widely recognised that]] technology has transformed modern communication completely.',
  'it states the topic in an impersonal way: no “I”, no “you”.'),
 (1, 'Essay', '[[In recent years]], social media addiction has become [[a significant concern]] among young people.',
  'an impersonal opening that sets out a current issue to discuss.'),
 (1, 'Essay', 'Nowadays, there is considerable debate about whether life today is better than in the past. [[Hence, I would like to present my views on this issue.]]',
  'it promises a view on a debate. In an essay “I” is only for your opinion.'),
 (1, 'Essay', '[[It is common knowledge that]] taking time off from education can have [[both positive and negative effects]].',
  '“both positive and negative effects”: an essay promises a balanced discussion.'),
 (1, 'Article', '[[Which piece of technology would our lives be better without?]] It’s a provocative question in a world where we carry our phones [[like a second heartbeat]].',
  'it asks the reader a question and paints a vivid picture.'),
 (1, 'Article', '[[Why do so many students find it so difficult to stay healthy?]]',
  'a question hooks the reader before any answer is given.'),
 (1, 'Article', '[[Who has never experienced a change that turned their world upside down?]]',
  'a question every reader answers “me!”: an article pulls the reader in.'),
 (1, 'Article', '[[For me, the answer has always been the same:]] Sintra, a small town tucked into the hills just outside Lisbon.',
  '“For me”: an article is personal and sounds like a person talking.'),
 (1, 'Review', '[[I visited]] last weekend to celebrate my birthday, and [[I have to say]] it exceeded all my expectations.',
  'the writer was there: a review starts from personal experience.'),
 (1, 'Review', '[[A friend dragged me along]] to Wembley not knowing what to expect, and [[I ended up having one of the best evenings of my life]].',
  'a personal story told with feeling: the writer went and loved it.'),
 (1, 'Review', '[[I sat down to watch one episode]] and [[ended up finishing the entire series in a single evening]].',
  'the writer’s own experience, told to entertain: a review judges as it tells.'),
 (1, 'Report', '[[The main objective of this report is to]] assess the school cafeteria and suggest improvements.',
  'it states its aim in the first line, as every report does.'),
 (1, 'Report', '[[This report is based on a questionnaire]] conducted among over 200 students.',
  'a questionnaire and 200 students: a report collects facts from others.'),
 (1, 'Report', '[[The information presented was collected through]] questionnaires completed by participating students.',
  'where the facts came from, in impersonal words: no “I”, no story.'),
 # ── 2 · ENDINGS ────────────────────────────────────────────────────────
 (2, 'Essay', '[[All things considered]], it enhances communication [[when used responsibly alongside]] real-world interaction.',
  'it weighs both sides and reaches a balanced verdict.'),
 (2, 'Essay', '[[To sum up]], [[I believe]] pollution can be addressed effectively through determined action.',
  'a formal linker to sum up, then a clear opinion: the essay’s “I” is for its view.'),
 (2, 'Essay', '[[On the whole]], the best choice depends entirely on individual priorities, personality and circumstances.',
  'it weighs the question up and concludes: no “you”, no story.'),
 (2, 'Article', 'It’s hard to imagine life without our smartphones, [[but perhaps that’s exactly the problem]].',
  'a chatty twist (“It’s”, “our”) that leaves the reader thinking.'),
 (2, 'Article', '[[Whether you agree with my choice or not]], lasting fame means leaving something meaningful behind long after the applause has faded.',
  'it talks to “you” about “my choice”: personal and direct.'),
 # written for this test (not from a model text), as Michael suggested: an ending with a call to the reader
 (2, 'Article', '[[So next time]] you reach for your phone at dinner, [[ask yourself]]: who is really in control — you or the screen?',
  'it ends with a challenge and a question for the reader to take away.'),
 (2, 'Review', '[[I would highly recommend]] Bella Napoli [[to anyone interested in]] genuine Italian food.',
  'it tells readers whether to go: every review ends with a recommendation.'),
 (2, 'Review', '[[I would strongly urge anyone]] heading to Spain to [[pick up a copy before they go]].',
  'it tells readers what to buy: a review of a guidebook.'),
 (2, 'Review', '[[I guarantee you will leave satisfied]] and already planning your next visit.',
  'a personal promise to the reader about a place the writer has tried.'),
 (2, 'Report', '[[Taking everything into account, it seems clear that]] these changes would improve student satisfaction and make lunchtime more enjoyable.',
  'an impersonal verdict on “these changes”: a report sums up its recommendations.'),
 (2, 'Report', '[[One key recommendation would be to]] introduce staggered lunch times to reduce queues.',
  'a polite, formal suggestion to the people in charge.'),
 (2, 'Report', '[[It is essential that]] students receive clear guidance and support throughout the placement.',
  'a firm, impersonal recommendation about what the organisers must do.'),
 # ── 4 · BODY LINES, REVIEW OR REPORT ───────────────────────────────────
 (4, 'Review', 'The best feature is the homemade pasta — [[I ordered the seafood linguine]] and it was absolutely delicious.',
  '“I ordered”: the writer judges by their own experience.'),
 (4, 'Review', '[[The thing that is most likely to impress you is]] how he builds complex songs layer by layer [[right in front of your eyes]].',
  'it talks to “you” and gets excited about it.'),
 (4, 'Review', 'One of the most useful ideas was habit stacking, which [[helped me]] build a consistent study schedule.',
  '“helped me”: a review judges by what it did for the writer.'),
 (4, 'Review', 'The writers are not afraid to [[tell you]] which attractions are overrated.',
  'it speaks to “you”, the reader who might buy the guidebook.'),
 (4, 'Review', '[[What I found particularly charming]] was when the owner came to our table to recommend dishes personally.',
  '“What I found…”: the writer’s own reactions, in their own voice.'),
 (4, 'Report', 'However, [[one major concern expressed by students]] is the long queues at lunchtime.',
  'the views are other people’s, reported calmly: “expressed by students”.'),
 (4, 'Report', '[[It was generally felt that]] host families were welcoming and provided comfortable accommodation.',
  '“It was generally felt”: a report gives what the group thought, not “I”.'),
 (4, 'Report', '[[Many participants reported]] improved confidence, greater independence and a better understanding of Spanish culture.',
  'it reports findings from many people.'),
 # adapted (5 Nov): the model line opened “By far the worst aspect…”, which could be a review
 (4, 'Report', '[[Several students mentioned]] the early closing time, which prevents them from studying after school.',
  'it passes on what “several students” said: a finding, not the writer’s taste.'),
 (4, 'Report', 'However, [[a common complaint relates to]] the course materials, which some participants found repetitive.',
  'a complaint gathered from others, in neutral words.'),
]

# ── 3 · EXAM QUESTIONS: the real prompts, the task word hidden ─────────────
HIDE = re.compile(r'\b(?:an? )?(essays?|articles?|reviews?|reports?)\b', re.I)   # “an essay” would give it away
def hide(s): return HIDE.sub('▁▁▁', s)
def q(answer, text, clues, why):
    t = hide(text)
    for c in clues:
        c2 = hide(c)
        assert c2 in t, (c2, t)
        t = t.replace(c2, '[[' + c2 + ']]', 1)
    ITEMS.append((3, answer, t, why))

ess = {x['id']: x for x in json.load(open(os.path.join(W, 'essays', 'data', 'essay-questions.json')))['questions']}
art = {x['id']: x for x in json.load(open(os.path.join(W, 'articles', 'data', 'article-questions.json')))['questions']}
rev = {x['id']: x for x in json.load(open(os.path.join(W, 'reviews', 'data', 'review-questions.json')))['questions']}
rep = {x['id']: x for x in json.load(open(os.path.join(W, 'reports', 'data', 'report-questions.json')))['questions']}
def essay(k):
    x = ess[k]; pts = [p.replace('…………………………', '……').replace('……………………', '……') for p in x['writingPoints']]
    return x['context'] + ' ' + x['mainQuestion'] + ' Notes — write about: ' + ', '.join(pts) + '.'
def notice(x):
    a = x['announcement'].strip()
    return x['context'] + ' ' + a + ('' if a[-1] in '.!?:' else '.') + ' ' + x['question']
def article(k):
    x = art[k]
    return 'You see this announcement in an English-language magazine. Articles wanted! ' + x['question'] + ' ' + x['print']

q('Essay', essay('life-better-today'), ['your English teacher has asked you', 'Do you agree?', '(your own idea)'],
  'a teacher, a statement to agree with and three notes, one your own: always the essay.')
q('Essay', essay('friends-vs-family'), ['your English teacher has asked you', '(your own idea)'],
  'a question to discuss in class, with notes to cover: the essay.')
q('Essay', essay('endangered-animals'), ['Now, your English teacher has asked you', 'Do you agree?', 'Notes — write about:'],
  'a statement to agree or disagree with, and notes to cover: the essay.')
q('Article', article('technology'), ['English-language magazine', 'Why?', 'will be printed next month'],
  'a magazine asks readers for their view, and the best ones are printed: an article.')
q('Article', article('famous'), ['If you could be famous for something', 'will be printed next month'],
  'a “what if” question for magazine readers: an article, told in your own voice.')
q('Article', article('changes'), ['What about you?', 'will be printed next month'],
  '“What about you?”: a magazine wants personal pieces to print.')
q('Review', notice(rev['ocean-documentary']),
  ['say whether other people would find it interesting too'],
  'something you watched, and whether others would like it: a review.')
q('Review', notice(rev['duolingo-app']),
  ['whether you would recommend it to other people'],
  'an app you use, judged for other users: a review.')
q('Review', notice(rev['atomic-habits-book']),
  ['say why you would recommend it to others'],
  'a book you have read, recommended to readers: a review.')
q('Report', rep['school-facilities']['context'] + ' ' + rep['school-facilities']['question'],
  ['Your school principal has asked you', 'suggesting improvements'],
  'the principal wants facts and suggestions: a report.')
q('Report', rep['exchange-programme']['question'],
  ['for your school', 'whether the school should continue it'],
  'the school must decide whether to continue: a report helps people in charge decide.')
q('Report', rep['cafeteria-services']['context'] + ' ' + rep['cafeteria-services']['question'],
  ['The school wants to improve', 'suggesting improvements'],
  'the school wants to improve a service: a report assesses it and suggests changes.')

out = []
n = {}
for step, ans, text, why in ITEMS:
    assert ans in ALL4 and '[[' in text, text
    n[step] = n.get(step, 0) + 1
    out.append({'id': 'wt%d-%02d' % (step, n[step]), 'step': step, 'answer': ans,
                'options': ALL4 if step in (2, 3) else sorted([ans, PAIR[ans]], key=ALL4.index),
                'text': text, 'why': why})
# ── THE CHECK: one clue, one answer ────────────────────────────────────────
low = lambda t: re.sub(r'\s+', ' ', t.replace('[[', '').replace(']]', '').lower())
seen = {}
for x in out:
    if x['step'] == 3: continue          # the exam's own fixed wording repeats on purpose
    for c in re.findall(r'\[\[(.+?)\]\]', x['text']):
        k = c.lower().strip(' ,.:')
        assert k not in seen, 'clue used twice: %r (%s, %s)' % (c, seen[k], x['id'])
        seen[k] = x['id']
        for y in out:
            if y['answer'] != x['answer'] and k in low(y['text']):
                raise SystemExit('clue %r of %s also appears in %s (%s)' % (c, x['id'], y['id'], y['answer']))
STEPS = [{'step': 1, 'name': 'Openings', 'ask': 'Which task does this opening come from?'},
         {'step': 2, 'name': 'Endings', 'ask': 'Which task does this ending come from?'},
         {'step': 3, 'name': 'Exam questions', 'ask': 'Which task is this question asking for?'},
         {'step': 4, 'name': 'Body lines', 'ask': 'Review or report? Listen for the voice.'}]
json.dump({'about': __doc__.split('\n\n')[0], 'steps': STEPS, 'items': out},
          open(os.path.join(R, 'data', 'writing', 'which-task.json'), 'w'), ensure_ascii=False, indent=1)
print({s: sum(1 for x in out if x['step'] == s) for s in (1, 2, 3, 4)})
