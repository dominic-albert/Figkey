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
const btnExit = document.getElementById('btn-exit');
const btnReveal = document.getElementById('reveal-btn'); 
const btnOK = document.getElementById('ok-btn'); 

// Input Control Buttons
const inputControls = document.getElementById('input-controls');
const btnClear = document.getElementById('btn-clear');
const btnSubmit = document.getElementById('btn-submit');

// Display elements
const scoreDisplay = document.getElementById('score-display');
const questionCounter = document.getElementById('question-counter');
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const finalScoreEl = document.getElementById('final-score');
const progressBar = document.getElementById('progress-bar');
const badgeDisplay = document.getElementById('badge-display');
const timerEl = document.getElementById('timer'); 
const keyVisualizer = document.getElementById('key-visualizer');

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

// Buffer for Manual Submission
let bufferedInput = []; 

// --- 4. Core Game Functions ---

function stopTimer() {
    clearInterval(timerInterval);
}

function startTimer() {
    stopTimer(); 
    timeLeft = 15;
    
    // Reset inputs
    bufferedInput = [];
    renderKeys();
    
    timerEl.textContent = timeLeft;
    timerEl.className = ''; 
    
    // ENSURE CONTROLS ARE HIDDEN INITIALLY
    inputControls.classList.add('hidden');
    
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
            handleTimeout(); 
        }
    }, 1000);
}

function startGame(difficulty) {
    score = 0;
    questionCount = 0;
    currentDifficulty = difficulty; 

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
        
        btnReveal.classList.add('hidden');
        btnOK.classList.add('hidden'); 
        
        // Hide controls initially
        inputControls.classList.add('hidden');
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
    bufferedInput = [];
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
    if (key.length === 1) return key.toUpperCase();
    return key;
}

function formatKeys(keys) {
    if (keys.join('') === '00') return '0 + 0';
    return keys.map(formatKey).join(' + ');
}

function renderKeys() {
    if (bufferedInput.length === 0) {
        keyVisualizer.innerHTML = '<span class="key-placeholder">Type your answer...</span>';
        return;
    }
    keyVisualizer.innerHTML = bufferedInput.map(key => {
        return `<div class="key-cap active">${formatKey(key)}</div>`;
    }).join('');
}

// --- Validation Logic ---

function checkAnswer() {
    if (isChecking) return;
    isChecking = true; // Lock input
    stopTimer();
    inputControls.classList.add('hidden'); // HIDE CONTROLS ON SUBMIT

    const correctAnswer = currentQuestion[currentOS];
    let isCorrect = true;

    // 1. Check length
    if (bufferedInput.length !== correctAnswer.length) {
        isCorrect = false;
    } else {
        // 2. Validate content
        if (correctAnswer.join('') === '00') {
            if (bufferedInput.join('') !== '00') isCorrect = false;
        } else {
            const bufferLower = bufferedInput.map(k => k.toLowerCase());
            
            // Check modifiers
            if (correctAnswer.includes('metaKey') && !bufferLower.includes('meta') && !bufferLower.includes('metakey')) isCorrect = false;
            if (correctAnswer.includes('ctrlKey') && !bufferLower.includes('control') && !bufferLower.includes('ctrlkey')) isCorrect = false;
            if (correctAnswer.includes('shiftKey') && !bufferLower.includes('shift') && !bufferLower.includes('shiftkey')) isCorrect = false;
            if (correctAnswer.includes('altKey') && !bufferLower.includes('alt') && !bufferLower.includes('altkey')) isCorrect = false;

            // Check main key
            const mainKey = correctAnswer.find(k => !['metaKey', 'ctrlKey', 'shiftKey', 'altKey'].includes(k));
            if (mainKey) {
                const bufferMainKeys = bufferLower.filter(k => !['control', 'shift', 'alt', 'meta'].includes(k));
                let found = false;
                bufferMainKeys.forEach(k => {
                    if (k === mainKey.toLowerCase()) found = true;
                    if (mainKey === '=' && k === '+') found = true;
                    if (mainKey === 'space' && k === ' ') found = true;
                });
                if (!found) isCorrect = false;
            }
        }
    }

    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }
}

function handleCorrectAnswer() {
    answerEl.textContent = 'Correct!';
    answerEl.className = 'correct';
    score++;
    scoreDisplay.classList.add('score-update');
    setTimeout(() => scoreDisplay.classList.remove('score-update'), 400);
    
    questionCount++;
    setTimeout(() => {
        getNewQuestion();
    }, 1200);
}

function handleIncorrectAnswer() {
    answerEl.textContent = 'Incorrect';
    answerEl.className = 'incorrect';
    btnReveal.classList.remove('hidden'); 
}

function handleTimeout() {
    answerEl.textContent = 'Time Out!';
    answerEl.className = 'timeout';
    btnReveal.classList.remove('hidden');
    inputControls.classList.add('hidden'); // HIDE CONTROLS ON TIMEOUT
    isChecking = true;
}

function revealAnswer() {
    btnReveal.classList.add('hidden');
    const answerKeys = currentQuestion[currentOS];
    const formattedAnswer = formatKeys(answerKeys);
    answerEl.textContent = `Correct: ${formattedAnswer}`;
    answerEl.className = 'info'; 
    btnOK.classList.remove('hidden'); 
    questionCount++;
}

// --- 5. Event Listeners ---

btnSubmit.addEventListener('click', checkAnswer);
btnClear.addEventListener('click', () => {
    bufferedInput = [];
    renderKeys();
    // Optional: Hide controls if cleared? 
    // inputControls.classList.add('hidden');
});

// Keyboard Listener
document.addEventListener('keydown', function(e) {
    if (quizContainer.classList.contains('hidden') || isChecking) return;

    // SHOW CONTROLS ON KEYPRESS
    if (inputControls.classList.contains('hidden')) {
        inputControls.classList.remove('hidden');
    }

    if(['Tab', 'Alt', ' '].includes(e.key) || (e.ctrlKey && e.key === 's')) {
        e.preventDefault();
    }

    const isModifier = ["Control", "Shift", "Alt", "Meta"].includes(e.key);
    if (!isModifier && bufferedInput.includes(e.key) && e.key !== '0') {
       return; 
    }
    if (isModifier && bufferedInput.includes(e.key)) {
        return;
    }

    bufferedInput.push(e.key);
    renderKeys();
});

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

btnExit.addEventListener('click', (e) => {
    e.preventDefault();
    resetGame(); 
});

btnReveal.addEventListener('click', revealAnswer); 
btnOK.addEventListener('click', handleOKClick); 
function handleOKClick() {
    btnOK.classList.add('hidden');
    if (questionCount < totalQuestions) {
        getNewQuestion();
    } else {
        progressBar.style.width = '100%'; 
        showResults();
    }
}

if (window.innerWidth <= 768) { 
    alert("This site is only for desktop.");
    document.getElementById('app-container').style.display = 'none';
} else {
    resetGame();
}
