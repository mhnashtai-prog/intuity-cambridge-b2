#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════
# INTUITY — the two fixes a patch file cannot carry cleanly.
#
# Run from the repository root. Safe to run twice; every step checks first.
#
#   1. One cache-bust for the shared shell.
#   2. One home for the vocabulary data.
#
# Both are file MOVES and DELETES, which is why they are a script rather than
# part of step-1.patch: a diff of 13 deleted JSON files is 25,000 lines of
# noise around 40 lines of signal.
# ══════════════════════════════════════════════════════════════════════════
set -euo pipefail

[ -f "index.html" ] || { echo "Run this from the repository root."; exit 1; }

echo "── 1. CACHE-BUST ─────────────────────────────────────────────────────"
# Before: ?v=2 on 25 pages, ?v=4 on 13, ?v=5 on 5. The shell exists so that
# drift is impossible; the query string put drift back, and pinned 25 pages
# to the stylesheet from BEFORE the token overhaul. A returning student could
# hold three different cached shells at once.
#
# The version stays — it is how you force a refetch — but there is one of it.
before=$(grep -rho 'intuity-shell\.css?v=[0-9]*' --include="*.html" . | sort -u | tr '\n' ' ')
echo "   was: ${before:-none}"
find . -name "*.html" -not -path "./.git/*" -exec \
  sed -i 's|intuity-shell\.css?v=[0-9]*|intuity-shell.css?v=6|g' {} +
find . -name "*.html" -not -path "./.git/*" -exec sed -i \
  's|vocab\.css?v=[0-9]*|vocab.css?v=4|g;
   s|vocab\.js?v=[0-9]*|vocab.js?v=4|g;
   s|colloc\.css?v=[0-9]*|colloc.css?v=2|g;
   s|colloc\.js?v=[0-9]*|colloc.js?v=2|g' {} +
echo "   now: $(grep -rho 'intuity-shell\.css?v=[0-9]*' --include='*.html' . | sort -u)"

echo
echo "── 2. ONE HOME FOR THE DATA ──────────────────────────────────────────"
SRC="skills/similar-words/data"
DST="data/similar-words"

if [ ! -d "$SRC" ]; then
  echo "   already collapsed — nothing to do."
else
  # Of the 13 files present in both places, 12 were byte-identical and the
  # 13th (functional-drills.json) differed by a single trailing byte and
  # parsed EQUAL. So there was no real divergence to reconcile — but there
  # was one file already one byte away from becoming one, which is the whole
  # argument for not keeping two copies.
  #
  # Two files existed ONLY under skills/. They move; they are not deleted.
  for f in functional-english.json quiz-data.json; do
    [ -f "$SRC/$f" ] && { cp -n "$SRC/$f" "$DST/$f"; echo "   moved  $f"; }
  done
  [ -d "$SRC/expanded" ] && { mkdir -p "$DST/expanded"; cp -rn "$SRC/expanded/." "$DST/expanded/"; echo "   moved  expanded/ (26 files)"; }

  # Nothing may be deleted while anything still reads it. The legacy pages
  # fetched 'data/x.json' — document-relative, so it resolved INTO the copy
  # that is about to go. They are repointed at the single home first, in the
  # same root-absolute idiom their <link> tags already use.
  python3 - <<'PY'
import glob, re
n = 0
for p in glob.glob('skills/similar-words/*.html'):
    s = open(p).read(); before = s
    s = re.sub(r"(['\"])\.?/?data/([a-z0-9\-]+\.json)\1", r"\1/data/similar-words/\2\1", s)
    s = re.sub(r"(['\"])\.?/?data/expanded/",             r"\1/data/similar-words/expanded/", s)
    if s != before:
        open(p, 'w').write(s); n += 1
print(f"   repointed {n} pages at /data/similar-words/")
PY

  rm -rf "$SRC"
  echo "   removed $SRC"
fi

echo
echo "── 3. VERIFY ─────────────────────────────────────────────────────────"
python3 - <<'PY'
import glob, re, os
missing = {(m, p) for p in glob.glob('skills/**/*.html', recursive=True)
                  for m in re.findall(r"['\"](/data/[^'\"]+\.json)['\"]", open(p).read())
                  if not os.path.exists('.' + m)}
for m, p in sorted(missing):
    print(f"   BROKEN  {m}  ({p})")
print(f"   {len(missing)} broken data reference(s)")
PY
echo
echo "Expected: exactly 1 — /data/similar-words/prepositions-quiz.json, referenced"
echo "by quiz-shell.html. That file has never existed in this repository; the"
echo "reference was already broken and is left alone rather than guessed at."
