/* ═══════════════════════════════════════════════════════════════════════
   USE OF ENGLISH — MASTER PRACTICE (Nov 2026)

   One practice engine for the four Master pages, built on the pattern the
   Part 1 exam page already had right: ONE PAPER SHEET of numbered sentences
   ruled apart, or ONE SENTENCE AT A TIME — the "All | One at a time" pill
   pair on the card's top edge, the dots under it, the bar along the bottom,
   and a results card with "Worth another look" and the reason for each.

   TWO VIEWS, TWO WAYS OF MARKING (2 Nov, after the assessor's review):
     · ALL is the exam: answer the whole set, Submit marks it together.
     · ONE AT A TIME is the coach: each sentence is marked the moment it is
       checked — right or wrong, the answer and the reason — then Next.
       A distracted student finds out now, not eight sentences later.
     Both feed the same marks, the same Ring and the same results card.
     Phones open on One at a time (a column of eight text boxes under a
     phone keyboard is a worksheet); the choice is remembered either way.

   A page hands over its items already shaped:
     { id, pre, post, lead?, key?, opts?, ans, why, also?, check(v)->marks, validate?(v)->msg }
   and its config:
     MasterKit.mount(el, { n, max, kind, kick, rubric, label(), items(), remember(q,ok),
                           exam?:{href,label}, dispute?:true, moreLabel?, unit? })
   kind: 'choose' (tap one of four), 'type' (one word), 'phrase' (2–5 words)

   ROOM TO GROW: marking, the bar and the results card each live in one
   function below (checkOne, barHTML, finish), so a later change — a timer,
   a streak, a hint — has one place to go.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); };
  var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var VIEWKEY = 'intuity.master.view';
  var phone = function () { try { return window.matchMedia('(max-width: 600px)').matches; } catch (e) { return false; } };
  var getView = function () {
    try { var v = localStorage.getItem(VIEWKEY); if (v === 'one' || v === 'full') return v; } catch (e) {}
    return phone() ? 'one' : 'full';
  };
  var setView = function (v) { try { localStorage.setItem(VIEWKEY, v); } catch (e) {} };
  var due = function (id) { try { return !!(window.IntuityRing && IntuityRing.isDue(id)); } catch (e) { return false; } };
  var held = function (id) { try { return !!(window.IntuityRing && IntuityRing.has(id)); } catch (e) { return false; } };
  var sfx = function (n) { try { if (window.SFX && SFX.isOn() && SFX[n]) SFX[n](); } catch (e) {} };
  var filled = function (v) { return v !== undefined && v !== null && String(v).trim() !== ''; };
  var LETTER = ['A', 'B', 'C', 'D', 'E'];

  /* "I think mine is right": kept on this device, for the teacher to see.
     The list is read by MasterKit.disputes(), so a teacher page can show it. */
  var DISPUTES = 'intuity.master.disputes';
  function saveDispute(rec) {
    try { var a = JSON.parse(localStorage.getItem(DISPUTES) || '[]'); a.push(rec); localStorage.setItem(DISPUTES, JSON.stringify(a.slice(-200))); } catch (e) {}
  }

  function Kit(el, cfg) {
    this.el = el; this.cfg = cfg; this.view = getView();
    this.seen = {};
    this.tip = document.getElementById('mkTip');
    if (!this.tip) { this.tip = document.createElement('div'); this.tip.className = 'mk-tip'; this.tip.id = 'mkTip'; document.body.appendChild(this.tip); }
    this.ov = document.getElementById('mkOv');
    if (!this.ov) { this.ov = document.createElement('div'); this.ov.className = 'mk-ov'; this.ov.id = 'mkOv'; this.ov.setAttribute('role', 'dialog'); this.ov.setAttribute('aria-modal', 'true'); document.body.appendChild(this.ov); }
    if (!Kit.wired) {
      Kit.wired = true;
      document.addEventListener('click', function (e) { if (Kit.cur && !e.target.closest('.mk-tip') && !e.target.closest('.mk-gap')) Kit.cur.closeTip(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && Kit.cur) { Kit.cur.closeTip(); Kit.cur.ov.classList.remove('show'); } });
      window.addEventListener('scroll', function () { if (Kit.cur) Kit.cur.closeTip(); }, { passive: true });
    }
    Kit.cur = this;
  }

  /* A new set: what is due first, then what this visit has not shown yet. */
  Kit.prototype.deal = function () {
    var all = this.cfg.items(), n = this.cfg.n || 8, seen = this.seen;
    var dueOnes = shuffle(all.filter(function (i) { return due(i.id); }));
    var fresh = shuffle(all.filter(function (i) { return !due(i.id) && !seen[i.id]; }));
    if (dueOnes.length + fresh.length < n) { this.seen = {}; seen = this.seen; fresh = shuffle(all.filter(function (i) { return !due(i.id); })); }
    var pick = dueOnes.concat(fresh).slice(0, n);
    pick.forEach(function (i) { seen[i.id] = 1; });
    this.qs = pick; this.reset();
    /* choice options are shuffled once per set, so they do not jump about */
    this.qs.forEach(function (q) { if (q.opts) q._o = shuffle(q.opts); });
    var rb = this.ringBefore = {}; this.qs.forEach(function (q) { rb[q.id] = held(q.id); });
    this.render();
  };
  Kit.prototype.reset = function () { this.answers = {}; this.marks = {}; this.checked = {}; this.marked = false; this.qi = 0; this.warn = {}; this.disputed = {}; };

  Kit.prototype.answered = function () { var a = this.answers; return this.qs.filter(function (q) { return filled(a[q.id]); }).length; };
  Kit.prototype.nChecked = function () { var c = this.checked; return this.qs.filter(function (q) { return c[q.id]; }).length; };

  Kit.prototype.gapHTML = function (q, k) {
    var a = this.answers[q.id], has = filled(a), cfg = this.cfg;
    if (this.checked[q.id]) {
      var m = this.marks[q.id] || 0, max = cfg.max || 1;
      var cls = m >= max ? 'ok' : m > 0 ? 'half' : 'no';
      return '<span class="mk-gap done ' + cls + '">' + (has ? esc(a) : '—') + '</span>' +
        (m < max ? '<span class="mk-fix">' + esc(q.ans) + '</span>' : '');
    }
    if (cfg.kind === 'choose') {
      return '<button class="mk-gap' + (has ? ' filled' : '') + '" type="button" data-k="' + k + '">' + (has ? esc(a) : '    ') + '</button>';
    }
    var ph = cfg.kind === 'phrase' ? '2–5 words' : 'one word';
    return '<input class="mk-gap mk-in' + (cfg.kind === 'phrase' ? ' wide' : '') + '" data-k="' + k + '" value="' + esc(has ? a : '') + '" placeholder="' + ph +
      '" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Answer ' + (k + 1) + '">';
  };

  Kit.prototype.lineHTML = function (q, k) {
    var done = this.checked[q.id], m = this.marks[q.id] || 0, max = this.cfg.max || 1, one = this.view === 'one';
    var lead = q.lead ? '<span class="mk-lead">' + esc(q.lead) + '</span>' : '';
    var key = q.key ? '<span class="mk-key">' + esc(q.key) + '</span>' : '';
    var body = esc(q.pre) + this.gapHTML(q, k) + esc(q.post);
    var warn = !done && this.warn[q.id] ? '<span class="mk-warn">' + esc(this.warn[q.id]) + '</span>' : '';
    var why = '';
    if (done && m < max) {
      why = '<span class="mk-why">' + (m > 0 ? '<b>One mark</b> — half of it is right. ' : '') + esc(q.why || '') +
        (q.also ? '<span class="mk-also">Also right: ' + esc(q.also) + '</span>' : '') +
        (this.cfg.dispute ? (this.disputed[q.id]
          ? '<span class="mk-disp done">Saved. Show it to your teacher.</span>'
          : '<button class="mk-disp" type="button" data-d="' + k + '">I think mine is right</button>') : '') + '</span>';
    } else if (done && one) {
      /* alone on the screen, a right answer deserves a word — and the reason, which is the lesson */
      why = '<span class="mk-why ok"><b>Right.</b> ' + esc(q.why || '') + '</span>';
    }
    return '<div class="mk-line"><span class="mk-num">' + String(k + 1).padStart(2, '0') + '</span><div class="mk-body">' +
      lead + (q.key && !q.lead ? '' : key) + '<span class="mk-text">' + body + '</span>' + (q.key && !q.lead ? key : '') + warn + why + '</div></div>';
  };

  Kit.prototype.infoText = function () {
    var n = this.qs.length, cfg = this.cfg;
    if (this.marked) { var s = this.score(); return cfg.label() + ' · ' + n + (cfg.unit || ' sentences') + ' · ' + s.got + '/' + s.max + (cfg.max > 1 ? ' marks' : ' right'); }
    var c = this.view === 'one' ? this.nChecked() : this.answered();
    return cfg.label() + ' · ' + n + (cfg.unit || ' sentences') + ' · ' + c + '/' + n + ' done';
  };

  /* The bar. ALL: Clear · Submit. ONE: Prev · Check (or Next once checked) · Next. */
  Kit.prototype.barHTML = function () {
    var n = this.qs.length, cfg = this.cfg, more = esc(cfg.moreLabel || ('Next ' + (cfg.n || 8)));
    if (this.marked) return '<button type="button" data-b="again">Try again</button><button class="go" type="button" data-b="more">' + more + ' &rsaquo;</button>';
    if (this.view !== 'one') {
      var left = n - this.answered();
      return '<button type="button" data-b="clear">Clear</button>' +
        '<button class="go" type="button" data-b="submit"' + (left ? ' disabled' : '') + '>' + (left ? 'Submit — ' + left + ' to go' : 'Submit') + '</button>';
    }
    var q = this.qs[this.qi], done = this.checked[q.id], last = this.nChecked() === n;
    var prev = '<button type="button" data-b="prev"' + (this.qi === 0 ? ' disabled' : '') + '>&lsaquo; Prev</button>';
    if (!done) return prev + '<button class="go" type="button" data-b="check"' + (filled(this.answers[q.id]) ? '' : ' disabled') + '>Check</button>' +
      '<button type="button" data-b="next"' + (this.qi === n - 1 ? ' disabled' : '') + '>Skip &rsaquo;</button>';
    return prev + (last
      ? '<button class="go" type="button" data-b="finish">See your result</button>'
      : '<button class="go" type="button" data-b="next">Next &rsaquo;</button>');
  };

  Kit.prototype.render = function () {
    var self = this, cfg = this.cfg, qs = this.qs, n = qs.length, one = this.view === 'one';
    if (!n) { this.el.innerHTML = '<p class="mk-empty">Nothing to practise in this tab yet. Try another.</p>'; return; }
    var shown = one ? [this.qi] : qs.map(function (_, i) { return i; });
    var kick = '<div class="mk-kick">' + esc(cfg.kick || 'Practice') + '<span class="right">' +
      (one ? 'Sentence ' + (this.qi + 1) + ' of ' + n : this.answered() + ' / ' + n + ' answered') + '</span></div>';
    var rubric = cfg.rubric && (!one || this.qi === 0) && !this.marked ? '<p class="mk-rubric">' + esc(cfg.rubric) + '</p>' : '';
    var dots = qs.map(function (q, i) {
      var c = 'qdot';
      if (self.checked[q.id]) { var m = self.marks[q.id] || 0; c += m >= (cfg.max || 1) ? ' ok' : m > 0 ? ' half' : ' no'; }
      else if (filled(self.answers[q.id])) c += ' filled';
      if (one && i === self.qi) c += ' cur';
      return '<button class="mk-dot ' + c + '" type="button" data-i="' + i + '" aria-label="Sentence ' + (i + 1) + '"></button>';
    }).join('');
    this.el.innerHTML =
      '<div class="mk-viewrow"><div class="mk-info">' + esc(this.infoText()) + '</div>' +
        '<div class="mk-tog" role="group" aria-label="How much to show">' +
          '<button class="mk-vb viewbtn' + (one ? '' : ' active') + '" type="button" data-v="full" aria-pressed="' + !one + '">All</button>' +
          '<button class="mk-vb viewbtn' + (one ? ' active' : '') + '" type="button" data-v="one" aria-pressed="' + one + '">One at a time</button>' +
        '</div></div>' +
      '<div class="mk-dots">' + dots + '</div>' +
      '<div class="mk-card' + (one ? ' solo' : '') + (this.marked ? ' marked' : '') + '">' + kick + rubric +
        shown.map(function (i) { return self.lineHTML(qs[i], i); }).join('') + '</div>' +
      (this.marked && cfg.exam ? '<a class="mk-exam" href="' + esc(cfg.exam.href) + '">' + esc(cfg.exam.label) + ' &rsaquo;</a>' : '') +
      '<div class="mk-bar">' + this.barHTML() + '</div>';
    this.wire();
  };

  /* typing must not re-render (the caret would jump): update only the counters */
  Kit.prototype.paintProgress = function () {
    var self = this, n = this.qs.length;
    var info = this.el.querySelector('.mk-info'); if (info) info.textContent = this.infoText();
    var r = this.el.querySelector('.mk-kick .right'); if (r && this.view !== 'one') r.textContent = this.answered() + ' / ' + n + ' answered';
    var s = this.el.querySelector('[data-b="submit"]');
    if (s) { var left = n - this.answered(); s.disabled = !!left; s.textContent = left ? 'Submit — ' + left + ' to go' : 'Submit'; }
    var c = this.el.querySelector('[data-b="check"]');
    if (c) c.disabled = !filled(this.answers[this.qs[this.qi].id]);
    this.el.querySelectorAll('.mk-dot').forEach(function (d) {
      var q = self.qs[+d.dataset.i]; if (!self.checked[q.id]) d.classList.toggle('filled', filled(self.answers[q.id]));
    });
  };

  Kit.prototype.go = function (i) { this.qi = Math.max(0, Math.min(this.qs.length - 1, i)); this.closeTip(); this.render(); this.focusGap(); };

  Kit.prototype.wire = function () {
    var self = this, el = this.el;
    el.querySelectorAll('.mk-vb').forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains('active')) return;
        self.view = b.dataset.v; setView(self.view);
        /* into One at a time: start on the first sentence not yet checked */
        var k = self.qs.findIndex(function (q) { return !self.checked[q.id]; });
        self.qi = k < 0 ? 0 : k; self.closeTip(); self.render();
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
      };
    });
    el.querySelectorAll('.mk-dot').forEach(function (d) {
      d.onclick = function () {
        var i = +d.dataset.i;
        if (self.view === 'one') { self.go(i); return; }
        var g = el.querySelector('.mk-gap[data-k="' + i + '"]') || el.querySelectorAll('.mk-line')[i];
        if (g) { g.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(function () { if (g.focus) g.focus(); }, 300); }
      };
    });
    el.querySelectorAll('button.mk-gap').forEach(function (b) {
      b.onclick = function (e) { e.stopPropagation(); self.openTip(b, +b.dataset.k); };
    });
    el.querySelectorAll('.mk-disp[data-d]').forEach(function (b) {
      b.onclick = function () {
        var q = self.qs[+b.dataset.d];
        saveDispute({ id: q.id, page: location.pathname, answer: String(self.answers[q.id] || ''), key: q.ans, at: new Date().toISOString() });
        self.disputed[q.id] = 1; self.render();
      };
    });
    el.querySelectorAll('input.mk-gap').forEach(function (inp) {
      var k = +inp.dataset.k, q = self.qs[k];
      inp.addEventListener('input', function () {
        self.answers[q.id] = inp.value;
        if (self.warn[q.id]) { self.warn[q.id] = ''; var w = inp.closest('.mk-body').querySelector('.mk-warn'); if (w) w.remove(); }
        self.paintProgress();
      });
      inp.addEventListener('change', function () { if (self.view !== 'one') self.check1(q, inp); });
      inp.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return; e.preventDefault();
        if (self.view === 'one') { if (filled(inp.value)) self.checkOne(k); return; }
        self.check1(q, inp);
        var next = el.querySelector('input.mk-gap[data-k="' + (k + 1) + '"]');
        if (next) next.focus(); else { var sb = el.querySelector('[data-b="submit"]'); if (sb && !sb.disabled) sb.focus(); }
      });
    });
    el.querySelectorAll('.mk-bar button').forEach(function (b) {
      b.onclick = function () {
        var w = b.dataset.b;
        if (w === 'prev') self.go(self.qi - 1);
        else if (w === 'next') {
          /* Next goes to the next sentence still to do; past the end, back to any skipped */
          var n = self.qs.length, j;
          for (j = 1; j <= n; j++) { var q = self.qs[(self.qi + j) % n]; if (!self.checked[q.id]) break; }
          self.go(j <= n ? (self.qi + j) % n : self.qi + 1);
        }
        else if (w === 'check') self.checkOne(self.qi);
        else if (w === 'finish') self.finish();
        else if (w === 'clear') { self.answers = {}; self.warn = {}; self.render(); }
        else if (w === 'submit') self.submit();
        else if (w === 'again') { self.reset(); self.render(); window.scrollTo(0, 0); }
        else if (w === 'more') { self.deal(); window.scrollTo(0, 0); }
      };
    });
  };

  /* A gentle check while typing: Part 4's word count and key word. */
  Kit.prototype.check1 = function (q, inp) {
    if (!q.validate) return '';
    var v = String(inp.value || '').trim(); if (!v) return '';
    var msg = q.validate(v) || '';
    this.warn[q.id] = msg;
    var body = inp.closest('.mk-body'), old = body.querySelector('.mk-warn');
    if (old) old.remove();
    if (msg) { var s = document.createElement('span'); s.className = 'mk-warn'; s.textContent = msg; body.appendChild(s); }
    return msg;
  };

  Kit.prototype.focusGap = function () {
    var g = this.el.querySelector('input.mk-gap');
    if (g && window.matchMedia && !window.matchMedia('(pointer:coarse)').matches) setTimeout(function () { g.focus(); }, 60);
  };

  /* marks one answer — the only place a mark is given */
  Kit.prototype.mark = function (q) {
    var max = this.cfg.max || 1, v = String(this.answers[q.id] || '').trim();
    var m = q.validate && q.validate(v) ? 0 : +q.check(v) || 0;
    this.marks[q.id] = Math.min(max, m); this.checked[q.id] = 1;
    try { this.cfg.remember(q, m >= max); } catch (e) {}
    return m >= max;
  };

  /* ONE AT A TIME: mark this sentence now. A typed answer that breaks the
     task's own rule (one word; two to five words with the key word) is sent
     back with the reason instead of being marked — that is a slip, not a
     mistake, and the student can fix it. */
  Kit.prototype.checkOne = function (k) {
    var q = this.qs[k]; if (!q || this.checked[q.id] || !filled(this.answers[q.id])) return;
    var inp = this.el.querySelector('input.mk-gap[data-k="' + k + '"]');
    if (inp && this.check1(q, inp)) { inp.select(); return; }
    var ok = this.mark(q); sfx(ok ? 'correct' : 'wrong');
    this.render();
    var nb = this.el.querySelector('[data-b="next"],[data-b="finish"]');
    if (nb && window.matchMedia && !window.matchMedia('(pointer:coarse)').matches) nb.focus();
    if (this.nChecked() === this.qs.length) { var self = this; setTimeout(function () { if (!self.marked) self.finish(); }, ok ? 900 : 2400); }
  };

  Kit.prototype.openTip = function (btn, k) {
    var q = this.qs[k]; if (this.marked || this.checked[q.id]) return;
    var self = this, tip = this.tip;
    document.querySelectorAll('.mk-gap.open').forEach(function (b) { b.classList.remove('open'); });
    btn.classList.add('open');
    tip.innerHTML = '<div class="mk-tip-head">Choose one</div>' + q._o.map(function (o, i) {
      return '<button class="mk-tip-opt' + (self.answers[q.id] === o ? ' chosen' : '') + '" type="button" data-o="' + esc(o) + '"><span class="let">' + LETTER[i] + '</span>' + esc(o) + '</button>';
    }).join('');
    tip.querySelectorAll('.mk-tip-opt').forEach(function (o) {
      o.onclick = function (e) {
        e.stopPropagation();
        self.answers[q.id] = o.dataset.o; sfx('tick'); self.closeTip();
        if (self.view === 'one') self.checkOne(k); else self.render();
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

  /* ALL: mark whatever is not marked yet, together, like the exam */
  Kit.prototype.submit = function () {
    var self = this;
    if (this.marked || this.answered() < this.qs.length) return;
    this.qs.forEach(function (q) { if (!self.checked[q.id]) self.mark(q); });
    this.finish();
  };

  Kit.prototype.finish = function () {
    var self = this, cfg = this.cfg, max = cfg.max || 1;
    this.marked = true; this.closeTip(); this.render();
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
        return '<div class="mk-ov-i">' + String(i + 1).padStart(2, '0') + ' · <s>' + esc(self.answers[q.id] || '—') + '</s> → <b>' + esc(q.ans) + '</b>' +
          (q.why ? '<span class="mk-ov-w">' + esc(q.why) + '</span>' : '') + '</div>';
      }).join('') + '</div>' : '') +
      '<div class="mk-ov-btns"><button class="mk-ov-btn primary" type="button" data-o="more">' + esc(cfg.moreLabel || ('Next ' + (cfg.n || 8))) + ' &rsaquo;</button>' +
      '<button class="mk-ov-btn ghost" type="button" data-o="review">See the answers</button></div>' +
      /* the bridge: single sentences are the drill, the exam is a text */
      (cfg.exam ? '<a class="mk-ov-exam" href="' + esc(cfg.exam.href) + '">' + esc(cfg.exam.label) + ' &rsaquo;</a>' : '') + '</div>';
    this.ov.querySelector('[data-o="more"]').onclick = function () { self.ov.classList.remove('show'); self.deal(); window.scrollTo(0, 0); };
    this.ov.querySelector('[data-o="review"]').onclick = function () { self.ov.classList.remove('show'); window.scrollTo(0, 0); };
    this.ov.onclick = function (e) { if (e.target === self.ov) self.ov.classList.remove('show'); };
    sfx(pct === 100 ? 'fanfare' : 'bowlLow');
    this.ov.classList.add('show');
    var b = this.ov.querySelector('[data-o="more"]'); if (b) b.focus({ preventScroll: true });
    var card = this.ov.querySelector('.mk-ov-card'); if (card) card.scrollTop = 0;
  };

  window.MasterKit = {
    mount: function (el, cfg) { var k = new Kit(el, cfg); k.deal(); return k; },
    disputes: function () { try { return JSON.parse(localStorage.getItem(DISPUTES) || '[]'); } catch (e) { return []; } }
  };
})();
