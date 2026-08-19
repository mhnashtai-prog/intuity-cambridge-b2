/* INTUITY — one sound engine for every page.
   ------------------------------------------------------------------
   Before this, four games each carried their own oscillator code and
   their own idea of what a correct answer sounds like. A change to one
   silently failed to reach the others. Same rule as the data: if two
   pages need the same thing, they read the same source.

   The canonical cues come from Hunt, whose two-note pop is the one we
   settled on.

       <script src="intuity-sound.js"></script>

   then, at the point a page used to call its own function:

       SFX.correct();

   Nothing else is needed. The context is created on the first gesture
   (browsers refuse to start audio before one) and the mute setting is
   remembered across pages and sessions.
   ------------------------------------------------------------------ */
(function (global) {
  'use strict';

  var KEY = 'intuity-sound';
  var ctx = null;
  var on = true;

  try { on = localStorage.getItem(KEY) !== 'off'; } catch (e) {}

  function ready() {
    if (!on) return null;
    try {
      if (!ctx) ctx = new (global.AudioContext || global.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }

  /* One note. vol is the peak; everything decays exponentially, which is
     what stops a chime sounding like a buzzer. */
  function note(freq, dur, type, vol, delay, slideTo) {
    var c = ready();
    if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var osc = c.createOscillator(), gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol == null ? 0.16 : vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  /* A struck bowl, not a note.
     What makes metal sound like metal is that its partials are NOT whole
     multiples of the fundamental — a bowl rings at roughly 1 : 2.76 : 5.40,
     which is why it shimmers instead of sounding like an organ. The pairs
     are detuned a few cents against each other so they drift in and out of
     phase; that slow beating is the wobble you hear in a real singing bowl.
     Soft attack, long exponential tail, low peak, so sixteen of them in a
     round layer rather than clatter. */
  function bowl(f, dur, vol) {
    var c = ready();
    if (!c) return;
    var t0 = c.currentTime;
    var partials = [
      [1.000, 1.00, 1.00],   // ratio, share of volume, share of length
      [1.004, 0.85, 1.00],   // the beat against the fundamental
      [2.760, 0.34, 0.72],
      [2.771, 0.28, 0.72],
      [5.404, 0.13, 0.44],
      [8.930, 0.06, 0.28]
    ];
    partials.forEach(function (p) {
      var osc = c.createOscillator(), g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f * p[0], t0);
      var peak = vol * p[1], len = dur * p[2];
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + 0.014);   // struck, not blown
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      osc.connect(g); g.connect(c.destination);
      osc.start(t0); osc.stop(t0 + len + 0.05);
    });
  }

  var SFX = {

    /* THE sound: a small bowl, struck once. */
    correct: function () {
      bowl(528, 1.35, 0.16);
    },

    /* The two-note pop this replaced, kept in case a game wants something
       drier — a fast arcade round may not want a 1.3s tail. */
    pop: function () {
      note(523, 0.10, 'triangle', 0.16);
      note(784, 0.16, 'triangle', 0.16, 0.07);
    },

    /* Same bowl, lower and longer, for a finished board. */
    bowlLow: function () {
      bowl(352, 2.10, 0.17);
    },

    /* Low and brief. A wrong answer should be heard, not punished. */
    wrong: function () {
      note(200, 0.22, 'sawtooth', 0.12);
    },

    /* A card, a life, a round lost — heavier than a wrong guess. */
    crash: function () {
      note(140, 0.28, 'square', 0.13);
      note(90,  0.30, 'square', 0.10, 0.05);
    },

    /* A streak, a tier, a finished board. Three bowls a fifth apart, struck
       in sequence — the same instrument as a single correct answer, so a
       milestone sounds like more of the same thing rather than a different
       game. Rare enough to be allowed the length. */
    fanfare: function () {
      bowl(528, 1.5, 0.15);
      setTimeout(function () { bowl(792, 1.5, 0.13); }, 190);
      setTimeout(function () { bowl(1056, 1.8, 0.11); }, 380);
    },

    /* A clock, a speed-up, a card dealt. Deliberately almost nothing. */
    tick: function () {
      note(1200, 0.06, 'sine', 0.09);
    },

    /* Tension: a rising sweep under something about to happen. */
    rise: function () {
      note(300, 0.50, 'sawtooth', 0.09, 0, 900);
    },

    /* ---- mute, shared by every page on the device ---- */
    isOn: function () { return on; },
    set: function (v) {
      on = !!v;
      try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
      if (on) ready();
      return on;
    },
    toggle: function () { return SFX.set(!on); },

    /* Call from any first tap if a page wants audio primed early. */
    unlock: function () { ready(); }
  };

  global.SFX = SFX;
  global.INTUITY_SFX = SFX;   /* alias, so either name works */
})(window);
