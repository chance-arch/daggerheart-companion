# THE MILL — Daggerheart App: Data Index

**Canonical catalog of the Daggerheart content library for this project.** Read this first in a new chat.

- Generated: 2026-06-27 (regenerate with `build_data_index.py`)
- Source: Daggerheart SRD 1.0 via daggerheartsrd.com, under the DPCGL. SRD content (c) Critical Role, LLC.
- Source tier: all datasets are Official SRD (precedence rank 4) — see `SOURCES_precedence.md`.
- Effect model: `Daggerheart_Effect_Model_Spec.md` (v1, locked). Design system: `Daggerheart_Design_System.md` + `design_tokens.*`.

## At a glance

| Dataset | File | Records |
|---|---|---|
| Domain cards (mechanized) | `daggerheart_domain_cards_annotated.json` | 189 (174 auto, 15 narrative) |
| Domain cards (text only) | `daggerheart_domain_cards.json` | 189 |
| Conditions | `daggerheart_conditions.json` | 3 standard + 11 special |
| Equipment | `daggerheart_equipment.json` | 155 primary + 37 secondary weapons, 34 armor, 60 items, 60 consumables = 346 |
| Heritage | `daggerheart_heritage.json` | 18 ancestries + 9 communities |
| Classes & subclasses | `daggerheart_classes.json` | 9 classes, 18 subclasses |
| Beastforms (Druid) | `daggerheart_beastforms.json` | 24 (tiers 1-4) |
| Adversaries (GM) | `daggerheart_adversaries.json` | 129 (tiers 1-4, full statblocks) |
| Environments (GM) | `daggerheart_environments.json` | 19 |

Each JSON has a `.xlsx` twin for review. Every JSON carries a `meta` block (source, license, counts, notes).

## Schemas (key fields)
- **Domain cards:** name, slug, domain, level, type, recallCost, text, url, + `mechanics.abilities[]` (effect model).
- **Conditions:** standard (Hidden/Restrained/Vulnerable) + special (defined on cards); clearing rules.
- **Equipment:** weapons (trait, range, damage, burden, feature); armor (baseThresholds, baseScore, feature); items/consumables (description).
- **Heritage:** ancestries (2 features each), communities (1 feature).
- **Classes:** domains[2], startingEvasion, startingHitPoints, classItems, hopeFeature, classFeatures[], subclasses[] (foundation/specialization/mastery, spellcastTrait).
- **Beastforms:** tier, examples, trait, traitBonus, evasionBonus, attack, advantages, features → effect-model `stateForm`.
- **Adversaries:** tier, type, difficulty, thresholds, hp, stress, atk, attack{name,range,damage}, experience, features[{name,kind,text}], motivesTactics.
- **Environments:** tier, type, difficulty, impulses, potentialAdversaries, features[{name,kind,text}].

## Cross-references
- Cards ↔ Conditions: `applyCondition.condition` → a registry slug.
- Classes ↔ Domains ↔ Cards: each class grants 2 domains; loadout drawn from them.
- Beastforms ↔ effect model: instantiate `stateForm`.
- Everything ↔ source precedence: rank-4 (SRD); Errata (1) overrides; Hope & Fear (2) opt-in, unreleased until 2026-08-25.

## Reference docs
- `Daggerheart_Effect_Model_Spec.md`, `SOURCES_precedence.md`, `Daggerheart_Design_System.md`, `PROJECT_ROADMAP.md`.
- Ownable art: `art_sigils_preview.html`, `art_emblems_preview.html`. App: `daggerheart_sheet.html` (character sheet).

## Backlog
- Leveling/progression rules (automation). Character builder (in progress).

## Regenerate
`python3 build_data_index.py`
