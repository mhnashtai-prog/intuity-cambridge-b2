/* ═══════════════════════════════════════════════════════════════════════
   LEARN · PRACTISE · PLAY — the mode row, grouped  ·  v1 (2 Nov 2026)

   A topic page offered six or seven modes in one row (Explore · Gap-fill ·
   Rewrite · Game · Defuse · Board), and a student met all of them before
   doing anything. This groups them under three words a child understands:

       [ Learn | Practise | Play ]        ← one segmented switch
         Gap-fill   Rewrite               ← only the chosen group's modes

   NOTHING IS REMOVED. Every original button and link stays in the page, in
   the same element, with its own handlers; the ones outside the chosen group
   are only hidden. A group with a single mode opens it in one tap.

   It runs only on a row that mixes study modes with games (at least one
   Play mode and at least one other, five modes or more), so the Speaking
   Part 1–4 row, the Writing rows and the Master pages are left alone. Rows
   that are rebuilt later (Defuse, the Board and the Game copy the topic's
   row) are grouped again when they change.

   Loaded by /tools/be2-brand.js, so every page that carries the mark has it.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  if (window.__modeGroups) return; window.__modeGroups = true;
  var PLAY = /^(game|defuse|board|pegs|rack|pairs|pulse|stars|burrow|forge|rush|mill|duel|hunt|swing|knock-?out)$/i;
  var LEARN = /^(explore|learn|rules)$/i;
  var NAMES = { learn: 'Learn', practise: 'Practise', play: 'Play' };

  var css = '.mg{display:flex;justify-content:center;margin:.35rem auto .15rem;}' +
    '.mg-in{display:inline-flex;gap:.1rem;background:var(--poster-fill,#E7E2DA);border-radius:999px;padding:.18rem}' +
    '.mg-b{font-family:var(--f-display,inherit);font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;' +
      'border:0;background:transparent;color:var(--dim,#6E6660);padding:.45rem .95rem;border-radius:999px;cursor:pointer;min-height:2.1rem}' +
    '.mg-b.on{background:var(--ink,#1E1B19);color:var(--card,#FBF9F6)}' +
    '@media(hover:hover){.mg-b:not(.on):hover{color:var(--ink,#1E1B19)}}' +
    '.mode-selector .mg-off{display:none !important}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  function label(el) {
    return [].slice.call(el.childNodes).filter(function (n) { return !(n.classList && n.classList.contains('mode-badge')); })
      .map(function (n) { return n.textContent; }).join('').replace(/[^\w\- ]/g, '').trim();
  }
  function groupOf(el) { var l = label(el); return PLAY.test(l) ? 'play' : LEARN.test(l) ? 'learn' : 'practise'; }
  function isActive(el) { return el.classList.contains('active') || el.hasAttribute('aria-current'); }
  function items(row) { return [].slice.call(row.children).filter(function (el) { return el.classList.contains('mode-btn'); }); }

  function apply(row) {
    var its = items(row);
    var gs = its.map(groupOf);
    var eligible = its.length >= 5 && gs.indexOf('play') >= 0 && gs.some(function (g) { return g !== 'play'; });
    var bar = row.previousElementSibling && row.previousElementSibling.classList.contains('mg') ? row.previousElementSibling : null;
    if (!eligible) { if (bar) bar.remove(); its.forEach(function (el) { el.classList.remove('mg-off'); }); return; }
    var order = ['learn', 'practise', 'play'].filter(function (g) { return gs.indexOf(g) >= 0; });
    var act = its.filter(isActive)[0];
    var shown = row.__mgShown && order.indexOf(row.__mgShown) >= 0 ? row.__mgShown : act ? groupOf(act) : order[0];
    row.__mgShown = shown;
    its.forEach(function (el, i) { el.classList.toggle('mg-off', gs[i] !== shown); });
    if (!bar) { bar = document.createElement('div'); bar.className = 'mg'; row.parentNode.insertBefore(bar, row); }
    var html = '<div class="mg-in" role="group" aria-label="Learn, practise or play">' + order.map(function (g) {
      return '<button type="button" class="mg-b' + (g === shown ? ' on' : '') + '" data-g="' + g + '" aria-pressed="' + (g === shown) + '">' + NAMES[g] + '</button>';
    }).join('') + '</div>';
    if (bar.innerHTML !== html) bar.innerHTML = html;
    bar.onclick = function (e) {
      var b = e.target.closest('.mg-b'); if (!b) return;
      var g = b.getAttribute('data-g'), members = its.filter(function (_, i) { return gs[i] === g; });
      row.__mgShown = g; apply(row);
      /* one mode in the group, and it is not the one open: go straight there */
      if (members.length === 1 && !isActive(members[0])) members[0].click();
    };
  }
  function watch(row) {
    if (row.__mgWatch) return; row.__mgWatch = true;
    var busy = false;
    new MutationObserver(function () { if (busy) return; busy = true; try { apply(row); } finally { setTimeout(function () { busy = false; }, 0); } })
      .observe(row, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-current'] });
    /* a mode chosen inside the page follows its own group */
    row.addEventListener('click', function (e) { var b = e.target.closest('.mode-btn'); if (b) row.__mgShown = groupOf(b); }, true);
    apply(row);
  }
  function scan() { [].slice.call(document.querySelectorAll('.mode-selector')).forEach(watch); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  /* rows built after load (Defuse, the Board and the Game fetch the topic's row) */
  new MutationObserver(function (m) { if (m.some(function (r) { return r.addedNodes.length; })) scan(); })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
