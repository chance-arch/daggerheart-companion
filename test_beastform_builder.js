/* Field note #11 verification: Tier 3–4 Beastforms + the constructed-form builder.
   Pattern per test_harness_notes.md — load the real HTML in jsdom, drive the real UI.
   Run: NODE_PATH=/path/to/node_modules node test_beastform_builder.js [optional html path]

   Covers: the full 24-form list across four tiers; the tier filter; and the "engine"
   for the four build-your-own forms — Legendary Beast & Mythic Beast (Evolved templates:
   pick a lower-tier form, keep its kit, add flat bonuses) and Legendary Hybrid & Mythic
   Hybrid (combine N forms, then choose a budget of advantages and features from their
   union). Asserts assembled stats, Stress costs, budget/range validation, live-stat
   integration (Evasion/trait while transformed), and cleanup on drop/rest. Drives the
   pure engine (Sheet._build.*) AND a full DOM click-through of the Legendary Hybrid.
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

const ev = expr => win.eval(expr);
const sget = prop => ev("App.active._session." + prop);
const sset = (prop, val) => ev("App.active._session." + prop + "=" + JSON.stringify(val));
const bfActive = () => sget("bfActive");
const bfBuilt = () => sget("bfBuilt");
const stUsed = () => sget("stUsed");
const setStUsed = v => sset("stUsed", v);
const q = sel => doc.querySelector(sel);
const qa = sel => Array.from(doc.querySelectorAll(sel));
const click = el => el.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
const render = () => ev("Sheet.render()");
const form = key => ev("BEASTFORMS.find(function(b){return b.key==='" + key + "';})");

(function main() {
  console.log("# 0. A Beastform character is in Play");
  if (!ev("!!(App.active&&App.active.hasBeastform)")) {
    ev("(function(){var d=App.roster.find(function(c){return c.hasBeastform||/Druid/.test(c.className||'');});if(d)App.openPlay(d);})()");
  }
  ok(ev("!!(App.active&&App.active.hasBeastform)"), "active character has Beastform (" + ev("App.active&&App.active.name") + ")");
  const stMax = ev("App.active.stMax");

  console.log("# 1. The Beastform list is complete across four tiers");
  ok(ev("BEASTFORMS.length") === 25, "25 total beastforms", ev("BEASTFORMS.length"));
  const byTier = t => ev("BEASTFORMS.filter(function(b){return b.tier===" + t + ";}).length");
  ok(byTier(1) === 7 && byTier(2) === 5 && byTier(3) === 6 && byTier(4) === 7,
    "tier counts 7/5/6/7", [byTier(1), byTier(2), byTier(3), byTier(4)].join("/"));
  ["legendary-beast", "mythic-beast", "legendary-hybrid", "mythic-hybrid", "epic-hybrid"].forEach(k => {
    ok(!!form(k) && !!form(k).build, k + " exists and is a constructed template");
  });
  ok(ev("BEASTFORMS.filter(function(b){return !b.build;}).length") === 20, "20 simple (one-tap) forms");

  console.log("# 2. Tier filter exposes all four tiers");
  render();
  const tierBtns = qa("#bfTierSeg [data-bftier]").map(b => b.getAttribute("data-bftier"));
  ok(["1", "2", "3", "4", "all"].every(t => tierBtns.indexOf(t) >= 0), "filter has T1–4 and All", tierBtns.join(","));

  console.log("# 3. Legendary Beast — evolve a Tier 1 form (pure engine)");
  const base1 = form("pack-predator");
  let r = ev("Sheet._build.evolved('legendary-beast','pack-predator')");
  ok(r.ok, "builds from a Tier 1 base");
  ok(r.form.trait === base1.trait, "keeps the base trait (" + base1.trait + ")");
  ok(r.form.tb === base1.tb + 1, "trait bonus +1 (" + base1.tb + "→" + r.form.tb + ")");
  ok(r.form.ev === base1.ev + 2, "Evasion bonus +2 (" + base1.ev + "→" + r.form.ev + ")");
  ok(r.form.bonus === base1.bonus + 6, "damage +6 (" + base1.bonus + "→" + r.form.bonus + ")");
  ok(r.form.die === base1.die, "damage die unchanged (d" + r.form.die + ")");
  ok(r.form.feats.length === base1.feats.length, "retains the base form's features");
  const rBad = ev("Sheet._build.evolved('legendary-beast','powerful-beast')");
  ok(!rBad.ok, "rejects a Tier 2 base for the Legendary (Tier-1-only) template");

  console.log("# 4. Mythic Beast — evolve a Tier 2 form, die steps up (pure engine)");
  const base2 = form("powerful-beast"); // d10
  r = ev("Sheet._build.evolved('mythic-beast','powerful-beast')");
  ok(r.ok, "builds from a Tier 2 base");
  ok(r.form.tb === base2.tb + 2, "trait bonus +2");
  ok(r.form.ev === base2.ev + 3, "Evasion bonus +3");
  ok(r.form.bonus === base2.bonus + 9, "damage +9");
  ok(r.form.die === 12, "damage die steps up one size (d10→d12)", "d" + r.form.die);
  ok(ev("Sheet._build.evolved('mythic-beast','agile-scout').ok"), "also accepts a Tier 1 base");

  console.log("# 5. Legendary Beast transforms via one Stress and applies live stats");
  setStUsed(0); render();
  ev("Sheet._build.confirm && 0");
  // build + transform through the engine
  const lbForm = ev("Sheet._build.evolved('legendary-beast','pack-predator').form");
  ev("(function(){var f=Sheet._build.evolved('legendary-beast','pack-predator').form; App.active._session.stUsed=0; })()");
  // drive the real activate path (open → pick → confirm)
  ev("Sheet._build.open('legendary-beast')");
  ev("Sheet._build.pickBase('pack-predator')"); render();
  const st0 = stUsed();
  ev("Sheet._build.confirm()");
  ok(bfActive() === "built:legendary-beast", "transformed into the built Legendary Beast");
  ok(!!bfBuilt() && bfBuilt().template === "legendary-beast", "session tracks the built form");
  ok(stUsed() === st0 + 1, "assuming the Evolved form marked exactly 1 Stress");
  const baseEva = ev("App.active.evasion");
  ok(ev("Sheet._eff.eva()") === baseEva + lbForm.ev, "Evasion tile totals base + built bonus (" + (baseEva + lbForm.ev) + ")");
  ok(ev("Sheet._eff.trait('" + lbForm.trait + "')") === ev("App.active.traits['" + lbForm.trait + "']") + lbForm.tb,
    "effective " + lbForm.trait + " includes the built trait bonus");
  ok(/IN BEASTFORM/.test(q("#bfStatus").innerHTML), "top status banner shows the built form");

  console.log("# 6. Dropping the built form clears it and restores base stats");
  click(q("[data-bfdeact]"));
  ok(bfActive() == null && bfBuilt() == null, "drop cleared bfActive and bfBuilt");
  ok(ev("Sheet._eff.eva()") === baseEva, "Evasion returns to base after dropping");

  console.log("# 7. Legendary Hybrid — full DOM click-through (build from the grid)");
  setStUsed(0);
  click(q('[data-bftier="all"]')); // reveal Tier 3 so the hybrid card shows
  const buildBtn = q('[data-bfbuild="legendary-hybrid"]');
  ok(!!buildBtn, "Legendary Hybrid shows a Build… button in the grid");
  click(buildBtn);
  ok(!!q(".bfbuilder"), "builder panel opened");
  ok(!!q('[data-bfbbase="pack-predator"]') && !!q('[data-bfbbase="armored-sentry"]'), "eligible Tier 1–2 forms listed as chips");
  ok(!q('[data-bfbbase="great-predator"]'), "Tier 3 form NOT eligible for the Legendary Hybrid");
  // pick two forms
  click(q('[data-bfbbase="pack-predator"]'));
  click(q('[data-bfbbase="armored-sentry"]'));
  // advantage chips now come from the union of both forms
  ok(!!q('[data-bfbadv="attack"]') && !!q('[data-bfbadv="dig"]'), "advantage chips drawn from both forms' union");
  // choose 4 advantages
  ["attack", "sprint", "dig", "locate"].forEach(a => click(q('[data-bfbadv="' + a + '"]')));
  // a 5th advantage is refused (budget is 4)
  click(q('[data-bfbadv="track"]'));
  ok(ev("Sheet._build.state().adv.length") === 4, "advantage budget capped at 4", ev("Sheet._build.state().adv.length"));
  // choose 2 features
  ["Hobbling Strike", "Cannonball"].forEach(f => click(q('[data-bfbfeat="' + f + '"]')));
  ok(ev("Sheet._build.state().feats.length") === 2, "feature budget filled (2)");
  // preview should be valid; transform
  ok(ev("Sheet._build.current().ok"), "current selection assembles a valid form");
  const goBtn = q('[data-bfbgo]');
  ok(!!goBtn && /mark 2 Stress/.test(goBtn.textContent), "Transform button states the 2-Stress cost");
  const stH0 = stUsed();
  click(goBtn);
  ok(bfActive() === "built:legendary-hybrid", "transformed into the Legendary Hybrid");
  ok(stUsed() === stH0 + 2, "hybrid marked 2 Stress (1 base + 1 extra)", stUsed() - stH0);
  const hb = bfBuilt();
  ok(hb && hb.adv.length === 4 && hb.feats.length === 2, "built form carries the 4 chosen advantages + 2 features");
  ok(hb && hb.trait === "Strength" && hb.tb === 2 && hb.die === 10 && hb.bonus === 8, "hybrid uses its fixed stat line (Str +2, d10+8)");
  click(q("[data-bfdeact]"));

  console.log("# 8. Mythic Hybrid — three forms, 5 advantages + 3 features (pure engine)");
  const good = ev("Sheet._build.hybrid('mythic-hybrid',['pack-predator','winged-beast','mighty-lizard'],['attack','sprint','deceive','locate','sneak'],['Hobbling Strike','Bird\\'s-Eye View','Physical Defense'])");
  ok(good.ok, "valid Mythic Hybrid assembles", (good.errors || []).join("; "));
  ok(good.form.addStress === 2 && good.form.trait === "Strength" && good.form.die === 12 && good.form.bonus === 10, "fixed line Str +3-slot / d12+10, +2 Stress");
  const tooFew = ev("Sheet._build.hybrid('mythic-hybrid',['pack-predator','winged-beast'],['attack','sprint','deceive','locate','sneak'],['Hobbling Strike','Bird\\'s-Eye View','Physical Defense'])");
  ok(!tooFew.ok, "rejects fewer than 3 forms");
  const badAdv = ev("Sheet._build.hybrid('mythic-hybrid',['pack-predator','winged-beast','mighty-lizard'],['attack','sprint','deceive','locate','swim'],['Hobbling Strike','Bird\\'s-Eye View','Physical Defense'])");
  ok(!badAdv.ok, "rejects an advantage not offered by any chosen form (swim)");
  const badCount = ev("Sheet._build.hybrid('mythic-hybrid',['pack-predator','winged-beast','mighty-lizard'],['attack','sprint','deceive','locate'],['Hobbling Strike','Bird\\'s-Eye View','Physical Defense'])");
  ok(!badCount.ok, "rejects the wrong number of advantages (4, needs 5)");

  console.log("# 9. Rest clears a built form");
  setStUsed(0);
  ev("Sheet._build.open('mythic-hybrid')");
  ["pack-predator", "winged-beast", "mighty-lizard"].forEach(k => ev("Sheet._build.pickBase('" + k + "')"));
  ["attack", "sprint", "deceive", "locate", "sneak"].forEach(a => ev("Sheet._build.pickAdv('" + a + "')"));
  ["Hobbling Strike", "Bird's-Eye View", "Physical Defense"].forEach(f => ev("Sheet._build.pickFeat(" + JSON.stringify(f) + ")"));
  ev("Sheet._build.confirm()");
  ok(bfActive() === "built:mythic-hybrid", "Mythic Hybrid active before rest");
  click(q("#restBtn"));
  ok(bfActive() == null && bfBuilt() == null, "rest dropped the built form");

  console.log("# 10. Epic Hybrid — Mythic power, but ingredients gated to your tier or lower");
  const epic = form("epic-hybrid");
  ok(epic && epic.build.tierCap === true, "Epic Hybrid carries the tierCap flag");
  ok(epic && epic.build.pick === 3 && epic.build.advPick === 5 && epic.build.featPick === 3 && epic.build.addStress === 2,
    "matches the stronger (Mythic) budget: 3 forms, 5 adv, 3 feats, +2 Stress");
  ok(epic.trait === "Strength" && epic.tb === 3 && epic.die === 12 && epic.bonus === 10, "uses the Mythic stat line (Str +3 / d12+10)");
  const origTier = ev("Sheet.getCH().tier");

  // --- As a Tier 2 character: only Tier 1–2 forms are legal ingredients ---
  ev("Sheet.getCH().tier=2"); render();
  const t2ok = ev("Sheet._build.hybrid('epic-hybrid',['pack-predator','winged-beast','armored-sentry'],['attack','sprint','deceive','locate','dig'],['Hobbling Strike','Bird\\'s-Eye View','Armored Shell'])");
  ok(t2ok.ok, "Tier 2 char: a T1+T2+T2 combination is legal", (t2ok.errors || []).join("; "));
  const t2bad = ev("Sheet._build.hybrid('epic-hybrid',['pack-predator','winged-beast','mighty-lizard'],['attack','sprint','deceive','locate','sneak'],['Hobbling Strike','Bird\\'s-Eye View','Physical Defense'])");
  ok(!t2bad.ok && /above your tier/.test((t2bad.errors || []).join(" ")), "Tier 2 char: a Tier 3 ingredient (Mighty Lizard) is rejected");

  // UI: the builder only offers legal (≤ tier) forms as chips
  setStUsed(0);
  click(q('[data-bftier="all"]'));
  click(q('[data-bfbuild="epic-hybrid"]'));
  ok(!!q(".bfbuilder"), "Epic Hybrid builder opens");
  ok(!!q('[data-bfbbase="pack-predator"]') && !!q('[data-bfbbase="armored-sentry"]'), "Tier 1–2 forms selectable");
  ok(!q('[data-bfbbase="mighty-lizard"]') && !q('[data-bfbbase="great-predator"]'), "Tier 3 forms NOT offered at Tier 2");
  ok(!q('[data-bfbbase="terrible-lizard"]'), "Tier 4 forms NOT offered at Tier 2");
  ev("Sheet._build.close()");

  // --- As a Tier 4 character: Tier 3–4 forms become legal ingredients ---
  ev("Sheet.getCH().tier=4"); render();
  click(q('[data-bfbuild="epic-hybrid"]'));
  ok(!!q('[data-bfbbase="terrible-lizard"]'), "Tier 4 char: a Tier 4 form is now offered");
  ev("Sheet._build.close()");
  const t4ok = ev("Sheet._build.hybrid('epic-hybrid',['pack-predator','mighty-lizard','terrible-lizard'],['attack','sprint','sneak','track','deceive'],['Hobbling Strike','Physical Defense','Massive Stride'])");
  ok(t4ok.ok, "Tier 4 char: a T1+T3+T4 combination is legal", (t4ok.errors || []).join("; "));

  // Transform still marks the Mythic-equivalent 3 Stress (1 base + 2 extra)
  setStUsed(0);
  ev("Sheet._build.open('epic-hybrid')");
  ["pack-predator", "mighty-lizard", "terrible-lizard"].forEach(k => ev("Sheet._build.pickBase('" + k + "')"));
  ["attack", "sprint", "sneak", "track", "deceive"].forEach(a => ev("Sheet._build.pickAdv('" + a + "')"));
  ["Hobbling Strike", "Physical Defense", "Massive Stride"].forEach(f => ev("Sheet._build.pickFeat(" + JSON.stringify(f) + ")"));
  const epicSt0 = stUsed();
  ev("Sheet._build.confirm()");
  ok(bfActive() === "built:epic-hybrid", "Epic Hybrid transforms");
  ok(stUsed() === epicSt0 + 3, "Epic Hybrid marks 3 Stress (1 base + 2 extra)", stUsed() - epicSt0);
  click(q("[data-bfdeact]"));
  ev("Sheet.getCH().tier=" + origTier); render();

  console.log("\n" + (fail ? "FAILED " + fail + " / " : "ALL PASS ") + (pass + fail) + " checks (" + pass + " ok)");
  process.exit(fail ? 1 : 0);
})();
