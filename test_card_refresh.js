/* Card-copy refresh migration (2026-07-19 card audit).
   Pattern per test_harness_notes.md — load the real HTML in jsdom, drive the real boot.

   Saved characters store domain-card copies by value, so the audit's library
   corrections (e.g. Corrosive Projectile 6d4 → d6+4) never reached existing
   rosters. refreshCardCopies() now runs at boot (and on cloud adopt) and rewrites
   each stored copy's library fields from CARDS by name. This verifies:
     - a stale pre-audit copy in a saved roster is healed on boot (text + mechanics);
     - the healed roster is persisted back to localStorage (which also cloud-syncs);
     - runtime keys on the copy (tokens) survive the refresh;
     - card names not in the library (homebrew) are left untouched;
     - vault copies are refreshed too.
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

// A saved roster captured before the audit: stale Corrosive Projectile copy
// (wrong 6d4 text + 6d4 dice, wrong pre-fix recall on a copy of Enrapture in the
// vault), a runtime `tokens` key that must survive, and a homebrew card the
// library doesn't know.
const staleCorrosive = {
  name: "Corrosive Projectile", domain: "Sage", lvl: 3, recall: 1, dc: "#3f9b54",
  text: "Make a Spellcast Roll against a target within Far range. On a success, deal 6d4 magic damage using your Proficiency.",
  mechanics: { abilities: [{ id: "cast", label: "Cast", trigger: { kind: "action" }, effects: [
    { type: "damage", dice: { count: 6, sides: 4 }, damageType: "magic", scaleBy: "proficiency", target: "single" }] }] },
  tokens: 2
};
const staleEnrapture = {
  name: "Enrapture", domain: "Grace", lvl: 1, recall: 1, dc: "#b8b8ff",
  text: "stale text that should be replaced wholesale", mechanics: {}
};
const homebrewCard = {
  name: "Chance's Homebrew Zinger", domain: "Sage", lvl: 1, recall: 0, dc: "#000",
  text: "Homebrew — must not be touched.", mechanics: {}
};
const staleChar = {
  id: "stale1", name: "StaleTester", className: "Druid",
  cards: [staleCorrosive, homebrewCard], vault: [staleEnrapture]
};

const dom = new JSDOM(HTML, {
  runScripts: "dangerously", url: "http://localhost/app.html", pretendToBeVisual: true,
  beforeParse(window) {
    window.localStorage.setItem("dh_companion_roster_v1", JSON.stringify([staleChar]));
  }
});
const win = dom.window;
const ev = e => win.eval(e);

(function main() {
  console.log("# 0. App booted over a saved roster containing stale pre-audit card copies");
  ok(ev("!!App && Array.isArray(App.roster)"), "app booted");
  ok(ev("App.roster.some(c=>c.id==='stale1')"), "saved character survived boot");

  console.log("# 1. Stale loadout copy healed from the library on boot");
  const card = i => "App.roster.find(c=>c.id==='stale1').cards[" + i + "]";
  ok(ev(card(0) + ".text").includes("d6+4"), "text now says d6+4");
  ok(!ev(card(0) + ".text").includes("6d4"), "6d4 is gone");
  const dice = ev("(function find(o){if(!o||typeof o!=='object')return null;if(o.type==='damage')return o;var ks=Object.keys(o);for(var i=0;i<ks.length;i++){var r=find(o[ks[i]]);if(r)return r;}return null;})(" + card(0) + ".mechanics)");
  ok(dice && dice.dice && dice.dice.count === 1 && dice.dice.sides === 6 && dice.bonus === 4,
    "mechanics dice healed to 1d6 +4 (Proficiency scales the count)", JSON.stringify(dice && dice.dice));

  console.log("# 2. Runtime state and homebrew are preserved");
  ok(ev(card(0) + ".tokens") === 2, "runtime tokens key survived the refresh");
  ok(ev(card(1) + ".text") === "Homebrew — must not be touched.", "homebrew card untouched");

  console.log("# 3. Vault copies are refreshed too");
  const v0 = "App.roster.find(c=>c.id==='stale1').vault[0]";
  ok(ev(v0 + ".recall") === 0, "Enrapture recall healed to 0 (was 1)");
  ok(ev(v0 + ".text") !== "stale text that should be replaced wholesale", "Enrapture text replaced from library");

  console.log("# 4. Healed roster was persisted back to storage");
  const stored = JSON.parse(win.localStorage.getItem("dh_companion_roster_v1"));
  const sc = stored.find(c => c.id === "stale1");
  ok(sc.cards[0].text.includes("d6+4"), "localStorage copy is healed (cloud sync pushes this same save)");

  console.log(fail === 0 ? "ALL PASS " + (pass + fail) + " checks (" + pass + " ok)"
                         : "FAILURES: " + fail + " of " + (pass + fail));
  process.exit(fail === 0 ? 0 : 1);
})();
