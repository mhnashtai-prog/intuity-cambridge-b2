/* INTUITY · THE MAP OF THE APP (11 Nov 2026)
   The six skills and the pages on each skill's menu, in one place: the home
   page draws its menus from it, and the review's data screen measures what
   has been explored against it. Change a menu HERE, not in index.html.
   Window globals: BE2_MAP = {areas, skills, sub, keyOf(url), itemsOf(key)}. */
(function (g) {
var AREAS = [
  /* 27 Nov 2026 (the owner, after a pupil's idea): the exam papers first, in the paper's order;
     then Grammar, and Vocabulary last (the owner: many coursebooks put
     the word lists at the end). The colours
     belong to the places, not the areas (the owner: the old order of colours was more appealing):
     caramel, sage, sand, tan, charcoal, caramel, top to bottom */
  { key:'english',    name:'Use of English', tone:{bg:'#DD8E58', fg:'#FEFCF9'},
    what:'Parts 1–4, with key word transformation' },
  { key:'reading',    name:'Reading',    tone:{bg:'#708A81', fg:'#FEFCF9'},
    what:'Parts 5–7 and full practice tests' },
  { key:'writing',    name:'Writing',    tone:{bg:'#E5D1B8', fg:'#2B2129'},
    what:'Essays, reviews, reports, emails, articles' },
  { key:'speaking',   name:'Speaking',   tone:{bg:'#C2956E', fg:'#2B2129'},
    what:'Four Parts: Maya asks, you answer, now' },
  { key:'grammar',    name:'Grammar',    tone:{bg:'#484641', fg:'#EBE7DE'},
    what:'Tense maps, conditionals, modals, phrasal verbs' },
  { key:'vocabulary', name:'Vocabulary', tone:{bg:'#DD8E58', fg:'#FEFCF9'},
    what:'Collocations, phrase banks, synonyms' }
];

var SKILLS = {
  grammar:[
    {name:"Tenses", url:"skills/grammar-rules/tenses-rules.html"},
    {name:"Conditionals", url:"skills/grammar-rules/conditionals-rules.html"},
    {name:"Past Modals", url:"skills/grammar-rules/past-modals-rules.html"},
    {name:"Comparatives", url:"skills/grammar-rules/comparatives-rules.html"},
    {name:"Passive Voice", url:"skills/grammar-rules/passive-voice-rules.html"},
    {name:"Reported Speech", url:"skills/grammar-rules/reported-speech-rules.html"},
    {name:"Linking Words", url:"skills/grammar-rules/linking-words-rules.html"},
    {name:"Inversion", url:"skills/grammar-rules/inversion-rules.html"},
    {name:"Gerunds & Infinitives", url:"skills/grammar-rules/gerunds-infinitives-rules.html"},
    {name:"Relative Pronouns & More", url:"skills/grammar-rules/miscellaneous-rules.html"},
    /* every topic at once, as the exam mixes them (3 Nov 2026) */
    {name:"Mixed Board", url:"skills/challenge/challenge.html?board=1&topic=grammar-mixed"},
    {name:"The Ultimate Challenge", url:"skills/challenge/challenge.html"}
  ],
  vocabulary:[
    {name:"Similar Words", url:"skills/similar-words/vocabulary.html"},
     {name:"Topic Vocabulary", url:"skills/similar-words/topic-vocabulary.html"},
    {name:"Collocations", url:"skills/similar-words/collocations.html"},
    {name:"Descriptive Words", url:"skills/similar-words/collective-expressions-master.html"},
    {name:"Prepositions", url:"skills/similar-words/prepositions.html"},
    {name:"Phrasal Verbs 1", url:"skills/grammar-rules/phrasal-verbs-quiz.html"},
    {name:"Phrasal Verbs 2", url:"skills/grammar-rules/phrasal-verbs-play.html"},
    {name:"Synonyms", url:"skills/similar-words/academic-vocabulary.html", hint:"Better words for say, talk, think, walk and run"},
    {name:"Idiomatic Expressions", url:"skills/similar-words/proverbs-quiz.html"},
    {name:"Phrase Bank", url:"skills/similar-words/phrase-bank.html"},
    {name:"The Ultimate Challenge", url:"skills/challenge/challenge.html?section=vocabulary"}
  ],
  /* each Part has its exam ring; a Part's learning ring sits beside it and
     shares its number, so both Part 3 rings read 03 and Part 4 stays 04 */
  /* 25 Nov 2026 (the owner: "the same trimming" as Speaking and Writing): four rings, one per
     Part, each opening the Part as in the paper (its exam text); the Part's Learn, Drill and
     Game are the page's footer pills (tools/english-foot.js), and nothing switches to another
     Part. The whole paper is the menu's Full tests pill. */
  english:[
    /* THREE SECTIONS, HAIRLINES BETWEEN (26 Nov 2026, the owner, as in the Writing menu): the whole
       paper; its two halves, each timed on its own (the pupils: "why not a whole test of Use of
       English?"); then the Parts. Use of English and Reading share the top two sections, so a
       pupil finds the tests in the same place on either menu. The Full tests pill became the top
       section. The rings carry a drawn sign, not numbers (the owner: "the numbers look odd"):
       a full disc for the whole paper, its left and right halves for the two halves. */
    {group:"The whole paper · 75 minutes", tests:true},
    {name:"Full tests", pie:"full", url:"skills/full-test/full-test.html?from=english"},
    {group:"Half a paper", rule:true, tests:true},
    {name:"Full Use of English", pie:"l", url:"skills/full-test/full-test.html?paper=english&from=english"},
    {name:"Full Reading", pie:"r", url:"skills/full-test/full-test.html?paper=reading&from=english"},
    {group:"The four Parts", rule:true},
    {name:"Multiple choice", part:1, url:"skills/use-of-english/multiple-choice/multiple-choice-texts.html"},
    {name:"Open cloze", part:2, url:"skills/use-of-english/gap-fill/gap-fill.html"},
    {name:"Word formation", part:3, url:"skills/use-of-english/word-formation/word-formation.html"},
    {name:"Key word transformation", part:4, url:"skills/use-of-english/word-transformation/word-transformation.html"}
  ],
  reading:[
    /* THREE SECTIONS, HAIRLINES BETWEEN (26 Nov 2026, the owner, as in the Writing menu): the whole
       paper; its two halves, each timed on its own (the pupils: "why not a whole test of Use of
       English?"); then the Parts. Use of English and Reading share the top two sections, so a
       pupil finds the tests in the same place on either menu. The Full tests pill became the top
       section. The rings carry a drawn sign, not numbers (the owner: "the numbers look odd"):
       a full disc for the whole paper, its left and right halves for the two halves. */
    {group:"The whole paper · 75 minutes", tests:true},
    {name:"Full tests", pie:"full", url:"skills/full-test/full-test.html?from=reading"},
    {group:"Half a paper", rule:true, tests:true},
    {name:"Full Use of English", pie:"l", url:"skills/full-test/full-test.html?paper=english&from=reading"},
    {name:"Full Reading", pie:"r", url:"skills/full-test/full-test.html?paper=reading&from=reading"},
    {group:"The three Parts", rule:true},
    {name:"Multiple choice", part:5, url:"skills/reading/multiple-choice-menu/reading-part5.html"},
    {name:"Gapped text", part:6, url:"skills/reading/gapped-texts-menu/reading-part6.html"},
    {name:"Multiple matching", part:7, url:"skills/reading/multiple-matching-menu/reading-part7.html"}
  ],
  /* Writing is grouped (Oct 2026): what you write / what helps / check yourself.
     Numbers read as a sequence that never existed, so each ring carries a glyph.
     exam:'schools'|'standard' tags a task only one version of B2 First sets
     (Story: for Schools; Report: standard). Both are always shown: the school
     teaches both. */
    writing:[
    /* THE EXAM'S SHAPE (5 Nov 2026, from an assessor's critique): the essay is
       the compulsory Part 1; the rest are Part 2 choices, below a hairline.
       7 Nov 2026: the review deck no longer sits on top of Writing; it
       belongs to the home screen's own "to review" link, not to a task menu. */
    /* 25 Nov 2026 (the owner): a task tile opens its Model at once, the page that needs no thinking
       (the lure); the gate is gone. Basics, Exercises and Game are footer options (tools/writing-foot.js). Its Basics, Exercises and Game are the page's footer pills (tools/writing-foot.js) */
    {group:"Part 1 · Everyone writes"},
    {name:"Essay", glyph:"¶", url:"skills/writing/essays/essay-model.html"},
    /* 19 Nov 2026 (a learner: "confusing if you don't know which version you're sitting") */
    {group:"Part 2 · Choose one", rule:true, note:"Story: only in B2 First for Schools. Report: only in B2 First."},
    {name:"Email / Letter", glyph:"@", url:"skills/writing/emails/email-model.html"},
    {name:"Article", glyph:"A", url:"skills/writing/articles/article-model.html"},
    {name:"Review", glyph:"★", url:"skills/writing/reviews/reviews-cards.html"},
    {name:"Story", glyph:"✎", exam:"schools", url:"skills/writing/narrative/narrative-cards.html"},
    {name:"Report", glyph:"≡", exam:"standard", url:"skills/writing/reports/reports-cards.html"},
    /* ONE SCREEN, NINE TILES (14 Nov 2026, the owner: fifteen tiles overwhelmed
       pupils). The six tasks stay; everything else lives under three roofs,
       one tile each. A roof's pages share a row of tabs in their title line
       (tools/writing-roof.js), so moving between them feels like one page.
       The Phrase Bank lives in Vocabulary only now (a different purpose), and
       How it's marked is the round pill in the menu's footer (PILLS below). */
    {group:"Help yourself", rule:true},
    /* 14 Nov 2026 (evening): ONE HOME PER PAGE. Models and Study cards belong to a
       task, so they live behind each task's "Learn it" door; Compare is what is left
       of Look it up, and it is a tile of its own. */
    /* 19 Nov 2026 (a learner: "my question is How do I give my opinion?"): the one
       cross-task reference, phrases by what you want to say; it keeps Essentials' grouping */
    {name:"Phrase ladder", glyph:"❝", hint:"Learn them, one step at a time", url:"skills/writing/phrases-ladder.html"},   /* 21 Nov 2026: the ladder is the way in; the list is one tap away on it */
    {name:"Compare", glyph:"⇄", hint:"Same topic, two tasks", url:"skills/writing/compare.html"},
    /* 14 Nov 2026: Practice (Finish it…) moved into each task's Practise it, so this
       tile keeps what belongs to no one task, and a name that is not "Practise" twice */
    /* 19 Nov 2026 (a learner: "every tile is a skill… Games is what it really is") */
    /* 21 Nov 2026 (the owner): the Games tile moved to the menu footer, a ringed pill (index.html, contHTML) */
    {name:"Revision", glyph:"◆", hint:"Revision Round, Challenge", roof:"test"}
  ],
  /* SPEAKING ON WRITING'S PATTERN (22 Nov 2026): each Part is a gate with four doors
     (skills/speaking/gate.html?part=N), as each writing task is; what helps any Part sits
     under Help yourself, with the Hub (the test's shape, 14 minutes) */
  /* 23 Nov 2026 (the owner, after the pupils' verdict): four rings, each Part practised NOW on
     its own page (test.html?part=N); its structures, drills and games are that page's footer
     pills, not more rings. The whole test is the panel's pill, as Use of English's Full tests. */
  speaking:[
    {group:"The four Parts"},
    {name:"Interview",   part:1, url:"skills/speaking/test.html?part=1"},
    {name:"Long turn",   part:2, url:"skills/speaking/test.html?part=2"},
    {name:"Collaborate", part:3, url:"skills/speaking/test.html?part=3"},
    {name:"Discuss",     part:4, url:"skills/speaking/test.html?part=4"}
  ]
};
  
var SUB = {};   /* 14 Nov 2026: Writing's last sub-menu (Sentence Structure) became two Practise tabs */

/* THE ROOFS (14 Nov 2026): a menu tile opens the first page; the others are its tabs.
   match: other pages that light the same tab (the four Sentence Structure pages). */
var ROOFS = {
  practise:{ name:"Games", items:[
    {name:"Games", url:"skills/writing/games/essay-games-staged.html"},
    /* 14 Nov 2026: the Sentence Structure sub-menu is gone. Paragraph Builder and
       Cohesion Tools retired (their useful parts moved to Games · Builder, Part 2
       Master and Sentence Types · Upgrade); the two that stay are tabs of their own. */
    {name:"Sentences", url:"skills/writing/sentence-structure/sentence-builder.html"},
    {name:"Types", url:"skills/writing/sentence-structure/sentence-type.html"}
  ]},
  test:{ name:"Revision", items:[
    {name:"Revision", url:"skills/writing/the-question.html"},
    {name:"Challenge", url:"skills/challenge/challenge.html?section=writing"}
  ]}
};
/* THE TASK ROOFS (14 Nov 2026): a writing task's page has four doors; two of them
   are roofs whose pages share tabs, as the menu's roofs do. {k} is the task
   (essays, reviews…), {print} its study-card types, {topic} its Phrase game.
   only: the tab exists for those tasks (Hear the phrases: essay, review, report). */
var TASKROOFS = {
  /* 14 Nov 2026 (night), the owner: Hear the phrases overwhelmed and is no longer
     needed (its Sort and Write rounds repeated the Game and Recall); Essentials is
     read and kept, so it joins Learn it; the doing goes behind Practise it. */
  learn:{ name:"Learn it", items:[
    /* 19 Nov 2026 (the owner): "Basics" on trial; a class poll against "5 Sentences" decides */
    {name:"The five", url:"skills/writing/five.html?task={k}"},
    /* 22 Nov 2026 (the owner): the Guided essay straight after Basics, essays only: the core
       phrases of Basics seen at once in a whole essay (introduce, then the model, then variety) */
    /* 25 Nov 2026: Guided left these tabs; it is step 4 of the practice track */
    {name:"Build your own", url:"skills/writing/build.html?type={k}&view=models"},   /* 17 Nov: a frame you build, not model essays (those are in door 3) */
    /* 25 Nov 2026 (the owner: "we lost the ready-made cards next to Build"): Cards is back */
    {name:"Ready-made", url:"skills/writing/cue-cards-print.html?type={print}"}
    /* 25 Nov 2026 (the owner: Basics must be immediately likeable): Cards left these tabs; the Model
       page is the study card now */
    /* 17 Nov 2026 (the owner, after a teen's review): Essentials left Learn it. It opened on the same
       phrases as Build and Cards; the page stays (sheet.html) but no menu leads to it */
  ]},
  /* 25 Nov 2026: the footer's Game is a page of its own; Exercises and Recall share a row */
  game:{ name:"Game", items:[
    {name:"Game", url:"skills/challenge/challenge.html?board=1&section=writing&topic=writing-{topic}"} ]},
  practise:{ name:"Exercises", items:[
    /* "Exercises", not "Practice" or "Rounds": the door is Practise it (14 Nov 2026) */
    {name:"Exercises", url:"skills/writing/practice.html?task={k}"},
    {name:"Recall", url:"skills/writing/recall.html?task={k}"}
  ]}
};
var TASKVARS = {
  essays:{print:"fa,op,ps,ce,st", topic:"essay"}   /* 17 Nov: Agree & Disagree folds into Your view (tools/essay-routes.js?v=6) */, emails:{print:"ef-app,ef-req,ei-news,ei-advice", topic:"email"},
  articles:{print:"ar", topic:"article"}, reviews:{print:"rv", topic:"review"}, reports:{print:"rp", topic:"report"}, story:{print:"sy", topic:"story"}
};
/* A menu's round pill in its footer, apart from the tiles, as DAILY 5 is on the home page */
var PILLS = {
  /* left: a second pill on the footer's left, not an activity (it is not counted):
     the "How to use" clips, Maya's why and how of the whole Writing area (14 Nov 2026) */
  writing:{ label:"Marking", aria:"How it's marked", url:"skills/writing/sentence-structure/band-descriptors.html",
    left:{ label:"How to use", aria:"How to use Writing: three short clips", url:"skills/writing/how.html" } },
  /* Full tests on the title's line (16 Nov 2026, a learner's review): below the
     eight rings it sat under the fold, with nothing to say it was there. It
     stays in the list too. No footer pill, no play mark. */
    speaking:{ left:{ label:"Full test", aria:"Full test: all four Parts, about 14 minutes", url:"skills/speaking/test.html", play:false } }
    /* 26 Nov 2026: Use of English's Full tests pill became the top section of its menu */
};

  /* a page's identity for "explored": its path, plus the one query that picks
     a different page out of the same file (a writing task, a challenge board…) */
  var KEEP = ['task', 'section', 'topic', 'type', 'from'];
  function keyOf(url) {
    var u; try { u = new URL(url, location.origin + '/'); } catch (e) { return String(url); }
    var p = u.pathname.replace(/\/index\.html$/, '/'), q = [];
    KEEP.forEach(function (k) { var v = u.searchParams.get(k); if (v) q.push(k + '=' + v); });
    return p + (q.length ? '?' + q.join('&') : '');
  }
  /* the pupil-facing pages of a skill: its menu, with Sentence Structure opened out */
  function itemsOf(key) {
    var out = [];
    (SKILLS[key] || []).forEach(function (it) {
      if (it.sub && SUB[it.sub]) SUB[it.sub].items.forEach(function (x) { out.push({ name: x.name, url: '/' + x.url, key: keyOf('/' + x.url) }); });
      else if (it.roof && ROOFS[it.roof]) ROOFS[it.roof].items.forEach(function (x) {
        if (x.match && x.url.indexOf('index.html') === 0) x.match.forEach(function (u) { out.push({ name: x.name, url: '/' + u, key: keyOf('/' + u) }); });
        else out.push({ name: x.name, url: '/' + x.url, key: keyOf('/' + x.url) }); });
      else if (it.url) out.push({ name: it.name, url: '/' + it.url, key: keyOf('/' + it.url) });
    });
    if (PILLS[key] && PILLS[key].url) out.push({ name: PILLS[key].aria, url: '/' + PILLS[key].url, key: keyOf('/' + PILLS[key].url) });
    return out;
  }
  /* the roof a page sits under, and which of its tabs it is: the tab's own
     address, or any page in its match list (whatever the query) */
  function roofOf(url) {
    var k = keyOf(url), path = k.split('?')[0], hit = null;
    Object.keys(ROOFS).forEach(function (r) { ROOFS[r].items.forEach(function (x, i) {
      if (hit) return;
      var mine = keyOf('/' + x.url) === k || (x.match || []).some(function (u) { return keyOf('/' + u).split('?')[0] === path; });
      if (mine) hit = { key: r, roof: ROOFS[r], i: i };
    }); });
    return hit;
  }
  /* a roof's tile opens its first page */
  Object.keys(SKILLS).forEach(function (k) { SKILLS[k].forEach(function (it) { if (it.roof && !it.url && ROOFS[it.roof]) it.url = ROOFS[it.roof].items[0].url; }); });
  /* the task a page is about, whatever its address calls it */
  function taskOf(u) {
    var p = u.pathname, q = u.searchParams, t = q.get('task') || q.get('type'), m;
    if (/cue-cards-print/.test(p) && t) { var hit = null; Object.keys(TASKVARS).forEach(function (k) { if (TASKVARS[k].print.split(',').indexOf(t.split(',')[0]) >= 0) hit = k; }); return hit; }
    if (/challenge\.html$/.test(p) && q.get('board') && (m = /^writing-(\w+)/.exec(q.get('topic') || ''))) {
      var hit2 = null; Object.keys(TASKVARS).forEach(function (k) { if (TASKVARS[k].topic === m[1]) hit2 = k; }); return hit2; }
    return TASKVARS[t] ? t : null;
  }
  function taskRoofOf(url) {
    var u; try { u = new URL(url, location.origin + '/'); } catch (e) { return null; }
    var k = taskOf(u); if (!k) return null;
    var fill = function (s) { return s.replace(/\{k\}/g, k).replace(/\{print\}/g, TASKVARS[k].print).replace(/\{topic\}/g, TASKVARS[k].topic); };
    var found = null;
    Object.keys(TASKROOFS).forEach(function (r) {
      var items = TASKROOFS[r].items.filter(function (x) { return !x.only || x.only.indexOf(k) >= 0; })
        .map(function (x) { return { name: x.name, url: fill(x.url) }; });
      items.forEach(function (x, i) { if (!found && new URL('/' + x.url, location.origin).pathname === u.pathname) found = { key: r, task: k, roof: { name: TASKROOFS[r].name, items: items }, i: i }; });
    });
    return found;
  }
  g.BE2_MAP = { areas: AREAS, skills: SKILLS, sub: SUB, roofs: ROOFS, taskRoofs: TASKROOFS, taskVars: TASKVARS, taskRoofOf: taskRoofOf, pills: PILLS, keyOf: keyOf, itemsOf: itemsOf, roofOf: roofOf };
})(window);
