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

  /* compact (3 Nov): the switch and the header's pills are signposts, not buttons to admire */
  var css = '.mg{display:flex;justify-content:center;margin:.25rem auto .1rem;}' +
    '.mg-in{display:inline-flex;gap:.1rem;background:var(--poster-fill,#E7E2DA);border-radius:999px;padding:.14rem}' +
    '.mg-b{font-family:var(--f-display,inherit);font-size:.64rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;' +
      'border:0;background:transparent;color:var(--dim,#6E6660);padding:.32rem .8rem;border-radius:999px;cursor:pointer;min-height:1.75rem}' +
    /* a group of ONE mode (Learn = Explore): the switch already names it, so its row goes */
    '.mode-selector.mg-solo{display:none !important}' +
    '.header .set-tabs .vtab{padding:.3rem .55rem !important}' +
    '.header .ovf-row.has-pill > .vtab{padding-left:.6rem !important;padding-right:.6rem !important}' +
    '.header .set-tabs{margin-top:.1rem !important}' +
    '.mg-b.on{background:var(--ink,#1E1B19);color:var(--card,#FBF9F6)}' +
    '@media(hover:hover){.mg-b:not(.on):hover{color:var(--ink,#1E1B19)}}' +
    '.mode-selector .mg-off{display:none !important}' +
    '.mg-gate{top:0;bottom:0;left:0;right:0;padding-top:3.2rem !important}' +
    '.mg-gate .gate-pick{display:flex;flex-direction:column;align-items:center;gap:.2rem;border-radius:999px;padding:.75rem 1.3rem}' +
    '.mg-gate .gate-pick small{font-family:var(--f-body,inherit);font-weight:400;font-size:.72rem;letter-spacing:0;opacity:.7}' +
    'html.mg-gated body{overflow:hidden}';
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
    if (!eligible) { if (bar) bar.remove(); row.classList.remove('mg-solo'); its.forEach(function (el) { el.classList.remove('mg-off'); }); return; }
    var order = ['learn', 'practise', 'play'].filter(function (g) { return gs.indexOf(g) >= 0; });
    var act = its.filter(isActive)[0];
    /* a mode opened by the page itself (a ?mode= link, a Board's "Gap-fill"):
       the switch follows it, or the group gate would cover the open exercise */
    if (act && row.__mgLastAct !== act) row.__mgShown = groupOf(act);
    row.__mgLastAct = act;
    var shown = row.__mgShown && order.indexOf(row.__mgShown) >= 0 ? row.__mgShown : act ? groupOf(act) : order[0];
    row.__mgShown = shown;
    its.forEach(function (el, i) { el.classList.toggle('mg-off', gs[i] !== shown); });
    var inShown = its.filter(function (_, i) { return gs[i] === shown; });
    row.classList.toggle('mg-solo', inShown.length === 1 && isActive(inShown[0]));
    if (!bar) { bar = document.createElement('div'); bar.className = 'mg'; row.parentNode.insertBefore(bar, row); }
    var html = '<div class="mg-in" role="group" aria-label="Learn, practise or play">' + order.map(function (g) {
      return '<button type="button" class="mg-b' + (g === shown ? ' on' : '') + '" data-g="' + g + '" aria-pressed="' + (g === shown) + '">' + NAMES[g] + '</button>';
    }).join('') + '</div>';
    if (bar.innerHTML !== html) bar.innerHTML = html;
    gate(row, its, gs, shown, act);
    bar.onclick = function (e) {
      var b = e.target.closest('.mg-b'); if (!b) return;
      var g = b.getAttribute('data-g'), members = its.filter(function (_, i) { return gs[i] === g; });
      /* ONE GATE, NOT TWO (3 Nov): when the group's first mode opens on its
         own pendulum ("Pick a set above" — the grammar topics), the group's
         gate would only be a pendulum in front of a pendulum. Open that mode
         straight away; its sister modes stay one tap away in the row. */
      if (members.length > 1 && !members.some(isActive) && selfGated(members[0])) {
        row.__mgShown = g; members[0].click(); apply(row); return;
      }
      row.__mgShown = g; apply(row);
      /* one mode in the group, and it is not the one open: go straight there */
      if (members.length === 1 && !isActive(members[0])) members[0].click();
    };
  }
  /* A GROUP CHOSEN, NO MODE YET (3 Nov): the page below would still show the
     last mode's content (Explore under PLAY). So the screen clears to the
     pendulum, as every other entry in the app does: one instruction, and the
     group's modes as picks — tapping one is the same as tapping it above. */
  var WHAT = { game: 'Noughts & Crosses', defuse: 'Beat the clock', board: '14 tiles, one game each',
    'gap-fill': 'Fill each gap', rewrite: 'Rewrite the sentence', quiz: 'Choose the answer', practice: 'Fill each gap', match: 'Match the pairs' };
  var GATE = { practise: ['Pick an exercise', 'Choose one to start — the same choices are in the row above.'],
    play: ['Pick a game', 'Choose one to start — the same choices are in the row above.'],
    learn: ['Start here', 'Read the rules and examples first.'] };
  function selfGated(el) {
    var m = el.tagName === 'BUTTON' && el.getAttribute('data-mode');
    return !!(m && document.getElementById(m + 'Gate'));
  }
  function gate(row, its, gs, shown, act) {
    var g = document.getElementById('mgGate');
    var need = !act || groupOf(act) !== shown;
    if (!need) { if (g) g.classList.remove('open'); document.documentElement.classList.remove('mg-gated'); return; }
    if (!g) { g = document.createElement('div'); g.id = 'mgGate'; g.className = 'sheet-gate gate-standalone mg-gate'; document.body.appendChild(g); }
    var members = its.filter(function (_, i) { return gs[i] === shown; });
    g.innerHTML = '<div class="gate-mark pend-hang"><div class="pend-dial"><span>?</span></div></div>' +
      '<div class="gate-head">' + GATE[shown][0] + '</div><div class="gate-sub">' + GATE[shown][1] + '</div>' +
      '<div class="gate-list">' + members.map(function (m, k) { var l = label(m), w = WHAT[l.toLowerCase()];
        return '<button type="button" class="gate-pick" data-k="' + k + '">' + l + (w ? '<small>' + w + '</small>' : '') + '</button>'; }).join('') + '</div>';
    [].slice.call(g.querySelectorAll('.gate-pick')).forEach(function (b) { b.onclick = function () { members[+b.dataset.k].click(); }; });
    var place = function () { var r = row.getBoundingClientRect(); g.style.top = Math.max(0, Math.round(r.bottom + 6)) + 'px'; };
    place(); g.classList.add('open'); document.documentElement.classList.add('mg-gated');
    if (!g.__placed) { g.__placed = true; addEventListener('resize', place); addEventListener('scroll', place, { passive: true }); }
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
  /* back from another page (the browser's cache keeps the old state): the
     switch follows the mode that is really open, not the group last tapped */
  addEventListener('pageshow', function (e) { if (!e.persisted) return;
    [].slice.call(document.querySelectorAll('.mode-selector')).forEach(function (r) { r.__mgShown = null; apply(r); }); });
  function scan() { [].slice.call(document.querySelectorAll('.mode-selector')).forEach(watch); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  /* rows built after load (Defuse, the Board and the Game fetch the topic's row) */
  new MutationObserver(function (m) { if (m.some(function (r) { return r.addedNodes.length; })) scan(); })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
