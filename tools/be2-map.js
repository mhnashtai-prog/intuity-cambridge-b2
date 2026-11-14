/* INTUITY · THE MAP OF THE APP (11 Nov 2026)
   The six skills and the pages on each skill's menu, in one place: the home
   page draws its menus from it, and the review's data screen measures what
   has been explored against it. Change a menu HERE, not in index.html.
   Window globals: BE2_MAP = {areas, skills, sub, keyOf(url), itemsOf(key)}. */
(function (g) {
var AREAS = [
  { key:'grammar',    name:'Grammar',    tone:{bg:'#DD8E58', fg:'#FEFCF9'},
    what:'Tense maps, conditionals, modals, phrasal verbs' },
  { key:'vocabulary', name:'Vocabulary', tone:{bg:'#708A81', fg:'#FEFCF9'},
    what:'Collocations, phrase banks, synonyms' },
  { key:'english',    name:'Use of English', tone:{bg:'#E5D1B8', fg:'#2B2129'},
    what:'Parts 1–4, with key word transformation' },
  { key:'reading',    name:'Reading',    tone:{bg:'#C2956E', fg:'#2B2129'},
    what:'Parts 5–7 and full practice tests' },
  { key:'writing',    name:'Writing',    tone:{bg:'#484641', fg:'#EBE7DE'},
    what:'Essays, reviews, reports, emails, articles' },
  { key:'speaking',   name:'Speaking',   tone:{bg:'#DD8E58', fg:'#FEFCF9'},
    what:'Practice hub, picture tasks, dialogue work' }
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
    {name:"Relative Pronouns & More", url:"skills/grammar-rules/miscellaneous-rules.html", hint:"Relative clauses, modals, quantifiers, negation, cleft sentences, fixed phrases"},
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
  english:[
    {name:"Part 1 \u00b7 Multiple Choice Cloze", part:1, url:"skills/use-of-english/multiple-choice/multiple-choice.html"},
    /* the Master rings go live one by one as each page ships — a ring that opens a
       missing page loses a student's trust. Switch each on by removing its comment. */
    {name:"Master \u00b7 Part 1", part:1, url:"skills/use-of-english/multiple-choice/master-part1.html", fix:"p1-"},
    {name:"Part 2 \u00b7 Open Cloze", part:2, url:"skills/use-of-english/gap-fill/gap-fill.html"},
    {name:"Master \u00b7 Part 2", part:2, url:"skills/use-of-english/gap-fill/master-part2.html", fix:"p2-"},
    {name:"Part 3 \u00b7 Word Formation", part:3, url:"skills/use-of-english/word-formation/word-formation.html"},
    {name:"Master \u00b7 Part 3", part:3, url:"skills/use-of-english/word-formation/word-families.html", fix:"wf-"},
    {name:"Part 4 \u00b7 Key Word Transformation", part:4, url:"skills/use-of-english/word-transformation/word-transformation.html"},
    {name:"Master \u00b7 Part 4", part:4, url:"skills/use-of-english/word-transformation/master-part4.html", fix:"p4-"},
    {name:"Full tests", url:"skills/full-test/full-test.html"}
  ],
  reading:[
    {name:"Part 5 \u00b7 Multiple Choice", url:"skills/reading/multiple-choice-menu/reading-part5.html"},
    {name:"Part 6 \u00b7 Gapped Text", url:"skills/reading/gapped-texts-menu/reading-part6.html"},
    {name:"Part 7 \u00b7 Multiple Matching", url:"skills/reading/multiple-matching-menu/reading-part7.html"},
    {name:"Full tests", url:"skills/full-test/full-test.html?from=reading"}
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
    {group:"Part 1 · Everyone writes"},
    {name:"Essay", glyph:"¶", url:"skills/writing/gate.html?task=essays"},
    {group:"Part 2 · Choose one", rule:true},
    {name:"Email / Letter", glyph:"@", url:"skills/writing/gate.html?task=emails"},
    {name:"Article", glyph:"A", url:"skills/writing/gate.html?task=articles"},
    {name:"Review", glyph:"★", url:"skills/writing/gate.html?task=reviews"},
    {name:"Story", glyph:"✎", exam:"schools", url:"skills/writing/gate.html?task=story"},
    {name:"Report", glyph:"≡", exam:"standard", url:"skills/writing/gate.html?task=reports"},
    /* ONE SCREEN, NINE TILES (14 Nov 2026, the owner: fifteen tiles overwhelmed
       pupils). The six tasks stay; everything else lives under three roofs,
       one tile each. A roof's pages share a row of tabs in their title line
       (tools/writing-roof.js), so moving between them feels like one page.
       The Phrase Bank lives in Vocabulary only now (a different purpose), and
       How it's marked is the round pill in the menu's footer (PILLS below). */
    {group:"Help yourself", rule:true},
    {name:"Look it up", glyph:"“", hint:"Models, study cards, compare", roof:"look"},
    {name:"Practise", glyph:"…", hint:"Finish it, games, sentences", roof:"practise"},
    {name:"Test yourself", glyph:"◆", hint:"Revision Round, Challenge", roof:"test"}
  ],
  speaking:[
    {name:"Practice Hub", noNum:true, url:"skills/speaking/speaking-format.html"},
    {name:"Personal questions", part:1, url:"skills/speaking/part1.html"},
    {name:"Comparing photos",   part:2, url:"skills/speaking/part2-turn.html"},
    {name:"Collaborate",        part:3, url:"skills/speaking/part3-talk.html"},
    {name:"Discussion",         part:4, url:"skills/speaking/part4-views.html"},
    {name:"Useful expressions", noNum:true, url:"skills/speaking/useful-expressions.html"},
    {name:"Drills with Maya", noNum:true, url:"skills/speaking/drills.html"}
  ]
};
  
var SUB = {
  /* Writing tasks open the portfolio sheet now; Sentence Structure is the one sub-menu left */
  sentence:{ title:"Sentence Structure", items:[
    {name:"Sentence Builder", hint:"Join two ideas", url:"skills/writing/sentence-structure/sentence-builder.html"},
    {name:"Paragraph Builder", hint:"Topic, reasons, link", url:"skills/writing/sentence-structure/paragraph-builder.html"},
    {name:"Cohesion Tools", hint:"Link, refer, replace", url:"skills/writing/sentence-structure/cohesion-drills.html"},
    {name:"Sentence Types", hint:"Simple to complex", url:"skills/writing/sentence-structure/sentence-type.html"}
  ]}
};

/* THE ROOFS (14 Nov 2026): a menu tile opens the first page; the others are its tabs.
   match: other pages that light the same tab (the four Sentence Structure pages). */
var ROOFS = {
  look:{ name:"Look it up", items:[
    {name:"Models", url:"skills/writing/build.html?type=essays&view=models", match:["skills/writing/build.html"]},
    {name:"Study cards", url:"skills/writing/cue-cards-print.html?type=fa,op,ad,ps,ce,st", match:["skills/writing/cue-cards-print.html"]},
    {name:"Compare", url:"skills/writing/compare.html"}
  ]},
  practise:{ name:"Practise", items:[
    {name:"Finish it", url:"skills/writing/practice.html"},
    {name:"Games", url:"skills/writing/games/essay-games-staged.html"},
    {name:"Sentences", url:"index.html?openModal=writing&submenu=sentence",
      match:["skills/writing/sentence-structure/sentence-builder.html","skills/writing/sentence-structure/paragraph-builder.html","skills/writing/sentence-structure/cohesion-drills.html","skills/writing/sentence-structure/sentence-type.html"]}
  ]},
  test:{ name:"Test yourself", items:[
    {name:"Revision", url:"skills/writing/the-question.html"},
    {name:"Challenge", url:"skills/challenge/challenge.html?section=writing"}
  ]}
};
/* A menu's round pill in its footer, apart from the tiles, as DAILY 5 is on the home page */
var PILLS = {
  writing:{ label:"Marking", aria:"How it's marked", url:"skills/writing/sentence-structure/band-descriptors.html" }
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
    if (PILLS[key]) out.push({ name: PILLS[key].aria, url: '/' + PILLS[key].url, key: keyOf('/' + PILLS[key].url) });
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
  g.BE2_MAP = { areas: AREAS, skills: SKILLS, sub: SUB, roofs: ROOFS, pills: PILLS, keyOf: keyOf, itemsOf: itemsOf, roofOf: roofOf };
})(window);
