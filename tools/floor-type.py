#!/usr/bin/env python3
"""Raise any font-size under 11px (0.6875rem) to 11px on every live page and the stylesheets
they load. Run from the repo root: python3 tools/floor-type.py [--apply]. Safe to run twice."""
import re,sys,json,pathlib
APPLY='--apply' in sys.argv
R=json.load(open('/tmp/reach.json')); files=set(R)
for p in R:
    s=pathlib.Path(p).read_text(encoding='utf-8',errors='ignore')
    for h in re.findall(r'<link[^>]+href=["\'](/?[^"\':]+\.css)',s):
        c=h.lstrip('/') if h.startswith('/') else str(pathlib.Path(p).parent/h)
        if pathlib.Path(c).exists(): files.add(str(pathlib.Path(c)))
rx=re.compile(r'(font-size\s*:\s*|\bfont\s*:\s*(?:(?:italic|normal|bold|\d{3})\s+)*)(\d*\.?\d+)(rem|px)\b')
def f(m):
    v=float(m.group(2)); u=m.group(3)
    if u=='rem' and v<0.6875: return f'{m.group(1)}0.6875rem'
    if u=='px' and v<11: return f'{m.group(1)}11px'
    return m.group(0)
tot=0;ch=0
for p in sorted(files):
    s=pathlib.Path(p).read_text(encoding='utf-8',errors='surrogateescape')
    n,k=rx.subn(lambda m:f(m),s)
    d=sum(1 for a,b in zip(rx.findall(s),rx.findall(n)) if a!=b)
    if n!=s:
        ch+=1; tot+=d
        if APPLY: pathlib.Path(p).write_text(n,encoding='utf-8',errors='surrogateescape')
print(f'{tot} sizes raised in {ch} files' + ('' if APPLY else ' (dry run)'))
