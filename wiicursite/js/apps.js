// Channels for Anna's apps (brezgis.com and the recursite). Each banner is an animated
// SVG drawn in the Wii channel-icon idiom: a clean glossy scene, one small looping
// motion, and the channel's name set in a rounded title face. Viewbox is 384x200.

const VB = 'viewBox="0 0 384 200" preserveAspectRatio="xMidYMid slice"';
const ROUND = 'font-family="M PLUS Rounded 1c, M PLUS 1p, Arial Rounded MT Bold, Arial, sans-serif"';
const SERIF = 'font-family="Cormorant Garamond, Georgia, Times New Roman, serif"';
const MONO = 'font-family="VT323, Courier New, monospace"';
let uid = 0;
const id = () => 'a' + (uid++).toString(36);

// Wii-style banner title: bold rounded type with a soft outline and drop shadow.
function title(text, { x = 192, y = 46, size = 34, fill = '#fff', stroke = 'rgba(0,0,0,.28)', anchor = 'middle', font = ROUND, weight = 800, spacing = 0, extra = '' } = {}) {
  return `<text x="${x}" y="${y + 2}" text-anchor="${anchor}" ${font} font-weight="${weight}" font-size="${size}" letter-spacing="${spacing}" fill="rgba(0,0,0,.18)" ${extra}>${text}</text>
    <text x="${x}" y="${y}" text-anchor="${anchor}" ${font} font-weight="${weight}" font-size="${size}" letter-spacing="${spacing}" fill="${fill}" stroke="${stroke}" stroke-width="3" paint-order="stroke" ${extra}>${text}</text>`;
}
const gloss = (p) => `<linearGradient id="${p}gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
const glossRect = (p) => `<rect width="384" height="92" fill="url(#${p}gl)"/>`;
const svg = (body, cls = '') => `<svg ${VB} class="${cls}">${body}</svg>`;
const rnd = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// ---------------------------------------------------------------- brezgis.com
function recursite() {
  const p = id();
  // the page, drawn inside itself: each copy is 62% of the last
  const page = (n) => n === 0 ? '' : `<g>
    <rect x="0" y="0" width="384" height="200" fill="#ffffcc"/>
    <text x="192" y="44" text-anchor="middle" font-family="Times New Roman, serif" font-weight="700" font-size="34" fill="#101010" stroke="#c9b84a" stroke-width=".6">Recursite</text>
    <rect x="62" y="56" width="260" height="5" fill="url(#${p}rb)"/>
    <g fill="#0000ee" opacity=".75">${[76, 88, 100].map((y, i) => `<rect x="${70 + i * 6}" y="${y}" width="${90 - i * 10}" height="4"/>`).join('')}</g>
    <g transform="translate(222 70) scale(.36)"><rect x="-3" y="-3" width="390" height="206" fill="#808080"/>${page(n - 1)}</g></g>`;
  return svg(`<defs><linearGradient id="${p}rb" x1="0" x2="1"><stop offset="0" stop-color="#0033cc"/><stop offset=".2" stop-color="#0099ff"/><stop offset=".4" stop-color="#00cc66"/><stop offset=".6" stop-color="#ffff00"/><stop offset=".8" stop-color="#ff9900"/><stop offset="1" stop-color="#ff0000"/></linearGradient></defs>
    <g>${page(4)}<animateTransform attributeName="transform" type="matrix" values="1 0 0 1 0 0;2.778 0 0 2.778 -616.7 -194.4" dur="6s" repeatCount="indefinite"/></g>
    <rect width="384" height="200" fill="none"/>`);
}

function notbell() {
  const p = id(), r = rnd(5);
  const stars = Array.from({ length: 22 }, () => `<circle cx="${r() * 384}" cy="${r() * 80}" r="${.8 + r() * 1.2}" fill="#fff"><animate attributeName="opacity" values="1;.2;1" dur="${2 + r() * 3}s" repeatCount="indefinite"/></circle>`).join('');
  const house = (x, y, s, roof) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 0 L0 -20 L22 0Z" fill="${roof}"/><rect x="-18" y="0" width="36" height="26" fill="#d8cfc0"/><rect x="-6" y="8" width="10" height="10" fill="#ffd36b"><animate attributeName="fill" values="#ffd36b;#ffb84a;#ffd36b" dur="3s" repeatCount="indefinite"/></rect></g>`;
  return svg(`<defs><linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1a3a"/><stop offset="1" stop-color="#2d4a7a"/></linearGradient>
    <linearGradient id="${p}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d5a8a"/><stop offset="1" stop-color="#0d2c4c"/></linearGradient></defs>
    <rect width="384" height="200" fill="url(#${p}s)"/>${stars}
    <circle cx="346" cy="88" r="14" fill="#fff6d8"/><circle cx="352" cy="83" r="12" fill="url(#${p}s)"/>
    <rect y="150" width="384" height="50" fill="url(#${p}w)"/>
    <path d="M30 160 L80 112 L130 104 L190 92 L250 104 L320 116 L360 160Z" fill="#3c6b3a"/>
    <path d="M30 160 L80 112 L130 104 L150 160Z" fill="#2e5a2e"/><path d="M250 104 L320 116 L360 160 L290 160Z" fill="#4a7d44"/>
    ${house(150, 102, 1, '#3d6db0')}${house(208, 96, .9, '#2f7a5a')}${house(260, 108, .8, '#9a4a3a')}
    <g transform="translate(110 118)"><circle r="7" fill="#ffd36b" opacity=".35"><animate attributeName="r" values="6;10;6" dur="2.4s" repeatCount="indefinite"/></circle><circle r="3" fill="#ffe9a0"/></g>
    <g stroke="#7fb6e0" stroke-width="2" opacity=".55"><path d="M40 170 h40 M120 178 h60 M230 172 h50 M300 182 h40"><animateTransform attributeName="transform" type="translate" values="0 0;14 0;0 0" dur="5s" repeatCount="indefinite"/></path></g>
    ${title('Notbell', { x: 170, y: 48, size: 38 })}
    <g transform="translate(286 30) rotate(-12)"><rect x="-26" y="-11" width="52" height="22" rx="11" fill="#e8483a"/><text y="6" text-anchor="middle" ${ROUND} font-weight="800" font-size="15" fill="#fff">NOT</text></g>`);
}

function annasArxiv() {
  const p = id();
  const cols = ['#5c4a9e', '#e8e0c8', '#2b7a8a', '#c8402a', '#e8701a', '#3a6a3a', '#7a2a4a', '#2a4a8a', '#c8a03a'];
  let x = 34, books = '';
  cols.forEach((c, i) => {
    const w = 30 + (i * 7) % 12, h = 92 + (i * 13) % 22;
    const pull = i === 4 ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -22;0 -22;0 0" keyTimes="0;.4;.55;.85;1" dur="5s" repeatCount="indefinite"/>` : '';
    books += `<g><rect x="${x}" y="${178 - h}" width="${w}" height="${h}" rx="2" fill="${c}"/><rect x="${x}" y="${190 - h}" width="${w}" height="8" fill="#fff" opacity=".35"/><rect x="${x + 4}" y="${206 - h}" width="${w - 8}" height="26" fill="#fffbe8" opacity=".85"/>${pull}</g>`;
    x += w + 3;
  });
  return svg(`<defs><linearGradient id="${p}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3a22"/><stop offset="1" stop-color="#3a2414"/></linearGradient>
    <pattern id="${p}pp" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#8a7a4a"/><path d="M10 2 q6 8 0 16 q-6 -8 0 -16" fill="#6a5a32"/></pattern></defs>
    <rect width="384" height="200" fill="url(#${p}w)"/>
    <rect x="20" y="62" width="344" height="122" fill="url(#${p}pp)"/>
    ${books}
    <rect x="14" y="178" width="356" height="12" fill="#7a5232"/><rect x="14" y="178" width="356" height="3" fill="#a07a52"/>
    ${title('Anna’s ArXiv', { y: 46, size: 38, fill: '#e8c46a', stroke: '#3a2414', font: SERIF, weight: 700, extra: 'font-style="italic"' })}`);
}

function honeypot() {
  const p = id(), r = rnd(11);
  const pings = Array.from({ length: 7 }, (_, i) => {
    const x = 60 + r() * 270, y = 92 + r() * 70, d = (1.6 + r() * 1.4).toFixed(2), b = (r() * 2).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="4" fill="#ff4a4a"/><circle cx="${x}" cy="${y}" r="4" fill="none" stroke="#ff4a4a" stroke-width="2"><animate attributeName="r" values="4;16" dur="${d}s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></circle>`;
  }).join('');
  return svg(`<rect width="384" height="200" fill="#0b1a12"/>
    <g fill="#1d3a28">${[[50, 96, 70, 30], [70, 132, 30, 34], [170, 92, 40, 26], [180, 122, 30, 40], [230, 90, 100, 34], [290, 140, 30, 18]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>`).join('')}</g>
    <g stroke="#173a24" stroke-width="1">${Array.from({ length: 8 }, (_, i) => `<line x1="0" y1="${70 + i * 18}" x2="384" y2="${70 + i * 18}"/>`).join('')}</g>
    ${pings}
    <g transform="translate(330 150)"><path d="M-18 -18 q-8 4 -8 18 q0 24 26 24 q26 0 26 -24 q0 -14 -8 -18z" fill="#e8a020"/><rect x="-20" y="-24" width="40" height="8" rx="3" fill="#c88010"/><path d="M-18 -6 q8 6 0 12 M18 -6 q-8 6 0 12" stroke="#ffd060" stroke-width="3" fill="none"/>
      <g><circle cx="0" cy="-36" r="4" fill="#ffd040"/><path d="M-3 -36 h6" stroke="#222" stroke-width="2"/><ellipse cx="-3" cy="-40" rx="3" ry="2" fill="#fff" opacity=".8"/>
      <animateTransform attributeName="transform" type="rotate" values="0 0 -10;360 0 -10" dur="3s" repeatCount="indefinite"/></g></g>
    ${title('HONEYPOT', { y: 50, size: 40, fill: '#3dff7a', stroke: '#0b3a1a', font: MONO, weight: 400, spacing: 3 })}
    <text x="192" y="190" text-anchor="middle" ${MONO} font-size="16" fill="#3dff7a" opacity=".8">LIVE ATTACKER INTELLIGENCE<animate attributeName="opacity" values=".8;.3;.8" dur="1.6s" repeatCount="indefinite"/></text>`);
}

function whatThePh() {
  const p = id();
  const pts = Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return [192 + Math.cos(a) * 56 + Math.sin(i * 7) * 6, 112 + Math.sin(a) * 42 + Math.cos(i * 5) * 5]; });
  const disks = pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#2b3a8a" opacity=".13"><animate attributeName="r" values="2;34;34;2" keyTimes="0;.6;.85;1" dur="6s" repeatCount="indefinite"/></circle>`).join('');
  const dots = pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#2b3a8a"/>`).join('');
  return svg(`<rect width="384" height="200" fill="#f6f3ea"/>
    ${disks}${dots}
    <g stroke="#e8701a" stroke-width="3" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.35;.45;.85;1" dur="6s" repeatCount="indefinite"/>
      <line x1="40" y1="186" x2="${40 + 200}" y2="186"/></g>
    ${title('what the ph', { y: 42, size: 34, fill: '#2b3a8a', stroke: '#f6f3ea', font: SERIF, weight: 600, extra: 'font-style="italic"' })}`);
}

function annagram() {
  const p = id();
  const cols = ['#222', '#e83a8a', '#222', '#e83a8a', '#2a8ae8', '#222', '#e83a8a', '#222'];
  const letters = 'annagram'.split('').map((c, i) => `<text x="${84 + i * 31}" y="74" text-anchor="middle" ${MONO} font-size="52" fill="${cols[i]}">${c}<animate attributeName="fill" values="${cols[i]};${cols[(i + 3) % 8]};${cols[i]}" dur="${2 + i * .3}s" repeatCount="indefinite"/></text>`).join('');
  const words = ['can you do', 'the same thing', 'is pretty cool'];
  return svg(`<rect width="384" height="200" fill="#fff"/>
    ${letters}
    <rect x="44" y="96" width="296" height="64" fill="#fff" stroke="#222" stroke-width="3"/>
    <path d="M44 120 l-14 8 l14 6" fill="#fff" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
    <rect x="45" y="118" width="3" height="18" fill="#fff"/>
    ${words.map((w, i) => `<text x="60" y="${124 + (i % 2) * 22}" ${MONO} font-size="22" fill="${i ? '#222' : '#e83a8a'}" opacity="0">${w}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${(i * .25).toFixed(2)};${(i * .25 + .05).toFixed(2)};.9;1" dur="6s" repeatCount="indefinite"/></text>`).join('')}
    <rect x="300" y="132" width="10" height="18" fill="#e83a8a"><animate attributeName="opacity" values="1;0;1" dur="1s" calcMode="discrete" repeatCount="indefinite"/></rect>
    <rect x="44" y="172" width="58" height="16" fill="#e83a8a"/><text x="73" y="185" text-anchor="middle" ${MONO} font-size="16" fill="#fff">[rand]</text>`);
}

function stochasticShore() {
  const p = id();
  return svg(`<defs><linearGradient id="${p}sea" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f5a5a"/><stop offset="1" stop-color="#0d3a44"/></linearGradient>
    <linearGradient id="${p}sand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a7656"/><stop offset="1" stop-color="#6a5a40"/></linearGradient></defs>
    <rect width="384" height="200" fill="url(#${p}sea)"/>
    <path d="M0 0 H170 Q150 50 172 100 Q150 150 168 200 H0Z" fill="url(#${p}sand)"><animate attributeName="d" values="M0 0 H170 Q150 50 172 100 Q150 150 168 200 H0Z;M0 0 H186 Q166 50 188 100 Q166 150 184 200 H0Z;M0 0 H170 Q150 50 172 100 Q150 150 168 200 H0Z" dur="5s" repeatCount="indefinite"/></path>
    <path d="M170 0 Q150 50 172 100 Q150 150 168 200" stroke="#e8f4f0" stroke-width="5" fill="none" opacity=".75"><animate attributeName="d" values="M170 0 Q150 50 172 100 Q150 150 168 200;M188 0 Q168 50 190 100 Q168 150 186 200;M170 0 Q150 50 172 100 Q150 150 168 200" dur="5s" repeatCount="indefinite"/></path>
    <g transform="translate(70 138)"><path d="M-16 0 q16 -22 32 0 q-16 10 -32 0z" fill="#f2c9b8"/><path d="M-10 -2 q10 -12 20 0 M-4 -4 q4 -8 8 0" stroke="#c88a7a" stroke-width="2" fill="none"/>
      <g stroke="#fff" stroke-width="2" fill="none" opacity=".8">${[10, 18, 26].map((rr, i) => `<path d="M${rr * .7} ${-rr * .7} a${rr} ${rr} 0 0 1 0 ${rr * 1.4}" transform="translate(14 -2) rotate(-45)"><animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="${i * .3}s" repeatCount="indefinite"/></path>`).join('')}</g></g>
    <g transform="translate(110 92)"><ellipse cx="0" cy="12" rx="16" ry="5" fill="#000" opacity=".2"/><ellipse cx="0" cy="0" rx="14" ry="9" fill="#f4f4f0"/><circle cx="12" cy="-6" r="6" fill="#f4f4f0"/><path d="M17 -6 l7 2 l-7 2z" fill="#e8b020"/><path d="M-12 -2 q-10 -10 4 -8" fill="#9aa"/>
      <animateTransform attributeName="transform" type="translate" values="110 92;116 90;110 92" dur="3s" repeatCount="indefinite"/></g>
    ${title('stochastic shore', { x: 372, y: 186, size: 28, anchor: 'end', font: SERIF, weight: 600, extra: 'font-style="italic"' })}`);
}

function bukvarium() {
  const p = id();
  // a glider of Cyrillic letters walking across a dark grid, four phases
  const phases = [[[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]], [[0, 1], [2, 1], [1, 2], [2, 2], [1, 3]], [[2, 1], [0, 2], [2, 2], [1, 3], [2, 3]], [[1, 1], [2, 2], [3, 2], [1, 3], [2, 3]]];
  const L = 'ЖЫЮЯБ';
  const cell = 20;
  const frames = phases.map((cells, k) => `<g opacity="0" fill="#3dff6a">${cells.map(([x, y], i) => `<text x="${x * cell + 10}" y="${y * cell + 16}" text-anchor="middle" ${MONO} font-size="20">${L[(i + k) % 5]}</text>`).join('')}<animate attributeName="opacity" values="${phases.map((_, j) => j === k ? 1 : 0).join(';')}" dur="2s" calcMode="discrete" repeatCount="indefinite"/></g>`).join('');
  const scatter = rnd(3);
  const bits = Array.from({ length: 26 }, () => `<text x="${scatter() * 384}" y="${70 + scatter() * 120}" ${MONO} font-size="16" fill="${['#ffd23a', '#3dd8ff', '#ff6ad8', '#3dff6a'][Math.floor(scatter() * 4)]}" opacity=".7">${'ИЭФЦШЁ'[Math.floor(scatter() * 6)]}<animate attributeName="opacity" values=".7;0;.7" dur="${1 + scatter() * 3}s" repeatCount="indefinite"/></text>`).join('');
  return svg(`<defs><pattern id="${p}g" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#06090a"/><path d="M20 0 V20 H0" stroke="#122018" fill="none"/></pattern></defs>
    <rect width="384" height="200" fill="url(#${p}g)"/>${bits}
    <g><g transform="translate(120 70)">${frames}</g><animateTransform attributeName="transform" type="translate" values="0 0;160 80" dur="16s" repeatCount="indefinite"/></g>
    <rect width="384" height="62" fill="#06090a" opacity=".75"/>
    ${'БУКВАРИУМ'.split('').map((c, i) => `<text x="${64 + i * 32}" y="46" text-anchor="middle" ${MONO} font-size="44" fill="${['#ff4a6a', '#ff9a3a', '#ffd23a', '#7aff4a', '#3dffb0', '#3dd8ff', '#6a8aff', '#c86aff', '#ff6ad8'][i]}">${c}</text>`).join('')}`);
}

function brezgiLv() {
  const p = id();
  return svg(`<defs><linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1d22"/><stop offset=".6" stop-color="#3a3f3a"/><stop offset="1" stop-color="#5a6a4a"/></linearGradient>
    <linearGradient id="${p}fog" x1="0" x2="1"><stop offset="0" stop-color="#dfe6e0" stop-opacity="0"/><stop offset=".5" stop-color="#dfe6e0" stop-opacity=".35"/><stop offset="1" stop-color="#dfe6e0" stop-opacity="0"/></linearGradient></defs>
    <rect width="384" height="200" fill="url(#${p}s)"/>
    <path d="M0 150 Q60 120 130 140 T260 132 T384 140 V200 H0Z" fill="#2e3f2a"/>
    <path d="M0 170 Q90 146 190 164 T384 160 V200 H0Z" fill="#3e5236"/>
    <g transform="translate(250 136)"><rect x="-26" y="-14" width="52" height="26" fill="#6a5440"/><path d="M-32 -12 L0 -34 L32 -12Z" fill="#3a2e24"/><rect x="-6" y="-4" width="10" height="16" fill="#2a2018"/><rect x="12" y="-8" width="8" height="8" fill="#ffd36b"><animate attributeName="opacity" values="1;.6;1" dur="2.6s" repeatCount="indefinite"/></rect>
      <path d="M14 -30 q4 -10 -2 -18 q8 6 4 18" fill="#888" opacity=".5"><animateTransform attributeName="transform" type="translate" values="0 0;3 -8" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".5;0" dur="4s" repeatCount="indefinite"/></path></g>
    <g transform="translate(96 150)">${[0, 16, 30].map((x) => `<path d="M${x} 0 l-8 0 l8 -26 l8 26z" fill="#1e2e1e"/>`).join('')}</g>
    <rect x="-384" y="128" width="768" height="30" fill="url(#${p}fog)"><animateTransform attributeName="transform" type="translate" values="0 0;384 0" dur="14s" repeatCount="indefinite"/></rect>
    <g transform="translate(192 24)"><path d="M-12 -12 H12 V4 Q12 14 0 18 Q-12 14 -12 4Z" fill="#2a5ab8" stroke="#e8c46a" stroke-width="1.5"/><path d="M-6 -4 l6 8 l6 -8 l-6 4z" fill="#e8c46a"/></g>
    ${title('BREZGI', { y: 76, size: 40, fill: '#ece6da', stroke: 'rgba(0,0,0,.4)', font: SERIF, weight: 600, spacing: 10 })}`);
}

// ---------------------------------------------------------------- the recursite collection
function dinoTrain() {
  const p = id();
  const track = 'M70 112 C70 60 314 60 314 112 C314 164 70 164 70 112Z';
  const car = (c, head, delay) => `<g><g transform="translate(-12 -9)"><rect width="24" height="16" rx="4" fill="${c}"/><circle cx="6" cy="17" r="3.5" fill="#333"/><circle cx="18" cy="17" r="3.5" fill="#333"/>${head}</g>
    <animateMotion dur="9s" begin="${delay}s" repeatCount="indefinite" rotate="auto" path="${track}"/></g>`;
  const neck = `<path d="M20 2 q8 -16 14 -14 q4 2 -2 4 q-6 2 -6 12" fill="#5ab04a"/><circle cx="31" cy="-10" r="1.2" fill="#222"/>`;
  return svg(`<defs><linearGradient id="${p}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ccf6a"/><stop offset="1" stop-color="#6aa848"/></linearGradient>${gloss(p)}</defs>
    <rect width="384" height="200" fill="#c8945a"/>
    <rect x="14" y="14" width="356" height="172" rx="16" fill="url(#${p}t)"/>
    <path d="${track}" stroke="#7a5232" stroke-width="16" fill="none"/>
    <path d="${track}" stroke="#a87a4a" stroke-width="3" fill="none" stroke-dasharray="3 7"/>
    <g fill="#3a8a3a"><path d="M180 100 l8 -18 l8 18z"/><path d="M200 106 l6 -14 l6 14z"/></g>
    <path d="M140 118 l18 -22 l18 22z" fill="#8a5a3a"/><path d="M152 103 l6 -7 l6 7z" fill="#e8501a"/>
    <ellipse cx="236" cy="112" rx="16" ry="9" fill="#5ab4e8"/>
    ${car('#e8483a', neck, 0)}${car('#f2b134', '', -.32)}${car('#4a8ae8', '', -.64)}${car('#9a5ae8', '', -.96)}
    ${glossRect(p)}
    ${title('Dino Train Table', { y: 44, size: 32, stroke: '#5a3a1a' })}`);
}

function snowGlobe() {
  const p = id(), r = rnd(9);
  const flakes = Array.from({ length: 30 }, () => { const x = 132 + r() * 120, d = (3 + r() * 4).toFixed(1), b = (-r() * 6).toFixed(1); return `<circle cx="${x}" cy="40" r="${1 + r() * 1.6}" fill="#fff"><animate attributeName="cy" values="30;170" dur="${d}s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="cx" values="${x};${x + 8};${x - 6}" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></circle>`; }).join('');
  return svg(`<defs><radialGradient id="${p}g" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#3a4a7a"/><stop offset="1" stop-color="#101830"/></radialGradient>
    <linearGradient id="${p}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3a6a"/><stop offset="1" stop-color="#0a1024"/></linearGradient>
    <clipPath id="${p}c"><circle cx="192" cy="100" r="64"/></clipPath></defs>
    <rect width="384" height="200" fill="url(#${p}bg)"/>
    <circle cx="192" cy="100" r="64" fill="url(#${p}g)"/>
    <g clip-path="url(#${p}c)">
      <g transform="translate(192 118)"><rect x="-34" y="-30" width="68" height="50" rx="8" fill="#c8c0b0"/><rect x="-28" y="-25" width="48" height="38" rx="5" fill="#7ad8ff"><animate attributeName="fill" values="#7ad8ff;#ff8ac8;#ffe07a;#8affa8;#7ad8ff" dur="4s" calcMode="discrete" repeatCount="indefinite"/></rect>
        <circle cx="26" cy="-14" r="3" fill="#555"/><circle cx="26" cy="-4" r="3" fill="#555"/><path d="M-10 -30 l-10 -16 M10 -30 l10 -16" stroke="#555" stroke-width="2"/></g>
      ${flakes}</g>
    <ellipse cx="174" cy="66" rx="22" ry="12" fill="#fff" opacity=".22" transform="rotate(-30 174 66)"/>
    <path d="M140 156 h104 l12 28 h-128z" fill="#7a4a2a"/><path d="M140 156 h104 l3 7 h-110z" fill="#a06a3a"/>
    ${title('snow-globe', { y: 38, size: 32 })}`);
}

function grotte() {
  const p = id();
  return svg(`<defs><radialGradient id="${p}t" cx=".3" cy=".55" r=".75"><stop offset="0" stop-color="#9a5a2a"><animate attributeName="stop-color" values="#9a5a2a;#b06a32;#8a5226;#9a5a2a" dur="1.3s" repeatCount="indefinite"/></stop><stop offset=".55" stop-color="#4a2a16"/><stop offset="1" stop-color="#1a0e08"/></radialGradient>
    <pattern id="${p}rough" width="23" height="19" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r="1.3" fill="#000" opacity=".3"/><circle cx="14" cy="11" r="1.8" fill="#000" opacity=".22"/><circle cx="20" cy="3" r="1" fill="#fff" opacity=".08"/><circle cx="8" cy="15" r="1.1" fill="#000" opacity=".28"/></pattern></defs>
    <rect width="384" height="200" fill="url(#${p}t)"/>
    <rect width="384" height="200" fill="url(#${p}rough)"/>
    <g fill="#c8402a" opacity=".85" transform="translate(170 88)">
      <path d="M0 22 q10 -18 34 -16 q20 -6 30 4 l10 -10 l2 12 q8 4 4 12 l-8 -2 l-6 18 l-6 0 l2 -14 q-20 6 -36 0 l-6 16 l-6 0 l2 -18 q-12 4 -16 -4z"/>
    </g>
    <g fill="#1a1008" opacity=".8" transform="translate(286 110)"><path d="M0 0 h40 M8 -6 v12 M20 -10 v20 M32 -6 v12" stroke="#1a1008" stroke-width="5" stroke-linecap="round"/></g>
    <g fill="#e8d0a0" opacity=".55" transform="translate(70 120) rotate(-14)"><path d="M0 0 q-2 -26 4 -28 q4 0 4 18 q2 -24 7 -24 q5 0 3 24 q4 -20 8 -19 q4 2 0 22 q6 -12 9 -10 q3 3 -6 20 q-8 16 -24 14 q-6 -2 -5 -17z"/></g>
    <g transform="translate(40 168)"><rect x="-4" y="-8" width="8" height="30" fill="#5a3a1a"/><path d="M0 -8 q-12 -14 0 -30 q12 16 0 30z" fill="#ffb03a"><animate attributeName="d" values="M0 -8 q-12 -14 0 -30 q12 16 0 30z;M0 -8 q-10 -16 2 -34 q10 18 -2 34z;M0 -8 q-12 -14 0 -30 q12 16 0 30z" dur=".7s" repeatCount="indefinite"/></path></g>
    ${title('GROTTE DU CALCUL', { y: 46, size: 26, fill: '#efe0c4', stroke: 'rgba(0,0,0,.5)', font: SERIF, weight: 600, spacing: 5 })}`);
}

function namedayParty() {
  const p = id(), r = rnd(21);
  const confetti = Array.from({ length: 22 }, () => { const x = r() * 384, d = (2.5 + r() * 3).toFixed(1), b = (-r() * 5).toFixed(1), c = ['#ff6a9a', '#ffd23a', '#6ad8ff', '#8aff6a', '#c88aff'][Math.floor(r() * 5)]; return `<rect x="${x}" y="-6" width="5" height="8" fill="${c}"><animate attributeName="y" values="-10;210" dur="${d}s" begin="${b}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="rotate" values="0 ${x} 0;360 ${x} 200" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></rect>`; }).join('');
  const candle = (x) => `<rect x="${x - 3}" y="110" width="6" height="18" fill="#fff"/><rect x="${x - 3}" y="114" width="6" height="3" fill="#6ad8ff"/><path d="M${x} 108 q-5 -6 0 -14 q5 8 0 14z" fill="#ffd23a"><animateTransform attributeName="transform" type="scale" values="1 1;1 1.15;1 1" dur=".5s" repeatCount="indefinite" additive="sum"/></path>`;
  return svg(`<defs><linearGradient id="${p}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3a7a"/><stop offset="1" stop-color="#2a2048"/></linearGradient></defs>
    <rect width="384" height="200" fill="url(#${p}r)"/>
    <ellipse cx="192" cy="178" rx="120" ry="22" fill="#f4eef8"/>
    <rect x="132" y="146" width="120" height="30" rx="6" fill="#ff9ac8"/><rect x="132" y="146" width="120" height="8" rx="4" fill="#fff"/>
    <rect x="148" y="126" width="88" height="24" rx="6" fill="#ffb8d8"/><rect x="148" y="126" width="88" height="6" rx="3" fill="#fff"/>
    ${[166, 184, 202, 220].map(candle).join('')}
    ${confetti}
    <path d="M40 22 Q192 70 344 22 L344 54 Q192 100 40 54Z" fill="#efe6f8" opacity=".95"/>
    <text x="192" y="58" text-anchor="middle" ${ROUND} font-weight="800" font-size="32" fill="url(#${p}rb)" stroke="#fff" stroke-width="5" paint-order="stroke">Sto lat!</text>
    <defs><linearGradient id="${p}rb" x1="0" x2="1"><stop offset="0" stop-color="#d81a6a"/><stop offset=".5" stop-color="#1a5ad8"/><stop offset="1" stop-color="#1a8a2a"/></linearGradient></defs>`);
}

function corporaCafe() {
  const p = id();
  const toks = ['the', 'of', 'and', 'to'];
  const drops = toks.map((t, i) => `<text x="248" y="90" text-anchor="middle" ${MONO} font-size="16" fill="#3a2a1a" opacity="0">${t}<animate attributeName="y" values="96;150;150" keyTimes="0;.22;1" dur="4.8s" begin="${i * 1.2}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.03;.22;1" dur="4.8s" begin="${i * 1.2}s" repeatCount="indefinite"/></text>`).join('');
  return svg(`<defs><pattern id="${p}tile" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#f4e6d0"/><path d="M12 2 l10 10 l-10 10 l-10 -10z" fill="#5a8ac8" opacity=".35"/></pattern></defs>
    <rect width="384" height="200" fill="url(#${p}tile)"/>
    <rect x="0" y="166" width="384" height="34" fill="#c8602a"/>
    <rect x="20" y="20" width="196" height="64" rx="4" fill="#e8302a" stroke="#8a1a14" stroke-width="3"/>
    <text x="118" y="70" text-anchor="middle" ${MONO} font-size="54" fill="#fff" letter-spacing="2">CORPORA</text>
    <g fill="#ffd23a">${[40, 80, 120, 160, 196].map((x, i) => `<circle cx="${x}" cy="28" r="2.5"><animate attributeName="opacity" values="1;.2;1" dur="1s" begin="${i * .2}s" repeatCount="indefinite"/></circle>`).join('')}</g>
    <rect x="30" y="96" width="176" height="64" rx="6" fill="#d8d8e0" stroke="#8a8a9a" stroke-width="2"/>
    ${['#c8302a', '#7a4a2a', '#e8b020', '#3a8a5a', '#8a5ac8'].map((c, i) => `<rect x="${40 + i * 33}" y="104" width="26" height="16" rx="2" fill="${c}"/><rect x="${50 + i * 33}" y="120" width="6" height="12" fill="#888"/>`).join('')}
    <rect x="226" y="40" width="44" height="54" rx="6" fill="#9ac8e8" stroke="#5a7a9a" stroke-width="2"/><text x="248" y="62" text-anchor="middle" ${MONO} font-size="16" fill="#2a4a6a">SMOL</text><rect x="244" y="86" width="8" height="10" fill="#777"/>
    ${drops}
    <path d="M226 150 h46 l-6 14 h-34z" fill="#fff" stroke="#c8c8c8" stroke-width="2"/><rect x="230" y="156" width="38" height="5" fill="#e8302a"/>
    ${title('Corpora Café', { x: 330, y: 194, size: 24, stroke: '#7a2a10' })}`);
}

function petroglyphs() {
  const p = id(), r = rnd(13);
  const stars = Array.from({ length: 26 }, () => `<circle cx="${r() * 384}" cy="${r() * 90}" r="${.7 + r()}" fill="#fff"><animate attributeName="opacity" values="1;.25;1" dur="${2 + r() * 3}s" repeatCount="indefinite"/></circle>`).join('');
  return svg(`<defs><linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1638"/><stop offset=".7" stop-color="#4a3a6a"/><stop offset="1" stop-color="#c88a6a"/></linearGradient>
    <linearGradient id="${p}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6a5a"/><stop offset="1" stop-color="#5a4038"/></linearGradient></defs>
    <rect width="384" height="200" fill="url(#${p}s)"/>${stars}
    <path d="M40 200 Q46 120 120 108 Q200 96 270 112 Q340 124 344 200Z" fill="url(#${p}r)"/>
    <g stroke="#e8d0b0" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85">
      <path d="M110 150 m0 0 a4 4 0 1 1 8 0 a8 8 0 1 1 -16 0 a12 12 0 1 1 24 0 a16 16 0 1 1 -32 0" stroke-dasharray="160" stroke-dashoffset="160"><animate attributeName="stroke-dashoffset" values="160;0;0;160" keyTimes="0;.4;.85;1" dur="6s" repeatCount="indefinite"/></path>
      <path d="M180 132 v24 m-10 -16 h20 m-16 30 l6 -14 l6 14 M180 128 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0"/>
      <path d="M230 160 q10 -26 30 -20 l8 -8 m-8 8 l2 20 m-22 -6 l-2 14 m24 -14 l4 14 M268 132 l6 -10 M264 130 l-2 -12"/>
    </g>
    <g transform="translate(330 172)"><path d="M-10 0 h20 l-4 -6 h-12z" fill="#3a2a22"/><path d="M0 -6 q-7 -9 0 -20 q7 11 0 20z" fill="#ffa03a"><animate attributeName="d" values="M0 -6 q-7 -9 0 -20 q7 11 0 20z;M0 -6 q-5 -11 1 -23 q6 12 -1 23z;M0 -6 q-7 -9 0 -20 q7 11 0 20z" dur=".8s" repeatCount="indefinite"/></path></g>
    ${title('FIRST MARKS', { y: 50, size: 32, fill: '#f2e8da', stroke: 'rgba(20,10,40,.5)', font: SERIF, weight: 600, spacing: 8 })}`);
}

function flockquarium() {
  const p = id();
  const fishPath = 'M60 110 C110 60 180 150 250 100 S330 80 320 120 S200 170 140 140 S40 150 60 110Z';
  const fish = Array.from({ length: 11 }, (_, i) => `<g><path d="M0 0 q6 -5 12 0 q-6 5 -12 0z M0 0 l-5 -4 v8z" fill="${['#ffb020', '#ff7a3a', '#ffe04a'][i % 3]}" transform="translate(${(i % 4) * 7 - 10} ${Math.floor(i / 4) * 7 - 7})"/><animateMotion dur="7s" begin="${-i * .12}s" repeatCount="indefinite" rotate="auto" path="${fishPath}"/></g>`).join('');
  return svg(`<defs><linearGradient id="${p}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ad0ff"/><stop offset=".6" stop-color="#1a7ac8"/><stop offset="1" stop-color="#0a3a7a"/></linearGradient>
    <linearGradient id="${p}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fafafa"/><stop offset="1" stop-color="#c8ccd2"/></linearGradient></defs>
    <rect width="384" height="200" fill="#16203a"/>
    <rect x="34" y="20" width="316" height="20" rx="10" fill="url(#${p}c)"/>
    <rect x="46" y="38" width="292" height="122" fill="url(#${p}w)"/>
    <g fill="#fff" opacity=".18">${[80, 150, 230, 290].map((x, i) => `<path d="M${x} 38 l20 0 l-40 122 l-14 0z"><animate attributeName="opacity" values=".1;.3;.1" dur="${3 + i}s" repeatCount="indefinite"/></path>`).join('')}</g>
    <g fill="#2a8a3a">${[[80, 160], [100, 160], [290, 160], [310, 160]].map(([x, y], i) => `<path d="M${x} ${y} q-8 -30 2 -50 q-2 26 6 50z"><animateTransform attributeName="transform" type="skewX" values="0;6;0" dur="${3 + i * .5}s" repeatCount="indefinite"/></path>`).join('')}</g>
    <path d="M46 150 q60 -10 140 0 t152 0 v10 h-292z" fill="#e8d8a8"/>
    ${fish}
    <rect x="30" y="158" width="324" height="28" rx="8" fill="url(#${p}c)"/>
    <rect x="300" y="166" width="30" height="12" rx="6" fill="#333"/>
    ${title('flockquarium', { x: 44, y: 180, size: 22, anchor: 'start', fill: '#3a4a5a', stroke: 'none' })}`);
}

function flyParadise() {
  const p = id();
  return svg(`<defs><radialGradient id="${p}d" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#f8f6ee"/><stop offset="1" stop-color="#d8d4c6"/></radialGradient>
    <linearGradient id="${p}gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <rect width="384" height="200" fill="url(#${p}d)"/>
    <ellipse cx="192" cy="178" rx="130" ry="20" fill="#7a4a2a"/>
    <ellipse cx="192" cy="166" rx="118" ry="24" fill="#4a7a32"/><ellipse cx="192" cy="160" rx="112" ry="20" fill="#6aa040"/>
    <ellipse cx="220" cy="160" rx="26" ry="8" fill="#9ad8e8" stroke="#e8e0d0" stroke-width="3"/>
    <ellipse cx="150" cy="156" rx="14" ry="5" fill="#c88a7a"/>
    <g stroke="#3a6a2a" stroke-width="2">${[120, 132, 262, 274, 290].map((x, i) => `<path d="M${x} 158 q2 -20 ${i % 2 ? 4 : -4} -30"/>`).join('')}</g>
    <circle cx="262" cy="126" r="5" fill="#ffd8e8"/><circle cx="118" cy="128" r="4" fill="#fff6a0"/>
    <path d="M70 174 Q60 20 192 18 Q324 20 314 174" fill="url(#${p}gl)" stroke="#fff" stroke-width="3" opacity=".9"/>
    <g><g><ellipse cx="0" cy="0" rx="4" ry="2.6" fill="#2a2a2a"/><circle cx="4" cy="-.5" r="1.8" fill="#a02a1a"/>
      <ellipse cx="-1" cy="-3" rx="4" ry="2" fill="#cce" opacity=".75"><animate attributeName="ry" values="2;.5;2" dur=".08s" repeatCount="indefinite"/></ellipse></g>
      <animateMotion dur="8s" repeatCount="indefinite" rotate="auto" path="M150 110 C120 70 200 50 230 90 S280 130 230 120 S160 140 150 110Z"/></g>
    ${title('fly-paradise', { y: 42, size: 30, fill: '#5a7a3a', stroke: '#fff' })}`);
}

function noosphere() {
  const p = id();
  const orbit = (rx, ry, rot, dur, n, c) => Array.from({ length: n }, (_, i) => `<g transform="rotate(${rot} 192 116)"><circle r="3" fill="${c}"><animateMotion dur="${dur}s" begin="${-i * dur / n}s" repeatCount="indefinite" path="M${192 - rx} 116 a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0"/></circle></g>`).join('');
  return svg(`<defs><radialGradient id="${p}e" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#5a7ac8"/><stop offset="1" stop-color="#1a2a5a"/></radialGradient>
    <linearGradient id="${p}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2036"/><stop offset="1" stop-color="#2c3150"/></linearGradient></defs>
    <rect width="384" height="200" fill="url(#${p}b)"/>
    <g fill="none" stroke="#8a9ad8" stroke-width="1" opacity=".35"><ellipse cx="192" cy="116" rx="96" ry="30" transform="rotate(-12 192 116)"/><ellipse cx="192" cy="116" rx="80" ry="40" transform="rotate(20 192 116)"/></g>
    <circle cx="192" cy="116" r="34" fill="url(#${p}e)"/>
    <path d="M176 100 q8 -6 14 2 q-4 10 -12 6z M196 120 q10 -4 14 6 q-6 8 -14 2z" fill="#7ac88a" opacity=".7"/>
    ${orbit(96, 30, -12, 7, 4, '#ffd8a0')}${orbit(80, 40, 20, 9, 3, '#a0e8ff')}
    ${title('NOOSPHERE', { y: 46, size: 32, fill: '#ece8f8', stroke: 'rgba(0,0,0,.3)', font: SERIF, weight: 600, spacing: 8 })}`);
}

function lavaHash() {
  const p = id();
  const lamp = (x, c1, c2, i) => `<g transform="translate(${x} 0)">
    <path d="M-16 58 L16 58 L24 150 L-24 150Z" fill="${c1}"/>
    <clipPath id="${p}c${i}"><path d="M-16 58 L16 58 L24 150 L-24 150Z"/></clipPath>
    <g clip-path="url(#${p}c${i})" fill="${c2}">
      <ellipse cx="-4" cy="140" rx="12" ry="10"><animate attributeName="cy" values="146;70;146" dur="${6 + i}s" repeatCount="indefinite"/><animate attributeName="rx" values="12;8;12" dur="${6 + i}s" repeatCount="indefinite"/></ellipse>
      <ellipse cx="6" cy="100" rx="8" ry="9"><animate attributeName="cy" values="80;140;80" dur="${5 + i * .7}s" repeatCount="indefinite"/></ellipse>
      <rect x="-30" y="140" width="60" height="12"/></g>
    <path d="M-10 36 L10 36 L16 58 L-16 58Z" fill="#c8c8d0"/><path d="M-24 150 L24 150 L14 178 L-14 178Z" fill="#c8c8d0"/>
    <path d="M-12 62 l4 0 l-8 80 l-4 0z" fill="#fff" opacity=".35"/></g>`;
  const pal = [['#ffe84a', '#a04ad8'], ['#5ad8ff', '#ff4a8a'], ['#ff8ad8', '#ffd23a'], ['#7aff6a', '#3a6ae8'], ['#ffb03a', '#e83a3a']];
  return svg(`<rect width="384" height="200" fill="#141418"/>
    <rect y="178" width="384" height="22" fill="#2a2a30"/>
    ${pal.map(([a, b], i) => lamp(52 + i * 70, a, b, i)).join('')}
    <rect x="0" y="0" width="384" height="34" fill="#141418" opacity=".85"/>
    <text x="192" y="196" text-anchor="middle" ${MONO} font-size="18" fill="#ff7a3a" letter-spacing="2">737D44EC<animate attributeName="opacity" values="1;.4;1" dur="1.2s" repeatCount="indefinite"/></text>
    ${title('Lava Hash', { y: 28, size: 26, fill: '#f0eae0', stroke: 'none', font: SERIF, weight: 600, extra: 'font-style="italic"' })}`);
}

function ancientClub() {
  const p = id();
  const beams = ['#ffd23a', '#ff6ad8', '#3dd8ff', '#8aff6a'].map((c, i) => `<path d="M192 64 L${60 + i * 90} 200 L${100 + i * 90} 200Z" fill="${c}" opacity=".18"><animateTransform attributeName="transform" type="rotate" values="${-20 + i * 5} 192 64;${20 - i * 5} 192 64;${-20 + i * 5} 192 64" dur="${5 + i * .9}s" repeatCount="indefinite"/></path>`).join('');
  return svg(`<defs><radialGradient id="${p}b" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#3a2a4a"/><stop offset="1" stop-color="#0e0a14"/></radialGradient>
    <radialGradient id="${p}sun" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#e8b030"/><stop offset="1" stop-color="#a06a10"/></radialGradient></defs>
    <rect width="384" height="200" fill="url(#${p}b)"/>
    ${beams}
    <g fill="#c8a040" opacity=".8">${[40, 344].map((x) => `<rect x="${x - 10}" y="40" width="20" height="160"/><rect x="${x - 16}" y="36" width="32" height="10"/>`).join('')}</g>
    <g transform="translate(192 64)"><path d="M-46 0 q-20 -6 -28 4 q14 -2 28 6z M46 0 q20 -6 28 4 q-14 -2 -28 6z" fill="#c8a040"/><circle r="20" fill="url(#${p}sun)"/>
      <g stroke="#fff6c8" stroke-width="1.5" opacity=".7"><path d="M-14 -6 h28 M-16 2 h32 M-12 10 h24"/><animateTransform attributeName="transform" type="translate" values="0 -4;0 4;0 -4" dur="1s" repeatCount="indefinite"/></g></g>
    <g transform="translate(150 150)" fill="#e8c46a"><g><circle cx="0" cy="-28" r="6"/><path d="M-6 -22 h12 l4 22 h-20z M-4 0 l-4 20 M4 0 l4 20" stroke="#e8c46a" stroke-width="4"/><path d="M-6 -18 l-12 -10 M6 -18 l12 -10" stroke="#e8c46a" stroke-width="3"><animate attributeName="d" values="M-6 -18 l-12 -10 M6 -18 l12 -10;M-6 -18 l-14 4 M6 -18 l14 4;M-6 -18 l-12 -10 M6 -18 l12 -10" dur=".9s" repeatCount="indefinite"/></path>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur=".45s" repeatCount="indefinite"/></g></g>
    <g transform="translate(234 150)" fill="#e8c46a"><g><circle cx="0" cy="-28" r="6"/><path d="M-6 -22 h12 l4 22 h-20z M-4 0 l-6 20 M4 0 l6 20" stroke="#e8c46a" stroke-width="4"/><path d="M-6 -18 l-10 12 M6 -18 l12 -14" stroke="#e8c46a" stroke-width="3"/>
      <animateTransform attributeName="transform" type="rotate" values="-6 0 20;6 0 20;-6 0 20" dur=".9s" repeatCount="indefinite"/></g></g>
    ${title('HERU-NEFER', { y: 184, size: 28, fill: '#e8c46a', stroke: '#1a0e08', font: SERIF, weight: 600, spacing: 6 })}`);
}

function soundscapade() {
  const p = id();
  const rings = [0, 1, 2, 3].map((i) => `<circle cx="96" cy="112" r="20" fill="none" stroke="#fff4e0" stroke-width="3"><animate attributeName="r" values="20;150" dur="4s" begin="${i}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="4s" begin="${i}s" repeatCount="indefinite"/></circle>`).join('');
  return svg(`<defs><linearGradient id="${p}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8a04a"/><stop offset=".55" stop-color="#a04a2a"/><stop offset="1" stop-color="#3a1a2a"/></linearGradient></defs>
    <rect width="384" height="200" fill="url(#${p}b)"/>
    <g fill="#2a1418" opacity=".55"><path d="M0 200 V140 l20 -20 v-30 h16 v30 l20 20 v60z"/><path d="M300 200 v-70 q20 -30 40 0 v70z"/><path d="M340 200 v-96 h10 v-10 h10 v10 h10 v96z"/></g>
    ${rings}
    <g transform="translate(96 112)"><path d="M-14 -10 h10 l14 -12 v44 l-14 -12 h-10z" fill="#fff4e0"/></g>
    <g stroke="#fff4e0" stroke-width="4" stroke-linecap="round">${Array.from({ length: 13 }, (_, i) => `<line x1="${180 + i * 12}" y1="112" x2="${180 + i * 12}" y2="112"><animate attributeName="y1" values="${112 - 6};${112 - 10 - (i * 37 % 30)};${112 - 6}" dur="${.6 + (i % 4) * .2}s" repeatCount="indefinite"/><animate attributeName="y2" values="${112 + 6};${112 + 10 + (i * 37 % 30)};${112 + 6}" dur="${.6 + (i % 4) * .2}s" repeatCount="indefinite"/></line>`).join('')}</g>
    ${title('Soundscapade', { y: 44, size: 34, fill: '#fff4e0', stroke: 'rgba(60,20,20,.5)', weight: 700 })}`);
}

function brezvax() {
  const p = id();
  const lines = ['brezvax!login: guest', 'Welcome to brezvax. 4.2BSD', '% rn net.general', '1  net.general  *Important*', '% tip arpa'];
  return svg(`<defs><radialGradient id="${p}c" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#0c2a14"/><stop offset="1" stop-color="#020a04"/></radialGradient></defs>
    <rect width="384" height="200" fill="url(#${p}c)"/>
    ${lines.map((l, i) => `<text x="20" y="${44 + i * 28}" ${MONO} font-size="24" fill="#4aff7a" opacity="0">${l}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${(i * .15).toFixed(2)};${(i * .15 + .01).toFixed(2)};.95;1" dur="8s" repeatCount="indefinite"/></text>`).join('')}
    <rect x="20" y="166" width="12" height="20" fill="#4aff7a"><animate attributeName="opacity" values="1;0" dur="1s" calcMode="discrete" repeatCount="indefinite"/></rect>
    <g opacity=".22">${Array.from({ length: 50 }, (_, i) => `<rect y="${i * 4}" width="384" height="1.4" fill="#000"/>`).join('')}</g>`);
}

// ---------------------------------------------------------------- registry
// home: where the channel's link lives. url: what Start opens.
export const APPS = {
  recursite:     { title: 'the recursite',        art: recursite,      url: 'https://recursite.brezgis.com',          home: 'brezgis.com' },
  notbell:       { title: 'notbell',              art: notbell,        url: 'https://notbell.brezgis.com',            home: 'brezgis.com' },
  annasarxiv:    { title: 'annas-arxiv',          art: annasArxiv,     url: 'https://library.brezgis.com',            home: 'brezgis.com' },
  honeypot:      { title: 'honeypot',             art: honeypot,       url: 'https://honeypot.brezgis.com',           home: 'brezgis.com', newTab: true },
  whattheph:     { title: 'what-the-ph',          art: whatThePh,      url: 'https://point.brezgis.com',              home: 'brezgis.com' },
  annagram:      { title: 'annagram',             art: annagram,       url: 'https://gram.brezgis.com',               home: 'brezgis.com' },
  shore:         { title: 'stochastic-shore',     art: stochasticShore, url: 'https://shore.brezgis.com',             home: 'brezgis.com' },
  bukvarium:     { title: 'bukvarium',            art: bukvarium,      url: 'https://automata.brezgis.com',           home: 'brezgis.com' },
  brezgilv:      { title: 'brezgi-lv',            art: brezgiLv,       url: 'https://lv.brezgis.com',                 home: 'brezgis.com' },
  snowglobe:     { title: 'snow-globe',           art: snowGlobe,      url: 'https://tv.brezgis.com',                 home: 'recursite' },
  dinotrain:     { title: 'dino-train-table',     art: dinoTrain,      url: 'https://brezgis.com/dino-train-table/',  home: 'recursite' },
  grotte:        { title: 'grotte-du-calcul',     art: grotte,         url: 'https://recursite.brezgis.com/lascaux/', home: 'recursite' },
  nameday:       { title: 'nameday-party',        art: namedayParty,   url: 'https://party.brezgis.com',              home: 'recursite' },
  corpora:       { title: 'corpora-cafe',         art: corporaCafe,    url: 'https://cafe.brezgis.com',               home: 'recursite' },
  petroglyphs:   { title: 'petroglyph-gallery',   art: petroglyphs,    url: 'https://gallery.brezgis.com',            home: 'recursite' },
  flock:         { title: 'flockquarium',         art: flockquarium,   url: 'https://flock.brezgis.com',              home: 'recursite' },
  fly:           { title: 'fly-paradise',         art: flyParadise,    url: 'https://fly.brezgis.com',                home: 'recursite' },
  noosphere:     { title: 'noosphere',            art: noosphere,      url: 'https://noosphere.brezgis.com',          home: 'recursite' },
  lavahash:      { title: 'lava-hash',            art: lavaHash,       url: 'https://hash.brezgis.com',               home: 'recursite' },
  ancientclub:   { title: 'ancient-club',         art: ancientClub,    url: 'https://club.brezgis.com',               home: 'recursite' },
  soundscapade:  { title: 'soundscapade',         art: soundscapade,   url: 'https://sound.brezgis.com',              home: 'recursite' },
  brezvax:       { title: 'brezvax',              art: brezvax,        url: 'https://recursite.brezgis.com/usenet/',  home: 'recursite' },
};
