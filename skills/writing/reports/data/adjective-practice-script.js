// Global state
let currentDataset = 'learn';
let LEARN_DATA = null;
let TEST_DATA = null;
let quizData = null;
let currentTest = 0;
let currentSet = 0;
let answers = {};
let selectedWord = null;
let currentMode = 'classic';
let showingResults = false;
let keyVisible = false;
let testScores = {};
let storageKey = '';
let SETS_PER_TEST = 5;
let wordOrderMap = {};

// Utility Functions
function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getStorageKey() {
  return `report_lang_progress_${currentDataset}`;
}

function loadProgress() {
  try {
    storageKey = getStorageKey();
    const saved = localStorage.getItem(storageKey);
    testScores = saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('Error loading progress:', e);
    testScores = {};
  }
}

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(testScores));
  } catch (e) {
    console.error('Error saving progress:', e);
  }
}

function initializeWordOrder() {
  wordOrderMap = {};
  if (!quizData) return;
  
  quizData.sets.forEach((set, setIdx) => {
    const indices = set.words.map((_, i) => i);
    wordOrderMap[setIdx] = shuffleArray(indices);
  });
}

function getShuffledWords(setIdx) {
  const setData = quizData.sets[setIdx];
  const order = wordOrderMap[setIdx];
  return order.map(idx => ({
    word: setData.words[idx],
    originalIdx: idx
  }));
}

// Data Loading with fetch()
async function loadQuizData() {
  try {
    const container = document.getElementById('classicContainer');
    container.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <div>Loading quiz data...</div>
      </div>
    `;

    const [learnResponse, testResponse] = await Promise.all([
      fetch('data/report-adjective-test.json'),
      fetch('data/report-adjective-mixed.json')
    ]);

    if (!learnResponse.ok || !testResponse.ok) {
      throw new Error('Failed to load quiz data files');
    }

    LEARN_DATA = await learnResponse.json();
    TEST_DATA = await testResponse.json();
    
    quizData = currentDataset === 'learn' ? LEARN_DATA : TEST_DATA;
    
    loadProgress();
    SETS_PER_TEST = quizData.setsPerTest || 5;
    initializeWordOrder();
    createDots();
    createQuestionNavDots();
    loadTest(0);
  } catch (error) {
    console.error('Error loading quiz data:', error);
    showError(`Could not load quiz: ${error.message}`);
  }
}

function showError(message) {
  const container = document.getElementById('classicContainer');
  container.innerHTML = `
    <div class="error-state">
      <div style="font-size: 3rem; margin-bottom: 1rem;">⚠</div>
      <div style="font-size: 1.125rem; color: #f5f5f7; margin-bottom: 0.5rem;">Error Loading Quiz</div>
      <div style="font-size: 0.875rem; color: #8e8e93; margin-bottom: 1rem;">${sanitizeText(message)}</div>
      <button onclick="location.reload()" class="modal-btn modal-btn-primary" style="max-width: 200px; margin: 0 auto;">Reload</button>
    </div>
  `;
}

// Dataset Toggle
function toggleDataset() {
  currentDataset = currentDataset === 'learn' ? 'test' : 'learn';
  
  const switchEl = document.getElementById('datasetToggleSwitch');
  const badge = document.getElementById('modeBadge');
  const learnLabel = document.getElementById('learnLabel');
  const testLabel = document.getElementById('testLabel');
  
  if (currentDataset === 'test') {
    switchEl.classList.add('test-mode');
    switchEl.setAttribute('aria-checked', 'true');
    badge.textContent = 'Test';
    badge.classList.remove('learn');
    badge.classList.add('test');
    learnLabel.classList.remove('active');
    learnLabel.classList.add('inactive');
    testLabel.classList.remove('inactive');
    testLabel.classList.add('active');
    quizData = TEST_DATA;
    showToast('TEST Mode: Mixed language for assessment', 3000);
  } else {
    switchEl.classList.remove('test-mode');
    switchEl.setAttribute('aria-checked', 'false');
    badge.textContent = 'Learn';
    badge.classList.remove('test');
    badge.classList.add('learn');
    learnLabel.classList.remove('inactive');
    learnLabel.classList.add('active');
    testLabel.classList.remove('active');
    testLabel.classList.add('inactive');
    quizData = LEARN_DATA;
    showToast('LEARN Mode: Thematic language for practice', 3000);
  }
  
  loadProgress();
  initializeWordOrder();
  loadTest(0);
}

// Test Management (continues with all the same functions from adjective-practice.html)
// [The rest of the JavaScript code would be identical to the review version]
// For brevity, I'll indicate this continues with all remaining functions...

// Include all remaining functions from adjective-practice.html:
// - loadTest, goToTest, navigateTest, updateNavButtons
// - updateTestInfo, createDots, createQuestionNavDots
// - renderClassicMode, renderGuidedMode
// - selectWord, fillBlank, toggleMode
// - navigatePrevSet, navigateNextSet, updateExternalNav
// - updateFooter, showHint, showKey, updateKeyButton
// - clearAnswers, submitAndScore, showScoreModal
// - closeModal, nextTestModal
// - setupKeyboardShortcuts, setupEventListeners
// - init

// [Continuing with all the functions - identical to review version...]

// Test Management
function loadTest(testIdx) {
  if (!quizData) return;
  
  const totalTests = Math.ceil(quizData.sets.length / SETS_PER_TEST);
  if (testIdx < 0 || testIdx >= totalTests) return;
  
  currentTest = testIdx;
  currentSet = 0;
  answers = {};
  selectedWord = null;
  showingResults = false;
  keyVisible = false;
  
  createQuestionNavDots();
  
  if (currentMode === 'guided') renderGuidedMode();
  else renderClassicMode();
  
  updateTestInfo();
  updateFooter();
  updateKeyButton();
  updateExternalNav();
  createDots();
}

function goToTest(testIdx) {
  loadTest(testIdx);
}

function navigateTest(direction) {
  if (!quizData) return;
  const totalTests = Math.ceil(quizData.sets.length / SETS_PER_TEST);
  const newIndex = currentTest + direction;
  if (newIndex >= 0 && newIndex < totalTests) {
    goToTest(newIndex);
  }
}

function updateNavButtons() {
  if (!quizData) return;
  const totalTests = Math.ceil(quizData.sets.length / SETS_PER_TEST);
  document.getElementById('prevTestBtn').disabled = currentTest === 0;
  document.getElementById('nextTestBtn').disabled = currentTest >= totalTests - 1;
}

function updateTestInfo() {
  if (!quizData) return;
  
  const totalTests = Math.ceil(quizData.sets.length / SETS_PER_TEST);
  const startSet = currentTest * SETS_PER_TEST;
  const endSet = Math.min(startSet + SETS_PER_TEST, quizData.sets.length);
  
  let answered = 0;
  let total = 0;
  
  for (let setIdx = startSet; setIdx < endSet; setIdx++) {
    const set = quizData.sets[setIdx];
    set.sentences.forEach((_, sentIdx) => {
      total++;
      if (answers[`${setIdx}-${sentIdx}`] !== undefined) answered++;
    });
  }
  
  const modeText = currentDataset === 'learn' ? 'Learn' : 'Test';
  document.getElementById('testInfo').textContent = 
    `Report Language (${modeText}) • Test ${currentTest + 1} of ${totalTests} • ${answered}/${total} answered`;
}

function createDots() {
  if (!quizData) return;
  const container = document.getElementById('dotsContainer');
  container.innerHTML = '';
  
  const totalTests = Math.ceil(quizData.sets.length / SETS_PER_TEST);
  
  for (let i = 0; i < totalTests; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dot-wrapper';
    
    const trophy = document.createElement('div');
    trophy.className = 'trophy';
    trophy.textContent = '🏆';
    if (testScores[i] && testScores[i].score === testScores[i].total) {
      trophy.classList.add('visible');
    }
    
    const dot = document.createElement('button');
    dot.className = 'test-dot';
    dot.setAttribute('aria-label', `Test ${i + 1}`);
    
    if (i === currentTest) dot.classList.add('current');
    else if (testScores[i]) {
      const percent = (testScores[i].score / testScores[i].total) * 100;
      if (percent === 100) dot.classList.add('perfect');
      else if (percent >= 90) dot.classList.add('excellent');
      else if (percent >= 75) dot.classList.add('good');
      else if (percent >= 50) dot.classList.add('fair');
      else dot.classList.add('poor');
    }
    
    dot.onclick = () => goToTest(i);
    
    wrapper.appendChild(trophy);
    wrapper.appendChild(dot);
    container.appendChild(wrapper);
  }
  
  updateNavButtons();
}

function createQuestionNavDots() {
  const container = document.getElementById('questionNavDots');
  container.innerHTML = '';
  
  if (!quizData || currentMode === 'guided') {
    container.classList.add('hidden-guided');
    return;
  }
  
  container.classList.remove('hidden-guided');
  
  const startSet = currentTest * SETS_PER_TEST;
  const endSet = Math.min(startSet + SETS_PER_TEST, quizData.sets.length);
  
  let questionIdx = 0;
  for (let setIdx = startSet; setIdx < endSet; setIdx++) {
    const set = quizData.sets[setIdx];
    set.sentences.forEach((_, sentIdx) => {
      const dot = document.createElement('button');
      dot.className = 'question-nav-dot';
      dot.setAttribute('aria-label', `Question ${questionIdx + 1}`);
      
      if (answers[`${setIdx}-${sentIdx}`] !== undefined) {
        dot.classList.add('answered');
      }
      
      dot.onclick = () => scrollToQuestion(setIdx, sentIdx);
      container.appendChild(dot);
      questionIdx++;
    });
  }
}

function scrollToQuestion(setIdx, sentIdx) {
  const setContainer = document.querySelector(`[data-set="${setIdx}"]`);
  if (setContainer) {
    const sentenceRow = setContainer.querySelectorAll('.sentence-row')[sentIdx];
    if (sentenceRow) {
      sentenceRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function renderClassicMode() {
  const container = document.getElementById('classicContainer');
  container.innerHTML = '';
  
  const startSet = currentTest * SETS_PER_TEST;
  const endSet = Math.min(startSet + SETS_PER_TEST, quizData.sets.length);
  
  for (let setIdx = startSet; setIdx < endSet; setIdx++) {
    const setData = quizData.sets[setIdx];
    const setDiv = document.createElement('div');
    setDiv.className = 'set-container';
    setDiv.setAttribute('data-set', setIdx);
    
    const setTitle = document.createElement('div');
    setTitle.className = 'set-title';
    setTitle.textContent = `Set ${setData.setNumber}: ${setData.topic}`;
    setDiv.appendChild(setTitle);
    
    const wordBank = document.createElement('div');
    wordBank.className = 'word-bank';
    
    const shuffledWords = getShuffledWords(setIdx);
    shuffledWords.forEach((wordObj) => {
      const chip = document.createElement('button');
      chip.className = 'word-chip';
      chip.textContent = wordObj.word;
      chip.setAttribute('data-word', wordObj.word);
      chip.setAttribute('data-word-idx', wordObj.originalIdx);
      chip.onclick = () => selectWord(setIdx, wordObj.originalIdx, chip);
      wordBank.appendChild(chip);
    });
    
    setDiv.appendChild(wordBank);
    
    const sentences = document.createElement('div');
    sentences.className = 'sentences';
    
    let questionNumber = 1;
    for (let si = startSet; si < setIdx; si++) {
      questionNumber += quizData.sets[si].sentences.length;
    }
    
    setData.sentences.forEach((sentence, sentIdx) => {
      const row = document.createElement('div');
      row.className = 'sentence-row';
      
      const numCircle = document.createElement('div');
      numCircle.className = 'question-number';
      if (answers[`${setIdx}-${sentIdx}`] !== undefined) {
        numCircle.classList.add('answered');
      }
      numCircle.textContent = questionNumber;
      row.appendChild(numCircle);
      
      const sentenceText = document.createElement('div');
      sentenceText.className = 'sentence-text';
      
      const parts = sentence.text.split('_____');
      sentenceText.appendChild(document.createTextNode(parts[0]));
      
      const blank = document.createElement('span');
      blank.className = 'blank';
      blank.setAttribute('data-set', setIdx);
      blank.setAttribute('data-sent', sentIdx);
      blank.textContent = '______';
      
      if (answers[`${setIdx}-${sentIdx}`] !== undefined) {
        const wordIdx = answers[`${setIdx}-${sentIdx}`];
        blank.textContent = setData.words[wordIdx];
        blank.classList.add('filled');
      }
      
      blank.onclick = () => fillBlank(setIdx, sentIdx, blank);
      sentenceText.appendChild(blank);
      
      if (parts[1]) {
        sentenceText.appendChild(document.createTextNode(parts[1]));
      }
      
      row.appendChild(sentenceText);
      sentences.appendChild(row);
      questionNumber++;
    });
    
    setDiv.appendChild(sentences);
    container.appendChild(setDiv);
  }
  
  updateFooter();
}

function renderGuidedMode() {
  const container = document.getElementById('guidedContainer');
  container.innerHTML = '';
  
  const startSet = currentTest * SETS_PER_TEST;
  const setIdx = startSet + currentSet;
  
  if (setIdx >= quizData.sets.length) return;
  
  const setData = quizData.sets[setIdx];
  
  const card = document.createElement('div');
  card.className = 'set-card';
  
  const label = document.createElement('div');
  label.className = 'set-label';
  label.textContent = `Set ${setData.setNumber} of ${quizData.sets.length}: ${setData.topic}`;
  card.appendChild(label);
  
  const wordBank = document.createElement('div');
  wordBank.className = 'word-bank';
  
  const shuffledWords = getShuffledWords(setIdx);
  shuffledWords.forEach((wordObj) => {
    const chip = document.createElement('button');
    chip.className = 'word-chip';
    chip.textContent = wordObj.word;
    chip.setAttribute('data-word', wordObj.word);
    chip.setAttribute('data-word-idx', wordObj.originalIdx);
    chip.onclick = () => selectWord(setIdx, wordObj.originalIdx, chip);
    wordBank.appendChild(chip);
  });
  
  card.appendChild(wordBank);
  
  const sentences = document.createElement('div');
  sentences.className = 'sentences';
  
  const testStartSet = currentTest * SETS_PER_TEST;
  let questionNumber = 1;
  for (let si = testStartSet; si < setIdx; si++) {
    questionNumber += quizData.sets[si].sentences.length;
  }
  
  setData.sentences.forEach((sentence, sentIdx) => {
    const row = document.createElement('div');
    row.className = 'sentence-row';
    
    const numCircle = document.createElement('div');
    numCircle.className = 'question-number';
    if (answers[`${setIdx}-${sentIdx}`] !== undefined) {
      numCircle.classList.add('answered');
    }
    numCircle.textContent = questionNumber;
    row.appendChild(numCircle);
    
    const sentenceText = document.createElement('div');
    sentenceText.className = 'sentence-text';
    
    const parts = sentence.text.split('_____');
    sentenceText.appendChild(document.createTextNode(parts[0]));
    
    const blank = document.createElement('span');
    blank.className = 'blank';
    blank.setAttribute('data-set', setIdx);
    blank.setAttribute('data-sent', sentIdx);
    blank.textContent = '______';
    
    if (answers[`${setIdx}-${sentIdx}`] !== undefined) {
      const wordIdx = answers[`${setIdx}-${sentIdx}`];
      blank.textContent = setData.words[wordIdx];
      blank.classList.add('filled');
    }
    
    blank.onclick = () => fillBlank(setIdx, sentIdx, blank);
    sentenceText.appendChild(blank);
    
    if (parts[1]) {
      sentenceText.appendChild(document.createTextNode(parts[1]));
    }
    
    row.appendChild(sentenceText);
    sentences.appendChild(row);
    questionNumber++;
  });
  
  card.appendChild(sentences);
  container.appendChild(card);
  
  updateFooter();
  updateExternalNav();
}

function selectWord(setIdx, wordIdx, chipElement) {
  if (showingResults) return;
  
  const wordBank = chipElement.closest('.word-bank');
  const chips = wordBank.querySelectorAll('.word-chip');
  
  chips.forEach(c => c.classList.remove('selected'));
  chipElement.classList.add('selected');
  
  selectedWord = { setIdx, wordIdx };
}

function fillBlank(setIdx, sentIdx, blankElement) {
  if (showingResults) return;
  
  if (!selectedWord || selectedWord.setIdx !== setIdx) {
    showToast('Please select a word from this set first');
    return;
  }
  
  const setData = quizData.sets[setIdx];
  const wordIdx = selectedWord.wordIdx;
  
  answers[`${setIdx}-${sentIdx}`] = wordIdx;
  
  blankElement.textContent = setData.words[wordIdx];
  blankElement.classList.add('filled');
  
  const wordBank = blankElement.closest('.set-container, .set-card').querySelector('.word-bank');
  const chip = wordBank.querySelector(`[data-word-idx="${wordIdx}"]`);
  if (chip) {
    chip.classList.remove('selected');
    chip.classList.add('used');
  }
  
  selectedWord = null;
  
  const numCircle = blankElement.closest('.sentence-row').querySelector('.question-number');
  if (numCircle) {
    numCircle.classList.add('answered');
  }
  
  updateTestInfo();
  createQuestionNavDots();
  updateFooter();
  updateKeyButton();
}

function toggleMode() {
  currentMode = currentMode === 'classic' ? 'guided' : 'classic';
  
  const switchEl = document.getElementById('modeToggleSwitch');
  const classicContainer = document.getElementById('classicContainer');
  const guidedContainer = document.getElementById('guidedContainer');
  
  if (currentMode === 'guided') {
    switchEl.classList.add('active');
    switchEl.setAttribute('aria-checked', 'true');
    classicContainer.classList.add('hidden');
    guidedContainer.classList.remove('hidden');
    renderGuidedMode();
    document.querySelector('.external-nav').style.display = 'flex';
  } else {
    switchEl.classList.remove('active');
    switchEl.setAttribute('aria-checked', 'false');
    guidedContainer.classList.add('hidden');
    classicContainer.classList.remove('hidden');
    renderClassicMode();
    document.querySelector('.external-nav').style.display = 'none';
  }
  
  createQuestionNavDots();
  updateFooter();
}

function navigatePrevSet() {
  if (currentSet > 0) {
    currentSet--;
    renderGuidedMode();
  }
}

function navigateNextSet() {
  const startSet = currentTest * SETS_PER_TEST;
  const endSet = Math.min(startSet + SETS_PER_TEST, quizData.sets.length);
  if (currentSet < endSet - startSet - 1) {
    currentSet++;
    renderGuidedMode();
  }
}

function updateExternalNav() {
  if (currentMode !== 'guided') {
    document.querySelector('.external-nav').style.display = 'none';
    return;
  }
  
  document.querySelector('.external-nav').style.display = 'flex';
  
  const startSet = currentTest * SETS_PER_TEST;
  const endSet = Math.min(startSet + SETS_PER_TEST, quizData.sets.length);
  
  document.getElementById('prevSetBtn').disabled = currentSet === 0;
  document.getElementById('nextSetBtn').disabled = currentSet >= endSet - startSet - 1;
}

function updateFooter() {
  const footer = document.getElementById('footer');
  
  if (showingResults) {
    footer.classList.remove('visible');
    return;
  }
  
  const startSet = currentTest * SETS_PER_TEST;
  const endSet = Math.min(startSet + SETS_PER_TEST, quizData.sets.length);
  
  let hasAnswers = false;
  for (let setIdx = startSet; setIdx < endSet; setIdx++) {
    const setData = quizData.sets[setIdx];
    for (let sentIdx = 0; sentIdx < setData.sentences.length; sentIdx++) {
      if (answers[`${setIdx}-${sentIdx}`] !== undefined) {
        hasAnswers = true;
        break;
      }
    }
    if (hasAnswers) break;
  }
  
  if (hasAnswers) {
    footer.classList.add('visible');
  } else {
    footer.classList.remove('visible');
  }
}

function showHint() {
  if (showingResults) return;
  
  const startSet = currentTest * SETS_PER_TEST;
  const endSet = Math.min(startSet + SETS_PER_TEST, quizData.sets.length);
  
  for (let setIdx = startSet; setIdx < endSet; setIdx++) {
    const setData = quizData.sets[setIdx];
    for (let sentIdx = 0; sentIdx < setData.sentences.length; sentIdx++) {
      if (answers[`${setIdx}-${sentIdx}`] === undefined) {
        const correctIdx = setData.sentences[sentIdx].correct;
        const hint = `Question needs: "${setData.words[correctIdx]}"`;
        showToast(hint, 3500);
        return;
      }
    }
  }
  
  showToast('All questions answered!');
}

function showKey() {
  if (!keyVisible) {
    keyVisible = true;
    const startSet = currentTest * SETS_PER_TEST;
    const endSet = Math.min(startSet + SETS_PER_TEST, quizData.sets.length);
    
    for (let setIdx = startSet; setIdx < endSet; setIdx++) {
      const setData = quizData.sets[setIdx];
      setData.sentences.forEach((sentence, sentIdx) => {
        const blank = document.querySelector(`[data-set="${setIdx}"][data-sent="${sentIdx}"]`);
        if (blank && answers[`${setIdx}-${sentIdx}`] === undefined) {
          const correctIdx = sentence.correct;
          blank.textContent = setData.words[correctIdx];
          blank.classList.add('filled');
          blank.style.opacity = '0.5';
        }
      });
    }
    
    document.getElementById('keyBtn').classList.add('key-active');
    document.getElementById('keyBtn').setAttribute('aria-pressed', 'true');
    showToast('Answer key shown (faded)', 3000);
  } else {
    keyVisible = false;
    const startSet = currentTest * SETS_PER_TEST;
    const endSet = Math.min(startSet + SETS_PER_TEST, quizData.sets.length);
    
    for (let setIdx = startSet; setIdx < endSet; setIdx++) {
      const setData = quizData.sets[setIdx];
      setData.sentences.forEach((sentence, sentIdx) => {
        if (answers[`${setIdx}-${sentIdx}`] === undefined) {
          const blank = document.querySelector(`[data-set="${setIdx}"][data-sent="${sentIdx}"]`);
          if (blank) {
            blank.textContent = '______';
            blank.classList.remove('filled');
            blank.style.opacity = '1';
          }
        }
      });
    }
    
    document.getElementById('keyBtn').classList.remove('key-active');
    document.getElementById('keyBtn').setAttribute('aria-pressed', 'false');
    showToast('Answer key hidden');
  }
}

function updateKeyButton() {
  const startSet = currentTest * SETS_PER_TEST;
  const endSet = Math.min(startSet + SETS_PER_TEST, quizData.sets.length);
  
  let totalQuestions = 0;
  let answeredQuestions = 0;
  
  for (let setIdx = startSet; setIdx < endSet; setIdx++) {
    const setData = quizData.sets[setIdx];
    setData.sentences.forEach((_, sentIdx) => {
      totalQuestions++;
      if (answers[`${setIdx}-${sentIdx}`] !== undefined) {
        answeredQuestions++;
      }
    });
  }
  
  const allAnswered = answeredQuestions === totalQuestions;
  document.getElementById('keyBtn').disabled = allAnswered;
}

function clearAnswers() {
  if (showingResults) return;
  
  const startSet = currentTest * SETS_PER_TEST;
  const endSet = Math.min(startSet + SETS_PER_TEST, quizData.sets.length);
  
  for (let setIdx = startSet; setIdx < endSet; setIdx++) {
    const setData = quizData.sets[setIdx];
    setData.sentences.forEach((_, sentIdx) => {
      delete answers[`${setIdx}-${sentIdx}`];
    });
  }
  
  keyVisible = false;
  document.getElementById('keyBtn').classList.remove('key-active');
  document.getElementById('keyBtn').setAttribute('aria-pressed', 'false');
  
  if (currentMode === 'guided') {
    renderGuidedMode();
  } else {
    renderClassicMode();
  }
  
  createQuestionNavDots();
  updateFooter();
  updateKeyButton();
  showToast('All answers cleared');
}

function submitAndScore() {
  if (showingResults) return;
  
  const startSet = currentTest * SETS_PER_TEST;
  const endSet = Math.min(startSet + SETS_PER_TEST, quizData.sets.length);
  
  let totalQuestions = 0;
  let answeredQuestions = 0;
  
  for (let setIdx = startSet; setIdx < endSet; setIdx++) {
    const setData = quizData.sets[setIdx];
    setData.sentences.forEach((_, sentIdx) => {
      totalQuestions++;
      if (answers[`${setIdx}-${sentIdx}`] !== undefined) {
        answeredQuestions++;
      }
    });
  }
  
  if (answeredQuestions < totalQuestions) {
    showToast(`Please answer all questions (${answeredQuestions}/${totalQuestions})`);
    return;
  }
  
  showingResults = true;
  let correctCount = 0;
  
  for (let setIdx = startSet; setIdx < endSet; setIdx++) {
    const setData = quizData.sets[setIdx];
    setData.sentences.forEach((sentence, sentIdx) => {
      const blank = document.querySelector(`[data-set="${setIdx}"][data-sent="${sentIdx}"]`);
      if (blank) {
        const userAnswer = answers[`${setIdx}-${sentIdx}`];
        const correctAnswer = sentence.correct;
        
        if (userAnswer === correctAnswer) {
          blank.classList.add('correct');
          correctCount++;
        } else {
          blank.classList.add('incorrect');
          const correctWord = setData.words[correctAnswer];
          blank.setAttribute('title', `Correct: ${correctWord}`);
        }
      }
    });
  }
  
  testScores[currentTest] = {
    score: correctCount,
    total: totalQuestions,
    timestamp: Date.now()
  };
  saveProgress();
  createDots();
  
  showScoreModal(correctCount, totalQuestions);
  updateFooter();
}

function showScoreModal(score, total) {
  const modal = document.getElementById('scoreModal');
  
  document.getElementById('scoreNumber').textContent = `${score}/${total}`;
  const modeText = currentDataset === 'learn' ? 'Learn' : 'Test';
  document.getElementById('modalSubtitle').textContent = `${modeText} Mode • Test ${currentTest + 1} Complete`;
  
  let completedTests = 0;
  const totalTests = Math.ceil(quizData.sets.length / SETS_PER_TEST);
  for (let i = 0; i < totalTests; i++) {
    if (testScores[i]) completedTests++;
  }
  
  document.getElementById('answeredStat').textContent = `${score}/${total}`;
  document.getElementById('testsDoneStat').textContent = `${completedTests}/${totalTests}`;
  
  const answersDisplay = document.getElementById('answersDisplay');
  answersDisplay.innerHTML = '';
  
  const startSet = currentTest * SETS_PER_TEST;
  const endSet = Math.min(startSet + SETS_PER_TEST, quizData.sets.length);
  
  let questionNum = 1;
  for (let setIdx = startSet; setIdx < endSet; setIdx++) {
    const setData = quizData.sets[setIdx];
    setData.sentences.forEach((sentence, sentIdx) => {
      const item = document.createElement('div');
      item.className = 'answer-item';
      
      const userAnswer = answers[`${setIdx}-${sentIdx}`];
      const correctAnswer = sentence.correct;
      const isCorrect = userAnswer === correctAnswer;
      
      item.classList.add(isCorrect ? 'correct' : 'incorrect');
      
      const leftSpan = document.createElement('span');
      leftSpan.textContent = `Q${questionNum}: ${setData.words[userAnswer]}`;
      
      const rightSpan = document.createElement('span');
      rightSpan.textContent = isCorrect ? '✓' : `✗ (${setData.words[correctAnswer]})`;
      
      item.appendChild(leftSpan);
      item.appendChild(rightSpan);
      answersDisplay.appendChild(item);
      
      questionNum++;
    });
  }
  
  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('scoreModal').classList.remove('active');
}

function nextTestModal() {
  closeModal();
  
  const totalTests = Math.ceil(quizData.sets.length / SETS_PER_TEST);
  if (currentTest < totalTests - 1) {
    goToTest(currentTest + 1);
  } else {
    showToast('All tests complete! 🎉');
  }
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const footer = document.getElementById('footer');
      if (footer.classList.contains('visible') && !showingResults) {
        e.preventDefault();
        submitAndScore();
      }
    }
    if (e.key === 'Escape') {
      closeModal();
    }
    if (currentMode === 'guided' && !showingResults && !e.target.matches('input')) {
      if (e.key === 'ArrowLeft') navigatePrevSet();
      if (e.key === 'ArrowRight') navigateNextSet();
    }
  });
}

function setupEventListeners() {
  document.getElementById('scoreModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
}

function init() {
  loadQuizData();
  setupKeyboardShortcuts();
  setupEventListeners();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
