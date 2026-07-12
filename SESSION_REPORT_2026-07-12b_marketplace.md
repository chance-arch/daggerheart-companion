# Session Report — 2026-07-12 (b) — Field note #10 shipped end-to-end (marketplace)

**Session shape:** Chance approved the homebrew price model **as-is** and asked to apply the data and
build the UI. Did both in one pass: wrote the rarity + price data into the source of truth and the app,
built the in-app marketplace, verified with a new harness, committed. This **clears the piloted
field-note backlog** (#1–#10; #3 parked). Closed out clean (no background processes).

## Commit this session

| Hash | What |
|---|---|
| `37a0213` | **Field note #10, Step 2** — apply homebrew price data + marketplace UI + `test_marketplace.js` |

(Builds on `d0cc41a`, the approved draft from earlier the same day.)

**Verification at closeout:** full suite green —
`test_subclass_tiers.js` 46, `test_subclass_tiers_extra.js` 75, `test_campaign_notes.js` 24,
`test_content_completeness.js` 35, `test_beastform_ux.js` 31, `test_equip_toggle.js` 42,
`test_marketplace.js` 25 = **278 checks, 0 failures**. `node --check` clean. No node/python
processes left running.

## What shipped

**Data (both the source of truth and the app's embedded copy).**
- `daggerheart_equipment.json`: a `rarity` field on every one of the 60 items + 60 consumables
  (from the approved `scratch_rarity_proposal.json`), and a homebrew `meta.priceModel` holding the
  three tables (weapons/armor by tier; items & consumables by rarity) with amounts stored in
  **handfuls** (10 h = 1 bag, 10 bags = 1 chest). Tagged `sourceTier: "Homebrew (precedence rank 8)"`.
- The app is single-file and offline, so it embeds its own data. Injected a `PRICE_MODEL` const and a
  compact `ITEM_RARITY` (name→rarity) map right after `EQUIP_ITEMS` — a lookup map rather than
  rewriting the 120-record array inline, to stay under the safe edit-size ceiling (gotcha §6.2).

**UI — a 🪙 Market panel in the header toolbar** (same toggle pattern as 📓 Notes / 📊 Coverage,
so it's reachable from every mode and mutually exclusive with the other panels):
- Capped search (30 results) across all **346** purchasable records — weapons, armor, items,
  consumables. Each row shows its tier or rarity tag and a **homebrew buy range + used value**,
  priced by tier (weapons/armor) or rarity (items/consumables).
- A **shopping list**: +List / remove / Clear, with a running **buy-range and sell-back total**
  folded across denominations (e.g. a Dagger + Portal Seed reads *buy 1 chest, 1 handful – 3 chests,
  5 handfuls · sell back 4 bags, 1 handful*). Persists to its own key `dh_market_list_v1` with the
  standard blocked-storage in-memory fallback.
- Every price is labeled **homebrew**, never official.

## Design & implementation notes

1. **Prices stored in handfuls, formatted on display.** One integer unit (handfuls) is the single
   source of truth; `coin()` / `coinFull()` / `priceRange()` fold it into handfuls/bags/chests for
   display. Keeps totals exact and avoids mixed-unit arithmetic bugs.
2. **Bug caught by the harness:** the first `priceRange()` printed the raw number with the reduced
   unit ("100–300 chests" instead of "1–3 chests") — it collapsed the unit word but didn't divide by
   the unit's factor. Fixed to divide by 1/10/100 for handful/bag/chest. Only surfaced at chest-scale
   (handful-scale has factor 1), which is exactly why the legendary-item test earned its place.
3. **Pricing is a shared lookup, not per-item values** (as promised in the draft): the UI resolves
   *record → tier/rarity → price* at render, so there are no hand-authored per-item prices to drift,
   and any future official prices (rank 1/3) supersede the homebrew table automatically via
   `sourceTier`.

## For Chance — open follow-ups (small)

1. **Marketplace look/feel** — the 🪙 Market panel (search rows, rarity tags, shopping-list totals).
   Logic + prices are verified; appearance needs your eyes.
2. **`daggerheart_equipment.xlsx`** review twin was **not** regenerated — it has no `rarity` column
   yet. Low priority (the JSON is the source of truth; the app doesn't read the xlsx), but flag it if
   you use the spreadsheet for review.
3. The full price model, buckets, and every per-item call remain visible in
   `MARKETPLACE_PRICE_MODEL_DRAFT.md` (and the review artifact) if you want to revisit any pricing.

## Backlog status — piloted notes cleared

**#1 ✅ #2 ✅ #4 ✅ #5 ✅ #6 ✅ #7 ✅ #8 ✅ #9 ✅ #10 ✅** · **#3 parked** (hosting/sharing).
The original pilot + post-pilot backlog is done. Natural next-thrust options for Chance to pick from:
mechanizing more domains' cards (only 98/189 are fully interactive — see the Coverage panel), the
optional targeted-`render()` hardening (§4a), or a new direction entirely.
