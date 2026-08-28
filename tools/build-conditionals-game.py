#!/usr/bin/env python3
"""
build_conditionals_game.py
──────────────────────────
Turns conditionals-data.json into the item file the conditionals game reads.

    python3 build_conditionals_game.py \
        --data data/grammar-rules/conditionals-data.json \
        --verbs data/grammar-rules/verbs.json \
        --out  data/grammar-rules/conditionals-game-data.json

WHY THIS EXISTS
The rules data already marks both verbs in every sentence:

    "If you <<heat>> water to 100°C, it <<boils>>."

That is an item with two gaps, already written and already checked. What it
does not carry is the OTHER forms — the ones that fill the two pickers — and
those cannot be recovered from the answer alone: strip "had " from "had driven"
and you have the participle, not the base. So each gap is resolved back to its
infinitive and re-conjugated across all three columns.

WHAT COMES OUT, per item:

    { "id", "type", "cue", "gaps": [ {…}, {…} ], "note" }

    each gap:  { "hint": "drive",           the infinitive, shown in the empty capsule
                 "answer": "had driven",
                 "options": ["drive","drove","had driven"],   the picker
                 "role": "if" | "result" }

The three options are ALWAYS in column order, so a student who has understood
the table sees the same left-to-right shape every time. The game shuffles them
if it wants to; the data does not pre-shuffle, because an unshuffled file is
one you can read and check by eye.

WHAT IT WILL NOT GUESS
An item whose verb is not in the table and is not regular is REPORTED, not
invented. Silence is how a wrong participle reaches a student.
"""

import argparse, json, re, sys
from collections import OrderedDict

# ── the two clause patterns ──────────────────────────────────────────────
# Column order is base / past / participle throughout, so the two pickers
# line up: choosing position 3 on the left and position 3 on the right gives
# the third conditional, and position 3 then 2 gives the mixed.
# {pres} is the present column. It is subject-dependent — "I miss" but "he
# misses" — and the data only knows which is right for the column that IS the
# answer. So when the answer sits in column 0 the surface form is used
# verbatim; otherwise the base is good enough for a distractor.
IF_POS  = ["{pres}",        "{past}",         "had {part}"]
RESULT_POS = ["will {base}", "would {base}",  "would have {part}"]
# Zero is the one row whose result is not modal: present, not will/would.
ZERO_RESULT_POS = ["{pres}", "{past}",        "would have {part}"]

# A negative cannot be pasted onto a finished form — "hadn't" + "break" gives
# "hadn't break". Each column carries its own negative shape instead.
IF_NEG  = ["{dont} {base}",  "didn't {base}",  "hadn't {part}"]
RESULT_NEG = ["won't {base}", "wouldn't {base}", "wouldn't have {part}"]
ZERO_RESULT_NEG = ["{dont} {base}", "didn't {base}", "wouldn't have {part}"]

# `be` negates itself — "isn't", "weren't" — and never takes do-support. The
# generic templates produced "don't be" and "didn't be", which are not English
# and were being offered to students as distractors. A distractor has to be a
# form a learner might plausibly reach for; an impossible one teaches nothing
# and makes the right answer findable by elimination.
BE_NEG_IF     = ["isn't{tail}",       "wasn't{tail}",        "hadn't been{tail}"]
BE_NEG_RESULT = ["won't be{tail}",    "wouldn't be{tail}",   "wouldn't have been{tail}"]

# Which column pair each conditional wants. Mixed is not a fourth pattern —
# it is column 3 on the left and column 2 on the right, which is exactly what
# the two independent pickers let a student discover.
COLUMNS = {
    "zero":   (0, 0),   # present / present — handled separately below
    "first":  (0, 0),
    "second": (1, 1),
    "third":  (2, 2),
    "mixed":  (2, 1),
}

NEG = re.compile(r"^(do not|does not|did not|don't|doesn't|didn't|will not|won't|"
                 r"would not|wouldn't|had not|hadn't|was not|wasn't|were not|weren't|"
                 r"cannot|can't|could not|couldn't)(\s+|$)", re.I)

# Split by what the auxiliary TELLS US about the word after it. Guessing from
# spelling alone got "need" wrong: stripping -ed gives "nee", and regular_past
# ("nee") is "need", so it reconstructed and was accepted. The auxiliary knows
# better — after "would" comes a base, after "had" comes a participle.
AUX_BASE = re.compile(r"^(will|would)(\s+|$)", re.I)
AUX_PART = re.compile(r"^(had|have|has|would have|will have)\s+", re.I)

# Modals are real English and not part of the three-column system this game
# tests. "If dogs could talk" has no base/past/participle triple to pick from.
MODAL = re.compile(r"^(can|could|may|might|must|shall|should)('t|not)?(\s+|$)", re.I)


def regular_past(base, doubling):
    """want -> wanted, live -> lived, carry -> carried, stop -> stopped."""
    if base in doubling:
        return base + base[-1] + "ed"
    if base.endswith("e"):
        return base + "d"
    if len(base) > 2 and base.endswith("y") and base[-2] not in "aeiou":
        return base[:-1] + "ied"
    return base + "ed"


def restore_silent_e(stem):
    """
    "lived" strips to "liv", whose regular past IS "lived" — so the check
    passes and the hint reads (liv). No English verb ends in v, u, j or q, so
    the silent e goes back. "wanted" -> "want" is untouched, because t is a
    perfectly good final letter.
    """
    if stem and (stem[-1] in "vujq" or len(stem) <= 2):
        return stem + "e"
    return stem


def third_person(verb, table):
    """miss -> misses, carry -> carries, be -> is. Phrasals inflect the head."""
    head, _, tail = verb.partition(" ")
    tail = (" " + tail) if tail else ""
    h = head.lower()
    if h == "be":   return "is" + tail
    if h == "have": return "has" + tail
    if h.endswith(("s", "sh", "ch", "x", "o", "z")): return h + "es" + tail
    if len(h) > 2 and h.endswith("y") and h[-2] not in "aeiou": return h[:-1] + "ies" + tail
    return h + "s" + tail


def parts(verb, table, doubling, problems):
    """Return (base, past, participle) for a possibly multi-word verb."""
    head, _, tail = verb.partition(" ")
    head = head.lower()
    tail = (" " + tail) if tail else ""
    if head in table:
        b, p, pp = table[head]
    else:
        # Regular until proven otherwise. Anything ending in a way the rule
        # cannot handle is reported rather than guessed at.
        if not re.fullmatch(r"[a-z]+", head):
            problems.append("unrecognised verb: " + verb)
            return None
        b, p = head, regular_past(head, doubling)
        pp = p
    return (b + tail, p + tail, pp + tail)


def classify(surface, role, rid):
    """
    Returns a reason to SKIP, or None to build. These are not errors — they
    are correct English that this particular game cannot ask about, and
    skipping them silently would be worse than saying so.
    """
    s = surface.strip()
    if MODAL.match(s) or MODAL.match(re.sub(r"^(would|will)\s+", "", s, flags=re.I)):
        return "modal (could/might/can) — outside the three columns"
    if rid == "first" and role == "result" and not re.match(
            r"^(will|would|won't|wouldn't)\b", s, re.I):
        return "imperative result — 'tell him', not 'will tell'"
    return None


def infinitive_of(surface, table, doubling, problems):
    """
    'had driven' -> drive.  'would have caught' -> catch.  'boils' -> boil.
    The surface form is whatever the rules data wrote; the game needs the
    infinitive to label the empty capsule and to generate the other columns.
    """
    s = surface.strip()
    neg = ""
    m = NEG.match(s)
    if m:
        neg = m.group(1)
        s = s[m.end():].strip()
        # A bare negative contraction of `be` — "weren't" with nothing after —
        # IS the verb, not an auxiliary in front of one.
        if not s and re.match(r"^(was|were)n't$|^(was|were) not$", neg, re.I):
            return "be", neg
        # "wouldn't need" is would + BASE. Without this the -ed stripper
        # turned "need" into "nee", whose regular past is "need" — so it
        # reconstructed, passed, and produced "won't nee".
        if re.match(r"^(won't|will not|wouldn't|would not|don't|do not|"
                    r"doesn't|does not|didn't|did not)$", neg.strip(), re.I):
            head, _, tail = s.partition(" ")
            if head.lower() == "have" and tail:
                pass
            else:
                return s, neg
        if re.match(r"^(hadn't|had not)$", neg.strip(), re.I):
            after_forced = "part"
        

    # What follows the auxiliary is determined by the auxiliary itself.
    after = None
    m = AUX_PART.match(s)
    if m:
        after, s = "part", s[m.end():].strip()
    else:
        m = AUX_BASE.match(s)
        if m:
            after, s = "base", s[m.end():].strip()
            m2 = re.match(r"^have\s+", s, re.I)
            if m2:
                after, s = "part", s[m2.end():].strip()
    if not s:
        problems.append("gap has no lexical verb: " + surface)
        return None, neg

    # Told it is a base, take it as one. This is what "need" needed.
    if after == "base":
        head, _, tail = s.partition(" ")
        if head.lower() == "be" and tail:
            return s, neg              # "be working", "be playing"
        return s, neg

    head, _, tail = s.partition(" ")
    low = head.lower()

    # already an infinitive?
    for base, (b, p, pp) in table.items():
        if low in (b, p, pp):
            return (base + ((" " + tail) if tail else "")), neg
    # third-person -s, or a regular past
    for cand in (low, re.sub(r"ies$", "y", low), re.sub(r"(es|s)$", "", low),
                 re.sub(r"ied$", "y", low), re.sub(r"ed$", "", low),
                 re.sub(r"ed$", "e", low)):
        if cand and cand in table:
            return (cand + ((" " + tail) if tail else "")), neg
    # Regular: derive candidates and keep the one whose own inflection
    # reproduces the surface. `cand == low` is tried LAST — as the first test
    # it matched "avoided" against itself and returned "avoided" as the
    # infinitive, which then generated "would have avoideded".
    # `(es|s)$` alternates es FIRST, so "arrives" lost both letters and became
    # "arriv" — which reconstructs to nothing and fell through to the
    # give-up branch. The two strips are separate candidates now.
    cands = [re.sub(r"ied$", "y", low), re.sub(r"(.)\1ed$", r"\1", low),
             re.sub(r"ed$", "", low), re.sub(r"ed$", "e", low),
             re.sub(r"ies$", "y", low),
             re.sub(r"es$", "", low), re.sub(r"es$", "e", low),
             re.sub(r"s$", "", low)]
    for cand in cands:
        if not cand or cand == low:
            continue
        if regular_past(cand, doubling) == low or third_person(cand, table) == low:
            return (restore_silent_e(cand) + ((" " + tail) if tail else "")), neg
    if re.fullmatch(r"[a-z ]+", low):
        return (low + ((" " + tail) if tail else "")), neg
    problems.append("could not find the infinitive of: " + surface)
    return None, neg


def apply_neg(form, neg):
    """Put the negative back where it belongs: don't get / didn't get / hadn't got."""
    if not neg:
        return form
    n = neg.lower()
    if form.startswith("will "):     return "won't " + form[5:]
    if form.startswith("would have "): return "wouldn't have " + form[11:]
    if form.startswith("would "):    return "wouldn't " + form[6:]
    if form.startswith("had "):      return "hadn't " + form[4:]
    return n + " " + form


def build(data, verbs, only=None):
    table    = {k: tuple(v) for k, v in verbs["irregular"].items()}
    doubling = set(verbs["doubling"])
    items, problems, skipped, excluded, divergent = [], [], 0, [], []

    for rule in data.get("rules", []):
        rid = rule.get("id", "")
        if only and rid not in only:
            continue
        if rid not in COLUMNS:
            problems.append("no column mapping for rule id: " + rid)
            continue
        if_col, res_col = COLUMNS[rid]

        for set_i, s in enumerate(rule.get("sets", [])):
            for ex_i, ex in enumerate(s.get("examples", [])):
                text = ex.get("before") or ex.get("after") or ""
                marks = re.findall(r"<<(.*?)>>", text)
                if len(marks) != 2:
                    skipped += 1
                    continue

                gaps, ok = [], True
                reason = None
                for n, surface in enumerate(marks):
                    reason = classify(surface, "if" if n == 0 else "result", rid)
                    if reason:
                        ok = False
                        break
                    inf, neg = infinitive_of(surface, table, doubling, problems)
                    if not inf:
                        ok = False
                        break
                    pr = parts(inf, table, doubling, problems)
                    if not pr:
                        ok = False
                        break
                    b, p, pp = pr
                    # computed before the templates are chosen, because the
                    # probe below formats with them too
                    is_be = b.split(" ")[0].lower() == "be"
                    tail  = b[2:] if is_be and len(b) > 2 else ""   # "be working" -> " working"
                    col = if_col if n == 0 else res_col
                    if n == 0:
                        forms = (BE_NEG_IF if is_be else IF_NEG) if neg else IF_POS
                    elif rid == "zero":
                        forms = ZERO_RESULT_NEG if neg else ZERO_RESULT_POS
                    else:
                        forms = (BE_NEG_RESULT if is_be else RESULT_NEG) if neg else RESULT_POS

                    # The present column agrees with the subject, and only the
                    # answer's own column is known to be right — so use the
                    # surface there and the base elsewhere.
                    # Which column the answer sits in is DETECTED, not assumed.
                    # Mixed runs in two directions — "If I had studied, I would
                    # be" is (3,2) but "If I knew, I would have fixed" is (2,3) —
                    # and a per-rule mapping got half of them wrong. Matching the
                    # surface against each column is self-correcting, and it also
                    # catches a sentence filed under the wrong conditional.
                    probe = [f.format(base=b, past=p, part=pp, pres=b,
                                      dont="don't", tail=tail)
                             for f in forms]
                    if surface in probe:
                        col = probe.index(surface)
                    pres = surface if col == 0 else b
                    dont = "doesn't" if neg.lower().replace(" not", "n't") in ("doesn't",) \
                           or neg.lower() in ("does not", "doesn't") else "don't"
                    opts = [f.format(base=b, past=p, part=pp, pres=pres,
                                     dont=dont, tail=tail)
                            for f in forms]

                    # The DATA knows the answer; the generator only supplies the
                    # two distractors. Where they disagree the data wins — it is
                    # hand-written and checked, and this is what makes irregular
                    # negatives ("weren't", not "didn't be") come out right. Any
                    # divergence is reported, not silently swallowed.
                    if opts[col] != surface:
                        divergent.append("%s-%d-%d %s: generated %r, data says %r"
                                         % (rid, set_i, ex_i, "if" if n == 0 else "result",
                                            opts[col], surface))
                        opts[col] = surface

                    gaps.append(OrderedDict([
                        ("role", "if" if n == 0 else "result"),
                        ("hint", inf),
                        ("answer", surface),
                        ("options", opts),
                    ]))

                if not ok:
                    skipped += 1
                    if reason:
                        excluded.append((rid, re.sub(r"<<(.*?)>>", r"[\1]", text), reason))
                    continue

                # the sentence with both gaps blanked, for the game to render
                cue = re.sub(r"<<(.*?)>>", "_____", text)
                items.append(OrderedDict([
                    ("id", "%s-%d-%d" % (rid, set_i, ex_i)),
                    ("type", rid),
                    ("cue", cue),
                    ("gaps", gaps),
                    ("note", rule.get("explanation", "")),
                ]))

                # every generated answer must be one of its own options, or the
                # item is unanswerable — the single check worth failing on
                for g in gaps:
                    if g["answer"] not in g["options"]:
                        problems.append("%s: answer %r is not among %r"
                                        % (items[-1]["id"], g["answer"], g["options"]))

    return items, problems, skipped, excluded, divergent


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data",  required=True)
    ap.add_argument("--verbs", required=True)
    ap.add_argument("--out",   required=True)
    ap.add_argument("--only",  help="comma-separated rule ids, e.g. first,second,third")
    a = ap.parse_args()

    data  = json.load(open(a.data,  encoding="utf-8"))
    verbs = json.load(open(a.verbs, encoding="utf-8"))
    only  = set(a.only.split(",")) if a.only else None

    items, problems, skipped, excluded, divergent = build(data, verbs, only)

    by_type = OrderedDict()
    for it in items:
        by_type.setdefault(it["type"], []).append(it)

    out = OrderedDict([
        ("title", data.get("title", "Conditionals")),
        ("level", data.get("level", "B2 First")),
        ("built", "build_conditionals_game.py"),
        ("sets", [OrderedDict([
            ("id", t),
            ("label", {"zero":"ZERO","first":"FIRST","second":"SECOND",
                       "third":"THIRD","mixed":"MIXED"}.get(t, t.upper())),
            ("caption", {"first":"a possibility","second":"a dream",
                         "third":"a regret","mixed":"a different outcome",
                         "zero":"always true"}.get(t, "")),
            ("items", v)]) for t, v in by_type.items()]),
    ])

    with open(a.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print("wrote %s" % a.out)
    for t, v in by_type.items():
        print("   %-8s %3d items" % (t, len(v)))
    if skipped:
        print("\n   skipped %d example(s):" % skipped)
        seen = set()
        for rid, sent, why in excluded:
            if why in seen:
                print("      %-7s %s" % (rid, sent))
            else:
                seen.add(why)
                print("      %-7s %s\n              -> %s" % (rid, sent, why))
    if divergent:
        print("\n   %d gap(s) where the data overrode the generator — worth an eye:" % len(divergent))
        for d in divergent:
            print("      ·", d)
    if problems:
        print("\n%d thing(s) need a human — nothing was guessed:" % len(problems))
        for p in OrderedDict.fromkeys(problems):
            print("   ·", p)
        sys.exit(1)


if __name__ == "__main__":
    main()
