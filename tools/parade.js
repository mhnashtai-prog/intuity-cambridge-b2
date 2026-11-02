/* THE PARADE — the strip a student chooses from (see tools/parade.css for
   the blueprint). One call draws it, keeps the centre column, the dots and
   the pill in step, and hands the chosen index back to the page, which then
   opens its own cinema.

     var P = Parade.mount(el, {
       label:  '<b>Part 2</b> · Choose a topic to expand',   (html)
       items:  [{ kicker, title, html, meta, action }],        (html for html/meta)
       start:  0,
       nav:    false                       (only for a page that draws its own arrows)
       onOpen: function (i, col) {},      a tap on the centre column
       onCentre: function (i) {}          the centre changed (optional)
     });
     P.goTo(i, instant)   P.index()   P.focus()

   A tap on a side column brings it to the centre; a tap on the centre
   column opens it. Arrow keys move, Enter opens.

   ONE WAY TO MOVE, EVERYWHERE (2 Nov 2026): ‹ 2 / 7 › above the strip, on
   every page, whatever the number of cards. Dots looked like decoration and
   left a laptop with nothing to swipe; the arrows say "there is more" and
   work on any device. Swiping still works. The old swipe hint is gone.   */
(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;

  function mount(root, o) {
    var items = o.items || [], si = Math.max(0, Math.min(items.length - 1, o.start || 0));
    root.classList.add('pa');
    root.innerHTML =
      (o.label ? '<p class="pa-h">' + o.label + '</p>' : '') +
      (o.nav === false ? '' : '<div class="pa-nav"><button type="button" class="pa-ar" data-d="-1" aria-label="Previous">‹</button>' +
        '<p class="pa-count" aria-live="polite"><b></b> / ' + items.length + '</p>' +
        '<button type="button" class="pa-ar" data-d="1" aria-label="Next">›</button></div>') +
      '<div class="pa-track" tabindex="0" role="listbox" aria-label="' + esc(o.aria || 'Choose one') + '">' +
      items.map(function (it, i) {
        return '<button class="pa-col' + (RM ? '' : ' enter') + '" type="button" role="option" data-i="' + i + '"' +
          ' style="animation-delay:' + (RM ? 0 : i * 70) + 'ms"' +
          ' aria-label="' + esc(it.title) + '. ' + (i + 1) + ' of ' + items.length + '.">' +
          (it.kicker ? '<span class="pa-k">' + esc(it.kicker) + '</span>' : '') +
          '<span class="pa-t">' + esc(it.title) + '</span>' +
          '<span class="pa-b">' + (it.html || '') + '</span>' +
          '<span class="pa-f"><span>' + (it.meta || '') + '</span>' +
          '<span class="pa-go" aria-hidden="true">' + esc(it.action || o.action || 'Expand it') + ' <i>→</i></span></span>' +
          '</button>';
      }).join('') + '</div>';

    var track = root.querySelector('.pa-track'), count = root.querySelector('.pa-nav .pa-count b'), ars = root.querySelectorAll('.pa-ar');
    function cols() { return track.children; }
    function setCentre(i) {
      var was = si; si = i;
      Array.prototype.forEach.call(cols(), function (c, k) { c.classList.toggle('on', k === i); c.tabIndex = k === i ? 0 : -1; c.setAttribute('aria-selected', String(k === i)); });
      if (count) count.textContent = i + 1;
      if (ars.length) { ars[0].disabled = i === 0; ars[1].disabled = i === items.length - 1; }
      if (was !== i && o.onCentre) o.onCentre(i);
    }
    function goTo(i, instant) {
      var c = cols()[i]; if (!c) return;
      track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: instant || RM ? 'auto' : 'smooth' });
      setCentre(i);
    }
    Array.prototype.forEach.call(cols(), function (c) {
      c.addEventListener('click', function () { var i = +c.dataset.i; if (i !== si) goTo(i); else if (o.onOpen) o.onOpen(i, c); });
    });
    Array.prototype.forEach.call(ars, function (a) { a.addEventListener('click', function () { goTo(Math.max(0, Math.min(items.length - 1, si + +a.dataset.d))); }); });
    var raf = null;
    track.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var mid = track.scrollLeft + track.clientWidth / 2, bi = 0, bd = Infinity;
        Array.prototype.forEach.call(cols(), function (c, k) { var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; bi = k; } });
        if (bi !== si) setCentre(bi);
      });
    }, { passive: true });
    /* mounting again on the same element (a filter changed) replaces the
       keys, never stacks them */
    if (root._paKeys) root.removeEventListener('keydown', root._paKeys);
    root._paKeys = function (e) {
      if (e.key === 'ArrowRight' && si < items.length - 1) { e.preventDefault(); goTo(si + 1); }
      else if (e.key === 'ArrowLeft' && si > 0) { e.preventDefault(); goTo(si - 1); }
    };
    root.addEventListener('keydown', root._paKeys);
    setCentre(si);
    requestAnimationFrame(function () { goTo(si, true); });
    return {
      goTo: goTo,
      index: function () { return si; },
      focus: function () { var c = cols()[si]; if (c) c.focus({ preventScroll: true }); },
      el: root
    };
  }
  window.Parade = { mount: mount };
})();
