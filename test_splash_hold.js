// Splash-hold behavior (2026-07-15): the loading splash stays until the user
// dismisses it (click or Enter/Space/Escape). No auto-close.
// Run: NODE_PATH=<jsdom parent> node test_splash_hold.js [app.html]
const fs = require("fs");
const { JSDOM } = require("jsdom");

const FILE = process.argv[2] || "daggerheart_companion.html";
const HTML = fs.readFileSync(FILE, "utf8");

let ok = 0, bad = 0;
function check(name, cond) {
  if (cond) { ok++; console.log("  ok  " + name); }
  else { bad++; console.log("  FAIL " + name); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

function boot() {
  return new JSDOM(HTML, { runScripts: "dangerously", url: "http://localhost/app.html", pretendToBeVisual: true });
}

(async function main() {
  // --- 1. The splash HOLDS: no auto-close ---
  {
    const dom = boot(), doc = dom.window.document;
    const s = doc.getElementById("splash");
    check("splash element exists", !!s);
    check("splash visible at load (no .hide)", !s.classList.contains("hide"));
    const hint = doc.querySelector("#splash .sp-hint");
    check("dismiss hint present", !!hint && /tap anywhere/i.test(hint.textContent));
    await sleep(2500); // well past the old 1900ms auto-close
    check("splash still visible after 2.5s (auto-close removed)", !s.classList.contains("hide"));

    // --- click dismisses ---
    s.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    check("click adds .hide", s.classList.contains("hide"));
    await sleep(650); // inner 520ms display:none + notice
    check("splash display:none after fade", s.style.display === "none");
    check("first-launch notice shown after dismissal", doc.getElementById("notice").classList.contains("show"));
    dom.window.close();
  }

  // --- 2. Keyboard dismiss (Escape), and the key listener detaches after close ---
  {
    const dom = boot(), doc = dom.window.document, win = dom.window;
    const s = doc.getElementById("splash");
    await sleep(50);
    const escBefore = doc.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    check("Escape is consumed by the splash (preventDefault)", escBefore === false);
    check("Escape adds .hide", s.classList.contains("hide"));
    const spaceAfter = doc.dispatchEvent(new win.KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }));
    check("after close, Space is NOT swallowed (listener removed)", spaceAfter === true);
    dom.window.close();
  }

  // --- 3. Enter also dismisses ---
  {
    const dom = boot(), doc = dom.window.document, win = dom.window;
    const s = doc.getElementById("splash");
    await sleep(50);
    doc.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    check("Enter adds .hide", s.classList.contains("hide"));
    dom.window.close();
  }

  console.log(bad === 0 ? `ALL PASS ${ok + bad} checks (${ok} ok)` : `${bad} FAILED of ${ok + bad}`);
  process.exit(bad === 0 ? 0 : 1);
})();
