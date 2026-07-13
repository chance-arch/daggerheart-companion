# Session Report — 2026-07-13 (b) — Field notes #13, #14, #15

**Session shape:** Chance filed three pilot field notes at once. Two overlapped with shipped
features, so I investigated first and confirmed scope with him before building (avoiding duplicates):
- **#13** the marketplace already had *one* list that conflated buy + sell → he chose **two separate
  lists** (Buying / Selling) with a net.
- **#14** armor already had a worn/off toggle (#9) → he chose to make armor a **carryable list like
  weapons** (multiple pieces, one worn at a time).
- **#15** Search Everything — genuinely new.

Built all three, each verified in jsdom + a real browser, full suite green, committed + pushed.

## What shipped (all in `daggerheart_companion.html`)

**#13 — Buying & Selling lists.** The single shopping list became **🛒 Buying** (subtotal at buy range)
and **🏷️ Selling** (subtotal at sell-back value), plus a **Net (sell − buy)** line and Clear-all.
Search results now show **+ Buy** / **+ Sell**. Storage stayed on `dh_market_list_v1` but is now
`{buy:[],sell:[]}`; a pre-existing array migrates into `buy`.

**#14 — Carryable armor list.** Introduced `CH.armors` (a list) replacing the single armor slot in the
UI. Carry several pieces; **add / remove**; **wear/store** by checkbox with **at most one worn at a
time** (wearing one auto-unwears the rest). The worn armor drives stats through a new `applyArmor(a,on)`
helper that is the **exact lossless math from #9**, so every verified threshold / Evasion / Armor-Score /
Agility number — including SUBSTAT subclass bonuses — survives wear/store/swap. `CH.armor` is kept as the
worn pointer (for the printable sheet + threshold display); legacy single-armor characters migrate to a
one-entry list on mount via `armorsInit()`.

**#15 — Search Everything.** A new **🔎 Search All** header panel (same toggle/mutual-exclude pattern as
Notes/Coverage/Market) with one input that searches **every catalog at once** — domain cards, weapons,
armor, items, consumables, beastforms, conditions — grouping matches by category (capped 6/category with
"+N more"). Read-only finder built from the existing dataset globals.

## Tests (full suite green — 10 files, 397 checks)
- **New `test_armor_list_and_search.js` (27)** — the one-worn-at-a-time invariant, add/remove, and the
  Search Everything panel (grouped results across categories, no-match, mutual exclusion).
- **`test_marketplace.js` (25 → 27)** — rewrote the list section for two lists + net.
- **`test_equip_toggle.js` (42 → 43)** — armor sections now drive add → wear → store → re-wear (lossless).
- **`test_subclass_tiers_extra.js`** — the Play-mode "armor swap preserves subclass bonus" case now drives
  the add-then-wear flow; still 75/0.
- Others unchanged and green.

## Design decisions (new this session)
1. **Buy and Sell are separate lists**, not one list with per-item tags — an item is either being bought
   or sold, and separate subtotals + a net read cleaner. (Chance chose this over the tag variant.)
2. **Armor keeps a single "worn" invariant.** Daggerheart wears one armor; wearing another unwears the
   current, so the stat contribution is always exactly one armor. `CH.armor` remains the worn pointer to
   avoid touching the printable sheet / threshold-display code.
3. **Reused #9's `applyArmor` math verbatim** rather than re-deriving, so #9's 42-check lossless guarantee
   extends to the list model unchanged.
4. **Search Everything is read-only** (a finder, not an add-to-loadout surface) — keeps it simple and
   avoids duplicating the existing per-slot pickers.

## Open follow-ups (Chance's eyes)
- Look/feel of all three: the two-column Buy/Sell layout + net line, the armor list rows, and the Search
  All results grouping. Logic is jsdom- and browser-verified; visual polish is the usual hand-off.
- The marketplace `.xlsx` review twin still lacks a rarity column (carried over from #10).

## Housekeeping
- Pre-feature backup: `daggerheart_companion.backup-2026-07-13-pre-fieldnotes-13-15.html` (committed).
- No background processes left running (static server + browser preview stopped and verified).
- Untracked `_probe.js` is not from this work — left alone.
