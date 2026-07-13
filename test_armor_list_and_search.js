/* Field notes #14 + #15 verification.
   Pattern per test_harness_notes.md — load the real HTML in jsdom, drive the real UI.
   Run: NODE_PATH=/path/to/node_modules node test_armor_list_and_search.js [optional html path]

   #14 Carryable armor list: multiple armors can be carried, but only ONE is worn at a time —
        wearing another auto-unwears the first; remove drops an armor (and its contribution).
   #15 Search Everything: one box searches across every catalog (cards, gear, beastforms,
        conditions), groups results by category, and is mutually exclusive with other panels.
   (Add/wear/store/lossless + round-trip are covered by test_equip_toggle.js.)
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
const ev = e => win.eval(e);
const A = p => ev("App.active." + p);
const q = sel => doc.querySelector(sel);
const click = el => el.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
const change = el => el.dispatchEvent(new win.Event("change", { bubbles: true }));
const input = (el, v) => { el.value = v; el.dispatchEvent(new win.Event("input", { bubbles: true })); };

(function main() {
  console.log("# 0. A character is in Play");
  if (!ev("!!App.active")) ev("App.openPlay(App.roster[0])");
  ev("Sheet.render()");
  ok(ev("!!App.active") && !!q("#equip"), "active character with the Weapons & Armor panel");

  console.log("# 14. Carryable armor list — only one worn at a time");
  const n0 = A("armors.length");
  ok(n0 >= 1, "starts with at least one armor (" + n0 + ")");
  // add two distinct armors via the real 'add armor' picker
  function addArmorByName(name) {
    const s = q("#equip .srch[data-pick='aadd']");
    input(s, name);
    const row = q("#equip [data-pickadd='aadd']");
    if (row) click(row);
    return !!row;
  }
  const nameA = ev("EQUIP_A[0].n"), nameB = ev("EQUIP_A.find(function(a,i){return i>0 && a.n!==EQUIP_A[0].n;}).n");
  ok(addArmorByName(nameA), "added armor A (" + nameA + ")");
  ok(addArmorByName(nameB), "added armor B (" + nameB + ")");
  ok(A("armors.length") === n0 + 2, "armor list grew by 2 (" + A("armors.length") + ")");
  const idxA = n0, idxB = n0 + 1;

  // wear A
  let cb = q("#equip [data-armworn='" + idxA + "']"); cb.checked = true; change(cb);
  ok(ev("App.active.armors[" + idxA + "].worn") === true, "wearing A marks A worn");
  ok(ev("App.active.armors.filter(function(a){return a.worn;}).length") === 1, "exactly one armor worn");

  // wear B → A must auto-unwear
  cb = q("#equip [data-armworn='" + idxB + "']"); cb.checked = true; change(cb);
  ok(ev("App.active.armors[" + idxB + "].worn") === true, "wearing B marks B worn");
  ok(ev("App.active.armors[" + idxA + "].worn") === false, "wearing B auto-unwore A");
  ok(ev("App.active.armors.filter(function(a){return a.worn;}).length") === 1, "still exactly one armor worn");
  ok(A("armor.name") === nameB, "the worn-armor pointer follows B (" + A("armor.name") + ")");
  const scWithB = A("armorScore");

  // remove B (worn) → its contribution goes and nothing is worn
  const del = q("#equip [data-armworn='" + idxB + "']").closest(".row").querySelector("[data-armdel]");
  ok(!!del, "worn armor has a remove (✕) control");
  click(del);
  ok(A("armors.length") === n0 + 1, "removing an armor shrank the list");
  ok(ev("App.active.armors.filter(function(a){return a.worn;}).length") === 0, "removing the worn armor leaves nothing worn");
  ok(A("armorScore") !== scWithB || ev("App.active.armors.length") === 0, "Armor Score updated after removing the worn armor");

  console.log("# 15. Search Everything — one box across every catalog");
  const fbtn = q("#findBtn"), fbox = q("#findBox");
  ok(!!fbtn && !!fbox, "🔎 Search All button + panel exist");
  ok(fbox.style.display === "none", "panel starts hidden");
  click(fbtn);
  ok(fbox.style.display === "block", "panel opens on click");
  const fs2 = q("#findSearch");
  ok(!!fs2, "search box present");

  input(fs2, "potion");
  let html = q("#findResults").innerHTML;
  ok(/Consumable|Item/.test(html) && /potion/i.test(q("#findResults").textContent), "'potion' returns item/consumable matches");

  input(fs2, "dagger");
  ok(/Weapon/.test(q("#findResults").innerHTML), "'dagger' surfaces a Weapon category");

  input(fs2, "vulnerable");
  ok(/Condition/.test(q("#findResults").innerHTML), "'vulnerable' surfaces the Condition category");

  input(fs2, "predator");
  ok(/Beastform/.test(q("#findResults").innerHTML), "'predator' surfaces Beastform matches");

  // a broad term should span multiple categories with headers
  input(fs2, "a");
  const cats = (q("#findResults").innerHTML.match(/class="h3"/g) || []).length;
  ok(cats >= 2, "a broad query groups results under multiple category headers (" + cats + ")");

  input(fs2, "zzzznotathing");
  ok(/No matches anywhere/.test(q("#findResults").textContent), "a nonsense query reports no matches");

  console.log("# 15b. Mutual exclusion with other header panels");
  click(q("#marketBtn"));
  ok(q("#marketBox").style.display === "block" && q("#findBox").style.display === "none", "opening Market hides Search");
  click(q("#findBtn"));
  ok(q("#findBox").style.display === "block" && q("#marketBox").style.display === "none", "opening Search hides Market");

  console.log("\n" + (fail ? "FAILED " + fail + " / " : "ALL PASS ") + (pass + fail) + " checks (" + pass + " ok)");
  process.exit(fail ? 1 : 0);
})();
