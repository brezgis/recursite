// Banners built the way real Wii channel banners are: a stack of textured picture panes
// with alpha (pre-rendered sprites in img/, made by tools/sprite.sh), each moved, scaled
// and faded with eased keyframes. Everything is sized in container units, so one banner
// serves both the 392x208 tile and the 1536x800 preview.

// bg: any CSS background. tint: one colour for the preview's blurred backdrop.
export function banner({ bg = '#fff', tint = '#f2f2f2', scan = false, cls = '' }, ...layers) {
  return `<div class="wb${scan ? ' scan' : ''} ${cls}" data-tint="${tint}" style="background:${bg}">${layers.join('')}</div>`;
}

// A sprite pane. x, y: its centre, in % of the banner. w: width in cqw (% of banner width).
// anim: a motion from style.css (bob, sway, drift, zoom, pulse, spin, crawl, fly, rise, pop, fade, flicker).
export function pane(name, { x = 50, y = 50, w = 40, anim = '', dur = 4, delay = 0, rot = 0, flip = false, z = 1, reflect = false, op = 1, amp = 1 } = {}) {
  const outer = `left:${x}%;top:${y}%;width:${w}cqw;z-index:${z};opacity:${op};transform:translate(-50%,-50%) rotate(${rot}deg)${flip ? ' scaleX(-1)' : ''}`;
  const inner = `--d:${dur}s;--dl:${delay}s;--amp:${amp}`;
  return `<div class="pn${reflect ? ' rf' : ''}" style="${outer}"><img class="${anim ? 'a-' + anim : ''}" style="${inner}" src="img/${name}.webp" alt="" draggable="false"></div>`;
}

// Any HTML in a positioned box (text overlays, CSS shapes), animated like a pane.
export function box(html, { x = 50, y = 50, w = 40, anim = '', dur = 4, delay = 0, z = 2, cls = '', style = '' } = {}) {
  return `<div class="pn ${cls}" style="left:${x}%;top:${y}%;width:${w}cqw;z-index:${z};transform:translate(-50%,-50%);${style}"><div class="${anim ? 'a-' + anim : ''}" style="--d:${dur}s;--dl:${delay}s">${html}</div></div>`;
}

// The channel name, in the Wii's rounded type. Light banners get Wii-blue letters on a white
// halo; dark ones get white letters with a soft blue-grey shadow.
export function wtitle(text, { x = 50, y = 22, size = 9, dark = false, color = '', font = '', z = 5, spacing = 0 } = {}) {
  const st = `left:${x}%;top:${y}%;font-size:${size}cqw;z-index:${z};letter-spacing:${spacing}em;${color ? `color:${color};` : ''}${font ? `font-family:${font};` : ''}`;
  return `<div class="wt${dark ? ' dk' : ''}" style="${st}">${text}</div>`;
}

// The diagonal glint that sweeps across so many Wii banners.
export const glint = (dur = 5, delay = 1) => `<div class="glint" style="--d:${dur}s;--dl:${delay}s"></div>`;

// Small twinkling sparkles scattered over an area (x0..x1, y0..y1 in %).
export function sparkles(n, { x0 = 0, x1 = 100, y0 = 0, y1 = 100, color = '#fff', size = 1.6, seed = 7 } = {}) {
  let s = seed;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: n }, () => `<i class="spk" style="left:${(x0 + r() * (x1 - x0)).toFixed(1)}%;top:${(y0 + r() * (y1 - y0)).toFixed(1)}%;--s:${(size * (.6 + r() * .8)).toFixed(2)}cqw;--d:${(1.6 + r() * 2.4).toFixed(2)}s;--dl:${(-r() * 4).toFixed(2)}s;color:${color}"></i>`).join('');
}
