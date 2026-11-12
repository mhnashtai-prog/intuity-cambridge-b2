/* ═══════════════════════════════════════════════════════════════════════
   TELL US · a pupil reports a mark they think is wrong  ·  v1 (12 Nov 2026)

   Pupils found two real bugs in one lesson (a fair order marked wrong,
   can't refused for cannot) and the only way to tell us was a photo of a
   phone. Now, after any answer marked wrong anywhere in the app, a small
   pill appears for a few seconds: "Marked wrong? Tell us". One tap opens a
   card in the FiveCard look; the pupil picks what is wrong, may add a
   line, and sends. Nothing about the pupil is sent: no name, no email.

   WHERE IT GOES: a Netlify form called "report" (its static twin is in
   index.html, so Netlify's form detection finds it). Reports arrive in
   Netlify → Forms, and by email if notifications are switched on. If the
   send fails (offline), the report waits on the phone and goes next time.

   HOW IT HEARS A MISS: tools/be2-progress.js fires "be2:miss" for every
   wrong answer (Be2.answer, and the old INTUITY.log bridge). Misses within
   a few seconds of each other (a checked test of eight gaps) are offered
   together, so the pupil can say which one.

   Loaded by tools/be2-brand.js, so every page that carries the mark has it.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  if (window.ReportIt) return;
  var FORM = 'report', QUEUE = 'intuity.report.queue', SHOW_MS = 9000, GROUP_MS = 4000;
  var misses = [], pillT = null, open = false;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function plain(s) { return String(s == null ? '' : s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
  function cut(s, n) { s = plain(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  if (!document.querySelector('link[href*="/tools/five-card.css"]')) {
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/tools/five-card.css?v=6';
    (document.head || document.documentElement).appendChild(l);
  }
  var css =
    '.ri-pill{position:fixed;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 88px);z-index:9000;display:inline-flex;align-items:center;gap:.4rem;' +
      'min-height:36px;padding:0 .9rem;border:0;border-radius:999px;background:#14110E;color:#FAF8F5;font:600 12px/1 "Geist",system-ui,sans-serif;letter-spacing:.01em;' +
      'box-shadow:0 0 0 2px #FAF8F5,0 6px 18px rgba(20,17,14,.22);cursor:pointer;opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s}' +
    '.ri-pill.on{opacity:1;transform:none}' +
    '.ri-pill::before{content:"";width:8px;height:8px;border-radius:50%;background:#B0865C;flex:none}' +
    '.ri-veil{position:fixed;inset:0;z-index:9001;background:rgba(20,17,14,.45);display:flex;align-items:flex-end;justify-content:center;padding:0 12px calc(env(safe-area-inset-bottom,0px) + 12px)}' +
    '.ri-veil .fc-card{width:100%;max-width:30rem;max-height:86vh;overflow:auto;padding:16px 16px 14px;box-shadow:0 18px 40px rgba(20,17,14,.3)}' +
    '.ri-sub{display:block;font-size:13px;line-height:1.45;color:#6B655C;margin:10px 0 0}' +
    '.ri-list{display:flex;flex-direction:column;gap:6px;margin:12px 0 0}' +
    '.ri-it{all:unset;box-sizing:border-box;display:block;width:100%;padding:9px 11px;border:1.5px solid rgba(20,17,14,.14);border-radius:6px;font:400 13px/1.4 "Geist",system-ui,sans-serif;color:#14110E;cursor:pointer;background:#fff}' +
    '.ri-it small{display:block;font:500 10px/1.3 "Geist Mono",monospace;letter-spacing:.06em;color:#6B655C;margin-top:3px}' +
    '.ri-it.on{border-color:#14110E;box-shadow:inset 0 0 0 1px #14110E}' +
    '.ri-lab{display:block;font:500 10px/1.3 "Geist Mono",monospace;letter-spacing:.2em;text-transform:uppercase;color:#6B655C;margin:14px 0 0}' +
    '.ri-why{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0}' +
    '.ri-why button{all:unset;box-sizing:border-box;min-height:36px;padding:0 12px;display:inline-flex;align-items:center;border-radius:999px;border:1.5px solid #C9C1B4;background:#FAF8F5;font:600 12.5px/1.2 "Geist",system-ui,sans-serif;color:#14110E;cursor:pointer}' +
    '.ri-why button.on{background:#14110E;border-color:#14110E;color:#FAF8F5}' +
    '.ri-note{display:block;box-sizing:border-box;width:100%;margin:12px 0 0;padding:9px 11px;border:1.5px solid rgba(20,17,14,.14);border-radius:6px;font:400 14px/1.4 "Geist",system-ui,sans-serif;color:#14110E;background:#fff;resize:none}' +
    '.ri-row{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:14px 0 0}' +
    '.ri-row .ri-x{all:unset;cursor:pointer;font:650 14px/1 "Geist",system-ui,sans-serif;color:#8E6238;padding:12px 4px}' +
    '.ri-row .ri-go{all:unset;box-sizing:border-box;cursor:pointer;min-height:44px;padding:0 22px;display:inline-flex;align-items:center;border-radius:999px;background:#14110E;color:#FAF8F5;font:700 14px/1 "Geist",system-ui,sans-serif}' +
    '.ri-row .ri-go[aria-disabled="true"]{opacity:.35;cursor:default}' +
    '.ri-done{display:block;font-size:14px;line-height:1.5;margin:12px 0 4px}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  /* ── sending: a Netlify form post; on failure the report waits on the phone ── */
  function post(r) {
    var body = new URLSearchParams(Object.assign({ 'form-name': FORM, bot: '' }, r)).toString();
    return fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function (res) { if (!res.ok) throw new Error(res.status); });
  }
  function queue() { try { return JSON.parse(localStorage.getItem(QUEUE) || '[]'); } catch (e) { return []; } }
  function setQueue(q) { try { localStorage.setItem(QUEUE, JSON.stringify(q.slice(-20))); } catch (e) {} }
  function flush() {
    var q = queue(); if (!q.length || !navigator.onLine) return;
    var r = q[0];
    post(r).then(function () { setQueue(queue().slice(1)); flush(); }, function () {});
  }
  function send(r) { return post(r).catch(function () { var q = queue(); q.push(r); setQueue(q); }); }

  /* ── the pill ── */
  var pill = null;
  function showPill() {
    if (open) return;
    if (!pill) {
      pill = document.createElement('button'); pill.type = 'button'; pill.className = 'ri-pill';
      pill.textContent = 'Marked wrong? Tell us';
      pill.onclick = openCard; document.body.appendChild(pill);
    }
    pill.hidden = false; requestAnimationFrame(function () { pill.classList.add('on'); });
    clearTimeout(pillT); pillT = setTimeout(hidePill, SHOW_MS);
  }
  function hidePill() { if (!pill) return; pill.classList.remove('on'); setTimeout(function () { if (pill && !pill.classList.contains('on')) pill.hidden = true; }, 260); }

  /* ── the card ── */
  var WHY = [['count', 'My answer should count'], ['key', 'The right answer is wrong'], ['unclear', 'The question is unclear'], ['other', 'Something else']];
  function openCard() {
    hidePill(); if (!misses.length) return; open = true;
    var list = misses.slice(-8).reverse(), pick = list.length === 1 ? 0 : -1, why = '';
    var v = document.createElement('div'); v.className = 'ri-veil';
    v.innerHTML = '<div class="fc-card" role="dialog" aria-modal="true" aria-label="Tell us">' +
      '<span class="fc-k">Tell us</span><span class="fc-t">Marked wrong?</span><span class="fc-bar" aria-hidden="true"></span>' +
      '<span class="ri-sub">If you think the app got it wrong, say so. Your teacher reads every one. Your name isn’t sent.</span>' +
      (list.length > 1 ? '<span class="ri-lab">Which one?</span>' : '') +
      '<div class="ri-list">' + list.map(function (m, k) {
        return '<button type="button" class="ri-it' + (k === pick ? ' on' : '') + '" data-k="' + k + '">' + esc(cut(m.prompt || m.id || 'This question', 110)) +
          ((m.given || m.answer) ? '<small>' + (m.given ? 'You: ' + esc(cut(m.given, 50)) : '') + (m.given && m.answer ? ' · ' : '') + (m.answer ? 'App: ' + esc(cut(m.answer, 50)) : '') + '</small>' : '') + '</button>';
      }).join('') + '</div>' +
      '<span class="ri-lab">What’s wrong?</span><div class="ri-why">' + WHY.map(function (w) { return '<button type="button" data-w="' + w[0] + '">' + esc(w[1]) + '</button>'; }).join('') + '</div>' +
      '<textarea class="ri-note" rows="2" maxlength="400" placeholder="Anything to add? (optional)"></textarea>' +
      '<div class="ri-row"><button type="button" class="ri-x">Cancel</button><button type="button" class="ri-go" aria-disabled="true">Send</button></div></div>';
    document.body.appendChild(v);
    var go = v.querySelector('.ri-go');
    function ready() { go.setAttribute('aria-disabled', !(pick >= 0 && why)); }
    [].forEach.call(v.querySelectorAll('.ri-it'), function (b) { b.onclick = function () { pick = +b.dataset.k;
      [].forEach.call(v.querySelectorAll('.ri-it'), function (x) { x.classList.toggle('on', x === b); }); ready(); }; });
    [].forEach.call(v.querySelectorAll('.ri-why button'), function (b) { b.onclick = function () { why = b.dataset.w;
      [].forEach.call(v.querySelectorAll('.ri-why button'), function (x) { x.classList.toggle('on', x === b); }); ready(); }; });
    function close() { v.remove(); open = false; }
    v.querySelector('.ri-x').onclick = close;
    v.addEventListener('click', function (e) { if (e.target === v) close(); });
    go.onclick = function () {
      if (go.getAttribute('aria-disabled') === 'true') return;
      var m = list[pick];
      send({ page: location.pathname + location.search, title: document.title, topic: m.topic || '', id: String(m.id || ''),
        prompt: cut(m.prompt, 600), answer: cut(m.answer, 300), given: cut(m.given, 300), reason: why,
        note: v.querySelector('.ri-note').value.trim().slice(0, 400), when: new Date().toISOString(),
        device: (navigator.userAgent.match(/iPhone|iPad|Android|Mac|Windows|Linux/) || ['other'])[0] });
      misses = misses.filter(function (x) { return x !== m; });
      v.querySelector('.fc-card').innerHTML = '<span class="fc-k">Tell us</span><span class="fc-t">Thank you</span><span class="fc-bar" aria-hidden="true"></span>' +
        '<span class="ri-done">Sent. Your teacher will check it, and if the app was wrong, it gets fixed for everyone.</span>' +
        '<div class="ri-row" style="justify-content:flex-end"><button type="button" class="ri-go">OK</button></div>';
      v.querySelector('.ri-go').onclick = close;
      if (window.Cheer) { try { Cheer.tick(v.querySelector('.fc-t')); } catch (e) {} }
    };
  }

  /* ── hearing a miss ── */
  addEventListener('be2:miss', function (e) {
    var d = e.detail || {}, now = Date.now();
    misses = misses.filter(function (m) { return now - m.at < GROUP_MS; });
    misses.push({ at: now, topic: d.topic, id: d.id, prompt: d.prompt, answer: d.answer, given: d.given });
    showPill();
  });
  addEventListener('online', flush);
  setTimeout(flush, 3000);
  window.ReportIt = { open: openCard, flush: flush };
})();
