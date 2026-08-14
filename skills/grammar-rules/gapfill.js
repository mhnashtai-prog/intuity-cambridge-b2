/* INTUITY — shared gap-fill engine.

   Each quiz page is a thin shell: it sets window.QUIZ_DATA to the name of its
   data file, then loads this script. Everything else — parsing, marking,
   scoring, one-blank and two-blank items — lives here, so a fix lands on
   every quiz at once instead of being copied five times and drifting.
*/
/* The host page passes the data file as ?json=... so one quiz shell can
       serve several rule sets. Fall back to the default when it is absent,
       and refuse anything that is not a same-origin relative path. */
    const DATA_URL = (function () {
      const fallback = '../../data/grammar-rules/' + (window.QUIZ_DATA || '') + '.json';
      const asked = new URLSearchParams(location.search).get('json');
      if (!asked) return fallback;
      if (/^[a-z]+:/i.test(asked) || asked.startsWith('//')) return fallback;
      /* The shell page passes its own -rules.json here, which holds the
         Explore and Practice content and has no gapfill key at all. Only
         take the parameter when it names a quiz data file. */
      if (!/gapfill|complete/i.test(asked)) return fallback;
      return asked;
    })();

    let allTests = [];
    let currentTest = 0;
    let userAnswers = {};
    let isChecked = false;

    /* ─────────── answers ─────────── */

    /* Phones convert ' to ’ whether the student wants it or not, so
       "wasn't built" has to match "wasn’t built", or half the negatives in
       a set mark wrong because of a keyboard's decision. */
    function normalizeAnswer(answer) {
      return String(answer || '')
        .toLowerCase()
        .replace(/[\u2018\u2019\u201B\u02BC]/g, "'")
        .trim()
        .replace(/\s+/g, ' ');
    }

    /* Two-blank items store both halves in one string joined by " / ",
       so every comparison works on parts, and a one-blank item is just
       the single-part case. */
    function splitParts(value) {
      return String(value || '').split('/').map(normalizeAnswer);
    }

    /* Data may carry `alternatives` (array) or the older single
       `alternativeAnswer`. Accept either shape so a half-updated folder
       still works. */
    function acceptedAnswers(item) {
      const list = [item.answer];
      if (Array.isArray(item.alternatives)) list.push(...item.alternatives);
      else if (item.alternativeAnswer) list.push(item.alternativeAnswer);
      return list.filter(Boolean);
    }

    function isAnswerCorrect(item, given) {
      const got = splitParts(given);
      return acceptedAnswers(item).some(function (accepted) {
        const want = splitParts(accepted);
        return want.length === got.length && want.every((p, i) => p === got[i]);
      });
    }

    /* A two-blank item is only answered when both halves have something in
       them: joining two empty boxes still produces " / ", which used to
       read as a filled-in answer and opened the Submit gate on untouched
       items. */
    function isAnswered(item, value) {
      const parts = splitParts(value);
      const needed = item.blanks === 2 ? 2 : 1;
      if (parts.length < needed) return false;
      for (let i = 0; i < needed; i++) if (!parts[i]) return false;
      return true;
    }

    function countAnswered() {
      return allTests[currentTest].sentences
        .filter((item, idx) => isAnswered(item, userAnswers[idx])).length;
    }

    /* ─────────── text ─────────── */

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function boxWidth(value, min) {
      return Math.max((String(value).length || 3) * 8 + 20, min);
    }

    function highlightOnce(text, verb) {
      if (!verb) return { text: text, hit: false };
      const escaped = verb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp('\\b' + escaped + '\\b', 'i');
      if (!re.test(text)) return { text: text, hit: false };
      return { text: text.replace(re, '<span class="main-verb">$&</span>'), hit: true };
    }

    /* The cue verb can sit either side of the gap, so walk the segments in
       reading order and stop at the first match. */
    function highlightSegments(segments, verb) {
      let found = false;
      return segments.map(function (segment) {
        if (found) return segment;
        const result = highlightOnce(segment, verb);
        found = result.hit;
        return result.text;
      });
    }

    /* One parser for both shapes. Two-blank items may or may not carry a
       verb hint, so the hinted pattern is tried first. */
    function parseSentence(item) {
      let m;
      if (item.blanks === 2) {
        m = item.text.match(/(.*?)_____(.*?)_____ \(([^)]+)\)(.*)/);
        if (m) return { blanks: 2, pre: m[1], mid: m[2], hint: m[3], post: m[4] };
        m = item.text.match(/(.*?)_____(.*?)_____(.*)/);
        if (m) return { blanks: 2, pre: m[1], mid: m[2], hint: '', post: m[3] };
        return null;
      }
      m = item.text.match(/(.*?)_____ \(([^)]+)\)(.*)/);
      if (m) return { blanks: 1, pre: m[1], hint: m[2], post: m[3] };
      return null;
    }

    /* ─────────── why an answer was wrong ─────────── */

    /* Showing the correct form tells a student what to write. It does not
       tell them why, so the same item is missed again next week. The rule
       that governs each item is already in the data — this indexes the
       explanations so a wrong answer can carry one. */
    let RULE_INDEX = {};

    function indexRules(data) {
      RULE_INDEX = {};

      /* A topic may file its rules as sections in an array, each with a
         `structure` and the `explanation` of when to use it. Index those
         first so an item whose `rule` is a structure can show the reason
         behind it. */
      if (Array.isArray(data.rules)) {
        for (const section of data.rules) {
          if (section && section.structure) {
            RULE_INDEX[section.structure.trim().toLowerCase()] = {
              pattern: section.structure,
              example: section.explanation
            };
          }
        }
      }

      const cats = (data.rules && data.rules.categories) || [];
      for (const cat of cats) {
        for (const group of ['verbs', 'phrases', 'prepositions', 'go_activities']) {
          /* Most groups are arrays of entries, but a few are a single entry
             object (go_activities). Accept either rather than assuming. */
          const raw = cat[group];
          const entries = Array.isArray(raw) ? raw : (raw ? [raw] : []);
          for (const entry of entries) {
            if (entry && entry.pattern) {
              RULE_INDEX[entry.pattern.trim().toLowerCase()] = entry;
            }
          }
        }
      }
    }

    /* Two tiers, so this never depends on a lookup succeeding: the item's own
       rule always shows, and a worked example is added when the rule matches
       a documented pattern. Items with no rule at all get nothing. */
    function ruleNoteHtml(item) {
      const rule = (item.rule || '').trim();
      if (!rule) return '';

      const entry = RULE_INDEX[rule.toLowerCase()];
      let html = '<div class="rule-note"><span class="rule-pattern">' + escapeHtml(rule) + '</span>';
      if (entry && entry.example) {
        html += '<span class="rule-example">' + escapeHtml(entry.example) + '</span>';
      }
      if (entry && entry.negative) {
        html += '<span class="rule-negative">' + escapeHtml(entry.negative) + '</span>';
      }
      return html + '</div>';
    }

    /* ─────────── loading ─────────── */

    async function loadData() {
      try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error('HTTP ' + response.status);

        const data = await response.json();
        indexRules(data);
        allTests = (data.gapfill && data.gapfill.tests) || [];
        if (!allTests.length) throw new Error('No tests found in gapfill.tests');

        renderTestSelector();
        loadTest(0);
      } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('contentContainer').innerHTML =
          '<div class="error">' +
          '<div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>' +
          '<div>The quiz did not load</div>' +
          '<div style="font-size: 0.75rem; margin-top: 0.5rem;">' +
          escapeHtml(error.message) + ' — checked ' + escapeHtml(DATA_URL) +
          '</div></div>';
      }
    }

    function renderTestSelector() {
      const selector = document.getElementById('testSelector');
      selector.innerHTML = '';

      allTests.forEach(function (test, index) {
        const btn = document.createElement('button');
        btn.className = 'test-btn' + (index === currentTest ? ' active' : '');
        btn.textContent = test.title;
        btn.onclick = () => loadTest(index);
        selector.appendChild(btn);
      });
    }

    function loadTest(index) {
      currentTest = index;
      userAnswers = {};
      isChecked = false;
      renderTestSelector();
      renderTest();
      updateProgressInfo();
    }

    function updateProgressInfo() {
      const test = allTests[currentTest];

      document.getElementById('progressInfo').style.display = 'flex';
      document.getElementById('progressText').textContent =
        countAnswered() + '/' + test.sentences.length + ' answered';

      const dots = document.getElementById('progressDots');
      dots.innerHTML = '';

      test.sentences.forEach(function (item, idx) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        if (isAnswered(item, userAnswers[idx])) dot.classList.add('answered');
        dots.appendChild(dot);
      });
    }

    /* ─────────── rendering ─────────── */

    function inputHtml(cls, id, value, min, handler) {
      const style = 'width: ' + boxWidth(value, min) + 'px;';
      if (isChecked) {
        return '<input type="text" class="' + cls + '" value="' + escapeHtml(value) +
               '" readonly style="' + style + '" />';
      }
      return '<input type="text" class="' + cls + '" id="' + id + '" value="' +
             escapeHtml(value) + '" oninput="' + handler + '" placeholder="..." style="' +
             style + '" />';
    }

    function renderTest() {
      const test = allTests[currentTest];
      let html = '<div class="sentences">';

      test.sentences.forEach(function (item, idx) {
        const parsed = parseSentence(item);
        const value = userAnswers[idx] || '';
        const numClass = isAnswered(item, value) ? 'question-number answered' : 'question-number';

        html += '<div class="sentence-row">';
        html += '<div class="' + numClass + '">' + (idx + 1) + '</div>';
        html += '<div class="sentence-text">';

        if (!parsed) {
          html += '<span class="malformed">Item ' + escapeHtml(item.id || idx + 1) +
                  ' has no readable gap — check its "text" field.</span></div></div>';
          return;
        }

        const correct = isChecked ? isAnswerCorrect(item, value) : false;
        const cls = isChecked
          ? 'answer-input ' + (correct ? 'correct' : 'incorrect')
          : 'answer-input';

        if (parsed.blanks === 2) {
          const parts = value.split('/');
          const first = (parts[0] || '').trim();
          const second = (parts[1] || '').trim();
          const seg = highlightSegments([parsed.pre, parsed.mid, parsed.post], item.highlightVerb);

          html += seg[0];
          html += inputHtml(cls, 'input-' + idx + '-1', first, 60, 'handleTwoBlankInput(' + idx + ')');
          html += seg[1];
          html += inputHtml(cls, 'input-' + idx + '-2', second, 60, 'handleTwoBlankInput(' + idx + ')');
          if (isChecked && !correct) {
            html += '<span class="correct-answer">' + escapeHtml(item.answer) + '</span>';
          }
          if (parsed.hint) html += ' <span class="verb-hint">[' + escapeHtml(parsed.hint) + ']</span>';
          html += seg[2];
        } else {
          const seg = highlightSegments([parsed.pre, parsed.post], item.highlightVerb);

          html += seg[0];
          html += inputHtml(cls, 'input-' + idx + '-1', value, 80, 'handleInput(' + idx + ')');
          if (isChecked && !correct) {
            html += '<span class="correct-answer">' + escapeHtml(item.answer) + '</span>';
          }
          html += ' <span class="verb-hint">[' + escapeHtml(parsed.hint) + ']</span>';
          html += seg[1];
        }

        if (item.helper) {
          html += ' <span class="helper-word">[' + escapeHtml(item.helper) + ']</span>';
        }

        if (isChecked && !correct) html += ruleNoteHtml(item);

        html += '</div></div>';
      });

      html += '</div>';
      /* The footer lives in its own container so it can be updated while the
         student types — without rebuilding, and destroying, the input they
         are typing into. */
      html += '<div id="quizFooter"></div>';

      document.getElementById('contentContainer').innerHTML = html;
      updateFooter();
    }

    function updateFooter() {
      const foot = document.getElementById('quizFooter');
      if (!foot) return;

      if (countAnswered() < allTests[currentTest].sentences.length) {
        foot.innerHTML = '';
        return;
      }

      foot.innerHTML = '<div class="footer visible">' +
        '<button class="secondary" onclick="clearAnswers()" ' +
        (isChecked ? 'disabled' : '') + '>Clear</button>' +
        (isChecked
          ? '<button class="results" onclick="showModal()">View Results</button>'
          : '<button class="primary" onclick="checkAnswers()">Submit</button>') +
        '</div>';
    }

    /* ─────────── input ─────────── */

    function handleInput(idx) {
      const input = document.getElementById('input-' + idx + '-1');
      userAnswers[idx] = input.value;
      /* Grow the box with the answer, but never rebuild the page: rebuilding
         replaces this very input and the student loses focus mid-word. */
      input.style.width = boxWidth(input.value, 80) + 'px';
      updateProgressInfo();
      updateFooter();
    }

    function handleTwoBlankInput(idx) {
      const first = document.getElementById('input-' + idx + '-1');
      const second = document.getElementById('input-' + idx + '-2');

      first.style.width = boxWidth(first.value, 60) + 'px';
      second.style.width = boxWidth(second.value, 60) + 'px';

      userAnswers[idx] = first.value.trim() + ' / ' + second.value.trim();
      updateProgressInfo();
      updateFooter();
    }

    /* ─────────── scoring ─────────── */

    function checkAnswers() {
      const test = allTests[currentTest];
      const total = test.sentences.length;
      let correct = 0;

      test.sentences.forEach(function (item, idx) {
        if (isAnswerCorrect(item, userAnswers[idx])) correct++;
      });

      isChecked = true;
      renderTest();

      document.getElementById('modalSubtitle').textContent = test.title;
      document.getElementById('scoreNumber').textContent = correct + '/' + total;
      document.getElementById('scoreLabel').textContent =
        Math.round((correct / total) * 100) + '% Correct';

      document.getElementById('nextTestBtn').style.display =
        currentTest < allTests.length - 1 ? 'block' : 'none';

      showModal();
    }

    function clearAnswers() {
      if (isChecked) return;
      if (confirm('Clear all answers?')) {
        userAnswers = {};
        renderTest();
        updateProgressInfo();
      }
    }

    function showModal() {
      document.getElementById('scoreModal').classList.add('active');
    }

    function closeModal() {
      document.getElementById('scoreModal').classList.remove('active');
    }

    function nextTest() {
      closeModal();
      if (currentTest < allTests.length - 1) loadTest(currentTest + 1);
    }

    document.getElementById('scoreModal').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });

    window.addEventListener('load', loadData);
