/* Card mechanization — self-heal execution (Field note: domain-card deepening, step 1).
   Pattern per test_harness_notes.md — load the real HTML in jsdom, drive the real UI/engine.
   Run: NODE_PATH=/path/to/node_modules node test_card_heal.js [optional html path]

   The card corpus is already annotated to the interpreter's ceiling; the one faithful,
   no-fabrication win is teaching the interpreter to EXECUTE the self-targeted `heal`
   effects it previously only narrated (clear HP / Stress / Armor), plus storing dice-roll
   captures so "clear a number of HP equal to the result" resolves. This verifies:
     - coverage moves (three Guided cards become Interactive; ally/AoE heals stay Guided);
     - casting actually changes the player's own HP/Stress by the printed amount;
     - Unbreakable clears the *rolled* d6 amount (dice capture works).
   No card text/data was changed — only the engine now does what the text says.
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
const win = dom.window;
const ev = e => win.eval(e);
const cov = name => ev("cardCoverage(CARDS.find(function(c){return c.name===" + JSON.stringify(name) + ";}))");
const sget = p => ev("App.active._session." + p);
const sset = (p, v) => ev("App.active._session." + p + "=" + JSON.stringify(v));

(function main() {
  console.log("# 0. A character is in Play");
  if (!ev("!!(App.active)")) ev("(function(){App.openPlay(App.roster[0]);})()");
  ok(ev("!!App.active"), "active character (" + ev("App.active&&App.active.name") + ")");
  const hpMax = ev("App.active.hpMax"), stMax = ev("App.active.stMax");

  console.log("# 1. Coverage: self-heal cards are now Interactive; ally/AoE heals stay Guided");
  ok(cov("Battle-Hardened") === "interactive", "Battle-Hardened (self clear HP) → interactive", cov("Battle-Hardened"));
  ok(cov("Lean on Me") === "interactive", "Lean on Me (self clear Stress) → interactive", cov("Lean on Me"));
  ok(cov("Second Wind") === "interactive", "Second Wind (self clear Stress) → interactive", cov("Second Wind"));
  ok(cov("Life Ward") === "guided", "Life Ward (ally-only heal) stays guided", cov("Life Ward"));
  ok(cov("Healing Field") === "guided", "Healing Field (self+allies AoE) stays guided", cov("Healing Field"));
  const tally = ev("(function(){var t={interactive:0,guided:0,reference:0};CARDS.forEach(function(c){t[cardCoverage(c)]++;});return t;})()");
  ok(tally.interactive === 101 && tally.guided === 48 && tally.reference === 40,
    "totals now 101 / 48 / 40 (was 98 / 51 / 40)", JSON.stringify(tally));

  // Inject a card into the active loadout by name; returns its index. Casts ability 0.
  const inject = name => ev("(function(){var c=JSON.parse(JSON.stringify(CARDS.find(function(x){return x.name===" + JSON.stringify(name) + ";})));App.active.cards.push(c);var i=App.active.cards.length-1;App.active._session.cardState[i]={tokens:0,familiar:'',out:'',summon:'',wardEnded:false};Sheet.render();return i;})()");
  const castAbility0 = i => ev("Sheet._run(" + i + ",0)");

  console.log("# 2. Battle-Hardened — casting clears exactly 1 Hit Point (self)");
  sset("hope", 6); sset("hpRem", hpMax - 2); win.eval("Sheet.render()");
  let i = inject("Battle-Hardened");
  let hpBefore = sget("hpRem"), hopeBefore = sget("hope");
  castAbility0(i);
  ok(sget("hpRem") === hpBefore + 1, "hpRem rose by 1 (" + hpBefore + "→" + sget("hpRem") + ")");
  ok(sget("hope") === hopeBefore - 1, "spent its 1-Hope cost");

  console.log("# 3. Lean on Me — clears 2 Stress (self)");
  sset("stUsed", 4); win.eval("Sheet.render()");
  i = inject("Lean on Me");
  let stBefore = sget("stUsed");
  castAbility0(i);
  ok(sget("stUsed") === stBefore - 2, "stUsed fell by 2 (" + stBefore + "→" + sget("stUsed") + ")");

  console.log("# 4. Second Wind — clears 3 Stress (self)");
  sset("stUsed", 5); win.eval("Sheet.render()");
  i = inject("Second Wind");
  stBefore = sget("stUsed");
  castAbility0(i);
  ok(sget("stUsed") === stBefore - 3, "stUsed fell by 3 (" + stBefore + "→" + sget("stUsed") + ")");

  console.log("# 5. Swift Step — was Interactive but did nothing; now clears 1 Stress");
  ok(cov("Swift Step") === "interactive", "Swift Step classified interactive");
  sset("stUsed", 3); win.eval("Sheet.render()");
  i = inject("Swift Step");
  stBefore = sget("stUsed");
  castAbility0(i);
  ok(sget("stUsed") === stBefore - 1, "stUsed fell by 1 (" + stBefore + "→" + sget("stUsed") + ")");

  console.log("# 6. Unbreakable — clears HP equal to the rolled d6 (dice capture works)");
  sset("hpRem", 1); win.eval("Sheet.render()");
  i = inject("Unbreakable");
  hpBefore = sget("hpRem");
  castAbility0(i);
  const gained = sget("hpRem") - hpBefore;
  ok(gained >= 1 && gained <= 6 && sget("hpRem") <= hpMax, "hpRem rose by a d6 result (" + gained + ", capped at hpMax " + hpMax + ")");
  ok(gained > 0, "the @recover capture resolved to a real amount (not 0)");

  console.log("\n" + (fail ? "FAILED " + fail + " / " : "ALL PASS ") + (pass + fail) + " checks (" + pass + " ok)");
  process.exit(fail ? 1 : 0);
})();
