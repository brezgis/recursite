'use strict';
/* RecurCity: the recursite in Roku City mode.
   Layers drift left at their own speeds; every sign worth reading is HTML laid over a blank
   painted panel, so billboards can turn, the marquee can change and the blimp can say things.
   Sprites come from art/manifest.json; a missing sprite draws as a labelled placeholder box. */

const R = 'https://recursite.brezgis.com/';
const ADS = [
  { id: 'corpora', title: 'Corpora Café', tag: 'Every tap pours tokens.', url: 'https://cafe.brezgis.com', font: "'Righteous'", ph: ['#2b7a78', '#f2a65a'] },
  { id: 'nameday', title: 'Nameday Party', tag: 'Sto lat! Every day of the year.', url: 'https://party.brezgis.com', font: "'Limelight'", ph: ['#b0306a', '#ffc46b'] },
  { id: 'petroglyph', title: 'Petroglyph Gallery', tag: 'Humanity’s first works in stone. Open at dusk.', url: 'https://gallery.brezgis.com', font: "'Cinzel Decorative'", ph: ['#7b2d26', '#e0874a'] },
  { id: 'flockquarium', title: 'Flockquarium', tag: 'What the flock?!', url: 'https://flock.brezgis.com', font: "'Monoton'", ph: ['#0f2a6b', '#ffcf7a'] },
  { id: 'fly', title: 'Fly Paradise', tag: 'He deserves a nice home.', url: 'https://fly.brezgis.com', font: "'Righteous'", ph: ['#0c8c9b', '#ff8a5c'] },
  { id: 'noosphere', title: 'Noosphere', tag: 'A whole-grain alternative to your feed.', url: 'https://noosphere.brezgis.com', font: "'Josefin Sans'", ph: ['#2a0d6e', '#d9b25f'] },
  { id: 'lavahash', title: 'Lava-Hash', tag: 'Entropy, served warm.', url: 'https://hash.brezgis.com', font: "'Rubik Mono One'", ph: ['#3d0820', '#ff5a2c'] },
  { id: 'ancient', title: 'Ancient Club', tag: 'Ancient Egypt’s hottest nightclub. It has everything.', url: 'https://club.brezgis.com', font: "'Cinzel Decorative'", ph: ['#0d4f5c', '#e8b931'] },
  { id: 'soundscapade', title: 'Soundscapade', tag: 'Calming nature sounds. Except weird.', url: 'https://sound.brezgis.com', font: "'Bungee'", ph: ['#5b4a9e', '#9fe0c0'] },
  { id: 'snridworld', title: 'snridworld', tag: 'A Markov garden. The snails are learning.', url: 'https://snail.brezgis.com', font: "'VT323'", ph: ['#021a07', '#32ff6a'] },
  { id: 'snowglobe', title: 'Snow-Globe', tag: 'Now broadcasting. 24/7.', url: 'https://tv.brezgis.com', font: "'Monoton'", ph: ['#1b2f66', '#cfe6ff'] },
  { id: 'dinotrain', title: 'Dino-Train-Table', tag: 'All aboard the Cretaceous Express.', url: 'https://brezgis.com/dino-train-table/', font: "'Bungee'", ph: ['#2f5d2a', '#f0c35a'] },
  { id: 'grotte', title: 'Grotte du Calcul', tag: 'Computing, 17,000 years early.', url: R + 'lascaux/', font: "'Limelight'", ph: ['#3b1d0c', '#d98a3a'] },
  { id: 'brezvax', title: 'brezvax', tag: '1984. Every article real.', url: R + 'usenet/', font: "'VT323'", ph: ['#020c04', '#36ff7a'] },
  { id: 'arpanet', title: 'TIP ARPA', tag: 'Dial down to 1977. Log in as guest.', url: R + 'usenet/arpanet/', font: "'VT323'", ph: ['#020611', '#cfe3ff'] },
  { id: 'recursite', title: 'The Recursite', tag: 'A 1990s website, all the way down.', url: R, font: "'Limelight'", ph: ['#2a0d6e', '#ffde96'] },
];
/* The ledger. Projects with a permanent sign of their own (the club, the diner, the aquarium,
   the record shop's round sign) never also rotate onto an ad. Everything that rotates (billboards,
   screens, poster cases, the cinema marquee, vehicle panels, the blimp) asks pickAd() for a project
   that is not on screen or about to scroll on. Easter eggs (terminal, fly, snail, LUCKY) don't count. */
const CLAIMED = new Set(['ancient', 'corpora', 'flockquarium', 'soundscapade']);
const MARQUEE = [
  { top: 'THE RECURSITE', big: 'FREE PAGES & PROGRAMS', url: R, ad: 'recursite', name: 'the recursite' },
  { top: 'NOW SHOWING', big: 'BREZVAX · 1984', url: R + 'usenet/', ad: 'brezvax', name: 'brezvax' },
  { top: 'HELD OVER', big: 'THE WIICURSITE', url: R + 'wiicursite/', name: 'the wiicursite' },
  { top: 'MIDNIGHT SHOW', big: 'GROTTE DU CALCUL', url: R + 'lascaux/', ad: 'grotte', name: 'Grotte du Calcul' },
  { top: 'LATE SHOW', big: 'TIP ARPA · 1977', url: R + 'usenet/arpanet/', ad: 'arpanet', name: 'TIP ARPA (1977)' },
];
const SKYWRITING = [
  { ad: 'snowglobe', text: 'SNOW-GLOBE · ON THE AIR 24/7', url: 'https://tv.brezgis.com' },
  { ad: 'noosphere', text: 'NOOSPHERE · THINK WHOLE-GRAIN', url: 'https://noosphere.brezgis.com' },
  { ad: 'recursite', text: 'VISIT THE RECURSITE', url: R },
];

/* Overlay panels, as fractions of each sprite's box: [left, top, width, height],
   measured from the sprites' pixels by roku-mode/tools/measure.py. */
const OV = {  // measured from the sprites' pixels by roku-mode/tools/measure.py
  theater: { blade: [0.446, 0.101, 0.108, 0.446], band: [0.072, 0.689, 0.853, 0.063], caseL: [0.145, 0.845, 0.098, 0.108], caseR: [0.755, 0.845, 0.1, 0.108] },
  billboard: { bb: [0.026, 0.094, 0.949, 0.546] },
  billboardbldg: { bb: [0.113, 0.033, 0.775, 0.132], egg: 'terminal', win: [0.536, 0.49, 0.128, 0.091] },
  adtower: { screens: [[0.094, 0.235, 0.238, 0.518], [0.402, 0.35, 0.51, 0.115], [0.701, 0.518, 0.199, 0.088], [0.384, 0.65, 0.531, 0.111]] },
  diner: { sign: [0.244, 0.035, 0.513, 0.205] },
  bowling: { lucky: [.183, .297, .14, .12] },
  bus: { panel: [0.25, 0.51, 0.593, 0.163] },
  van: { panel: [.425, .105, .515, .345] },
  blimp: { panel: [0.139, 0.243, 0.647, 0.431] },
  firehouse: { texts: [{ r: [.28, .624, .44, .046], text: 'ENGINE CO. 77', font: "'Josefin Sans'", color: '#5a1a3a', k: .72 }] },
  cityhall: { clock: [.429, .366, .142, .218], texts: [{ r: [.395, .7, .21, .05], text: 'RECURCITY HALL', font: "'Josefin Sans'", color: '#5a1a3a', k: .8 }] },
  recordshop: { texts: [{ r: [0.856, 0.376, 0.132, 0.096], text: '\u266b', font: 'serif', color: '#7a1650', k: .75, url: 'https://sound.brezgis.com', title: 'Soundscapade' }] },
  hotel: { neon: [.11, .012, .73, .085], neonText: 'HOTEL RECURSION', neon2: [0.926, 0.248, 0.057, 0.314] },
  club: { neon: [0.082, 0.534, 0.837, 0.089], neonText: 'ANCIENT CLUB', neonAd: 'ancient' },
};

/* scene: logical stage units, 1080 tall. Buildings advance the cursor; props (p:1) don't. */
const HORIZON = 300, BASE = 968;
/* the skyline: separate clusters, each with its own landmark, over the haze; the hill carries the sign */
const FAR = { speed: 3.2, base: HORIZON + 4, tail: 120, items: [
  { s: 'skyline_a' }, { s: 'hill', gap: 60, sign: 'RECURCITY' }, { s: 'skyline_c', gap: 40 },
  { s: 'skyline_b', gap: 140 }, { s: 'skyline_d', gap: 120 }, { s: 'skyline_a', gap: 150, flip: 1 },
] };
const CLOUDS = { speed: 1.4, items: [{ s: 'clouds', x: 120, y: HORIZON - 120 }, { s: 'clouds', x: 1500, y: HORIZON - 175, flip: 1 }], width: 2900 };
/* the far shore is just a few things on the waterline: the bridge, a little harbour, the aquarium */
const SHORE = { speed: 5.5, base: HORIZON + 9, items: [
  { s: 'shore_a' }, { s: 'bridge', gap: -40 }, { s: 'shore_a', gap: -40, flip: 1 },
  { s: 'shore_b', gap: 900 }, { s: 'aquarium', gap: 30, ad: 'flockquarium', dy: -4 },
], tail: 1100 };
const BAY = { speed: 9, width: 3200, items: [
  { s: 'island', x: 520, y: HORIZON + 58, beam: 1 },
] };
/* boats: [sprite, depth 0 (horizon) .. 1 (near), own speed through the water px/s] */
const BOATS = [['ferry', .07, 5], ['sailboat', .22, -3]];
/* How fast the world at a given height scrolls by: one perspective rule for everything, from the
   horizon (where the far shore moves at SHORE.speed) down to the street. Boats, the island, the
   shore and the street all agree with it, so nothing drifts against the water it sits on. */
function groundSpeed(y) { const f = Math.max(0, (y - HORIZON) / (BASE - HORIZON)); return SHORE.speed + (STREET.speed - SHORE.speed) * f ** 1.6; }
/* fill: a prop that gets its own gap between buildings, centred in it */
const STREET = { speed: 24, items: [
  { s: 'rowhouse_b' },
  { s: 'tree', fill: 170, y: BASE + 6 },
  { s: 'recordshop' },
  { s: 'lamp', fill: 120, y: BASE + 8, egg: 'fly' },
  { s: 'theater' }, { s: 'car_parked', p: 1, ox: -330, y: BASE + 46 },
  { s: 'lamp', fill: 120, y: BASE + 8 },
  { s: 'diner', ad: 'corpora', bush: 1 },
  { s: 'billboardbldg', gap: 40 },
  { s: 'firehouse', gap: 6 },
  { s: 'club', gap: 30, ad: 'ancient' },
  { s: 'bowling', gap: 30, bush: 1 },
  { s: 'warehouse', gap: 30 }, { s: 'billboard', p: 1, ox: -605, y: BASE - 280, behind: 1 },
  { s: 'tree', fill: 170, y: BASE + 6 },
  { s: 'cityhall' },
  { s: 'adtower', gap: 10 },
  { s: 'lamp', fill: 120, y: BASE + 8 },
  { s: 'hotel' },
  { s: 'rowhouse_a', gap: 6 },
], tail: 60 };
/* traffic lanes: one speed and direction each, so nothing ever drives through anything */
const LANES = [
  { dir: -1, y: BASE + 64, v: 58, z: 2, cars: ['bus', 'van'] },   // v: speed along the road
  { dir: 1, y: BASE + 92, v: 66, z: 3, cars: ['taxi', 'sedan', 'pickup'] },
];

let MAN = {};
const $ = (q, r = document) => r.querySelector(q);
const el = (tag, cls, css) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); return e; };
const px = (n) => n + 'px';
const size = (s) => MAN[s] || { w: 240, h: 240, missing: true };
const rand = (a, b) => a + Math.random() * (b - a);
const go = (url) => { if (url) location.href = url; };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function sprite(s, x, bottom, extra, k = 1) {
  const z0 = size(s), z = { ...z0, w: z0.w * k, h: z0.h * k };
  const box = el('div', 'it', { left: px(x), top: px(bottom - z.h), width: px(z.w), height: px(z.h) });
  if (z.missing) {
    Object.assign(box.style, { background: 'repeating-linear-gradient(45deg,#5b2a9a 0 14px,#4a1f86 14px 28px)', outline: '2px dashed #c9a2ff', color: '#e8d8ff', font: '16px monospace', display: 'flex', alignItems: 'center', justifyContent: 'center' });
    box.textContent = s;
  } else {
    const img = el('img'); img.loading = 'eager'; img.src = 'art/' + s + '.' + (z0.fmt || 'webp'); img.alt = ''; img.draggable = false; img.decoding = 'async';
    box.appendChild(img);
  }
  if (extra) Object.assign(box.style, extra);
  return box;
}
function at(box, r) { return { left: px(r[0] * box.w), top: px(r[1] * box.h), width: px(r[2] * box.w), height: px(r[3] * box.h) }; }

/* ---- ads ---- */
function adEl(ad, w, h) {
  // big billboards: art + title + tagline; medium screens: full art + title strip;
  // tall banners: vertical title; tiny cases: a simple mini poster and nothing else
  const tall = h / w > 2.2, tiny = !tall && Math.min(w, h) < 90 && w < 120, wide = !tall && !tiny && w / h > 1.9 && h >= 75 && w >= 240;
  const mid = !tall && !tiny && !wide;
  const art = 'ad_' + ad.id, m = MAN[art];
  const d = el('div', 'ad' + (wide ? ' wide' : tall ? ' tall' : tiny ? ' tiny' : ' mid'), { width: px(w), height: px(h) });
  let tw = w;
  if (m) {
    const i = el('img'); i.src = 'art/' + art + '.webp'; i.alt = ''; i.decoding = 'async';
    if (wide) { const aw = Math.min(w * .64, h * 1.5); tw = w - aw * .86; Object.assign(i.style, { left: 'auto', right: 0, width: px(aw) }); d.style.background = m.edge; }
    else if (m.fx != null) i.style.objectPosition = `${Math.round(m.fx * 100)}% ${Math.round(m.fy * 100)}%`;
    d.appendChild(i);
  } else d.appendChild(el('div', 'ph', { background: `radial-gradient(70% 90% at 72% 40%, ${ad.ph[1]}, ${ad.ph[0]} 75%)` }));
  if (!wide) d.appendChild(el('div', 'shade'));
  const c = el('div', 'copy', wide ? { width: px(tw) } : null);
  const t = el('div', 't', { fontFamily: ad.font + ', sans-serif' }); const ts = el('span'); ts.textContent = ad.title; t.appendChild(ts); c.appendChild(t);
  const g = el('div', 'g'); g.textContent = ad.tag; c.appendChild(g);
  d.appendChild(c);
  const key = `ad|${ad.id}|${Math.round(w)}x${Math.round(h)}`;
  if (tall) fit(ts, h * .8, key, true);
  else if (wide) fit(ts, tw - h * .14, key);
  else if (mid || tiny) fit(ts, w * .86, key);
  return d;
}
/* Slots hold state; every strip copy renders the same slot, so all copies turn together. */
const slots = [];
function slot(kind, w, h) { const s = { kind, w, h, ad: firstFor(kind), nodes: [] }; slots.push(s); return s; }
/* Swap a sign's content without ever showing an empty frame: the new ad goes in underneath,
   and the old one is removed only once the new poster has decoded. */
function decoded(node) { const i = node.querySelector('img'); return i && i.decode ? i.decode().catch(() => {}) : Promise.resolve(); }
function mountBillboard(s, node) {
  const fresh = adEl(ADS[s.ad], s.w, s.h), old = [...node.children];
  node.onclick = () => go(ADS[s.ad].url); node.title = ADS[s.ad].title;
  if (!old.length) { node.appendChild(fresh); return; }
  fresh.style.zIndex = 0; node.insertBefore(fresh, node.firstChild);
  decoded(fresh).then(() => requestAnimationFrame(() => old.forEach((e) => e.remove())));
}
function turnBillboard(s, next) {
  // small posters stay put while anyone can see them; they change quietly off screen
  if (s.kind === 'case') { if (!s.nodes.some(near)) { s.ad = next; s.nodes.forEach((nd) => mountBillboard(s, nd)); } return; }
  const from = ADS[s.ad], to = ADS[next], n = 9, sw = s.w / n;
  s.ad = next;
  for (const node of s.nodes) {
    if (reduced) { mountBillboard(s, node); continue; }
    node.classList.add('turning');
    const held = [...node.children];  // the current poster stays until the slats cover it
    const slats = [];
    for (let i = 0; i < n; i++) {
      const sl = el('div', 'slat', { left: px(i * sw), width: px(sw + 0.6), transitionDelay: (i * 70) + 'ms' });
      const f = el('div', 'face'), b = el('div', 'face back');
      const a1 = adEl(from, s.w, s.h), a2 = adEl(to, s.w, s.h);
      a1.style.left = a2.style.left = px(-i * sw);
      f.appendChild(a1); b.appendChild(a2); sl.append(f, b); node.appendChild(sl); slats.push(sl);
    }
    Promise.all(slats.map((x) => decoded(x))).then(() => {
      held.forEach((e) => e.remove());
      requestAnimationFrame(() => requestAnimationFrame(() => slats.forEach((x) => x.classList.add('turn'))));
      setTimeout(() => {
        if (s.ad !== next) return;
        const fresh = adEl(to, s.w, s.h); fresh.style.zIndex = 0; node.insertBefore(fresh, node.firstChild);
        decoded(fresh).then(() => requestAnimationFrame(() => { slats.forEach((x) => x.remove()); node.classList.remove('turning'); }));
        node.onclick = () => go(to.url); node.title = to.title;
      }, 70 * n + 900);
    });
  }
}
/* Everything showing a project now or within the next stretch of street: slots whose nodes are on
   screen or within ~3/4 of a screen to the right (they scroll in), vehicle panels, the blimp, the marquee. */
const adIndex = (id) => ADS.findIndex((a) => a.id === id);
function near(node) { const r = node.getBoundingClientRect(); return r.right > -innerWidth * .25 && r.left < innerWidth * 1.75; }
function showing(except) {
  const on = new Set();
  for (const o of slots) if (o !== except && (!o.nodes.length || o.nodes.some(near))) on.add(o.ad);
  for (const m of movers) if (m.ad != null) on.add(m.ad);
  if (blimp && blimp.ad != null) on.add(blimp.ad);
  if (MARQUEE[mq] && MARQUEE[mq].ad && marquees.some(near)) on.add(adIndex(MARQUEE[mq].ad));
  return on;
}
/* Pick a project at random among the ones that are free: never claimed by a building, never on
   screen elsewhere, a mini poster for the small cases; and, when possible, not one this sign showed
   lately nor one the city picked lately. Rules relax in that order instead of ever duplicating. */
const recent = [];
function pickAd(k, kind, except) {
  const on = showing(except), hist = (except && except.hist) || [], all = ADS.map((_, i) => i);
  const base = (i) => !CLAIMED.has(ADS[i].id) && !on.has(i);
  let c = all.filter((i) => base(i) && i !== k && !hist.includes(i) && !recent.includes(i));
  if (!c.length) c = all.filter((i) => base(i) && i !== k && !hist.includes(i));
  if (!c.length) c = all.filter((i) => base(i) && i !== k);
  if (!c.length) return k;
  const i = c[(Math.random() * c.length) | 0];
  recent.push(i); if (recent.length > 4) recent.shift();
  return i;
}
function nextAd(s) { s.hist = [...(s.hist || []), s.ad].slice(-5); return pickAd(s.ad, s.kind, s); }
const firstFor = (kind) => pickAd(-1, kind, null);
/* the marquee skips any message whose project is already showing */
const mqHist = [];
function nextMarquee() {
  const on = showing(null), free = (i) => i !== mq && (!MARQUEE[i].ad || !on.has(adIndex(MARQUEE[i].ad)));
  let c = MARQUEE.map((_, i) => i).filter((i) => free(i) && !mqHist.includes(i));
  if (!c.length) c = MARQUEE.map((_, i) => i).filter(free);
  if (!c.length) return mq;
  mqHist.push(mq); if (mqHist.length > 2) mqHist.shift();
  return c[(Math.random() * c.length) | 0];
}

/* Squeeze a line of text horizontally if it is wider than its sign. Measured once per key after
   fonts load, then reused (a turning billboard builds the same ad eighteen times). */
const fitMemo = new Map();
function applyFit(span, k, v) { span.style.display = 'inline-block'; span.style.whiteSpace = 'nowrap'; span.style.transform = k < 1 ? `scale${v ? 'Y' : 'X'}(${k.toFixed(3)})` : ''; }
function fit(span, max, key, v) {
  if (key && fitMemo.has(key)) return applyFit(span, fitMemo.get(key), v);
  if (!span.isConnected) return requestAnimationFrame(() => fit(span, max, key, v));
  document.fonts.ready.then(() => {
    if (key && fitMemo.has(key)) return applyFit(span, fitMemo.get(key), v);
    applyFit(span, 1, v); const len = v ? span.scrollHeight : span.scrollWidth, k = len > max ? max / len : 1;
    if (key) fitMemo.set(key, k);
    applyFit(span, k, v);
  });
}
/* ---- the marquee ---- */
let mq = (Math.random() * 5) | 0; const marquees = [];
function mountBand(node) {
  node.innerHTML = '';
  const m = el('div', 'msg'); const M = MARQUEE[mq];
  m.innerHTML = `<span class="top"></span><span class="big"></span>`;
  m.firstChild.textContent = M.top; m.lastChild.textContent = M.big;
  node.appendChild(m); node.onclick = () => go(MARQUEE[mq].url); node.title = M.name;
  fit(m.lastChild, parseFloat(node.style.width) * .92, 'mq' + mq);
}
function turnBand() {
  mq = nextMarquee();
  for (const node of marquees) {
    const old = node.firstChild; if (old) old.classList.add('out');
    const M = MARQUEE[mq], m = el('div', 'msg in0');
    m.innerHTML = `<span class="top"></span><span class="big"></span>`;
    m.firstChild.textContent = M.top; m.lastChild.textContent = M.big;
    node.appendChild(m); node.title = M.name; fit(m.lastChild, parseFloat(node.style.width) * .92, 'mq' + mq);
    requestAnimationFrame(() => requestAnimationFrame(() => m.classList.remove('in0')));
    setTimeout(() => old && old.remove(), 700);
  }
}

/* ---- layers ---- */
const layers = [];
function buildStrip(fn) {
  // returns { node, width } for one copy of a layer
  const strip = el('div', 'strip'); const w = fn(strip); strip.style.width = px(w); return { node: strip, width: w };
}
function layer(id, speed, fn) {
  const host = $('#' + id); const L = { host, speed, fn, track: null, width: 0, copies: 0 };
  layers.push(L); return L;
}
function render(L, viewW) {
  L.host.innerHTML = '';
  const track = el('div', 'track'); L.host.appendChild(track); L.track = track;
  const first = buildStrip(L.fn); L.width = first.width;
  L.copies = Math.ceil(viewW / L.width) + 1;
  first.node.style.left = '0px'; track.appendChild(first.node);
  // if anything hangs past the strip's right edge, start the copies at -1 so its other half is
  // always drawn at the left of the screen (otherwise it blinks out when the layer wraps)
  const over = [...first.node.querySelectorAll('.it')].some((e) => parseFloat(e.style.left) + parseFloat(e.style.width) > L.width + .5 || parseFloat(e.style.left) < -.5);
  for (let i = over ? -1 : 1; i < L.copies; i++) { if (!i) continue; const c = buildStrip(L.fn); c.node.style.left = px(i * L.width); track.appendChild(c.node); }
}

/* The far haze: a continuous, very simple city silhouette right on the horizon, so the background
   is never empty between the skyline clusters. Painted once; low detail on purpose. */

let hazeURL = null;
function hazeImage(W) {
  if (!hazeURL) {
    const H = 150, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    let seed = 4242; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (const [col, hmin, hmax, wmin, wmax] of [['#6d3a9e', 40, 120, 30, 90], ['#5a2c8a', 18, 70, 24, 70]]) {
      g.fillStyle = col; let x = 0;
      while (x < W) {
        const w = wmin + rnd() * (wmax - wmin), h = hmin + rnd() * (hmax - hmin);
        g.fillRect(x, H - h, w, h);
        if (rnd() < .3) g.fillRect(x + w / 2 - 2, H - h - 14 - rnd() * 18, 4, 30);  // a mast now and then
        x += w - 2;
      }
      g.fillStyle = '#ffd9a8';
      for (let i = 0; i < W / 22; i++) { g.globalAlpha = .35 + rnd() * .4; g.fillRect(rnd() * W, H - rnd() * hmin * .9, 2, 2); }
      g.globalAlpha = 1;
    }
    hazeURL = c.toDataURL();
  }
  return hazeURL;
}
/* The hillside sign: plain white letters standing along the crest, painted into the skyline
   layer's own background (no extra elements riding the layer). */
let hillURL = null;
function hillSign(w, signs) {
  if (!hillURL) {
    const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = 170; const g = c.getContext('2d');
    g.font = "700 27px 'Josefin Sans', sans-serif"; g.textAlign = 'center'; g.textBaseline = 'top';
    for (const { text, x, z } of signs) {
      const n = text.length, top = FAR.base - z.h - (HORIZON - 160);
      [...text].forEach((ch, i) => {
        const u = .33 + .34 * (i / (n - 1)), lift = Math.sin(Math.PI * u) * .74;  // follow the hill's curve
        const cx = x + u * z.w, cy = top + z.h * (1 - lift) - 10;
        g.fillStyle = '#b98fd8'; g.fillText(ch, cx, cy + 1); g.fillStyle = '#f6eefc'; g.fillText(ch, cx, cy);
      });
    }
    hillURL = c.toDataURL();
  }
  return hillURL;
}
function farStrip(strip, refl) {
  let x = 0; const signs = [];
  for (const it of FAR.items) {
    x += it.gap || 0; const z = size(it.s);
    strip.appendChild(sprite(it.s, x, FAR.base, it.flip ? { transform: 'scaleX(-1)' } : null));
    if (it.sign && !z.missing) signs.push({ text: it.sign, x, z });
    x += z.w;
  }
  const w = x + (FAR.tail || 40);
  // the haze and the near-horizon glints ride in this same layer (one layer instead of three)
  const bg = [[`url(${hazeImage(w)})`, `0 ${HORIZON - 148}px`]];
  if (signs.length) bg.unshift([`url(${hillSign(w, signs)})`, `0 ${HORIZON - 160}px`]);
  if (!refl) { const gl = glints('far', w, HORIZON + 6, 140, Math.round(w / 9), [4, 16]); bg.push([gl.backgroundImage, gl.backgroundPosition]); }
  Object.assign(strip.style, { backgroundImage: bg.map((b) => b[0]).join(','), backgroundPosition: bg.map((b) => b[1]).join(','), backgroundRepeat: 'no-repeat' });
  return w;
}
/* Water glints, painted once and carried by a depth layer so they flow with the parallax.
   Near the horizon they are short and dense; lower down, sparse and a little longer. */
const glintCache = {};
function glints(id, w, top, h, n, len) {
  if (!glintCache[id]) {
    const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = h; const g = c.getContext('2d');
    let seed = id.length * 7919; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const d = rnd() ** 1.8, y = d * h, l = len[0] + (len[1] - len[0]) * d * rnd();
      g.globalAlpha = .1 + .22 * (1 - d) * rnd() + .06; g.strokeStyle = rnd() < .3 ? '#ffe2b0' : '#ffd0ec'; g.lineWidth = 1 + d * 1.2;
      const x = rnd() * (w - l); g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y); g.stroke();
    }
    glintCache[id] = c.toDataURL();
  }
  return { backgroundImage: `url(${glintCache[id]})`, backgroundRepeat: 'no-repeat', backgroundPosition: `0 ${top}px` };
}
function cloudStrip(strip) {
  for (const it of CLOUDS.items) strip.appendChild(sprite(it.s, it.x, it.y, it.flip ? { transform: 'scaleX(-1)' } : null));
  return CLOUDS.width;
}
function shoreStrip(strip) {
  let x = 0;
  for (const it of SHORE.items) {
    x += it.gap || 0; const z = size(it.s), y = SHORE.base + (it.dy || 0);
    strip.appendChild(mirror(it.s, x, y, 1, it.flip));
    strip.appendChild(sprite(it.s, x, y, it.flip ? { transform: 'scaleX(-1)' } : null));
    if (it.ad) {
      const ad = ADS.find((a) => a.id === it.ad), h = el('a', 'hot', { left: px(x), top: px(y - z.h), width: px(z.w), height: px(z.h) });
      h.href = ad.url; h.title = ad.title; h.setAttribute('aria-label', ad.title); strip.appendChild(h);
    }
    x += z.w;
  }
  return x + (SHORE.tail || 0);
}
function bayStrip(strip) {
  Object.assign(strip.style, glints('bay', BAY.width, HORIZON + 120, 320, 60, [14, 40]));
  for (const it of BAY.items) {
    const z = size(it.s), box = sprite(it.s, it.x, it.y);
    if (it.beam && !z.missing) strip.appendChild(el('div', 'beam', { left: px(it.x + z.w * .62 - 45), top: px(it.y - z.h * .93 - 520) }));
    strip.appendChild(mirror(it.s, it.x, it.y)); strip.appendChild(box);
  }
  return BAY.width;
}
/* a reflection: the same sprite flipped below its waterline, faint */
function mirror(s, x, bottom, k = 1, flip) {
  const z = size(s), m = sprite(s, x, bottom + z.h * k, null, k);
  m.classList.add('mirror'); m.style.transform = flip ? 'scale(-1,-1)' : 'scaleY(-1)';
  return m;
}
function streetStrip(strip) {
  let x = 0, last = null;
  const props = el('div', null, { position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' });
  const back = el('div', null, { position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' });
  const bldg = el('div', null, { position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' });
  strip.append(back, bldg, props);
  for (const it of STREET.items) {
    const z = size(it.s);
    if (it.fill) {
      const f = size('foliage'), k = .55;  // a low bush behind every gap, so the bay never shows at street level
      if (!f.missing) back.appendChild(sprite('foliage', x + (it.fill - f.w * k) / 2, BASE, null, k));
      const box = sprite(it.s, x + (it.fill - z.w) / 2, it.y); props.appendChild(box); decorate(it, box, z);
      x += it.fill; continue;
    }
    if (it.p) {
      const px0 = (it.ox < 0 && last ? last.x + last.w : x) + (it.ox || 0);
      const box = sprite(it.s, px0, it.y);
      (it.behind ? back : props).appendChild(box);
      decorate(it, box, z);
      continue;
    }
    x += it.gap || 0;
    if (it.bush) { const f = size('foliage'); if (!f.missing) back.appendChild(sprite('foliage', x + (z.w - f.w * 1.1) / 2, BASE, null, 1.1)); }
    const box = sprite(it.s, x, BASE); bldg.appendChild(box);
    decorate(it, box, z);
    last = { x, w: z.w }; x += z.w;
  }
  return x + (STREET.tail || 0);
}
/* Put HTML signs over the painted blanks. */
const builtSlots = {};
function slotFor(key, mk) { return builtSlots[key] || (builtSlots[key] = mk()); }
function decorate(it, box, z) {
  if (z.missing) return;
  const o = OV[it.s] || {}, B = { w: z.w, h: z.h };
  const place = (r, cls, tag = cls === 'blade' ? 'div' : 'a') => { const n = el(tag, (tag === 'a' ? 'hot ' : '') + cls, { position: 'absolute', ...at(B, r) }); box.appendChild(n); return n; };
  const BLEED = 2;  // posters tuck a little under their frames so no painted blank peeks out
  const poster = (r) => { const n = place(r, ''); n.className = 'hot ' + (r === o.caseL || r === o.caseR ? 'case' : 'bb');
    n.style.left = px(r[0] * z.w - BLEED); n.style.top = px(r[1] * z.h - BLEED); n.style.width = px(r[2] * z.w + 2 * BLEED); n.style.height = px(r[3] * z.h + 2 * BLEED); return n; };
  for (const sg of o.texts || []) {
    const n = place(sg.r, 'panel sign', sg.url ? 'a' : 'div');
    if (sg.url) { n.href = sg.url; n.title = sg.title || sg.text; }
    const sp = el('span'); sp.textContent = sg.text; n.appendChild(sp);
    Object.assign(n.style, { fontFamily: sg.font, fontSize: px(sg.r[3] * z.h * (sg.k || .6)), color: sg.color, textShadow: '0 0 1px #fff8', lineHeight: 1 });
    fit(sp, sg.r[2] * z.w * .9, 'sg|' + it.s + sg.text);
  }
  if (o.clock) { const c = place(o.clock, 'clock', 'div'); c.innerHTML = '<i class="hh"></i><i class="mh"></i><b></b>'; clocks.push(c); tickClock(); }
  if (o.egg === 'terminal') { const t = place(o.win, 'egg-term'); t.href = R + 'usenet/'; t.title = 'brezvax'; t.innerHTML = '<span>$</span><i></i>'; }
  if (o.neon) {
    const n = place(o.neon, 'neon', 'a'); const ad = ADS.find((a) => a.id === o.neonAd);
    if (ad) { n.href = ad.url; n.title = ad.title; } else { n.removeAttribute('href'); n.classList.remove('hot'); n.style.pointerEvents = 'none'; }
    n.innerHTML = '<span class="nw">' + [...o.neonText].map((ch, i) => `<span style="animation-delay:${(i * .16).toFixed(2)}s">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('') + '</span>';
    n.style.fontSize = px(o.neon[3] * z.h * .74);
    fit(n.firstChild, o.neon[2] * z.w * .86, 'neon|' + it.s);
  }
  if (o.lucky) {
    const n = place(o.lucky, 'neon lucky'); n.href = '#'; n.title = 'feeling lucky? a random project';
    n.innerHTML = '<span class="nw"><span>L</span><span>U</span><span>C</span><span>K</span><span>Y</span></span>';
    n.style.fontSize = px(o.lucky[3] * z.h * .62);
    n.onclick = (e) => { e.preventDefault(); go(ADS[(Math.random() * ADS.length) | 0].url); };
    fit(n.firstChild, o.lucky[2] * z.w * .96, 'lucky');
  }
  if (o.neon2) {
    const n = place(o.neon2, 'neon vert', 'div');
    n.innerHTML = [...'HOTEL'].map((ch, i) => `<span style="animation-delay:${(2.6 + i * .16).toFixed(2)}s">${ch}</span>`).join('');
    // each letter must fit the blade's width; five letters must fit its height
    n.style.fontSize = px(Math.min(o.neon2[2] * z.w * .78, o.neon2[3] * z.h / 6.2));
  }
  if (it.s === 'theater') {
    const b = place(o.blade, 'blade');
    const fs = Math.min(o.blade[2] * z.w * .8, o.blade[3] * z.h / 10);
    b.style.fontSize = px(fs);
    b.innerHTML = 'RECURCITY'.split('').map((c) => `<span>${c}</span>`).join('');
    const band = place(o.band, 'band'); band.tabIndex = 0; marquees.push(band); mountBand(band);
    band.style.setProperty('--bh', px(o.band[3] * z.h));
    for (const k of ['caseL', 'caseR']) {
      const r = o[k], w = r[2] * z.w + 4, h = r[3] * z.h + 4;
      const s = slotFor('case' + k, () => slot('case', w, h));
      const n = poster(r); s.nodes.push(n); mountBillboard(s, n);
    }
  }
  (o.screens || []).forEach((r, i) => {
    const w = r[2] * z.w + 4, h = r[3] * z.h + 4;
    const s = slotFor('scr' + it.s + i, () => slot(i === 2 ? 'case' : 'bb', w, h));
    const n = poster(r); s.nodes.push(n); mountBillboard(s, n);
  });
  if (o.bb) {
    const r = o.bb, w = r[2] * z.w + 4, h = r[3] * z.h + 4;
    const s = slotFor('bb' + it.s, () => slot('bb', w, h));
    const n = poster(r); s.nodes.push(n); mountBillboard(s, n);
  }
  if (it.egg === 'fly') { const f = el('a', 'hot egg-fly', { left: px(z.w * .5 - 40), top: px(-6), width: '80px', height: '80px' }); f.href = 'https://fly.brezgis.com'; f.title = 'Fly Paradise'; f.innerHTML = '<i></i>'; box.appendChild(f); box.style.pointerEvents = 'none'; }
  if (it.ad && o.sign) {
    const ad = ADS.find((a) => a.id === it.ad), n = place(o.sign, 'panel');
    n.href = ad.url; n.title = ad.title;
    n.innerHTML = '<span></span>'; n.firstChild.textContent = ad.title.toUpperCase();
    Object.assign(n.style, { fontFamily: ad.font, fontSize: px(o.sign[3] * z.h * .46), color: '#7a1650', textShadow: '0 0 1px #fff, 0 0 10px #ffb3d9', textDecoration: 'none' });
    n.style.lineHeight = 1; fit(n.firstChild, o.sign[2] * z.w * .9, 'sign|' + it.s);
  }
}

/* ---- city hall keeps real (local) time ---- */
const clocks = [];
function tickClock() {
  const d = new Date(), m = d.getMinutes() + d.getSeconds() / 60, h = (d.getHours() % 12) + m / 60;
  for (const c of clocks) { c.children[0].style.transform = `rotate(${h * 30}deg)`; c.children[1].style.transform = `rotate(${m * 6}deg)`; }
}
setInterval(tickClock, 15000);

/* ---- traffic and the blimp ---- */
const movers = [];
function spawnCar(lane) {
  const L = LANES[lane];
  const last = movers.filter((m) => m.lane === lane).pop();
  const s = L.cars[(Math.random() * L.cars.length) | 0], z = size(s);
  if (last || !ready.has(s)) return;  // one vehicle per lane at a time, and only once its art has decoded
  const box = sprite(s, 0, L.y, { zIndex: L.z });
  const pr = OV[s] && OV[s].panel; let adIdx = null;
  if (pr && !z.missing) {
    adIdx = pickAd((Math.random() * ADS.length) | 0, 'panel', null);
    if (showing(null).has(adIdx)) adIdx = null;
  }
  if (adIdx != null) {
    const ad = ADS[adIdx], p = el('a', 'hot panel', at(z, pr));
    p.href = ad.url; p.title = ad.title; const sp = el('span'); sp.textContent = ad.title.toUpperCase(); p.appendChild(sp);
    Object.assign(p.style, { fontFamily: ad.font, fontSize: px(pr[3] * z.h * .72), color: s === 'van' ? '#8a1f5a' : '#0d5a5e', textDecoration: 'none', lineHeight: 1 });
    if (s === 'van') p.style.fontSize = px(pr[3] * z.h * .36);
    box.appendChild(p); fit(sp, pr[2] * z.w * .86, 'car|' + s + ad.id);
  }
  $('#traffic').appendChild(box);
  const sv = L.dir * L.v - STREET.speed;  // the road itself scrolls left with the street
  movers.push({ box, lane, ad: adIdx, x: sv > 0 ? -z.w - 20 : viewW + 20, v: sv, w: z.w });
}
/* boats drift across the bay at their own depths; nearer is bigger and lower */
const boats = [];
/* decode every moving sprite up front, so nothing pops in half-way across the screen */
const ready = new Set();
function preload(names) {
  return Promise.all(names.map((n) => {
    const z = MAN[n]; if (!z) return null;
    const i = new Image(); i.src = 'art/' + n + '.' + (z.fmt || 'webp');
    return i.decode().then(() => ready.add(n), () => ready.add(n));
  }));
}
function spawnBoat(i, anywhere) {
  const [s, depth, v] = BOATS[i], z = size(s), k = .55 + depth * .9;
  const y = HORIZON + 26 + depth * 230;
  const box = sprite(s, 0, y, { zIndex: Math.round(depth * 10) }, k);
  $('#boats').appendChild(box);
  $('#boats').appendChild(Object.assign(mirror(s, 0, y, k), {}));
  const mb = $('#boats').lastChild;
  const sv = v - groundSpeed(y);  // own motion on top of the water's scroll
  const w = z.w * k, x = anywhere ? rand(0, viewW) : (sv > 0 ? -w - 30 : viewW + 30);
  boats[i] = { box, mb, x, v: sv, w };
}
let blimp = null, sw = (Math.random() * 3) | 0;
function spawnBlimp() {
  const z = size('blimp'); const box = sprite('blimp', 0, 150, { zIndex: 1 });
  if (!z.missing && OV.blimp) {
    const on = showing(null); let S = null;
    for (let n = 0; n < SKYWRITING.length; n++) { const c = SKYWRITING[sw++ % SKYWRITING.length]; if (!on.has(adIndex(c.ad))) { S = c; break; } }
    if (!S) return;  // every message is already on screen somewhere: no blimp this time
    var blimpAd = adIndex(S.ad);
    const p = el('a', 'hot panel', at(z, OV.blimp.panel));
    p.href = S.url; p.title = ADS[blimpAd].title; p.innerHTML = '<span></span>'; p.firstChild.textContent = S.text;
    Object.assign(p.style, { fontSize: px(OV.blimp.panel[3] * z.h * .34), textDecoration: 'none', lineHeight: 1 });
    box.appendChild(p); fit(p.firstChild, OV.blimp.panel[2] * z.w * .86, 'blimp|' + S.text);
  }
  $('#aloft').appendChild(box);
  blimp = { box, ad: typeof blimpAd === 'number' ? blimpAd : null, x: viewW + 40, v: -14, w: z.w };
}

/* a snail crosses the sidewalk now and then, a little faster than the street goes by */
let snail = null;
function spawnSnail() {
  const a = el('a', 'hot egg-snail', { zIndex: 1 }); a.href = 'https://snail.brezgis.com'; a.title = 'snridworld';
  a.innerHTML = '<svg viewBox="0 0 40 24" width="40" height="24"><path d="M3 22 Q2 17 9 17 L30 17 Q36 17 37 22 Z" fill="#f2b6c9"/><path d="M33 17 L35 9 M36 17 L39 10" stroke="#f2b6c9" stroke-width="1.6" stroke-linecap="round"/><circle cx="18" cy="12" r="9" fill="#a3268a"/><path d="M18 12 m0 -5 a5 5 0 1 1 -4.6 3 a3 3 0 1 1 3.2 3.6" fill="none" stroke="#ff8fc8" stroke-width="1.8" stroke-linecap="round"/></svg>';
  $('#traffic').appendChild(a);
  snail = { box: a, x: viewW + 20, v: -(STREET.speed - 2.2) };
}
function shootingStar() {
  if (reduced) return;
  const s = el('i', 'shoot', { left: rand(10, 70) + '%', top: rand(2, 16) + '%' }); $('#sky').appendChild(s);
  setTimeout(() => s.remove(), 1600);
}

/* ---- stars: drawn once per resize; a handful twinkle with compositor-only CSS ---- */
function drawStars() {
  const c = $('#stars'), r = c.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
  c.width = Math.round(r.width * d); c.height = Math.round(r.height * d);
  const g = c.getContext('2d'); g.fillStyle = '#fff1ff';
  const n = Math.round(r.width / 8);
  for (let i = 0; i < n; i++) {
    g.globalAlpha = rand(.25, .85); g.beginPath();
    g.arc(Math.random() * c.width, Math.random() ** 1.6 * .78 * c.height, rand(.4, 1.3) * d, 0, 6.3); g.fill();
  }
  const sky = $('#sky'); sky.querySelectorAll('.tw').forEach((e) => e.remove());
  for (let i = 0; i < 9; i++) sky.appendChild(el('i', 'tw', { left: rand(1, 99) + '%', top: (Math.random() ** 1.5 * 70) + '%', animationDelay: -rand(0, 6) + 's', animationDuration: rand(2, 4.5) + 's', transform: `scale(${rand(.5, 1)})` }));
}

/* ---- sizing and the loop ---- */
let viewW = 1920, scale = 1;
function layout() {
  scale = innerHeight / 1080;
  if (innerWidth / innerHeight < .8) scale = Math.min(scale, innerWidth / 760);  // tall phones: zoom out a little
  viewW = Math.ceil(innerWidth / scale);
  const st = $('#stage'); st.style.width = px(viewW); st.style.transform = `scale(${scale})`;
  st.style.top = px(Math.max(0, (innerHeight - 1080 * scale) / 2));
  for (const s of slots) s.nodes = [];
  marquees.length = 0; clocks.length = 0;
  for (const L of layers) render(L, viewW);
  drawStars();
}

const Q = new URLSearchParams(location.search);
let t0 = performance.now() - (+Q.get('t') || 0) * 1000, nextCar = 3, nextBlimp = 8, nextSnail = 20, nextShoot = 12, last = 0;
function frame(now) {
  const t = (now - t0) / 1000, dt = Math.min(.1, t - last); last = t;
  const k = reduced ? .35 : 1;
  for (const L of layers) L.track.style.transform = `translate3d(${-((t * L.speed * k) % L.width)}px,0,0)`;
  for (let i = movers.length - 1; i >= 0; i--) {
    const m = movers[i]; m.x += m.v * k * dt; m.box.style.transform = `translate3d(${m.x}px,0,0)`;
    if (m.x > viewW + 60 || m.x < -m.w - 60) { m.box.remove(); movers.splice(i, 1); }
  }
  for (let i = 0; i < boats.length; i++) {
    const b = boats[i]; if (!b) continue; b.x += b.v * k * dt; b.box.style.transform = `translate3d(${b.x}px,0,0)`; b.mb.style.transform = `translate3d(${b.x}px,0,0) scaleY(-1)`;
    if (b.x > viewW + 60 || b.x < -b.w - 60) { b.box.remove(); b.mb.remove(); boats[i] = null; setTimeout(() => spawnBoat(i), rand(4000, 20000)); }
  }
  if (t > nextCar) { if (movers.length < 2) spawnCar(Math.random() < .4 ? 0 : 1); nextCar = t + rand(12, 26); }
  if (snail) { snail.x += snail.v * k * dt; snail.box.style.transform = `translate3d(${snail.x}px,0,0)`; if (snail.x < -60) { snail.box.remove(); snail = null; nextSnail = t + rand(60, 150); } }
  else if (t > nextSnail) spawnSnail();
  if (t > nextShoot) { shootingStar(); nextShoot = t + rand(60, 150); }
  if (blimp) { blimp.x += blimp.v * k * dt; blimp.box.style.transform = `translate3d(${blimp.x}px,0,0)`; if (blimp.x < -blimp.w - 40) { blimp.box.remove(); blimp = null; nextBlimp = t + rand(70, 140); } }
  else if (t > nextBlimp) spawnBlimp();
  requestAnimationFrame(frame);
}

/* The Roku remote's ✱ button opened the billboard you were looking at; here * (or ↑) opens the
   visible billboard nearest the middle of the screen. A quiet nod; nothing on screen mentions it. */
function featured() {
  let best = null, bd = 1e9;
  for (const s of slots) for (const n of s.nodes) {
    const r = n.getBoundingClientRect(); if (r.right < 0 || r.left > innerWidth) continue;
    const d = Math.abs((r.left + r.right) / 2 - innerWidth / 2) + (s.kind === 'case' ? innerWidth : 0); if (d < bd) { bd = d; best = s; }
  }
  return best;
}

/* "Visit …?" follows the cursor over anything that goes somewhere. Titles move into data-tip
   so the browser's own tooltip doesn't double up. */
function tipText(a) {
  if (a.classList.contains('lucky')) return 'Feeling lucky?';
  if (a.id === 'plate') return 'Back to the recursite?';
  return `Visit ${a.dataset.tip}?`;
}
function hoverTips() {
  const tip = $('#tip'); let cur = null;
  addEventListener('pointerover', (e) => {
    const a = e.target.closest && e.target.closest('a[title], a[data-tip], .bb[title], .bb[data-tip], .case[title], .case[data-tip], .band[title], .band[data-tip]');
    if (a && a.title) { a.dataset.tip = a.title; a.removeAttribute('title'); }
    cur = a && a.dataset.tip ? a : null;
    if (cur) { tip.textContent = tipText(cur); tip.classList.add('on'); } else tip.classList.remove('on');
  });
  addEventListener('pointermove', (e) => {
    if (!cur) return;
    const flip = e.clientX > innerWidth - 220;
    tip.style.transform = `translate(${e.clientX + (flip ? -14 : 16)}px, ${e.clientY + 18}px)` + (flip ? ' translateX(-100%)' : '');
  });
  addEventListener('pointerleave', () => tip.classList.remove('on'));
}
let idleT;
function wake() { document.body.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(() => document.body.classList.add('idle'), 3500); }

async function start() {
  try { MAN = await (await fetch('art/manifest.json', { cache: 'no-cache' })).json(); } catch { MAN = {}; }
  await Promise.race([document.fonts.load("700 27px 'Josefin Sans'"), new Promise((r) => setTimeout(r, 1500))]);
  layer('clouds', CLOUDS.speed, cloudStrip);
  layer('far', FAR.speed, (st) => farStrip(st, false));
  layer('far-refl', FAR.speed, (st) => farStrip(st, true));
  layer('shore', SHORE.speed, shoreStrip);
  layer('bay', BAY.speed, bayStrip);
  layer('street', STREET.speed, streetStrip);
  layout();
  preload(Object.keys(MAN).filter((k) => /^(ad|mini)_/.test(k)));  // posters decoded before their first turn
  preload(['taxi', 'sedan', 'pickup', 'bus', 'van', 'blimp', 'ferry', 'sailboat', 'foliage', 'clouds']).then(() => BOATS.forEach((_, i) => spawnBoat(i, true)));
  addEventListener('resize', () => { clearTimeout(start.r); start.r = setTimeout(layout, 150); });
  // billboards take turns: one turns every few seconds
  let bi = 0;
  setInterval(() => { const s = slots[bi++ % slots.length]; if (s) turnBillboard(s, nextAd(s)); }, 6500);
  setInterval(turnBand, 8000);
  addEventListener('keydown', (e) => {
    wake();
    if (e.key === '*' || e.key === 'ArrowUp' || e.key === 'Enter') { const s = featured(); if (s && document.activeElement === document.body) go(ADS[s.ad].url); }
    if (e.key === 'Escape') go('../');
  });
  addEventListener('pointermove', wake); wake(); hoverTips();
  requestAnimationFrame(frame);
}
start();
