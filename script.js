// ===== Game State =====
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let scores = { x: 0, o: 0, ties: 0 };
let stats = { totalGames: 0, xWins: 0, oWins: 0, totalTies: 0 };
let settings = {
    playerXName: 'Player X',
    playerOName: 'Player O',
    soundEnabled: true,
    animationEnabled: true
};

// Winning combinations
const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// ===== DOM Elements =====
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status-text');
const currentIcon = document.getElementById('current-icon');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const scoreTiesElement = document.getElementById('score-ties');
const resetBtn = document.getElementById('reset-btn');
const newGameBtn = document.getElementById('new-game-btn');
const winModal = document.getElementById('win-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalIcon = document.getElementById('modal-icon');
const modalClose = document.getElementById('modal-close');
const modalPlayAgain = document.getElementById('modal-play-again');
const winningLine = document.getElementById('winning-line');

// Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

// Stats
const totalGamesElement = document.getElementById('total-games');
const xWinsElement = document.getElementById('x-wins');
const oWinsElement = document.getElementById('o-wins');
const totalTiesElement = document.getElementById('total-ties');
const resetStatsBtn = document.getElementById('reset-stats-btn');

// Settings
const playerXInput = document.getElementById('player-x-input');
const playerOInput = document.getElementById('player-o-input');
const soundToggle = document.getElementById('sound-toggle');
const animationToggle = document.getElementById('animation-toggle');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const playerXName = document.getElementById('player-x-name');
const playerOName = document.getElementById('player-o-name');

// ===== Initialize Game =====
function init() {
    loadSettings();
    loadScores();
    loadStats();
    updateDisplay();
    attachEventListeners();
}

// ===== Event Listeners =====
function attachEventListeners() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    resetBtn.addEventListener('click', resetGame);
    newGameBtn.addEventListener('click', newGame);
    modalClose.addEventListener('click', closeModal);
    modalPlayAgain.addEventListener('click', () => {
        closeModal();
        newGame();
    });

    // Navigation
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            switchView(view);
        });
    });

    // Stats
    resetStatsBtn.addEventListener('click', resetStats);

    // Settings
    saveSettingsBtn.addEventListener('click', saveSettings);
}

// ===== Game Logic =====
function handleCellClick(e) {
    const cell = e.target;
    const index = cell.getAttribute('data-index');

    if (board[index] !== '' || !gameActive) return;

    board[index] = currentPlayer;
    cell.textContent = currentPlayer === 'X' ? '✕' : '◯';
    cell.classList.add(currentPlayer.toLowerCase());
    
    if (settings.animationEnabled) {
        cell.style.animation = 'none';
        setTimeout(() => {
            cell.style.animation = '';
        }, 10);
    }

    if (checkWin()) {
        handleWin();
    } else if (board.every(cell => cell !== '')) {
        handleTie();
    } else {
        switchPlayer();
    }
}

function checkWin() {
    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            drawWinningLine(pattern);
            return true;
        }
        return false;
    });
}

function drawWinningLine(pattern) {
    const boardElement = document.getElementById('game-board');
    const boardRect = boardElement.getBoundingClientRect();
    const cellSize = boardRect.width / 3;
    
    const [a, b, c] = pattern;
    const startCell = cells[a].getBoundingClientRect();
    const endCell = cells[c].getBoundingClientRect();
    
    const startX = startCell.left - boardRect.left + startCell.width / 2;
    const startY = startCell.top - boardRect.top + startCell.height / 2;
    const endX = endCell.left - boardRect.left + endCell.width / 2;
    const endY = endCell.top - boardRect.top + endCell.height / 2;
    
    const line = winningLine.querySelector('line');
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', endX);
    line.setAttribute('y2', endY);
    
    winningLine.classList.add('show');
}

function handleWin() {
    gameActive = false;
    const winner = currentPlayer;
    const winnerName = winner === 'X' ? settings.playerXName : settings.playerOName;
    
    if (winner === 'X') {
        scores.x++;
        stats.xWins++;
    } else {
        scores.o++;
        stats.oWins++;
    }
    stats.totalGames++;
    
    saveScores();
    saveStats();
    updateDisplay();
    
    setTimeout(() => {
        showModal(
            '🎉',
            `${winnerName} Wins!`,
            'Congratulations on your victory!'
        );
    }, 600);
}

function handleTie() {
    gameActive = false;
    scores.ties++;
    stats.totalTies++;
    stats.totalGames++;
    
    saveScores();
    saveStats();
    updateDisplay();
    
    setTimeout(() => {
        showModal(
            '🤝',
            "It's a Tie!",
            'Well played by both players!'
        );
    }, 300);
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
}

function updateStatus() {
    const playerName = currentPlayer === 'X' ? settings.playerXName : settings.playerOName;
    statusText.textContent = `${playerName}'s Turn`;
    currentIcon.textContent = currentPlayer === 'X' ? '✕' : '◯';
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'disabled');
    });
    
    winningLine.classList.remove('show');
    updateStatus();
}

function newGame() {
    resetGame();
    closeModal();
}

// ===== Modal =====
function showModal(icon, title, message) {
    modalIcon.textContent = icon;
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    winModal.classList.add('show');
}

function closeModal() {
    winModal.classList.remove('show');
}

// ===== Display Updates =====
function updateDisplay() {
    scoreXElement.textContent = scores.x;
    scoreOElement.textContent = scores.o;
    scoreTiesElement.textContent = scores.ties;
    
    totalGamesElement.textContent = stats.totalGames;
    xWinsElement.textContent = stats.xWins;
    oWinsElement.textContent = stats.oWins;
    totalTiesElement.textContent = stats.totalTies;
    
    playerXName.textContent = settings.playerXName;
    playerOName.textContent = settings.playerOName;
    
    updateStatus();
}

// ===== Navigation =====
function switchView(viewName) {
    navBtns.forEach(btn => btn.classList.remove('active'));
    views.forEach(view => view.classList.remove('active'));
    
    const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
    const activeView = document.getElementById(`${viewName}-view`);
    
    if (activeBtn && activeView) {
        activeBtn.classList.add('active');
        activeView.classList.add('active');
    }
}

// ===== Stats =====
function resetStats() {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
        stats = { totalGames: 0, xWins: 0, oWins: 0, totalTies: 0 };
        scores = { x: 0, o: 0, ties: 0 };
        saveStats();
        saveScores();
        updateDisplay();
    }
}

// ===== Settings =====
function saveSettings() {
    const xName = playerXInput.value.trim();
    const oName = playerOInput.value.trim();
    
    if (xName) settings.playerXName = xName;
    if (oName) settings.playerOName = oName;
    
    settings.soundEnabled = soundToggle.checked;
    settings.animationEnabled = animationToggle.checked;
    
    localStorage.setItem('ticTacToeSettings', JSON.stringify(settings));
    updateDisplay();
    
    // Show success feedback
    saveSettingsBtn.textContent = 'Saved! ✓';
    saveSettingsBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    
    setTimeout(() => {
        saveSettingsBtn.textContent = 'Save Settings';
        saveSettingsBtn.style.background = '';
    }, 2000);
}

function loadSettings() {
    const saved = localStorage.getItem('ticTacToeSettings');
    if (saved) {
        settings = JSON.parse(saved);
        playerXInput.value = settings.playerXName;
        playerOInput.value = settings.playerOName;
        soundToggle.checked = settings.soundEnabled;
        animationToggle.checked = settings.animationEnabled;
    }
}

// ===== Local Storage =====
function saveScores() {
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
}

function loadScores() {
    const saved = localStorage.getItem('ticTacToeScores');
    if (saved) {
        scores = JSON.parse(saved);
    }
}

function saveStats() {
    localStorage.setItem('ticTacToeStats', JSON.stringify(stats));
}

function loadStats() {
    const saved = localStorage.getItem('ticTacToeStats');
    if (saved) {
        stats = JSON.parse(saved);
    }
}

// ===== Initialize on Load =====
document.addEventListener('DOMContentLoaded', init);

// ===== Close modal when clicking overlay =====
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});

// ===== Keyboard shortcuts =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
    if (e.key === 'r' || e.key === 'R') {
        resetGame();
    }
    if (e.key === 'n' || e.key === 'N') {
        newGame();
    }
});
