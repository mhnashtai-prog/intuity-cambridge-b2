/* THE RULE CARD (28 Nov 2026, the Rules blueprint, Conditionals first).
   Vince's grammar pages, one tap away: the moment a pupil wants a rule is the
   moment a sentence says "Not yet". A Why? beside it opens this card, a FiveCard
   (one look for every modal card): the rule's name, its form, then
   Use · Tip · Watch out, and From Portuguese where the contrast helps.

   The words live with the topic's data, on each rule: rules[].structure and
   rules[].lines = [[label, text], …] (data/grammar-rules/conditionals-data.json).
   A rule without lines gets no Why?, so a topic joins by writing its lines.

   RuleCard.show(rule, topicLabel)   rule = { title, structure, lines }
   RuleCard.open(topic, id)          loads /data/grammar-rules/<topic>-data.json
   RuleCard.has(rule)                true when the rule has lines to show      */
(function () {
  if (window.RuleCard) return;
  var cache = {};
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function need(tag, attr, url, ok) {
    if (document.querySelector(tag + '[' + attr + '="' + url + '"]')) { if (ok) (window.FiveCard ? ok() : setTimeout(function () { need(tag, attr, url, ok); }, 60)); return; }
    var el = document.createElement(tag); el[attr] = url; if (tag === 'link') el.rel = 'stylesheet'; else el.onload = ok;
    (document.head || document.documentElement).appendChild(el);
  }
  var css = document.createElement('style');
  css.textContent =
    '.rc-ov{position:fixed;inset:0;z-index:1001;background:rgba(20,17,14,.32);display:flex;align-items:flex-end;justify-content:center}' +
    '.rc-sheet{width:min(560px,100%);max-height:86vh;overflow:auto;background:#F3F1ED;border-radius:18px 18px 0 0;' +
      'padding:1.1rem 1rem calc(1rem + env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(20,17,14,.2);text-align:left}' +
    '.rc-sheet .fc-card{display:block}' +
    '.rc-form{display:inline-block;font:500 .8rem/1.4 "Geist Mono",ui-monospace,monospace;background:rgba(20,17,14,.07);color:#14110E;border-radius:6px;padding:.35em .6em;margin:.2rem 0 .5rem}' +
    '.rc-go{display:block;margin:1rem auto 0;font:700 .6875rem/1 Geist,system-ui,sans-serif;letter-spacing:.11em;text-transform:uppercase;' +
      'color:#F6F3EE;background:#14110E;border:0;border-radius:999px;padding:.85rem 1.6rem;cursor:pointer}' +
    '.rc-why{font:700 .625rem/1 Geist,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#14110E;background:rgba(118,118,128,.12);' +
      'border:0;border-radius:999px;padding:.42rem .7rem;margin-left:.4rem;cursor:pointer;vertical-align:middle;-webkit-tap-highlight-color:transparent}' +
    '@media(min-width:700px){.rc-ov{align-items:center}.rc-sheet{border-radius:18px}}';
  (document.head || document.documentElement).appendChild(css);

  function name(t) { t = String(t || ''); return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(); }
  function has(rule) { return !!(rule && Array.isArray(rule.lines) && rule.lines.length); }
  function show(rule, topic) {
    if (!has(rule)) return;
    need('link', 'href', '/tools/five-card.css?v=7');
    need('script', 'src', '/tools/five-card.js?v=7', function () {
      /* Use opens, Watch out closes, the rest (Tip, From Portuguese) sit between */
      var L = rule.lines, use = L[0], watch = null, mid = [];
      L.slice(1).forEach(function (l) { if (/watch/i.test(l[0]) && !watch) watch = l; else mid.push(l); });
      var spec = { label: (topic || 'Rule') + ' · Rule', task: name(rule.title) + (/conditionals/i.test(topic || '') && !/wish/i.test(rule.title) ? ' conditional' : ''),
        roles: [use[0], mid.length ? mid[0][0] : '', watch ? watch[0] : ''],
        open: [(rule.structure ? '<span class="rc-form">' + esc(rule.structure) + '</span> ' : '') + esc(use[1])],
        body: mid.map(function (l, i) { return { html: esc(l[1]), head: i ? l[0] : '' }; }),
        close: watch ? [esc(watch[1])] : [] };
      var ov = document.createElement('div'); ov.className = 'rc-ov';
      ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'The rule: ' + spec.task);
      ov.innerHTML = '<div class="rc-sheet">' + (window.FiveCard ? FiveCard.card(spec) : '') + '<button type="button" class="rc-go">Got it</button></div>';
      document.body.appendChild(ov);
      var close = function () { ov.remove(); document.removeEventListener('keydown', key); };
      var key = function (e) { if (e.key === 'Escape') close(); };
      ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.rc-go')) close(); });
      document.addEventListener('keydown', key);
      ov.querySelector('.rc-go').focus();
    });
  }
  function load(topic) {
    if (!cache[topic]) cache[topic] = fetch('/data/grammar-rules/' + topic + '-data.json').then(function (r) { return r.json(); });
    return cache[topic];
  }
  function open(topic, id) {
    load(topic).then(function (d) {
      var r = (d.rules || []).filter(function (x) { return x.id === id; })[0];
      show(r, d.title || topic);
    }).catch(function () {});
  }
  window.RuleCard = { show: show, open: open, has: has, load: load };
})();
