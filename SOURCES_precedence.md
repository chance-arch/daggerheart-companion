# Daggerheart App — Source Precedence Policy

When two sources disagree, the **higher-ranked source wins**. Every content record should carry a
`source` / `sourceTier` field so the app can resolve conflicts and filter by canonicity.

| Rank | Source | How the app treats it |
|---|---|---|
| 1 | **Official Errata** | Highest priority. Overrides everything below it, including the text it amends. |
| 2 | **Daggerheart: Hope & Fear** expansion | **Opt-in only.** Not released until **Aug 25, 2026**. Excluded by default; only surfaces after a player explicitly enables the expansion. |
| 3 | **Core Set** | Canonical published rules. |
| 4 | **Official SRD** | Canonical; current basis of our datasets (SRD 1.0). |
| 5 | **Official Adventures & Downloads** | Canonical supplementary content. |
| 6 | **Official Playtest Material** | Allowed, but **must be clearly labeled "playtest"** in the UI and excluded from "official-only" views. |
| 7 | **Official digital implementations** (Demiplane / Roll20) | Tie-breaker / cross-check only; used for UX reference and edge-case behavior, not as a rules source over 1–6. |
| 8 | **Community resources** | **Reference only.** Never overrides official content; flagged as community/homebrew. |

## Application rules

- **Conflict resolution:** when records collide on the same rule, apply the lowest rank number. Errata always wins.
- **Hope & Fear gating:** treat as a feature flag (`expansion: "hope-and-fear"`), default OFF. Today (pre-release) there is **no Hope & Fear content in the app**; it becomes selectable only after release and only when the player opts in.
- **Labeling:** playtest and community content must be visibly tagged so a player can tell canonical from non-canonical at a glance, and can filter to "official only."
- **Provenance on every record:** content rows carry `source` and (where relevant) `sourceTier` so precedence is enforceable in data, not just convention.

## Current dataset provenance

All content built so far is **Official SRD 1.0 (rank 4)** via daggerheartsrd.com under the DPCGL:
domain cards (`daggerheart_domain_cards*.json`), conditions (`daggerheart_conditions.json`),
equipment (`daggerheart_equipment.json`). No errata, Core-only, playtest, or community content has been
merged yet. When errata is incorporated later, it takes precedence and should be tagged as rank 1.
