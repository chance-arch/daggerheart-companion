# Daggerheart App — Progress Assessment & Roadmap

_Proposed plan, 2026-06-26. Steer freely._

## Where we are: the foundation is built

We set out to build the content database first, then the app. The **foundation phase is essentially
complete** — data, rules model, design language, and art are all done and verified.

### Done
- **Content library** (all SRD rank-4, in project folder; catalogued in `DATA_INDEX.md`)
  - 189 domain cards — **fully mechanized** (machine-readable effects) + QA'd
  - 14 conditions · 346 equipment · 27 heritage · 9 classes / 18 subclasses · 24 beastforms
- **Effect model v1** (`Daggerheart_Effect_Model_Spec.md`) — locked, proven across all 189 cards
- **Source-precedence policy** (`SOURCES_precedence.md`) — errata→…→community; Hope & Fear opt-in
- **Design system** (Concept A "dark-fantasy grimoire") — `Daggerheart_Design_System.md` + `design_tokens.css/json`
- **Ownable art** — 9 class + 9 domain sigils, 18 ancestry + 9 community emblems, frames, card back (all vector)
- **Mockups** — character sheet in 3 concepts (A chosen)
- **Dice system** — designed: tap-to-roll (reads the effect model) + manual dice tray

### Not yet built
- The **working application** itself — nothing functional yet beyond the original Theron HTML + static mockups
- **Tech stack** not locked (task #2)
- **Builder, sheet, dice engine** — designed, not implemented
- **Accounts / cross-device sync** (the "full web app" goal)
- Deferred/optional: adversaries + environments (GM content, index already fetched), leveling automation,
  AI hero-art layer, printable sheet, schema verification pass (#4)

**The inflection point:** we have a complete content + design foundation and no app yet. The path forward
is the **build**.

## Proposed build sequence

**Phase 1 — Stack + scaffolding.** Lock the stack, scaffold the project, wire `design_tokens` as the theme,
load the content JSON. _Recommendation:_ React + Vite + TypeScript; local-first data (content bundled, character
saves in browser storage) so it works offline at the table; **Supabase** added later for accounts + sync.

**Phase 2 — Character sheet (runtime) — the vertical slice.** Render Theron from the data in Concept A:
resource tracks, traits/stats, domain loadout, and the **dice engine** (tap-to-roll + manual tray) + damage
calculator. This proves data → design → dice end-to-end and is immediately usable. _Recommended first build._

**Phase 3 — Character builder.** The guided wizard (Getting Started → Class → Heritage → Traits → Equipment →
Domain cards → Level), enforcing legal choices via the "choice-object" model, with sigils/art + portrait upload.

**Phase 4 — Persistence, multi-character, sync.** Multiple characters; Supabase accounts + cross-device sync.

**Phase 5 — Polish & expand.** Leveling automation, printable/offline (PWA), AI hero-art, optional GM content.

## The decision in front of us
1. **Confirm the stack** (React + Vite + TS + local-first, Supabase later) — or pick another.
2. **First build target:** the **character sheet vertical slice** (recommended — fastest proof, immediately
   useful) vs. starting with the builder.

Everything else (deferred content, sync, AI art) slots in after the core loop works.
