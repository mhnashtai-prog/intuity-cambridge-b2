/* ═══════════════════════════════════════════════════════════════════════
   Be2FIRST — RECORDED VOICES WHERE THEY EXIST  ·  v1
   One line on any page that speaks through the browser's voice:

       <script src="/tools/be2-voice.js?v=20261012"></script>     (in <head>)

   The Speaking pages read every line with speechSynthesis. This file sits
   in front of it: when a line has a recorded MP3 (from ElevenLabs or a real
   speaker), that file plays instead, and the page never knows the
   difference — the same onend fires, the same playhead moves. A line with no
   recording still uses the browser voice, so the app works at every stage of
   the recording job: zero files, half of them, all of them.

   Which lines have recordings is listed in /audio/speaking/manifest.json,
   written by tools/speaking-lines.py from the files actually present.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var S = window.speechSynthesis;
  if (!S || S.__be2) return;

  var MAP = null, current = null;
  function norm(t) {
    return String(t || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  fetch('/audio/speaking/manifest.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (m) { MAP = (m && m.lines) || {}; })
    .catch(function () { MAP = {}; });

  var speak = S.speak.bind(S), cancel = S.cancel.bind(S);

  S.speak = function (u) {
    var file = MAP && u && MAP[norm(u.text)];
    if (!file) return speak(u);
    var a = new Audio('/audio/speaking/' + file);
    current = a;
    a.playbackRate = 1;
    a.onplay = function () { if (u.onstart) try { u.onstart({}); } catch (e) {} };
    a.onended = function () { if (current === a) current = null; if (u.onend) try { u.onend({}); } catch (e) {} };
    a.onerror = function () { if (current === a) current = null; speak(u); };   /* a missing file falls back to the voice */
    a.play().catch(function () { if (current === a) current = null; speak(u); });
  };
  S.cancel = function () {
    if (current) { try { current.pause(); } catch (e) {} current = null; }
    return cancel();
  };
  try {
    var proto = Object.getPrototypeOf(S), desc = Object.getOwnPropertyDescriptor(proto, 'speaking');
    Object.defineProperty(S, 'speaking', { configurable: true,
      get: function () { return !!current || (desc && desc.get ? desc.get.call(S) : false); } });
  } catch (e) {}
  S.__be2 = true;
})();
