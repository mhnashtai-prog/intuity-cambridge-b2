#!/usr/bin/env python3
"""Build the Word Formation page from one source.

    python3 build.py                 regenerate the JSON and the standalone page
    python3 build.py --install DIR   also lay the INTUITY files out under DIR
                                     (skills/similar-words/, data/similar-words/)

SOURCE OF TRUTH
    build_wordformation.py   the words (-> wordformation.json)
    wordformation.js         all behaviour, used by BOTH pages
    wordformation.css        every style this page adds, used by BOTH pages
    word-formation.html      the INTUITY page (hand-kept, unchanged by this build)
    standalone-shell.html    the frame of the standalone page only

GENERATED
    wordformation.json
    word-formation-standalone.html   shell + css + data + js, inlined
"""
import json, pathlib, shutil, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent

def read(name):
    return (HERE / name).read_text(encoding='utf-8')

def once(text, marker):
    if text.count(marker) != 1:
        sys.exit('standalone-shell.html must contain %r exactly once' % marker)

# 1 ── the words
r = subprocess.run([sys.executable, 'build_wordformation.py'], cwd=HERE,
                   capture_output=True, text=True)
sys.stdout.write(r.stdout)
if r.returncode != 0:
    sys.exit('build_wordformation.py reported problems:\n' + r.stdout + r.stderr)

# 2 ── the standalone page
shell, css, js = read('standalone-shell.html'), read('wordformation.css'), read('wordformation.js')
data = json.loads(read('wordformation.json'))
for m in ('/*__WORDFORMATION_CSS__*/', '/*__DATA__*/null', '/*__WORDFORMATION_JS__*/'):
    once(shell, m)
for name, body in (('wordformation.js', js), ('wordformation.css', css)):
    if '</script' in body.lower() or '</style' in body.lower():
        sys.exit(name + ' contains a closing tag that would end its inline block')

blob = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
out = (shell.replace('/*__WORDFORMATION_CSS__*/', css)
            .replace('/*__DATA__*/null', blob)
            .replace('/*__WORDFORMATION_JS__*/', js))
(HERE / 'word-formation-standalone.html').write_text(out, encoding='utf-8')
print('wrote word-formation-standalone.html (%d KB)' % (len(out.encode()) // 1024))

# 3 ── syntax check, when node is there
if shutil.which('node'):
    tmp = HERE / '.check.js'
    tmp.write_text(js, encoding='utf-8')
    ok = subprocess.run(['node', '--check', str(tmp)]).returncode == 0
    tmp.unlink()
    if not ok:
        sys.exit('wordformation.js has a syntax error')
    print('wordformation.js: syntax ok')

# 4 ── optional: lay the INTUITY files out where the app expects them
if '--install' in sys.argv:
    root = pathlib.Path(sys.argv[sys.argv.index('--install') + 1])
    (root / 'skills/similar-words').mkdir(parents=True, exist_ok=True)
    (root / 'data/similar-words').mkdir(parents=True, exist_ok=True)
    shutil.copy(HERE / 'word-formation.html', root / 'skills/similar-words/word-formation.html')
    for f in ('wordformation.js', 'wordformation.css', 'wordformation.json'):
        shutil.copy(HERE / f, root / 'data/similar-words' / f)
    print('installed under', root)
