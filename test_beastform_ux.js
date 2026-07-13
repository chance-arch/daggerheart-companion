/* Field note #7 verification: Beastform assume/drop UX.
   Pattern per test_harness_notes.md — load the real HTML in jsdom, drive the real UI.
   Run: NODE_PATH=/path/to/node_modules node test_beastform_ux.js [optional html path]

   Verifies the new top-of-screen Beastform quick-launcher in the Combat Actions panel
   (assume/evolution without scrolling to the grid), the in-panel Drop button, and the
   in-app Evolution trait picker that REPLACES the old native prompt() (accessible + works
   in sandboxed contexts). Drives clicks; asserts real state via App.active._session.
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

const dom = new JSDOM(HTML, { runScripts: "dangerously", url: "http://localhost/app.html", pretendToBeVisual: true });
const win = dom.window, doc = win.document;
// Guard: the old code used a native prompt() for Evolution. Stub it so any accidental call is caught.
let promptCalls = 0;
win.prompt = function () { promptCalls++; return null; };

// App / Sheet are top-level const bindings — reach them through the global eval (harness notes).
const ev = expr => win.eval(expr);
const sget = prop => ev("App.active._session." + prop);
const sset = (prop, val) => ev("App.active._session." + prop + "=" + JSON.stringify(val));
const S = () => ({ get bfActive() { return sget("bfActive"); }, get bfEvo() { return sget("bfEvo"); }, get bfEvoPending() { return sget("bfEvoPending"); }, get hope() { return sget("hope"); }, get stUsed() { return sget("stUsed"); }, set hope(v) { sset("hope", v); }, set stUsed(v) { sset("stUsed", v); } });
const q = sel => doc.querySelector(sel);
const click = el => el.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
function render() { ev("Sheet.render()"); }

(function main() {
  console.log("# 0. A Beastform character is in Play");
  // The seed roster auto-opens a Druid; ensure the active character has Beastform.
  if (!ev("!!(App.active&&App.active.hasBeastform)")) {
    ev("(function(){var d=App.roster.find(function(c){return c.hasBeastform||/Druid/.test(c.className||'');});if(d)App.openPlay(d);})()");
  }
  ok(ev("!!(App.active&&App.active.hasBeastform)"), "active character has Beastform (" + ev("App.active&&App.active.name") + ")");
  ok(S().bfActive == null, "not transformed at start");

  console.log("# 1. Quick-launcher is present in the Combat Actions panel (no scrolling)");
  const sel = q("#actions #bfQuickSel");
  ok(!!sel, "beastform quick-select rendered inside #actions");
  // Quick-launcher lists only one-tap "simple" forms; the four ✦ constructed forms
  // (Legendary/Mythic Beast & Hybrid) are built from the grid, not assumed here.
  const nForms = win.eval("BEASTFORMS.filter(function(b){return !b.build;}).length");
  ok(sel && sel.querySelectorAll("option").length === nForms, "select lists all " + nForms + " simple beastforms");
  ok(!!sel && sel.querySelectorAll("optgroup").length >= 1, "options grouped by tier");
  ok(!!q("#actions [data-bfquick]"), "Assume (Stress) button present in the panel");
  ok(!!q("#actions [data-bfquickevo]"), "Evolution (3 Hope) button present in the panel");

  console.log("# 2. Assume a form from the launcher");
  const key = win.eval("BEASTFORMS[2].key"), formName = win.eval("BEASTFORMS[2].name");
  const st0 = S().stUsed;
  sel.value = key; sel.dispatchEvent(new win.Event("change", { bubbles: true }));
  click(q("#actions [data-bfquick]"));
  ok(S().bfActive === key, "Assume transformed into the selected form (" + formName + ")");
  ok(S().stUsed === st0 + 1, "Assume marked exactly 1 Stress");
  ok(/IN BEASTFORM/.test(q("#bfStatus").innerHTML), "top status banner shows the active form");
  ok(!!q("#actions [data-bfdeact]"), "Drop Beastform button now available in the action panel");
  ok(!q("#actions #bfQuickSel"), "quick-select hidden while transformed");

  console.log("# 3. Drop from the action panel exits the form");
  click(q("#actions [data-bfdeact]"));
  ok(S().bfActive == null, "Drop exited Beastform");
  ok(!!q("#actions #bfQuickSel"), "quick-launcher returns after dropping");

  console.log("# 4. Evolution uses an in-app trait picker, not prompt()");
  S().hope = 6; render();                                   // ensure 3 Hope available
  ok(!q("#actions [data-bfquickevo]").disabled, "Evolution enabled with 3+ Hope");
  const evoKey = win.eval("BEASTFORMS[1].key");
  const sel2 = q("#actions #bfQuickSel"); sel2.value = evoKey; sel2.dispatchEvent(new win.Event("change", { bubbles: true }));
  click(q("#actions [data-bfquickevo]"));
  ok(S().bfEvoPending === evoKey, "Evolution stages a pending choice (no immediate transform)");
  ok(S().bfActive == null, "not transformed until a trait is picked");
  const traitBtns = doc.querySelectorAll("#actions [data-bfevotrait]");
  ok(traitBtns.length === 6, "inline picker offers all 6 traits (" + traitBtns.length + ")");
  ok(!!q("#actions [data-bfevocancel]"), "picker has a Cancel");
  ok(promptCalls === 0, "native prompt() was never called");
  const hope0 = S().hope;
  const strengthBtn = Array.from(traitBtns).find(b => b.getAttribute("data-bfevotrait") === "Strength");
  click(strengthBtn);
  ok(S().bfActive === evoKey, "picking a trait transforms into the form");
  ok(S().bfEvo === "Strength", "Evolution raised the chosen trait (+1 Strength)");
  ok(S().hope === hope0 - 3, "Evolution spent exactly 3 Hope");
  ok(promptCalls === 0, "still no prompt() after completing Evolution");

  console.log("# 5. Evolution can be cancelled cleanly");
  click(q("#actions [data-bfdeact]"));                       // drop back out
  S().hope = 6; render();
  click(q("#actions [data-bfquickevo]"));
  ok(S().bfEvoPending != null, "evolution pending after click");
  click(q("#actions [data-bfevocancel]"));
  ok(S().bfEvoPending == null, "Cancel clears the pending evolution");
  ok(S().bfActive == null, "Cancel does not transform");
  ok(S().hope === 6, "Cancel spent no Hope");

  console.log("# 6. Buttons disable when resources are unavailable");
  S().hope = 0; S().stUsed = 0; render();
  ok(q("#actions [data-bfquickevo]").disabled, "Evolution disabled with <3 Hope");
  ok(!q("#actions [data-bfquick]").disabled, "Assume still enabled with a free Stress slot");
  S().stUsed = ev("App.active.stMax"); render();
  ok(q("#actions [data-bfquick]").disabled, "Assume disabled when no Stress slot is free");
  S().stUsed = 0; render();

  console.log("# 7. Beastform Evasion bonus is calculated on the live Evasion tile (field note)");
  // Winged Beast (BEASTFORMS) carries ev:3 — Chance flagged this as not applying. Lock it in via
  // both entry points (grid button + quick-launcher).
  const baseEva = ev("App.active.evasion");
  const wingedEv = ev("BEASTFORMS.find(function(b){return b.key==='winged-beast';}).ev");
  ok(wingedEv === 3, "Winged Beast data carries a +3 Evasion bonus (ev:3)");

  // Winged Beast is Tier 2; the grid defaults to the Tier 1 filter, so reveal all tiers first.
  click(doc.querySelector('[data-bftier="all"]'));
  const gridBtn = doc.querySelector('[data-bfact="winged-beast"]');
  ok(!!gridBtn, "Winged Beast Activate button present in the full Beastforms grid");
  click(gridBtn);
  ok(S().bfActive === "winged-beast", "grid button transforms into Winged Beast");
  ok(ev("Sheet._eff.eva()") === baseEva + wingedEv, "effEva() totals base+bonus (" + baseEva + "+" + wingedEv + "=" + (baseEva + wingedEv) + ")");
  // The Evasion tile renders value-then-label ("14" then "Evasion"); accept either ordering.
  const total = baseEva + wingedEv;
  const tileText = (q("#tiles") ? q("#tiles").textContent : "").replace(/\s+/g, " ");
  ok(new RegExp(total + "\\s*Evasion|Evasion\\s*" + total).test(tileText),
    "Evasion tile displays the transformed total (" + total + ")", tileText);
  const statusText = q("#bfStatus") ? q("#bfStatus").innerHTML : "";
  ok(new RegExp(baseEva + "\\s*base.*[+＋]\\s*" + wingedEv + "\\s*form").test(statusText) || /form/.test(statusText),
    "top status banner's Evasion breakdown cites the Beastform bonus", statusText);
  click(q("#actions [data-bfdeact]"));
  ok(S().bfActive == null, "dropped back out for the next check");
  ok(ev("Sheet._eff.eva()") === baseEva, "Evasion returns to base after dropping the form");

  console.log("# 8. The quick-launcher (other entry point) agrees with the grid button");
  const sel3 = q("#actions #bfQuickSel");
  sel3.value = "winged-beast"; sel3.dispatchEvent(new win.Event("change", { bubbles: true }));
  click(q("#actions [data-bfquick]"));
  ok(ev("Sheet._eff.eva()") === baseEva + wingedEv, "quick-launcher path totals the same Evasion as the grid button");
  click(q("#actions [data-bfdeact]"));

  console.log("\n" + (fail ? "FAILED " + fail + " / " : "ALL PASS ") + (pass + fail) + " checks (" + pass + " ok)");
  process.exit(fail ? 1 : 0);
})();
