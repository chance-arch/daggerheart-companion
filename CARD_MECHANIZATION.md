# Domain-Card Mechanization — findings, protocol, and roadmap

**Date:** 2026-07-13 · **Trigger:** Chance asked to "mechanize the other 7 domains' cards," and whether it could run unattended.

## TL;DR

The premise was based on a stale note. **All 9 domains' 189 cards are already annotated** with the effect model — the "only Druid + Wizard" line in older handoff sections is obsolete (field note #2's live coverage view already superseded it). The corpus is annotated **to the interpreter's ceiling**: cards that aren't "Interactive" are that way because the *engine* only narrates their effect type, not because they lack annotation.

This pass shipped the one **faithful, no-fabrication** improvement available — the interpreter now *executes* self-targeted `heal` (and stores dice-roll captures) — moving coverage from **98/51/40 → 101/48/40** and making 2 previously no-op "Interactive" cards actually work. Everything beyond that is **interpreter feature work with gameplay side effects**, each yielding only a handful of cards, and is **not safe to run unattended** (rules-correctness can't be machine-verified, and some cards must stay Reference by design).

## How coverage is classified (the app's own live metric)

`cardCoverage(card)` (in `daggerheart_companion.html`):
- **Reference** — no `action`/`reaction` ability (passive or table-adjudicated). No Cast button.
- **Guided** — has a Cast button, but no effect the interpreter *resolves* → narrative only.
- **Interactive** — has an effect the interpreter resolves (`covResolves`).

`covResolves` counts: `damage{dice}`, `reduceDamage{dice}`, `roll`, `resource`, `summon`, **`heal` (target `self`)** ✱, and `branch`/`forceReaction` recursively. ✱ = added this pass.

## What the interpreter actually executes (the real ceiling)

`execEffects` genuinely automates only: **damage rolls**, **dice rolls** (now with `capture`), **token pools** (`resource` place/spend), **Hope/Stress cost gates**, and — new this pass — **self `heal`** (clear HP/Stress/Armor). Everything else (`applyCondition`, `modifier`, `move`, `negate`, `stateForm`, ally/AoE heals, non-token `resource`) is **narrative text only**.

That's why a card can't be faithfully "made Interactive" just by editing data: most non-Interactive cards use effect types the engine narrates but doesn't run, or deal *weapon* damage (no fixed dice). Adding fixed dice where the card has none would be **fabrication**, which the project forbids.

## What shipped this pass (verified)

Two tight, faithful engine corrections — **no card text/data changed**, the engine now does what the printed text says:
1. **`heal` execution** for `target:"self"` — clears HP (→ toward max), Stress (→ toward 0), or Armor Slots by the stated (resolvable, positive) amount; ally/AoE heals still narrate.
2. **Dice-roll `capture`** — a `roll{dice, capture}` now stores its summed result so expressions like `@recover` resolve.

Effect on the corpus:
- **Promoted Guided → Interactive (3):** Battle-Hardened (Blade L6, clear 1 HP), Lean on Me (Valor L3, clear 2 Stress), Second Wind (Splendor L3, clear 3 Stress).
- **Fixed latent no-ops (2, already classified Interactive):** Swift Step (Bone L10, now clears a Stress) and Unbreakable (Valor L10, now clears the rolled d6 of HP instead of 0).
- Coverage **98/51/40 → 101/48/40**. Verified by `test_card_heal.js` (15 checks, drives real casts and asserts HP/Stress deltas) + updated `test_content_completeness.js`.

**Play-behavior note for Chance:** casting these now changes your HP/Stress automatically (consistent with how the app already auto-pays Hope/Stress *costs*). If you'd rather it prompt/confirm, that's a small tweak — flagging for your eyes.

## Roadmap for further deepening — design-gated, human-reviewed (NOT unattended)

Each is a real interpreter feature; note the small per-feature yield. None should run unattended: rules-fidelity needs human review, and several touch live play.

| Feature | Cards it unlocks | Notes / risk |
|---|---|---|
| **Weapon-damage execution** (`damage{weapon:true}` → roll the equipped weapon, incl. "half Proficiency") | ~2 direct ("weapon damage": Rapid Riposte, Glancing Blow) + martial attack riders | Needs weapon selection + proficiency scaling; changes damage output. |
| **Condition tracking** (`applyCondition` → auto-add to the conditions tracker) | many Blade/Bone/Midnight cards *mention* a condition, but most apply it to the **target**, not self — value is limited without adversary tracking | Ties to GM-side tooling (out of scope today). |
| **Buff/modifier execution** (`modifier` → the active-modifier layer) | Reckless, Rage Up, Deadly Focus, Deft Deceiver, etc. | This is the same active-modifier system flagged by field notes #4/#5/#9; do it there, holistically. |
| **Resource gain** (`resource` gain/clear for Hope/Stress) | **0** cards currently encode this | Not worth building until a card needs it. |

**Stays Reference/Guided by design:** passives (Not Good Enough, Untouchable, Bare Bones, the L7 "-Touched" cards…) and GM-adjudicated narrative (Adjust Reality, Transcendent Union, Mass Disguise, Astral Projection…). These are correctly *not* automated.

## Unattended verdict

- **Safe unattended:** execution-**correctness** fixes to already-annotated effects, gated to unambiguous self-effects, verified by jsdom state assertions, with a strict no-fabrication / leave-and-log rule. (That's exactly this pass.)
- **Not safe unattended:** new interpreter features or effect-model extensions (weapon damage, conditions, buffs), and any card whose faithful encoding requires rules interpretation — because jsdom proves a recipe *runs*, never that it matches the rulebook, and the project's #1 rule is no fabricated mechanics.

Bottom line: the domains are mechanized; the remaining work is a small, human-reviewed interpreter roadmap, best folded into the existing active-modifier effort (#4/#5/#9) rather than run as a batch.
