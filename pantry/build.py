#!/usr/bin/env python3
"""Build the two versions of the Word formation lab from one template.

  python build.py

Reads   template.html, wordformation-v2.json   (next to this script)
Writes  index.html                    fetches wordformation-v2.json at load time (needs a web server)
        wordformation-standalone.html has the JSON inlined (works by double-click)

Edit the JSON, run this, done. Nothing else needs touching.
"""
import json, sys
from pathlib import Path

here = Path(__file__).parent
data_file = here / (sys.argv[1] if len(sys.argv) > 1 else "wordformation-v2.json")
data = json.loads(data_file.read_text(encoding="utf-8"))   # fails loudly if the JSON is broken

# --- checks (same ones the page runs in My progress > Your data) ---
warn, rules, seen = [], {r["id"] for r in data.get("rules", [])}, set()
for n in data["nodes"]:
    forms = {f["w"] for f in n["forms"]}
    for f in n["forms"]:
        fid = n["base"] + ":" + f["w"]
        if fid in seen: warn.append(f"Duplicate form {fid}")
        seen.add(fid)
        for k in ("ex", "teen"):
            if f.get(k) and f["w"].lower() not in f[k].lower():
                warn.append(f"{f['w']}: '{k}' sentence does not contain the word")
        if not f.get("ex"): warn.append(f"{f['w']}: no example sentence")
        if data.get("affixes") and f.get("affix") not in data["affixes"]:
            warn.append(f"{f['w']}: affix {f.get('affix')} not in glossary")
        if f.get("rule") and f["rule"] not in rules: warn.append(f"{f['w']}: unknown rule {f['rule']}")
        if "alts" in f:
            b = f["affix"].replace("-", "")
            ok = f["w"].startswith(b) if f["type"] == "prefix" else f["w"].endswith(b)
            if len(f["alts"]) != 3 or not ok: warn.append(f"{f['w']}: alts must be 3 items and match the word's affix")
    for a in n.get("avoid", []):
        if a["for"] not in forms: warn.append(f"{a['w']}: 'for' {a['for']} is not a form of {n['base']}")

template = (here / "template.html").read_text(encoding="utf-8")
marker = "<script>/*WF_INLINE*/</script>"
assert marker in template, "template.html is missing the WF_INLINE marker"

(here / "index.html").write_text(template.replace(marker, ""), encoding="utf-8")
inline = "<script>window.WF_DATA = " + json.dumps(data, ensure_ascii=False).replace("</", "<\\/") + ";</script>"
(here / "wordformation-standalone.html").write_text(template.replace(marker, inline), encoding="utf-8")

forms = sum(len(n["forms"]) for n in data["nodes"])
print(f"Built index.html (fetch) and wordformation-standalone.html (inline): {len(data['nodes'])} families, {forms} forms.")
print("Data check:", "no problems." if not warn else f"{len(warn)} issue(s)")
for w in warn: print("  -", w)
