# Marketplace Price Model — HOMEBREW — DRAFT FOR REVIEW

> **STATUS: HOMEBREW / DRAFT FOR CHANCE'S REVIEW — NOT OFFICIAL DAGGERHEART CONTENT.**
> Daggerheart publishes no gold prices for equipment. Everything below is invented for this table's
> convenience, sits at **precedence rank 8 (community/homebrew)** per `SOURCES_precedence.md`, and is
> superseded automatically (via `sourceTier`) if official prices are ever published.
> Nothing is applied to `daggerheart_equipment.json` until this draft is approved.

Field note **#10** (PROJECT_HANDOFF.md §4b), step 1 of 2 (data before UI).
Gold denominations per the app's gold tracker: **10 Handfuls = 1 Bag, 10 Bags = 1 Chest**.

---

## 1. Proposed rarity scale (items & consumables)

Weapons and armor already carry `tier` (1–4) and stay tier-keyed. Items and consumables have
`tier: null` in the SRD data, so they need a **rarity** bucket. Proposal: **four buckets**, judged
from each item's actual description (power level, uses per rest, permanence, campaign impact):

| Rarity | Heuristic (assign the *lowest* bucket that fits — be conservative) |
|---|---|
| **Common** | Mundane or near-mundane utility; small one-shot bonuses (+1 to *next* roll); minor healing (~1d4); anything a village shop could plausibly stock. |
| **Uncommon** | Reliable magic with real table impact but limited scope: per-rest activations, single-weapon enhancements, sustained +1s until rest, mid healing. |
| **Rare** | Permanent stat increases, always-on movement/utility magic, big burst damage (~2d20 AoE), effects that bend action economy or negate a hit. |
| **Legendary** | Campaign-warping or encounter-deleting: permanent teleport networks, cancelling GM Fear, 4d20–8d20 AoE, full-party resets, save-or-die. |

Example calls per bucket (one-line reasoning, from the descriptions in `daggerheart_equipment.json`):

- **Common** — *Manacles* (mundane cuffs + key); *Glider* (one Stress to fall safely); *Minor Health Potion* (clear 1d4 HP); *Stride Potion* (+1 to a single next roll).
- **Uncommon** — *Bloodstone* (adds the Brutal feature to one weapon); *Corrector Sprite* (advantage on one attack per short rest); *Major Health Potion* (1d4+2 HP); *Gill Salve* (breathe underwater for minutes = level).
- **Rare** — *Attune Relic* (permanent +1 to a trait); *Gecko Gloves* (at-will climb walls and ceilings); *Improved Arcane Shard* (2d20 AoE magic damage); *Homet's Secret Potion* (next successful attack auto-crits).
- **Legendary** — *Portal Seed* (permanent teleportation network); *Ring of Unbreakable Resolve* (cancels a spent GM Fear); *Stardrop* (8d20 AoE at Very Far); *Feast of Xurla* (clear ALL HP and Stress + 1d4 Hope).

Why 4 buckets and not 3 or 5: three buckets forces Portal Seed and a healing potion recipe within
one step of each other; five invents a distinction ("very rare" vs "legendary") the 120-item pool
can't actually support — the legendary bucket only has 7 members as it is.

---

## 2. Homebrew price table (the actual model)

All prices in Handfuls (h), Bags (b), Chests (c). **Buy = merchant asking range** (the spread is
deliberate GM haggling/region room). **Used/sell** = what a merchant pays for a used one,
≈ 30–50% of the low buy price, floored at 1 handful.

### Weapons & armor — keyed by TIER

| Tier | Buy range | Used / sell |
|---|---|---|
| 1 | 1–5 handfuls | 1 handful |
| 2 | 1–3 bags | 4 handfuls |
| 3 | 5–10 bags | 2 bags |
| 4 | 1–3 chests | 4 bags |

### Items (permanent) — keyed by RARITY

| Rarity | Buy range | Used / sell |
|---|---|---|
| Common | 1–3 handfuls | 1 handful |
| Uncommon | 5 handfuls – 2 bags | 2 handfuls |
| Rare | 3–8 bags | 1 bag |
| Legendary | 1–3 chests | 4 bags |

### Consumables — keyed by RARITY (cheaper than permanent items: single-use)

| Rarity | Buy range | Used / sell |
|---|---|---|
| Common | 1–2 handfuls | 1 handful |
| Uncommon | 3–6 handfuls | 1 handful |
| Rare | 1–3 bags | 4 handfuls |
| Legendary | 5–10 bags | 2 bags |

**Design rationale.**
- *Anchored to the tracker.* A level-1 party's gold is counted in single handfuls, so tier-1/common
  gear must be affordable in ones-of-handfuls (matches the handoff's own example: *"Short Sword ·
  common · 1–3 handfuls · used value 1 handful"*).
- *Progression curve.* Each tier/rarity step is roughly ×3–4 on the low end (1h → 1b → 5b → 1c),
  mirroring the game's tier cadence without D&D-style five-digit prices. Top end stops at **low
  chests** — a chest stays a treasure-hoard quantity, never pocket change.
- *Sell ≈ 30–50% of low buy.* Merchants profit; players can't money-pump by buy-and-resell. Floor
  of 1 handful keeps the math playable at the table.
- *Ranges, not points.* The spread is the GM's haggling, scarcity, and regional-pricing dial —
  no extra rules needed.
- *Consumables under permanents.* Single-use magic at the same rarity costs roughly half the
  permanent equivalent, so potions stay a resource players actually spend.

---

## 3. Full rarity assignment — every item & consumable (veto line-by-line)

Machine-readable twin: `scratch_rarity_proposal.json`. Question-marked calls are argued in §4.

### Items (60)

| Item | Rarity | | Item | Rarity |
|---|---|---|---|---|
| Airblade Charm | uncommon | | Piercing Arrows | uncommon |
| Alistair's Torch | common | | Piper Whistle | common |
| Arcane Cloak | common | | Portal Seed | **legendary** |
| Arcane Prism | rare | | Premium Bedroll | common |
| Attune Relic | rare | | Ring of Resistance | rare |
| Bag of Ficklesand | common | | Ring of Silence | uncommon |
| Belt of Unity | rare | | Ring of Unbreakable Resolve | **legendary** |
| Bloodstone | uncommon | | Shard of Memory | rare |
| Bolster Relic | rare | | Skeleton Key | uncommon |
| Box of Many Goods | uncommon ? | | Speaking Orbs | rare |
| Calming Pendant | uncommon | | Stride Relic | rare |
| Charging Quiver | uncommon | | Suspended Rod | uncommon |
| Charm Relic | rare | | Valorstone | uncommon |
| Clay Companion | uncommon | | Vial of Darksmoke Recipe | uncommon |
| Companion Case | uncommon | | Woven Net | common |
| Control Relic | rare | | Corrector Sprite | uncommon |
| Dual Flask | common | | Elusive Amulet | rare |
| Empty Chest | uncommon | | Enlighten Relic | rare |
| Fire Jar | common | | Flickerfly Pendant | rare |
| Gecko Gloves | rare | | Gem of Alacrity | uncommon ? |
| Glamour Stone | uncommon | | Gem of Audacity | uncommon ? |
| Glider | common | | Gem of Insight | uncommon ? |
| Greatstone | uncommon | | Gem of Might | uncommon ? |
| Homing Compasses | common | | Gem of Precision | uncommon ? |
| Honing Relic | rare ? | | Gem of Sagacity | uncommon ? |
| Hopekeeper Locket | uncommon | | Infinite Bag | rare |
| Lasketider Boots | rare | | Lorekeeper | uncommon |
| Manacles | common | | Minor Health Potion Recipe | common |
| Minor Stamina Potion Recipe | common | | Mythic Dust Recipe | rare ? |
| Paragon's Chain | rare | | Phoenix Feather | uncommon |

Bucket counts: common 13 · uncommon 26 · rare 19 · legendary 2.

### Consumables (60)

| Consumable | Rarity | | Consumable | Rarity |
|---|---|---|---|---|
| Acidpaste | uncommon | | Major Health Potion | uncommon |
| Armor Stitcher | rare | | Major Stamina Potion | uncommon |
| Attune Potion | common | | Major Stride Potion | uncommon |
| Blinding Orb | uncommon | | Minor Health Potion | common |
| Blood of the Yorgi | rare | | Minor Stamina Potion | common |
| Bolster Potion | common | | Mirror of Marigold | rare |
| Bonding Honey | common | | Morphing Clay | uncommon |
| Bridge Seed | uncommon | | Mythic Dust | rare |
| Channelstone | rare | | Ogre Musk | uncommon |
| Charm Potion | common | | Potion of Stability | uncommon |
| Circle of the Void | rare | | Redthorn Saliva | rare |
| Control Potion | common | | Replication Parchment | common |
| Death Tea | **legendary** ? | | Shrinking Potion | rare |
| Dragonbloom Tea | rare | | Sleeping Sap | uncommon |
| Dripfang Poison | **legendary** | | Snap Powder | common ? |
| Enlighten Potion | common | | Stamina Potion | common |
| Feast of Xurla | **legendary** | | Stardrop | **legendary** |
| Featherbone | common | | Stride Potion | common |
| Gill Salve | uncommon | | Sun Tree Sap | rare ? |
| Grindletooth Venom | common | | Sweet Moss | common |
| Growing Potion | rare | | Unstable Arcane Shard | uncommon |
| Health Potion | common | | Varik Leaves | uncommon |
| Homet's Secret Potion | rare | | Vial of Darksmoke | uncommon |
| Hopehold Flare | rare | | Vial of Moondrip | common |
| Improved Arcane Shard | rare | | Wingsprout | rare |
| Improved Grindletooth Venom | uncommon | | Major Attune Potion | uncommon |
| Jar of Lost Voices | rare | | Major Bolster Potion | uncommon |
| Jumping Root | common | | Major Charm Potion | uncommon |
| Knowledge Stone | uncommon ? | | Major Control Potion | uncommon |
| Major Arcane Shard | **legendary** | | Major Enlighten Potion | uncommon |

Bucket counts: common 18 · uncommon 21 · rare 16 · legendary 5.

Consistent families kept in lockstep: the six **trait-swap Gems** (all uncommon), the six **Relics**
(+1 trait, all rare), the eight **Major x Potions** (all uncommon), minor/base/major
health & stamina potions (common/common/uncommon), the arcane-shard damage ladder
(1d20 uncommon → 2d20 rare → 4d20 legendary).

---

## 4. Judgment calls flagged for Chance (the "?" rows)

1. **Trait-swap Gems (×6)** — uncommon here (single-weapon scope), but letting a Strength fighter
   attack with their best trait is strong. Bump to **rare** if you want them gated later.
2. **Honing Relic** — +1 to an Experience is weaker than the +1-trait relics; kept **rare** for
   family consistency. Could drop to uncommon.
3. **Mythic Dust Recipe** — rated **rare** to match Mythic Dust itself (a repeatable source of a
   rare consumable); arguably uncommon since it needs gold dust each craft.
4. **Box of Many Goods** — random common consumable generator, 1/long rest; **uncommon**, but it's
   basically a slow trickle of free commons — fine either way.
5. **Death Tea** — instakill-on-crit is legendary power, but "you die if you don't crit" is a huge
   drawback. Rated **legendary** on effect ceiling; **rare** defensible on risk.
6. **Snap Powder** — trades a Stress for an HP; rated **common** as a cheap field patch, though
   action-economy-free healing is arguably uncommon.
7. **Sun Tree Sap** — mostly a modest heal, but the 1-in-6 "cheat death, gain a scar" rider is why
   it's **rare** rather than common.
8. **Knowledge Stone** — death-contingency utility, hard to price; **uncommon** as a niche one-shot.

---

## 5. How this will be stored (after approval — nothing applied yet)

- **`rarity` field** added to each record in `items[]` and `consumables[]` **only** (weapons/armor
  stay tier-keyed; their `tier` field already exists). Values: `"common" | "uncommon" | "rare" |
  "legendary"`, applied mechanically from `scratch_rarity_proposal.json` once vetoes are folded in.
- **Shared price lookup, not per-item prices.** One small `priceModel` block (in
  `daggerheart_equipment.json`'s meta or a sibling file) holding exactly the three tables in §2 —
  `weaponsArmorByTier`, `itemsByRarity`, `consumablesByRarity`, each cell
  `{ "buyMin", "buyMax", "sell" }` in handfuls. The marketplace UI resolves *item → tier/rarity →
  price* at render time; no hand-authored per-item prices to drift out of sync.
- **Provenance:** the `priceModel` block and the `rarity` fields are tagged
  `"sourceTier": "Homebrew (precedence rank 8)"` — distinct from the file's own
  `"Official SRD (precedence rank 4)"` meta tag, so official prices (rank 1/3) supersede
  automatically under the standard precedence ladder. The UI must label all prices **homebrew**.
- Buy/sell display format follows the handoff example: *"Short Sword · common · 1–3 handfuls ·
  used value 1 handful."*
