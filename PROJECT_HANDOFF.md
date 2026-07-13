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
- ~~Mechanizing the remaining 7 domains' cards~~ — **addressed as field note #12 (2026-07-13):** all 9 domains are already annotated (coverage 101/48/40); further deepening is a small, design-gated interpreter roadmap, not a batch. See `CARD_MECHANIZATION.md`.
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

**Known non-blocking limits:** all 189 cards are annotated; interactivity is a gradient, not "Druid+Wizard only" (that line was stale — see field note #12). Live coverage is **101 Interactive / 48 Guided / 40 Reference** (2026-07-13). The remaining Guided/Reference cards use effect types the interpreter narrates but doesn't execute (conditions, buffs, weapon damage) or are GM-adjudicated by design — see `CARD_MECHANIZATION.md`. Builder was authored Druid-first but now covers all 9 classes.

---

## 4. The 8 field notes (the active backlog)

Logged from the pilot on 2026-07-05. **Progress (2026-07-09): #4 fixed, #8 verified resolved. (2026-07-10): #6 verified — 3 gaps found and fixed; #1 built. (2026-07-11): #2 built; #7 built.** Remaining active: none of the original 8 (#3 parked; #5 shipped 2026-07-09 in `25debf2`, row was stale). Post-pilot notes #9, #10 (§4b) are next. Full detail also lives in project memory (`daggerheart-pilot-feedback`).

| # | Type | Item | Notes |
|---|------|------|-------|
| 1 | ✅ Feature (BUILT 2026-07-10) | **Campaign notes section** | 📓 Notes button in the always-visible header toolbar toggles a shared free-text panel (one page for the whole campaign, reachable from Play, Roster, and every mode). Persists to its own localStorage key **`dh_campaign_notes_v1`** — never inside the roster key — with debounced autosave (400 ms + flush on blur) and the standard blocked-storage fallback (in-memory + warning toast). Excluded from the printable sheet. jsdom-verified (`test_campaign_notes.js`, 24 checks). **Needs Chance's eyes for look/feel only** (panel styling matches the Import/Export/Cloud boxes). |
| 2 | ✅ Feature (BUILT 2026-07-11) | **Content-completeness view** | 📊 Coverage button in the header toolbar toggles a read-only panel, derived **live** from the app's own card mechanics (stays accurate as cards are wired). Classifies all 189 domain cards into **Interactive** (Cast button rolls dice/tracks state), **Guided** (Cast button, narrative only), **Reference** (no button — text only): **98 / 51 / 40**, with an expandable per-domain breakdown. Plus an honest Classes & Subclasses summary (all 9/18 buildable & playable; lists the 5 auto-applied numeric subclass effects from #6's `SUBSTAT`, attributed by subclass + tier). jsdom-verified (`test_content_completeness.js`, 35 checks) and confirmed rendering in a real browser. **Needs Chance's eyes for look/feel only.** Note: the old "42/189 auto-cast" figure in §3 is superseded — every card now carries mechanics; the real signal is the interactivity gradient above. |
| 3 | Feature | **Sharing / access** — *PARKED* | Share app or access key, possibly QR. Deferred with hosting; do not build unless un-parked. |
| 4 | ✅ Bug (FIXED 2026-07-09) | **Natural Familiar** doesn't apply its extra damage die | Root cause: `summon` effect handler dropped the card's `grants` array and the app has no active-modifier system, so the +1d6 never reached a roll. Fix: while a Natural Familiar is summoned, Combat Actions shows a "🐾 Familiar adjacent (+1d6)" toggle; when on, `rollDmg` adds a d6 to weapon/beastform/spell damage with the term shown in the log. Positional condition is player-asserted (can't be auto-known). jsdom-verified. This is also the inline-math pattern #5 wants — generalize it when #5 is picked up. |
| 5 | ✅ UX (SHIPPED 2026-07-09) | **Buff/debuff math transparency** | Shipped in commit `25debf2`: modified numbers show their math inline (display-only, no rules changes) so they can be justified to the GM. Row was stale until 2026-07-10. |
| 6 | ✅ Verify (FIXED 2026-07-10) | **Spec/Mastery in build engine** | Verified end-to-end via jsdom through the real wizard/level-up UI (`test_subclass_tiers.js` + `_extra.js`, 121 checks, all 9 classes / 18 subclasses, L1–L10, start-at-level-N, armor swap). Found and fixed 3 real gaps: **(a)** tier gating was off by one — Specialization was granted from L2 and Mastery from L5; per SRD the upgraded-subclass advancement is a Tier 3/4 option only (Spec L5+, Mastery L8+); **(b)** manual advancement picks bypassed tier limits entirely (both engines now gate and warn); **(c)** the five permanent numeric subclass effects (Stalwart +1/+2/+3 thresholds, Nightwalker +1 Evasion, Winged Sentinel +4 Severe) were listed as text but never applied to stats — now baked at build/level-up via `SUBSTAT`/`featStatBonus`, and preserved through Play-mode armor swaps. Caveat: characters saved to a roster *before* this fix keep any early-granted spec/mastery (no retro-migration); rebuild or re-level to correct them. |
| 7 | ✅ UX (BUILT 2026-07-11) | **Beastform assume/drop UX** | Brought assume/drop up to where you act: the **Combat Actions panel** now shows a 🐾 Beastform **quick-launcher** (tier-grouped form `<select>` + **Assume (Stress)** / **Evolution (3 Hope)**) when not transformed — no scrolling to the bottom grid — and a **✕ Drop Beastform** button in the panel while transformed (in addition to the top status banner). **Evolution no longer uses a native `prompt()`** (which was inaccessible and silently failed in sandboxed/preview contexts): picking the +1 trait is now an in-app button picker with Cancel, spending 3 Hope only on confirm. Buttons disable on insufficient Stress/Hope. The old bottom Beastforms grid stays as the full browse/features view. jsdom-verified (`test_beastform_ux.js`, 31 checks — assume, drop, full evolution flow, cancel, disabled states, prompt-never-called) + confirmed rendering in a real browser. **Needs Chance's eyes for look/feel only.** |
| 8 | ✅ Bug (RESOLVED 2026-07-09, no code change) | **Beastform doesn't update Combat Actions + wrong buffs** | Re-tested in current build: the Druid Beastform picker path already works — transforming swaps Combat Actions to the form's attack (weapons/spells hidden) and applies trait/threshold buffs (`effTrait`/`effEva`/`thrMod`). Present in the piloted build too, so the note was already effectively resolved. Chance confirmed. Note: the separate effect-model `stateForm` path (Sage cards Wild Surge L7, Force of Nature L10) is still a stub — not this note, but real; wire it if those cards come up. |

Plus one open manual-review item in `CHANCES TO DO LIST.txt`: **visually review the character builder** (logic verified; look/feel needs Chance's eyes).

---

## 4a. Scaling & hardening assessment (added 2026-07-10)

Chance's design worry: *will the app get slow or crash once every class / domain / weapon / item is fully built out?* We read the actual render path (`daggerheart_companion.html`, Play-mode `render()` ~line 371, plus the search/picker code) and answered it. **Verdict: the fear is largely unfounded — building out more content does NOT make the play screen heavier.** No code changed; this is a recorded finding + one optional future improvement.

**Why content growth is safe (the app already does the right thing):**
- The full libraries are **never mounted on screen at once.** Card/weapon/armor/item search (`renderSpellResults`, `pickRowsHTML`) caps results at **30–40 rows** and requires a search term. The 189 cards / 346 items / 129 adversaries live in memory as *data*, not as DOM.
- Mechanizing the remaining classes adds **recipes (data) to cards, not new things to draw.** A character still only carries **≤5 loadout cards**, their weapons, and a few feats. So a fully-built-out app draws the *same* amount on the Play screen as today's half-built one. Screen weight scales with the *character*, which is capped — not with the *library*, which is what grows.

**The one real inefficiency (non-urgent):** Play-mode `render()` rebuilds the **entire** play screen (all tiles, traits, pip tracks, actions, loadout cards, all 24 beastforms, feats, equipment, vault, conditions, inventory) via `innerHTML` on **every** interaction — every pip tap calls `render()`. It's wasteful, but what it redraws is **character-sized, not library-sized**, so it stays fast. Main felt symptom: can steal input focus / scroll position mid-interaction. Not a crash risk.

**The only two per-character lists that actually grow (and redraw fully every tap):**
1. **Vault** (`CH.vault`, `renderVault`) — banked cards, **no cap**. A level-10 character could stash 30–40 cards, all redrawn on every tap.
2. **Inventory** (`CH.inv`, `renderInv`) — hoarded gear, **no cap**.
- Separately, **uploaded portrait photos** (`CH.avatar` as a data URL) remain the most likely thing to hit the browser's ~5–10 MB localStorage limit — far more than all card data combined. Watch this before the render cost.

**Recommended hardening (optional, do only if the table ever feels it):** teach `render()` to **update only what changed** instead of rebuilding the whole screen. It's a contained fix to a single function, **inside the single file — no restructuring, no build tools, no risk to the double-click model.** Splitting the app into separate files would *not* have addressed this fear and is not required.

**Bottom line for the "break it into separate engines" idea:** the stability Chance wants comes from *(a)* the already-present "never mount the whole library" pattern and *(b)* the optional targeted-redraw fix above — not from splitting files. File-splitting is a developer-edit-comfort choice, separable from stability, and still collides with `file://` (ES `import` needs a bundler or a server). Park it unless edit-pain on the 448 KB file becomes the real bottleneck.

---

## 4b. Additional field notes (added 2026-07-10, post-pilot)

New requests from Chance, not from the original pilot batch. Numbered continuing the sequence.

| # | Type | Item | Notes |
|---|------|------|-------|
| **#9** | ✅ Feature (BUILT 2026-07-11, `de99fe3`) | **Equip / unequip toggle for armor & weapons** | Active-modifier layer: weapons & armor carry an `equipped` flag toggled by a checkbox in the Weapons & Armor panel. Only equipped weapons show as Combat Actions attack rows and contribute their shield "+N Armor Score" feature; unequipping armor reversibly removes its Evasion/Agility/threshold/Score contribution and re-equipping restores it **exactly** (lossless → #6 SUBSTAT bonuses survive the cycle). Equipped is the default, so every verified number is unchanged; legacy/SEED characters migrate to all-equipped. jsdom-verified (`test_equip_toggle.js`, 42 checks). **Checkbox look/feel still needs Chance's eyes.** |
| **#10** | ✅ Feature (BUILT 2026-07-12, `d0cc41a` draft → `37a0213` applied) | **Marketplace / Tinker (buy & sell values)** | Chance approved the price model as-is (2026-07-12). **Step 1:** `rarity` added to all 60 items + 60 consumables and a homebrew `meta.priceModel` (tier + rarity tables, in handfuls) written to `daggerheart_equipment.json`, tagged `sourceTier "Homebrew (precedence rank 8)"`; app embeds `PRICE_MODEL` + a compact `ITEM_RARITY` map. **Step 2:** a **🪙 Market** header panel (mirrors Notes/Coverage) — capped search across all 346 purchasable records, each row showing a homebrew buy range + used value (priced by tier for weapons/armor, rarity for items/consumables), plus a persisted shopping list (`dh_market_list_v1`) with running buy/sell totals folded across handfuls→bags→chests. jsdom-verified (`test_marketplace.js`, 25 checks). **Prices labeled homebrew, never official.** Look/feel + the `.xlsx` review twin (no rarity column yet) are the only open follow-ups. |
| **#12** | ✅ Investigated + partial (2026-07-13) | **Mechanize the other 7 domains' cards** | **Premise was stale:** all 189 cards across all 9 domains are already annotated — the "only Druid + Wizard" note was obsolete (field note #2 superseded it). The corpus is annotated **to the interpreter's ceiling**; non-Interactive cards are that way because the *engine narrates* their effect type, not for lack of annotation. Shipped the one **faithful, no-fabrication** win: the interpreter now **executes self `heal`** (clear HP/Stress/Armor) and **stores dice-roll captures**, promoting 3 Guided cards → Interactive (Battle-Hardened, Lean on Me, Second Wind) and fixing 2 latent no-op Interactive cards (Swift Step, Unbreakable). Coverage **98/51/40 → 101/48/40**. jsdom-verified (`test_card_heal.js`, 15 checks, drives real casts + asserts HP/Stress deltas; `test_content_completeness.js` updated). **Everything further is interpreter feature work (weapon-damage, conditions, buffs) with small per-feature yield and gameplay side effects — design-gated, human-reviewed, NOT unattended.** Full findings + roadmap in `CARD_MECHANIZATION.md`. **Play-behavior note: casts now auto-change HP/Stress (like existing auto-cost) — needs Chance's eyes.** |
| **#11** | ✅ Feature (BUILT 2026-07-13) | **All four Beastform tiers + constructed-form builder** | The in-app `BEASTFORMS` list was only Tier 1–2 (12 forms); completed it to **all 24 SRD forms across four tiers**, and added a **construction engine** for the four build-your-own forms the SRD only describes in prose: **Legendary Beast / Mythic Beast** (*Evolved* templates — pick a lower-tier form, keep its whole kit, add flat bonuses; Mythic also steps the damage die up a size) and **Legendary Hybrid / Mythic Hybrid** (*combine* — pick N forms, then choose a budget of advantages + features from their union). Plus a **homebrew 25th form, Epic Hybrid** (`sourceTier` homebrew): Mythic-Hybrid power/budget (3 forms, 5 adv, 3 feats, Str +3 / d12+10, 3 Stress) but the **only** form that enforces the SRD "transform into a Beastform of your tier or lower" rule — its ingredient pool is gated dynamically to the live `CH.tier`, in both the builder UI (illegal forms aren't shown) and the engine (`buildHybrid` rejects them). The builder is an inline panel in the Beastforms card (tier filter now T1–4 + All); assembled forms reuse the exact static-form shape, so all downstream math (trait/Evasion/threshold/attack, the #5 inline-math breakdowns, drop-on-last-HP, rest/session resets) works unchanged. jsdom-verified (`test_beastform_builder.js`, 65 checks) + reconciled `test_beastform_ux.js` (was red at HEAD) + confirmed in a real browser. **Look/feel of the builder panel & chips needs Chance's eyes.** |
| **#13** | ✅ Feature (BUILT 2026-07-13) | **Buying & Selling lists in the Marketplace** | Split the single combined shopping list (which conflated buy + sell on the same items) into **two lists** — 🛒 Buying (subtotal at buy range) and 🏷️ Selling (subtotal at sell-back value) — plus a **Net (sell − buy)** line and Clear-all. Search results now offer **+ Buy** / **+ Sell**. Persists to the same `dh_market_list_v1` key as `{buy:[],sell:[]}`; the old array migrates forward into `buy`. jsdom-verified (`test_marketplace.js`, 27 checks). Extends #10. **Look/feel needs Chance's eyes.** |
| **#14** | ✅ Feature (BUILT 2026-07-13) | **Armor is a carryable list like weapons** | Armor was a single swappable slot (it already had a worn/off toggle from #9). Now `CH.armors` is a **list** — carry several pieces, **add**/**remove** each, and **wear/store** by checkbox, with **at most one worn at a time** (wearing one auto-unwears the others). The worn armor drives stats via `applyArmor()`, which is the exact lossless math from #9, so all verified thresholds/Evasion/Score/Agility numbers (incl. SUBSTAT subclass bonuses) are preserved through wear/store/swap. Legacy single-armor characters migrate to a one-entry list on mount. jsdom-verified (`test_equip_toggle.js` updated → 43 checks; `test_armor_list_and_search.js` covers the one-worn invariant + remove; `test_subclass_tiers_extra.js` armor-swap path updated). **Look/feel needs Chance's eyes.** |
| **#15** | ✅ Feature (BUILT 2026-07-13) | **Search Everything button** | New 🔎 Search All header panel (mirrors Notes/Coverage/Market, mutually exclusive) with one box that searches across **every catalog at once** — domain cards, weapons, armor, items, consumables, beastforms, and conditions — grouping matches by category (capped 6/category with "+N more"). Read-only finder. jsdom-verified (`test_armor_list_and_search.js`). **Look/feel needs Chance's eyes.** |

**#9 design note.** Today the app applies gear effects *immediately and destructively*: `swapArmor` bakes the armor's Evasion/Agility/threshold/Armor-Score deltas straight into base stats, and weapons are always "on." This note wants gear to carry an **equipped flag** and only contribute its bonuses while checked. That is exactly the **"active-modifier system" the app currently lacks** — the same gap called out in #4's root cause (the Natural Familiar +1d6). Doing #9 well likely means building a small "what's currently applied" layer that `render()` reads, rather than mutating base stats — which would also make #4/#5-style inline math cleaner. Watch the direct stat mutation on Evasion / thresholds / Armor Score / Agility when converting.

**#10 design note — pricing source RESOLVED (2026-07-10, with Chance).** Build a **clearly-labeled homebrew price table** keyed by **tier** (weapons/armor) and **rarity** (consumables / loot / magic items); each cell gives a **buy range + used/sell value** — e.g. *Short Sword · common · 1–3 handfuls · used value 1 handful*. This **obeys the standard precedence** (`SOURCES_precedence.md`), not a special case: the homebrew table sits at **rank 8 (community/homebrew)**, tagged via `sourceTier` like every other record; if official prices are ever published (errata/Core, rank 1/3) they **supersede** it automatically. **No fabricated "official" prices.**

*Data gap — a content task comes before the UI.* The equipment dataset carries `tier` but **no `rarity` field and no price/value fields**. So step 1 is data: **(a)** add `rarity` to the item classes that use it (consumables/loot/magic items; weapons & armor stay tier-keyed), and **(b)** author the homebrew buy-range + used-value model per tier/rarity, all tagged homebrew. Step 2 is the UI (search → shopping list → range display), which reuses the existing capped-search picker pattern (30–40 cap).

**#11 design note.** The SRD's Tier 3–4 Beastforms include four forms that aren't fixed stat blocks — they're *recipes* (Legendary/Mythic Beast evolve a lower form; Legendary/Mythic Hybrid combine several). The engine (`buildEvolved`/`buildHybrid`, exposed for tests as `Sheet._build.*`) assembles a concrete form object in the **same shape** as a static `BEASTFORM`, so the constructed form drops straight into `aForm()`/`activate` and every existing stat path just works — no parallel code path. Transient builder picks live in a module-level `bfBuild` (not saved to the session); the assembled form is stored in `S.bfBuilt` and cleared on drop/rest/new-session. The homebrew **Epic Hybrid** is the tier-enforcement variant Chance asked for: same power as Mythic but ingredient tiers are computed live from `CH.tier` (`hybridTiers()`), so it's the one legal-by-construction apex option. **Decision (2026-07-13): the Epic Hybrid *card* stays ungated — buildable at any character tier; only its ingredient pool scales with tier. Do not add a minimum-tier gate.** Two calls worth knowing: the Mythic/Epic "damage die +1 size" caps at **d12** (SRD examples stop there), and constructed forms are **not** listed in the Combat-Actions quick-launcher (they need choices) — they're built from the grid only. Note: `daggerheart_beastforms.json` remains the 24 official SRD forms; Epic Hybrid is an app-only homebrew addition (25th form in the app's `BEASTFORMS`).

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
