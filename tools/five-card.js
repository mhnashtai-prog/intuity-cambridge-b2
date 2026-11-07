/* THE FIVE CARD (7 Nov 2026) — the one model card for every writing task.
   The hallmark is the Present Simple card: a caramel bar and a spaced mono
   label, a giant black title, a short thick rule. Under it, a model is
   always 1 · 3 · 1: the opening, two hairlines around three bulleted body
   lines, the closing. No section labels, no instructions.

   Two modes, one look:
     skeleton — generic models: the fixed phrase dark, every gap a caramel …
     filled   — models with development sentences: the student's part grey

   A filled square bullet supports; an empty one is the other side
   (a drawback, a counter-argument, a concern).

   FiveCard.body(spec)  the card's text only (for a host that draws its own
                        header, e.g. tools/parade.js)
   FiveCard.card(spec)  the whole card, header included
   FiveCard.title(task, n)  'Review <span>1</span>'
   spec.study  optional grey line under the title ('Study card · 2 of 6')
   spec.roles  optional margin labels, default ['Intro','Body','End']
   FiveCard.gap         the caramel …

   spec = { label:'Part 2', task:'Review', n:1,
            open:[html,…], openHead:'Introduction',
            body:[{html, head, against}, …],
            close:[html,…], closeHead:'Recommendation' }
   Everything is <span>, so a card can live inside a <button>.
   Requires tools/five-card.css.                                           */
(function () {
  var GAP = '<span class="fc-gap">…</span>';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* a heading that is only a gap ("your heading here") sits inline before
     its sentence instead of taking a line of its own */
  function head(h) { return !h ? '' : h === '…' ? '<span class="fc-h fc-hgap">' + GAP + '</span>' : '<span class="fc-h">' + esc(h) + '</span>'; }
  /* THE STUDY CARD (7 Nov 2026, from the design review): the card reads like
     an old paper study card. Three sections split by hairlines, each with
     its role in a narrow mono margin (Intro / Body / End, or s.roles); no
     bullets and no for/against marks, the signposts already say it. */
  function sec(role, inner) {
    return '<span class="fc-sec"><span class="fc-role">' + esc(role) + '</span><span class="fc-in">' + inner + '</span></span>';
  }
  function body(s) {
    var open = (s.open || []).join(' '), close = (s.close || []).join(' ');
    var R = s.roles || ['Intro', 'Body', 'End'];
    var list = (s.body || []).map(function (b) {
      return '<span class="fc-li' + (b.against ? ' fc-vs' : '') + '">' + head(b.head) + '<span class="fc-p">' + b.html + '</span></span>';
    }).join('');
    return '<span class="fc">' +
      sec(R[0], '<span class="fc-end">' + head(s.openHead) + '<span class="fc-p">' + open + '</span></span>') +
      (list ? sec(R[1], '<span class="fc-list">' + list + '</span>') : '') +
      (close || s.closeHead ? sec(R[2], '<span class="fc-end">' + head(s.closeHead) + '<span class="fc-p">' + close + '</span></span>') : '') +
      '</span>';
  }
  function title(task, n) { return esc(task) + (n ? ' <span class="fc-n">' + esc(n) + '</span>' : ''); }
  function card(s) {
    return '<span class="fc-card">' +
      '<span class="fc-k">' + esc(s.label || '') + '</span>' +
      '<span class="fc-t">' + title(s.task, s.n) + '</span>' +
      '<span class="fc-bar" aria-hidden="true"></span>' +
      /* "Study card · …": a grey line so a model reads as one way, not the way */
      (s.study ? '<span class="fc-study">' + esc(s.study) + '</span>' : '') + body(s) + '</span>';
  }
  /* a page's own gap markups ("...", <span class="gap">...</span>, the asterisk
     that points to a footnote) become the card's caramel … */
  function skel(h) {
    return String(h || '')
      .replace(/<span class="ast">\*<\/span>/g, '')
      .replace(/<span class="(?:gap|gp|fc-gap)">(?:\.\.\.|…)<\/span>/g, '\u0001')
      .replace(/\.\.\.|…/g, '\u0001')
      .replace(/<span class="[a-z-]+">\[[^\]<]+\]<\/span>|<em>\[[^\]<]+\]<\/em>|\[[^\]<]+\]/g, '\u0001')
      .replace(/\u0001(?:\s*\u0001)+/g, '\u0001')   /* "... ..." is one gap */
      .replace(/\u0001\s+([,;:])/g, '\u0001$1')
      .replace(/\u0001/g, GAP)
      .replace(/(<span class="fc-gap">…<\/span>)\s*\.(?=\s|$|<)/g, '$1');
  }
  /* a filled card: after the line's signpost, the words are the student's (grey) */
  function own(h) {
    return String(h || '').replace(/^(\s*<span class="(?:sig|sg)">[\s\S]*?<\/span>)([\s\S]+)$/, '$1<span class="fc-own">$2</span>');
  }
  /* a line the student taps to open its detail: a real button, inside the card */
  function tap(html, onclick, id) {
    return '<button type="button" class="fc-tap"' + (id ? ' id="' + id + '"' : '') + ' onclick="' + onclick + '">' + html + '</button>';
  }
  /* ONE SCREEN (7 Nov 2026): a detail card (the Open card, .mcard) never
     scrolls inside. If its body overflows, it steps down — smaller type,
     then the sample and plan rows cut to fewer lines — until it fits. */
  function fitModal(c) {
    if (!c) return;
    c.classList.remove('fit1', 'fit2', 'fit3');
    var mb = c.querySelector('.mb'), lv = ['fit1', 'fit2', 'fit3'];
    var over = function () { return (mb && mb.scrollHeight > mb.clientHeight + 1) || c.getBoundingClientRect().height > window.innerHeight - 12; };
    for (var k = 0; k < lv.length && over(); k++) c.classList.add(lv[k]);
  }
  /* ONE SCREEN for the Model card (7 Nov 2026): a card on a Model page steps
     its type down (fit1 → fit3) until it ends above the bottom of the box it
     scrolls in, so the Question · Plan · Model · Sample bar never covers it.
     A card in the Model Generator's strip has its own fitter, so is left out. */
  function scroller(el) {
    for (var p = el.parentElement; p; p = p.parentElement) {
      var o = getComputedStyle(p).overflowY;
      if ((o === 'auto' || o === 'scroll') && p.scrollHeight > 0) return p;
    }
    return null;
  }
  function fitCard(c) {
    if (!c || c.closest('.pa-track,.gal-body,.mcard')) return;
    c.classList.remove('fc-fit1', 'fc-fit2', 'fc-fit3');
    var sc = scroller(c), lv = ['fc-fit1', 'fc-fit2', 'fc-fit3'];
    var room = function () {
      var bot = sc ? sc.getBoundingClientRect().bottom : (window.visualViewport ? visualViewport.height : window.innerHeight);
      return c.getBoundingClientRect().bottom + (sc ? sc.scrollTop : 0) > bot - 8;
    };
    for (var k = 0; k < lv.length && room(); k++) c.classList.add(lv[k]);
  }
  var RO = window.ResizeObserver ? new ResizeObserver(function () { queue(); }) : null;
  /* CARDS · PHRASES INSIDE THE CARD (7 Nov 2026): on a Model page the
     toggle moves from its own row above the card into the card's top right
     corner, so the card gets the row's height back. The page's own buttons
     (#mbCards, #mbPhrases) stay the switch; these only press them. In the
     Phrases view there is no card, so the page shows its own row again. */
  function seg(c) {
    if (c.__fcSeg || c.closest('.pa-track,.gal-body,.mcard')) return;
    var ph = document.getElementById('mbPhrases'), cd = document.getElementById('mbCards');
    if (!ph || !cd || !c.closest('.fc-wrap')) return;
    c.__fcSeg = 1;
    var w = document.createElement('span'); w.className = 'fc-seg'; w.setAttribute('role', 'group'); w.setAttribute('aria-label', 'View');
    w.innerHTML = '<button type="button" class="on" aria-pressed="true">Cards</button><button type="button" aria-pressed="false">Phrases</button>';
    w.children[1].onclick = function (e) { e.stopPropagation(); ph.click(); };
    w.children[0].onclick = function (e) { e.stopPropagation(); };
    c.insertBefore(w, c.firstChild);
    document.documentElement.classList.add('fc-segged');
    setTimeout(queue, 0);   /* the row above has gone: measure again with the room it left */
  }
  function fitAll() { var cs = document.querySelectorAll('.fc-card');
    for (var i = 0; i < cs.length; i++) { seg(cs[i]); if (RO && !cs[i].__fcObs) { cs[i].__fcObs = 1; var sc = scroller(cs[i]); if (sc) RO.observe(sc); } fitCard(cs[i]); } }
  var fq = null;
  function queue() { if (fq) return; fq = requestAnimationFrame(function () { fq = null; fitAll(); }); }
  if (window.MutationObserver) new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) { var n = ms[i].target; if (n.closest && (n.closest('.fc-card') || (n.querySelector && n.querySelector('.fc-card')))) { queue(); return; } }
  }).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('resize', queue); addEventListener('load', function () { queue(); setTimeout(queue, 600); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
  window.FiveCard = { body: body, card: card, title: title, gap: GAP, esc: esc, skel: skel, tap: tap, own: own, fitModal: fitModal, fitCard: fitCard };
})();
