#!/usr/bin/env python3
"""Syntax-check the <script> of every built page, and check the CSS did not
leak into it. Written because a patch anchored on a comment string that
appeared in BOTH the stylesheet and the script, and Python's str.replace
hits every occurrence — so an entire CSS block was pasted into the JS and
the page died on load with 'Unexpected token .'"""
import re,sys,subprocess,os,json

def check(path):
    h=open(path,encoding='utf8').read(); bad=[]
    css=h[h.index('<style>'):h.index('</style>')]
    js =h[h.index('<script>')+8:h.rindex('</script>')]

    # 1. CSS leaked into JS?
    for pat in (r'^\s*\.[a-zA-Z-]+\{', r'^\s*@media\(', r'^\s*@keyframes '):
        m=re.search(pat,js,re.M)
        if m: bad.append(f"CSS rule inside <script>: {js[m.start():m.start()+50]!r}")

    # 2. duplicated section banners (the thing that caused it)
    for banner in set(re.findall(r'/\* ── ([A-Z ]+) ──',h)):
        n=len(re.findall(r'/\* ── '+banner+r' ──',h))
        if n>1: bad.append(f"banner '{banner.strip()}' appears {n}x — ambiguous patch anchor")

    # 3. does the JS actually parse?
    open('/tmp/x.js','w',encoding='utf8').write(js)
    r=subprocess.run(['node','--check','/tmp/x.js'],capture_output=True,text=True)
    if r.returncode: bad.append("JS syntax: "+r.stderr.strip().split('\n')[0])

    # 4. every getElementById target exists in the markup
    for i in set(re.findall(r"\$\('([^']+)'\)",js)) | set(re.findall(r"getElementById\('([^']+)'\)",js)):
        if f'id="{i}"' not in h: bad.append(f"$('{i}') has no element")

    if bad or '-v' in sys.argv: print(("  FAIL " if bad else "  ok   ")+path)
    for b in bad: print("         ! "+b)
    return not bad

def find():
    """No arguments: scan every page in the repo, the way apply-hygiene.sh
    does. Run from the repository root."""
    if not os.path.exists('index.html'):
        print("Run this from the repository root, or pass files explicitly.")
        sys.exit(1)
    out=[]
    for root,dirs,files in os.walk('.'):
        dirs[:]=[d for d in dirs if d not in ('.git','node_modules')]
        for f in files:
            if f.endswith('.html'):
                p=os.path.join(root,f)
                if os.path.getsize(p)<200: continue      # the 1-byte stubs
                h=open(p,encoding='utf8',errors='ignore').read()
                if '<script>' in h and '<style>' in h: out.append(p)
    return sorted(out)

paths = sys.argv[1:] or find()
print(f"checking {len(paths)} pages\n")
results=[check(p) for p in paths]
n=sum(1 for r in results if not r)
print()
print(f"{len(paths)-n} ok, {n} failing")
sys.exit(1 if n else 0)
