# Session report — 2026-07-19: Domain-card audit (field note #17) + field note #16 logged

Session scope: Chance field-noted that Corrosive Projectile's damage doesn't match the Daggerheart book
and demanded a complete audit of all domain cards. Also logged (separately, earlier in the session)
field note #16: Search Everything needs a "show all" option — OPEN, not built.

## 1. What was found

- **Corrosive Projectile (Sage L3)** read "deal **6d4** magic damage using your Proficiency". The book
  says **d6+4** — in Daggerheart notation, Proficiency sets the dice *count*, so `dX+Y` is the only form
  that parses with "using your Proficiency". Confirmed via Demiplane (rank 7 tie-breaker) and
  daggerheart.su.
- **Root cause:** our scrape source **daggerheartsrd.com is a fan transcription, and it garbled the
  notation** — our data matched the site exactly, so an audit against the site would have found
  *nothing*. The audit had to run against an independent transcription lineage.
- **Audit method:** full-text diff of all 189 cards (normalized) against
  [seansbox/daggerheart-srd](https://github.com/seansbox/daggerheart-srd) `.build/03_json/abilities.json`,
  a conversion of the **official SRD PDF** (repo carries the source PDFs, latest 2025-09-09).
  Disagreements tie-broken via Demiplane and daggerheart.su per `SOURCES_precedence.md`.
  Result: **21 diffs → 17 real errors in our data, 4 comparison-source OCR typos (ours kept)**.

## 2. The 17 corrections (applied to every copy)

**Damage-notation class (6 cards)** — text fixed and mechanics dice re-encoded to `{count:1}` +
`bonus`, so Proficiency scales the count as the book intends:

| Card | Was | Now |
|---|---|---|
| Corrosive Projectile (Sage L3) | 6d4 | **d6+4** |
| Telekinesis (Arcana L6) | 12d4, "using your Proficiency Die." | **d12+4**, "using your Proficiency. **This spell then ends.**" |
| Bolt Beacon (Splendor L1) | 6d8+2 | **d8+2** |
| Book of Norai (Codex L3) | 4d20+5 | **d20+5** |
| Preservation Blast (Arcana L4) | 8d8+3 | **d8+3** (see open question below) |
| Rain of Blades (Midnight L1) | 1d8+2 | **d8+2** (text only; mechanics were already count 1) |

**Other corrections (11 cards):** Know Thy Enemy — bullet is "Their **tactics** and standard attack
damage dice", and marking a Stress removes a **Fear** (not a Stress) from the GM's Fear Pool;
Bare Bones — Tier 4 thresholds **15/38** (was 15/35); Enrapture — recall cost **0** (was 1);
Forager — option 1 is "**A unique food**" (was "An unusual flower"); Book of Ava — "**Tava's** Armor"
(was Tova's, text + ability label); Book of Sitil — "**Parallela**" (was Parallecta) and "can **hit** an
additional target" (was "roll"); Book of Korvax — "within Melee range, **or** who enter Melee range";
Manifest Wall — "a side of **your** choice"; Reassurance — "after **an** ally attempts"; Rousing
Strike — "you and **all** allies"; Conjure Swarm — "targets you **succeeded** against".

**Deliberately NOT changed (4):** Earthquake ("dicult" is the comparison repo's OCR loss of an "ffi"
ligature), Tempest ("temporararily" likewise), Confusing Aura & Wall Walk (trailing-period only).
Stunning Sunlight / Falling Sky / Chain Lightning etc. keep fixed dice — they don't say "using your
Proficiency" and both transcriptions agree.

**Copies updated (5):** `daggerheart_domain_cards_annotated.json` (source of truth),
`daggerheart_domain_cards.json` (text-only), the app's `CARDS` embed, `SEED_THERON`'s stored copy of
Corrosive Projectile, `daggerheart_domain_cards.xlsx` review twin (16 text cells + Enrapture recall).
`DATA_INDEX.md` regenerated. Both JSONs now carry a `meta.audit` provenance line. All fixes were applied
by a count-verified script with JSON round-trip guards (aborts rather than rewrite on format drift).

## 3. New code: card-copy refresh migration

Saved characters store domain-card copies **by value**, so data corrections would never reach existing
rosters (local or cloud) — Chance's own character would have kept showing 6d4 forever. Added
`refreshCardCopies(list)` (companion HTML, next to `Store`): on **every boot and cloud adopt**, each
stored copy's seven library fields (`name`-matched) are rewritten from the live `CARDS`; runtime keys on
the copy (`tokens`, `mode`) and names not in the library (homebrew) are untouched. Boot already re-saves
the roster, and `Store.save` is hooked by cloud sync, so healed rosters propagate to Firestore
automatically. This is permanent plumbing: any future card correction now reaches saved characters with
no migration code.

## 4. Verification

- Audit diff re-run after fixes: **only the 4 known comparison-source artifacts remain**; zero
  mechanical diffs. Residual grep for all wrong strings: clean (the one "4d20+5" left is Stunning
  Sunlight's legitimate fixed dice).
- Full jsdom suite: **12 files, 418 checks, all green**, including new `test_card_refresh.js`
  (10 checks: heal on boot, mechanics re-encode, tokens survive, homebrew untouched, vault healed,
  healed roster persisted). Coverage gradient unchanged at 101/48/40.
- Backup taken first: `daggerheart_companion.backup-2026-07-19-pre-card-audit.html`.

## 5. Decisions recorded

- **Audits must use an independent transcription lineage** — checking data against its own scrape
  source proves nothing. Recorded in `SOURCES_precedence.md`, which also now flags daggerheartsrd.com
  as a fan transcription with known errors.
- **Stored card copies are refreshed from the library on every load** (see §3) — corrections are now a
  data-only concern.
- **Preservation Blast open design question (for Chance):** the book says "d8+3 magic damage using your
  **Spellcast trait**" — the interpreter has no trait-scaled dice, so the card now rolls a flat 1d8+3
  with the correct wording shown (previously a flat-out-wrong fixed 8d8+3). If trait scaling is wanted,
  `scaleBy:"spellcastTrait"` in the damage executor is a small, design-gated follow-up.
- **Table impact:** six cards now deal book-correct damage — numbers players have been seeing will
  change (mostly downward; the old fixed counts over-rolled at low Proficiency).
- **Not yet audited:** conditions and equipment datasets share the daggerheartsrd.com lineage and have
  not had this treatment. Candidate follow-up field note.

## 6. Also this session (separate commits)

- Field note **#16** logged (OPEN): Search Everything "+N more" should be expandable / show-all.
- Retrieved the cloud sync code from Chrome's local storage for Chance (not stored in the repo).
