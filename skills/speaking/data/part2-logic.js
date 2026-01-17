// ==========================================
// INTUITY SPEAKING PRACTICE - PART 2 LOGIC
// iPhone 11 Pro Max Optimized
// ==========================================

console.log('Loading part2-logic.js...');

// ==========================================
// STATE MANAGEMENT
// ==========================================
let currentCategory = 'comparing';
let currentStyle = 'default';
let currentPairIndex = 0;
let viewMode = 'watch'; // 'watch' or 'structure'
let showXRay = false;
let isPlaying = false;
let voicesLoaded = false;

// DOM elements (initialized after DOM loads)
let taskText, image1, image2, responseSection, responseContent;
let structurePanel, structureGrid, practicePrompt, xrayBtn;
let playBtn, pauseBtn, viewModeToggle, watchLabel, structureLabel, imageSection;

// ==========================================
// CATEGORY & STYLE MANAGEMENT
// ==========================================
function switchCategory(category) {
  console.log('Switching to category:', category);
  currentCategory = category;
  currentPairIndex = 0;
  currentStyle = 'default';
  
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  
  document.querySelectorAll('.style-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.style === 'default');
  });
  
  renderContent();
}

function switchStyle(style) {
  console.log('Switching to style:', style);
  currentStyle = style;
  
  document.querySelectorAll('.style-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.style === style);
  });
  
  renderResponse();
}

// ==========================================
// VIEW MODE TOGGLE
// ==========================================
function toggleViewMode() {
  viewMode = viewMode === 'watch' ? 'structure' : 'watch';
  console.log('View mode:', viewMode);
  
  viewModeToggle.classList.toggle('active', viewMode === 'structure');
  watchLabel.classList.toggle('active', viewMode === 'watch');
  structureLabel.classList.toggle('active', viewMode === 'structure');
  
  if (viewMode === 'watch') {
    responseSection.style.display = 'block';
    structurePanel.classList.remove('active');
    imageSection.style.display = 'block';
  } else {
    responseSection.style.display = 'none';
    structurePanel.classList.add('active');
    imageSection.style.display = 'none';
    renderStructure();
  }
}

// ==========================================
// X-RAY MODE
// ==========================================
function toggleXRay() {
  showXRay = !showXRay;
  console.log('X-Ray mode:', showXRay);
  xrayBtn.classList.toggle('active', showXRay);
  responseContent.classList.toggle('xray-active', showXRay);
}

// ==========================================
// CONTENT RENDERING
// ==========================================
function renderContent() {
  const data = SPEAKING_DATA[currentCategory];
  if (!data) {
    console.error('No data found for category:', currentCategory);
    return;
  }
  
  const pair = data.pairs[currentPairIndex];
  
  taskText.textContent = data.task;
  image1.src = pair.image1;
  image2.src = pair.image2;
  
  renderResponse();
}

function renderResponse() {
  const data = SPEAKING_DATA[currentCategory];
  if (!data) {
    console.error('No data found for category:', currentCategory);
    return;
  }
  
  const pair = data.pairs[currentPairIndex];
  const response = pair.responses[currentStyle];
  
  if (!response || !response.sections) {
    console.error('Invalid response structure for style:', currentStyle);
    return;
  }
  
  let html = '';
  
  response.sections.forEach(section => {
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
  
  responseContent.innerHTML = html;
  console.log('Response rendered for:', currentStyle);
}

function highlightPhrases(text, phrases) {
  if (!phrases) return text;
  
  let result = text;
  
  // Highlight discourse markers
  if (phrases.discourse && Array.isArray(phrases.discourse)) {
    phrases.discourse.forEach(phrase => {
      const regex = new RegExp(`\\b(${escapeRegex(phrase)})\\b`, 'gi');
      result = result.replace(regex, '<span class="phrase discourse">$1</span>');
    });
  }
  
  // Highlight vocabulary
  if (phrases.vocabulary && Array.isArray(phrases.vocabulary)) {
    phrases.vocabulary.forEach(phrase => {
      const regex = new RegExp(`\\b(${escapeRegex(phrase)})\\b`, 'gi');
      result = result.replace(regex, '<span class="phrase vocab">$1</span>');
    });
  }
  
  return result;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==========================================
// STRUCTURE PANEL RENDERING
// ==========================================
function renderStructure() {
  const data = SPEAKING_DATA[currentCategory];
  if (!data) {
    console.error('No data found for category:', currentCategory);
    return;
  }
  
  console.log('Rendering structure for:', currentCategory);
  console.log('Discourse markers:', data.phraseBank.discourse.length);
  console.log('Vocabulary items:', data.phraseBank.vocabulary.length);
  
  let html = '';
  
  // Discourse Markers
  html += `
    <div class="structure-category">
      <div class="structure-category-title">🔬 Discourse Markers</div>
      <div class="structure-list">
        ${data.phraseBank.discourse.map(phrase => 
          `<div class="structure-item">${phrase}</div>`
        ).join('')}
      </div>
    </div>
  `;
  
  // Key Vocabulary
  html += `
    <div class="structure-category vocab-cat">
      <div class="structure-category-title">💡 Key Vocabulary</div>
      <div class="structure-list">
        ${data.phraseBank.vocabulary.map(phrase => 
          `<div class="structure-item">${phrase}</div>`
        ).join('')}
      </div>
    </div>
  `;
  
  structureGrid.innerHTML = html;
  console.log('Structure rendered successfully');
}

// ==========================================
// VOICE SELECTION (iPhone 11 Pro Max Optimized)
// ==========================================
function selectBestVoice() {
  const voices = speechSynthesis.getVoices();
  
  console.log('=== Voice Selection ===');
  console.log('Total voices available:', voices.length);
  
  // Priority list for iPhone voices
  const preferredVoices = [
    'Kate',           // iOS British Female
    'Serena',         // iOS British Female (alternative)
    'Daniel',         // iOS British Male (fallback)
    'Google UK English Female',
    'Microsoft Hazel Desktop',
    'Microsoft Susan Desktop'
  ];
  
  // Log available voices
  voices.forEach((voice, index) => {
    console.log(`${index + 1}. ${voice.name} (${voice.lang})`);
  });
  
  // Try to find preferred voices
  for (const preferred of preferredVoices) {
    const voice = voices.find(v => v.name === preferred);
    if (voice) {
      console.log('✓ Selected voice:', voice.name, '(' + voice.lang + ')');
      return voice;
    }
  }
  
  // Fallback: Find any British English female voice
  const ukFemale = voices.find(v => 
    v.lang.startsWith('en-GB') && 
    (v.name.toLowerCase().includes('female') || 
     v.name.toLowerCase().includes('woman') ||
     v.name.toLowerCase().includes('kate') ||
     v.name.toLowerCase().includes('serena'))
  );
  
  if (ukFemale) {
    console.log('✓ Selected UK female voice:', ukFemale.name);
    return ukFemale;
  }
  
  // Fallback: Any British English voice
  const ukVoice = voices.find(v => v.lang.startsWith('en-GB'));
  if (ukVoice) {
    console.log('✓ Selected UK voice:', ukVoice.name);
    return ukVoice;
  }
  
  // Fallback: Any English voice
  const enVoice = voices.find(v => v.lang.startsWith('en-'));
  if (enVoice) {
    console.log('⚠ Using fallback English voice:', enVoice.name);
    return enVoice;
  }
  
  console.log('⚠ Using default system voice');
  return null;
}

// ==========================================
// SPEECH SYNTHESIS
// ==========================================
async function playAudio() {
  const data = SPEAKING_DATA[currentCategory];
  if (!data) {
    console.error('No data for category:', currentCategory);
    return;
  }
  
  const pair = data.pairs[currentPairIndex];
  const response = pair.responses[currentStyle];
  
  if (!response || !response.sections) {
    console.error('Invalid response structure');
    return;
  }
  
  // Cancel any existing speech
  speechSynthesis.cancel();
  
  // Ensure voices are loaded
  await ensureVoicesLoaded();
  
  isPlaying = true;
  playBtn.style.display = 'none';
  pauseBtn.style.display = 'flex';
  playBtn.classList.add('speaking');
  
  console.log('=== Starting Audio Playback ===');
  console.log('Category:', currentCategory);
  console.log('Style:', currentStyle);
  console.log('Sections to speak:', response.sections.length);
  
  for (const section of response.sections) {
    if (!isPlaying) break;
    
    // Strip HTML tags to get plain text
    const plainText = section.text.replace(/<[^>]*>/g, '');
    console.log('Speaking:', plainText.substring(0, 50) + '...');
    
    await speak(plainText);
    
    if (isPlaying) {
      await wait(800); // Pause between sections
    }
  }
  
  console.log('=== Audio Playback Complete ===');
  stopAudio();
}

function speak(text) {
  return new Promise((resolve) => {
    if (!isPlaying) {
      resolve();
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Select the best available voice
    const selectedVoice = selectBestVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => {
      console.log('▶ Speech started');
    };
    
    utterance.onend = () => {
      console.log('■ Speech ended');
      resolve();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech error:', event.error);
      resolve();
    };
    
    speechSynthesis.speak(utterance);
  });
}

function pauseAudio() {
  isPlaying = false;
  speechSynthesis.cancel();
  stopAudio();
}

function stopAudio() {
  isPlaying = false;
  playBtn.style.display = 'flex';
  pauseBtn.style.display = 'none';
  playBtn.classList.remove('speaking');
  console.log('Audio playback stopped');
}

function replay() {
  speechSynthesis.cancel();
  stopAudio();
  setTimeout(() => playAudio(), 100);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// VOICE LOADING
// ==========================================
function ensureVoicesLoaded() {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      if (!voicesLoaded) {
        voicesLoaded = true;
        console.log('✓ Voices already loaded:', voices.length);
      }
      resolve();
    } else {
      console.log('Waiting for voices to load...');
      
      const timeout = setTimeout(() => {
        console.log('⚠ Voice loading timeout - proceeding anyway');
        resolve();
      }, 2000);
      
      speechSynthesis.onvoiceschanged = () => {
        clearTimeout(timeout);
        const loadedVoices = speechSynthesis.getVoices();
        voicesLoaded = true;
        console.log('✓ Voices loaded:', loadedVoices.length);
        resolve();
      };
    }
  });
}

function loadVoices() {
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0 && !voicesLoaded) {
    voicesLoaded = true;
    console.log('=== Voice System Ready ===');
    console.log('Total voices available:', voices.length);
    
    // Check for Kate and Serena specifically
    const kate = voices.find(v => v.name === 'Kate');
    const serena = voices.find(v => v.name === 'Serena');
    
    if (kate) console.log('✓ Kate (UK) voice found');
    if (serena) console.log('✓ Serena (UK) voice found');
    if (!kate && !serena) console.log('⚠ Kate/Serena not found - will use fallback');
  }
}

// ==========================================
// PRACTICE MODE
// ==========================================
function showPractice() {
  practicePrompt.classList.add('active');
  practicePrompt.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM ready - initializing Part 2 logic');
  
  // CHECK IF DATA IS LOADED
  if (typeof SPEAKING_DATA === 'undefined') {
    console.error('❌ SPEAKING_DATA is not defined!');
    console.error('Make sure part2-structure.js is loaded BEFORE part2-logic.js');
    console.error('Check your HTML has: <script src="part2-structure.js"></script> FIRST');
    return;
  }
  
  console.log('✓ SPEAKING_DATA loaded successfully');
  console.log('Available categories:', Object.keys(SPEAKING_DATA));
  
  // Initialize DOM elements
  taskText = document.getElementById('taskText');
  image1 = document.getElementById('image1');
  image2 = document.getElementById('image2');
  imageSection = document.querySelector('.image-section');
  responseSection = document.getElementById('responseSection');
  responseContent = document.getElementById('responseContent');
  structurePanel = document.getElementById('structurePanel');
  structureGrid = document.getElementById('structureGrid');
  practicePrompt = document.getElementById('practicePrompt');
  xrayBtn = document.getElementById('xrayBtn');
  playBtn = document.getElementById('playBtn');
  pauseBtn = document.getElementById('pauseBtn');
  viewModeToggle = document.getElementById('viewModeToggle');
  watchLabel = document.getElementById('watchLabel');
  structureLabel = document.getElementById('structureLabel');
  
  // Verify all elements exist
  if (!taskText || !image1 || !image2 || !responseContent) {
    console.error('Critical DOM elements missing!');
    return;
  }
  
  console.log('✓ All DOM elements found');
  
  // Attach event listeners
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchCategory(btn.dataset.category);
    });
  });

  document.querySelectorAll('.style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchStyle(btn.dataset.style);
    });
  });

  if (viewModeToggle) {
    viewModeToggle.addEventListener('click', toggleViewMode);
  }

  if (xrayBtn) {
    xrayBtn.addEventListener('click', toggleXRay);
  }

  if (playBtn) {
    playBtn.addEventListener('click', playAudio);
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', pauseAudio);
  }

  const replayBtn = document.getElementById('replayBtn');
  if (replayBtn) {
    replayBtn.addEventListener('click', replay);
  }

  const practiceBtn = document.getElementById('practiceBtn');
  if (practiceBtn) {
    practiceBtn.addEventListener('click', showPractice);
  }

  // Load voices immediately
  loadVoices();
  
  // Listen for voice changes (important for iOS)
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    // Force load voices on iOS
    setTimeout(() => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('✓ Voices loaded via timeout:', voices.length);
        voicesLoaded = true;
      }
    }, 100);
  }
  
  // Render initial content
  renderContent();
  
  console.log('=== INTUITY Speaking Practice Initialized ===');
  console.log('Device: iPhone 11 Pro Max optimized');
  console.log('Preferred voices: Kate, Serena (UK)');
  console.log('Current category:', currentCategory);
  console.log('Current style:', currentStyle);
});

console.log('✓ part2-logic.js loaded successfully');
