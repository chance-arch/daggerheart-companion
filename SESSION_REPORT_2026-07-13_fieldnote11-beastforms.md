# Session Report — 2026-07-13 — Field note #11 (all Beastform tiers + constructed-form builder + Epic Hybrid)

**Session shape:** Started as a "which languages does the saved Theron character know?" lookup, which
Chance interrupted and redirected into a feature: a builder for the Legendary/Mythic Hybrid Druid
beastforms. Scope then expanded (Chance) to **completing the beastform list to all four tiers** and making
**all four SRD constructed forms buildable** (the two Evolved *Beast* templates + the two *Hybrid*
combine-forms). A follow-up request added a fifth, homebrew **Epic Hybrid** — Mythic-Hybrid power but with
the SRD "your tier or lower" rule enforced. Built, tested, verified in a real browser, committed, logged.

## Commits this session

| Hash | What |
|---|---|
| _(this commit)_ | **Field note #11** — Tier 1–4 beastforms complete + constructed-form builder (Legendary/Mythic Beast & Hybrid) + homebrew Epic Hybrid; `test_beastform_builder.js`; `test_beastform_ux.js` reconciled; handoff + this report |

**Verification at closeout:** full suite green —
`test_beastform_builder.js` 65, `test_beastform_ux.js` 40, `test_campaign_notes.js` 24,
`test_content_completeness.js` 35, `test_equip_toggle.js` 42, `test_marketplace.js` 25,
`test_subclass_tiers.js` 46, `test_subclass_tiers_extra.js` 75 = **352 checks, 0 failures**.
Script parses + runs under jsdom (stronger than `node --check`). No node/python processes left running;
local static server + browser preview stopped and confirmed.

## What shipped (all in `daggerheart_companion.html`)

**Data — the beastform list is now complete.** The app's embedded `BEASTFORMS` array went from 12
(Tier 1–2 only) to **all 24 official SRD forms across four tiers** (7 / 5 / 6 / 6), plus a **25th homebrew
form, Epic Hybrid**. The four SRD "build-your-own" forms carry a `build` descriptor:
- **Legendary Beast** (T3) / **Mythic Beast** (T4) — `build.kind:"evolve"`. Pick a lower-tier form, keep
  its whole kit, add flat bonuses (Legendary +6 dmg / +1 trait / +2 Eva; Mythic +9 / +2 / +3 **and** the
  damage die steps up one size, capped at d12).
- **Legendary Hybrid** (T3) / **Mythic Hybrid** (T4) — `build.kind:"hybrid"`. Pick N forms (2 from T1–2 /
  3 from T1–3), then choose a budget of advantages + features from their union (4+2 / 5+3). Fixed stat
  lines (Str +2 / d10+8, +1 extra Stress) and (Str +3 / d12+10, +2 extra Stress).
- **Epic Hybrid** (T4 bucket, **homebrew**) — `build.kind:"hybrid", tierCap:true`. Same power/budget as
  Mythic Hybrid, but the ingredient pool is computed live from `CH.tier` so only forms of the character's
  tier or lower are legal.

**Engine (pure, exposed for tests as `Sheet._build.*`).**
- `buildEvolved(template, base)` and `buildHybrid(template, bases, advPicks, featPicks)` validate the
  selection (form count, distinctness, tier range, advantage/feature membership + exact budget) and return
  `{ok, errors, form}`. The assembled `form` uses the **same shape as a static `BEASTFORM`**, so it drops
  straight into the existing `aForm()`/`activate` machinery — trait/Evasion/threshold/attack math, the
  #5 inline-math breakdowns, drop-on-last-HP, and rest/session resets all work unchanged.
- `hybridTiers(t)` resolves the legal ingredient tiers: `tierCap` templates → `[1..CH.tier]`; everything
  else → the template's fixed `fromTiers`.

**State + UI.**
- New session field `S.bfBuilt` holds the assembled constructed form; `aForm()` returns it when active.
  Cleared on drop, rest, and new-session (alongside `bfActive`/`bfEvo`).
- The Beastforms card tier filter is now **T1 / T2 / T3 / T4 / All**. Simple forms keep the one-tap
  Activate / Evolution buttons; the five constructed forms show a **Build…** button that opens an inline
  builder panel (form chips → advantage chips → feature chips, live preview, correct Stress cost, Cancel).
- Constructed forms are **excluded from the Combat-Actions quick-launcher** (they need choices) — built
  from the grid only. Quick-launcher now lists the 20 simple forms.
- New CSS for `.bf.build`, `.bfbuilder`, `.bflab`, `.bfchips`, `.bfchip`, `.bfpreview`.

## Tests
- **New `test_beastform_builder.js` (65 checks)** — data completeness (25 forms, 7/5/6/7), tier filter,
  both Evolved templates (stat deltas, die step-up, tier-range rejection), Legendary Hybrid via a full DOM
  click-through, Mythic Hybrid via the pure engine (budget/membership/count validation), live-stat
  integration, drop/rest cleanup, and Epic Hybrid tier enforcement (Tier-2 legal/illegal combos, UI chip
  gating at Tier 2 vs Tier 4, 3-Stress transform).
- **Reconciled `test_beastform_ux.js`** — it was **red at HEAD** (Chance's in-progress steps 7–8 clicked
  the Tier-2 Winged Beast grid button while the grid defaults to the Tier-1 filter, and called a
  closure-local `effEva()` that isn't global). Fixes: reveal all tiers before the grid click; count simple
  (non-`build`) forms for the launcher assertion; call the newly exposed `Sheet._eff.eva()`; and make the
  Evasion-tile assertion order-robust (the tile renders value-then-label). Now 40/40.

## Design decisions (new this session)
1. **Constructed forms assemble into the static form shape** rather than getting a parallel render/stat
   path — one code path, so existing math and the #5 transparency layer apply for free.
2. **`S.bfBuilt` vs module-level `bfBuild`** — the *assembled* form is session state (survives re-render
   while transformed); the *in-progress picks* are transient UI state (module var, not persisted).
3. **Epic Hybrid is buildable at any tier; only its ingredient pool scales with tier.** Its power is fixed
   at the Mythic level and it's legal-by-construction. **Chance confirmed (2026-07-13): keep it ungated —
   no minimum-tier gate on the card.** Follow-up closed.
4. **Die step-up caps at d12** for Mythic/Epic evolving a d12 base (SRD examples don't go higher).
5. **Epic Hybrid is app-only homebrew** — `daggerheart_beastforms.json` stays the 24 official SRD forms;
   the 25th lives only in the app's `BEASTFORMS`, consistent with the homebrew-precedence policy.

## Open follow-ups (Chance's eyes / decisions)
- **Look/feel** of the builder panel + chips (logic verified; visual is the usual jsdom ceiling).
- **Whether to enforce "your tier or lower" globally** (today only Epic Hybrid does; the rest of the app
  still lets any tier be assumed, matching prior behavior).
- ~~Gate the Epic Hybrid card by minimum character tier~~ — **closed 2026-07-13: Chance chose to keep it ungated.**
- The original **"languages Theron knows"** question was set aside when Chance pivoted — not answered.

## Housekeeping
- Pre-feature backup: `daggerheart_companion.backup-2026-07-12-pre-beastform-tiers.html` (committed).
- Untracked `_probe.js` in the working tree is **not from this session** (a scratch jsdom probe) — left
  alone, not committed.
- Memory: added `jsdom-test-harness.md` (how to run the suites — jsdom is nested under the global
  `@bitwarden/cli`, so `NODE_PATH` must point there).
