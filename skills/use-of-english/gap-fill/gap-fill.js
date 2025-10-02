// Global State
let allSets = [];
let currentTest = 0;
let currentParagraph = 0;
let currentMode = 'guided';
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

function processData(data) {
  // Handle Set 05 format (with full text)
  if (data.sets && data.sets[0] && data.sets[0].text) {
    allSets = data.sets.map(set => {
      const paragraphs = parseTextIntoParagraphs(set.text, set.gaps);
      return {
        id: set.id,
        title: set.title,
        topic: set.topic,
        text: set.text,
        gaps: set.gaps,
        paragraphs: paragraphs,
        gapCount: set.gaps.length
      };
    });
  }
  // Handle Sets 1-3 format (sentence-based, needs conversion)
  else if (data.sets && data.sets[0] && data.sets[0].sentences) {
    allSets = data.sets.map(set => {
      // Convert sentences into text
      const fullText = set.sentences.map(s => s.q).join(' ');
      const gaps = set.sentences.map((s, idx) => ({
        number: idx + 1,
        answer: s.answer,
        type: s.pattern || 'general'
      }));
      
      const paragraphs = parseTextIntoParagraphs(fullText, gaps);
      
      return {
        id: set.id,
        title: set.title,
        topic: set.topic,
        text: fullText,
        gaps: gaps,
        paragraphs: paragraphs,
        gapCount: gaps.length
      };
    });
  }
  // Handle Set 04 format (categories)
  else if (data.categories) {
    allSets = data.categories.map(cat => {
      const fullText = cat.sentences.map(s => s.q).join(' ');
      const gaps = cat.sentences.map((s, idx) => ({
        number: idx + 1,
        answer: s.answer,
        pattern: s.pattern
      }));
      
      const paragraphs = parseTextIntoParagraphs(fullText, gaps);
      
      return {
        id: cat.id,
        title: cat.name,
        topic: cat.grammarFocus,
        description: cat.description,
        text: fullText,
        gaps: gaps,
        paragraphs: paragraphs,
        gapCount: gaps.length
      };
    });
  }
}

function parseTextIntoParagraphs(text, gaps) {
  // Split text into paragraphs (by double newline or sentence groups)
  const sentences = text.split(/\. (?=[A-Z])/);
  const paragraphs = [];
  const sentencesPerParagraph = Math.ceil(sentences.length / Math.min(4, Math.ceil(sentences.length / 3)));
  
  for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
    const paragraphSentences = sentences.slice(i, i + sentencesPerParagraph);
    let paragraphText = paragraphSentences.join('. ');
    if (!paragraphText.endsWith('.')) paragraphText += '.';
    
    // Find gaps in this paragraph
    const gapsInParagraph = [];
    gaps.forEach((gap, idx) => {
      if (paragraphText.includes('_____')) {
        gapsInParagraph.push({ ...gap, globalIndex: idx });
      }
    });
    
    paragraphs.push({
      text: paragraphText,
      gaps: gapsInParagraph
    });
  }
  
  return paragraphs.filter(p => p.text.includes('_____'));
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
  currentParagraph = 0;
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
      alert(`🔒 TEST LOCKED\n\nYou already completed this test!\n\nYour Score: ${score.correct}/${score.total} (${score.percentage}%)\n\n${score.percentage === 100 ? '🏆 Perfect!' : 'This score is final. Choose another test to practice.'}`);
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
  
  if (testData.description) {
    html += `<div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 1rem;">${testData.description}</div>`;
  }
  
  html += `<div class="text-content">`;
  
  // Render full text with all gaps
  html += createTextWithGaps(testData.text, testData.gaps);
  
  html += '</div>';
  container.innerHTML = html;
  
  attachGapListeners();
}

function createTextWithGaps(text, gaps) {
  let result = text;
  let gapIndex = 0;
  
  result = result.replace(/_____/g, () => {
    const gap = gaps[gapIndex];
    const gapId = `gap-${gapIndex}`;
    const userAnswer = userAnswers[gapId] || '';
    const disabled = showingAnswers ? 'disabled' : '';
    
    gapIndex++;
    
    return `<input type="text" class="gap ${userAnswer ? 'filled' : ''}" data-gap-id="${gapId}" value="${userAnswer}" placeholder="____" ${disabled}>`;
  });
  
  return result;
}

// === GUIDED MODE RENDERING ===

function renderGuidedMode() {
  showSingleParagraph();
  createParagraphDots();
  renderSingleParagraph();
}

function createParagraphDots() {
  const testData = allSets[currentTest];
  const container = document.getElementById('sentenceDots');
  container.innerHTML = '';
  
  testData.paragraphs.forEach((para, idx) => {
    const dot = document.createElement('div');
    dot.className = 'sentence-dot';
    
    // Check if all gaps in this paragraph are filled
    const allGapsFilled = para.gaps.every(gap => {
      const gapId = `gap-${gap.globalIndex}`;
      return userAnswers[gapId] && userAnswers[gapId].trim() !== '';
    });
    
    if (idx === currentParagraph) {
      dot.classList.add('current');
    } else if (allGapsFilled) {
      dot.classList.add('filled');
    } else {
      dot.textContent = idx + 1;
    }
    
    dot.onclick = () => jumpToParagraph(idx);
    container.appendChild(dot);
  });
}

function renderSingleParagraph() {
  const testData = allSets[currentTest];
  const paragraph = testData.paragraphs[currentParagraph];
  
  document.getElementById('sentenceLabel').textContent = 
    `Paragraph ${currentParagraph + 1} of ${testData.paragraphs.length}`;
  
  const sentenceDiv = document.getElementById('sentenceTextLarge');
  sentenceDiv.innerHTML = createParagraphWithGaps(paragraph);
  
  document.getElementById('optionsContainer').innerHTML = '';
  
  attachGapListeners();
  
  document.getElementById('prevSentenceBtn').disabled = currentParagraph === 0;
  document.getElementById('nextSentenceBtn').disabled = currentParagraph === testData.paragraphs.length - 1;
  
  // Show revise button if all gaps filled
  const allFilled = testData.gaps.every((gap, idx) => {
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

function createParagraphWithGaps(paragraph) {
  let result = paragraph.text;
  let localGapIndex = 0;
  
  result = result.replace(/_____/g, () => {
    if (localGapIndex >= paragraph.gaps.length) return '_____';
    
    const gap = paragraph.gaps[localGapIndex];
    const gapId = `gap-${gap.globalIndex}`;
    const userAnswer = userAnswers[gapId] || '';
    const disabled = showingAnswers ? 'disabled' : '';
    
    localGapIndex++;
    
    return `<input type="text" class="gap ${userAnswer ? 'filled' : ''}" data-gap-id="${gapId}" value="${userAnswer}" placeholder="____" ${disabled}>`;
  });
  
  return result;
}

// === GAP INPUT HANDLING ===

function attachGapListeners() {
  document.querySelectorAll('.gap').forEach(input => {
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
        createParagraphDots();
        updateReviseButton();
      }
    });
    
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        
        if (currentMode === 'guided') {
          nextParagraph();
        } else {
          const allInputs = Array.from(document.querySelectorAll('.gap'));
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
  const allFilled = testData.gaps.every((gap, idx) => {
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

function jumpToParagraph(idx) {
  currentParagraph = idx;
  showSingleParagraph();
  renderSingleParagraph();
  createParagraphDots();
}

function previousSentence() {
  if (currentParagraph > 0) {
    currentParagraph--;
    renderSingleParagraph();
    createParagraphDots();
  }
}

function nextSentence() {
  const testData = allSets[currentTest];
  if (currentParagraph < testData.paragraphs.length - 1) {
    currentParagraph++;
    renderSingleParagraph();
    createParagraphDots();
  }
}

function nextParagraph() {
  nextSentence();
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

function showSingleParagraph() {
  document.getElementById('singleSentenceView').classList.remove('hidden');
  document.getElementById('reviewView').classList.add('hidden');
}

function showSingleSentence() {
  showSingleParagraph();
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
  
  testData.paragraphs.forEach((paragraph, idx) => {
    const card = document.createElement('div');
    card.className = 'review-card';
    
    const number = document.createElement('div');
    number.className = 'review-number';
    number.textContent = idx + 1;
    
    // Check if paragraph is complete
    const allGapsFilled = paragraph.gaps.every(gap => {
      const gapId = `gap-${gap.globalIndex}`;
      return userAnswers[gapId] && userAnswers[gapId].trim() !== '';
    });
    
    if (showingAnswers) {
      const allCorrect = paragraph.gaps.every(gap => {
        const gapId = `gap-${gap.globalIndex}`;
        const userAnswer = userAnswers[gapId];
        return userAnswer && userAnswer.toLowerCase().trim() === gap.answer.toLowerCase().trim();
      });
      number.className += allCorrect ? ' correct' : (allGapsFilled ? ' incorrect' : '');
    } else if (allGapsFilled) {
      number.classList.add('filled');
    }
    
    const paragraphDiv = document.createElement('div');
    paragraphDiv.className = 'review-sentence';
    paragraphDiv.innerHTML = createParagraphWithGaps(paragraph);
    
    card.appendChild(number);
    card.appendChild(paragraphDiv);
    grid.appendChild(card);
  });
  
  attachGapListeners();
}

// === COMPLETION & SUBMISSION ===

function checkCompletion() {
  const testData = allSets[currentTest];
  const totalGaps = testData.gaps.length;
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
  
  if (filledGaps === testData.gaps.length && !showingAnswers) {
    submitBtn.classList.remove('hidden');
  } else {
    submitBtn.classList.add('hidden');
  }
}

function submitAndScore() {
  const testData = allSets[currentTest];
  
  if (isTestLocked(currentTest)) {
    alert('❌ This test has already been submitted!');
    return;
  }
  
  showingAnswers = true;
  let correctCount = 0;
  
  testData.gaps.forEach((gap, idx) => {
    const gapId = `gap-${idx}`;
    const userAnswer = userAnswers[gapId] || '';
    const correctAnswer = gap.answer;
    
    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    if (isCorrect) correctCount++;
    
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
  });
  
  const percentage = Math.round((correctCount / testData.gaps.length) * 100);
  
  firstAttemptScores[currentTest] = {
    correct: correctCount,
    total: testData.gaps.length,
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
    `${correctCount}/${testData.gaps.length}`;
  document.getElementById('answeredStat').textContent = 
    `${testData.gaps.length}/${testData.gaps.length}`;
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
    alert('❌ This test is locked! You have already submitted it.');
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
    alert('❌ This test is locked because you already submitted it.\n\nMove to another test if you want to practice more.');
    return;
  }
  
  userAnswers = {};
  showingAnswers = false;
  currentParagraph = 0;
  
  if (currentMode === 'classic') {
    renderClassic();
  } else {
    renderGuidedMode();
  }
  
  updateSubmitButton();
  document.getElementById('footer').classList.remove('visible');
}

function goHome() {
  window.location.href = '../../../index.html';
}

function closeModal() {
  document.getElementById('scoreModal').classList.remove('active');
}

// === EVENT LISTENERS ===

document.getElementById('scoreModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

window.onload = function() {
  console.log('Gap-Fill Quiz loaded. Select a dataset to begin.');
};
