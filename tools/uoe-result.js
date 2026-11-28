/* THE RESULT'S HEAD (28 Nov 2026, from a pupil's-eye audit): Parts 2, 3 and 4
   ended on a bare "0/8" while Part 1 said how it went in words. One head for
   all four: a word for how it went, the marks and the percentage, one bar a
   question (sage right, soft caramel not yet), criticism-free.

   And the retry. "Try again" used to bring the whole text back with every
   answer just seen, so a pupil scored 100% and knew it meant nothing. Now
   the card offers the "Not yet" ones only, empty, and that second try is
   marked as a second try: the first try stays the score, and the misses
   still come back in Daily 5, where remembering is the real test.

   UoeResult.head({ right:[bool…], got, max, unit, second, first, best }) → HTML
   UoeResult.retryLabel(n) → "Try the 3 not yet" */
(function () {
  var css =
    '.rh{text-align:center;padding:.2rem 0 1.1rem}' +
    '.rh-k{font:600 .625rem/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase;color:#8A8279;margin:0 0 .55rem}' +
    '.rh-t{font-family:Anton,Impact,sans-serif;font-weight:400;font-size:2rem;line-height:1;letter-spacing:.02em;text-transform:uppercase;color:#14110E}' +
    '.rh-s{font:500 .75rem/1.4 "Geist Mono",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#4A4541;margin-top:.6rem}' +
    '.rh-b{display:flex;gap:3px;justify-content:center;flex-wrap:wrap;margin:.95rem 0 0}' +
    '.rh-b i{display:block;width:12px;height:26px;border-radius:3px;background:#D3CBBE}' +
    '.rh-b i.ok{background:#527065}' +
    '.rh-n{font-size:.84rem;line-height:1.45;color:#6B655C;margin:.8rem auto 0;max-width:22rem}' +
    '.score-display.rh-off{display:none!important}' +
    '.modal-footer:has(#retryBtn){display:flex!important;flex-wrap:wrap;gap:.6rem}' +
    '.modal-footer:has(#retryBtn) > .modal-btn{flex:1 1 0;margin:0!important}' +
    '.modal-footer:has(#retryBtn) > #retryBtn.modal-btn{flex:1 0 100%;order:-1}' +
    '#retryBtn[hidden]{display:none!important}';
  try { var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st); } catch (e) {}

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  window.UoeResult = {
    head: function (o) {
      var max = o.max || 1, pct = Math.round(o.got / max * 100), unit = o.unit || '';
      var title = pct === 100 ? 'Perfect' : pct >= 75 ? 'Strong' : pct >= 50 ? 'Getting there' : 'Keep going';
      var h = '<div class="rh">';
      if (o.second) h += '<div class="rh-k">Second try</div>';
      h += '<div class="rh-t">' + title + '</div>';
      h += '<div class="rh-s">' + o.got + ' / ' + max + (unit ? ' ' + esc(unit) : '') + ' · ' + pct + '%</div>';
      if (o.right && o.right.length) h += '<div class="rh-b" aria-hidden="true">' + o.right.map(function (r) { return '<i class="' + (r ? 'ok' : '') + '"></i>'; }).join('') + '</div>';
      if (o.second && o.first) h += '<div class="rh-n">Your first try, ' + esc(o.first) + ', stays your score. The ones you met here come back in your Daily 5.</div>';
      else if (o.best) h += '<div class="rh-n">Your best: ' + esc(o.best) + '</div>';
      return h + '</div><div data-ri-slot></div>';
    },
    retryLabel: function (n) { return 'Try the ' + n + ' not yet'; }
  };
})();
