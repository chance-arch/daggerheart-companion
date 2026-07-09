# PROJECT HANDOFF — Daggerheart Companion App

> **A note left in the glovebox for the next Claude.**
> This project folder is being moved to a new account. Same folder, same files, fresh Claude.
> Read this first, then `DATA_INDEX.md`. Everything you need is already here.

- **Handoff date:** 2026-07-09
- **Owner:** Chance Dodson
- **Status:** Active, but scope was deliberately dialed back on this date (see below).
- **What this is:** A single-file, offline character-creation + gameplay companion app for **Daggerheart** (Chance's own table). Product name: *"Definitely Not Cursed: The Wanderer's Survival Guide."*

---

## 1. The one-paragraph version

The app is **one file**: `daggerheart_companion.html`. It builds Daggerheart characters (all 9 classes), plays them at the table (dice, HP/Stress/Hope/Armor, domain cards with real cast logic, beastforms, conditions, gear, leveling, printable sheet), and saves the roster to the browser's localStorage. It runs by double-clicking — no server, no accounts, no install. The full SRD content library (cards, classes, heritage, equipment, adversaries, etc.) has been extracted, mechanized where it matters, and verified against the official SRD. The app has been field-piloted; that pilot produced **8 field notes** (below) which are the active work. **As of 2026-07-09 the scope is intentionally narrow: keep this same single-file app, work the 8 field notes, iterate. Do not start new architecture.**

---

## 2. Go-forward scope (decided 2026-07-09) — READ THIS BEFORE DOING ANYTHING

Chance ran a scope-discovery reset. The direction is **aggressively dialed back**:

**IN SCOPE**
- Keep `daggerheart_companion.html` as the product. Same structure, same type of app.
- Work the **8 field notes** from the pilot (Section 4). Iterate from there.
- Sequencing of the 8 is decided **live in the working session** — do not assume an order; ask Chance what to pick up. (Claude's standing suggestion when asked: bugs first — #4 and #8 are wrong gameplay math — then UX, then features.)

**PARKED (frozen — do NOT resume without Chance's explicit go-ahead)**
- **React port** — the half-built rewrite in `daggerheart-app/` (Vite + React, 14 reusable UI components). Real work, mid-flight, but a full rewrite is the opposite of dialing back. Leave the folder untouched. Revisit only after field notes are handled and Chance decides the new foundation is worth it.
- **Hosting + sharing / accounts** — the `hosting/` folder (Firebase). Pilot item #3 (share via link/QR/access key) is deferred. The app stays single-file + localStorage. Do not build distribution.

**NATURALLY OUT (not field notes, so not near-term work)**
- Mechanizing the remaining 7 domains' cards (only Druid + Wizard L1 cards, 42 of 189, are fully auto-cast; the rest render as verbatim reference text — this is fine and by design for now).
- GM-side tooling (adversary/environment UI). The data exists; there's no app surface and none is planned yet.

**Rule of thumb for the next Claude:** if a task grows the app's architecture or surface area rather than fixing/iterating what's piloted, stop and confirm with Chance first.

---

## 3. Current state — what works

`daggerheart_companion.html` (~445 KB, single self-contained file) is the **primary app**. Modes: **Roster / Build / Play / Level-Up**, all on one in-memory character; roster auto-saves to localStorage (key `dh_companion_roster_v1`).

Verified working (logic confirmed via jsdom harness on 2026-06-29, all 9 classes end-to-end):
- **Build** — guided wizard: class/subclass, heritage (incl. Mixed Ancestry), traits (Standard Array / Recommended / Custom-Roll), equipment, domain cards (loadout cap 5), and start-at-any-level 1–10 with a pre-filled recommended advancement path.
- **Play** — tap-to-roll traits/weapons/spells (Duality with Hope/Fear/crit), interactive HP/Stress/Armor/Hope pips, domain cards driven by a generic effect interpreter, beastforms, Elemental Incarnation, conditions tracker, weapon/armor swap from full tiered tables, vault management, combat-actions panel, manual dice tray, damage calculator.
- **Level-Up** — delta engine on existing characters (tier achievements, 2 advancements/level, cards, multiclass at L5+).
- **Print** — official-style printable sheet via the browser (Save-as-PDF).
- **Flavor layer** — splash, first-launch notice, in-world label toggle (off by default).

Content library (all Official SRD, verified clean 2026-06-29): 189 domain cards, 9 classes / 18 subclasses, 27 heritage, 346 equipment, 24 beastforms, 14 conditions, 129 adversaries, 19 environments, leveling rules. Catalog in `DATA_INDEX.md`.

**Known non-blocking limits:** only Druid + Wizard L1 cards fully auto-cast (rest are reference text); the 24 inherently GM-adjudicated cards stay manual; builder was authored Druid-first but now covers all 9 classes.

---

## 4. The 8 field notes (the active backlog)

Logged from the pilot on 2026-07-05. **Progress (2026-07-09): #4 fixed, #8 verified resolved.** Remaining active: #1, #2, #5, #6, #7 (#3 parked). Full detail also lives in project memory (`daggerheart-pilot-feedback`).

| # | Type | Item | Notes |
|---|------|------|-------|
| 1 | Feature | **Campaign notes section** | Free-text area for campaign notes, separate from character data. |
| 2 | Feature | **Content-completeness view** | Surface which classes/subclasses/cards are fully mechanized vs. reference-only, in-app, so Chance knows what's fully playable. (Answer already known — see §3 — needs a UI.) |
| 3 | Feature | **Sharing / access** — *PARKED* | Share app or access key, possibly QR. Deferred with hosting; do not build unless un-parked. |
| 4 | ✅ Bug (FIXED 2026-07-09) | **Natural Familiar** doesn't apply its extra damage die | Root cause: `summon` effect handler dropped the card's `grants` array and the app has no active-modifier system, so the +1d6 never reached a roll. Fix: while a Natural Familiar is summoned, Combat Actions shows a "🐾 Familiar adjacent (+1d6)" toggle; when on, `rollDmg` adds a d6 to weapon/beastform/spell damage with the term shown in the log. Positional condition is player-asserted (can't be auto-known). jsdom-verified. This is also the inline-math pattern #5 wants — generalize it when #5 is picked up. |
| 5 | UX | **Buff/debuff math transparency** | When a shown number is modified by an active effect, show the math inline so it can be justified to the GM. Currently modifiers apply silently. |
| 6 | Verify | **Spec/Mastery in build engine** | Confirm the builder/level-up actually factors subclass Foundation/Specialization/Mastery tiers, against a real build (not just the headless test). Memory says yes — verify end-to-end. |
| 7 | UX | **Beastform assume/drop UX** | Needs a clearer, more accessible way to activate/exit Beastform. An "✕ Exit Beastform" button exists but isn't good enough. |
| 8 | ✅ Bug (RESOLVED 2026-07-09, no code change) | **Beastform doesn't update Combat Actions + wrong buffs** | Re-tested in current build: the Druid Beastform picker path already works — transforming swaps Combat Actions to the form's attack (weapons/spells hidden) and applies trait/threshold buffs (`effTrait`/`effEva`/`thrMod`). Present in the piloted build too, so the note was already effectively resolved. Chance confirmed. Note: the separate effect-model `stateForm` path (Sage cards Wild Surge L7, Force of Nature L10) is still a stub — not this note, but real; wire it if those cards come up. |

Plus one open manual-review item in `CHANCES TO DO LIST.txt`: **visually review the character builder** (logic verified; look/feel needs Chance's eyes).

---

## 5. Where everything lives (folder map)

**The product**
- `daggerheart_companion.html` — the app. This is the one that matters.
- `daggerheart_companion.backup-*.html` — dated backups. Make a new one before big edits.

**Content library** (JSON = source of truth, `.xlsx` = review twin)
- `DATA_INDEX.md` — canonical catalog. **Open this second.** Regenerate with `build_data_index.py` when data changes.
- `daggerheart_domain_cards_annotated.json` (mechanized cards), `daggerheart_classes.json`, `daggerheart_heritage.json`, `daggerheart_equipment.json`, `daggerheart_beastforms.json`, `daggerheart_conditions.json`, `daggerheart_leveling.json`, `daggerheart_adversaries.json`, `daggerheart_environments.json`.

**Specs & design**
- `Daggerheart_Effect_Model_Spec.md` — the v1 (locked) effect vocabulary that card mechanics use.
- `Daggerheart_Design_System.md` + `design_tokens.css` / `.json` — the "dark-fantasy grimoire" design system.
- `SOURCES_precedence.md` — source-of-truth precedence policy (Errata > Core > SRD > …).
- `PROJECT_ROADMAP.md` — the original 5-phase roadmap. **Note: superseded by the dialed-back scope in §2.** Keep for reference, don't follow it literally.

**Parked (frozen)**
- `daggerheart-app/` — the React port. Do not touch.
- `hosting/` — Firebase distribution setup. Do not touch.

**Legacy / reference**
- `Theron_Character_App.html` — the original single-character play aid that seeded the whole design.
- `daggerheart_sheet.html`, `daggerheart_builder.html` — earlier standalone slices, superseded by the companion.
- Mockups: `mockup_concept_A_grimoire.html` (the chosen look), `_B_*`, `_C_*`, `flavor_mockup.html`, `art_sigils_preview.html`, `art_emblems_preview.html`, `print_preview.html`.

---

## 6. Gotchas the next Claude must know (learned the hard way)

1. **The app must stay eval-free.** No `new Function()` / `eval`. In a sandboxed preview with a strict CSP they silently return 0 and the app *looks* broken while passing every node test. The effect interpreter already uses a hand-written recursive-descent parser instead — keep it that way.
2. **Write/Edit tools truncate large payloads (~22–23 KB).** The companion file is ~445 KB. To edit it safely: make targeted `Edit` string-replacements, or build from sub-22 KB parts in the scratch dir and `cat` them together via bash. Never rewrite the whole file in one Write. Always `node --check` the extracted `<script>` after.
3. **Can't open `file://` in Chrome automation here, and no headless browser binary is downloadable.** Logic is verified with **jsdom** in the sandbox (fidelity ceiling). Visual/CSS/responsive/print-appearance still needs **Chance's eyes** — flag those for him rather than claiming them done. SVG shapes can be QA'd by rasterizing with `cairosvg` → PNG → Read.
4. **localStorage on `file://`** is reliable in Chrome but the app warns + falls back to in-memory if blocked. Roster key: `dh_companion_roster_v1`.
5. **Rules accuracy is non-negotiable.** Official sources only (Core Rulebook, SRD, Demiplane Nexus, Darrington Press). Never substitute D&D mechanics. Every content record carries `source`/`sourceTier`; conflicts resolve by `SOURCES_precedence.md`. When a rule can't be verified, say so — never fabricate mechanics.

---

## 7. How to start the first session in the new account

1. Read this file, then `DATA_INDEX.md`.
2. Confirm with Chance which field note(s) to pick up — he sequences live.
3. Back up `daggerheart_companion.html` (dated copy) before editing.
4. Work the item. Verify logic with jsdom; hand visual/print checks to Chance.
5. Keep it eval-free, keep edits surgical, keep it single-file.

*Same car, new driver. Keys are in the ignition, tank's full, and the weird noise from the beastform panel is documented in §4. Drive safe.*
