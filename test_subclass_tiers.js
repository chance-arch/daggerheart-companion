/* Field note #6 verification harness — Subclass Foundation/Specialization/Mastery in the
   build + level-up engines, verified against SRD rules through real DOM/UI paths (jsdom).
   SRD ground truth:
     - Foundation features: from level 1 (character creation).
     - "Take an upgraded subclass card" is a Tier 3 / Tier 4 level-up option only
       (official level-up sheet; SRD text pairs it with the tier's multiclass option,
       and multiclassing starts at level 5). => Specialization at L5+, Mastery at L8+.
     - Permanent numeric feature effects (SRD daggerheart_classes.json, exactly five):
         Stalwart foundation  "Unwavering"      +1 both damage thresholds
         Stalwart spec        "Unrelenting"     +2 both damage thresholds
         Stalwart mastery     "Undaunted"       +3 both damage thresholds
         Nightwalker mastery  "Fleeting Shadow" +1 Evasion
         Winged Sentinel mastery "Ascendant"    +4 Severe threshold only
   Run from the project folder: node test_subclass_tiers.js [path-to-html]
   (defaults to daggerheart_companion.html; needs jsdom — see test_harness_notes.md) */
const fs = require("fs");
const { JSDOM } = require("jsdom");

const APP = process.argv[2] || "daggerheart_companion.html";
const SRD_CLASSES = "daggerheart_classes.json";
const html = fs.readFileSync(APP, "utf8");

let pass = 0, fail = 0;
function T(name, cond, detail) {
  if (cond) { pass++; console.log("  PASS  " + name); }
  else { fail++; console.log("  FAIL  " + name + (detail !== undefined ? "  --> " + detail : "")); }
}

function newApp() {
  const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/app.html", pretendToBeVisual: true });
  dom.window.addEventListener("error", e => console.log("WINDOW ERROR:", e.message));
  return dom.window;
}
const w = newApp();
const doc = w.document;
const $ = id => doc.getElementById(id);
const q = sel => doc.querySelector(sel);
function click(sel) { const el = q(sel); if (!el) throw new Error("no element: " + sel); el.click(); }
function setSelect(sel, value) {
  const el = q(sel); if (!el) throw new Error("no select: " + sel);
  el.value = String(value);
  el.dispatchEvent(new w.Event("change", { bubbles: true }));
}
function setInput(sel, value) {
  const el = q(sel); if (!el) throw new Error("no input: " + sel);
  el.value = value;
  el.dispatchEvent(new w.Event("input", { bubbles: true }));
}
const E = expr => w.eval(expr);

/* ---------- A. data integrity: embedded CLASSES/SUBUP vs SRD daggerheart_classes.json ---------- */
console.log("\n== A: embedded subclass tier data matches SRD daggerheart_classes.json ==");
{
  const srd = JSON.parse(fs.readFileSync(SRD_CLASSES, "utf8"));
  const CLASSES = E("CLASSES"), SUBUP = E("SUBUP");
  T("9 classes embedded", Object.keys(CLASSES).length === 9, Object.keys(CLASSES).length);
  let subCount = 0, mismatch = [];
  srd.classes.forEach(c => c.subclasses.forEach(s => {
    subCount++;
    const emb = (CLASSES[c.name] || { subclasses: [] }).subclasses.find(x => x.name === s.name);
    if (!emb) { mismatch.push(s.name + ": missing subclass"); return; }
    const f1 = (s.foundation || []).map(f => f.name + "|" + f.text).join("~");
    const f2 = (emb.foundation || []).map(f => f.name + "|" + f.text).join("~");
    if (f1 !== f2) mismatch.push(s.name + ": foundation text drift");
    const su = SUBUP[s.name];
    if (!su) { mismatch.push(s.name + ": missing in SUBUP"); return; }
    ["specialization", "mastery"].forEach(t => {
      const a = (s[t] || []).map(f => f.name + "|" + f.text).join("~");
      const b = (su[t] || []).map(f => f.name + "|" + f.text).join("~");
      if (a !== b) mismatch.push(s.name + " " + t + ": drift");
    });
  }));
  T("18 subclasses in SRD data", subCount === 18, subCount);
  T("all foundation/spec/mastery features match SRD verbatim", mismatch.length === 0, mismatch.join("; "));
}

/* ---------- DOM driver: build a character through the wizard ---------- */
function buildViaDOM(cls, subName, level, name) {
  click('[data-tab="home"]');
  click("#newCharBtn"); // resets builder, enters build mode
  // Step 0: class & level
  click('.opt[data-cls="' + cls + '"]');
  const si = E("CLASSES")[cls].subclasses.findIndex(s => s.name === subName);
  if (si < 0) throw new Error("no subclass " + subName);
  click('[data-sub="' + si + '"]');
  setSelect('[data-f2="level"]', level);
  click("#nextBtn");
  // Step 1: heritage — first ancestry (Clank: no stat side effects used here) + first community
  click('[data-anc="0"]');
  click('[data-com="0"]');
  click("#nextBtn");
  // Step 2: traits — recommended
  click('[data-tm="rec"]');
  click("#nextBtn");
  // Step 3: equipment — class defaults
  click("#nextBtn");
  // Step 4: two starting cards (panel re-renders after each click — re-query)
  doc.querySelectorAll("[data-card]")[0].click();
  doc.querySelectorAll("[data-card]")[1].click();
  click("#nextBtn");
  // Step 5: experiences
  setInput('[data-f="exp1"]', "Scout");
  setInput('[data-f="exp2"]', "Sentry");
  click("#nextBtn");
  // Step 6: advancement (recommended path pre-filled) — capture it
  const adv = JSON.parse(JSON.stringify(E("Builder.getB().adv")));
  click("#nextBtn");
  // Step 7: review — name it, then Save & Play (real save path)
  setInput('[data-f="name"]', name);
  click("#savePlayBtn");
  const ch = E("App.active");
  if (!ch || ch.name !== name) throw new Error("savePlayBtn did not produce active character");
  return { ch, adv };
}

/* DOM driver: level the active character up to target via Level-Up mode */
function levelViaDOM(targetLevel, tweak) {
  click('[data-tab="level"]');
  setSelect("#luTarget", targetLevel);
  if (tweak) tweak(); // optional manual overrides on the plan selects
  click("#luApply"); // onDone -> upsert + openPlay
  return E("App.active");
}

const featNames = ch => (ch.classFeats || []).map(f => f.name);
const armorOf = ch => ch.armor;

/* ---------- B. Builder: Guardian/Stalwart at L5 (Specialization tier) ---------- */
console.log("\n== B: build Guardian/Stalwart at level 5 — Specialization exactly, at L5, stats applied ==");
{
  const { ch, adv } = buildViaDOM("Guardian", "Stalwart", 5, "Bulwark");
  const names = featNames(ch);
  T("foundation feature on character (Unwavering)", names.includes("Unwavering (Stalwart)"), names.join(", "));
  T("specialization feature on character (Unrelenting)", names.includes("Unrelenting (Stalwart)"), names.join(", "));
  T("NO mastery at level 5 (Undaunted is Tier 4 / L8+)", !names.includes("Undaunted (Stalwart)"), names.join(", "));
  T("subStage recorded = 1 (specialization)", ch.subStage === 1, ch.subStage);
  const badEarly = [2, 3, 4].filter(L => adv[L] && (adv[L].a === "subclass" || adv[L].b === "subclass"));
  T("recommended path takes NO subclass upgrade at levels 2-4", badEarly.length === 0, "subclass picked at L" + badEarly.join(",L"));
  T("recommended path takes Specialization at level 5", adv[5] && (adv[5].a === "subclass" || adv[5].b === "subclass"), JSON.stringify(adv[5]));
  const arm = armorOf(ch);
  T("majorBase = armor " + arm.maj + " + level 5 + 1 (Unwavering) + 2 (Unrelenting)", ch.majorBase === arm.maj + 5 + 3, ch.majorBase + " vs " + (arm.maj + 8));
  T("severeBase = armor " + arm.sev + " + level 5 + 3", ch.severeBase === arm.sev + 5 + 3, ch.severeBase);
  // visible in Play mode (Sheet is mounted after savePlayBtn)
  const tiles = $("tiles").innerHTML;
  T("Play-mode threshold tiles show the feature-adjusted values", tiles.includes(">" + ch.majorBase + "<") && tiles.includes(">" + ch.severeBase + "<"), tiles.slice(0, 300));
  const featPanel = ($("feats") ? $("feats").innerHTML : doc.body.innerHTML);
  T("Play mode lists the Specialization feature text", featPanel.includes("Unrelenting"), "");
}

/* ---------- C. Builder: Guardian/Stalwart at L2 (Tier 2 — no upgrades legal) ---------- */
console.log("\n== C: build Guardian/Stalwart at level 2 — foundation only ==");
{
  const { ch, adv } = buildViaDOM("Guardian", "Stalwart", 2, "Squire");
  const names = featNames(ch);
  T("foundation present", names.includes("Unwavering (Stalwart)"), names.join(", "));
  T("no Specialization at level 2 (Tier 2 has no subclass-upgrade slot)", !names.includes("Unrelenting (Stalwart)"), names.join(", "));
  T("subStage = 0", (ch.subStage || 0) === 0, ch.subStage);
  T("recommended path L2 pick is not 'subclass'", !(adv[2] && (adv[2].a === "subclass" || adv[2].b === "subclass")), JSON.stringify(adv[2]));
  const arm = armorOf(ch);
  T("majorBase = armor + 2 + 1 (Unwavering only)", ch.majorBase === arm.maj + 2 + 1, ch.majorBase + " vs " + (arm.maj + 3));
  // dropdown gating: L2 advancement select must not offer the subclass upgrade
  click('[data-tab="build"]');   // builder state retained after Save & Play
  click('[data-go="6"]');        // jump back to the Advancement step via the rail
  const selA = q('select[data-adv="2"][data-kind="a"]');
  if (selA) {
    const hasSub = Array.from(selA.options).some(o => o.value === "subclass");
    T("L2 Advancement dropdown does not offer 'Upgrade subclass card'", !hasSub, Array.from(selA.options).map(o => o.value).join("|"));
  } else {
    T("L2 Advancement dropdown reachable", false, "select[data-adv=2][data-kind=a] not found");
  }
}

/* ---------- D. Level-Up mode: level 1 -> 4 -> 5 -> 7 -> 8 through tier boundaries ---------- */
console.log("\n== D: Level-Up engine — L1 Stalwart through tier boundaries via Level-Up mode ==");
{
  const { ch } = buildViaDOM("Guardian", "Stalwart", 1, "Pilgrim");
  T("L1 build: foundation only", featNames(ch).includes("Unwavering (Stalwart)") && !featNames(ch).includes("Unrelenting (Stalwart)"), featNames(ch).join(", "));
  const armM = ch.armor.maj, armS = ch.armor.sev;
  T("L1 majorBase = armor + 1 + 1 (Unwavering)", ch.majorBase === armM + 1 + 1, ch.majorBase);

  let c4 = levelViaDOM(4);
  T("L4: still no Specialization (Tier 2 throughout)", !featNames(c4).includes("Unrelenting (Stalwart)") && (c4.subStage || 0) === 0, "subStage=" + c4.subStage);
  T("L4 majorBase tracks +1/level only (armor+4+1)", c4.majorBase === armM + 4 + 1, c4.majorBase);

  let c5 = levelViaDOM(5);
  T("L5: Specialization appears on level-up (Unrelenting)", featNames(c5).includes("Unrelenting (Stalwart)"), featNames(c5).join(", "));
  T("L5: subStage = 1", c5.subStage === 1, c5.subStage);
  T("L5: mastery NOT taken", !featNames(c5).includes("Undaunted (Stalwart)"), "");
  T("L5 majorBase = armor+5+1+2 (spec stat applied on level-up)", c5.majorBase === armM + 5 + 3, c5.majorBase + " vs " + (armM + 8));

  let c7 = levelViaDOM(7);
  T("L7: still no Mastery (Tier 3 has one subclass slot, already used)", !featNames(c7).includes("Undaunted (Stalwart)") && c7.subStage === 1, "subStage=" + c7.subStage);

  let c8 = levelViaDOM(8);
  T("L8: Mastery appears at Tier 4 (Undaunted)", featNames(c8).includes("Undaunted (Stalwart)"), featNames(c8).join(", "));
  T("L8: subStage = 2", c8.subStage === 2, c8.subStage);
  T("L8 majorBase = armor+8+1+2+3", c8.majorBase === armM + 8 + 6, c8.majorBase + " vs " + (armM + 14));
  T("L8 severeBase = armor+8+6", c8.severeBase === armS + 8 + 6, c8.severeBase);
  // duplicate-add safety: feature not added twice
  const undauntedCount = featNames(c8).filter(n => n === "Undaunted (Stalwart)").length;
  T("mastery feature added exactly once", undauntedCount === 1, undauntedCount);
}

/* ---------- E. Manual override cannot take Mastery inside Tier 3 ---------- */
console.log("\n== E: manual plan picking subclass twice in Tier 3 is blocked by the engine ==");
{
  const { ch } = buildViaDOM("Guardian", "Stalwart", 4, "Vanguard");
  const c6 = levelViaDOM(6, () => {
    // recommended plan already takes subclass at L5; force a second subclass pick at L6
    setSelect('select[data-lu="6"][data-k="a"]', "subclass");
  });
  T("L6 after manual double-pick: subStage stays 1 (mastery locked until Tier 4)", c6.subStage === 1, "subStage=" + c6.subStage);
  T("L6: Undaunted not granted", !featNames(c6).includes("Undaunted (Stalwart)"), featNames(c6).join(", "));
  T("L6: majorBase has spec bonus only (armor+6+1+2)", c6.majorBase === c6.armor.maj + 6 + 3, c6.majorBase);
}

/* ---------- F. Winged Sentinel mastery: Severe-only +4 ---------- */
console.log("\n== F: Seraph/Winged Sentinel built at L10 — Ascendant +4 Severe only ==");
{
  const { ch } = buildViaDOM("Seraph", "Winged Sentinel", 10, "Aurelia");
  const names = featNames(ch);
  T("mastery present at L10 (Ascendant)", names.includes("Ascendant (Winged Sentinel)"), names.join(", "));
  const arm = ch.armor;
  T("severeBase includes +4 (armor+10+4)", ch.severeBase === arm.sev + 10 + 4, ch.severeBase + " vs " + (arm.sev + 14));
  T("majorBase does NOT include the Severe-only bonus", ch.majorBase === arm.maj + 10, ch.majorBase + " vs " + (arm.maj + 10));
}

/* ---------- G. Nightwalker mastery: +1 Evasion ---------- */
console.log("\n== G: Rogue/Nightwalker built at L8 — Fleeting Shadow +1 Evasion ==");
{
  const { ch, adv } = buildViaDOM("Rogue", "Nightwalker", 8, "Shade");
  const names = featNames(ch);
  T("mastery present at L8 (Fleeting Shadow)", names.includes("Fleeting Shadow (Nightwalker)"), names.join(", "));
  // independent evasion expectation: class base + armor eva + tower-shield penalty + evasion picks + 1 mastery
  const B = E("Builder.getB()"); // still holds this build (Save&Play doesn't reset)
  const cls = E("CLASSES").Rogue;
  const armEva = E("ARMORS")[B.armorIdx].eva || 0;
  const secN = E("SECONDARY")[B.secondaryIdx].n;
  let picks = 0;
  Object.values(adv).forEach(e => { if (e.a === "evasion") picks++; if (e.b === "evasion") picks++; });
  const expected = cls.evasion + armEva + (secN === "Tower Shield" ? -1 : 0) + picks + 1;
  T("evasion = base " + cls.evasion + " + armor " + armEva + " + picks " + picks + " + 1 (mastery) = " + expected, ch.evasion === expected, ch.evasion);
}

/* ---------- H. Druid spot check (Chance's table) ---------- */
console.log("\n== H: Druid/Warden of the Elements — spec at L5, text features carried ==");
{
  const { ch, adv } = buildViaDOM("Druid", "Warden of the Elements", 5, "Theronette");
  const names = featNames(ch);
  T("foundation Elemental Incarnation present", names.some(n => /Elemental Incarnation/.test(n)), names.join(", "));
  T("specialization Elemental Aura present at L5", names.some(n => /Elemental Aura/.test(n)), names.join(", "));
  T("mastery Elemental Dominion NOT present at L5", !names.some(n => /Elemental Dominion/.test(n)), "");
  T("spec taken at L5 in recommended path", adv[5] && (adv[5].a === "subclass" || adv[5].b === "subclass"), JSON.stringify(adv[5]));
  T("hasElement flag survives (Play integration)", ch.hasElement === true, ch.hasElement);
}

console.log("\n================================");
console.log("RESULT: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
