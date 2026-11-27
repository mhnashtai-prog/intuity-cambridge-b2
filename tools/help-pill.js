/* THE HELP PILL (27 Nov 2026, the owner: "a new pill labelled Help for many pages").
   One pill, one corner, every page that has help written for it: bottom right, just above the page's
   own footer or bar. A tap opens the help as a FiveCard (what the page is for · three ways to use it ·
   one tip); nothing ever opens by itself. Pages with nothing written here show no pill, and the full
   tests never do (their Instructions are their help). Loaded by /tools/be2-brand.js.

   To add help for a page: one entry in HELP — a test on the path (and query), then
   { task, open, how:[three lines], tip }. Criticism-free words only.                            */
(function () {
  if (window.__helpPill) return; window.__helpPill = true;
  var L = location, P = L.pathname, Q = L.search;
  if (/\/full-test\//.test(P) || /\/index\.html$|^\/$/.test(P)) return;

  var HELP = [
    [/\/use-of-english\/multiple-choice\/multiple-choice-texts/, { label: 'Part 1', task: 'Multiple-choice cloze',
      open: 'A text with 8 gaps and four words for each. On the exam it is Part 1 of Reading and Use of English.',
      how: ['Read the whole text once before you choose.',
            'Look just after the gap: a preposition or a pattern often decides the word.',
            'Say the sentence with your word in your head. If it sounds odd, try another.'],
      tip: 'Learn and Drill, in the footer, teach the word groups this Part tests.' }],
    [/\/use-of-english\/gap-fill\/gap-fill/, { label: 'Part 2', task: 'Open cloze',
      open: '8 gaps and no options: each gap needs one word, usually a small grammar word.',
      how: ['Gap 0 is done for you. It shows the kind of word the text wants.',
            'Ask what is missing: an article, a preposition, a pronoun, an auxiliary, a linker?',
            'Hint shows the first letter when you are stuck.'],
      tip: 'After Submit, Key fills every gap, so you can read the text through.' }],
    [/\/use-of-english\/word-formation\/word-formation/, { label: 'Part 3', task: 'Word formation',
      open: '8 gaps. Change the word in capitals so it fits the sentence.',
      how: ['Decide the word class first: noun, verb, adjective or adverb?',
            'Check whether it needs a plural, a negative (un-, im-, dis-) or a new ending.',
            'Spelling counts: read your word letter by letter.'],
      tip: 'Learn has the word families, with their prefixes and suffixes.' }],
    [/\/use-of-english\/word-transformation\/word-transformation/, { label: 'Part 4', task: 'Key word transformation',
      open: '6 sentences. Rewrite each one with the key word, in two to five words, so it means the same.',
      how: ['Never change the key word.',
            'Count your words: a contraction counts as two (don’t = do not).',
            'Each answer has two halves, a mark each: one half right still earns a mark.'],
      tip: 'Drill brings back the transformations you are still learning, first.' }],
    [/\/use-of-english\/.+\/(master-part\d|word-families)/, { label: 'Learn · Drill', task: 'The words this Part tests',
      open: 'The items this Part of the exam tests most, a few at a time.',
      how: ['The row at the top picks a group: collocations, prepositions, phrasal verbs…',
            'All shows a whole set; One at a time asks one sentence at a time.',
            'What you are still learning comes back first.'],
      tip: 'Practise, in the footer, takes you back to the exam text.' }],
    [/\/reading\/.*reading-part5/, { label: 'Part 5', task: 'Multiple choice',
      open: 'A long text and 6 questions, four options each.',
      how: ['Read the question first, then find its place in the text.',
            'The right option says the same thing in other words.',
            'Text | Questions switches pages; each keeps your place.'],
      tip: 'After you hand in, every answer shows its evidence in the text.' }],
    [/\/reading\/.*reading-part6/, { label: 'Part 6', task: 'Gapped text',
      open: 'A text with 6 sentences taken out, and one extra sentence that fits nowhere.',
      how: ['Read the whole text first, for the gist.',
            'Tap a gap, then choose a sentence. Check the sentence before and after.',
            'Look for links: this, they, however, a repeated idea.'],
      tip: 'One sentence is left over. Do not force it.' }],
    [/\/reading\/.*reading-part7/, { label: 'Part 7', task: 'Multiple matching',
      open: '10 statements and a few texts or sections. Match each statement to one.',
      how: ['Read the statements first and note the key idea of each.',
            'Read the sections one at a time, matching as you go.',
            'A section can match more than one statement.'],
      tip: 'The text says the same idea in other words, rarely the same words.' }],
    [/\/speaking\/test\.html/, { label: 'Speaking', task: 'Practise with Maya',
      open: 'Maya, the examiner, asks the questions of this Part. You answer out loud.',
      how: ['Pick a topic in the row at the top.',
            'Listen plays the question; Speak records your answer.',
            'Answer in two or three sentences: an answer, a reason, an example.'],
      tip: 'Learn, in the footer, shows the phrases that make answers longer.' }],
    [/\/grammar-rules\/[a-z-]+-rules\.html/, { label: 'Grammar', task: 'Learn · Practise · Play',
      open: 'One grammar topic, three ways in.',
      how: ['Learn shows the rule with examples; Explore opens each set.',
            'Practise has Gap-fill and Rewrite. Pick a set to start.',
            'Play is Defuse: the clock starts when you pick a set.'],
      tip: 'Start with Learn the first time; after that, go straight to Practise.' }],
    [/\/grammar-rules\/tenses-defuse/, { label: 'Play', task: 'Defuse',
      open: 'Cut the right wire for each sentence before the clock runs out.',
      how: ['Pick a set to start. 90s is the default round.',
            'Each right cut defuses a sentence; a run of them scores more.',
            'A sentence not yet right shows its answer and comes back later.'],
      tip: 'Practice has no clock, for when you want time to think.' }],
    [/\/challenge\/challenge\.html/, { label: 'Challenge', task: 'The board',
      open: 'A board of questions from this topic, against the clock.',
      how: ['Tap any tile to answer it.',
            'A first try scores most.',
            'Clear the board for your personal best.'],
      tip: 'A question not yet right shows its answer, so you learn it for next time.' }],
    [/\/challenge\/boardgame\.html/, { label: 'Challenge', task: 'The game',
      open: 'Two games on this topic: The Question and Noughts & Crosses.',
      how: ['Choose a game at the top.',
            'Answer to claim a square.',
            'New board starts again with fresh questions.'],
      tip: 'Play a friend on the same phone: take turns.' }],
    [/\/similar-words\/(vocabulary|topic-vocabulary|academic-vocabulary)\.html/, { label: 'Vocabulary', task: 'Gap-fill',
      open: 'Words that look alike or mean nearly the same. Choose the one that fits.',
      how: ['Each set gives its words at the top; every word fits one gap.',
            'Tap a word, then a gap, or type it.',
            'Check marks the set; what is not yet right shows its answer.'],
      tip: 'Challenge 1, Challenge 2 and Defuse play the same words as games.' }],
    [/\/writing\/.+-model\.html/, { label: 'Writing', task: 'The model',
      open: 'A model answer for this task: start here.',
      how: ['Read the model once, top to bottom.',
            'Notice how each paragraph opens: you can reuse those phrases.',
            'The track above the footer goes from the Question to Write it, step by step.'],
      tip: 'Watch plays a short clip on what this task is.' }],
    [/\/writing\/practice\.html/, { label: 'Writing', task: 'Exercises',
      open: 'Short exercises on the phrases that build this task.',
      how: ['Choose an exercise in the row at the top.',
            'Full, Intro, Body or End practises the whole text or one part of it.',
            'A phrase not yet right comes back later.'],
      tip: 'Recall, beside Exercises, asks for the phrases from memory.' }]
  ];
  var H = null;
  for (var i = 0; i < HELP.length; i++) if (HELP[i][0].test(P + Q)) { H = HELP[i][1]; break; }
  if (!H) return;

  function need(tag, attr, url, ok) {
    if (document.querySelector(tag + '[' + attr + '*="' + url.split('?')[0] + '"]')) return ok && ok();
    var el = document.createElement(tag); el[attr] = url;
    if (tag === 'link') el.rel = 'stylesheet'; else el.onload = ok;
    (document.head || document.documentElement).appendChild(el);
  }
  need('link', 'href', '/tools/five-card.css?v=7');

  var css =
    '.hp-pill{position:fixed;right:12px;z-index:999;font:600 .8125rem/1 Geist,system-ui,sans-serif;color:#14110E;background:#FAF8F5;' +
      'border:0;border-radius:999px;padding:.6rem .95rem;box-shadow:0 2px 10px rgba(20,17,14,.14),0 0 0 1px rgba(20,17,14,.05);cursor:pointer;' +
      '-webkit-tap-highlight-color:transparent;transition:bottom .2s}' +
    '.hp-pill:focus-visible{outline:2px solid #C2956E;outline-offset:2px}' +
    '.hp-ov{position:fixed;inset:0;z-index:1000;background:rgba(20,17,14,.32);display:flex;align-items:flex-end;justify-content:center}' +
    '.hp-ov[hidden]{display:none}' +
    '.hp-sheet{width:min(560px,100%);max-height:86vh;overflow:auto;background:#F3F1ED;border-radius:18px 18px 0 0;' +
      'padding:1.1rem 1rem calc(1rem + env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(20,17,14,.2)}' +
    '.hp-sheet .fc-card{display:block}' +
    '.hp-go{display:block;margin:1rem auto 0;font:700 .6875rem/1 Geist,system-ui,sans-serif;letter-spacing:.11em;text-transform:uppercase;' +
      'color:#F6F3EE;background:#14110E;border:0;border-radius:999px;padding:.85rem 1.6rem;cursor:pointer}' +
    '@media(min-width:700px){.hp-ov{align-items:center}.hp-sheet{border-radius:18px}}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cardHTML() {
    var spec = { label: H.label, task: H.task, roles: ['For', 'How', 'Tip'], open: [esc(H.open)],
                 body: H.how.map(function (t) { return { html: esc(t) }; }), close: [esc(H.tip)] };
    if (window.FiveCard && FiveCard.card) return FiveCard.card(spec);
    return '<div class="fc-card"><b>' + esc(H.task) + '</b><p>' + esc(H.open) + '</p><ul>' +
      H.how.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul><p>' + esc(H.tip) + '</p></div>';
  }

  function start() {
    /* a page's own Help button (Open cloze, Key word transformation) gives way to this one */
    [].forEach.call(document.querySelectorAll('.help-link'), function (b) { b.style.display = 'none'; });
    var pill = document.createElement('button'); pill.type = 'button'; pill.className = 'hp-pill'; pill.textContent = 'Help';
    pill.setAttribute('aria-haspopup', 'dialog');
    var ov = document.createElement('div'); ov.className = 'hp-ov'; ov.hidden = true;
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Help: ' + H.task);
    document.body.appendChild(pill); document.body.appendChild(ov);
    function open() {
      need('script', 'src', '/tools/five-card.js?v=7', function () {
        ov.innerHTML = '<div class="hp-sheet">' + cardHTML() + '<button type="button" class="hp-go">Got it</button></div>';
        ov.hidden = false; ov.querySelector('.hp-go').focus();
      });
    }
    function close() { ov.hidden = true; pill.focus(); }
    pill.onclick = open;
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.hp-go')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !ov.hidden) close(); });

    /* sit just above whatever bars the page keeps at the bottom (footers, Submit bars, the track) */
    function place() {
      var vh = window.innerHeight, top = vh;
      [].forEach.call(document.body.querySelectorAll('body *'), function (el) {
        if (el === pill || el.closest('.hp-ov')) return;
        var cs = getComputedStyle(el);
        if (cs.position !== 'fixed' && cs.position !== 'sticky') return;
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        var r = el.getBoundingClientRect();
        if (r.width < 160 || r.height < 20 || r.height > vh * 0.45) return;
        /* any bar in the lower half: the footer, and the Submit or Check bars that float just above it */
        if (r.top > vh * 0.5 && r.bottom > vh * 0.6 && r.top < top) top = r.top;
      });
      pill.style.bottom = Math.max(12, vh - top + 10) + 'px';
    }
    place(); window.addEventListener('resize', place);
    var n = 0, t = setInterval(function () { place(); if (++n > 12) clearInterval(t); }, 500);
    document.addEventListener('click', function () { setTimeout(place, 350); }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
