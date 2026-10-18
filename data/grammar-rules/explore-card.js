/* THE EXPLORE CARD — the collocation card's hallmark, shared by every
   grammar Explore page. exploreHead(titleHTML, i) returns the top of a set's
   card: a caramel kicker (SET 2 · PASSIVE), a quiet EXPLORE capsule that
   opens the map, and the set's name as an Anton headline. A title written
   "Set 2: Habits & routines" gives its number to the kicker and the rest to
   the headline; otherwise the set's position is the number. The kicker's
   second word is the tab the student is on. Styles: explore-card.css. */
(function () {
  function tab() {
    var t = document.querySelector('#ruleTabs .vtab.active, .set-tabs .vtab.active');
    return t ? t.textContent.trim() : '';
  }
  window.exploreHead = function (titleHTML, i) {
    var s = String(titleHTML == null ? '' : titleHTML);
    var m = s.match(/^\s*Set\s*(\d+)\s*[:.\-–—]\s*([\s\S]*)$/i);
    var num = m ? m[1] : String(i + 1), name = m ? m[2] : s, t = tab();
    return '<div class="poster-kick"><i></i><span>Set ' + num + (t ? ' · ' + t.replace(/[<&>]/g, '') : '') + '</span>' +
      '<button class="explore-btn" type="button" data-sec="' + i + '">Explore ›</button></div>' +
      '<h3 class="poster-head">' + name + '</h3>';
  };
})();
