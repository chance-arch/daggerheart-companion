# Session Report — 2026-07-10/11 — Design discussion + unattended field-notes run

**Session shape:** started as a design conversation (single-file vs. split architecture, scaling fears),
converted the findings into the build plan, added two new field notes, then kicked off an unattended
agent-driven run through the open field notes. **The run was stopped by the session limit after
completing #6 and #1** (2 of 6 planned). Closed out cleanly.

## Commits this session (oldest first)

| Hash | What |
|---|---|
| `822bb8c` | §4a scaling & hardening assessment added to PROJECT_HANDOFF.md (docs only) |
| `8349ad1` | Field notes #9 (equip toggle) + #10 (marketplace) added; #10 pricing source resolved (docs only) |
| `54ca136` | **Field note #6** — verified via 121 jsdom checks; found + fixed 3 real bugs (see below) |
| `0fba475` | **Field note #1** — campaign notes section built + verified (24 checks) |
| `92698f7` | Bookkeeping: #5 row in handoff was stale; marked shipped (`25debf2`) |

**Final verification at closeout:** all three harnesses re-run green — `test_subclass_tiers.js` 46/46,
`test_subclass_tiers_extra.js` 75/75, `test_campaign_notes.js` 24/24. `node --check` clean.
(Harnesses need jsdom: `NODE_PATH=<any node_modules with jsdom> node <harness>.js` — see
`test_harness_notes.md`.) No background processes spawned; none left running (verified via tasklist).

## Design & architecture decisions made this session

1. **Do NOT split the app into separate files/engines.** Chance raised breaking the single-file app
   into separate builder/sheet/level-up chunks talking via import/export, driven by a fear the app
   would slow/crash when content is fully built out. We read the actual render path and concluded:
   content growth does not weigh down the Play screen (library is never fully mounted — search capped
   at 30–40 rows; loadout capped at 5 cards; screen weight scales with the *character*, not the
   *library*). File-splitting also collides with `file://` (ES modules need a bundler or server).
   **Decision: stay single-file; park the split idea.** Recorded as §4a in PROJECT_HANDOFF.md.
2. **The one sanctioned future hardening:** teach Play-mode `render()` to update only what changed
   (it currently rebuilds the whole screen per tap — wasteful but character-sized, not dangerous).
   Optional; only if the table ever feels it. Watch-items: uncapped vault + inventory redraw, and
   portrait data-URLs vs. the ~5–10 MB localStorage budget.
3. **Field note #10 pricing model resolved with Chance:** clearly-labeled **homebrew price table keyed
   by tier (weapons/armor) and rarity (consumables/loot/magic items)**, each cell a buy range + used
   value. Sits at **rank 8** in the standard `SOURCES_precedence.md` ladder (tagged via `sourceTier`);
   any future official prices supersede automatically. No fabricated official prices. Data gap noted:
   equipment JSON has `tier` but no `rarity` and no price fields — content task precedes UI.
4. **Field note #9 direction:** equip/unequip via checkbox requires an **active-modifier layer**
   (compute applied bonuses at render) instead of the current destructive stat-baking (`swapArmor`
   mutates base stats). Same architectural gap #4's familiar bug exposed. Recorded in §4b.
5. **#6 rules corrections (now enforced in-app):** subclass **Specialization is Tier 3 (L5+) and
   Mastery is Tier 4 (L8+)** — recommended paths had granted them at L2/L5; manual picks now gated
   with warnings; and the five permanent numeric subclass effects (Stalwart thresholds, Nightwalker
   Evasion, Winged Sentinel Severe) are now actually applied via a new `SUBSTAT`/`featStatBonus`
   layer and survive armor swaps.
6. **Campaign notes storage design (#1):** own localStorage key **`dh_campaign_notes_v1`**, fully
   independent of the roster key; debounced autosave (400 ms + blur flush); standard blocked-storage
   fallback; excluded from the printable sheet. One shared campaign-level page, reachable from the
   always-visible header toolbar (📓 Notes).

## Where the unattended run stopped

Planned order: #6 → #1 → #2 → #7 → #9 → #10. **Completed: #6, #1** (plus the #5 bookkeeping fix).
**Not started: #2 (content-completeness view), #7 (Beastform UX), #9 (equip toggles), #10 (marketplace).**
The #2 agent was never launched — its full self-contained prompt spec exists in this session's
transcript, but §4 + §4b of the handoff carry everything needed to re-derive it.

## For Chance — review checklist (human eyes required)

1. **#6 caveat:** roster characters saved *before* `54ca136` keep any early-granted Spec/Mastery and
   lack the numeric subclass bonuses (no retro-migration). Rebuild or re-level them. (Table Druids
   unaffected.)
2. **Visual checks:** the new tier-gating warnings in the wizard/level-up panels, and the 📓 Notes
   panel look/feel. Logic is verified; appearance is not.
3. **Known SRD nicety left undone (flagged, small):** mutual cross-out between subclass-upgrade and
   multiclass within the same tier is not enforced.
4. Pre-#6 backup of the app is committed; an untracked backup
   `daggerheart_companion.backup-2026-07-10-pre-fieldnote-1.html` also exists (safe to delete once
   #6/#1 are confirmed good at the table).

## Next session

Resume the run at **#2**, then #7 → #9 → #10 (same per-note agent + commit pattern). All decisions
needed to proceed are already recorded; #10 needs no further input from Chance until price values
are drafted for his review.
