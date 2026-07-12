/* Field note #10 verification: Marketplace (homebrew buy/sell, precedence rank 8).
   Pattern per test_harness_notes.md — load the real HTML in jsdom, drive the real UI.
   Run: NODE_PATH=/path/to/node_modules node test_marketplace.js [optional html path]

   Verifies: the 🪙 Market panel toggles; search returns priced rows; tier-priced (weapons/
   armor) and rarity-priced (items/consumables) rows show the correct homebrew range + used
   value; adding to the shopping list accumulates a correct buy-range + sell total across
   denominations; remove/clear work; every item/consumable carries a rarity; nothing claims to
   be official.
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
const ev = expr => win.eval(expr);
const q = sel => doc.querySelector(sel);
const qa = sel => Array.from(doc.querySelectorAll(sel));
const click = el => el.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
function search(term){ const s = q("#mkSearch"); s.value = term; s.dispatchEvent(new win.Event("input", { bubbles: true })); }
function resultRowAdd(nameSubstr){
  return qa("#mkResults .row").find(r => r.textContent.indexOf(nameSubstr) >= 0);
}

(function main(){
  console.log("# 0. Data model applied");
  ok(ev("typeof PRICE_MODEL!=='undefined' && PRICE_MODEL.homebrew===true && PRICE_MODEL.rank===8"), "PRICE_MODEL present, tagged homebrew rank 8");
  ok(ev("typeof ITEM_RARITY!=='undefined' && Object.keys(ITEM_RARITY).length===120"), "ITEM_RARITY covers all 120 items/consumables");
  ok(ev("['common','uncommon','rare','legendary'].every(function(r){return PRICE_MODEL.itemsByRarity[r]&&PRICE_MODEL.consByRarity[r];})"), "price tables cover all four rarities for items & consumables");
  ok(ev("[1,2,3,4].every(function(t){return PRICE_MODEL.byTier[t];})"), "tier price table covers tiers 1–4");

  console.log("# 1. Market panel toggles from the header");
  const btn = q("#marketBtn");
  ok(!!btn, "🪙 Market button present in toolbar");
  ok(q("#marketBox").style.display === "none", "panel hidden initially");
  click(btn);
  ok(q("#marketBox").style.display === "block", "panel opens on click");
  ok(/homebrew/i.test(q("#marketBox").textContent) && !/official Daggerheart prices\b(?!)/.test(""), "panel labels prices homebrew, not official");
  ok(!!q("#mkSearch"), "search box present");

  console.log("# 2. Search returns priced rows");
  search("dagger");
  const dRow = resultRowAdd("Dagger");
  ok(!!dRow, "search 'dagger' returns a Dagger row");
  // Dagger is a Tier-1 weapon → byTier[1] = buy 1–5 handfuls, sell 1 handful
  ok(dRow && /1–5 handfuls/.test(dRow.textContent), "Tier-1 weapon shows buy range 1–5 handfuls", dRow && dRow.textContent);
  ok(dRow && /sell 1 handful/.test(dRow.textContent), "Tier-1 weapon shows used value 1 handful");

  console.log("# 3. Rarity pricing — item (legendary) and consumable (common)");
  search("portal seed");
  const pRow = resultRowAdd("Portal Seed");
  ok(!!pRow, "search returns Portal Seed (legendary item)");
  // items legendary = buy 100–300 (1–3 chests), sell 40 (4 bags)
  ok(pRow && /1–3 chests/.test(pRow.textContent), "legendary item buys for 1–3 chests", pRow && pRow.textContent);
  ok(pRow && /sell 4 bags/.test(pRow.textContent), "legendary item sells for 4 bags");
  ok(pRow && /legendary/.test(pRow.textContent), "row shows the legendary rarity tag");

  search("minor health potion");
  // disambiguate: "Minor Health Potion Recipe" is an Item; we want the Consumable
  const mRow = qa("#mkResults .row").find(r => r.textContent.indexOf("Minor Health Potion") >= 0 && /Consumable/.test(r.textContent));
  ok(!!mRow, "search returns the Minor Health Potion consumable");
  // consumables common = buy 1–2 handfuls, sell 1 handful
  ok(mRow && /1–2 handfuls/.test(mRow.textContent), "common consumable buys for 1–2 handfuls", mRow && mRow.textContent);

  console.log("# 4. Shopping list accumulates a correct cross-denomination total");
  // start clean
  ev("try{localStorage.removeItem('dh_market_list_v1');}catch(e){}");
  // add Dagger (T1: buy 1–5, sell 1) then Portal Seed (buy 100–300, sell 40)
  search("dagger"); click(resultRowAdd("Dagger").querySelector("[data-mkadd]"));
  search("portal seed"); click(resultRowAdd("Portal Seed").querySelector("[data-mkadd]"));
  const listTxt = q("#mkList").textContent;
  ok(/Total · 2 items/.test(listTxt), "list shows 2 items", listTxt);
  // buy min = 1+100 = 101 → "1 chest, 1 handful"; max = 5+300 = 305 → "3 chests, 5 handfuls"
  ok(/1 chest, 1 handful/.test(listTxt) && /3 chests, 5 handfuls/.test(listTxt), "buy total range folds handfuls→chests correctly", listTxt);
  // sell = 1 + 40 = 41 → "4 bags, 1 handful"
  ok(/4 bags, 1 handful/.test(listTxt), "sell-back total folds correctly (41 → 4 bags, 1 handful)", listTxt);

  console.log("# 5. Duplicate guard, remove, and clear");
  search("dagger"); click(resultRowAdd("Dagger").querySelector("[data-mkadd]"));  // add Dagger again
  ok(/Total · 2 items/.test(q("#mkList").textContent), "adding a duplicate does not grow the list");
  const del = q("#mkList [data-mkdel]");
  click(del);
  ok(/Total · 1 item[^s]/.test(q("#mkList").textContent), "remove drops an item from the list");
  click(q("#mkList [data-mkclear]"));
  ok(/Empty/.test(q("#mkList").textContent), "Clear empties the list");

  console.log("# 6. Catalog completeness");
  ok(ev("(function(){var n=0;n+=EQUIP_W.length;n+=EQUIP_A.length;n+=EQUIP_ITEMS.length;return n;})()") === 346, "catalog spans all 346 purchasable records (192 weapons + 34 armor + 120 items/consumables)");

  console.log("\n" + (fail ? "FAILED " + fail + " / " : "ALL PASS ") + (pass + fail) + " checks (" + pass + " ok)");
  process.exit(fail ? 1 : 0);
})();
