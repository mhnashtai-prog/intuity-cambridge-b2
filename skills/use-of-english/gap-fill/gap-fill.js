// Global State
let allSets = [];
let currentTest = 0;
let currentSentence = 0;
let currentMode = 'guided';
let dataFormat = 'unknown'; // 'multiple-choice', 'open-cloze', 'grammar-focus'
let userAnswers = {};
let showingAnswers = false;
let firstAttemptScores = {};
let storageKey = 'gap_fill_progress';
let currentDatasetPath = '';

// === DATA LOADING ===

async function loadDataset() {
  const select = document.getElementById('datasetSelect');
  const path = select.value;
  
  if (!path) return;
  
  try {
    document.getElementById('classicContainer').innerHTML = '<div class="loading">Loading dataset...</div>';
    document.getElementById('guidedContainer').classList.add('hidden');
    
    const response = await fetch(path);
    if (!response.ok) throw new Error('Failed to load data');
    
    const data = await response.json();
    currentDatasetPath = path;
    
    // Detect format and load data
    detectFormat(data);
    processData(data);
    
    // Load progress for this dataset
    storageKey = `gap_fill_progress_${path.split('/').pop().replace('.json', '')}`;
    loadProgress();
    
    // Load first test
    currentTest = 0;
    loadTest(0);
    
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('classicContainer').innerHTML = 
      '<div class="loading">❌ Error loading dataset. Check console for details.</div>';
  }
}

function detectFormat(data) {
  // Check if it's Set 04 (grammar focus)
  if (data.categories) {
    dataFormat = 'grammar-focus';
    return;
  }
  
  // Check if it's Set 05 (open cloze)
  if (data.metadata && data.metadata.format === 'open-cloze') {
    dataFormat = 'open-cloze';
    return;
  }
  
  // Check if it's Sets 1-3 (multiple choice or text-based)
  if (data.sets && data.sets[0] && data.sets[0].sentences) {
    const firstSentence = data.sets[0].sentences[0];
    
    // Has options = multiple choice
    if (firstSentence.options) {
      dataFormat = 'multiple-choice';
    } 
    // Has text field (Set 05) or just answer (Sets 1-3 text)
    else if (data.sets[0].text) {
      dataFormat = 'open-cloze';
    }
    // Just q and answer = simple open cloze
    else {
      dataFormat = 'open-cloze';
    }
    return;
  }
  
  dataFormat = 'unknown';
}

function processData(data) {
  // Grammar Focus (Set 04)
  if (dataFormat === 'grammar-focus') {
    allSets = data.categories.map(cat => ({
      id: cat.id,
      title: cat.name,
      topic: cat.grammarFocus,
      description: cat.description,
      gapCount: cat.totalSentences,
      sentences: cat.sentences.map(s => ({
        q: s.q,
        options: s.options,
        answer: s.answer,
        pattern: s.pattern
      }))
    }));
  }
  // Open Cloze (Set 05) with text field
  else if (dataFormat === 'open-cloze' && data.sets && data.sets[0].text) {
    allSets = data.sets.map(set => ({
      id: set.id,
      title: set.title,
      topic: set.topic,
      gapCount: set.gaps.length,
      text: set.text,
      gaps: set.gaps,
      // Parse text into sentences for guided mode
      sentences: parseTextIntoSentences(set.text, set.gaps)
    }));
  }
  // Multiple Choice or Simple Open Cloze (Sets 1-3)
  else if (data.sets) {
    allSets = data.sets;
  }
}

function parseTextIntoSentences(text, gaps) {
  // Extract sentences with gaps from the text
  const sentences = [];
  const parts = text.split(/\(\d+\)_____/);
  
  gaps.forEach((gap, idx) => {
    // Find the sentence containing this gap
    const gapPattern = `(${gap.number})_____`;
    const startIdx = text.indexOf(gapPattern);
    
    if (startIdx !== -1) {
      // Extract surrounding sentence
      const beforeGap = text.substring(0, startIdx);
      const afterGap = text.substring(startIdx + gapPattern.length);
      
      // Find sentence boundaries
      const sentenceStart = beforeGap.lastIndexOf('. ') + 2;
      const sentenceEnd = afterGap.indexOf('. ') !== -1 ? 
        startIdx + gapPattern.length + afterGap.indexOf('. ') + 1 : 
        text.length;
      
      const fullSentence = text.substring(
        sentenceStart === 1 ? 0 : sentenceStart, 
        sentenceEnd
      );
      
      // Replace numbered gap with generic gap marker
      const sentenceWithGap = fullSentence.replace(`(${gap.number})_____`, '_____');
      
      sentences.push({
        q: sentenceWithGap,
        answer: gap.answer,
        type: gap.type,
        pattern: gap.pattern
      });
    }
  });
  
  return sentences;
}

// === PROGRESS MANAGEMENT ===

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (saved.firstAttemptScores) {
      firstAttemptScores = saved.firstAttemptScores;
    }
  } catch (e) {
    console.log('No saved progress found');
  }
}

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      firstAttemptScores: firstAttemptScores
    }));
  } catch (e) {
    console.error('Could not save progress');
  }
}

function isTestLocked(testNum) {
  return firstAttemptScores[testNum] !== undefined;
}

// === MODE MANAGEMENT ===

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn-main').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  
  const classicContainer = document.getElementById('classicContainer');
  const guidedContainer = document.getElementById('guidedContainer');
  
  if (mode === 'guided') {
    classicContainer.classList.add('hidden');
    guidedContainer.classList.remove('hidden');
    renderGuidedMode();
  } else {
    classicContainer.classList.remove('hidden');
    guidedContainer.classList.add('hidden');
    renderClassic();
  }
}

// === TEST LOADING ===

function loadTest(testNum) {
  if (allSets.length === 0) return;
  
  currentTest = testNum;
  currentSentence = 0;
  userAnswers = {};
  showingAnswers = false;
  
  const isLocked = isTestLocked(testNum);
  if (isLocked) {
    showingAnswers = true;
  }
  
  createDots();
  
  if (currentMode === 'guided') {
    renderGuidedMode();
  } else {
    renderClassic();
  }
  
  updateNavigation();
  updateTestInfo();
  updateSubmitButton();
  
  if (isLocked) {
    setTimeout(() => {
      const score = firstAttemptScores[testNum];
      alert(`🔒 TEST LOCKED\n\nYou already completed this test!\n\nYour Score: ${score.correct}/${score.total} (${score.percentage}%)\n\n${score.percentage === 100 ? '🏆 Perfect! You earned your sweets!' : 'This score is final. Choose another test to practice.'}`);
    }, 500);
  }
}

function createDots() {
  const container = document.getElementById('dotsContainer');
  container.innerHTML = '';
  
  for (let i = 0; i < allSets.length; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dot-wrapper';
    
    const score = firstAttemptScores[i];
    if (score && score.percentage === 100) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('class', 'trophy visible');
      svg.innerHTML = `<path d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Z" fill="#10b981"/>`;
      wrapper.appendChild(svg);
    }
    
    const dot = document.createElement('div');
    dot.className = 'test-dot';
    
    if (i === currentTest) dot.classList.add('current');
    
    if (score) {
      if (score.percentage === 100) {
        dot.classList.add('score-perfect');
      } else if (score.percentage >= 80) {
        dot.classList.add('score-high');
      } else if (score.percentage >= 60) {
        dot.classList.add('score-medium');
      } else {
        dot.classList.add('score-low');
      }
    }
    
    dot.onclick = () => loadTest(i);
    wrapper.appendChild(dot);
    container.appendChild(wrapper);
  }
}

// === CLASSIC MODE RENDERING ===

function renderClassic() {
  const testData = allSets[currentTest];
  const container = document.getElementById('classicContainer');
  
  let html = `<div class="text-title">${testData.title}</div>`;
  
  // If has description (grammar focus), show it
  if (testData.description) {
    html += `<div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 1rem;">${testData.description}</div>`;
  }
  
  html += `<div class="text-content"><p>`;
  
  // Render based on format
  if (dataFormat === 'multiple-choice') {
    testData.sentences.forEach((sentence, idx) => {
      html += createMultipleChoiceHTML(sentence, idx, 'classic') + ' ';
    });
  } else {
    testData.sentences.forEach((sentence, idx) => {
      html += createGapHTML(sentence.q, idx) + ' ';
    });
  }
  
  html += '</p></div>';
  container.innerHTML = html;
  
  if (dataFormat === 'multiple-choice') {
    attachMultipleChoiceListeners();
  } else {
    attachGapListeners();
  }
}

// === GUIDED MODE RENDERING ===

function renderGuidedMode() {
  showSingleSentence();
  createSentenceDots();
  renderSingleSentence();
}

function createSentenceDots() {
  const testData = allSets[currentTest];
  const container = document.getElementById('sentenceDots');
  container.innerHTML = '';
  
  testData.sentences.forEach((sentence, idx) => {
    const dot = document.createElement('div');
    dot.className = 'sentence-dot';
    
    const gapId = `gap-${idx}`;
    const isFilled = userAnswers[gapId] && userAnswers[gapId].trim() !== '';
    
    if (idx === currentSentence) {
      dot.classList.add('current');
    } else if (isFilled) {
      dot.classList.add('filled');
    } else {
      dot.textContent = idx + 1;
    }
    
    dot.onclick = () => jumpToSentence(idx);
    container.appendChild(dot);
  });
}

function renderSingleSentence() {
  const testData = allSets[currentTest];
  const sentence = testData.sentences[currentSentence];
  
  document.getElementById('sentenceLabel').textContent = 
    `Sentence ${currentSentence + 1} of ${testData.sentences.length}`;
  
  const sentenceDiv = document.getElementById('sentenceTextLarge');
  
  if (dataFormat === 'multiple-choice') {
    sentenceDiv.innerHTML = sentence.q.replace('_____', '<strong style="color: #c9a961;">_____</strong>');
    renderMultipleChoiceOptions(sentence, currentSentence);
  } else {
    sentenceDiv.innerHTML = createGapHTML(sentence.q, currentSentence);
    document.getElementById('optionsContainer').innerHTML = '';
  }
  
  if (dataFormat === 'multiple-choice') {
    attachMultipleChoiceListeners();
  } else {
    attachGapListeners();
  }
  
  document.getElementById('prevSentenceBtn').disabled = currentSentence === 0;
  document.getElementById('nextSentenceBtn').disabled = currentSentence === testData.sentences.length - 1;
  
  // Show revise button if all filled
  const allFilled = testData.sentences.every((s, idx) => {
    const gapId = `gap-${idx}`;
    return userAnswers[gapId] && userAnswers[gapId].trim() !== '';
  });
  
  const reviseBtn = document.getElementById('reviseBtn');
  if (allFilled && !showingAnswers) {
    reviseBtn.classList.remove('hidden');
  } else {
    reviseBtn.classList.add('hidden');
  }
}

function renderMultipleChoiceOptions(sentence, sentenceIdx) {
  const container = document.getElementById('optionsContainer');
  if (!sentence.options) {
    container.innerHTML = '';
    return;
  }
  
  const gapId = `gap-${sentenceIdx}`;
  const userAnswer = userAnswers[gapId];
  
  let html = '<div class="options-container">';
  
  sentence.options.forEach((option) => {
    const letter = option.split('.')[0]; // "A", "B", "C", "D"
    const text = option.substring(3); // Remove "A. " prefix
    const isSelected = userAnswer === letter;
    const disabled = showingAnswers ? 'disabled' : '';
    
    let classList = 'option-btn';
    if (isSelected) classList += ' selected';
    
    if (showingAnswers) {
      if (letter === sentence.answer) {
        classList += ' correct';
      } else if (isSelected && letter !== sentence.answer) {
        classList += ' incorrect';
      }
    }
    
    html += `<button class="${classList}" data-gap-id="${gapId}" data-option="${letter}" ${disabled}>${option}</button>`;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// === MULTIPLE CHOICE HANDLING ===

function createMultipleChoiceHTML(sentence, sentenceIdx, mode) {
  const gapId = `gap-${sentenceIdx}`;
  const userAnswer = userAnswers[gapId] || '';
  
  // In classic mode, show inline
  let gapDisplay = '_____';
  if (userAnswer) {
    gapDisplay = `<span class="gap filled" data-gap-id="${gapId}">${userAnswer}</span>`;
  } else {
    gapDisplay = `<span class="gap" data-gap-id="${gapId}">_____</span>`;
  }
  
  return sentence.q.replace('_____', gapDisplay);
}

function attachMultipleChoiceListeners() {
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (showingAnswers || isTestLocked(currentTest)) return;
      
      const gapId = this.dataset.gapId;
      const option = this.dataset.option;
      
      // Toggle selection
      const wasSelected = this.classList.contains('selected');
      
      // Deselect all options for this gap
      document.querySelectorAll(`[data-gap-id="${gapId}"]`).forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // Select this option if it wasn't selected
      if (!wasSelected) {
        this.classList.add('selected');
        userAnswers[gapId] = option;
      } else {
        delete userAnswers[gapId];
      }
      
      checkCompletion();
      
      if (currentMode === 'guided') {
        createSentenceDots();
        updateReviseButton();
      }
    });
  });
}

// === OPEN CLOZE (GAP INPUT) HANDLING ===

function createGapHTML(text, sentenceIdx, isReview = false) {
  return text.replace(/_____/g, () => {
    const gapId = `gap-${sentenceIdx}`;
    const userAnswer = userAnswers[gapId] || '';
    const disabled = showingAnswers ? 'disabled' : '';
    const size = isReview ? 'style="min-width: 60px; font-size: 0.75rem;"' : '';
    return `<input type="text" class="gap ${userAnswer ? 'filled' : ''}" data-gap-id="${gapId}" value="${userAnswer}" placeholder="____" ${disabled} ${size}>`;
  });
}

function attachGapListeners() {
  document.querySelectorAll('.gap[type="text"]').forEach(input => {
    input.addEventListener('input', function() {
      if (showingAnswers || isTestLocked(currentTest)) return;
      
      const gapId = this.dataset.gapId;
      const value = this.value.trim();
      
      if (value) {
        this.classList.add('filled');
        userAnswers[gapId] = value;
      } else {
        this.classList.remove('filled');
        delete userAnswers[gapId];
      }
      
      checkCompletion();
      
      if (currentMode === 'guided') {
        createSentenceDots();
        updateReviseButton();
      }
    });
    
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        
        if (currentMode === 'guided') {
          nextSentence();
        } else {
          const allInputs = Array.from(document.querySelectorAll('.gap[type="text"]'));
          const currentIndex = allInputs.indexOf(this);
          if (currentIndex < allInputs.length - 1) {
            allInputs[currentIndex + 1].focus();
          }
        }
      }
    });
  });
}

function updateReviseButton() {
  const testData = allSets[currentTest];
  const allFilled = testData.sentences.every((s, idx) => {
    const gId = `gap-${idx}`;
    return userAnswers[gId] && userAnswers[gId].trim() !== '';
  });
  
  const reviseBtn = document.getElementById('reviseBtn');
  if (allFilled && !showingAnswers) {
    reviseBtn.classList.remove('hidden');
  } else {
    reviseBtn.classList.add('hidden');
  }
}

// === NAVIGATION ===

function jumpToSentence(idx) {
  currentSentence = idx;
  showSingleSentence();
  renderSingleSentence();
  createSentenceDots();
}

function previousSentence() {
  if (currentSentence > 0) {
    currentSentence--;
    renderSingleSentence();
    createSentenceDots();
  }
}

function nextSentence() {
  const testData = allSets[currentTest];
  if (currentSentence < testData.sentences.length - 1) {
    currentSentence++;
    renderSingleSentence();
    createSentenceDots();
  }
}

function navigateTest(direction) {
  const newTest = currentTest + direction;
  if (newTest >= 0 && newTest < allSets.length) {
    loadTest(newTest);
  }
}

function updateNavigation() {
  document.getElementById('prevArrow').disabled = currentTest === 0;
  document.getElementById('nextArrow').disabled = currentTest === allSets.length - 1;
}

// === VIEW MANAGEMENT ===

function showSingleSentence() {
  document.getElementById('singleSentenceView').classList.remove('hidden');
  document.getElementById('reviewView').classList.add('hidden');
}

function showReviewMode() {
  document.getElementById('singleSentenceView').classList.add('hidden');
  document.getElementById('reviewView').classList.remove('hidden');
  renderReviewGrid();
}

function renderReviewGrid() {
  const testData = allSets[currentTest];
  const grid = document.getElementById('reviewGrid');
  grid.innerHTML = '';
  
  testData.sentences.forEach((sentence, idx) => {
    const card = document.createElement('div');
    card.className = 'review-card';
    
    const gapId = `gap-${idx}`;
    const userAnswer = userAnswers[gapId];
    const isFilled = userAnswer && userAnswer.trim() !== '';
    
    const number = document.createElement('div');
    number.className = 'review-number';
    
    if (showingAnswers) {
      let correctAnswer = sentence.answer;
      if (dataFormat === 'multiple-choice') {
        correctAnswer = sentence.answer; // Just the letter
      }
      
      const isCorrect = userAnswer && userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      number.className += isCorrect ? ' correct' : (isFilled ? ' incorrect' : '');
    } else if (isFilled) {
      number.classList.add('filled');
    }
    number.textContent = idx + 1;
    
    const sentenceDiv = document.createElement('div');
    sentenceDiv.className = 'review-sentence';
    
    if (dataFormat === 'multiple-choice') {
      sentenceDiv.innerHTML = createMultipleChoiceHTML(sentence, idx, 'review');
    } else {
      sentenceDiv.innerHTML = createGapHTML(sentence.q, idx, true);
    }
    
    card.appendChild(number);
    card.appendChild(sentenceDiv);
    grid.appendChild(card);
  });
  
  if (dataFormat === 'multiple-choice') {
    attachMultipleChoiceListeners();
  } else {
    attachGapListeners();
  }
}

// === COMPLETION & SUBMISSION ===

function checkCompletion() {
  const testData = allSets[currentTest];
  const totalGaps = testData.sentences.length;
  const filledGaps = Object.keys(userAnswers).filter(key => userAnswers[key] && userAnswers[key].trim() !== '').length;
  
  updateSubmitButton();
  
  if (filledGaps === totalGaps && !showingAnswers) {
    document.getElementById('footer').classList.add('visible');
  }
}

function updateTestInfo() {
  document.getElementById('testInfo').textContent = `${currentTest + 1}/${allSets.length}`;
}

function updateSubmitButton() {
  const testData = allSets[currentTest];
  const filledGaps = Object.keys(userAnswers).filter(key => userAnswers[key] && userAnswers[key].trim() !== '').length;
  const submitBtn = document.getElementById('submitBtn');
  
  if (filledGaps === testData.sentences.length && !showingAnswers) {
    submitBtn.classList.remove('hidden');
  } else {
    submitBtn.classList.add('hidden');
  }
}

function submitAndScore() {
  const testData = allSets[currentTest];
  
  if (isTestLocked(currentTest)) {
    alert('❌ This test has already been submitted!\n\nNice try, but no extra sweets for you! 🍬');
    return;
  }
  
  showingAnswers = true;
  let correctCount = 0;
  
  testData.sentences.forEach((sentence, idx) => {
    const gapId = `gap-${idx}`;
    const userAnswer = userAnswers[gapId] || '';
    const correctAnswer = sentence.answer;
    
    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    if (isCorrect) correctCount++;
    
    // Mark answers in UI
    if (dataFormat === 'multiple-choice') {
      const allOptions = document.querySelectorAll(`[data-gap-id="${gapId}"]`);
      allOptions.forEach(opt => {
        opt.disabled = true;
        const optLetter = opt.dataset.option;
        if (optLetter === correctAnswer) {
          opt.classList.add('correct');
        } else if (opt.classList.contains('selected')) {
          opt.classList.add('incorrect');
        }
      });
    } else {
      const gapElement = document.querySelector(`input[data-gap-id="${gapId}"]`);
      if (gapElement) {
        gapElement.disabled = true;
        if (isCorrect) {
          gapElement.classList.add('correct');
        } else {
          gapElement.classList.add('incorrect');
          const correctSpan = document.createElement('span');
          correctSpan.style.cssText = 'color: #10b981; font-size: 0.75rem; margin-left: 0.25rem;';
          correctSpan.textContent = `(${correctAnswer})`;
          gapElement.parentNode.insertBefore(correctSpan, gapElement.nextSibling);
        }
      }
    }
  });
  
  const percentage = Math.round((correctCount / testData.sentences.length) * 100);
  
  firstAttemptScores[currentTest] = {
    correct: correctCount,
    total: testData.sentences.length,
    percentage: percentage,
    timestamp: new Date().toISOString(),
    locked: true
  };
  saveProgress();
  createDots();
  
  const completedCount = Object.keys(firstAttemptScores).length;
  
  document.getElementById('modalSubtitle').textContent = 
    `Test ${currentTest + 1} of ${allSets.length}`;
  document.getElementById('scoreNumber').textContent = 
    `${correctCount}/${testData.sentences.length}`;
  document.getElementById('answeredStat').textContent = 
    `${testData.sentences.length}/${testData.sentences.length}`;
  document.getElementById('progressStat').textContent = 
    `${completedCount}/${allSets.length}`;
  
  document.getElementById('scoreModal').classList.add('active');
  
  if (currentMode === 'guided') {
    showReviewMode();
  }
  
  updateSubmitButton();
}

// === ACTIONS ===

function clearAnswers() {
  if (showingAnswers || isTestLocked(currentTest)) {
    alert('❌ This test is locked! You have already submitted it.\n\nNo cheating allowed - your teacher is watching! 🍬');
    return;
  }
  
  if (Object.keys(userAnswers).length === 0) {
    return;
  }
  
  if (confirm('Are you sure you want to clear all answers?')) {
    userAnswers = {};
    showingAnswers = false;
    
    if (currentMode === 'classic') {
      renderClassic();
    } else {
      renderGuidedMode();
    }
    updateSubmitButton();
    document.getElementById('footer').classList.remove('visible');
  }
}

function repeatTest() {
  if (isTestLocked(currentTest)) {
    alert('❌ NO CHEATING!\n\nThis test is locked because you already submitted it.\n\nYou got your score, and that\'s final! 🍬\n\nMove to another test if you want to practice more.');
    return;
  }
  
  userAnswers = {};
  showingAnswers = false;
  currentSentence = 0;
  
  if (currentMode === 'classic') {
    renderClassic();
  } else {
    renderGuidedMode();
  }
  
  updateSubmitButton();
  document.getElementById('footer').classList.remove('visible');
}

function goHome() {
  window.location.href = '../use-of-english.html';
}

function closeModal() {
  document.getElementById('scoreModal').classList.remove('active');
}

// === EVENT LISTENERS ===

document.getElementById('scoreModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Initialize
window.onload = function() {
  console.log('Gap-Fill Quiz loaded. Select a dataset to begin.');
};
