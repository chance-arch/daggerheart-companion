# Daggerheart Effect Model — Spec v1.0 (hardened)

**Purpose.** Make every domain card (and feature, weapon ability, etc.) *machine-readable* so the
app can auto-resolve mechanics, while keeping the verbatim rules text alongside as source-of-truth
and render fallback. This is the structured layer that sits on top of the card corpus
(`daggerheart_domain_cards.json`).

**Design principle.** Don't write one flat schema with a field per card quirk — that never converges.
Instead, define a small **composable vocabulary of effect primitives**. Each card is a *list of
abilities*, each ability is a *list of typed effects*. New cards reuse the vocabulary; when a card
does something genuinely new, we extend the vocabulary (a shared primitive), not bolt on a one-off field.

**Status.** v1.0 — proven against Theron's 5 cards (§6) and hardened against 13 deliberately
awkward cards spanning all 9 domains (§9). The hardening pass added 7 primitives/extensions (§10);
with those, every tested card encoded. Ready for mass-annotation of the full 189-card corpus.

---

## 1. Item structure

A content item keeps its corpus fields (`name`, `slug`, `domain`, `level`, `type`, `recallCost`,
`text`, `url`) and adds an optional `mechanics` object. No `mechanics` → the card simply renders its
text (still fully usable, just not automated).

```
mechanics: {
  abilities: [ Ability, ... ]   // a card may expose several activatable abilities
}
```

### Ability

```
{
  id:       string,        // stable key, e.g. "cast", "replenish"
  label:    string,        // button text, e.g. "Cast", "Replenish Tokens"
  trigger:  Trigger,       // when/how it fires
  inputs:   [Input],       // player choices gathered before resolving (optional)
  cost:     Cost,          // resources paid to activate — a gate (optional)
  effects:  [Effect]       // ordered; may nest conditionals via `branch`
}
```

---

## 2. Trigger — when an ability fires

```
{kind:"action"}                                  // costs your action
{kind:"reaction", on:"incomingDamage"|"attackedInMelee"|"attackFails"|..., actor?:"self"|"holder"}
{kind:"passive"}                                 // always on (typically modifiers)
{kind:"sessionStart"} | {kind:"sessionEnd"}
{kind:"restStart", rest:"short"|"long"|"any"}
{kind:"onEvent", event:"dealDamage"|"criticalSuccess"|"markHP"|...}
```

## 3. Input — player choices before resolving

```
{id, kind:"int",    min, max}                    // e.g. tokens to spend (max may be an @ref)
{id, kind:"bool",   label, extraCost?}           // e.g. flying familiar (+1 Hope)
{id, kind:"choice", label, options:[...]}        // pick one
```

## 4. Cost — resource gate

```
{ stress?, hope?, armor?, hp?, tokens?, ... }    // numbers OR expressions
// conditional cost: { amount:<expr>, when:<condition> }
```

## 5. Effect primitives (the vocabulary)

| type | purpose | key params |
|---|---|---|
| `roll` | make a roll, yields an outcome for `branch` | `using` (spellcast/attack/trait), `vs` (difficulty / target+range / reaction), `range` |
| `branch` | conditional / sequencing | `on` ("success"/"failure"/"hope"/"fear"/"critical" or an expr), `effects`, `else` |
| `damage` | deal damage | `dice{count,sides}`, `bonus?`, `damageType`, `scaleBy:"proficiency"?`, `direct?`, `target` |
| `applyCondition` | apply a status | `condition`, `duration`, `stackable?`, `params?`, `recurring?` |
| `resource` | manage a pool (tokens, hope, stress…) | `op` (place/spend/gain/clear/set), `resource`, `amount`, `max?` |
| `modifier` | buff/debuff a stat | `target` (trait/evasion/proficiency/threshold/damageRoll/armorScore/difficulty), `value`, `duration`, `appliesTo`, `condition?` |
| `reduceDamage` | reduce incoming damage | `dice` or `amount`, `capture?`, `then?` |
| `summon` | create a familiar/construct/spirit | `name`, `properties`, `duration`, `grants:[Ability|modifier]` |
| `heal` | clear HP/Stress | `resource`, `amount`, `target` |
| `move` | forced/granted movement | `who`, `to` (range), `mode` |
| `note` | purely narrative, no handle | `text` |

### Dynamic values & expressions

Numbers and dice counts can be literals **or** references/expressions:

- Character stats: `@spellcast`, `@proficiency`, `@agility`, `@strength`, `@level`, …
- Runtime values: `@tokens` (current pool on this card), `@tokensSpent` / `@<inputId>` (from inputs),
  `@wardDie` (a captured roll result)
- Expressions: short arithmetic strings, e.g. `"floor(@corrodeStress / 2)"`, `"@tokensSpent"`

---

## 6. Proof — Theron's five cards encoded

### Unleash Chaos (Arcana 1, Spell, recall 1)
Exercises: token pool lifecycle, variable dice count, roll→branch, mid-card resource cost.

```json
{ "abilities": [
  { "id":"setup", "label":"Session Start: Place Tokens",
    "trigger":{"kind":"sessionStart"},
    "effects":[{"type":"resource","op":"place","resource":"token","amount":"@spellcast","max":"@spellcast"}] },
  { "id":"cast", "label":"Cast",
    "trigger":{"kind":"action"},
    "inputs":[{"id":"tokensSpent","kind":"int","min":1,"max":"@tokens"}],
    "effects":[
      {"type":"roll","using":"spellcast","vs":{"kind":"target","range":"far"}},
      {"type":"branch","on":"success","effects":[
        {"type":"resource","op":"spend","resource":"token","amount":"@tokensSpent"},
        {"type":"damage","dice":{"count":"@tokensSpent","sides":10},"damageType":"magic","target":"single"}
      ]}
    ] },
  { "id":"replenish", "label":"Replenish (mark Stress)",
    "trigger":{"kind":"action"}, "cost":{"stress":1},
    "effects":[{"type":"resource","op":"place","resource":"token","amount":"@spellcast","max":"@spellcast"}] },
  { "id":"cleanup", "label":"Session End: Clear Tokens",
    "trigger":{"kind":"sessionEnd"},
    "effects":[{"type":"resource","op":"clear","resource":"token"}] }
] }
```

### Rune Ward (Arcana 1, Spell, recall 0)
Exercises: reaction trigger, damage reduction, capturing a roll result, self-expiry condition.

```json
{ "abilities": [
  { "id":"ward", "label":"Reduce Damage",
    "trigger":{"kind":"reaction","on":"incomingDamage","actor":"holder"},
    "cost":{"hope":1},
    "effects":[
      {"type":"reduceDamage","dice":{"count":1,"sides":8},"capture":"wardDie"},
      {"type":"branch","on":"@wardDie == 8","effects":[
        {"type":"resource","op":"set","resource":"wardCharge","amount":0,"rechargeOn":"rest"}
      ]}
    ] }
] }
```

### Cinder Grasp (Arcana 2, Spell, recall 1)
Exercises: roll→branch, flat dice+bonus, applied condition with a **recurring** tick.

```json
{ "abilities": [
  { "id":"cast", "label":"Cast",
    "trigger":{"kind":"action"},
    "effects":[
      {"type":"roll","using":"spellcast","vs":{"kind":"target","range":"melee"}},
      {"type":"branch","on":"success","effects":[
        {"type":"damage","dice":{"count":1,"sides":20},"bonus":3,"damageType":"magic","target":"single"},
        {"type":"applyCondition","condition":"on_fire","duration":"temporary",
          "recurring":{"on":"targetEndOfAction","while":"on_fire",
            "effect":{"type":"damage","dice":{"count":2,"sides":6},"damageType":"magic","direct":true}}}
      ]}
    ] }
] }
```

### Natural Familiar (Sage 2, Spell, recall 1)
Exercises: optional extra-cost input, summon with **granted** abilities + a conditional damage modifier, multi-condition duration.

```json
{ "abilities": [
  { "id":"summon", "label":"Summon Familiar",
    "trigger":{"kind":"action"}, "cost":{"hope":1},
    "inputs":[{"id":"flying","kind":"bool","label":"Flying familiar","extraCost":{"hope":1}}],
    "effects":[
      {"type":"summon","name":"Natural Familiar","properties":{"fly":"@flying"},
        "duration":{"until":["rest","recast","familiarAttacked"]},
        "grants":[
          {"type":"modifier","target":"damageRoll","value":{"dice":{"count":1,"sides":6}},
            "appliesTo":"self","condition":"adversaryInMeleeOfFamiliar"},
          {"kind":"ability","id":"command","label":"Command Familiar",
            "trigger":{"kind":"action"},"effects":[{"type":"roll","using":"spellcast","vs":{"kind":"freeform"}}]},
          {"kind":"ability","id":"see","label":"See Through Eyes",
            "trigger":{"kind":"action"},"cost":{"stress":1}}
        ]}
    ] }
] }
```

### Corrosive Projectile (Sage 3, Spell, recall 1)
Exercises: proficiency-scaled dice, optional mid-sequence stress cost, stacking permanent condition with a derived numeric parameter. (Note: official text reads "6d4 magic damage **using your Proficiency**"; Theron's house rule multiplies dice count by Proficiency — captured via `scaleBy:"proficiency"`.)

```json
{ "abilities": [
  { "id":"cast", "label":"Cast",
    "trigger":{"kind":"action"},
    "inputs":[{"id":"corrodeStress","kind":"int","min":0,"note":"0, or 2+"}],
    "effects":[
      {"type":"roll","using":"spellcast","vs":{"kind":"target","range":"far"}},
      {"type":"branch","on":"success","effects":[
        {"type":"damage","dice":{"count":6,"sides":4},"damageType":"magic","scaleBy":"proficiency","target":"single"},
        {"type":"cost","pay":{"stress":"@corrodeStress"},"when":"@corrodeStress >= 2"},
        {"type":"branch","on":"@corrodeStress >= 2","effects":[
          {"type":"applyCondition","condition":"corroded","duration":"permanent","stackable":true,
            "params":{"difficultyDelta":"-floor(@corrodeStress / 2)"}}
        ]}
      ]}
    ] }
] }
```

---

## 7. Where the vocabulary had to stretch (honest notes)

All five encoded with no contortions, but five primitives had to *grow* to fit. These are clean,
reusable extensions — not card-specific hacks — and each will recur across the corpus:

1. **`recurring` on a condition** (Cinder Grasp's On Fire tick) — needed for any "while X, take Y each turn."
2. **`grants` on `summon`** carrying nested abilities + modifiers (Natural Familiar) — needed for any pet/construct/spirit.
3. **Inline `cost` effect mid-sequence** (Corrosive Projectile) — for optional add-on costs after a roll resolves.
4. **`capture` of a roll result** for later expressions (Rune Ward's ward die) — for any "if the die shows N" behavior.
5. **Expressions** for derived numbers and dynamic dice counts — pervasive.

## 8. Open decisions (need Chance's call)

1. **Auto-roll vs. manual entry.** The effect model only *declares* what gets rolled; it doesn't dictate
   who rolls. Your current Theron app has you enter physical dice and it does the math. Recommend keeping
   that as the default (manual entry, app resolves), with optional in-app rolling later. Either works with this model.
2. **Conditions registry.** The corpus references many statuses (On Fire, Vulnerable, Restrained, Corroded,
   Cloaked, Hidden, Stunned, Silenced, Horrified, Asleep, Poisoned, Enraptured…). We should build a canonical
   conditions reference so `applyCondition` points at real entries. Recommend this as the next small artifact.
3. **Hardening before mass-encoding.** Before annotating all 189 cards, validate the vocabulary against
   ~12–15 deliberately weird cards across domains (token pools, countdowns like Mass Disguise, ward dice like
   Zone of Protection, summons like Midnight Spirit, transformations like Force of Nature, Grimoire multi-spells
   like the Codex Books). If those encode cleanly, lock v1 and grind.

---

## 9. Hardening pass — 13 awkward cards (all 9 domains)

Verdict: **the vocabulary held.** Every card encoded. Five cards needed *new shared primitives*
(listed in §10); the rest reused v0.1. Below: card → mechanic stressed → verdict.

| # | Card (domain) | Mechanic stressed | Verdict |
|---|---|---|---|
| 1 | **Mass Disguise** (Midnight) | GM countdown that ends an effect | NEW `countdown` |
| 2 | **Zone of Protection** (Splendor) | escalating die that depletes & ends ("increase by one… >6 ends") | NEW `resource` die-value (`increment`, `endWhen`) |
| 3 | **Sigil of Retribution** (Codex) | dice pool *accrued by an event*, capped by level, spent on hit | NEW `resource` `gainOn`/`cap` |
| 4 | **Midnight Spirit** (Midnight) | summon that can be *sent to attack* (roll + Nd6) | reused `summon.grants` (attack ability) |
| 5 | **Force of Nature** (Sage) | self-transformation: modifiers, immunity, per-action upkeep, end condition | NEW `stateForm` + `modifier:immunity` |
| 6 | **Book of Ava** (Codex) | one Grimoire card = 3 distinct named sub-spells | reused `abilities[]` (one per sub-spell) |
| 7 | **Unyielding Armor** (Valor) | roll N dice, "if any roll a 6" → effect | NEW `roll` dice-pool `check{anyGte}` |
| 8 | **Restoration** (Splendor) | token pool that heals (HP/Stress), multi-purpose spend | reused `resource` + `heal` |
| 9 | **Vitality** (Blade) | permanent stat gains, choose 2-of-3, then self-vault | NEW `mutate` + `vault`; `input.choice` `selectCount:2` |
| 10 | **Chain Lightning** (Arcana) | cascading multi-target reaction-roll vs your result | reused `roll`+`branch`+`damage`; cascade = runtime loop |
| 11 | **Not Good Enough** (Blade) | passive: reroll damage dice showing 1s/2s | NEW `modifier:rerollDamageDice` |
| 12 | **Counterspell** (Arcana) | reaction that interrupts another effect, then self-vaults | NEW `negate` + reused `vault` |
| 13 | **Tempest** (Sage) | choose 1 of 3 modes, each its own damage + condition | reused `input.choice` with per-option `effects[]` |

Two representative new encodings:

**Force of Nature (stateForm + immunity + upkeep):**
```json
{ "id":"transform","label":"Transform","trigger":{"kind":"action"},"cost":{"stress":1},
  "effects":[{"type":"stateForm","name":"Force of Nature",
    "modifiers":[
      {"target":"damageRoll","value":10,"when":"onSuccessfulAttackOrSpellcast"},
      {"target":"immunity","value":"restrained"}
    ],
    "upkeep":{"cost":{"hope":1},"per":"action","onUnpaid":"endForm"},
    "onEvent":[{"on":"defeatCreatureInClose","effects":[{"type":"resource","op":"clear","resource":"armor","amount":1}]}],
    "endWhen":["upkeepUnpaid"] }] }
```

**Vitality (mutate + choice + self-vault):**
```json
{ "id":"choose","label":"Gain Benefits","trigger":{"kind":"onAcquire"},
  "inputs":[{"id":"picks","kind":"choice","selectCount":2,"options":[
    {"id":"stress","label":"+1 Stress slot"},
    {"id":"hp","label":"+1 Hit Point slot"},
    {"id":"thr","label":"+2 damage thresholds"}]}],
  "effects":[
    {"type":"mutate","from":"@picks","map":{
      "stress":{"stat":"stressSlots","delta":1},
      "hp":{"stat":"hpSlots","delta":1},
      "thr":{"stat":"damageThresholds","delta":2}}},
    {"type":"vault","target":"self","permanent":true}
  ] }
```

## 10. v1 additions (locked)

Seven shared primitives/extensions surfaced. All are general (each recurs across many cards), not patches:

1. **`countdown`** — `{type:"countdown", id, start, advanceOn, onTrigger:[Effect]}`. GM timers (Mass Disguise; pervasive in GM/adversary content later).
2. **`resource` die-value & event accrual** — pools can hold a die value with `increment`/`endWhen` (Zone of Protection, Wild Surge) and accrue via `gainOn:<event>` with a `cap` (Sigil of Retribution, Twilight Toll, Never Upstaged, Spellcharge).
3. **`roll` dice-pool check** — `{type:"roll", dice:{count:<expr>,sides}, check:{anyGte:N}}` → boolean outcome (Unyielding Armor, Redirect, Arcane Reflection, Invigoration).
4. **`stateForm`** — self-transformation with `modifiers`, optional `upkeep` cost `per:"action"`, `onEvent`, `endWhen` (Force of Nature, Frenzy, Wild Surge, Beastform later).
5. **`mutate`** — permanent character changes (`stressSlots`, `hpSlots`, `damageThresholds`, Experiences) (Vitality, Master of the Craft).
6. **`vault`** — `{type:"vault", target:"self", permanent?:bool}` (Counterspell, Vitality, Shrug It Off, Resurrection, many).
7. **`modifier` target additions** — `immunity` (damage type or condition), `rerollDamageDice` (Not Good Enough), plus `negate` for interrupts (Counterspell, Repudiate, Arcane Deflection).

**Runtime note (not a schema change):** cascading effects like Chain Lightning are a *loop over targets*,
not a new primitive — the engine resolves `roll`→`branch`→`damage` repeatedly while the chain holds. Flag
such cards `runtime:"cascade"` so the UI prompts for the next target.

**Conclusion.** v1 = §5 primitives + these 7 additions. It absorbed every awkward card tested across all
nine domains. Locking v1; ready to annotate the 189-card corpus (text is already verbatim, so annotation
is additive and can proceed domain-by-domain).
