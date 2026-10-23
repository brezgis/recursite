// The Wii Message Board: one board per day. Each day gets one or two pinned quotes
// (seeded by the date, from the recursite's quote pages), your own memos, and, like
// the real Wii, a "Today's Accomplishments" note logging which channels you played.
import { CHANNELS } from './banners.js';

const $ = (s) => document.querySelector(s);
const LAUNCH_DAY = '2026-10-22';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ---------- storage (per viewer; every access guarded) ----------
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };

const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const shortDate = (d) => `${DAYS[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
const todayKey = () => dayKey(new Date());

// ---------- play log for Today's Accomplishments ----------
export function logStart(id) {
  const log = load('wii-mode-log', {}), k = todayKey();
  (log[k] ||= []).push({ id, start: Date.now(), end: null });
  store('wii-mode-log', log);
}
export function logEnd() {
  const log = load('wii-mode-log', {});
  for (const k of Object.keys(log)) for (const e of log[k]) if (!e.end) e.end = Date.now();
  store('wii-mode-log', log);
}
addEventListener('pagehide', logEnd);

// ---------- what's on a day's board ----------
let QUOTES = [];
fetch('data/quotes.json').then((r) => r.json()).then((q) => { QUOTES = q; refreshMailLight(); }).catch(() => { });

function hash(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.codePointAt(0), 16777619); return h >>> 0; }
const shortName = (from) => from.split(/[,(]/)[0].trim().replace(/\b\w/g, (c) => c.toUpperCase());

function notesFor(k) {
  const notes = [];
  if (k === LAUNCH_DAY) notes.push({ key: 'welcome', kind: 'wii', subject: 'Welcome to wii-mode', from: 'Wii',
    body: 'Every app from brezgis.com and the recursite now has a channel.\n\nPoint at one and press Ⓐ. While a channel is running, press the HOME button in the corner to come back here.\n\nA new quote gets pinned to this board every day.' });
  const log = load('wii-mode-log', {})[k];
  if (log && log.length) notes.push({ key: 'acc', kind: 'wii', subject: 'Today’s Accomplishments', from: 'Wii', log });
  if (QUOTES.length) {
    const h = hash(k), n = 1 + (h % 3 === 0 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const q = QUOTES[(h + i * 7919) % QUOTES.length];
      notes.push({ key: 'q' + i, kind: 'quote', subject: shortName(q.from), from: q.from, body: q.text, src: q.src });
    }
  }
  (load('wii-mode-memos', {})[k] || []).forEach((m, i) => notes.push({ key: 'm' + m.t, kind: 'memo', subject: m.text.split('\n')[0].slice(0, 22) || 'Memo', from: 'You', body: m.text, t: m.t }));
  return notes;
}

const readSet = () => new Set(load('wii-mode-read', []));
function markRead(k, note) { const s = readSet(); s.add(`${k}/${note.key}`); store('wii-mode-read', [...s]); refreshMailLight(); }
export function refreshMailLight() {
  const k = todayKey(), s = readSet();
  const unread = notesFor(k).some((n) => n.kind !== 'memo' && !s.has(`${k}/${n.key}`));
  $('#mailBtn').classList.toggle('blink', unread);
}
setInterval(refreshMailLight, 60000);

// ---------- rendering ----------
let viewKey = todayKey(), notes = [], openNote = null, calMonth = null;
const SPOTS = {
  1: [[928, 465]],
  2: [[700, 440], [1160, 460]],
  3: [[500, 450], [930, 420], [1360, 460]],
  4: [[700, 280], [1160, 300], [700, 590], [1160, 610]],
  5: [[500, 280], [930, 260], [1360, 290], [700, 600], [1160, 610]],
  6: [[500, 280], [930, 260], [1360, 290], [500, 600], [930, 590], [1360, 610]],
};
const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function renderBoard() {
  notes = notesFor(viewKey);
  const shown = notes.slice(-6), spots = SPOTS[shown.length] || [], read = readSet();
  $('#bdNotes').innerHTML = shown.map((n, i) => {
    const [x, y] = spots[i], rot = ((hash(viewKey + n.key) % 7) - 3) * .8;
    const unread = n.kind !== 'memo' && !read.has(`${viewKey}/${n.key}`);
    return `<div class="note ${n.kind}${unread ? ' unread' : ''}" data-hover="note" data-act="openNote" data-i="${notes.indexOf(n)}" style="left:${x - 178}px;top:${y - 125}px;--rot:${rot}deg">
      <div class="nhead">${n.kind === 'wii' ? '<span class="wiitag">Wii</span>' : ''}</div><div class="pin ${n.kind}"></div>
      <div class="subj">${esc(n.subject)}</div></div>`;
  }).join('') || '<div class="nothing">There are no messages.</div>';
  const d = fromKey(viewKey);
  $('#bdDate').textContent = shortDate(d);
  $('#bdR').hidden = viewKey === todayKey();
}

function fmtDur(ms) {
  const m = Math.max(1, Math.round(ms / 60000));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} hr ${m % 60} min`;
}

function letterHTML(n) {
  const d = fromKey(viewKey);
  let body;
  if (n.key === 'acc') {
    const tot = {};
    n.log.forEach((e) => { (tot[e.id] ||= { ms: 0, n: 0 }); tot[e.id].n++; tot[e.id].ms += (e.end || Date.now()) - e.start; });
    body = `<p class="lead">Here is what was played on the Wii today.</p><table class="acc">` + Object.entries(tot).map(([id, t]) =>
      `<tr><td class="ch">${esc(CHANNELS[id]?.title || id)}</td><td>${t.n}×</td><td>${fmtDur(t.ms)}</td></tr>`).join('') + '</table>';
  } else if (n.kind === 'quote') {
    body = `<p class="quote">“${esc(n.body)}”</p><p class="attr">— ${esc(n.from)}</p><p class="via">pinned from the recursite · ${esc(n.src)}</p>`;
  } else {
    body = esc(n.body).split('\n').map((l) => `<p>${l || '&nbsp;'}</p>`).join('');
  }
  return `<div class="lhead"><span class="licon ${n.kind}">${n.kind === 'memo' ? '✎' : n.kind === 'wii' ? 'Wii' : '❝'}</span>
    <div><div class="lfrom">${esc(n.kind === 'quote' ? 'the recursite' : n.from)}</div><div class="lsubj">${esc(n.subject)}</div></div>
    <div class="ldate">${shortDate(d)}</div></div><div class="lbody">${body}</div>`;
}

// ---------- actions (wired by data-act in main.js) ----------
export const boardActions = {
  bdPrev() { const d = fromKey(viewKey); d.setDate(d.getDate() - 1); viewKey = dayKey(d); return 'page-1'; },
  bdNext() { const d = fromKey(viewKey); d.setDate(d.getDate() + 1); if (viewKey !== todayKey()) viewKey = dayKey(d); return 'page1'; },
  openNote(el) {
    openNote = notes[+el.dataset.i];
    markRead(viewKey, openNote);
    $('#letterPaper').innerHTML = letterHTML(openNote);
    $('#lDelete').hidden = openNote.kind !== 'memo';
    $('#letter').classList.add('on');
    return 'letter';
  },
  lBack() { $('#letter').classList.remove('on'); return 'board'; },
  lDelete() {
    const memos = load('wii-mode-memos', {});
    memos[viewKey] = (memos[viewKey] || []).filter((m) => m.t !== openNote.t);
    store('wii-mode-memos', memos);
    $('#letter').classList.remove('on');
    return 'board';
  },
  bdMemo() {
    $('#memoText').value = '';
    $('#memoDate').textContent = shortDate(fromKey(viewKey));
    $('#memo').classList.add('on');
    setTimeout(() => $('#memoText').focus(), 50);
    return 'memo';
  },
  mCancel() { $('#memo').classList.remove('on'); $('#memoText').blur(); return 'board'; },
  mPost() {
    const text = $('#memoText').value.trim();
    $('#memo').classList.remove('on'); $('#memoText').blur();
    if (!text) return 'board';
    const memos = load('wii-mode-memos', {});
    (memos[viewKey] ||= []).push({ t: Date.now(), text });
    store('wii-mode-memos', memos);
    return 'posted';
  },
  bdCal() { calMonth = fromKey(viewKey); calMonth.setDate(1); renderCal(); $('#calendar').classList.add('on'); return 'calendar'; },
  cPrev() { calMonth.setMonth(calMonth.getMonth() - 1); renderCal(); return 'page-1'; },
  cNext() { calMonth.setMonth(calMonth.getMonth() + 1); renderCal(); return 'page1'; },
  cDay(el) { viewKey = el.dataset.day; $('#calendar').classList.remove('on'); return 'board'; },
  cClose() { $('#calendar').classList.remove('on'); return 'board'; },
};

function renderCal() {
  const y = calMonth.getFullYear(), m = calMonth.getMonth(), first = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate();
  const today = todayKey(), memos = load('wii-mode-memos', {}), log = load('wii-mode-log', {});
  let cells = DAYS.map((d) => `<div class="cdow">${d}</div>`).join('') + '<div></div>'.repeat(first);
  for (let d = 1; d <= n; d++) {
    const k = dayKey(new Date(y, m, d)), future = k > today;
    const extra = (memos[k]?.length ? 1 : 0) + (log[k]?.length ? 1 : 0);
    cells += `<div class="cday${k === today ? ' today' : ''}${k === viewKey ? ' sel' : ''}${future ? ' future' : ''}" ${future ? '' : `data-hover="cday" data-act="cDay" data-day="${k}"`}>
      <span>${d}</span>${future ? '' : `<i class="env${extra ? ' more' : ''}"></i>`}</div>`;
  }
  $('#calTitle').textContent = `${MONTHS[m]} ${y}`;
  $('#calGrid').innerHTML = cells;
  $('#cNext').hidden = dayKey(new Date(y, m + 1, 1)) > today;
}

export function openBoard() { viewKey = todayKey(); renderBoard(); }
