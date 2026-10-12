#!/usr/bin/env python3
"""
One type system for Be2FIRST, as intuity-shell.css decided: ONE superfamily for display,
body and mono. Run from the repo root:  python3 tools/unify-fonts.py [--apply]

  Geist          display and text      (Space Grotesk, DM Sans, Inter, Instrument Sans, Barlow, Barlow Condensed)
  Geist Mono     labels, counters      (DM Mono, IBM Plex Mono, JetBrains Mono)
  Anton          big poster headlines  (Bebas Neue, Archivo Black)
  Newsreader     example sentences, the teaching voice   (Playfair Display, Crimson Text, Caveat)
  Space Grotesk  the Be2FIRST wordmark ONLY (be2-brand.js and the shell's .be2 rules keep it)

Only font declarations are rewritten (font-family, font shorthand, --f-* variables, inline
style attributes). Every Google Fonts request becomes ONE request for these families.
Safe to run twice.
"""
import re, sys, json, pathlib
APPLY = '--apply' in sys.argv
MAP = {
  'Barlow Condensed':'Geist', 'Space Grotesk':'Geist', 'Instrument Sans':'Geist', 'DM Sans':'Geist',
  'Inter':'Geist', 'Barlow':'Geist',
  'IBM Plex Mono':'Geist Mono', 'JetBrains Mono':'Geist Mono', 'DM Mono':'Geist Mono',
  'Playfair Display':'Newsreader', 'Crimson Text':'Newsreader', 'Caveat':'Newsreader',
  'Bebas Neue':'Anton', 'Archivo Black':'Anton',
}
FONTS_URL = ('https://fonts.googleapis.com/css2?family=Geist:wght@400..900'
             '&family=Geist+Mono:wght@400..600&family=Space+Grotesk:wght@700&family=Anton'
             '&family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..500&display=swap')
names = sorted(MAP, key=len, reverse=True)          # longest first: "Geist Mono" before "Geist"
name_re = re.compile(r"(['\"]?)\b(" + '|'.join(re.escape(n) for n in names) + r")\b\1(?![\w-])")
decl_re = re.compile(r"((?:font-family|--f-[\w-]+|--font[\w-]*)\s*:\s*)([^;{}<>]+)|(\bfont\s*:\s*)([^;{}<>]+)")

def fix_decl(m):
    head = m.group(1) or m.group(3); body = m.group(2) if m.group(1) else m.group(4)
    def sub(n):
        q, name = n.group(1), n.group(2)
        return f"{q}{MAP[name]}{q}" if q else f"'{MAP[name]}'"
    new = name_re.sub(sub, body)
    # a family named twice after mapping ('DM Sans','DM Sans',…) → once
    parts, seen, out = [p.strip() for p in new.split(',')], set(), []
    for p in parts:
        k = p.strip("'\"").lower()
        if k in seen: continue
        seen.add(k); out.append(p)
    lead = re.match(r'\s*', body).group(0)
    return head + lead + ', '.join(out)

def fix(text):
    t = re.sub(r"https://fonts\.googleapis\.com/css2\?[^\"')\s]+", FONTS_URL, text)
    # Declarations inside <script> are JS strings: quoting a name there can break the
    # string, so scripts are skipped (their fonts are set by the page's CSS anyway).
    parts = re.split(r'(<script\b[\s\S]*?</script>)', t)
    return ''.join(p if p.startswith('<script') else decl_re.sub(fix_decl, p) for p in parts)

reach = json.load(open('/tmp/reach.json')) if pathlib.Path('/tmp/reach.json').exists() else []
files = set(reach)
for p in list(files):                                # local stylesheets those pages load
    s = pathlib.Path(p).read_text(encoding='utf-8', errors='ignore')
    for h in re.findall(r'<link[^>]+href=["\'](/?[^"\':]+\.css)', s):
        c = h.lstrip('/') if h.startswith('/') else str(pathlib.Path(p).parent / h)
        if pathlib.Path(c).exists(): files.add(str(pathlib.Path(c)))
files.discard('tools/be2-brand.js')
changed = 0
for f in sorted(files):
    s = pathlib.Path(f).read_text(encoding='utf-8', errors='surrogateescape')
    n = fix(s)
    if n != s:
        changed += 1
        if APPLY: pathlib.Path(f).write_text(n, encoding='utf-8', errors='surrogateescape')
print(f"{changed} file(s) {'updated' if APPLY else 'would change'} of {len(files)}")
