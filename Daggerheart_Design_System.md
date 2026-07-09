# Daggerheart App — Design System (Concept A: dark-fantasy grimoire)

The visual + interaction spec the app is built against. Tokens live in `design_tokens.css`
(CSS variables) and `design_tokens.json` (programmatic). This doc says how to use them.
Reference look: `mockup_concept_A_grimoire.html`.

## 1. Principle: two registers

Design every screen as one of two modes. This is the core rule.

- **Lean-back (atmospheric):** character identity, domain-card library, gear browsing, level-up. Lush is good here — gold filigree, Cinzel display, jewel-tone framing, the banner, portraits/art.
- **Lean-in (live play):** the combat sheet — HP/Stress/Hope/Armor, the dice, attacks, active cards. Ruthlessly clean: high contrast, big tap targets (≥44px), glanceable in a dim room. Ornament must never cost a read here.

When in doubt on a play surface, cut decoration. When in doubt on an identity surface, add atmosphere.

## 2. Color

Use tokens, never raw hex. Surfaces go darkest→lightest `--dh-bg` → `--dh-panel-2`. Gold (`--dh-gold`)
is the one true accent — it marks the spellcast trait, primary actions, card edges. Don't let gold become
wallpaper; if everything's gold, nothing reads.

**Resources have fixed colors** (muscle memory): HP red, Stress amber, Armor teal, Hope gold.
**Fear** uses ember; **Hope** (the roll outcome) uses gold; **critical** uses success-green.

### Domain color system (wayfinding + decoration)
Each domain owns a hue — used on card frames, badges, loadout grouping, and filters. Set `--dc` on a card
(or use `.dh-domain-<name>`): Arcana purple, Blade red, Bone tan, Codex blue, Grace pink, Midnight indigo,
Sage green, Splendor gold, Valor orange. A player should recognize a card's domain by color before reading it.

## 3. Typography (4 roles)

- `--dh-font-display` (Cinzel Decorative) — hero only: character name, screen titles. Sparingly.
- `--dh-font-heading` (Cinzel) — section labels, ALL CAPS, letter-spaced ~2px, gold.
- `--dh-font-flavor` (EB Garamond) — card flavor text and rules prose (warm, readable at length).
- `--dh-font-data` (Inter) — **all numbers, stats, and UI controls.** This is the legibility workhorse;
  every value the player reads under pressure is Inter, not a serif.

Rule of thumb: serif for *identity and story*, sans for *numbers and actions*.

## 4. Shape, spacing, motion

Cards `--dh-radius-card` (13px), controls `--dh-radius-ctrl` (9px), pills `--dh-radius-pill`.
Card top edge gets the thin gold gradient rule (see mockup). Shadows/glows (`--dh-glow-gold`) are for
lean-back surfaces only. Tap targets ≥ `--dh-tap-min` (44px). Motion: fast (120–180ms), purposeful;
dice roll is the one place a slightly longer, satisfying animation is welcome.

## 5. Components

- **Banner** — portrait (circle, gold ring), name (display), heritage line (heading/gold), domain pills,
  spellcast trait, hex level badge. Lean-back; this is where character art lives.
- **Stat tiles** — 6-up grid; Inter value (big) + Cinzel label (small gold). Evasion, Armor, Proficiency,
  Major, Severe, Hope.
- **Trait tiles** — 6 traits; spellcast trait gets the gold border + glow. Tapping a trait = rolls it (see §6).
- **Resource tracks** — two render modes:
  - *Pips* (shaped SVG: HP hearts, Stress triangles, Hope diamonds, Armor shields) on identity/character view.
  - *Segmented bars* on the live-combat view (faster to read at a glance). **Decision: pips on the character
    sheet, bars in combat mode.** Both are in the mockups (A = pips, C = bars).
- **Domain card** — physical-card object: colored header (`--dc`) with level badge + recall cost, domain·type
  strip, flavor body, footer with the cast/use button. Vaulted cards desaturate.
- **Buttons** — primary = gold gradient on dark; secondary = ghost with `--dh-line-2` border; destructive uses
  `--dh-danger`. One primary action per view.

## 6. Dice system (core interaction)

Two ways to roll, both built in:

### a) Tap-to-roll (driven by the effect model)
Any rollable element — a **trait**, **weapon**, **spell/domain card**, or **beastform attack** — is tappable.
Tapping casts the correct roll automatically, because the card/weapon mechanics already declare it
(see `Daggerheart_Effect_Model_Spec.md`): the app reads `roll.using` (spellcast/trait/attack), applies the
trait modifier + Proficiency + relevant Experiences, rolls, and shows the result.

- **Duality roll** (action rolls): roll Hope d12 + Fear d12 + modifiers. Display the total, then the outcome
  banner — **with Hope** (gold), **with Fear** (ember), or **critical** (green, on matching dice) — plus the
  Hope/Fear/Stress consequence, and SUCCESS/FAILURE if a Difficulty is set. Auto-apply outcome (gain Hope / GM
  gains Fear / clear Stress on crit) with a one-tap undo.
- **Damage roll**: rolls the weapon/spell dice × Proficiency + bonus, honoring `scaleBy:"proficiency"`,
  applies on-fire/condition riders, and offers "apply to target."
- **Reaction / dice-pool / forceReaction**: handled per the effect model (e.g., "roll N d6, any 6").

### b) Manual dice tray (ad-hoc)
A persistent dice tray for any roll the table calls for outside a declared action: pick dice (d4–d12, d20,
d100, plus the Duality pair), set a count and a +/- modifier, roll, see results and total. Supports advantage/
disadvantage and "roll as Duality." Keep a short roll history/log. This is always available, independent of
any character element.

Both modes share one dice engine and one result display. Result display lives on the lean-in surface: large
total, clear outcome color, minimal chrome.

## 7. Accessibility

- Contrast: body/data text ≥ 4.5:1 on its surface; gold-on-dark passes for large text — don't use gold for
  small body copy. Don't encode meaning by color alone.
- **Colorblind-safe domains:** hue + always a text label/icon (never color-only). Offer a high-contrast toggle.
- Respect dynamic type / scalable font sizes; never hard-cap below 11px.
- Honor reduced-motion (shorten/)disable the dice animation).
- Every icon-only control (pips, dice) has an accessible label and a non-tap alternative (+/- steppers).

## 8. Responsive (phone + desktop)

- Phone: single column; sticky bottom bar for the dice tray + most-used actions; sections collapsible.
- Desktop/tablet: multi-column grid (e.g., resources + dice side by side; domain loadout as a wider gallery).
- Same components, reflowed — design mobile-first, enhance up. Lean-in surfaces stay one-thumb operable.

## 9. Files
- `design_tokens.css` — CSS variables (import at app root).
- `design_tokens.json` — same tokens for the build's theme config.
- `mockup_concept_A_grimoire.html` — reference implementation of this system.
- Resource pip SVGs live in the mockup's script (`pip()`); lift them into a shared icon set.
