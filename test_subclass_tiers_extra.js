/* Field note #6 supplemental regression checks (beyond test_subclass_tiers.js):
   1. All 9 classes x L1 and L10 builds via the real wizard DOM path — no errors,
      foundation always present, subStage 0 at L1 / 2 at L10, thresholds = armor+level+bonus.
   2. Play-mode armor swap preserves subclass threshold bonuses (swapArmor path).
   3. Spellcast trait is set by subclass foundation and unchanged by spec/mastery.
   Run from the project folder: node test_subclass_tiers_extra.js [path-to-html]
   (defaults to daggerheart_companion.html; needs jsdom — see test_harness_notes.md) */
const fs = require("fs");
const { JSDOM } = require("jsdom");
const html = fs.readFileSync(process.argv[2] || "daggerheart_companion.html", "utf8");
let pass = 0, fail = 0;
function T(name, cond, detail) {
  if (cond) { pass++; console.log("  PASS  " + name); }
  else { fail++; console.log("  FAIL  " + name + (detail !== undefined ? "  --> " + detail : "")); }
}
const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/app.html", pretendToBeVisual: true });
const w = dom.window, doc = w.document;
w.addEventListener("error", e => console.log("WINDOW ERROR:", e.message));
const q = s => doc.querySelector(s);
function click(sel) { const el = q(sel); if (!el) throw new Error("no element: " + sel); el.click(); }
function setSelect(sel, v) { const el = q(sel); el.value = String(v); el.dispatchEvent(new w.Event("change", { bubbles: true })); }
function setInput(sel, v) { const el = q(sel); el.value = v; el.dispatchEvent(new w.Event("input", { bubbles: true })); }
const E = x => w.eval(x);

function buildViaDOM(cls, subIdx, level, name) {
  click('[data-tab="home"]'); click("#newCharBtn");
  click('.opt[data-cls="' + cls + '"]');
  click('[data-sub="' + subIdx + '"]');
  setSelect('[data-f2="level"]', level);
  click("#nextBtn");
  click('[data-anc="0"]'); click('[data-com="0"]'); click("#nextBtn");
  click('[data-tm="rec"]'); click("#nextBtn");
  click("#nextBtn");
  doc.querySelectorAll("[data-card]")[0].click();
  doc.querySelectorAll("[data-card]")[1].click();
  click("#nextBtn");
  setInput('[data-f="exp1"]', "Scout"); setInput('[data-f="exp2"]', "Sentry"); click("#nextBtn");
  click("#nextBtn");
  setInput('[data-f="name"]', name);
  click("#savePlayBtn");
  const ch = E("App.active");
  if (!ch || ch.name !== name) throw new Error("save failed for " + name);
  return ch;
}
const SUBSTAT = { "Unwavering": { maj: 1, sev: 1 }, "Unrelenting": { maj: 2, sev: 2 }, "Undaunted": { maj: 3, sev: 3 }, "Fleeting Shadow": { eva: 1 }, "Ascendant": { sev: 4 } };
function expectedBonus(feats) {
  const b = { maj: 0, sev: 0, eva: 0 };
  feats.forEach(f => { const s = SUBSTAT[f.name.replace(/ \([^)]*\)$/, "")]; if (s) { b.maj += s.maj || 0; b.sev += s.sev || 0; b.eva += s.eva || 0; } });
  return b;
}

console.log("== 1: all 9 classes, both subclasses where relevant, L1 and L10 builds ==");
const CLASSES = E("CLASSES");
Object.keys(CLASSES).forEach(cls => {
  [0, 1].forEach(si => {
    const subN = CLASSES[cls].subclasses[si].name;
    [1, 10].forEach(L => {
      try {
        const ch = buildViaDOM(cls, si, L, cls + si + "L" + L);
        const feats = ch.classFeats || [];
        const fb = expectedBonus(feats);
        const okFound = CLASSES[cls].subclasses[si].foundation.every(f => feats.some(x => x.name === f.name + " (" + subN + ")"));
        const wantStage = L === 1 ? 0 : 2;
        const okThr = ch.majorBase === ch.armor.maj + L + fb.maj && ch.severeBase === ch.armor.sev + L + fb.sev;
        T(cls + "/" + subN + " L" + L + ": foundation + subStage=" + wantStage + " + thresholds",
          okFound && (ch.subStage || 0) === wantStage && okThr,
          "found=" + okFound + " stage=" + ch.subStage + " maj " + ch.majorBase + " vs " + (ch.armor.maj + L + fb.maj) + " sev " + ch.severeBase + " vs " + (ch.armor.sev + L + fb.sev));
        // spellcast trait: matches the subclass's own spellcast at every level (tiers never change it)
        const scSub = CLASSES[cls].subclasses[si].spellcast || null;
        T(cls + "/" + subN + " L" + L + ": spellcast trait = " + scSub, (ch.spellcast || null) === (scSub || CLASSES[cls].spellcast || null), ch.spellcast);
      } catch (err) { T(cls + "/" + subN + " L" + L + " build", false, err.message); }
    });
  });
});

console.log("\n== 2: Play-mode armor swap preserves subclass threshold bonus ==");
{
  const ch = buildViaDOM("Guardian", 0, 5, "SwapTest"); // Stalwart L5: +1+2 thresholds
  const origArmor = ch.armor.name; // snapshot — ch is a live reference to App.active
  const EQUIP_A = E("EQUIP_A");
  // real UI path (field note #14): armor is a carryable list — add via the picker, then wear it.
  const srch = doc.querySelector('input.srch[data-pick="aadd"]');
  if (!srch) { T("armor add picker present in Play mode", false, "no .srch[data-pick=aadd]"); }
  else {
    srch.value = "Full Plate";
    srch.dispatchEvent(new w.Event("input", { bubbles: true }));
    const row = doc.querySelector('button.pickrow[data-pickadd="aadd"]');
    if (!row) { T("armor picker returns rows for 'Full Plate'", false, "no pickrow"); }
    else {
      row.click(); // adds Full Plate to the armor list (stored, not yet worn)
      const boxes = Array.from(doc.querySelectorAll('input[data-armworn]'));
      const box = boxes[boxes.length - 1]; // the just-added armor
      box.checked = true; box.dispatchEvent(new w.Event("change", { bubbles: true })); // wear it
      const after = E("App.active");
      const na = EQUIP_A.find(a => a.n === after.armor.name);
      T("armor actually worn via UI (" + after.armor.name + ")", /Full Plate/.test(after.armor.name) && after.armor.name !== origArmor, after.armor.name);
      T("worn armor thresholds keep +3 Stalwart bonus", after.majorBase === na.maj + 5 + 3 && after.severeBase === na.sev + 5 + 3,
        after.majorBase + "/" + after.severeBase + " vs " + (na.maj + 8) + "/" + (na.sev + 8));
    }
  }
}

console.log("\n== 3: level-up on a legacy character without stat-bonus feats (SEED Druid L4 -> L5) ==");
{
  // ensure leveling a character whose class has no numeric tier features changes nothing unexpectedly
  const ch = buildViaDOM("Druid", 0, 4, "Legacyish");
  const armM = ch.armor.maj;
  click('[data-tab="level"]');
  setSelect("#luTarget", 5);
  click("#luApply");
  const c5 = E("App.active");
  T("Druid L5: spec feature present, thresholds armor+5 (no numeric bonus)",
    (c5.classFeats || []).some(f => /Elemental Aura/.test(f.name)) && c5.majorBase === armM + 5 && c5.subStage === 1,
    "maj " + c5.majorBase + " stage " + c5.subStage);
}

console.log("\n================================");
console.log("EXTRA RESULT: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
