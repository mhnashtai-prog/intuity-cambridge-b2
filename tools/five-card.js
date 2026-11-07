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
  function head(h) { return h ? '<span class="fc-h">' + (h === '…' ? GAP : esc(h)) + '</span>' : ''; }
  function body(s) {
    var open = (s.open || []).join(' '), close = (s.close || []).join(' ');
    return '<span class="fc">' +
      '<span class="fc-end">' + head(s.openHead) + '<span class="fc-p">' + open + '</span></span>' +
      '<span class="fc-rule" aria-hidden="true"></span>' +
      '<span class="fc-list">' + (s.body || []).map(function (b) {
        return '<span class="fc-li' + (b.against ? ' fc-vs' : '') + '">' + head(b.head) + '<span class="fc-p">' + b.html + '</span></span>';
      }).join('') + '</span>' +
      '<span class="fc-rule" aria-hidden="true"></span>' +
      '<span class="fc-end">' + head(s.closeHead) + '<span class="fc-p">' + close + '</span></span>' +
      '</span>';
  }
  function title(task, n) { return esc(task) + (n ? ' <span class="fc-n">' + esc(n) + '</span>' : ''); }
  function card(s) {
    return '<span class="fc-card">' +
      '<span class="fc-k">' + esc(s.label || '') + '</span>' +
      '<span class="fc-t">' + title(s.task, s.n) + '</span>' +
      '<span class="fc-bar" aria-hidden="true"></span>' + body(s) + '</span>';
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
  window.FiveCard = { body: body, card: card, title: title, gap: GAP, esc: esc, skel: skel, tap: tap, own: own };
})();
