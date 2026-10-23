// Channel registry: the Disc Channel plus one channel per app (js/apps.js).
import { APPS } from './apps.js';
let uid = 0;

// Disc Channel: the spinning silver disc on white.
function discArt() {
  const disc = `<svg viewBox="0 0 120 120"><defs><radialGradient id="dg${uid}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fafafa"/><stop offset=".6" stop-color="#d4d4d4"/><stop offset="1" stop-color="#bdbdbd"/></radialGradient></defs>
    <circle cx="60" cy="60" r="58" fill="url(#dg${uid++})" stroke="#b9b9b9" stroke-width="2"/><circle cx="60" cy="60" r="44" fill="none" stroke="#e8e8e8" stroke-width="1"/>
    <circle cx="60" cy="60" r="18" fill="#ececec" stroke="#bdbdbd" stroke-width="2"/><circle cx="60" cy="60" r="7" fill="#fff" stroke="#c2c2c2" stroke-width="2"/></svg>`;
  return `<div class="disc-wrap" style="background:linear-gradient(180deg,#fff 0,#fff 54%,#efefef 56%,#f6f6f6 100%)">
    <div class="disc">${disc}</div><div class="disc reflect">${disc}</div></div>`;
}

export const CHANNELS = {
  disc: { title: 'Disc Channel', art: discArt, fixed: true, msg: 'Please insert a disc.' },
  ...APPS,
};

// The 48 slots (4 pages of 4x3), in reading order per page. brezvax hides in the very last slot.
export const DEFAULT_LAYOUT = [
  'disc', 'recursite', 'notbell', 'annasarxiv',
  'honeypot', 'whattheph', 'annagram', 'shore',
  'bukvarium', 'brezgilv', 'snowglobe', 'dinotrain',
  'grotte', 'nameday', 'corpora', 'petroglyphs',
  'flock', 'fly', 'noosphere', 'lavahash',
  'ancientclub', 'soundscapade', null, null,
  ...Array(23).fill(null), 'brezvax',
];
