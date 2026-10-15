/* ═══ SPEAKING · PRACTICE · ONE MOVE AT A TIME (be2-focus-drill.js) ═══════
   In Practice, the pills above the answer (Similarities, Differences,
   Speculating · React, Reason, Example · Opinion, Agree / disagree … ·
   View, Generalise, Concede …) used to be labels: they lit up with the line
   being drilled and did nothing when tapped. Now each one is a button.

   TAP A PILL → drill that move only:
     1 the line(s) of the model answer that do it, then
     2 the phrase bank's other ways to say it, READ only (no browser voice),
   each then said aloud — listen, your turn, next. A phrase that
   ends in "…" is a frame: the student finishes it about this task.
   Tap the same pill again (or "Back to the whole answer") to return.

   One file for all four parts. It reads what each page already has —
   D (moves or functions, phraseBank), ORDER, segs()/turns(), say(),
   voiceOf() — and changes nothing outside Practice.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  if (!document.getElementById('moves')) return;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var page = /part1\b/.test(location.pathname) ? 1 : /part2/.test(location.pathname) ? 2 : /part3/.test(location.pathname) ? 3 : /part4/.test(location.pathname) ? 4 : 0;
  if (!page) return;

  /* which phrase-bank groups belong to which pill */
  var MAP = {
    1: { x: /^Reacting/i, r: /^Saying why/i, e: /^Proving/i, c: /'but'/i },
    2: { sim: /Similarities/i, dif: /Differences/i, spe: /Speculating/i, a: /Differences/i },
    3: { 1: /^1 ·/, 2: /^2 ·/, 3: /^3 ·/, 4: /^4 ·/, 5: /^5 ·/, 6: /^6 ·/, 7: /^7 ·/, 8: /^8 ·/ },
    4: { x: /^Reacting/i, a: /^Giving your view/i, g: /^Generalising/i, r: /^Justifying/i, e: /^Examples/i, c: /^Conceding/i, n: /^Joining in/i, o: /^Joining in/i }
  }[page];

  var CSS = '' +
    '#moves .mv.fd-tap{cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .15s,color .15s,border-color .15s}' +
    '@media(hover:hover){#moves .mv.fd-tap:hover{border-color:var(--ink,#2B2129);color:var(--ink,#2B2129)}}' +
    '#moves .mv.fd-tap.off{opacity:1;border-style:dashed}' +
    '#moves .mv.fd-on{background:var(--ink,#2B2129);color:#FAF7F2;border-color:var(--ink,#2B2129)}' +
    '.fd-hint{font:500 .72rem "Geist Mono",ui-monospace,monospace;letter-spacing:.06em;color:var(--dim,#5C4E52);margin:.2rem 0 .6rem}' +
    '.fd-k{font:600 .68rem "Geist Mono",ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-ink,#8A6440);margin:1rem 0 .4rem}' +
    '.fd-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.35rem}' +
    '.fd-item{display:flex;align-items:flex-start;gap:.6rem;padding:.6rem .75rem;border-radius:12px;background:rgba(43,33,41,.04);cursor:pointer;' +
    'font-size:1.02rem;line-height:1.4;color:var(--ink,#2B2129);border:1px solid transparent;transition:background .2s,border-color .2s}' +
    '.fd-item.model{background:rgba(194,149,110,.12)}' +
    '.fd-item .fd-n{flex:none;font:600 .7rem "Geist Mono",monospace;color:var(--dim,#8B7B78);margin-top:.3rem;min-width:1.2rem}' +
    '.fd-item.now{border-color:var(--ink,#2B2129);background:#fff}' +
    '.fd-item.said{opacity:.55}' +
    '.fd-say{margin:.9rem 0 .3rem;font:600 .74rem "Geist Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--dim,#8B7B78);min-height:1.1em}' +
    '.fd-say.now{color:var(--accent-ink,#8A6440)}' +
    '.fd-row{display:flex;gap:.5rem;align-items:center;justify-content:space-between;margin-top:.8rem;flex-wrap:wrap}' +
    '.fd-top{margin-top:.2rem}.fd-top + .fd-say{margin:.55rem 0 .2rem}' +
    '.fd-go{font:600 .9rem var(--f-display,Geist,sans-serif);padding:.65rem 1.2rem;border-radius:999px;border:none;background:var(--ink,#2B2129);color:#FAF7F2;cursor:pointer}' +
    '.fd-back{font:500 .8rem var(--f-display,Geist,sans-serif);background:none;border:none;color:var(--dim,#5C4E52);text-decoration:underline;cursor:pointer;padding:.4rem 0}' +
    '.fd-none{color:var(--dim,#5C4E52);font-size:.92rem;margin:.2rem 0 0}' +
    'body.fd-focus #tl,body.fd-focus .be2rec,body.fd-focus #playHub{display:none}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  var focus = null, run = false, idx = 0, tmr = null, list = [];

  function key(i) { return (window.ORDER || [])[i]; }
  function info(k) { var D = window.D || {}; return (D.functions && D.functions[k]) || (D.moves && D.moves[k]) || { name: String(k), hint: '' }; }
  function modelLines(k) {
    try {
      if (page === 3) {
        var out = [];
        window.turns().forEach(function (t) { t.segs.forEach(function (s) { if (String(s.f) === String(k)) out.push(s.t); }); });
        return out.slice(0, 3);
      }
      return window.segs().filter(function (s) { return s.m === k; }).map(function (s) { return s.t; });
    } catch (e) { return []; }
  }
  function phrases(k) {
    var rx = MAP[k], D = window.D || {}, out = [];
    if (!rx) return out;
    (D.phraseBank || []).forEach(function (g) { if (rx.test(g.heading)) g.phrases.forEach(function (p) { if (out.indexOf(p) === -1) out.push(p); }); });
    return out.slice(0, 8);
  }

  /* the pills become buttons, in Practice only */
  function dress() {
    var on = window.stage === 'practice';
    document.body.classList.toggle('fd-focus', on && focus != null);
    Array.prototype.forEach.call($('moves').children, function (el, i) {
      if (!on) return;
      var k = key(i); if (k == null) return;
      el.classList.add('fd-tap'); el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0');
      el.dataset.fk = k;
      el.setAttribute('aria-pressed', String(focus != null && String(focus) === String(k)));
      el.classList.toggle('fd-on', focus != null && String(focus) === String(k));
      el.title = 'Practise ' + info(k).name;
    });
  }
  new MutationObserver(function () { if (!dressing) { dressing = true; dress(); dressing = false; } }).observe($('moves'), { childList: true });
  var dressing = false;

  function hushAll() { run = false; clearTimeout(tmr); tmr = null; try { window.hush && window.hush(); } catch (e) {} try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} }
  function sayIt(t, then) {
    var spoken = String(t).replace(/…/g, ', ').replace(/\s+,/g, ',').replace(/,\s*$/, '');
    try {
      var v = window.voiceOf ? window.voiceOf() : {}, f = v && v.fem !== false;
      if (window.say) return window.say(spoken, f, f ? 1.1 : 1.02, then, .95);
    } catch (e) {}
    if (then) setTimeout(then, 1500);
  }

  function open(k) {
    try { window.drillStop && window.drillStop(); } catch (e) {}
    hushAll(); focus = k; idx = 0;
    var m = modelLines(k), p = phrases(k), it = info(k);
    list = m.map(function (t) { return { t: t, model: true }; }).concat(p.map(function (t) { return { t: t, model: false }; }));
    /* the controls come first, so play / stop and "your turn" sit right under the pills */
    var n = 0, html = '<p class="fd-hint">' + esc(it.name) + (it.hint ? ' — ' + esc(it.hint) : '') + '</p>' +
      '<div class="fd-row fd-top">' + (list.length ? '<button class="fd-go" type="button" id="fdGo">▶ Drill these</button>' : '<span></span>') +
      '<button class="fd-back" type="button" id="fdBack">Back to the whole answer</button></div>' +
      '<div class="fd-say" id="fdSay">' + (list.length ? 'press play: listen to the answer, then read each phrase aloud' : '') + '</div>';
    if (m.length) html += '<p class="fd-k">In this answer</p><ul class="fd-list">' + m.map(function (t) { return '<li class="fd-item model" data-i="' + (n++) + '"><span class="fd-n">' + n + '</span><span>' + esc(t) + '</span></li>'; }).join('') + '</ul>';
    if (p.length) html += '<p class="fd-k">Read and say' + (p.some(function (x) { return /…/.test(x); }) ? ' — finish the … about this task' : '') + '</p><ul class="fd-list">' + p.map(function (t) { return '<li class="fd-item" data-i="' + (n++) + '"><span class="fd-n">' + n + '</span><span>' + esc(t) + '</span></li>'; }).join('') + '</ul>';
    if (!list.length) html += '<p class="fd-none">This answer doesn’t use this move. Try another answer or topic.</p>';
    $('body').innerHTML = html;
    dress();
    $('fdBack').onclick = close;
    if ($('fdGo')) $('fdGo').onclick = function () { run ? stopRun() : go(idx >= list.length ? 0 : idx); };
    Array.prototype.forEach.call($('body').querySelectorAll('.fd-item'), function (li) {
      li.onclick = function () { var i = +li.dataset.i; hushAll(); mark(i);
        if (list[i].model) sayIt(list[i].t, function () { lab('your turn — say it', true); });
        else lab(/…/.test(list[i].t) ? 'read it aloud — and finish it about this task' : 'read it aloud', true); };
    });
    /* bring the pills and the controls just under the sticky header */
    try { var h = document.querySelector('.header'), off = h ? h.getBoundingClientRect().height : 0;
      var row = $('moves').closest('.moves-row') || $('moves');
      window.scrollTo({ top: row.getBoundingClientRect().top + window.scrollY - off - 12, behavior: 'smooth' }); } catch (e) {}
  }
  function lab(t, on) { var x = $('fdSay'); if (x) { x.textContent = t; x.classList.toggle('now', !!on); } }
  function mark(i) {
    Array.prototype.forEach.call($('body').querySelectorAll('.fd-item'), function (li) {
      var j = +li.dataset.i; li.classList.toggle('now', j === i); li.classList.toggle('said', j < i && run);
    });
    var cur = $('body').querySelector('.fd-item[data-i="' + i + '"]');
    if (cur) try { var h = document.querySelector('.header'), off = h ? h.getBoundingClientRect().height : 0, r = cur.getBoundingClientRect();
      if (r.top < off + 8 || r.bottom > innerHeight - 8) window.scrollTo({ top: r.top + window.scrollY - off - 120, behavior: 'smooth' }); } catch (e) {}
  }
  function stopRun() { hushAll(); if ($('fdGo')) $('fdGo').textContent = '▶ Drill these'; lab('paused — press play to carry on', false); }
  function go(i) {
    run = true; idx = i; if ($('fdGo')) $('fdGo').textContent = '■ Stop';
    if (idx >= list.length) { run = false; if ($('fdGo')) $('fdGo').textContent = '▶ Again'; lab('done — now use them in your own answer', true); mark(-1); return; }
    mark(idx);
    var it = list[idx], frame = /…/.test(it.t), span = Math.max(2400, it.t.split(/\s+/).length * 520) + (frame ? 2200 : 0);
    function turn(msg) { lab(msg, true); tmr = setTimeout(function () { if (!run) return; go(idx + 1); }, span); }
    /* the answer's own lines are heard in the recorded voice; the phrase bank
       is read, not heard — no browser voice */
    if (it.model) { lab('listen', false); sayIt(it.t, function () { if (!run) return; turn('your turn — say it'); }); }
    else turn(frame ? 'read it aloud — and finish it about this task' : 'read it aloud');
  }
  function close() { hushAll(); focus = null; document.body.classList.remove('fd-focus'); try { window.practice(); } catch (e) {} }

  function onTap(e) {
    if (window.stage !== 'practice') return;
    var el = e.target.closest && e.target.closest('#moves .fd-tap'); if (!el) return;
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault(); e.stopPropagation();
    var k = el.dataset.fk;
    if (focus != null && String(focus) === String(k)) close(); else open(isNaN(+k) || page !== 3 ? k : +k);
  }
  $('moves').addEventListener('click', onTap, true);
  $('moves').addEventListener('keydown', onTap, true);

  /* leaving Practice, or changing topic / answer / voice, ends the focus */
  document.addEventListener('click', function (e) {
    if (focus == null) return;
    var t = e.target.closest && e.target.closest('[data-s], #topics button, .alts button, .seg button, [data-ai], [data-ci], [data-mode], .arrow, #playHub');
    if (t && !t.closest('#moves') && !t.closest('#body')) { hushAll(); focus = null; document.body.classList.remove('fd-focus'); }
  }, true);
  setInterval(function () { if (window.stage !== 'practice' && focus != null) { hushAll(); focus = null; document.body.classList.remove('fd-focus'); } dress(); }, 800);
})();

/* ═══ THE STAGE TABS FIT A PHONE ═══════════════════════════════════════
   Parts 1 and 4 have six stages (Explore · Practice · Quiz · Talk · Recall
   · Order); on a 390px phone the last one was cut off. The row tightens its
   padding, then its type (never below 85%), until every stage shows. */
(function () {
  var row = document.getElementById('stages'); if (!row) return;
  function fit() {
    var bs = row.querySelectorAll('button');
    Array.prototype.forEach.call(bs, function (b) { b.style.removeProperty('padding-left'); b.style.removeProperty('padding-right'); b.style.removeProperty('font-size'); });
    var over = function () { return row.scrollWidth > row.clientWidth + 1 || row.getBoundingClientRect().right > document.documentElement.clientWidth - 8; };
    if (!over()) return;
    var cs = getComputedStyle(bs[0]), pad = parseFloat(cs.paddingLeft) || 12, fs = parseFloat(cs.fontSize) || 13;
    for (var p = pad - 1; p >= 5 && over(); p -= 1) Array.prototype.forEach.call(bs, function (b) { b.style.setProperty('padding-left', p + 'px', 'important'); b.style.setProperty('padding-right', p + 'px', 'important'); });
    for (var k = .97; k >= .85 && over(); k -= .03) Array.prototype.forEach.call(bs, function (b) { b.style.setProperty('font-size', (fs * k).toFixed(2) + 'px', 'important'); });
  }
  fit(); addEventListener('resize', fit); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
