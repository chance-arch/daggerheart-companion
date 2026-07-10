# Session Report — 2026-07-09 — Field Note #5: Buff/Debuff Math Transparency

**File changed:** `daggerheart_companion.html` (only product file touched)
**Backup:** `daggerheart_companion.backup-2026-07-09-pre-fieldnote5.html` (made before any edit)
**Game math:** UNCHANGED. Every edit is display-only; verified (see below).

---

## What changed

### Design decision (record for the architecture log)
Effective stats are now built from **labeled parts** — small arrays of `{v: amount, l: source}` —
and the totals the game uses are **derived by summing those same parts**. Display and math share
one source, so the shown breakdown can never drift from the real calculation. This generalizes the
Natural Familiar pattern from field note #4 without adding a buff engine: no new state, no new
effect vocabulary, no interpreter changes. New helpers (all inside the Play/Sheet module):

- `traitParts(k)` → `[{v:base, l:traitName}, {v:tb, l:"Beastform"}?, {v:1, l:"Evolution"}?]`;
  `effTrait` is now the sum of these parts (same values, same order as before).
- `evaParts()` → base + Beastform evasion; `effEva` derived from it.
- `thrParts()` → Earth element (+Proficiency) and Beastform `thrMod` terms; `major()`/`severe()`
  derived from `CH.majorBase`/`severeBase` + these parts.
- `modTerms(parts)` → `" +1 Agility +2 Beastform"` (roll-log style, full labels).
- `mathSub(base, parts)` → `"7 base +2 form"` (tile-sized, short labels), returns `""` when
  nothing modifies the base — so unmodified stats stay clean, no "+0" noise.

### Surfaces that now show their math
1. **Duality rolls (trait / weapon / beastform / card spellcast)** — the dice panel hint and the
   roll log show every term by name instead of one merged modifier:
   `Agility 14 (5/7 +1 Agility +2 Beastform +2 Herbalist +1 bonus) with HOPE`.
   Previously the log showed only `(5/7)` with no modifier at all, and the panel showed a single
   merged number next to a redundant partial list.
2. **Experiences are named** — a checked Experience shows as `+2 Herbalist`, not `+2 exp`
   (`gather()` now returns name+mod pairs; Hope spend behavior untouched).
3. **Manual roll bonus** is labeled `+1 bonus`.
4. **Damage roll log** gains dice notation: `Shortstaff dmg 13 = 2d8 [5,4] +1 +3 (Natural Familiar d6)`.
   The Familiar d6 term (field note #4) was already labeled; now the base dice and flat bonus are too.
5. **Trait tiles** — when boosted, the small line under the value shows `+1 base +2 form +1 Evo`
   (was `was +1`, which named no source).
6. **Evasion tile** — sub-line shows `10 base +2 form` while in Beastform (was `+2 form`).
7. **Major/Severe threshold tiles** — show `7 base +2 form` / `7 base +2 Earth` (or both) whenever
   Earth element or a Beastform `thrMod` is active; plain `thr` otherwise.
8. **Beastform banner + Combat Actions form row** — attack line now reads
   `2d12 +3 (Instinct: +2 base +1 form)` and the banner's evasion shows its base+form math.
9. **Damage calculator** — result now includes threshold math when modified:
   `(10 vs 9/16 — thr = 7/14 base +2 Beastform)`.
10. **Equipment panel** — Armor Score shows shield math when a `+N to Armor` weapon is equipped:
    `Armor Score 5 (4 base +1 shield)`.

## How verified

- `node --check` on the extracted `<script>` blocks — clean.
- jsdom harness (`test_fieldnote5.js`, scratchpad; drives the real DOM click paths, not internals):
  **36/36 checks, 3 randomized runs.** Coverage:
  - Unmodified character: tiles/traits show no breakdown, no `+0` noise (T1, T8).
  - Trait roll logs labeled base term; panel hint matches (T2).
  - Experience named + bonus labeled; Hope spend behavior unchanged (T3).
  - Familiar toggle: damage log names the d6, shows `= 2d8 [..]`, and the **displayed terms sum
    exactly to the displayed total** (parsed back and re-added) (T4).
  - Beastform: trait/evasion breakdowns on tiles, banner, roll log; evasion total still equals the
    old formula (T5).
  - Tier-2 `thrMod`: threshold tiles + damage calc breakdown; severity boundary math unchanged
    (10 vs 9/16 → Major, mark 2) (T6).
  - Earth element: `+2 Earth` on tiles and calculator; 9 vs 9/16 boundary still Major (T7).
  - Shield bonus labeled and total unchanged (T9).
  - Card-driven spellcast roll (Unleash Chaos) labels its trait term (T10).
- No game-math edits: every total is now the sum of the same parts the old formulas added, and the
  harness asserts totals against the old formulas at the boundaries that matter (thresholds,
  evasion, armor score, damage sum).

## Needs Chance's eyes (visual — cannot be verified here)

- Trait tile sub-line (`+1 base +2 form +1 Evo`) is longer than the old `was +1` — check it doesn't
  overflow the tile on phone width.
- Evasion/Major/Severe tile sub-lines (`10 base +2 form`) — same overflow check.
- Beastform banner got longer (evasion + attack breakdowns) — check wrapping.
- Roll log lines are longer (labeled terms in parentheses) — readability check.
- Damage calculator result line with the threshold math appended — wrapping check.
- Equipment panel Armor Score line with `(4 base +1 shield)` appended.

## Modifier paths NOT labeled (and why)

- **Card formula values inside the effect interpreter** (`ev()` expressions like a forceReaction
  Difficulty of `@spellcast + 10`): these display the computed number only. Labeling each term
  would mean restructuring the hand-written expression parser to carry provenance — deep surgery
  the field note explicitly rules out. Practical impact is low (spellcast is base trait outside
  Beastform, and spells are locked during Beastform).
- **`modifier`-type card effects** print their note text and are never silently applied to stats —
  nothing to label (they were already "manual").
- **Conditions tracker** is informational; conditions don't mechanically alter any displayed number
  in the app, so there is no hidden math to surface.
- **Equipment swaps / level-up** permanently rewrite base stats; those are base-changes, not active
  effects, and stay unlabeled by design.

## Observations (not bugs, not changed)

- The Beastform browser grid's threshold preview (`Thr 9/16`) is computed from base + `thrMod`
  only; if Earth element is active the preview understates by Proficiency. It's a browse-time
  preview (the live tiles are correct), so I left it — flagging per the "report, don't silently
  fix" rule.
- The old dice-panel hint double-listed modifiers (`+5 +2 exp +1` where +5 already included the
  +2 and +1); the new labeled-terms format replaces that ambiguity.

## Deliverables

- Edited `daggerheart_companion.html`
- Backup `daggerheart_companion.backup-2026-07-09-pre-fieldnote5.html`
- This report
- Git commit (not pushed — main session reviews and pushes)
