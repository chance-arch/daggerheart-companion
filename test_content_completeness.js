/* Field note #2 verification: Content Coverage view.
   Pattern per test_harness_notes.md — load the real HTML in jsdom, drive the real UI.
   Run: NODE_PATH=/path/to/node_modules node test_content_completeness.js [optional html path]

   Verifies: the 📊 Coverage toolbar button + read-only panel toggle and mutual-exclude
   with the other header boxes; that the live-derived classification (interactive / guided /
   reference) is exactly what the spec predicate produces for all 189 cards; and that the
   rendered panel reports the domain + classes/subclasses summary honestly.
*/
const fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const FILE = process.argv[2] || path.join(__dirname, "daggerheart_companion.html");
const HTML = fs.readFileSync(FILE, "utf8");

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log("  ok  - " + label); }
  else { fail++; console.log("  FAIL - " + label); }
}
function boot(opts) {
  return new JSDOM(HTML, Object.assign({
    runScripts: "dangerously",
    url: "http://localhost/app.html",
    pretendToBeVisual: true
  }, opts || {}));
}
function click(win, el) { el.dispatchEvent(new win.MouseEvent("click", { bubbles: true })); }

// Independent re-implementation of the spec predicate (must match the app's cardCoverage).
function specResolves(effs) {
  return (effs || []).some(function (e) {
    if (!e) return false; var t = e.type;
    if (t === "damage") return !!e.dice;
    if (t === "reduceDamage") return !!e.dice;
    if (t === "roll") return true;
    if (t === "resource") return true;
    if (t === "summon") return true;
    if (t === "heal") return e.target === "self"; // self-heal is executed by the interpreter (clears HP/Stress/Armor)
    if (t === "branch") return specResolves(e.effects) || specResolves(e.onFail);
    if (t === "forceReaction") return specResolves(e.onFail);
    return false;
  });
}
function specCoverage(c) {
  var abs = ((c.mechanics && c.mechanics.abilities) || []);
  var inv = abs.filter(function (a) { return a && a.trigger && (a.trigger.kind === "action" || a.trigger.kind === "reaction"); });
  if (!inv.length) return "reference";
  return inv.some(function (a) { return specResolves(a.effects); }) ? "interactive" : "guided";
}

(function main() {
  const dom = boot(), win = dom.window, doc = win.document;

  console.log("# 1. Toolbar button + panel present, starts hidden, lazy body");
  const btn = doc.getElementById("covBtn"), box = doc.getElementById("covBox"), body = doc.getElementById("covBody");
  ok(!!btn && !!box && !!body, "covBtn, covBox, covBody all exist");
  ok(box.style.display === "none", "coverage panel starts hidden");
  ok(/loading/i.test(body.textContent), "body is a placeholder until opened");
  ok(typeof win.eval("typeof cardCoverage") === "string" && win.eval("typeof cardCoverage") === "function", "cardCoverage() defined in app scope");
  ok(win.eval("typeof coverageHTML") === "function", "coverageHTML() defined in app scope");

  console.log("# 2. Toggle behaviour");
  click(win, btn);
  ok(box.style.display === "block", "clicking Coverage opens the panel");
  ok(body.innerHTML.length > 500 && !/loading/i.test(body.textContent), "body populated on open");
  click(win, btn);
  ok(box.style.display === "none", "clicking again closes the panel");

  console.log("# 3. Mutual-exclude with the other header boxes");
  click(win, btn);                                  // open coverage
  const notesBtn = doc.getElementById("notesBtn"), notesBox = doc.getElementById("notesBox");
  click(win, notesBtn);                             // open notes
  ok(box.style.display === "none", "opening Notes hides Coverage");
  ok(notesBox.style.display === "block", "Notes now open");
  click(win, btn);                                  // reopen coverage
  ok(notesBox.style.display === "none", "opening Coverage hides Notes");
  ok(box.style.display === "block", "Coverage now open");

  console.log("# 4. Classification matches the spec for all 189 cards");
  const cards = win.eval("CARDS");
  ok(Array.isArray(cards) && cards.length === 189, "CARDS has 189 entries (" + cards.length + ")");
  const appCov = win.eval("CARDS.map(cardCoverage)");
  let mismatch = 0, buckets = { interactive: 0, guided: 0, reference: 0 }, badLabel = 0;
  cards.forEach(function (c, i) {
    const a = appCov[i], s = specCoverage(c);
    if (a !== s) { mismatch++; if (mismatch <= 3) console.log("     mismatch: " + c.name + " app=" + a + " spec=" + s); }
    if (!(a in buckets)) badLabel++; else buckets[a]++;
  });
  ok(mismatch === 0, "app cardCoverage == spec for every card (" + mismatch + " mismatches)");
  ok(badLabel === 0, "every card labelled with a known bucket");
  ok(buckets.interactive + buckets.guided + buckets.reference === 189, "buckets partition all 189 cards");
  console.log("     counts: interactive=" + buckets.interactive + " guided=" + buckets.guided + " reference=" + buckets.reference);
  ok(buckets.interactive === 101 && buckets.guided === 48 && buckets.reference === 40,
    "counts are 101 / 48 / 40 as computed from source data (self-heal cards now execute)");

  console.log("# 5. Spot-check known cards land in the right bucket");
  const covOf = n => { const c = cards.find(x => x.name === n); return c ? specCoverage(c) : "(missing)"; };
  ok(covOf("Rune Ward") === "interactive", "Rune Ward (rolls a ward die) → interactive");
  ok(covOf("Unleash Chaos") === "interactive", "Unleash Chaos (tokens + damage dice) → interactive");
  ok(covOf("Versatile Fighter") === "reference", "Versatile Fighter (passive) → reference");

  console.log("# 6. Rendered panel reports domains + honest classes/subclasses summary");
  const html = win.eval("coverageHTML()");
  ["Arcana", "Blade", "Bone", "Codex", "Grace", "Midnight", "Sage", "Splendor", "Valor"].forEach(function (d) {
    ok(html.indexOf(">" + d + "<") >= 0, "domain listed: " + d);
  });
  ok(/All 9 classes \/ 18 subclasses/.test(html), "states all 9 classes / 18 subclasses are playable");
  ["Unwavering", "Fleeting Shadow", "Ascendant"].forEach(function (fn) {
    ok(html.indexOf(fn) >= 0, "auto-applied numeric effect listed: " + fn);
  });
  ok(/Interactive/.test(html) && /Guided/.test(html) && /Reference/.test(html), "legend defines all three tiers");
  // the summary count of auto-applied effects must equal the 5 SUBSTAT entries
  const substatN = win.eval("Object.keys(SUBSTAT).length");
  const liN = (html.match(/<li>/g) || []).length;
  ok(liN === substatN && substatN === 5, "lists exactly the " + substatN + " SUBSTAT effects (" + liN + " <li>)");

  console.log("\n" + (fail ? "FAILED " + fail + " / " : "ALL PASS ") + (pass + fail) + " checks (" + pass + " ok)");
  process.exit(fail ? 1 : 0);
})();
