# jsdom test harness notes

How this project verifies `daggerheart_companion.html` logic headlessly (no browser automation
works on `file://` here — see PROJECT_HANDOFF.md §6.3).

## Setup (once per machine / temp dir)

```
npm install jsdom        # anywhere; node_modules/ is gitignored
```

If jsdom is installed somewhere else, point node at it:

```
NODE_PATH=/path/to/node_modules node test_subclass_tiers.js
```

## The pattern

Load the whole HTML file into jsdom with scripts enabled, then drive the **real UI**
(click/select/input events), never internal functions directly:

```js
const dom = new JSDOM(fs.readFileSync("daggerheart_companion.html", "utf8"),
  { runScripts: "dangerously", url: "http://localhost/app.html", pretendToBeVisual: true });
```

- `url: http://localhost/...` gives the app working `localStorage`.
- The two external Firebase `<script src>` tags simply don't load in jsdom (no resource
  loader) — the app tolerates that; ignore the warnings.
- Read app state via `window.eval("App.active")` etc. — eval in the *harness* is fine;
  the app itself must stay eval-free (PROJECT_HANDOFF.md §6.1).
- After any app edit: extract the `<script>` block and `node --check` it.

## Current harnesses

| File | Covers |
|---|---|
| `test_subclass_tiers.js` | Field note #6: Foundation/Specialization/Mastery tier gating in builder + level-up, permanent stat effects (Stalwart thresholds, Nightwalker Evasion, Winged Sentinel Severe), start-at-level-N recommended paths, manual-pick blocking, dropdown gating. 46 checks. |
| `test_subclass_tiers_extra.js` | All 9 classes x 18 subclasses at L1 and L10 through the real wizard, spellcast trait stability across tiers, Play-mode armor swap preserving subclass threshold bonuses. 75 checks. |
| `test_campaign_notes.js` | Field note #1: campaign notes panel — header-button toggle, debounced autosave to `dh_campaign_notes_v1`, roster save/wipe + character switching leave notes intact, reload hydration (via `beforeParse` pre-seeding), print-sheet exclusion, blocked-storage in-memory fallback + toast. 24 checks. |
| `test_content_completeness.js` | Field note #2: content coverage panel — 📊 Coverage toolbar toggle + mutual-exclude with the other header boxes; the live `cardCoverage()` classification (interactive/guided/reference) matches the spec predicate for all 189 cards (98/51/40); rendered panel lists every domain and an honest classes/subclasses summary (all 9/18 playable + the 5 `SUBSTAT` auto-applied effects). 35 checks. |

Both default to `daggerheart_companion.html`; pass another HTML path as argv[2] to test a
backup or scratch build. Exit code 0 = all pass.
