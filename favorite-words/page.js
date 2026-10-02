// recursite/favorite-words/page.js — hand-written; linked into index.html by engine/engine.py.
// "Words" in the title, "Word" (John 1:1) and "tongue" (the Shabaka Stone) are quietly clickable:
// each click speaks one of the favorite words, which ripples through the rainbow and fades back.
(function () {
  const css = `
    .speak { cursor: pointer; }
    .speak:hover, .speak:focus-visible { color: #0000cc; outline: none; }
    .ripple { display: inline-block; animation: lift 1.9s ease-out; }
    .ripple span { animation: hue 1.6s linear both; text-shadow: 0 0 6px currentColor; }
    @keyframes lift { 0% { transform: scale(1); } 18% { transform: scale(1.18); } 100% { transform: scale(1); } }
    @keyframes hue {
      0%   { color: #0000ee; text-shadow: none; }
      12%  { color: #ff0000; } 26% { color: #ff9900; } 40% { color: #d4b000; }
      54%  { color: #00aa55; } 68% { color: #0099ff; } 82% { color: #8800cc; }
      100% { color: #0000ee; text-shadow: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .ripple { animation: none; }
      .ripple span { animation: none; text-shadow: none; }
      .ripple { background: #ffff88; transition: background 1.5s; }
    }`;
  document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);

  // wrap the trigger words in the title and epigraphs
  const TRIGGER = /\b(Words?|tongue)\b/g;
  document.querySelectorAll("h1.welcome, .epigraph").forEach(p => {
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      if (!TRIGGER.test(n.data)) return; TRIGGER.lastIndex = 0;
      const frag = document.createDocumentFragment(); let last = 0, m;
      while ((m = TRIGGER.exec(n.data))) {
        frag.append(n.data.slice(last, m.index));
        const s = document.createElement("span");
        s.className = "speak"; s.textContent = m[0];
        s.tabIndex = 0; s.setAttribute("role", "button");
        frag.append(s); last = m.index + m[0].length;
      }
      frag.append(n.data.slice(last)); n.replaceWith(frag);
    });
  });

  const words = [...document.querySelectorAll(".blk .txt a")];
  let prev = null;
  function speak() {
    if (!words.length) return;
    let a; do { a = words[Math.floor(Math.random() * words.length)]; } while (words.length > 1 && a === prev);
    prev = a;
    const text = a.textContent;
    a.classList.remove("ripple"); void a.offsetWidth;          // restart if it's mid-ripple
    a.innerHTML = [...text].map((ch, i) => `<span style="animation-delay:${i * 70}ms">${ch}</span>`).join("");
    a.classList.add("ripple");
    clearTimeout(a._t);
    a._t = setTimeout(() => { a.classList.remove("ripple"); a.textContent = text; }, 1700 + text.length * 70);
  }
  document.querySelectorAll(".speak").forEach(s => {
    s.addEventListener("click", speak);
    s.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); speak(); } });
  });
})();
