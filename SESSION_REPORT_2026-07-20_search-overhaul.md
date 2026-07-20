# Session report — 2026-07-20: Search Everything reference-browser overhaul (field note #16)

Session scope: Chance's field note superseding the earlier #16 stub — the Search Everything panel's
purpose is to *fully reference anything in the game* (view all info on any domain card, weapon, etc.).
Requirements: full usability overhaul; results should scroll; the "+N more" block is a usability
blocker; click-to-expand any individual result.

## What was built

Rebuilt the 🔎 Search All panel (single IIFE swap in `daggerheart_companion.html`, backup
`daggerheart_companion.backup-2026-07-19-pre-search-overhaul.html` taken first):

1. **Scrollable results** — `#findResults` gets `max-height:min(62vh,540px); overflow-y:auto`;
   scroll position is preserved across re-renders (no jump when expanding/collapsing).
2. **"Show all" replaces the dead cap text** — categories still render 6 rows initially, but the old
   "+N more — narrow your search" is now a real **"Show all N" / "Show first 6"** toggle per category.
   Expansion is per-category on demand, keeping the §4a "never mount the whole library" rule intact
   (worst case ~192 weapon rows, only when asked for).
3. **Click-to-expand full entries** — every result row toggles the record's complete information:
   - Domain cards: domain, level, recall cost, in-app interactivity classification (live from
     `cardCoverage`), full rules text with paragraphs preserved.
   - Weapons: tier, category, trait, range, damage die+bonus+type, burden, feature.
   - Armor: tier, damage thresholds, Armor Score, Evasion/Agility modifiers, feature.
   - Items/Consumables: category, tier, rarity (from `ITEM_RARITY`), full description.
   - Beastforms: tier, examples, trait bonus, Evasion, attack, advantages, all features; constructed
     forms are labeled as such.
   - Conditions: full text.
   Clicks inside an expanded entry deliberately don't collapse it, so text can be selected/copied.
4. **Empty box = browse mode** — instead of a "type to search" dead end, the panel lists every catalog
   (~570 entries) grouped by category with counts, capped 6 + Show all each. Typing filters as before;
   changing the term resets expansion state. The "No matches anywhere" and panel mutual-exclusivity
   behaviors are unchanged.

## Verification

- New `test_search_overhaul.js` — 22 jsdom checks: scroll styling, browse mode, Show-all expand/collapse
  row-count math against the real `EQUIP_W.length`, full-entry contents for a card (asserts the
  audit-correct "d6+4" text) and a weapon (damage/burden/trait), detail-click keep-open, row-click
  collapse, expansion reset on new term, no-match message.
- Existing `test_armor_list_and_search.js` (covers #15 search basics) untouched and green.
- **Full suite: 13 files, all green.**
- Loaded the app in a real browser: renders cleanly, no console errors. Look/feel is Chance's call, as
  usual.

## Decisions recorded

- The initial per-category cap stays at 6 with an explicit expander, rather than unbounded default
  rendering — same reference power, no render-weight regression.
- Expanded-entry clicks are inert by design (selectable text beats tap-anywhere-to-collapse).
- Detail content is rendered from the same embedded records the app plays with — no second data path
  to drift out of sync.
