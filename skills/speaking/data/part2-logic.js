// ==========================================
// INTUITY SPEAKING PRACTICE - PART 2 LOGIC
// Complete Working Version
// ==========================================

console.log('🔄 Loading part2-logic.js...');

// ==========================================
// STATE MANAGEMENT
// ==========================================

let currentCategory = 'comparing';
let currentStyle = 'default';
let currentPairIndex = 0;
let isXrayActive = false;
let isStructureMode = false;
let currentUtterance = null;

// ==========================================
// DOM ELEMENTS
// ==========================================

const elements = {
  categoryBtns: null,
  styleBtns: null,
  taskText: null,
  image1: null,
  image2: null,
  responseContent: null,
  structurePanel: null,
  structureGrid: null,
  playBtn: null,
  pauseBtn: null,
  replayBtn: null,
  xrayBtn: null,
  viewModeToggle: null,
  watchLabel: null,
  structureLabel: null,
  responseSection: null,
  practiceBtn: null,
  practicePrompt: null
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('📱 DOM ready - initializing Part 2 logic');
  
  // Check if data is loaded
  if (typeof SPEAKING_DATA === 'undefined') {
    console.error('❌ SPEAKING_DATA not loaded!');
    return;
  }
  console.log('✓ SPEAKING_DATA loaded successfully');
  
  // Get DOM elements
  elements.categoryBtns = document.querySelectorAll('.category-btn');
  elements.styleBtns = document.querySelectorAll('.style-btn');
  elements.taskText = document.getElementById('taskText');
  elements.image1 = document.getElementById('image1');
  elements.image2 = document.getElementById('image2');
  elements.responseContent = document.getElementById('responseContent');
  elements.structurePanel = document.getElementById('structurePanel');
  elements.structureGrid = document.getElementById('structureGrid');
  elements.playBtn = document.getElementById('playBtn');
  elements.pauseBtn = document.getElementById('pauseBtn');
  elements.replayBtn = document.getElementById('replayBtn');
  elements.xrayBtn = document.getElementById('xrayBtn');
  elements.viewModeToggle = document.getElementById('viewModeToggle');
  elements.watchLabel = document.getElementById('watchLabel');
  elements.structureLabel = document.getElementById('structureLabel');
  elements.responseSection = document.getElementById('responseSection');
  elements.practiceBtn = document.getElementById('practiceBtn');
  elements.practicePrompt = document.getElementById('practicePrompt');
  
  // Verify critical elements
  const criticalElements = [
    'categoryBtns', 'styleBtns', 'taskText', 'responseContent', 
    'playBtn', 'viewModeToggle'
  ];
  
  let allFound = true;
  criticalElements.forEach(key => {
    if (!elements[key] || (elements[key].length !== undefined && elements[key].length === 0)) {
      console.error(`❌ Missing element: ${key}`);
      allFound = false;
    }
  });
  
  if (!allFound) {
    console.error('❌ Some critical DOM elements not found!');
    return;
  }
  console.log('✓ All DOM elements found');
  
  // Set up event listeners
  setupEventListeners();
  
  // Initial render
  renderContent();
  
  console.log('=== ✓ INTUITY Speaking Practice Initialized ===');
});

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
  console.log('🔗 Setting up event listeners...');
  
  // Category buttons
  elements.categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      switchCategory(category);
    });
  });
  
  // Style buttons
  elements.styleBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const style = this.getAttribute('data-style');
      switchStyle(style);
    });
  });
  
  // Play button
  elements.playBtn.addEventListener('click', playAudio);
  
  // Replay button
  elements.replayBtn.addEventListener('click', function() {
    stopAudio();
    playAudio();
  });
  
  // X-Ray button
  elements.xrayBtn.addEventListener('click', toggleXray);
  
  // View mode toggle
  elements.viewModeToggle.addEventListener('click', toggleViewMode);
  
  // Practice button
  if (elements.practiceBtn) {
    elements.practiceBtn.addEventListener('click', showPracticePrompt);
  }
  
  console.log('✓ Event listeners attached');
}

// ==========================================
// CATEGORY SWITCHING
// ==========================================

function switchCategory(category) {
  console.log(`🔄 Switching to category: ${category}`);
  
  if (!SPEAKING_DATA[category]) {
    console.error(`❌ Category not found: ${category}`);
    return;
  }
  
  currentCategory = category;
  currentPairIndex = 0;
  currentStyle = 'default';
  
  // Update active button
  elements.categoryBtns.forEach(btn => {
    if (btn.getAttribute('data-category') === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Reset style to default
  elements.styleBtns.forEach(btn => {
    if (btn.getAttribute('data-style') === 'default') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Stop any playing audio
  stopAudio();
  
  // Render new content
  renderContent();
}

// ==========================================
// STYLE SWITCHING
// ==========================================

function switchStyle(style) {
  console.log(`🎨 Switching to style: ${style}`);
  
  currentStyle = style;
  
  // Update active button
  elements.styleBtns.forEach(btn => {
    if (btn.getAttribute('data-style') === style) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Stop any playing audio
  stopAudio();
  
  // Re-render response content
  renderResponse();
}

// ==========================================
// CONTENT RENDERING
// ==========================================

function renderContent() {
  console.log('🎨 Rendering content...');
  
  const categoryData = SPEAKING_DATA[currentCategory];
  if (!categoryData) {
    console.error(`❌ No data for category: ${currentCategory}`);
    return;
  }
  
  const pairData = categoryData.pairs[currentPairIndex];
  if (!pairData) {
    console.error(`❌ No pair data at index: ${currentPairIndex}`);
    return;
  }
  
  // Update task text
  elements.taskText.textContent = categoryData.task;
  
  // Update images
  elements.image1.src = pairData.image1;
  elements.image2.src = pairData.image2;
  
  // Render response
  renderResponse();
  
  // Render structure panel
  renderStructure();
  
  console.log('✓ Content rendered');
}

function renderResponse() {
  const categoryData = SPEAKING_DATA[currentCategory];
  const pairData = categoryData.pairs[currentPairIndex];
  const responseData = pairData.responses[currentStyle];
  
  if (!responseData || !responseData.sections) {
    console.error('❌ No response data found');
    return;
  }
  
  let html = '';
  
  responseData.sections.forEach(section => {
    html += `
      <div class="response-block">
        <div class="block-label">
          ${section.icon} ${section.label}
        </div>
        <div class="block-text">
          ${highlightPhrases(section.text, section.phrases)}
        </div>
      </div>
    `;
  });
  
  elements.responseContent.innerHTML = html;
}

function highlightPhrases(text, phrases) {
  let highlightedText = text;
  
  // Highlight discourse markers
  if (phrases.discourse) {
    phrases.discourse.forEach(phrase => {
      const regex = new RegExp(`(${escapeRegex(phrase)})`, 'gi');
      highlightedText = highlightedText.replace(
        regex, 
        '<span class="phrase discourse">$1</span>'
      );
    });
  }
  
  // Highlight vocabulary
  if (phrases.vocabulary) {
    phrases.vocabulary.forEach(phrase => {
      const regex = new RegExp(`(${escapeRegex(phrase)})`, 'gi');
      highlightedText = highlightedText.replace(
        regex, 
        '<span class="phrase vocab">$1</span>'
      );
    });
  }
  
  return highlightedText;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderStructure() {
  const categoryData = SPEAKING_DATA[currentCategory];
  const phraseBank = categoryData.phraseBank;
  
  let html = '';
  
  // Discourse markers
  html += `
    <div class="structure-category">
      <div class="structure-category-title">🔗 Discourse Markers</div>
      <div class="structure-list">
        ${phraseBank.discourse.map(phrase => 
          `<div class="structure-item">${phrase}</div>`
        ).join('')}
      </div>
    </div>
  `;
  
  // Vocabulary
  html += `
    <div class="structure-category vocab-cat">
      <div class="structure-category-title">📚 Key Vocabulary</div>
      <div class="structure-list">
        ${phraseBank.vocabulary.map(phrase => 
          `<div class="structure-item">${phrase}</div>`
        ).join('')}
      </div>
    </div>
  `;
  
  elements.structureGrid.innerHTML = html;
}

// ==========================================
// AUDIO PLAYBACK
// ==========================================

function playAudio() {
  console.log('▶️ Playing audio...');
  
  // Stop any current speech
  stopAudio();
  
  const categoryData = SPEAKING_DATA[currentCategory];
  const pairData = categoryData.pairs[currentPairIndex];
  const responseData = pairData.responses[currentStyle];
  
  // Combine all section texts
  const fullText = responseData.sections
    .map(section => section.text)
    .join(' ');
  
  // Create speech synthesis utterance
  currentUtterance = new SpeechSynthesisUtterance(fullText);
  
  // Configure voice (prioritize UK English female voices)
  const voices = speechSynthesis.getVoices();
  const preferredVoices = ['Kate', 'Serena', 'Karen', 'Victoria'];
  
  let selectedVoice = null;
  for (let voiceName of preferredVoices) {
    selectedVoice = voices.find(v => v.name.includes(voiceName));
    if (selectedVoice) break;
  }
  
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.includes('en-GB')) || voices[0];
  }
  
  currentUtterance.voice = selectedVoice;
  currentUtterance.rate = 0.9;
  currentUtterance.pitch = 1.0;
  
  // Event handlers
  currentUtterance.onstart = function() {
    elements.playBtn.classList.add('speaking');
    console.log('🔊 Speech started');
  };
  
  currentUtterance.onend = function() {
    elements.playBtn.classList.remove('speaking');
    console.log('✓ Speech ended');
  };
  
  currentUtterance.onerror = function(event) {
    console.error('❌ Speech error:', event);
    elements.playBtn.classList.remove('speaking');
  };
  
  // Play
  speechSynthesis.speak(currentUtterance);
}

function stopAudio() {
  if (currentUtterance) {
    speechSynthesis.cancel();
    elements.playBtn.classList.remove('speaking');
    currentUtterance = null;
  }
}

// ==========================================
// X-RAY TOGGLE
// ==========================================

function toggleXray() {
  isXrayActive = !isXrayActive;
  
  if (isXrayActive) {
    elements.xrayBtn.classList.add('active');
    elements.responseContent.classList.add('xray-active');
    console.log('🔬 X-Ray activated');
  } else {
    elements.xrayBtn.classList.remove('active');
    elements.responseContent.classList.remove('xray-active');
    console.log('🔬 X-Ray deactivated');
  }
}

// ==========================================
// VIEW MODE TOGGLE
// ==========================================

function toggleViewMode() {
  isStructureMode = !isStructureMode;
  
  if (isStructureMode) {
    // Switch to Structure mode
    elements.viewModeToggle.classList.add('active');
    elements.watchLabel.classList.remove('active');
    elements.structureLabel.classList.add('active');
    elements.responseSection.style.display = 'none';
    elements.structurePanel.classList.add('active');
    console.log('📚 Structure mode activated');
  } else {
    // Switch to Watch mode
    elements.viewModeToggle.classList.remove('active');
    elements.watchLabel.classList.add('active');
    elements.structureLabel.classList.remove('active');
    elements.responseSection.style.display = 'block';
    elements.structurePanel.classList.remove('active');
    console.log('👁️ Watch mode activated');
  }
}

// ==========================================
// PRACTICE MODE
// ==========================================

function showPracticePrompt() {
  if (elements.practicePrompt) {
    elements.practicePrompt.classList.add('active');
    elements.practicePrompt.scrollIntoView({ behavior: 'smooth' });
    console.log('🎙️ Practice prompt shown');
  }
}

// ==========================================
// VOICE LOADING
// ==========================================

// Ensure voices are loaded
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = function() {
    console.log('🔊 Voices loaded:', speechSynthesis.getVoices().length);
  };
}

console.log('✓ part2-logic.js loaded successfully');
