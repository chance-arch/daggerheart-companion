# Refreshes the mechanical parts of DATA_INDEX.md from the JSON datasets:
# the "At a glance" table and the Generated date. All prose is left alone.
# Run: python build_data_index.py
import json
import re
from datetime import date

def load(f):
    with open(f, encoding="utf-8") as fh:
        return json.load(fh)

def subclass_count(d):
    return sum(len(c.get("subclasses", [])) for c in d["classes"])

# (label, file, records-cell builder)
DATASETS = [
    ("Domain cards (mechanized)", "daggerheart_domain_cards_annotated.json",
     lambda d: f"{len(d['cards'])} (all annotated; live interactivity gradient in the app's Coverage panel)"),
    ("Domain cards (text only)", "daggerheart_domain_cards.json",
     lambda d: f"{len(d['cards'])}"),
    ("Conditions", "daggerheart_conditions.json",
     lambda d: f"{len(d['standardConditions'])} standard + {len(d['specialConditions'])} special"),
    ("Equipment", "daggerheart_equipment.json",
     lambda d: "{} primary + {} secondary weapons, {} armor, {} items, {} consumables = {}".format(
         sum(1 for w in d["weapons"] if "primary" in w.get("category", "").lower()),
         sum(1 for w in d["weapons"] if "secondary" in w.get("category", "").lower()),
         len(d["armor"]), len(d["items"]), len(d["consumables"]),
         len(d["weapons"]) + len(d["armor"]) + len(d["items"]) + len(d["consumables"]))),
    ("Heritage", "daggerheart_heritage.json",
     lambda d: f"{len(d['ancestries'])} ancestries + {len(d['communities'])} communities"),
    ("Classes & subclasses", "daggerheart_classes.json",
     lambda d: f"{len(d['classes'])} classes, {subclass_count(d)} subclasses"),
    ("Beastforms (Druid)", "daggerheart_beastforms.json",
     lambda d: f"{len(d['beastforms'])} (tiers 1-4)"),
    ("Leveling rules", "daggerheart_leveling.json",
     lambda d: f"{len(d['tiers'])} tiers, {len(d['levelUpSteps'])} level-up steps, {len(d['advancements'])} advancement options"),
    ("Adversaries (GM)", "daggerheart_adversaries.json",
     lambda d: f"{len(d['adversaries'])} (tiers 1-4, full statblocks)"),
    ("Environments (GM)", "daggerheart_environments.json",
     lambda d: f"{len(d['environments'])}"),
]

rows = ["| Dataset | File | Records |", "|---|---|---|"]
for label, f, cell in DATASETS:
    rows.append(f"| {label} | `{f}` | {cell(load(f))} |")
table = "\n".join(rows)

with open("DATA_INDEX.md", encoding="utf-8") as fh:
    doc = fh.read()

doc = re.sub(r"\| Dataset \| File \| Records \|\n(?:\|.*\|\n)+", table + "\n", doc, count=1)
doc = re.sub(r"- Generated: \d{4}-\d{2}-\d{2}", f"- Generated: {date.today().isoformat()}", doc, count=1)

with open("DATA_INDEX.md", "w", encoding="utf-8", newline="\n") as fh:
    fh.write(doc)

print("DATA_INDEX.md refreshed:")
print(table)
