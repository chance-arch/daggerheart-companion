/* Field note #1 verification: campaign notes section.
   Pattern per test_harness_notes.md — load the real HTML in jsdom, drive the real UI.
   Run: NODE_PATH=/path/to/node_modules node test_campaign_notes.js [optional path to html]
*/
const fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const FILE = process.argv[2] || path.join(__dirname, "daggerheart_companion.html");
const HTML = fs.readFileSync(FILE, "utf8");
const NOTES_KEY = "dh_campaign_notes_v1";
const ROSTER_KEY = "dh_companion_roster_v1";

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
function type(win, ta, text) {
  ta.value = text;
  ta.dispatchEvent(new win.Event("input", { bubbles: true }));
}
const wait = ms => new Promise(r => setTimeout(r, ms));

(async function main() {

  console.log("# 1. Fresh boot: UI present, panel toggles, autosave round-trips");
  {
    const dom = boot(), win = dom.window, doc = win.document;
    const ta = doc.getElementById("notesTa"), btn = doc.getElementById("notesBtn"), box = doc.getElementById("notesBox");
    ok(!!ta && !!btn && !!box, "notes textarea, button, and panel exist");
    ok(box.style.display === "none", "panel starts hidden");
    ok(ta.value === "", "textarea empty on first run");

    btn.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
    ok(box.style.display === "block", "clicking header Notes button opens the panel");

    // Notes button is in the always-visible header — reachable in Play and Roster modes
    ok(win.eval("App.mode") === "play", "app booted into Play mode (button reachable there)");
    doc.querySelector('#tabs button[data-tab="home"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
    ok(win.eval("App.mode") === "home", "switched to Roster mode");
    ok(box.style.display === "block" && doc.body.contains(btn), "panel + button still available from Roster");

    type(win, ta, "Session 3: the party owes Marlow two handfuls.");
    ok(doc.getElementById("notesStat").textContent === "writing…", "typing shows 'writing…' status");
    await wait(700); // debounce is 400ms
    ok(win.localStorage.getItem(NOTES_KEY) === "Session 3: the party owes Marlow two handfuls.",
      "debounced autosave wrote the text to " + NOTES_KEY);
    ok(doc.getElementById("notesStat").textContent === "saved ✓", "status stamps 'saved ✓'");

    // Own key, not inside the roster
    const roster = win.localStorage.getItem(ROSTER_KEY) || "";
    ok(!roster.includes("owes Marlow"), "notes text is NOT inside the roster key");

    // Roster save must not clobber notes
    win.eval('App.active=App.roster[0];');
    doc.getElementById("saveBtn").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
    ok(win.localStorage.getItem(NOTES_KEY) === "Session 3: the party owes Marlow two handfuls.",
      "roster Save button leaves notes key intact");

    // Character switching leaves notes alone
    const pick = doc.getElementById("charPick");
    const otherId = win.eval('(App.roster.find(c=>c.id!==App.active.id)||{}).id||""');
    pick.value = otherId;
    pick.dispatchEvent(new win.Event("change", { bubbles: true }));
    ok(win.eval("App.active.id") === otherId, "switched active character via picker");
    ok(ta.value === "Session 3: the party owes Marlow two handfuls." &&
       win.localStorage.getItem(NOTES_KEY) === "Session 3: the party owes Marlow two handfuls.",
      "character switch leaves notes (UI + storage) intact");

    // blur/change flushes without waiting for debounce
    type(win, ta, "Edited mid-session");
    ta.dispatchEvent(new win.Event("change", { bubbles: true }));
    ok(win.localStorage.getItem(NOTES_KEY) === "Edited mid-session", "change (blur) flushes save immediately");

    // Print sheet must not contain campaign notes
    const printHTML = win.eval("buildPrintHTML(App.active)");
    ok(!printHTML.includes("Edited mid-session"), "printable sheet does NOT contain campaign notes");
    ok(!doc.getElementById("printSheet").contains(box), "notes panel lives outside #printSheet");

    // Opening Export closes Notes (box exclusivity, matches existing header-box pattern)
    doc.getElementById("expBtn").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
    ok(box.style.display === "none", "opening Export closes the Notes panel");
    dom.window.close();
  }

  console.log("# 2. Reload: notes hydrate from their own key");
  {
    const dom = boot({
      beforeParse(win) { win.localStorage.setItem(NOTES_KEY, "Persisted from last session"); }
    });
    const doc = dom.window.document;
    ok(doc.getElementById("notesTa").value === "Persisted from last session",
      "textarea pre-fills from " + NOTES_KEY + " on boot");
    // Deleting every character must not touch notes
    dom.window.eval("App.roster.slice().forEach(c=>App.remove(c.id));");
    ok(dom.window.localStorage.getItem(NOTES_KEY) === "Persisted from last session",
      "wiping the whole roster leaves notes untouched");
    dom.window.close();
  }

  console.log("# 3. Blocked storage: warns + falls back to memory (no crash)");
  {
    const dom = boot({
      beforeParse(win) {
        const deny = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
        Object.defineProperty(win, "localStorage", { value: deny });
      }
    });
    const win = dom.window, doc = win.document;
    const ta = doc.getElementById("notesTa");
    ok(!!ta, "app still boots with storage blocked");
    type(win, ta, "memory only note");
    await wait(700);
    ok(doc.getElementById("notesStat").textContent === "in memory only", "status stamps 'in memory only'");
    ok(win.eval("NotesStore.mem") === "memory only note", "in-memory fallback holds the text");
    ok(doc.getElementById("toast").textContent.includes("memory only"), "warning toast fired");
    dom.window.close();
  }

  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
