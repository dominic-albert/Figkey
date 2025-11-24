/* 3. THE JAVASCRIPT (The Brains) */

import { shortcuts } from './shortcuts.js';

// --- 2. Get Elements ---
const body = document.body;
const appContainer = document.getElementById('app-container');
const quizHeader = document.getElementById('quiz-header');
const welcomeContainer = document.getElementById('welcome-container');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');

// Buttons
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const btnPlayAgain = document.getElementById('play-again-btn');
const btnTryHard = document.getElementById('try-hard-btn');
const btnRetake = document.getElementById('btn-retake');
const btnHelp = document.getElementById('btn-help');
const btnExit = document.getElementById('btn-exit');
const btnReveal = document.getElementById('reveal-btn'); 
const btnOK = document.getElementById('ok-btn'); 

// Display elements
const scoreDisplay = document.getElementById('score-display');
const questionCounter = document.getElementById('question-counter');
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const finalScoreEl = document.getElementById('final-score');
const progressBar = document.getElementById('progress-bar');
const badgeDisplay = document.getElementById('badge-display');
const timerEl = document.getElementById('timer'); 
const keyVisualizer = document.getElementById('key-visualizer'); // NEW

// --- 3. State Variables ---
let currentQuestion = {};
let currentOS = (navigator.platform.includes("Mac") ? 'mac' : 'win');
let score = 0;
let questionCount = 0;
const totalQuestions = 10;
let quizShortcuts = []; 
let isChecking = false; 
let currentDifficulty = ''; 

// Timer variables
let timerInterval;
let timeLeft = 15;
let keyPressHistory = []; 

// NEW: Active Keys State for Visualizer
let activeKeys = new Set(); 

// --- 4. Core Game Functions ---

function stopTimer() {
    clearInterval(timerInterval);
}

function startTimer() {
    stopTimer(); 
    timeLeft = 15;
    keyPressHistory = []; 
    activeKeys.clear(); // Clear visualizer
    renderKeys();      // Update UI
    
    timerEl.textContent = timeLeft;
    timerEl.className = ''; 
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        
        if (timeLeft <= 5) {
            timerEl.classList.add('warn'); 
        }
        if (timeLeft <= 2) {
            timerEl.classList.add('danger'); 
        }
        
        if (timeLeft === 0) {
            stopTimer();
            handleTimeout(); // CHANGED: Calls specific timeout function
        }
    }, 1000);
}

function startGame(difficulty) {
    score = 0;
    questionCount = 0;
    currentDifficulty = difficulty; 

    // Filter shortcuts
    let filtered = shortcuts.filter(s => s.difficulty.toLowerCase() === difficulty);
    
    if (filtered.length < totalQuestions) {
         if(filtered.length === 0) {
            filtered = shortcuts.filter(s => s.difficulty.toLowerCase() === 'easy');
         }
         let i = 0;
         while(filtered.length < totalQuestions && filtered.length > 0) {
            filtered.push(filtered[i % filtered.length]);
            i++;
         }
    }
    
    for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    
    quizShortcuts = filtered.slice(0, totalQuestions);
    
    welcomeContainer.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    quizHeader.classList.remove('hidden'); 
    body.classList.remove('diagonal-bg'); 

    getNewQuestion(); 
}

function getNewQuestion() {
    if (questionCount < totalQuestions) {
        updateStats(); 
        currentQuestion = quizShortcuts[questionCount];
        questionEl.textContent = currentQuestion.name;
        
        answerEl.textContent = '';
        answerEl.className = '';
        
        // Reset Visualizer
        activeKeys.clear();
        renderKeys();

        btnReveal.classList.add('hidden');
        btnOK.classList.add('hidden'); 
        isChecking = false; 
        startTimer(); 
    } else {
        showResults();
    }
}
        
function updateStats() {
    scoreDisplay.textContent = `Score: ${score}`;
    questionCounter.textContent = `Question: ${questionCount + 1} / ${totalQuestions}`;
    const percentage = ((questionCount + 1) / totalQuestions) * 100; 
    progressBar.style.width = percentage + '%';
}

function showResults() {
    stopTimer(); 
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    quizHeader.classList.add('hidden'); 
    body.classList.remove('diagonal-bg'); 

    finalScoreEl.textContent = `You got ${score} out of ${totalQuestions} correct.`;
    
    btnTryHard.classList.add('hidden');
    
    let badgeHTML = '';
    if (score === 10) {
        badgeHTML = '<span class="badge-icon">🥇</span><div class="badge-gold">Gold Medal!</div>';
    } else if (score >= 8) {
        badgeHTML = '<span class="badge-icon">🥈</span><div class="badge-silver">Silver Medal!</div>';
    } else if (score >= 5) {
        badgeHTML = '<span class="badge-icon">🥉</span><div class="badge-bronze">Bronze Medal!</div>';
    } else {
        badgeHTML = 'Practice makes perfect!';
    }
    badgeDisplay.innerHTML = badgeHTML;
    
    if (currentDifficulty === 'easy' && score >= 8) {
        btnTryHard.classList.remove('hidden');
    }
}

function resetGame() {
    stopTimer();
    activeKeys.clear(); // Clear keys on reset
    resultsContainer.classList.add('hidden');
    quizContainer.classList.add('hidden');
    quizHeader.classList.add('hidden');
    welcomeContainer.classList.remove('hidden');
    progressBar.style.width = '0%'; 
    body.classList.add('diagonal-bg'); 
}

// --- Helper Functions ---

function formatKey(key) {
    if (key === 'metaKey' || key === 'Meta') return (currentOS === 'mac') ? '⌘' : 'Win';
    if (key === 'ctrlKey' || key === 'Control') return 'Ctrl';
    if (key === 'shiftKey' || key === 'Shift') return '⇧';
    if (key === 'altKey' || key === 'Alt') return (currentOS === 'mac') ? '⌥' : 'Alt';
    if (key === 'escape' || key === 'Escape') return 'Esc';
    if (key === 'enter' || key === 'Enter') return '↵';
    if (key === 'backspace' || key === 'Backspace') return '⌫';
    if (key === 'delete' || key === 'Delete') return 'Del';
    if (key === 'tab' || key === 'Tab') return 'Tab';
    if (key === ' ' || key === 'space' || key === 'Space') return 'Space';
    // For single letters, capitalize them
    if (key.length === 1) return key.toUpperCase();
    return key;
}

function formatKeys(keys) {
    if (keys.join('') === '00') return '0 + 0';
    return keys.map(formatKey).join(' + ');
}

// --- NEW: Visualizer Renderer ---
function renderKeys() {
    if (activeKeys.size === 0) {
        keyVisualizer.innerHTML = '<span class="key-placeholder">Start typing...</span>';
        return;
    }
    
    // Sort keys to put modifiers first (UX preference)
    const modifiers = ['Control', 'Meta', 'Alt', 'Shift'];
    const sortedKeys = Array.from(activeKeys).sort((a, b) => {
        const aIsMod = modifiers.includes(a);
        const bIsMod = modifiers.includes(b);
        if (aIsMod && !bIsMod) return -1;
        if (!aIsMod && bIsMod) return 1;
        return 0;
    });

    keyVisualizer.innerHTML = sortedKeys.map(key => {
        return `<div class="key-cap active">${formatKey(key)}</div>`;
    }).join('');
}

// --- Answer Handling ---

function revealAnswer() {
    btnReveal.classList.add('hidden');
    const answerKeys = currentQuestion[currentOS];
    const formattedAnswer = formatKeys(answerKeys);
    answerEl.textContent = `Correct: ${formattedAnswer}`;
    answerEl.className = 'info'; 
    btnOK.classList.remove('hidden'); 
    questionCount++;
}

function handleOKClick() {
    btnOK.classList.add('hidden');
    if (questionCount < totalQuestions) {
        getNewQuestion();
    } else {
        progressBar.style.width = '100%'; 
        showResults();
    }
}

function handleCorrectAnswer() {
    stopTimer();
    score++;
    answerEl.textContent = 'Correct!';
    answerEl.className = 'correct';
    scoreDisplay.classList.add('score-update');
    setTimeout(() => scoreDisplay.classList.remove('score-update'), 400);
    
    // Clear visualizer after a short delay
    setTimeout(() => {
        activeKeys.clear();
        renderKeys();
    }, 1000);

    questionCount++;
    setTimeout(() => {
        getNewQuestion();
    }, 1200);
}

function handleIncorrectAnswer() {
    stopTimer();
    answerEl.textContent = 'Incorrect';
    answerEl.className = 'incorrect';
    btnReveal.classList.remove('hidden'); 
    isChecking = true; 
}

// NEW: Timeout specific handler
function handleTimeout() {
    stopTimer();
    answerEl.textContent = 'Time Out!'; // Custom text
    answerEl.className = 'timeout';    // Custom class (Orange)
    btnReveal.classList.remove('hidden');
    isChecking = true;
}

// --- 5. Key Listeners ---

// NEW: Global keyup listener to clear visualizer
document.addEventListener('keyup', (e) => {
    // Remove the key from the set
    if (activeKeys.has(e.key)) {
        activeKeys.delete(e.key);
        renderKeys();
    }
    // Handle standard modifier release events specially if needed
    if (e.key === 'Control') activeKeys.delete('Control');
    if (e.key === 'Shift') activeKeys.delete('Shift');
    if (e.key === 'Alt') activeKeys.delete('Alt');
    if (e.key === 'Meta') activeKeys.delete('Meta');
    renderKeys();
});

// Window blur listener to clear keys if user Tabs away
window.addEventListener('blur', () => {
    activeKeys.clear();
    renderKeys();
});

document.addEventListener('keydown', function(e) {
    const modifierKeys = ["Control", "Shift", "Alt", "Meta"];
    
    if (quizContainer.classList.contains('hidden') || isChecking) {
        return;
    }

    // --- VISUALIZER LOGIC (Top Priority) ---
    // Add key to set and render immediately
    if (!activeKeys.has(e.key)) {
        activeKeys.add(e.key);
        renderKeys();
    }
    
    // Don't check answer on modifiers alone
    if (modifierKeys.includes(e.key)) {
        return;
    }
    
    if (!currentQuestion || !currentQuestion[currentOS]) return;

    e.preventDefault();
    
    const correctAnswer = currentQuestion[currentOS];
    let isCorrect = true;

    // --- Special Case: "0+0" ---
    if (correctAnswer.join('') === '00') {
        if (e.key === '0' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
            keyPressHistory.push('0');
            if (keyPressHistory.length === 2) {
                isChecking = true;
                handleCorrectAnswer();
            }
        } else {
            isChecking = true;
            handleIncorrectAnswer();
        }
        return; 
    }

    // Standard checking logic
    isChecking = true; 
    const mainKey = correctAnswer.find(k => !['metaKey', 'ctrlKey', 'shiftKey', 'altKey'].includes(k));

    if (mainKey && mainKey.toLowerCase() !== e.key.toLowerCase()) {
        let keyMatch = false;
        if (mainKey === '=' && e.key === '+') keyMatch = true;
        else if (mainKey === 'space' && e.code === 'Space') keyMatch = true;
        
        if (!keyMatch) isCorrect = false;

    } else if (!mainKey) {
         isCorrect = true; 
    }
    
    if (correctAnswer.includes('metaKey') !== e.metaKey) isCorrect = false;
    if (correctAnswer.includes('ctrlKey') !== e.ctrlKey) isCorrect = false;
    if (correctAnswer.includes('shiftKey') !== e.shiftKey) isCorrect = false;
    if (correctAnswer.includes('altKey') !== e.altKey) isCorrect = false;
    
    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }
});

// --- 7. Button Listeners ---
difficultyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        startGame(e.target.dataset.difficulty);
    });
});

btnPlayAgain.addEventListener('click', resetGame);
btnTryHard.addEventListener('click', () => startGame('hard'));

btnRetake.addEventListener('click', (e) => {
    e.preventDefault(); 
    if (currentDifficulty) startGame(currentDifficulty); 
});

btnHelp.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Instructions:\nPress the key combination...\n(See code for full text)");
});

btnExit.addEventListener('click', (e) => {
    e.preventDefault();
    resetGame(); 
});

btnReveal.addEventListener('click', revealAnswer); 
btnOK.addEventListener('click', handleOKClick); 

if (window.innerWidth <= 768) { 
    alert("This site is only for desktop.");
    document.getElementById('app-container').style.display = 'none';
} else {
    resetGame();
}
