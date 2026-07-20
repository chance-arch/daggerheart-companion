/* Search Everything reference-browser overhaul (field note #16, 2026-07-19).
   Pattern per test_harness_notes.md — load the real HTML in jsdom, drive the real UI.

   The 🔎 Search All panel is now a full reference browser:
     - results container scrolls (max-height + overflow-y:auto);
     - empty box = browse mode listing every category;
     - the old dead "+N more — narrow your search" is replaced by a working
       per-category "Show all N" / "Show first 6" toggle;
     - every result row click-expands to the record's complete entry
       (full card text + stats, weapon/armor/item/beastform/condition details);
     - clicks inside an expanded entry do NOT collapse it (text can be selected).
*/
const fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const FILE = process.argv[2] || path.join(__dirname, "daggerheart_companion.html");
const HTML = fs.readFileSync(FILE, "utf8");

let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log("  ok  - " + label); }
  else { fail++; console.log("  FAIL - " + label + (extra != null ? "  [" + extra + "]" : "")); }
}

const dom = new JSDOM(HTML, { runScripts: "dangerously", url: "http://localhost/app.html", pretendToBeVisual: true });
const win = dom.window, doc = win.document;
const q = s => doc.querySelector(s);
const qa = s => doc.querySelectorAll(s);
const click = el => el.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
const type = (el, v) => { el.value = v; el.dispatchEvent(new win.Event("input", { bubbles: true })); };

(function main() {
  console.log("# 0. Panel opens; results container is scrollable");
  click(q("#findBtn"));
  ok(q("#findBox").style.display === "block", "panel open");
  const rs = q("#findResults");
  ok(/overflow-y:\s*auto/.test(rs.getAttribute("style")) && /max-height/.test(rs.getAttribute("style")),
    "results container scrolls (max-height + overflow-y:auto)", rs.getAttribute("style"));

  console.log("# 1. Empty box = browse mode across every category");
  ok(/Browsing everything/.test(rs.textContent), "browse-mode header shown");
  const catHeads = (rs.innerHTML.match(/class="h3"/g) || []).length;
  ok(catHeads === 7, "all 7 categories listed", catHeads);
  ok(qa("[data-findrow]").length >= 7 * 1, "rows rendered in browse mode");
  ok(!/narrow your search/.test(rs.textContent), "old dead '+N more — narrow your search' text is gone");

  console.log("# 2. 'Show all' expands a category fully; toggles back");
  const totalWeapons = win.eval("EQUIP_W.length");
  let btn = q('[data-findcat="Weapon"]');
  ok(!!btn && new RegExp("Show all " + totalWeapons).test(btn.textContent), "Show all button lists full weapon count", btn && btn.textContent);
  const rowsBefore = qa("[data-findrow]").length;
  click(btn);
  const rowsAfter = qa("[data-findrow]").length;
  ok(rowsAfter === rowsBefore + (totalWeapons - 6), "expanding Weapons adds every weapon row", rowsBefore + " -> " + rowsAfter);
  btn = q('[data-findcat="Weapon"]');
  ok(/Show first 6/.test(btn.textContent), "button now offers to collapse");
  click(btn);
  ok(qa("[data-findrow]").length === rowsBefore, "collapses back to the capped view");

  console.log("# 3. Click-to-expand a result shows the full entry (Corrosive Projectile)");
  type(q("#findSearch"), "corrosive projectile");
  let row = q("[data-findrow]");
  ok(!!row && /Corrosive Projectile/.test(row.textContent), "search finds the card");
  click(row);
  let detail = q("[data-finddetail]");
  ok(!!detail, "detail panel opened");
  ok(/d6\+4 magic damage/.test(detail.textContent), "full card text shown (audit-correct d6+4)");
  ok(/Recall cost/.test(detail.textContent) && /Level/.test(detail.textContent), "card stats shown (level, recall)");
  ok(/interactivity/i.test(detail.textContent), "in-app interactivity classification shown");

  console.log("# 4. Clicks inside the entry don't collapse it; row click does");
  click(detail);
  ok(!!q("[data-finddetail]"), "clicking inside the detail keeps it open");
  click(q("[data-findrow]"));
  ok(!q("[data-finddetail]"), "clicking the row again collapses it");

  console.log("# 5. Weapon entries carry complete stats");
  type(q("#findSearch"), "arcane gauntlets");
  click(q("[data-findrow]"));
  detail = q("[data-finddetail]");
  ok(!!detail && /Damage/.test(detail.textContent) && /d10\+3 magic/.test(detail.textContent), "damage line", detail && detail.textContent.slice(0, 120));
  ok(/Burden/.test(detail.textContent) && /Two-Handed/.test(detail.textContent), "burden shown");
  ok(/Trait/.test(detail.textContent) && /Strength/.test(detail.textContent), "trait shown");

  console.log("# 6. Typing a new term resets expansion state; nonsense still reports cleanly");
  type(q("#findSearch"), "vulnerable");
  ok(!q("[data-finddetail]"), "expanded entries reset on new term");
  type(q("#findSearch"), "zzzznothing");
  ok(/No matches anywhere/.test(q("#findResults").textContent), "no-match message intact");

  console.log(fail === 0 ? "ALL PASS " + (pass + fail) + " checks (" + pass + " ok)"
                         : "FAILURES: " + fail + " of " + (pass + fail));
  process.exit(fail === 0 ? 0 : 1);
})();
