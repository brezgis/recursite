// All sound is synthesized with WebAudio: soft UI blips in the Wii's spirit, and an
// original gentle jazz-piano loop (not Nintendo's composition).
let ctx, master, musicBus, musicOn = true, started = false;

export function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = .7; master.connect(ctx.destination);
  musicBus = ctx.createGain(); musicBus.gain.value = .0; musicBus.connect(master);
}

function env(g, t, a, peak, d) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

function blip(freq, dur, vol, type = 'sine', when = 0, dest = master) {
  if (!ctx) return;
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  env(g, t, .004, vol, dur);
  o.connect(g).connect(dest); o.start(t); o.stop(t + dur + .05);
}

export const sfx = {
  // pointer passes over a channel: the tiny glassy "tick"
  hover() { blip(2350, .05, .05, 'sine'); blip(4700, .03, .015, 'sine'); },
  // round buttons have a slightly rounder hover
  hoverBtn() { blip(1560, .07, .05, 'triangle'); },
  select() { blip(880, .09, .12, 'triangle'); blip(1318.5, .14, .1, 'triangle', .055); },
  back() { blip(1046.5, .08, .09, 'triangle'); blip(698.5, .14, .08, 'triangle', .06); },
  page(dir) {
    if (!ctx) return;
    const t = ctx.currentTime, n = ctx.createBufferSource();
    const b = ctx.createBuffer(1, ctx.sampleRate * .3, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    n.buffer = b;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.4;
    f.frequency.setValueAtTime(dir > 0 ? 900 : 2600, t); f.frequency.exponentialRampToValueAtTime(dir > 0 ? 2600 : 900, t + .25);
    const g = ctx.createGain(); env(g, t, .03, .12, .25);
    n.connect(f).connect(g).connect(master); n.start(t);
    blip(dir > 0 ? 1175 : 988, .08, .05, 'sine', .12);
  },
  pick() { blip(660, .06, .1, 'square'); blip(990, .08, .06, 'triangle', .04); },
  drop() { blip(990, .06, .08, 'triangle'); blip(660, .1, .08, 'triangle', .05); },
  pressA() { blip(1318.5, .1, .1, 'sine'); blip(1760, .2, .08, 'sine', .07); },
  start() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => blip(f, .3, .08, 'triangle', i * .06)); },
};

// ---------- background music ----------
// Rhodes-ish voice: sine + soft 2nd partial, with a bell-like attack.
function epiano(freq, t, dur, vol) {
  const g = ctx.createGain(); g.connect(musicBus);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + .012);
  g.gain.exponentialRampToValueAtTime(vol * .35, t + .35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  [[1, 1], [2, .18], [3.98, .05]].forEach(([m, a]) => {
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.frequency.value = freq * m; og.gain.value = a; o.connect(og).connect(g);
    o.start(t); o.stop(t + dur + .05);
  });
}

const N = (s) => 440 * Math.pow(2, (s - 69) / 12);
// 8-bar original progression in F: Fmaj9 Em7 Dm9 Cmaj7 Bbmaj7 Am7 Gm7 C7sus
const CHORDS = [
  [53, 57, 60, 64, 67], [52, 55, 59, 62], [50, 53, 57, 60, 64], [48, 52, 55, 59],
  [46, 50, 53, 57], [45, 48, 52, 55], [43, 46, 50, 53], [48, 53, 55, 58],
];
// sparse melody: [bar, beat, midi, beats]
const MELODY = [
  [0, 0, 76, 1], [0, 1.5, 74, .5], [0, 2, 72, 2],
  [1, .5, 71, .5], [1, 1, 74, 1], [1, 2.5, 79, 1.5],
  [2, 0, 77, 1.5], [2, 2, 76, .5], [2, 2.5, 74, 1.5],
  [3, 1, 72, .5], [3, 1.5, 71, .5], [3, 2, 67, 2],
  [4, 0, 74, 1], [4, 1, 77, .5], [4, 1.5, 81, 2.5],
  [5, .5, 79, .5], [5, 1, 76, 1], [5, 2, 72, 2],
  [6, 0, 74, .5], [6, .5, 77, .5], [6, 1, 79, 1], [6, 2.5, 77, .5], [6, 3, 74, 1],
  [7, 1, 72, 3],
];
const BPM = 96, BEAT = 60 / BPM, BAR = BEAT * 4, LOOP = BAR * 8;
let nextLoop = 0, timer;

function scheduleLoop(t0) {
  CHORDS.forEach((ch, bar) => {
    const t = t0 + bar * BAR;
    epiano(N(ch[0] - 12), t, BAR * .95, .07);                  // bass
    ch.slice(1).forEach((n, i) => epiano(N(n), t + BEAT * 1.5 + i * .015, BEAT * 2.2, .028)); // comp on the "and" of 2
    ch.slice(1).forEach((n, i) => epiano(N(n), t + BEAT * 3 + i * .012, BEAT * 1.1, .018));
  });
  MELODY.forEach(([bar, beat, n, len]) => epiano(N(n), t0 + bar * BAR + beat * BEAT, len * BEAT + .6, .045));
  // a little vibraphone sparkle every other bar
  for (let b = 1; b < 8; b += 2) blip(N(CHORDS[b][3] + 24), .5, .012, 'sine', t0 + b * BAR + BEAT * 3.5 - ctx.currentTime, musicBus);
}

export function startMusic() {
  if (!ctx || started) return;
  started = true;
  nextLoop = ctx.currentTime + .3;
  const tick = () => {
    while (nextLoop < ctx.currentTime + 2) { scheduleLoop(nextLoop); nextLoop += LOOP; }
  };
  tick(); timer = setInterval(tick, 500);
  musicBus.gain.setTargetAtTime(musicOn ? 1 : 0, ctx.currentTime, .8);
}

export function toggleMusic() {
  musicOn = !musicOn;
  if (ctx) musicBus.gain.setTargetAtTime(musicOn ? 1 : 0, ctx.currentTime, .15);
}
// true: duck under a preview; 'off': silence while a channel runs; false: full volume
export function duckMusic(on) {
  if (ctx && musicOn) musicBus.gain.setTargetAtTime(on === 'off' ? 0 : on ? .25 : 1, ctx.currentTime, .2);
}
