#!/usr/bin/env python3
"""
build_mix_sets.py — turn a tense-labeled data file into blind "Mix" sets.

WHY
Duel and Defusal's set-tabs used to be labeled by tense ("Perfect Simple",
"Past Perfect", etc). That's a leak: the tab tells the learner which of the
four options is correct before they read the sentence, so the "game" turns
into "find the option shaped like the tab" instead of testing whether they
can actually tell the tenses apart from context (time markers, sequencing,
finished/unfinished periods). Explore/Practice/Quiz are teaching modes, so
that scaffolding is fine there. The reflex games should be blind.

WHAT THIS DOES
Takes your existing tense-rush-data.json (an array of tense-labeled groups,
each with id/label/color/desc/items[]), pools every item from every group,
shuffles them, and re-chunks them into "Mix 1", "Mix 2", ... sets with no
tense-revealing label. Each item keeps a `cat` field recording its original
tense (id + label) — not shown during play, but useful if you ever want a
"you were tested on: Perfect Simple, Past Perfect, ..." breakdown on the
post-round summary screen. Nothing about an individual item (cue, after,
mark, answer, options, note) is changed — only which group it's filed under.

USAGE
    python3 build_mix_sets.py tense-rush-data.json tense-mix-data.json
    python3 build_mix_sets.py tense-rush-data.json tense-mix-data.json --per-mix 14
    python3 build_mix_sets.py tense-rush-data.json tense-mix-data.json --seed 7

The output file is a drop-in replacement for the DATA_URL the game engines
fetch — point Duel/Defusal at it (they already default to
'../../data/grammar-rules/tense-mix-data.json' after this update) and
leave your original tense-rush-data.json untouched for Explore/Practice/
Quiz, which should keep their labels.

NOTE ON WORD FORGE
Forge reads a differently-shaped file (tense-forge-data.json, with `bank`/
`answer` arrays instead of `options`/`answer`). This script only handles
the options-based shape used by Rush/Duel/Defusal. If you want Forge mixed
too, say so and it's a small variant of this same script.
"""
import json
import random
import sys
import argparse

# A rotating palette independent of any tense — so a color never becomes
# a de-facto tense label the way "blue = Present Perfect" could.
MIX_COLORS = [
    "#61b5ed",  # blue
    "#c084fc",  # purple
    "#5ED39B",  # green
    "#fb923c",  # orange
    "#E86A5C",  # red
    "#FFD94A",  # yellow
    "#C9A961",  # gold
    "#f472b6",  # pink
]


def load_groups(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list) or not data:
        raise SystemExit(f"{path}: expected a non-empty JSON array of groups")
    return data


def pool_items(groups):
    """Flatten every group's items into one list, each tagged with its
    source category so the original tense isn't lost — just hidden."""
    pool = []
    for g in groups:
        cat = {"id": g.get("id"), "label": g.get("label")}
        for it in g.get("items", []):
            # Only keep items shaped for the 4-option lane/wire format.
            if not (isinstance(it.get("options"), list) and len(it["options"]) == 4
                    and it.get("answer") in it["options"]):
                continue
            item = dict(it)  # shallow copy — don't mutate the source file
            item["cat"] = cat
            pool.append(item)
    return pool


def chunk(seq, size):
    for i in range(0, len(seq), size):
        yield seq[i:i + size]


def build_mixes(pool, per_mix, rng):
    rng.shuffle(pool)
    mixes = []
    for i, batch in enumerate(chunk(pool, per_mix), start=1):
        # Guard against a too-small final batch that wouldn't support the
        # 4-option lane games well — merge a small tail into the last mix.
        if len(batch) < 6 and mixes:
            mixes[-1]["items"].extend(batch)
            continue
        mixes.append({
            "id": f"mix-{i}",
            "label": f"Mix {i}",
            "color": MIX_COLORS[(i - 1) % len(MIX_COLORS)],
            "desc": "Every tense, no tab to tell you which — read the sentence.",
            "items": batch,
        })
    return mixes


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input", help="existing tense-labeled data file, e.g. tense-rush-data.json")
    ap.add_argument("output", help="path to write the blind Mix-set file, e.g. tense-mix-data.json")
    ap.add_argument("--per-mix", type=int, default=16, help="target items per Mix set (default 16)")
    ap.add_argument("--seed", type=int, default=None, help="random seed, for a reproducible shuffle")
    args = ap.parse_args()

    rng = random.Random(args.seed)
    groups = load_groups(args.input)
    pool = pool_items(groups)
    if not pool:
        raise SystemExit(f"{args.input}: no items with a valid 4-option `options` array were found")

    mixes = build_mixes(pool, args.per_mix, rng)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(mixes, f, ensure_ascii=False, indent=2)

    src_tenses = sorted({g.get("label") for g in groups})
    print(f"Read {len(pool)} usable items across {len(src_tenses)} tenses from {args.input}:")
    for t in src_tenses:
        print(f"  - {t}")
    print(f"\nWrote {len(mixes)} blind sets to {args.output}:")
    for m in mixes:
        cats_in_mix = sorted({it['cat']['label'] for it in m['items']})
        print(f"  - {m['label']}: {len(m['items'])} items, spanning {len(cats_in_mix)} tenses")


if __name__ == "__main__":
    main()
