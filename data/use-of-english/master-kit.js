/* ═══════════════════════════════════════════════════════════════════════
   USE OF ENGLISH — MASTER PRACTICE (Nov 2026)

   One practice engine for the four Master pages, built on the pattern the
   Part 1 exam page already had right: ONE PAPER SHEET of numbered sentences
   ruled apart, or ONE SENTENCE AT A TIME — the "All | One at a time" pill
   pair on the card's top edge, the qdots under it, and Prev · Repeat ·
   Submit · Next along the bottom. Same marking, same results card with
   "Worth another look" and the reason for each.

   What changed from the old Master practice:
     · no Start screen — the page opens on question 1 of a set;
     · the set is exam-sized (8, or 6 for Part 4) and mistakes come first;
     · answers are marked together on Submit, like the exam, and the card
       stays on screen marked, with the reason under every one missed;
     · the view is remembered, so a student who wants one at a time gets
       it every visit.

   A page hands over its items already shaped:
     { id, pre, post, lead?, key?, opts?, ans, why, also?, check(v), validate?(v) }
   and its config:
     MasterKit.mount(el, { id, label, n, max, kind, items:()=>[], remember(i,ok), more? })
   kind: 'choose' (tap one of four), 'type' (one word), 'phrase' (2–5 words)
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); };
  var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var VIEWKEY = 'intuity.master.view';
  var getView = function () { try { return localStorage.getItem(VIEWKEY) === 'one' ? 'one' : 'full'; } catch (e) { return 'full'; } };
  var setView = function (v) { try { localStorage.setItem(VIEWKEY, v); } catch (e) {} };
  var due = function (id) { try { return !!(window.IntuityRing && IntuityRing.isDue(id)); } catch (e) { return false; } };
  var held = function (id) { try { return !!(window.IntuityRing && IntuityRing.has(id)); } catch (e) { return false; } };
  var sfx = function (n) { try { if (window.SFX && SFX.isOn() && SFX.play) SFX.play(n); } catch (e) {} };
  var LETTER = ['A', 'B', 'C', 'D', 'E'];

  function Kit(el, cfg) {
    this.el = el; this.cfg = cfg; this.view = getView();
    this.seen = {};
    this.tip = document.getElementById('mkTip');
    if (!this.tip) { this.tip = document.createElement('div'); this.tip.className = 'mk-tip'; this.tip.id = 'mkTip'; document.body.appendChild(this.tip); }
    this.ov = document.getElementById('mkOv');
    if (!this.ov) { this.ov = document.createElement('div'); this.ov.className = 'mk-ov'; this.ov.id = 'mkOv'; this.ov.setAttribute('role', 'dialog'); this.ov.setAttribute('aria-modal', 'true'); document.body.appendChild(this.ov); }
    var self = this;
    if (!Kit.wired) {
      Kit.wired = true;
      document.addEventListener('click', function (e) { if (Kit.cur && !e.target.closest('.mk-tip') && !e.target.closest('.mk-gap')) Kit.cur.closeTip(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && Kit.cur) { Kit.cur.closeTip(); Kit.cur.ov.classList.remove('show'); } });
      window.addEventListener('scroll', function () { if (Kit.cur) Kit.cur.closeTip(); }, { passive: true });
    }
    Kit.cur = self;
  }

  /* A new set: what is due first, then what this visit has not shown yet. */
  Kit.prototype.deal = function () {
    var all = this.cfg.items(), n = this.cfg.n || 8, seen = this.seen;
    var dueOnes = shuffle(all.filter(function (i) { return due(i.id); }));
    var fresh = shuffle(all.filter(function (i) { return !due(i.id) && !seen[i.id]; }));
    if (dueOnes.length + fresh.length < n) { this.seen = {}; seen = this.seen; fresh = shuffle(all.filter(function (i) { return !due(i.id); })); }
    var pick = dueOnes.concat(fresh).slice(0, n);
    pick.forEach(function (i) { seen[i.id] = 1; });
    this.qs = pick; this.answers = {}; this.marks = {}; this.marked = false; this.qi = 0; this.warn = {};
    /* choice options are shuffled once per set, so they do not jump about */
    this.qs.forEach(function (q) { if (q.opts) q._o = shuffle(q.opts); });
    this.ringBefore = {}; var rb = this.ringBefore; this.qs.forEach(function (q) { rb[q.id] = held(q.id); });
    this.render();
  };

  Kit.prototype.answered = function () { var a = this.answers; return this.qs.filter(function (q) { return a[q.id] !== undefined && String(a[q.id]).trim() !== ''; }).length; };

  Kit.prototype.gapHTML = function (q, k) {
    var a = this.answers[q.id], has = a !== undefined && String(a).trim() !== '', cfg = this.cfg;
    if (this.marked) {
      var m = this.marks[q.id] || 0, max = cfg.max || 1;
      var cls = m >= max ? 'ok' : m > 0 ? 'half' : 'no';
      return '<span class="mk-gap done ' + cls + '">' + (has ? esc(a) : '—') + '</span>' +
        (m < max ? '<span class="mk-fix">' + esc(q.ans) + '</span>' : '');
    }
    if (cfg.kind === 'choose') {
      return '<button class="mk-gap' + (has ? ' filled' : '') + '" type="button" data-k="' + k + '">' + (has ? esc(a) : '    ') + '</button>';
    }
    var ph = cfg.kind === 'phrase' ? '2–5 words' : (q.key ? 'one word' : 'one word');
    return '<input class="mk-gap mk-in' + (cfg.kind === 'phrase' ? ' wide' : '') + '" data-k="' + k + '" value="' + esc(has ? a : '') + '" placeholder="' + ph +
      '" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Answer ' + (k + 1) + '">';
  };

  Kit.prototype.lineHTML = function (q, k) {
    var marked = this.marked, m = this.marks[q.id] || 0, max = this.cfg.max || 1;
    var lead = q.lead ? '<span class="mk-lead">' + esc(q.lead) + '</span>' : '';
    var key = q.key ? '<span class="mk-key">' + esc(q.key) + '</span>' : '';
    var body = esc(q.pre) + this.gapHTML(q, k) + esc(q.post);
    var warn = !marked && this.warn[q.id] ? '<span class="mk-warn">' + esc(this.warn[q.id]) + '</span>' : '';
    var why = marked && m < max ? '<span class="mk-why">' + (m > 0 ? '<b>One mark.</b> ' : '') + esc(q.why || '') +
      (q.also ? '<span class="mk-also">Also right: ' + esc(q.also) + '</span>' : '') + '</span>' : '';
    return '<div class="mk-line"><span class="mk-num">' + String(k + 1).padStart(2, '0') + '</span><div class="mk-body">' +
      lead + (q.key && !q.lead ? '' : key) + '<span class="mk-text">' + body + '</span>' + (q.key && !q.lead ? key : '') + warn + why + '</div></div>';
  };

  Kit.prototype.render = function () {
    var self = this, cfg = this.cfg, qs = this.qs, n = qs.length, one = this.view === 'one';
    if (!n) { this.el.innerHTML = '<p class="mk-empty">Nothing to practise in this tab yet. Try another.</p>'; return; }
    var done = this.answered();
    var info = esc(cfg.label()) + ' · ' + n + (cfg.unit || ' sentences') + ' · ' + (this.marked ? this.score().got + '/' + this.score().max + (cfg.max > 1 ? ' marks' : ' right') : done + '/' + n + ' done');
    var shown = one ? [this.qi] : qs.map(function (_, i) { return i; });
    var kick = '<div class="mk-kick">' + esc(cfg.kick || 'Practice') + '<span class="right">' +
      (one ? 'Sentence ' + (this.qi + 1) + ' of ' + n : done + ' / ' + n + ' answered') + '</span></div>';
    var rubric = cfg.rubric && (!one || this.qi === 0) && !this.marked ? '<p class="mk-rubric">' + esc(cfg.rubric) + '</p>' : '';
    var dots = qs.map(function (q, i) {
      var c = 'qdot', a = self.answers[q.id], has = a !== undefined && String(a).trim() !== '';
      if (self.marked) { var m = self.marks[q.id] || 0; c += m >= (cfg.max || 1) ? ' ok' : m > 0 ? ' half' : ' no'; }
      else if (has) c += ' filled';
      if (one && i === self.qi) c += ' cur';
      return '<button class="mk-dot ' + c + '" type="button" data-i="' + i + '" aria-label="Sentence ' + (i + 1) + '"></button>';
    }).join('');
    var left = n - done;
    this.el.innerHTML =
      '<div class="mk-viewrow"><div class="mk-info">' + info + '</div>' +
        '<div class="mk-tog" role="group" aria-label="How much to show">' +
          '<button class="mk-vb viewbtn' + (one ? '' : ' active') + '" type="button" data-v="full" aria-pressed="' + !one + '">All</button>' +
          '<button class="mk-vb viewbtn' + (one ? ' active' : '') + '" type="button" data-v="one" aria-pressed="' + one + '">One at a time</button>' +
        '</div></div>' +
      '<div class="mk-dots">' + dots + '</div>' +
      '<div class="mk-card' + (one ? ' solo' : '') + (this.marked ? ' marked' : '') + '">' + kick + rubric +
        shown.map(function (i) { return self.lineHTML(qs[i], i); }).join('') + '</div>' +
      '<div class="mk-bar">' +
        (one ? '<button type="button" data-b="prev"' + (this.qi === 0 ? ' disabled' : '') + '>&lsaquo; Prev</button>' : '') +
        (this.marked
          ? '<button type="button" data-b="again">Try again</button><button class="go" type="button" data-b="more">' + esc(cfg.moreLabel || ('Next ' + (cfg.n || 8))) + ' &rsaquo;</button>'
          : '<button type="button" data-b="clear">' + (one ? 'Repeat' : 'Clear') + '</button>' +
            '<button class="go" type="button" data-b="submit"' + (left ? ' disabled' : '') + '>' + (left ? 'Submit — ' + left + ' to go' : 'Submit') + '</button>') +
        (one ? '<button type="button" data-b="next"' + (this.qi === n - 1 ? ' disabled' : '') + '>Next &rsaquo;</button>' : '') +
      '</div>';
    this.wire();
  };

  Kit.prototype.paintProgress = function () {
    /* typing must not re-render (the caret would jump): update only the counters */
    var n = this.qs.length, done = this.answered(), left = n - done, self = this;
    var info = this.el.querySelector('.mk-info');
    if (info) info.textContent = this.cfg.label() + ' · ' + n + (this.cfg.unit || ' sentences') + ' · ' + done + '/' + n + ' done';
    var r = this.el.querySelector('.mk-kick .right'); if (r && this.view !== 'one') r.textContent = done + ' / ' + n + ' answered';
    var s = this.el.querySelector('[data-b="submit"]');
    if (s) { s.disabled = !!left; s.textContent = left ? 'Submit — ' + left + ' to go' : 'Submit'; }
    this.el.querySelectorAll('.mk-dot').forEach(function (d) {
      var q = self.qs[+d.dataset.i], a = self.answers[q.id];
      d.classList.toggle('filled', a !== undefined && String(a).trim() !== '');
    });
  };

  Kit.prototype.wire = function () {
    var self = this, el = this.el;
    el.querySelectorAll('.mk-vb').forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains('active')) return;
        self.view = b.dataset.v; setView(self.view); self.qi = 0; self.closeTip(); self.render();
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
      };
    });
    el.querySelectorAll('.mk-dot').forEach(function (d) {
      d.onclick = function () {
        var i = +d.dataset.i;
        if (self.view === 'one') { self.qi = i; self.render(); self.focusGap(); return; }
        var g = el.querySelector('.mk-gap[data-k="' + i + '"]') || el.querySelectorAll('.mk-line')[i];
        if (g) { g.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(function () { if (g.focus) g.focus(); }, 300); }
      };
    });
    el.querySelectorAll('button.mk-gap').forEach(function (b) {
      b.onclick = function (e) { e.stopPropagation(); self.openTip(b, +b.dataset.k); };
    });
    el.querySelectorAll('input.mk-gap').forEach(function (inp) {
      var k = +inp.dataset.k, q = self.qs[k];
      inp.addEventListener('input', function () { self.answers[q.id] = inp.value; if (self.warn[q.id]) { self.warn[q.id] = ''; var w = inp.closest('.mk-body').querySelector('.mk-warn'); if (w) w.remove(); } self.paintProgress(); });
      inp.addEventListener('change', function () { self.check1(q, inp); });
      inp.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return; e.preventDefault();
        self.check1(q, inp);
        if (self.view === 'one') { if (self.qi < self.qs.length - 1) { self.qi++; self.render(); self.focusGap(); } else { var s = el.querySelector('[data-b="submit"]'); if (s && !s.disabled) s.click(); } return; }
        var next = el.querySelector('input.mk-gap[data-k="' + (k + 1) + '"]');
        if (next) next.focus(); else { var sb = el.querySelector('[data-b="submit"]'); if (sb && !sb.disabled) sb.focus(); }
      });
    });
    el.querySelectorAll('.mk-bar button').forEach(function (b) {
      b.onclick = function () {
        var w = b.dataset.b;
        if (w === 'prev' && self.qi > 0) { self.qi--; self.render(); self.focusGap(); }
        else if (w === 'next' && self.qi < self.qs.length - 1) { self.qi++; self.render(); self.focusGap(); }
        else if (w === 'clear') {
          if (self.view === 'one') delete self.answers[self.qs[self.qi].id]; else { self.answers = {}; self.warn = {}; }
          self.render();
        }
        else if (w === 'submit') self.submit();
        else if (w === 'again') { self.answers = {}; self.marks = {}; self.marked = false; self.qi = 0; self.render(); window.scrollTo(0, 0); }
        else if (w === 'more') { self.deal(); window.scrollTo(0, 0); }
      };
    });
  };

  /* A gentle check while typing: Part 4's word count and key word. It
     never blocks — the exam would simply give no mark — but it says so
     before Submit, while the student can still fix it. */
  Kit.prototype.check1 = function (q, inp) {
    if (!q.validate) return;
    var v = String(inp.value || '').trim(); if (!v) return;
    var msg = q.validate(v) || '';
    this.warn[q.id] = msg;
    var body = inp.closest('.mk-body'), old = body.querySelector('.mk-warn');
    if (old) old.remove();
    if (msg) { var s = document.createElement('span'); s.className = 'mk-warn'; s.textContent = msg; body.appendChild(s); }
  };

  Kit.prototype.focusGap = function () {
    var g = this.el.querySelector('input.mk-gap');
    if (g && window.matchMedia && !window.matchMedia('(pointer:coarse)').matches) setTimeout(function () { g.focus(); }, 60);
  };

  Kit.prototype.openTip = function (btn, k) {
    if (this.marked) return;
    var self = this, q = this.qs[k], tip = this.tip;
    document.querySelectorAll('.mk-gap.open').forEach(function (b) { b.classList.remove('open'); });
    btn.classList.add('open');
    tip.innerHTML = '<div class="mk-tip-head">Choose one</div>' + q._o.map(function (o, i) {
      return '<button class="mk-tip-opt' + (self.answers[q.id] === o ? ' chosen' : '') + '" type="button" data-o="' + esc(o) + '"><span class="let">' + LETTER[i] + '</span>' + esc(o) + '</button>';
    }).join('');
    tip.querySelectorAll('.mk-tip-opt').forEach(function (o) {
      o.onclick = function (e) {
        e.stopPropagation();
        self.answers[q.id] = o.dataset.o; sfx('tick'); self.closeTip(); self.render();
        if (self.view === 'one' && self.qi < self.qs.length - 1) setTimeout(function () { self.qi++; self.render(); }, 260);
      };
    });
    tip.classList.add('show');
    var r = btn.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
    var x = Math.max(8, Math.min(r.left + r.width / 2 - tw / 2, window.innerWidth - tw - 8));
    /* the fixed bar takes the bottom of the screen: flip above when the list would reach it */
    var bar = this.el.querySelector('.mk-bar'), floor = window.innerHeight - (bar ? bar.offsetHeight : 0);
    var y = (r.bottom + th + 8 > floor) ? r.top + window.scrollY - th - 8 : r.bottom + window.scrollY + 8;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  };
  Kit.prototype.closeTip = function () {
    this.tip.classList.remove('show');
    document.querySelectorAll('.mk-gap.open').forEach(function (b) { b.classList.remove('open'); });
  };

  Kit.prototype.score = function () {
    var self = this, max = this.cfg.max || 1, got = 0;
    this.qs.forEach(function (q) { got += self.marks[q.id] || 0; });
    return { got: got, max: this.qs.length * max };
  };

  Kit.prototype.submit = function () {
    var self = this, cfg = this.cfg, max = cfg.max || 1;
    if (this.marked || this.answered() < this.qs.length) return;
    this.qs.forEach(function (q) {
      var v = String(self.answers[q.id]).trim();
      var m = q.validate && q.validate(v) ? 0 : +q.check(v) || 0;
      self.marks[q.id] = Math.min(max, m);
      try { cfg.remember(q, m >= max); } catch (e) {}
    });
    this.marked = true; this.qi = 0; this.closeTip(); this.render();
    var sc = this.score(), pct = Math.round(sc.got / sc.max * 100);
    var missed = this.qs.filter(function (q) { return (self.marks[q.id] || 0) < max; });
    var fixed = this.qs.filter(function (q) { return self.ringBefore[q.id] && (self.marks[q.id] || 0) >= max; }).length;
    var lines = [];
    if (missed.length) lines.push('<b>' + missed.length + '</b> ' + (missed.length === 1 ? 'comes' : 'come') + ' back first in your next set');
    if (fixed) lines.push('<b>' + fixed + '</b> old ' + (fixed === 1 ? 'mistake' : 'mistakes') + ' put right');
    this.ov.innerHTML = '<div class="mk-ov-card">' +
      '<div class="mk-ov-title">' + (pct === 100 ? 'Perfect' : pct >= 75 ? 'Strong' : pct >= 50 ? 'Getting there' : 'Keep going') + '</div>' +
      '<div class="mk-ov-sc">' + sc.got + ' / ' + sc.max + (max > 1 ? ' marks' : ' correct') + ' · ' + pct + '%</div>' +
      '<div class="mk-ov-bars">' + this.qs.map(function (q) { var m = self.marks[q.id] || 0; return '<i class="' + (m >= max ? 'ok' : m > 0 ? 'half' : 'no') + '"></i>'; }).join('') + '</div>' +
      (lines.length ? '<p class="mk-ov-ring">' + lines.join(' · ') + '.</p>' : '') +
      (missed.length ? '<div class="mk-ov-miss"><div class="mk-ov-h">Worth another look</div>' + missed.map(function (q) {
        var i = self.qs.indexOf(q);
        return '<div class="mk-ov-i">' + String(i + 1).padStart(2, '0') + ' · <s>' + esc(self.answers[q.id]) + '</s> → <b>' + esc(q.ans) + '</b>' +
          (q.why ? '<span class="mk-ov-w">' + esc(q.why) + '</span>' : '') + '</div>';
      }).join('') + '</div>' : '') +
      '<div class="mk-ov-btns"><button class="mk-ov-btn primary" type="button" data-o="more">' + esc(cfg.moreLabel || ('Next ' + (cfg.n || 8))) + ' &rsaquo;</button>' +
      '<button class="mk-ov-btn ghost" type="button" data-o="review">See the answers</button></div></div>';
    this.ov.querySelector('[data-o="more"]').onclick = function () { self.ov.classList.remove('show'); self.deal(); window.scrollTo(0, 0); };
    this.ov.querySelector('[data-o="review"]').onclick = function () { self.ov.classList.remove('show'); window.scrollTo(0, 0); };
    this.ov.onclick = function (e) { if (e.target === self.ov) self.ov.classList.remove('show'); };
    sfx(pct === 100 ? 'fanfare' : 'bowlLow');
    this.ov.classList.add('show');
    var b = this.ov.querySelector('[data-o="more"]'); if (b) b.focus({ preventScroll: true });
    var card = this.ov.querySelector('.mk-ov-card'); if (card) card.scrollTop = 0;
  };

  window.MasterKit = {
    mount: function (el, cfg) { var k = new Kit(el, cfg); k.deal(); return k; }
  };
})();
