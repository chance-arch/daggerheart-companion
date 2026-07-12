# Session Report — 2026-07-12 — Field notes #9 (built) & #10 Step 1 (drafted)

**Session shape:** continuation of the 2026-07-11 unattended run. Chance gave the go-ahead to
**proceed with #9 and #10** (the two items the prior report had gated on his approval) and asked to
**use agents where possible**. Both were dispatched to parallel background agents; the agents proved
unreliable on the 455 KB single file, so **#9 was completed inline by the main session** after the
agent stalled repeatedly. Shipped **field note #9** and **#10 Step 1 (draft)** as separate commits.
Closed out clean (no background processes left running).

## Commits this session (oldest first)

| Hash | What |
|---|---|
| `d0cc41a` | **Field note #10, Step 1** — homebrew price-model DRAFT (docs only; nothing applied to data) |
| `de99fe3` | **Field note #9** — equip/unequip active-modifier layer + `test_equip_toggle.js` (42 checks) |

**Final verification at closeout:** full harness suite re-run green —
`test_subclass_tiers.js` 46, `test_subclass_tiers_extra.js` 75, `test_campaign_notes.js` 24,
`test_content_completeness.js` 35, `test_beastform_ux.js` 31, `test_equip_toggle.js` 42
= **253 checks, 0 failures**. `node --check` clean on the extracted script. No node/python
processes left running (verified via tasklist).

## Field note #9 — Equip / unequip toggle (SHIPPED, `de99fe3`)

**Approach chosen (and why it differs from the prior report's sketch).** The prior report recommended a
full "compute effective stats as base + Σ(equipped gear) at render" rewrite. The existing harness
`test_subclass_tiers_extra.js` **pins `ch.majorBase === ch.armor.maj + level + featStatBonus`** as a
*stored* field (asserted directly, including after a Play-mode armor swap). A pure render-time model
would have changed what that stored field holds and forced rewriting verified assertions. Instead I
used a **reversible active-modifier layer**: the equipped (default) state leaves every stored base
field byte-identical to before, and only *unequip* removes the contribution. This satisfies the
field note ("stat applies only when equipped; own many, toggle active") **and** keeps all 211
prior checks passing unchanged.

**What changed (Play module of `daggerheart_companion.html`):**
- `shieldBonus()` — sums the "+N Armor Score" weapon feature only for **equipped** weapons.
- `renderActions()` — only equipped weapons render as Combat Actions attack rows.
- `renderEquip()` — an equip checkbox per weapon and for the armor; unequipped rows are visually
  muted and the armor row shows an "unequipped" flag.
- New `setArmorEquipped(on)` / `setWeaponEquipped(i,on)` + a `change`-handler branch for the two new
  checkboxes. Unequipping armor removes its Evasion/Agility/threshold/Armor-Score contribution;
  re-equipping restores every stored stat **exactly** (lossless → #6 `SUBSTAT` subclass bonuses baked
  into thresholds/Evasion survive the cycle).
- `swapArmor()` — guards the old armor's contribution by its equipped state and marks the new armor
  equipped (swapping in a piece equips it).
- **Migration** in play `mount()` — weapons/armor with a missing `equipped` flag default to `true`
  (legacy roster + SEED characters load fully equipped, stats identical).

**Edge-case bug found & fixed while writing the harness:** play `mount()` re-baked `armorScore` from
`armor.score` on every reload **regardless of equipped state**, so a character saved mid-unequip would
reload with a partially re-inflated Armor Score. Now it re-bakes `armor.score` only when the armor is
equipped (else armor contributes 0 Score, shield bonus only). Covered by a new assertion.

**Verification:** new `test_equip_toggle.js` (42 jsdom checks) drives the real checkboxes and reads
real state — migration, weapon toggle + Combat Actions row + shield bonus, armor toggle deltas +
exact lossless restore, save/reload persistence (flag survives migration), and print.

## Field note #10 — Step 1 price model (DRAFTED for review, `d0cc41a`)

Docs only — **nothing applied to `daggerheart_equipment.json` yet.** Deliverables:
`MARKETPLACE_PRICE_MODEL_DRAFT.md` (headed HOMEBREW / DRAFT, precedence rank 8) +
`scratch_rarity_proposal.json` (machine-readable, verified to cover all 60 items + 60 consumables
exactly). Four rarity buckets (common/uncommon/rare/legendary) with a description-based assignment
heuristic; a tier×rarity buy-range + used/sell table in handfuls/bags/chests (×3–4 per step, sell
≈ 30–50% of low buy, ranges as GM haggling room); every item/consumable classified line-by-line for
veto; uncertain calls flagged in the doc (trait-swap Gems, Death Tea, Sun Tree Sap, etc.).

## Design & architecture decisions made this session

1. **#9 uses a reversible modifier layer, not a render-time recompute.** Forced by the harness
   contract that `majorBase`/`severeBase` are *stored* armored values (and the "keep all verified
   numbers identical" rule). Equipped-by-default ⇒ zero change to baked math; unequip is the only path
   that unbakes. This is the pragmatic, low-risk realization of the §4b "active-modifier system" —
   documented so a future full render-time refactor knows why the stored-field shape was kept.
2. **Homebrew content that shapes Chance's table is drafted, not applied, unattended.** Choosing rarity
   buckets and price ranges is a game-economy design choice; per the standing rules-accuracy policy it
   was drafted for review rather than written into the data. Apply only after Chance approves.
3. **Background agents are unreliable on this repo's 455 KB single file.** Both #9 and #10 agents
   stalled on the large-file operations (600s watchdog) and one was torn down across a session boundary
   with zero work landed. **Lesson for future unattended runs: drive edits to the big file from the
   main session (surgical `Edit` + `node --check`), and reserve agents for read-only research or
   disjoint-file drafting (the #10 draft, which touched no existing files, did complete via agent).**

## For Chance — review checklist (human eyes required)

1. **#9 look/feel:** the new equip/unequip checkboxes in the Weapons & Armor panel (weapon rows,
   armor row), the muted styling for stored/unequipped gear, and that Combat Actions shows only
   equipped weapons. Logic + numbers are verified; appearance is not.
2. **#10 approval:** review `MARKETPLACE_PRICE_MODEL_DRAFT.md` — the rarity buckets, the price ranges,
   and the per-item assignments (especially the flagged uncertain ones). On your OK, Step 2 applies the
   data (`rarity` + a shared homebrew `priceModel` at `sourceTier` rank 8) and builds the
   search → shopping-list → range UI.
3. Untracked backups from earlier in the run are now committed with `de99fe3`.

## Status of the field-note backlog

All original pilot notes and the two post-pilot notes are now resolved or drafted:
**#1 ✅ #2 ✅ #4 ✅ #5 ✅ #6 ✅ #7 ✅ #8 ✅ #9 ✅** · **#3 parked** (hosting) · **#10 🟡 Step 1 drafted,
awaiting approval for Step 2.** With #10 approved, the piloted backlog is effectively cleared — a good
moment to ask Chance what the next thrust is (e.g. #10 UI, mechanizing more domains, or the optional
targeted-`render()` hardening from §4a).

## Next session

If Chance approves the #10 price model: **apply Step 1 data + build the Step 2 marketplace UI.**
Otherwise pick up his next direction. #9 is done pending his visual sign-off.
