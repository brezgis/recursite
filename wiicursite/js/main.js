import { CHANNELS, DEFAULT_LAYOUT } from './banners.js';
import { initAudio, startMusic, toggleMusic, duckMusic, sfx } from './audio.js';
import { boardActions, renderBoard, openBoard, refreshMailLight, logStart, logEnd } from './board.js';

const $ = (s) => document.querySelector(s);
const stage = $('#stage'), track = $('#track'), cursor = $('#cursor');

// ---------- geometry (1920x1080, measured from the real menu) ----------
const COL0 = 158, PITCH_X = 404.5, ROW0 = 94, PITCH_Y = 227;
const PAGE_W = PITCH_X * 4, PAGES = 4;
const slotXY = (i) => {
  const p = Math.floor(i / 12), r = Math.floor((i % 12) / 4), c = i % 4;
  return { x: COL0 + (p * 4 + c) * PITCH_X, y: ROW0 + r * PITCH_Y, page: p };
};

// ---------- stage scaling + pointer ----------
let scale = 1, offX = 0, offY = 0;
// Size from the visual viewport: on phones the 1920px stage can widen the layout viewport (innerWidth),
// which would scale everything for a screen that is not there.
function fit() {
  const vw = window.visualViewport ? visualViewport.width : document.documentElement.clientWidth;
  const vh = window.visualViewport ? visualViewport.height : document.documentElement.clientHeight;
  scale = Math.min(vw / 1920, vh / 1080);
  offX = (vw - 1920 * scale) / 2; offY = (vh - 1080 * scale) / 2;
  stage.style.transform = `translate(${offX}px, ${offY}px) scale(${scale})`;
}
addEventListener('resize', fit); window.visualViewport?.addEventListener('resize', fit); fit();
const toStage = (e) => ({ x: (e.clientX - offX) / scale, y: (e.clientY - offY) / scale });

const HAND = `<svg viewBox="0 0 96 128"><defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#fff"/><stop offset=".56" stop-color="#fff"/><stop offset=".64" stop-color="#d9f0ff"/><stop offset="1" stop-color="#a9dcff"/></linearGradient>
  <filter id="hs" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="4" dy="6" stdDeviation="2.5" flood-opacity=".32"/></filter></defs>
  <g filter="url(#hs)"><path d="M24,14 C24,4 44,4 44,14 L44,52 C44,44 58,44 58,53 L58,58 C58,50 72,50 72,59 L72,64 C72,56 86,56 86,66 L86,94 C86,110 77,121 62,121 L42,121 C31,121 25,115 19,107 L5,87 C0,80 5,70 13,73 L24,83 Z"
  fill="url(#hg)" stroke="#0b0b0b" stroke-width="5.5" stroke-linejoin="round"/>
  <path d="M58,58 V68 M72,64 V72" stroke="#0b0b0b" stroke-width="3.5" stroke-linecap="round"/>
  <text x="57" y="111" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="36" fill="#1786f0">1</text></g></svg>`;
const FIST = `<svg viewBox="0 0 96 128"><defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff"/><stop offset=".66" stop-color="#d9f0ff"/><stop offset="1" stop-color="#a9dcff"/></linearGradient>
  <filter id="fs" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="4" dy="6" stdDeviation="2.5" flood-opacity=".32"/></filter></defs>
  <g filter="url(#fs)"><path d="M14,46 C14,34 28,32 31,42 C32,30 47,29 49,40 C51,30 65,30 67,41 C69,33 84,35 84,48 L84,90 C84,108 72,118 55,118 L41,118 C25,118 14,106 14,90 Z"
  fill="url(#fg)" stroke="#0b0b0b" stroke-width="5.5" stroke-linejoin="round"/>
  <path d="M31,42 V56 M49,40 V55 M67,41 V56" stroke="#0b0b0b" stroke-width="3.5" stroke-linecap="round"/>
  <text x="50" y="104" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="36" fill="#1786f0">1</text></g></svg>`;
cursor.innerHTML = HAND;

let px = 960, py = 540, tilt = 0, lastX = 960;
function setCursorShape(fist) {
  cursor.innerHTML = fist ? FIST : HAND;
  cursor.style.transformOrigin = fist ? '48px 64px' : '34px 6px';
  cursor.style.marginLeft = fist ? '-48px' : '-34px';
  cursor.style.marginTop = fist ? '-64px' : '-6px';
}
// The pointer rolls a little with sideways motion, like a twisting Wii Remote.
// Only writes the transform when the pointer moved or is still settling.
let lastT = '';
(function loop() {
  const vx = px - lastX; lastX = px;
  tilt += (Math.max(-14, Math.min(14, vx * .35)) - tilt) * .12;
  if (Math.abs(tilt) < .05) tilt = 0;
  const t = `translate(${px}px, ${py}px) rotate(${tilt.toFixed(1)}deg)`;
  if (t !== lastT) { cursor.style.transform = t; lastT = t; }
  requestAnimationFrame(loop);
})();

// ---------- empty-slot static texture ----------
(function makeNoise() {
  const c = document.createElement('canvas'); c.width = 192; c.height = 192;
  const g = c.getContext('2d'), img = g.createImageData(192, 192);
  for (let y = 0; y < 192; y++) for (let x = 0; x < 192; x++) {
    const i = (y * 192 + x) * 4;
    let v = 208 + Math.random() * 14 + ((y % 4 === 0) ? 4 : 0);
    if (Math.random() < .04) v -= 14;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  // a few scratchy horizontal streaks
  g.globalAlpha = .25;
  for (let k = 0; k < 40; k++) { g.fillStyle = Math.random() < .5 ? '#fff' : '#b8b8b8'; g.fillRect(Math.random() * 192, Math.random() * 192, 8 + Math.random() * 30, 1); }
  stage.style.setProperty('--noise', `url(${c.toDataURL()})`);
})();

// ---------- channel layout ----------
let layout;
try { layout = JSON.parse(localStorage.getItem('wii-mode-layout')); } catch { }
if (!Array.isArray(layout) || layout.length !== 48 || layout[0] !== 'disc' || !layout.every((id) => id === null || CHANNELS[id])) layout = [...DEFAULT_LAYOUT];
// channels added since the layout was saved go into the first empty slots
DEFAULT_LAYOUT.forEach((id) => { if (id && !layout.includes(id)) { const k = layout.indexOf(null); if (k < 0) layout = [...DEFAULT_LAYOUT]; else layout[k] = id; } });
// The SD card holds the recursite's Miscellaneous pages, and the Rii button's Options screen
// opens the recursite's Health and Safety page. They run like channels but have no tiles.
const RECURSITE = 'https://recursite.brezgis.com/';
const SD_PAGES = ['favorite-words', 'links', 'cool-gifs', 'amazing-figures', 'even-more-quotes', 'its-weird-and-i-need-to-share',
  'on-erosion-and-the-end-of-all-things', 'theres-a-gödel-number-for-that', 'weird-journalism', 'amazing-videos', 'i-can-believe-its-not-butter'];
SD_PAGES.forEach((slug) => { CHANNELS['sd:' + slug] = { title: slug, url: RECURSITE + slug + '/' }; });
CHANNELS.healthsafety = { title: 'Health and Safety', url: RECURSITE + 'healthsafety/' };
const save = () => { try { localStorage.setItem('wii-mode-layout', JSON.stringify(layout)); } catch { } };

let page = 0;
const tiles = [];
function buildTiles() {
  track.innerHTML = ''; tiles.length = 0;
  layout.forEach((id, i) => {
    const { x, y } = slotXY(i);
    const t = document.createElement('div');
    t.className = 'tile' + (id ? '' : ' empty');
    t.style.left = x + 'px'; t.style.top = y + 'px';
    t.dataset.slot = i; t.dataset.hover = id ? 'tile' : 'empty';
    if (id) { t.setAttribute('role', 'button'); t.setAttribute('aria-label', CHANNELS[id].title || id); }
    t.innerHTML = `<div class="art">${id ? CHANNELS[id].art() : ''}</div>`;
    track.appendChild(t); tiles.push(t);
  });
  markLive();
}
// Banners only animate while you can see them: the current page plus the two peeking
// columns, and only while the menu itself is showing. Everything else is paused.
const onScreen = (i) => { const p = Math.floor(i / 12), c = i % 4; return p === page || (p === page - 1 && c === 3) || (p === page + 1 && c === 0); };
function setAnimating(el, on) {
  if (el.classList.contains('paused') === !on) return;
  el.classList.toggle('paused', !on);
  el.querySelectorAll('svg').forEach((s) => s.pauseAnimations && (on ? s.unpauseAnimations() : s.pauseAnimations()));
}
function updateAnimations() {
  const menuShowing = ['menu', 'zoom', 'fading', 'closing'].includes(mode) && !$('#preview').classList.contains('on') && !$('#board').classList.contains('on') && !$('#rii').classList.contains('on') && !$('#sd').classList.contains('on');
  tiles.forEach((t, i) => setAnimating(t, menuShowing && onScreen(i)));
}
function markLive() {
  tiles.forEach((t, i) => {
    const live = Math.floor(i / 12) === page;
    t.style.pointerEvents = live ? 'auto' : 'none';
    if (layout[i]) t.tabIndex = live ? 0 : -1;   // Tab only reaches this page's channels
  });
  if (typeof mode !== 'undefined') updateAnimations();
  $('#arrowL').hidden = page === 0;
  $('#arrowR').hidden = page === PAGES - 1;
}
function goPage(p) {
  p = Math.max(0, Math.min(PAGES - 1, p));
  if (p === page) return;
  sfx.page(p - page); page = p;
  track.style.transform = `translateX(${-page * PAGE_W}px)`;
  markLive(); refreshHover();
}

// ---------- clock & date (7-segment digits, colon centered on x=960) ----------
const SEG = {
  a: [9, 0, 32, 10], b: [40, 9, 10, 28], c: [40, 43, 10, 28], d: [9, 70, 32, 10],
  e: [0, 43, 10, 28], f: [0, 9, 10, 28], g: [9, 35, 32, 10],
};
const DIGITS = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'fabc', 8: 'abcdefg', 9: 'abcdfg' };
function digitSVG(d, x) {
  return `<g transform="translate(${x} 0)">` + [...DIGITS[d]].map((s) => {
    const [sx, sy, w, h] = SEG[s];
    return `<rect x="${sx}" y="${sy}" width="${w}" height="${h}" rx="5" fill="#9b9b9b" stroke="#fff" stroke-opacity=".55" stroke-width="1.5" paint-order="stroke"/>`;
  }).join('') + '</g>';
}
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
let lastKey = '';
function tickClock() {
  const now = new Date();
  const h24 = now.getHours(), h = h24 % 12 || 12, m = now.getMinutes();
  const colon = now.getSeconds() % 2 === 0;
  const key = `${h}:${m}:${colon}`;
  if (key !== lastKey) {
    lastKey = key;
    let s = `<svg width="1920" height="90">`;
    if (h >= 10) s += digitSVG(1, 825);
    s += digitSVG(h % 10, 885);
    if (colon) s += `<circle cx="960" cy="22" r="6.5" fill="#9b9b9b"/><circle cx="960" cy="56" r="6.5" fill="#9b9b9b"/>`;
    s += digitSVG(Math.floor(m / 10), 983) + digitSVG(m % 10, 1043);
    s += `<text x="1139" y="80" font-family="M PLUS 1p, Arial" font-weight="700" font-size="46" fill="#9b9b9b" letter-spacing="2">${h24 < 12 ? 'AM' : 'PM'}</text></svg>`;
    $('#clock').innerHTML = s;
    $('#date').textContent = `${DAYS[now.getDay()]} ${now.getMonth() + 1}/${now.getDate()}`;
  }
}
setInterval(tickClock, 250); tickClock();

// ---------- the SD card icon ----------
$('#sdBtn').innerHTML = `<svg viewBox="0 0 80 104" width="80" height="104"><defs><linearGradient id="sdg" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#bfe9fb"/><stop offset=".12" stop-color="#e9f7fd"/><stop offset=".72" stop-color="#ffffff"/><stop offset=".74" stop-color="#7fd0f2"/><stop offset="1" stop-color="#45b6e8"/></linearGradient></defs>
  <path d="M8,4 H58 L76,22 V96 Q76,100 72,100 H8 Q4,100 4,96 V8 Q4,4 8,4 Z" fill="url(#sdg)" stroke="#3ea9da" stroke-width="3.5" stroke-linejoin="round" transform="translate(2 2)" opacity=".25"/>
  <path d="M8,4 H58 L76,22 V96 Q76,100 72,100 H8 Q4,100 4,96 V8 Q4,4 8,4 Z" fill="url(#sdg)" stroke="#3ea9da" stroke-width="3.5" stroke-linejoin="round"/>
  <text x="40" y="56" text-anchor="middle" font-family="Arial Black, Arial" font-style="italic" font-weight="900" font-size="23" fill="#2c9ad4" letter-spacing="-1">SD</text>
  <path d="M20,60 q20 -6 40 -2" stroke="#2c9ad4" stroke-width="2.5" fill="none"/></svg>`;

// ---------- hover handling ----------
let hovered = null;
const HOVERABLE = '[data-hover], .arrow, .roundbtn, #sdBtn, .pvbtn';
function hoverAt(x, y) {
  const el = document.elementFromPoint(x * scale + offX, y * scale + offY);
  let t = el && el.closest(HOVERABLE);
  if (t && t.dataset.hover === 'empty' && !carrying) t = null;
  if (t === hovered) return;
  if (hovered) hovered.classList.remove('hover');
  hovered = t;
  if (t && t.dataset.slot != null) prefetchFull(t);
  if (t) {
    t.classList.add('hover');
    if (t.matches('.roundbtn, #sdBtn, .pvbtn, .hclose')) sfx.hoverBtn(); else sfx.hover();
  }
  if (arrowTimer) { clearTimeout(arrowTimer); arrowTimer = null; }
  if (carrying && t && t.classList.contains('arrow')) {
    arrowTimer = setTimeout(() => { arrowTimer = null; goPage(page + (t.id === 'arrowR' ? 1 : -1)); }, 650);
  }
}
// Tiles' sprites are loading="lazy" so page 1 gets the bandwidth first; once the page has loaded,
// the other pages fill in behind it, so turning the page never shows a banner popping in.
const eagerAll = () => document.querySelectorAll('#track img[loading="lazy"]').forEach((im) => { im.loading = 'eager'; });
if (document.readyState === 'complete') setTimeout(eagerAll, 300); else addEventListener('load', () => setTimeout(eagerAll, 300));
// Hovering a channel fetches its full-size sprites, so the preview opens sharp.
const fetched = new Set();
function prefetchFull(tile) {
  const urls = [...tile.querySelectorAll('img')].map((i) => i.getAttribute('src'))
    .concat((tile.innerHTML.match(/img\/sm\/[\w-]+\.webp/g) || [])).filter((u) => u && u.includes('img/sm/')).map((u) => u.replace('img/sm/', 'img/'));
  for (const u of urls) if (!fetched.has(u)) { fetched.add(u); const im = new Image(); im.decoding = 'async'; im.src = u; }
}
// Keyboard hover. With no Wii Remote, focus is the pointer: whatever has keyboard focus glows
// and is what A/Enter presses. Arrow keys walk the channel grid and cross pages at its edges.
let keyboard = false, kbSlot = null;
function hoverEl(t) {
  if (t === hovered) return;
  if (hovered) hovered.classList.remove('hover');
  hovered = t;
  if (!t) return;
  t.classList.add('hover');
  if (t.dataset.slot != null) { kbSlot = +t.dataset.slot; prefetchFull(t); }
  if (t.matches('.roundbtn, #sdBtn, .pvbtn, .hclose')) sfx.hoverBtn(); else sfx.hover();
}
addEventListener('focusin', (e) => {
  if (!keyboard) return;
  const t = e.target.closest && e.target.closest(HOVERABLE);
  if (t && t.dataset.hover !== 'empty') hoverEl(t);
});
const SCREEN = { menu: '#menu', preview: '#preview', board: '#board', letter: '#letter', memo: '#memo', calendar: '#calendar', rii: '#rii', sd: '#sd', home: '#homeMenu' };
const shown = (el) => el.offsetParent !== null && !el.hidden;
// after a screen change, put keyboard focus somewhere sensible on the new screen
function keyboardLand() {
  const box = SCREEN[mode] && $(SCREEN[mode]); if (!box) return;
  let t = null;
  if (mode === 'menu' && kbSlot != null && Math.floor(kbSlot / 12) === page && layout[kbSlot]) t = tiles[kbSlot];
  else if (mode === 'menu') t = tiles.find((x, i) => Math.floor(i / 12) === page && layout[i]);
  else if (mode === 'preview') t = $('#pvStart');
  if (!t || !shown(t)) t = [...box.querySelectorAll('button, [role="button"], textarea')].find(shown);
  if (t) { t.focus({ preventScroll: true }); hoverEl(t.closest(HOVERABLE)); }
}
// the channel grid: global column gc runs across all pages, rows 0-2
function gridStep(dx, dy) {
  const cur = hovered && hovered.dataset.slot != null ? +hovered.dataset.slot : null;
  if (cur == null) return keyboardLand();
  let gc = Math.floor(cur / 12) * 4 + cur % 4, r = Math.floor((cur % 12) / 4);
  for (;;) {
    gc += dx; r += dy;
    if (gc < 0 || gc >= PAGES * 4 || r < 0 || r > 2) return;
    const i = Math.floor(gc / 4) * 12 + r * 4 + gc % 4;
    if (!layout[i]) continue;   // skip empty slots
    const p = Math.floor(i / 12);
    if (p !== page) { sfx.page(p - page); page = p; track.style.transform = `translateX(${-page * PAGE_W}px)`; markLive(); }
    tiles[i].focus({ preventScroll: true }); hoverEl(tiles[i]);
    return;
  }
}
const refreshHover = () => {
  if (hovered) hovered.classList.remove('hover'); hovered = null;
  setTimeout(() => (keyboard ? keyboardLand() : hoverAt(px, py)), 450);
};
let arrowTimer = null;

// ---------- picking up and moving channels (hold A) ----------
let carrying = null, holdTimer = null, downAt = null;
const carry = $('#carry');
function pickUp(slot) {
  const id = layout[slot];
  if (!id || CHANNELS[id].fixed) return;
  carrying = { slot, id };
  sfx.pick(); setCursorShape(true);
  tiles[slot].classList.add('carried-from');
  carry.innerHTML = `<div class="art">${CHANNELS[id].art()}</div>`;
  carry.classList.add('on'); $('#dim').classList.add('on');
  moveCarry();
}
const moveCarry = () => { if (carrying) carry.style.transform = `translate(${px - 150}px, ${py - 80}px)`; };
function drop() {
  const target = hovered && hovered.dataset.slot != null ? +hovered.dataset.slot : null;
  if (target != null && target !== 0) {
    [layout[carrying.slot], layout[target]] = [layout[target], layout[carrying.slot]];
    save();
  }
  sfx.drop();
  carrying = null; setCursorShape(false);
  carry.classList.remove('on'); $('#dim').classList.remove('on');
  buildTiles(); refreshHover();
}

// ---------- channel preview ----------
let mode = 'warning', pvSlot = null;
// Every mode change comes through here. Animations are re-evaluated once the current task
// finishes, since callers often flip a screen's .on class just after changing the mode; and the
// menu is inert whenever it isn't the screen in use, so Tab can't wander behind a preview.
function setMode(m) {
  mode = m;
  $('#menu').inert = m !== 'menu';
  queueMicrotask(updateAnimations);
}
function tileRect(slot) { const { x, y } = slotXY(slot); return { x: x - page * PAGE_W, y, w: 392, h: 208 }; }
// Transitions run as composited transform/opacity animations only. The preview is built
// up front, and its banner flies out of the tile you picked while the button bar rises
// in. Closing plays the same animation in reverse.
const EASE = 'cubic-bezier(.22,.7,.18,1)', ZOOM_MS = 440;
const anim = (el, frames, opts = {}) => el.animate(frames, { duration: ZOOM_MS, easing: EASE, fill: 'both', ...opts });
// The tile's banner area as a transform of the 1536x800 preview banner (both are 1.92:1, so one scale).
function tileTransform(slot) {
  const r = tileRect(slot), k = 384 / 1536;
  return `translate(${r.x + 4 - 192}px, ${r.y + 4}px) scale(${k})`;
}
// The backdrop is the banner drawn into a 48x25 canvas and stretched to fill the screen,
// so the stretch does the blurring. A CSS blur filter is far more expensive.
function paintBackdrop(canvas, art) {
  const g = canvas.getContext('2d');
  g.fillStyle = '#f2f2f2'; g.fillRect(0, 0, 48, 25);
  const tint = art.match(/^<div class="wb[^>]*data-tint="([^"]+)"/);
  if (tint) { g.fillStyle = tint[1]; g.fillRect(0, 0, 48, 25); return; }
  if (!art.startsWith('<svg')) return;
  const img = new Image();
  img.onload = () => g.drawImage(img, 0, 0, 48, 25);
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(art.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="384" height="200" '));
}
function buildPreview(slot) {
  pvSlot = slot;
  const ch = CHANNELS[layout[slot]];
  // banners keep their tile shape; a blurred copy fills the wider preview screen
  const art = ch.art().replaceAll('img/sm/', 'img/');   // tiles use small sprites; the full-screen preview the full ones
  $('#pvBanner').innerHTML = `<canvas class="pvback" width="48" height="25"></canvas><div class="pvfront">${art}</div>` + (ch.msg ? `<div class="pvmsg">${ch.msg}</div>` : '');
  paintBackdrop($('#pvBanner .pvback'), art);
  $('#pvStart').classList.toggle('disabled', !ch.url);
  $('#pvNote').textContent = ch.url ? (ch.newTab ? `opens ${new URL(ch.url).host} in a new tab` : new URL(ch.url).host + new URL(ch.url).pathname.replace(/\/$/, '')) : '';
  const filled = layout.map((id, i) => id ? i : -1).filter((i) => i >= 0);
  const k = filled.indexOf(slot);
  $('#pvL').hidden = k <= 0; $('#pvR').hidden = k >= filled.length - 1;
}
function previewParts() {
  return { front: $('#pvBanner .pvfront'), back: $('#pvBanner .pvback'), msg: $('#pvBanner .pvmsg'), bar: $('#pvBar'), arrows: [$('#pvL'), $('#pvR')] };
}
function openPreview(slot) {
  const id = layout[slot]; if (!id) return;
  sfx.select(); duckMusic(true); setMode('zoom');
  buildPreview(slot);
  $('#preview').classList.add('on');
  const { front, back, msg, bar, arrows } = previewParts();
  [bar, ...arrows].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
  setAnimating(front, false);   // hold the banner still while it scales; resume once it lands
  anim(front, [{ transform: tileTransform(slot), opacity: 0 }, { opacity: 1, offset: .12 }, { transform: 'none', opacity: 1 }]);
  anim(back, [{ opacity: 0 }, { opacity: 1 }], { duration: ZOOM_MS * .9 });
  anim(bar, [{ transform: 'translateY(290px)' }, { transform: 'none' }]);
  [msg, ...arrows].forEach((el) => el && anim(el, [{ opacity: 0 }, { opacity: 0, offset: .6 }, { opacity: 1 }]));
  setTimeout(() => { setAnimating(front, true); setMode('preview'); refreshHover(); }, ZOOM_MS);
}
function stepPreview(dir) {
  const filled = layout.map((id, i) => id ? i : -1).filter((i) => i >= 0);
  const k = filled.indexOf(pvSlot) + dir;
  if (k < 0 || k >= filled.length || mode !== 'preview') return;
  sfx.page(dir); setMode('zoom');
  // the old banner slides off one side while the next one slides in from the other
  const old = $('#pvBanner'), ghost = document.createElement('div');
  ghost.className = 'pvghost';
  ghost.append(...old.children);   // move the current banner out (no re-render), then build the next
  old.parentNode.insertBefore(ghost, old.nextSibling);
  setAnimating(ghost, false);
  buildPreview(filled[k]);
  const ms = 360;
  anim(ghost, [{ transform: 'none' }, { transform: `translateX(${-dir * 1920}px)` }], { duration: ms }).onfinish = () => ghost.remove();
  anim(old, [{ transform: `translateX(${dir * 1920}px)` }, { transform: 'none' }], { duration: ms });
  setTimeout(() => { setMode('preview'); refreshHover(); }, ms);
}
function closePreview() {
  sfx.back(); setMode('zoom');
  const slot = pvSlot, p = Math.floor(slot / 12);
  if (p !== page) { page = p; track.style.transition = 'none'; track.style.transform = `translateX(${-page * PAGE_W}px)`; track.offsetWidth; track.style.transition = ''; markLive(); }
  const { front, back, msg, bar, arrows } = previewParts();
  setAnimating(front, false);
  const o = { direction: 'reverse' };
  anim(front, [{ transform: tileTransform(slot), opacity: 0 }, { opacity: 1, offset: .12 }, { transform: 'none', opacity: 1 }], o);
  anim(back, [{ opacity: 0 }, { opacity: 1 }], o);
  anim(bar, [{ transform: 'translateY(290px)' }, { transform: 'none' }], o);
  [msg, ...arrows].forEach((el) => el && anim(el, [{ opacity: 0 }, { opacity: 0, offset: .6 }, { opacity: 1 }], { ...o, duration: ZOOM_MS * .5 }));
  setMode('closing');   // the menu starts animating again under the shrinking banner
  setTimeout(() => {
    $('#preview').classList.remove('on'); $('#pvBanner').innerHTML = '';
    bar.getAnimations().forEach((a) => a.cancel());
    setMode('menu'); duckMusic(false); refreshHover();
  }, ZOOM_MS);
}
// Fade the whole viewport to black and back, outside the stage so it also covers a running app.
const veil = $('#veil');
const fadeOut = (ms = 360) => veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: 'ease-in', fill: 'forwards' }).finished;
const fadeIn = (ms = 480) => veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: 'ease-out', fill: 'forwards' }).finished;
// ---------- running a channel ----------
let running = null;
const frame = $('#appFrame');
function startChannel() {
  const id = layout[pvSlot], ch = CHANNELS[id];
  if (!ch.url || mode !== 'preview') { if (!ch.url) sfx.back(); return; }
  returnTo = null;
  runApp(id);
}
// where quitting a running app goes back to: the menu, or the screen it was opened from
let returnTo = null;
function runApp(id) {
  const ch = CHANNELS[id];
  sfx.start(); logStart(id);
  if (ch.newTab) {
    $('#flash').animate([{ opacity: 0 }, { opacity: .8 }, { opacity: 0 }], { duration: 600, easing: 'ease-in-out' });
    window.open(ch.url, '_blank', 'noopener');
    setTimeout(logEnd, 1000);
    return;
  }
  // Like the real Wii: fade to black, load the channel behind the black, then fade up
  // once it has loaded. Waits at most 6 s, so a slow app still appears.
  setMode('app'); duckMusic('off');
  fadeOut().then(() => {
    running = id;
    let shown = false;
    const reveal = () => { if (shown) return; shown = true; frame.removeEventListener('load', reveal); setTimeout(() => fadeIn(), 120); };
    frame.addEventListener('load', reveal);
    setTimeout(reveal, 6000);
    frame.src = ch.url;
    $('#app').classList.add('on'); document.body.classList.add('running');
    $('#preview').classList.remove('on'); $('#pvBanner').innerHTML = '';
    if (returnTo) $('#' + returnTo).classList.remove('on');
  });
}
function openHome() {
  if (mode !== 'app') return;
  sfx.select(); setMode('home');
  document.body.classList.add('home');
  $('#shade').classList.add('on'); $('#homeMenu').classList.add('on');
  $('#hChan').textContent = CHANNELS[running].title;
  navigator.getBattery?.().then((b) => {
    const n = Math.max(1, Math.ceil(b.level * 4));
    document.querySelectorAll('#batt i').forEach((el, i) => el.classList.toggle('off', i >= n));
  }).catch(() => { });
  refreshHover();
}
function closeHome() {
  document.body.classList.remove('home');
  $('#shade').classList.remove('on'); $('#homeMenu').classList.remove('on');
}
function quitToMenu() {
  sfx.back(); setMode('zoom');
  fadeOut(300).then(() => {
    closeHome(); logEnd();
    frame.src = 'about:blank'; running = null;
    $('#app').classList.remove('on'); document.body.classList.remove('running');
    if (returnTo) { $('#' + returnTo).classList.add('on'); setMode(returnTo); duckMusic(false); fadeIn(520); refreshHover(); return; }
    const p = Math.floor(pvSlot / 12);
    if (pvSlot != null && p !== page) { page = p; track.style.transition = 'none'; track.style.transform = `translateX(${-page * PAGE_W}px)`; track.offsetWidth; track.style.transition = ''; markLive(); }
    setMode('menu'); duckMusic(false); refreshMailLight();
    fadeIn(520); refreshHover();
  });
}
$('#homeBtn').addEventListener('click', (e) => { e.stopPropagation(); initAudio(); openHome(); });

// ---------- Message Board ----------
function enterBoard() {
  sfx.select(); setMode('zoom');
  const f = $('#flash');
  f.animate([{ opacity: 0 }, { opacity: .9 }, { opacity: 0 }], { duration: 560, easing: 'ease-in-out' });
  setTimeout(() => { openBoard(); $('#board').classList.add('on'); setMode('board'); refreshHover(); }, 260);
}
function leaveBoard() {
  sfx.back(); setMode('zoom');
  const f = $('#flash');
  f.animate([{ opacity: 0 }, { opacity: .9 }, { opacity: 0 }], { duration: 560, easing: 'ease-in-out' });
  setTimeout(() => { $('#board').classList.remove('on'); refreshMailLight(); setMode('menu'); refreshHover(); }, 260);
}

// ---------- Rii Options and the SD Card Menu ----------
function showScreen(id) {
  sfx.select(); setMode('zoom');
  $('#flash').animate([{ opacity: 0 }, { opacity: .9 }, { opacity: 0 }], { duration: 560, easing: 'ease-in-out' });
  setTimeout(() => { $('#' + id).classList.add('on'); setMode(id); updateAnimations(); refreshHover(); }, 260);
}
function hideScreen(id) {
  sfx.back(); setMode('zoom');
  $('#flash').animate([{ opacity: 0 }, { opacity: .9 }, { opacity: 0 }], { duration: 560, easing: 'ease-in-out' });
  setTimeout(() => { $('#' + id).classList.remove('on'); setMode('menu'); updateAnimations(); refreshHover(); }, 260);
}
function riiView(v) {   // 'main' | 'data' | 'ask'
  $('#riiMain').hidden = v !== 'main'; $('#riiDataCards').hidden = v !== 'data'; $('#riiAsk').hidden = v !== 'ask';
  refreshHover();
}
function openRii() { riiView('main'); showScreen('rii'); }
// The SD card reads the recursite homepage's Miscellaneous list, so new pages show up on their own.
// SD_PAGES is the fallback (and what the dev server shows, where ../ is not the recursite).
let sdPages = SD_PAGES;
const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1500));
idle(() => fetch('../', { cache: 'no-cache' }).then((r) => r.ok ? r.text() : '').then((html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const h = [...doc.querySelectorAll('h2')].find((e) => e.textContent.trim() === 'Miscellaneous');
  let ul = h && h.nextElementSibling; while (ul && ul.tagName !== 'UL') ul = ul.nextElementSibling;
  const slugs = ul ? [...ul.querySelectorAll('a.proj')].map((a) => decodeURIComponent(a.getAttribute('href') || '').replace(/^\.?\/?|\/$/g, '')).filter((x) => x && !x.includes(':') && !x.includes('/')) : [];
  if (slugs.length) {
    sdPages = slugs;
    slugs.forEach((slug) => { CHANNELS['sd:' + slug] ||= { title: slug, url: RECURSITE + slug + '/' }; });
  }
}).catch(() => { }), { timeout: 4000 });   // after the menu is up, so it never competes with first paint
function openSD() {
  $('#sdList').innerHTML = sdPages.map((slug) => `<button class="sdrow" data-act="sdOpen" data-hover="btn" data-id="sd:${slug}">${slug}</button>`).join('');
  showScreen('sd');
}
let riiPending = null;
const RII_ASK = {
  layout: ['Put every channel back<br>where it started?', () => { layout = [...DEFAULT_LAYOUT]; save(); page = 0; track.style.transform = 'translateX(0)'; buildTiles(); }],
  board: ['Erase every memo and the play log<br>from the Message Board?', () => { ['wii-mode-memos', 'wii-mode-log', 'wii-mode-read'].forEach((k) => { try { localStorage.removeItem(k); } catch { } }); refreshMailLight(); }],
};
const ask = (k) => { sfx.select(); riiPending = k; $('#riiAskText').innerHTML = RII_ASK[k][0]; riiView('ask'); };

// data-act buttons: board + HOME Menu. A board action returns the mode it lands in.
const ACTIONS = {
  ...Object.fromEntries(Object.entries(boardActions).map(([k, fn]) => [k, (el) => {
    const r = fn(el);
    if (r === 'page-1' || r === 'page1') { sfx.page(r === 'page1' ? 1 : -1); if (mode === 'board') renderBoard(); }
    else if (r === 'posted') { sfx.pressA(); setMode('board'); renderBoard(); }
    else if (r === 'letter' || r === 'memo' || r === 'calendar') { sfx.select(); setMode(r); }
    else { sfx.back(); setMode(r); renderBoard(); }
    refreshHover();
  }])),
  bdBack: () => leaveBoard(),
  hClose: () => { sfx.back(); closeHome(); setMode('app'); },
  hWiiMenu: () => quitToMenu(),
  riiData: () => { sfx.select(); riiView('data'); },
  riiSafety: () => { returnTo = 'rii'; runApp('healthsafety'); },
  riiAskLayout: () => ask('layout'),
  riiAskBoard: () => ask('board'),
  riiYes: () => { RII_ASK[riiPending][1](); sfx.pressA(); riiView('data'); },
  riiNo: () => { sfx.back(); riiView('data'); },
  riiBack: () => { if (!$('#riiAsk').hidden) return ACTIONS.riiNo(); if (!$('#riiDataCards').hidden) { sfx.back(); return riiView('main'); } hideScreen('rii'); },
  sdOpen: (el) => { returnTo = 'sd'; runApp(el.dataset.id); },
  sdBack: () => hideScreen('sd'),
  hReset: () => { sfx.start(); closeHome(); setMode('app'); logEnd(); logStart(running); frame.src = CHANNELS[running].url; },
};

// ---------- health & safety → menu ----------
let canContinue = false;
setTimeout(() => { $('#pressA').classList.add('on'); canContinue = true; }, 2600);
function continueFromWarning() {
  if (!canContinue) return;
  initAudio(); sfx.pressA(); setMode('fading');
  $('#warning').classList.add('gone');
  setTimeout(() => { $('#menu').classList.add('on'); startMusic(); setMode('menu'); refreshHover(); }, 600);
}

// ---------- input ----------
function pressA() {
  if (mode === 'warning') return continueFromWarning();
  if (hovered && hovered.dataset.act && ACTIONS[hovered.dataset.act]) return ACTIONS[hovered.dataset.act](hovered);
  if (mode === 'preview') {
    if (!hovered) return;
    if (hovered.id === 'pvMenu') return closePreview();
    if (hovered.id === 'pvStart') return startChannel();
    if (hovered.id === 'pvL') return stepPreview(-1);
    if (hovered.id === 'pvR') return stepPreview(1);
    return;
  }
  if (mode !== 'menu' || !hovered) return;
  if (hovered.id === 'arrowL') return goPage(page - 1);
  if (hovered.id === 'arrowR') return goPage(page + 1);
  if (hovered.dataset.slot != null) return openPreview(+hovered.dataset.slot);
  if (hovered.id === 'mailBtn') return enterBoard();
  if (hovered.id === 'wiiBtn') return openRii();
  if (hovered.id === 'sdBtn') return openSD();
  if (hovered.classList.contains('roundbtn') || hovered.id === 'sdBtn') {
    sfx.select(); hovered.classList.add('press');
    const h = hovered; setTimeout(() => h.classList.remove('press'), 140);
  }
}

// Touch: a tap is A, a sideways swipe turns the page, and the Wii hand stays hidden.
let touchy = false;
addEventListener('pointermove', (e) => {
  if (keyboard && Math.hypot(e.movementX, e.movementY) > 2) keyboard = false;
  ({ x: px, y: py } = toStage(e));
  touchy = e.pointerType === 'touch';
  cursor.classList.toggle('on', !touchy);
  if (downAt && Math.hypot(px - downAt.x, py - downAt.y) > 14) { clearTimeout(holdTimer); holdTimer = null; }
  moveCarry(); hoverAt(px, py);
});
addEventListener('pointerleave', () => cursor.classList.remove('on'));
addEventListener('pointerdown', (e) => {
  initAudio(); touchy = e.pointerType === 'touch'; if (touchy) cursor.classList.remove('on');
  ({ x: px, y: py } = toStage(e)); hoverAt(px, py);
  downAt = { x: px, y: py };
  if (mode === 'menu' && hovered && hovered.dataset.slot != null) {
    const slot = +hovered.dataset.slot;
    holdTimer = setTimeout(() => { holdTimer = null; downAt = null; pickUp(slot); }, 550);
  }
});
addEventListener('pointerup', (e) => {
  if (carrying) { drop(); downAt = null; return; }
  if (!downAt) return;
  const p = toStage(e), dx = p.x - downAt.x, dy = p.y - downAt.y;
  downAt = null;
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  if (Math.hypot(dx, dy) > 40) {   // a drag, not a press: swipe pages (or the board's days), else ignore
    if (Math.abs(dx) > 120 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (mode === 'menu') goPage(page + (dx < 0 ? 1 : -1));
      else if (mode === 'preview') stepPreview(dx < 0 ? 1 : -1);
    }
    if (touchy) { if (hovered) hovered.classList.remove('hover'); hovered = null; }
    return;
  }
  pressA();
  if (touchy) setTimeout(() => { if (hovered) hovered.classList.remove('hover'); hovered = null; }, 250);   // no hover to linger on a touch screen
});
addEventListener('pointercancel', () => { downAt = null; if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } });
addEventListener('keydown', (e) => {
  if (e.target.tagName === 'TEXTAREA') return;
  const k = e.key;
  if (k === 'Tab' || k.startsWith('Arrow')) {
    if (!keyboard) { keyboard = true; if (k.startsWith('Arrow') && mode === 'menu' && !(hovered && hovered.dataset.slot != null)) { e.preventDefault(); return keyboardLand(); } }
    if (k === 'Tab') { if (hovered && !hovered.matches(':focus')) hovered.focus({ preventScroll: true }); return; }
  }
  if (mode === 'menu' && k.startsWith('Arrow')) {   // arrows hold to keep walking
    e.preventDefault();
    return gridStep(k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : 0, k === 'ArrowDown' ? 1 : k === 'ArrowUp' ? -1 : 0);
  }
  if (e.repeat) return;
  if (k === 'Enter' || k === ' ' || k === 'a' || k === 'A') { e.preventDefault(); pressA(); }
  else if (mode === 'menu' && (k === '+' || k === '=')) goPage(page + 1);
  else if (mode === 'menu' && (k === '-' || k === '_')) goPage(page - 1);
  else if (mode === 'preview' && (k === 'ArrowRight' || k === '+' || k === '=')) stepPreview(1);
  else if (mode === 'preview' && (k === 'ArrowLeft' || k === '-' || k === '_')) stepPreview(-1);
  else if ((k === 'b' || k === 'B' || k === 'Escape') && mode === 'preview') closePreview();
  else if ((k === 'b' || k === 'B' || k === 'Escape') && mode === 'board') leaveBoard();
  else if ((k === 'b' || k === 'B' || k === 'Escape') && mode === 'rii') ACTIONS.riiBack();
  else if ((k === 'b' || k === 'B' || k === 'Escape') && mode === 'sd') ACTIONS.sdBack();
  else if ((k === 'b' || k === 'B' || k === 'Escape') && ['letter', 'calendar'].includes(mode)) ACTIONS[mode === 'letter' ? 'lBack' : 'cClose']();
  else if (mode === 'board' && k === 'ArrowLeft') ACTIONS.bdPrev();
  else if (mode === 'board' && k === 'ArrowRight' && !$('#bdR').hidden) ACTIONS.bdNext();
  else if ((k === 'Home' || k === 'h' || k === 'H') && mode === 'app') openHome();
  else if ((k === 'Home' || k === 'h' || k === 'H' || k === 'Escape') && mode === 'home') ACTIONS.hClose();
  else if (k === 'm' || k === 'M') toggleMusic();
});

buildTiles();


