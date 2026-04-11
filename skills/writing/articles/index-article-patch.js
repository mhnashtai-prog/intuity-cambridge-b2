/* ══════════════════════════════════════════════════════════════
   INTUITY index.html — Article writing type patch
   
   TWO CHANGES NEEDED:
   
   1. ADD "Article" tile to the writing modal options array
   2. ADD "articles" submenu block to the submenus object
   ══════════════════════════════════════════════════════════════ */


/* ── CHANGE 1 ──────────────────────────────────────────────────
   In the writing modal options array, add this tile:
   (after the Reports tile, or wherever you want Articles to appear)
*/

// WRITING MODAL — add this tile:
{ name: 'Articles', action: 'submenu', submenu: 'articles' },

/*
   The full writing options block should read:
   
   writing: {
     title: 'Writing Practice',
     options: [
       { name: 'Essays',   action: 'submenu', submenu: 'essays'   },
       { name: 'Reviews',  action: 'submenu', submenu: 'reviews'  },
       { name: 'Emails',   action: 'submenu', submenu: 'emails'   },
       { name: 'Reports',  action: 'submenu', submenu: 'reports'  },
       { name: 'Articles', action: 'submenu', submenu: 'articles' },  ← ADD THIS
     ]
   },
*/


/* ── CHANGE 2 ──────────────────────────────────────────────────
   In the submenus object, add this block
   (alongside essays, reviews, emails, reports):
*/

articles: {
  title: 'Articles — B2 First',
  backTo: 'writing',
  useGridStyle: true,
  options: [
    {
      name: '📖<br>Study',
      action: 'navigate',
      url: 'skills/writing/articles/article-question.html'
    },
    {
      name: '📝<br>Model',
      action: 'navigate',
      url: 'skills/writing/articles/article-model.html'
    },
    {
      name: '✦<br>Sample',
      action: 'navigate',
      url: 'skills/writing/articles/article-sample.html'
    },
  ]
},

/*
   NOTE ON TILE LABELS
   ───────────────────
   The article module has 3 pages (not 4 like essays).
   Study  → article-question.html  (choose a Cambridge prompt)
   Model  → article-model.html     (skeleton + phrases + practice)
   Sample → article-sample.html    (full annotated model answers)
   
   If/when a Quiz page is added later, add:
   { name: '💬<br>Quiz', action: 'navigate', url: 'skills/writing/articles/article-quiz.html' }
   
   FILE DEPLOYMENT
   ───────────────
   Create folder:  skills/writing/articles/
   Upload files:
     article-question.html
     article-model.html
     article-sample.html
   
   No external JSON files needed — all data is embedded in the HTML.
   No data/ subfolder required.
   
   BACK LINKS IN THE THREE HTML FILES
   ────────────────────────────────────
   The back-link in each file currently reads:
     href="../../index.html"
   
   This assumes the files live at:
     skills/writing/articles/article-*.html
   
   If your index.html is at the repo root, ../../index.html
   correctly resolves to:
     skills/writing/articles/ → skills/writing/ → skills/ → root ✗
   
   Actually: skills/writing/articles/ is 3 levels deep, so:
     href="../../../index.html"   ← THREE dots
   
   Check and update the back-link in all three files if needed.
*/
