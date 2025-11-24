/* 3. THE JAVASCRIPT (The Brains) */

// --- 1. Import the shortcuts list from its own file ---
import { shortcuts } from './shortcuts.js';

// --- 2. Get Elements ---
const body = document.body;
const appContainer = document.getElementById('app-container');
const quizHeader = document.getElementById('quiz-header');
const welcomeContainer = document.getElementById('welcome-container');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');

// Difficulty buttons
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

// Results buttons
const btnPlayAgain = document.getElementById('play-again-btn');
const btnTryHard = document.getElementById('try-hard-btn'); // Upsell button

// Header nav buttons
const btnRetake = document.getElementById('btn-retake');
const btnHelp = document.getElementById('btn-help');
const btnExit = document.getElementById('btn-exit');

// Quiz buttons
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
let timeLeft = 15; // <-- UPDATED TO 15
let keyPressHistory = []; // For "0+0" shortcut

// --- 4. Core Game Functions ---

// Timer Functions
function stopTimer() {
    clearInterval(timerInterval);
}

function startTimer() {
    stopTimer(); 
    timeLeft = 15; // <-- UPDATED TO 15
    keyPressHistory = []; // Reset key history
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
            handleIncorrectAnswer(); 
        }
    }, 1000);
}

function startGame(difficulty) {
    score = 0;
    questionCount = 0;
    currentDifficulty = difficulty; 

    // Filter shortcuts
    let filtered = shortcuts.filter(s => s.difficulty.toLowerCase() === difficulty);
    
    // If list is too small
    if (filtered.length < totalQuestions) {
         console.warn(`Warning: Not enough questions for ${difficulty}. Repeating questions.`);
         // If no questions at all, use 'easy' as fallback
         if(filtered.length === 0) {
            console.error(`No questions found for ${difficulty}, defaulting to 'easy'.`);
            filtered = shortcuts.filter(s => s.difficulty.toLowerCase() === 'easy');
         }
         // Fill up the list by repeating
         let i = 0;
         while(filtered.length < totalQuestions && filtered.length > 0) {
            filtered.push(filtered[i % filtered.length]);
            i++;
         }
    }
    
    // 1. Shuffle the ENTIRE filtered list first
    for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    
    // 2. THEN, take the first 10 questions
    quizShortcuts = filtered.slice(0, totalQuestions);
    
    // Show/Hide screens
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
        
        // Use the 'name' field directly, which now excludes the category
        questionEl.textContent = currentQuestion.name;
        
        answerEl.textContent = '';
        answerEl.className = '';
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
    
    // Hide upsell button by default
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
    
    // Upsell logic
    if (currentDifficulty === 'easy' && score >= 8) {
        btnTryHard.classList.remove('hidden');
    }
}

function resetGame() {
    stopTimer();
    resultsContainer.classList.add('hidden');
    quizContainer.classList.add('hidden');
    quizHeader.classList.add('hidden');
    welcomeContainer.classList.remove('hidden');
    progressBar.style.width = '0%'; 
    body.classList.add('diagonal-bg'); 
}

// --- Helper function to show answer ---
function formatKey(key) {
    if (key === 'metaKey') return (currentOS === 'mac') ? '⌘' : 'Ctrl';
    if (key === 'ctrlKey') return 'Ctrl';
    if (key === 'shiftKey') return '⇧';
    if (key === 'altKey') return (currentOS === 'mac') ? '⌥' : 'Alt';
    if (key === 'escape') return 'Esc';
    if (key === 'enter') return '↩';
    if (key === 'backspace') return (currentOS ==='mac') ? '⌫' : 'Backspace'; // Updated
    if (key === 'delete') return 'Del'; // Updated
    if (key === 'pageup') return 'Page Up'; // Updated
    if (key === 'pagedown') return 'Page Down'; // Updated
    if (key === 'home') return 'Home'; // Updated
    if (key === 'end') return 'End'; // Updated
    if (key === 'tab') return 'Tab';
    if (key === 'space') return 'Space';
    if (key === '=') return '+'; // Handle the zoom-in key
    return key.toUpperCase();
}

function formatKeys(keys) {
    // Special case for "0+0"
    if (keys.join('') === '00') return '0 + 0';
    return keys.map(formatKey).join(' + ');
}

// --- Function to handle reveal logic ---
function revealAnswer() {
    btnReveal.classList.add('hidden');
    const answerKeys = currentQuestion[currentOS];
    const formattedAnswer = formatKeys(answerKeys);
    answerEl.textContent = `Correct: ${formattedAnswer}`;
    answerEl.className = 'info'; 
    btnOK.classList.remove('hidden'); 
    
    questionCount++;
}

// --- Function to handle "OK" click ---
function handleOKClick() {
    btnOK.classList.add('hidden');
    
    if (questionCount < totalQuestions) {
        getNewQuestion();
    } else {
        progressBar.style.width = '100%'; 
        showResults();
    }
}

// Separate functions for correct/incorrect
function handleCorrectAnswer() {
    stopTimer();
    score++;
    answerEl.textContent = 'Correct!';
    answerEl.className = 'correct';
    scoreDisplay.classList.add('score-update');
    setTimeout(() => scoreDisplay.classList.remove('score-update'), 400);
    
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

// --- 5. The Key Listener ---
document.addEventListener('keydown', function(e) {
    const modifierKeys = ["Control", "Shift", "Alt", "Meta"];
    
    if (quizContainer.classList.contains('hidden') || isChecking) {
        return;
    }

    // Don't prevent default for modifiers, but return
    if (modifierKeys.includes(e.key)) {
        return;
    }
    
    // Check for empty question (edge case)
    if (!currentQuestion || !currentQuestion[currentOS]) {
        console.error("No current question loaded.");
        return;
    }

    e.preventDefault();
    
    const correctAnswer = currentQuestion[currentOS];
    let isCorrect = true;

    // --- Special Case: "0+0" for opacity ---
    if (correctAnswer.join('') === '00') {
        if (e.key === '0' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
            keyPressHistory.push('0');
            if (keyPressHistory.length === 2) {
                isChecking = true;
                handleCorrectAnswer();
            }
            // If it's just the first '0', don't do anything yet
        } else {
            // Wrong key pressed during "0+0"
            isChecking = true;
            handleIncorrectAnswer();
        }
        return; // Exit listener
    }
    // --- End Special Case ---

    // If not special case, lock checking immediately
    isChecking = true; 
    
    // Get the main (non-modifier) key from the answer
    const mainKey = correctAnswer.find(k => !['metaKey', 'ctrlKey', 'shiftKey', 'altKey'].includes(k));

    // Check main key
    if (mainKey && mainKey.toLowerCase() !== e.key.toLowerCase()) {
        let keyMatch = false;
         
        // Special check for '+' key which is '='
        if (mainKey === '=' && e.key === '+') {
            keyMatch = true;
        }
        // Special check for 'Space'
        else if (mainKey === 'space' && e.code === 'Space') {
            keyMatch = true;
        }
        
        if (!keyMatch) {
            isCorrect = false;
        }

    } else if (!mainKey) {
         // Handle shortcuts that are ONLY modifiers (e.g., "Alt")
         isCorrect = true; // Assume true, modifiers check will finalize
    }
    
    // Check modifier keys
    if (correctAnswer.includes('metaKey') !== e.metaKey) isCorrect = false;
    if (correctAnswer.includes('ctrlKey') !== e.ctrlKey) isCorrect = false;
    if (correctAnswer.includes('shiftKey') !== e.shiftKey) isCorrect = false;
    if (correctAnswer.includes('altKey') !== e.altKey) isCorrect = false;
    
    // --- 6. Show Feedback ---
    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }
});

// --- 7. Button Event Listeners ---

// Difficulty Buttons
difficultyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const difficulty = e.target.dataset.difficulty;
        startGame(difficulty);
    });
});

// Results
btnPlayAgain.addEventListener('click', resetGame);

// Upsell button listener
btnTryHard.addEventListener('click', () => {
    startGame('hard');
});

// Header Nav
btnRetake.addEventListener('click', (e) => {
    e.preventDefault(); 
    if (currentDifficulty) { // Only retake if a difficulty was chosen
        startGame(currentDifficulty); 
    }
});

// NEW: ENHANCED HELP BUTTON
btnHelp.addEventListener('click', (e) => {
    e.preventDefault();
    // Use \n to create new lines in an alert
    alert(
        "--- Game Rules ---\n\n" +
        "1. Press the key combination for the action shown.\n" +
        "2. You have 15 seconds for each question.\n" +
        "3. Get a Gold (10) or Silver (8+) medal on Easy to unlock the 'Try Hard' challenge!\n\n" +
        "--- Disclaimer ---\n" +
        "This game is a fan project and is not affiliated with Figma. The shortcut list is based on community data and might be prone to errors.\n\n" +
        "--- Feedback ---\n" +
        "For any improvements or bugs, please email:\n" +
        "dominic.intel@gmail.com"
    );
});

btnExit.addEventListener('click', (e) => {
    e.preventDefault();
    resetGame(); 
});

// Quiz
btnReveal.addEventListener('click', revealAnswer); 
btnOK.addEventListener('click', handleOKClick); 

// --- 8. Start the App ---

// NEW: Check for mobile device on load
if (window.innerWidth <= 768) { 
    // This is a common breakpoint for tablets and phones
    
    alert("This site is only for desktop.");

    // We can also hide the game to prevent it from being used
    document.getElementById('app-container').style.display = 'none';
} else {
    // If on desktop, start the game normally
    resetGame();
}
resetGame();
