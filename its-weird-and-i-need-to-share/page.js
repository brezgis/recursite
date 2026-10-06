// recursite/its-weird-and-i-need-to-share/page.js — hand-written; linked into index.html by engine/engine.py.
// Keeps the epigraph's attribution line snug under its quote.
(function () {
  var e = document.querySelectorAll('.epigraph');
  if (e.length === 2) { e[0].style.marginBottom = '.2em'; }
})();
