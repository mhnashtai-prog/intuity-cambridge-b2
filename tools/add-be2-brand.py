#!/usr/bin/env python3
"""
Adds the Be2FIRST wordmark script to every live page, once.

  python3 tools/add-be2-brand.py            # dry run: lists what would change
  python3 tools/add-be2-brand.py --apply    # writes the changes

For every .html file that still says INTUITY (archive folders skipped):
  1. inserts  <script src="/tools/be2-brand.js?v=1"></script>  just before </head>
     (skipped if the page already has it)
  2. rewrites INTUITY -> Be2FIRST inside <title> and og:/twitter: title metas,
     so tabs, bookmarks and link previews are right even before JS runs.

The visible header is NOT rewritten here — be2-brand.js owns it, so the mark
stays defined in one file. Run from the repo root. Safe to run twice.
"""
import re, sys, pathlib

APPLY = '--apply' in sys.argv
ROOT = pathlib.Path('.')
SKIP = {'bin', 'newbin', 'original-full-files', 'faulty-codes', 'pantry', 'pantry1',
        'data1', 'data2', 'data3', 'data4', 'new-ideas', 'datacentre', '.git'}
TAG = '<script src="/tools/be2-brand.js?v=1"></script>'

title_re = re.compile(r'(<title>)(.*?)(</title>)', re.S | re.I)
meta_re = re.compile(r'(<meta[^>]+(?:og:title|twitter:title|og:site_name)[^>]*>)', re.I)

changed = 0
for p in sorted(ROOT.rglob('*.html')):
    if SKIP & set(p.parts):
        continue
    src = p.read_text(encoding='utf-8', errors='surrogateescape')
    if 'INTUITY' not in src:
        continue
    out = src
    out = title_re.sub(lambda m: m.group(1) + m.group(2).replace('INTUITY', 'Be2FIRST') + m.group(3), out)
    out = meta_re.sub(lambda m: m.group(1).replace('INTUITY', 'Be2FIRST'), out)
    if 'be2-brand.js' not in out:
        if re.search(r'</head>', out, re.I):
            out = re.sub(r'(\s*)</head>', lambda m: '\n' + TAG + m.group(1) + '</head>', out, count=1, flags=re.I)
        else:
            print(f'  ! no </head>, skipped: {p}')
            continue
    if out != src:
        changed += 1
        print(('updated  ' if APPLY else 'would update  ') + str(p))
        if APPLY:
            p.write_text(out, encoding='utf-8', errors='surrogateescape')

print(f'\n{changed} file(s) {"updated" if APPLY else "to update — re-run with --apply"}.')
