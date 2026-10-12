/* ═══════════════════════════════════════════════════════════════════════
   Be2FIRST — RECORD YOURSELF, THEN COMPARE  ·  v1
   One line on any Speaking page that has the model-answer card:

       <script src="/tools/be2-recorder.js?v=1" defer></script>

   Adds a bar under the timeline: record your own answer, hear it back, then
   hear the model straight after. Hearing yourself next to the model is the
   step that turns listening into noticing — a student hears the pause they
   didn't fill, the linker they skipped, the answer that stopped at 9 seconds.

   Nothing is uploaded or stored: the recording lives in this tab's memory
   and is gone when the page closes. The microphone is asked for only when
   the student taps Record.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var can = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

  var css =
    '.be2rec{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:10px 0 4px;padding:10px 12px;' +
      'border:1px solid var(--rule,rgba(20,17,14,.12));border-radius:12px;background:var(--card,#FAF8F5)}' +
    '.be2rec .lbl{font:500 11px/1.2 var(--f-mono,"Geist Mono",ui-monospace,monospace);letter-spacing:.1em;text-transform:uppercase;' +
      'color:var(--faint,#8A8378);margin-right:auto}' +
    '.be2rec button{display:inline-flex;align-items:center;gap:7px;min-height:40px;padding:0 14px;border-radius:999px;cursor:pointer;' +
      'font:600 13px/1 var(--f-body,"Geist",system-ui,sans-serif);border:1.5px solid var(--ink,#14110E);background:transparent;color:var(--ink,#14110E)}' +
    '.be2rec button.main{background:var(--ink,#14110E);color:var(--card,#FAF8F5)}' +
    '.be2rec button.rec{background:#B3261E;border-color:#B3261E;color:#fff}' +
    '.be2rec .dot{width:9px;height:9px;border-radius:50%;background:currentColor}' +
    '.be2rec button.rec .dot{animation:be2pulse 1s ease-in-out infinite}' +
    '.be2rec .t{font:500 12px/1 var(--f-mono,"Geist Mono",ui-monospace,monospace);font-variant-numeric:tabular-nums}' +
    '.be2rec .note{flex-basis:100%;font-size:12px;color:var(--quiet,#5C5852)}' +
    '@keyframes be2pulse{50%{opacity:.25}}' +
    /* while recording, the model is covered: the student answers, not reads */
    '.be2rec-on #body,.be2rec-on #dlg{filter:blur(7px);opacity:.45;pointer-events:none;user-select:none;transition:filter .2s,opacity .2s}' +
    '@media(prefers-reduced-motion:reduce){.be2rec button.rec .dot{animation:none}}';

  var rec = null, chunks = [], url = null, started = 0, tick = null, secs = 0, stream = null, audio = null;
  var bar;

  function fmt(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

  function paint(state, note) {
    if (!bar) return;
    var h = '';
    if (state === 'idle') {
      h = '<span class="lbl">Your turn</span>' +
          '<button class="main" type="button" data-a="rec"><span class="dot"></span>Record your answer</button>';
    } else if (state === 'rec') {
      h = '<span class="lbl">Recording · model hidden</span>' +
          '<button class="rec" type="button" data-a="stop"><span class="dot"></span>Stop <span class="t" id="be2t">0:00</span></button>';
    } else if (state === 'done') {
      h = '<span class="lbl">You · ' + fmt(secs) + '</span>' +
          '<button type="button" data-a="mine">▶ Mine</button>' +
          '<button class="main" type="button" data-a="model">▶ Then the model</button>' +
          '<button type="button" data-a="again" aria-label="Record again">↻</button>';
    } else if (state === 'off') {
      h = '<span class="lbl">Your turn</span><span class="note">Recording isn\'t available in this browser. ' +
          'Say your answer out loud, then press play to hear the model.</span>';
    }
    if (note) h += '<span class="note">' + note + '</span>';
    bar.innerHTML = h;
  }

  function start() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
      stream = s; chunks = [];
      try { rec = new MediaRecorder(s); } catch (e) { paint('off'); return; }
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = function () {
        if (url) URL.revokeObjectURL(url);
        url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
        stream.getTracks().forEach(function (t) { t.stop(); });
        paint('done');
      };
      /* the model must not talk over the student */
      try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
      rec.start(); started = Date.now(); secs = 0; paint('rec');
      document.documentElement.classList.add('be2rec-on');
      tick = setInterval(function () {
        secs = (Date.now() - started) / 1000;
        var t = document.getElementById('be2t'); if (t) t.textContent = fmt(secs);
        if (secs > 180) stop();            /* a Speaking turn never runs past three minutes */
      }, 250);
    }).catch(function () {
      paint('idle', 'The microphone was blocked. Allow it in your browser\'s address bar, then try again.');
    });
  }
  function stop() { document.documentElement.classList.remove('be2rec-on'); if (tick) { clearInterval(tick); tick = null; } if (rec && rec.state !== 'inactive') rec.stop(); }

  function playMine(then) {
    if (!url) return;
    if (audio) audio.pause();
    audio = new Audio(url);
    audio.onended = function () { if (then) then(); };
    audio.play().catch(function () {});
  }
  function playModel() {
    var hub = document.getElementById('playHub');
    if (hub && !hub.disabled) hub.click();
  }

  function onClick(e) {
    var b = e.target.closest && e.target.closest('button[data-a]');
    if (!b || !bar.contains(b)) return;
    var a = b.dataset.a;
    if (a === 'rec' || a === 'again') start();
    else if (a === 'stop') stop();
    else if (a === 'mine') playMine();
    else if (a === 'model') playMine(function () { setTimeout(playModel, 400); });
  }

  function mount() {
    var tl = document.getElementById('tl');
    if (!tl || document.querySelector('.be2rec')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    bar = document.createElement('div'); bar.className = 'be2rec';
    tl.parentNode.insertBefore(bar, tl.nextSibling);
    bar.addEventListener('click', onClick);
    paint(can ? 'idle' : 'off');
    /* a new question is a new answer: drop the old recording when the
       question text changes */
    var q = document.getElementById('card');
    if (q && window.MutationObserver) {
      var last = '';
      new MutationObserver(function () {
        var h = q.querySelector('h2, .q, .question');
        var t = h ? h.textContent : '';
        if (t && t !== last) { last = t; if (rec && rec.state === 'recording') stop(); url = null; paint(can ? 'idle' : 'off'); }
      }).observe(q, { childList: true, subtree: true, characterData: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
