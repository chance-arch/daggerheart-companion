/* Field note #9 verification: equip / unequip toggle for weapons & armor.
   Pattern per test_harness_notes.md — load the real HTML in jsdom, drive the real UI
   (equip checkboxes fire real change events), assert real state on App.active.

   Run: NODE_PATH=/path/to/node_modules node test_equip_toggle.js [optional html path]

   Verifies the active-modifier layer: gear contributes stats ONLY while equipped.
   - Migration: legacy characters (no `equipped` flags) load fully equipped, stats identical.
   - Weapons: unequip removes the Combat Actions attack row and its shield Armor-Score bonus.
   - Armor: unequip removes its Evasion / threshold / Armor-Score contribution; re-equip
     restores every stored stat EXACTLY (a lossless cycle — this is what guarantees the
     field-note-#6 SUBSTAT subclass bonuses baked into thresholds/Evasion survive).
   - Persistence: an unequipped flag round-trips through save/reload and is NOT reset by
     migration.
   - The printable sheet still builds.
*/
const fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const FILE = process.argv[2] || path.join(__dirname, "daggerheart_companion.html");
const HTML = fs.readFileSync(FILE, "utf8");

let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log("  ok  - " + label); }
  else { fail++; console.log("  FAIL - " + label + (extra ? "  [" + extra + "]" : "")); }
}

const dom = new JSDOM(HTML, { runScripts: "dangerously", url: "http://localhost/app.html", pretendToBeVisual: true });
const win = dom.window, doc = win.document;
win.prompt = function () { return null; };

const ev = expr => win.eval(expr);
const A = prop => ev("App.active." + prop);           // read a primitive field off the active char
const q = sel => doc.querySelector(sel);
const qa = sel => Array.from(doc.querySelectorAll(sel));
const change = el => el.dispatchEvent(new win.Event("change", { bubbles: true }));
const click = el => el.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
function render() { ev("Sheet.render()"); }

(function main() {
  console.log("# 0. A character is in Play (seed roster auto-opens one)");
  ok(ev("!!App.active"), "active character present (" + A("name") + ")");
  ok(ev("App.mode==='play'"), "in Play mode");
  ok(!!q("#equip"), "Weapons & Armor panel present");

  console.log("# 1. Migration — legacy character loads fully equipped, no `equipped` in source data");
  ok(ev("(App.active.weapons||[]).every(function(w){return w.equipped===true;})"),
     "every weapon migrated to equipped=true");
  ok(A("armor.equipped") === true, "armor migrated to equipped=true");
  // Baseline stats snapshot (these already include any armor + SUBSTAT contributions).
  const e0 = A("evasion"), m0 = A("majorBase"), s0 = A("severeBase"), sc0 = A("armorScore"),
        agi0 = A("traits.Agility");

  console.log("# 2. Weapon unequip removes its Combat Actions attack row");
  const nWpn = ev("App.active.weapons.length");
  const rows0 = qa("#actions [data-wpn]").length;
  ok(rows0 === nWpn, "all " + nWpn + " weapons show as attack rows while equipped (" + rows0 + ")");
  const wcb0 = q("#equip [data-wequip='0']");
  ok(!!wcb0, "weapon 0 has an equip checkbox in the panel");
  wcb0.checked = false; change(wcb0);
  ok(A("weapons[0].equipped") === false, "weapon 0 now stored (equipped=false)");
  ok(qa("#actions [data-wpn]").length === nWpn - 1, "unequipped weapon dropped from Combat Actions");
  // re-equip
  const wcb0b = q("#equip [data-wequip='0']");
  wcb0b.checked = true; change(wcb0b);
  ok(A("weapons[0].equipped") === true, "weapon 0 re-equipped");
  ok(qa("#actions [data-wpn]").length === nWpn, "attack row returns after re-equip");

  console.log("# 3. Shield weapon (+Armor Score) contributes only while equipped");
  ev("App.active.weapons.push({name:'Test Bulwark',type:'physical',trait:'Strength',range:'Melee',dn:1,dd:8,bonus:0,feature:'+2 to Armor Score',equipped:true})");
  render();
  const shieldIdx = ev("App.active.weapons.length-1");
  ok(A("armorScore") === sc0 + 2, "equipping a +2 shield raised Armor Score by 2", A("armorScore") + " vs " + (sc0 + 2));
  const scb = q("#equip [data-wequip='" + shieldIdx + "']");
  ok(!!scb, "shield weapon has an equip checkbox");
  scb.checked = false; change(scb);
  ok(A("armorScore") === sc0, "unequipping the shield dropped Armor Score back", A("armorScore") + " vs " + sc0);
  const scb2 = q("#equip [data-wequip='" + shieldIdx + "']");
  scb2.checked = true; change(scb2);
  ok(A("armorScore") === sc0 + 2, "re-equipping the shield restored the +2");
  // remove the test weapon, back to clean baseline
  ev("App.active.weapons.pop()"); render();
  ok(A("armorScore") === sc0, "Armor Score back to baseline after removing test weapon");

  console.log("# 4. Add + wear an armor with a nonzero Evasion modifier (carryable list — field note #14)");
  const evaIdx = ev("EQUIP_A.findIndex(function(a){return a.eva;})");
  ok(evaIdx >= 0, "found an armor with a nonzero Evasion modifier in the table");
  const evaName = ev("EQUIP_A[" + evaIdx + "].n");
  const asrch = q("#equip .srch[data-pick='aadd']");
  ok(!!asrch, "armor add search present");
  asrch.value = evaName; asrch.dispatchEvent(new win.Event("input", { bubbles: true }));
  const arow = q("#equip [data-pickadd='aadd']");
  ok(!!arow, "armor picker returned a row for '" + evaName + "'");
  click(arow); // adds to the carried list (stored, not yet worn)
  const armIdx = A("armors.length") - 1; // the just-added armor's stable index
  const acbWear = q("#equip [data-armworn='" + armIdx + "']");
  ok(!!acbWear, "the added armor has a worn/store checkbox");
  acbWear.checked = true; change(acbWear); // wear it (unwears any other)
  ok(A("armor.name") === evaName, "armor worn is " + evaName);
  const a_eva = A("armor.eva"), a_agi = A("armor.agi") || 0, a_maj = A("armor.maj"),
        a_sev = A("armor.sev"), a_score = A("armor.score");
  ok(a_eva !== 0, "worn armor has a nonzero Evasion contribution (" + a_eva + ")");
  // fresh snapshot with this armor worn
  const E = A("evasion"), M = A("majorBase"), S = A("severeBase"), SC = A("armorScore"),
        AG = A("traits.Agility");

  console.log("# 5. Storing the worn armor removes every armor contribution");
  const acb = q("#equip [data-armworn='" + armIdx + "']");
  ok(!!acb, "worn-armor checkbox present");
  acb.checked = false; change(acb);
  ok(A("armor.equipped") === false, "armor now stored (unequipped)");
  ok(A("evasion") === E - a_eva, "Evasion dropped the armor's Evasion mod", A("evasion") + " vs " + (E - a_eva));
  ok(A("traits.Agility") === AG - a_agi, "Agility dropped the armor's Agility mod");
  ok(A("majorBase") === M - a_maj, "Major threshold dropped the armor's Major", A("majorBase") + " vs " + (M - a_maj));
  ok(A("severeBase") === S - a_sev, "Severe threshold dropped the armor's Severe");
  ok(A("armorScore") === SC - a_score, "Armor Score dropped the armor's Score", A("armorScore") + " vs " + (SC - a_score));
  ok(A("majorBase") > 0, "unarmored Major threshold keeps its non-armor base (level + subclass/SUBSTAT bonus)");
  ok(/stored/.test(q("#equip").innerHTML), "panel flags the armor as stored");

  console.log("# 6. Re-wearing restores every stored stat EXACTLY (lossless — SUBSTAT-safe)");
  const acb2 = q("#equip [data-armworn='" + armIdx + "']");
  acb2.checked = true; change(acb2);
  ok(A("armor.equipped") === true, "armor re-worn");
  ok(A("evasion") === E, "Evasion restored exactly");
  ok(A("traits.Agility") === AG, "Agility restored exactly");
  ok(A("majorBase") === M, "Major threshold restored exactly");
  ok(A("severeBase") === S, "Severe threshold restored exactly");
  ok(A("armorScore") === SC, "Armor Score restored exactly");

  console.log("# 7. Persistence — an unequipped flag round-trips save/reload and survives migration");
  // unequip weapon 0, serialize the whole character, re-import as a fresh copy, re-open.
  const wcbP = q("#equip [data-wequip='0']");
  wcbP.checked = false; change(wcbP);
  const acb3 = q("#equip [data-armworn='" + armIdx + "']"); acb3.checked = false; change(acb3);   // also leave armor stored
  ev("window.__rt=JSON.parse(JSON.stringify(App.active));window.__rt.id='rt_equip_test';delete window.__rt._session;App.upsert(window.__rt);App.openPlay(App.roster.find(function(c){return c.id==='rt_equip_test';}));");
  ok(A("id") === "rt_equip_test", "reloaded the round-tripped copy");
  ok(A("weapons[0].equipped") === false, "unequipped weapon flag survived save/reload (migration didn't reset it)");
  ok(A("armor.equipped") === false, "unequipped armor flag survived save/reload");
  ok(A("armorScore") === ev("(function(){var b=0;(App.active.weapons||[]).forEach(function(w){if(w.equipped===false)return;var m=(w.feature||'').match(/\\+(\\d+)\\s*(?:to\\s*)?Armor/i);if(m)b+=+m[1];});return b;})()"),
     "reloaded unequipped armor contributes 0 Score (only shield bonus remains)");

  console.log("# 8. Printable sheet still builds");
  ev("App.printSheet()");
  const ps = q("#printSheet");
  ok(!!ps && ps.innerHTML.length > 500, "print sheet HTML built");
  ok(!!ps && ps.innerHTML.indexOf(A("name")) >= 0, "print sheet includes the character name");

  console.log("\n" + (fail ? "FAILED " + fail + " / " : "ALL PASS ") + (pass + fail) + " checks (" + pass + " ok)");
  process.exit(fail ? 1 : 0);
})();
