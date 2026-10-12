/* ═══════════════════════════════════════════════════════════════════════
   Be2FIRST — THE WORDMARK, IN ONE PLACE  ·  v1
   ═══════════════════════════════════════════════════════════════════════

   ONE LINE PER PAGE, in <head>, WITHOUT defer:

     <script src="/tools/be2-brand.js?v=20261012"></script>

   Why <head>: the CSS below is injected before the first paint, so the old
   name is hidden from frame one and the mark appears in its place — no
   flash of "INTUITY", no jump.

   WHAT IT DOES
   1. Any registered brand slot (BRAND_SLOTS) whose text is exactly the old
      name becomes the Be2FIRST mark.
        .app-title       → the full stacked mark, replacing the element
                           (identical to the hand-built Past Modals header)
        everything else  → a compact inline mark sized to its host
   2. A slot with extra words ("INTUITY — Build Review") keeps its words;
      only the name is swapped, as plain text.
   3. The tab title is rewritten too.

   TO REBRAND AGAIN: change MARK_HTML / NEW_NAME below. Nothing else.

   WHAT IT DOES NOT TOUCH, deliberately:
     postMessage keys ({intuity:'tests'} etc.) — invisible to learners, and
     renaming them half-way would break the frames that talk to each other.
     File names (intuity-shell.css …) — same reason.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  var OLD_NAME = /INTUITY/g;
  var NEW_NAME = 'Be2FIRST';

  /* Every class a page has ever used for the name. Add to this list, never
     to the pages. */
  var BRAND_SLOTS = [
    '.app-title', '.brand', '.nav-title', '.brand-name', '.brand-logo',
    '.header-brand-logo', '.brand-word', '.so-brand', '.anatomy-brand',
    '.g-brand', '.logo-word'
  ].join(',');

  var MARK_HTML =
    '<span class="be2-big be2-top" aria-hidden="true">B<b class="be2-e">e</b>2</span>' +
    '<span class="be2-big be2-bot" aria-hidden="true">B<b class="be2-e">e</b>2</span>' +
    '<span class="be2-band" aria-hidden="true"><i>FIRST</i></span>';

  /* ── CSS: the mark (same geometry as intuity-shell.css §14, so pages that
        already load the shell look identical), the inline size, and the
        pre-paint veil. ── */
  var css =
    'html:not(.be2-ready) :is(' + BRAND_SLOTS + '){visibility:hidden}' +

    '.be2{--mid:.591em;--pivot:.486em;--gap:.36em;--tall:1.2;--e:1.3;' +
      'position:relative;display:block;width:max-content;margin:.1em auto .4em;' +
      "font-family:'Space Grotesk', system-ui, sans-serif;font-weight:700;" +
      'font-size:2.1rem;line-height:.98;letter-spacing:-.03em;' +
      'text-transform:none;text-indent:0;padding-right:.02em;color:#000}' +
    '.be2 :is(.big,.be2-big){display:block;margin:0;font:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;' +
      'filter:drop-shadow(0 .04em .05em rgba(43,33,41,.24));' +
      'transform-origin:50% var(--pivot);transform:scaleY(var(--tall))}' +
    '.be2 :is(.e,.be2-e){display:inline-block;font-weight:700;transform-origin:50% .836em;transform:scaleY(var(--e))}' +
    '.be2 :is(.big.top,.be2-big.be2-top){clip-path:inset(0 0 calc(100% - (var(--pivot) + (var(--mid) - var(--gap) / 2 - var(--pivot)) / var(--tall))) 0)}' +
    '.be2 :is(.big.bot,.be2-big.be2-bot){position:absolute;left:0;top:0;' +
      'clip-path:inset(calc(var(--pivot) + (var(--mid) + var(--gap) / 2 - var(--pivot)) / var(--tall)) 0 0 0)}' +
    '.be2 .be2-band{background:none;border:0;border-radius:0;padding:0;margin:0;width:auto;box-shadow:none}' +
    '.be2 .be2-big,.be2 .be2-e{background:none;border:0;padding:0;box-shadow:none}' +
    '.be2 :is(.band,.be2-band){position:absolute;left:0;right:0;top:calc(var(--mid) - var(--gap) / 2);height:var(--gap);' +
      'display:flex;align-items:center;justify-content:center}' +
    '.be2 :is(.band,.be2-band) i{font-style:normal;font-weight:700;font-size:.28em;letter-spacing:.28em;text-indent:.28em;' +
      'line-height:1;color:#5E7A70;-webkit-text-stroke:.06em #5E7A70;paint-order:stroke fill;position:relative;top:0}' +

    /* Inline: lives inside someone else's header, so it takes the host's
       ink (a dark bar keeps it visible) and never drops below a size at
       which the FIRST band is still legible. */
    '.be2.be2-inline{display:inline-block;vertical-align:middle;margin:0;' +
      'font-size:max(1.35em,1.25rem);color:inherit}' +
    '.be2.be2-inline :is(.big,.be2-big){color:inherit}' +
    /* Old hosts painted the name with gradient-clipped text. That would
       erase the mark, so the host gives it up. */
    '.be2-host{background:none!important;-webkit-text-fill-color:currentColor!important;' +
      'text-transform:none!important;letter-spacing:normal!important;opacity:1!important}' +
    '.be2-host.be2-on-dark{color:#F4EFE6!important}' +
    '.be2-host:not(.be2-on-dark){color:#000!important}' +
    '.be2-on-dark .be2 :is(.big,.be2-big){filter:none}' +

    'body[data-ground="dark"] .be2{color:var(--ink,#fff)}' +

    /* Centre the mark on the PAGE, not on the space left between a long
       back link and a short right corner ("← Sentence Structure" vs an
       empty spacer pushed it right). Equal outer columns do that. */
    /* Class set by run() only on a header-top laid out as flex, and kept at
       low specificity so a page that hides its header (embedded games)
       still wins. */
    '.header-top.be2-centre{display:grid;' +
      'grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)}' +
    '.header-top.be2-centre>:first-child{justify-self:start}' +
    '.header-top.be2-centre>:last-child{justify-self:end}' +

    /* A compact header (mark beside the page name, a hairline between):
         <div class="brand be2-row"><span data-be2></span>
           <span class="be2-text">…the page's own title lines…</span></div> */
    '.be2-row{flex-direction:row!important;align-items:center!important;gap:.7rem!important}' +
    '.be2-row>[data-be2]{display:flex;align-items:center;padding-right:.7rem;' +
      'border-right:1px solid var(--rule,rgba(20,17,14,.14))}' +
    '.be2-row>[data-be2].be2-on-dark{border-right-color:rgba(244,239,230,.2)}' +
    '.be2-row>[data-be2] .be2{font-size:1.3rem}' +
    '@media(max-width:420px){.be2-row{gap:.5rem!important}.be2-row>[data-be2]{padding-right:.5rem}' +
      '.be2-row>[data-be2] .be2{font-size:1.1rem}}' +
    '.be2-row>.be2-text{display:flex;flex-direction:column;gap:1px}';

  /* The mark is drawn in Space Grotesk. A page that doesn't load it would
     draw the mark in a fallback face, so fetch it here when it's missing. */
  if (!document.querySelector('link[href*="Space+Grotesk"],link[href*="Space Grotesk"]')) {
    var font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=block';
    (document.head || document.documentElement).appendChild(font);
  }

  /* The shared system rules (hit areas, mode row, end card) live in their own
     stylesheet so they can be read and changed without touching this file. */
  if (!document.querySelector('link[href*="/tools/be2-system.css"]')) {
    var sys = document.createElement('link');
    sys.rel = 'stylesheet';
    sys.href = '/tools/be2-system.css?v=20261012';
    (document.head || document.documentElement).appendChild(sys);
  }

  /* Progress: the streak and the review deck every activity reports to. */
  if (!window.Be2 && !document.querySelector('script[src*="/tools/be2-progress.js"]')) {
    var prog = document.createElement('script');
    prog.src = '/tools/be2-progress.js?v=20261012';
    (document.head || document.documentElement).appendChild(prog);
  }

  var style = document.createElement('style');
  style.id = 'be2-brand';
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  function makeMark(inline) {
    var m = document.createElement(inline ? 'span' : 'div');
    m.className = inline ? 'be2 be2-inline' : 'be2';
    m.setAttribute('role', 'img');
    m.setAttribute('aria-label', NEW_NAME);
    m.innerHTML = MARK_HTML;
    return m;
  }

  /* Is the first solid background behind el dark? Decides the inline ink. */
  function onDark(el) {
    for (var n = el.parentElement; n; n = n.parentElement) {
      var c = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
      if (c && (c.length < 4 || +c[3] > 0.5)) {
        return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) < 128;
      }
    }
    return false;
  }

  function swapText(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) {
      if (OLD_NAME.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(OLD_NAME, NEW_NAME);
      OLD_NAME.lastIndex = 0;
    }
  }

  function run() {
    if (OLD_NAME.test(document.title)) document.title = document.title.replace(OLD_NAME, NEW_NAME);
    OLD_NAME.lastIndex = 0;

    /* An explicit placeholder, for headers that never carried the old name:
         <span data-be2></span>   → compact mark
       Put it where the mark should sit; the page's own text stays. */
    var marks = document.querySelectorAll('[data-be2]');
    for (var k = 0; k < marks.length; k++) {
      var h = marks[k];
      if (h.querySelector('.be2')) continue;
      h.classList.add('be2-host');
      if (onDark(h)) h.classList.add('be2-on-dark');
      h.appendChild(makeMark(true));
    }

    var slots = document.querySelectorAll(BRAND_SLOTS);
    for (var i = 0; i < slots.length; i++) {
      var el = slots[i];
      if (el.closest('.be2')) continue;               /* already the mark */
      var t = el.textContent.trim();
      if (t === 'INTUITY' || t === NEW_NAME) {
        if (el.classList.contains('app-title')) {
          var mark = makeMark(false);
          if (el.id) mark.id = el.id;
          el.replaceWith(mark);
        } else {
          el.textContent = '';
          el.classList.add('be2-host');
          if (onDark(el)) el.classList.add('be2-on-dark');
          el.appendChild(makeMark(true));
        }
      } else if (t.indexOf('INTUITY') !== -1) {
        swapText(el);
      }
    }
    var tops = document.querySelectorAll('.header-top');
    for (var j = 0; j < tops.length; j++) {
      var ht = tops[j];
      if (ht.children.length === 3 && ht.querySelector(':scope > .header-title > .be2') &&
          getComputedStyle(ht).display === 'flex') ht.classList.add('be2-centre');
    }

    tagHits();
    document.documentElement.classList.add('be2-ready');
  }

  /* ── Hit areas: every control smaller than 44px on a touch screen gets an
     invisible larger target, drawn on whichever pseudo-element is free. ── */
  var HIT = 'button,a[href],[role=button],[onclick],input[type=checkbox],input[type=radio],select,label[for]';
  function tagHits() {
    if (!window.matchMedia || !matchMedia('(pointer: coarse)').matches) return;
    var els = document.querySelectorAll(HIT);
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.classList.contains('be2-hit') || e.classList.contains('be2-nohit')) continue;
      var r = e.getBoundingClientRect();
      if (!r.width || !r.height || (r.width >= 44 && r.height >= 44)) continue;
      var cs = getComputedStyle(e);
      var before = getComputedStyle(e, '::before').content, after = getComputedStyle(e, '::after').content;
      var freeB = !before || before === 'none' || before === 'normal';
      var freeA = !after || after === 'none' || after === 'normal';
      if (!freeB && !freeA) continue;               /* both in use: leave it alone */
      e.classList.add('be2-hit', freeB ? 'be2-hit-b' : 'be2-hit-a');
      if (cs.position === 'static') e.classList.add('be2-pos');
      e.style.setProperty('--be2-hy', -Math.max(0, Math.ceil((44 - r.height) / 2)) + 'px');
      e.style.setProperty('--be2-hx', -Math.max(0, Math.min(8, Math.ceil((44 - r.width) / 2))) + 'px');
    }
  }
  /* Pages build most of their controls after loading data, so look again
     whenever the page adds content (at most once per animation frame). */
  var pending = false;
  try {
    new MutationObserver(function () {
      if (pending) return; pending = true;
      requestAnimationFrame(function () { pending = false; tagHits(); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  /* Never leave a header invisible if something above throws. */
  setTimeout(function () { document.documentElement.classList.add('be2-ready'); }, 1500);
})();
