// Channels for Anna's apps (brezgis.com and the recursite). The banners live in js/wiiart.js:
// pre-rendered sprites layered as Wii-style picture panes. (The earlier flat SVG banners are
// kept in research/apps-svg-banners.js.)
import { WII_ART as W } from './wiiart.js';

// ---------------------------------------------------------------- registry
// home: where the channel's link lives. url: what Start opens.
export const APPS = {
  recursite:     { title: 'the recursite',        art: W.recursite,      url: 'https://recursite.brezgis.com',          home: 'brezgis.com' },
  notbell:       { title: 'notbell',              art: W.notbell,        url: 'https://notbell.brezgis.com',            home: 'brezgis.com' },
  annasarxiv:    { title: 'annas-arxiv',          art: W.annasArxiv,     url: 'https://library.brezgis.com',            home: 'brezgis.com' },
  honeypot:      { title: 'honeypot',             art: W.honeypot,       url: 'https://honeypot.brezgis.com',           home: 'brezgis.com', newTab: true },
  whattheph:     { title: 'what-the-ph',          art: W.whatThePh,      url: 'https://point.brezgis.com',              home: 'brezgis.com' },
  annagram:      { title: 'annagram',             art: W.annagram,       url: 'https://gram.brezgis.com',               home: 'brezgis.com' },
  shore:         { title: 'stochastic-shore',     art: W.stochasticShore, url: 'https://shore.brezgis.com',             home: 'brezgis.com' },
  bukvarium:     { title: 'bukvarium',            art: W.bukvarium,      url: 'https://automata.brezgis.com',           home: 'brezgis.com' },
  brezgilv:      { title: 'brezgi-lv',            art: W.brezgiLv,       url: 'https://lv.brezgis.com',                 home: 'brezgis.com' },
  snowglobe:     { title: 'snow-globe',           art: W.snowGlobe,      url: 'https://tv.brezgis.com',                 home: 'recursite' },
  dinotrain:     { title: 'dino-train-table',     art: W.dinoTrain,      url: 'https://brezgis.com/dino-train-table/',  home: 'recursite' },
  grotte:        { title: 'grotte-du-calcul',     art: W.grotte,         url: 'https://recursite.brezgis.com/lascaux/', home: 'recursite' },
  nameday:       { title: 'nameday-party',        art: W.namedayParty,   url: 'https://party.brezgis.com',              home: 'recursite' },
  corpora:       { title: 'corpora-cafe',         art: W.corporaCafe,    url: 'https://cafe.brezgis.com',               home: 'recursite' },
  petroglyphs:   { title: 'petroglyph-gallery',   art: W.petroglyphs,    url: 'https://gallery.brezgis.com',            home: 'recursite' },
  flock:         { title: 'flockquarium',         art: W.flockquarium,   url: 'https://flock.brezgis.com',              home: 'recursite' },
  fly:           { title: 'fly-paradise',         art: W.flyParadise,    url: 'https://fly.brezgis.com',                home: 'recursite' },
  noosphere:     { title: 'noosphere',            art: W.noosphere,      url: 'https://noosphere.brezgis.com',          home: 'recursite' },
  lavahash:      { title: 'lava-hash',            art: W.lavaHash,       url: 'https://hash.brezgis.com',               home: 'recursite' },
  ancientclub:   { title: 'ancient-club',         art: W.ancientClub,    url: 'https://club.brezgis.com',               home: 'recursite' },
  soundscapade:  { title: 'soundscapade',         art: W.soundscapade,   url: 'https://sound.brezgis.com',              home: 'recursite' },
  snridworld:    { title: 'snridworld',           art: W.snridworld,   url: 'https://snail.brezgis.com',              home: 'recursite' },
  brezvax:       { title: 'brezvax',              art: W.brezvax,        url: 'https://recursite.brezgis.com/usenet/',  home: 'recursite' },
};
