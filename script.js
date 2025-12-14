// ===== DOM Elements =====
const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("statusText");
const statusIcon = document.getElementById("statusIcon");
const restartBtn = document.getElementById("restartBtn");
const resetBtn = document.getElementById("resetBtn");
const winModal = document.getElementById("winModal");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalIcon = document.getElementById("modalIcon");
const modalClose = document.getElementById("modalClose");
const modalPlayAgain = document.getElementById("modalPlayAgain");
const winLine = document.getElementById("winLine");
const scoreXElement = document.getElementById("scoreX");
const scoreOElement = document.getElementById("scoreO");
const scoreTieElement = document.getElementById("scoreTie");
const canvas = document.getElementById("particles-canvas");
const ctx = canvas.getContext("2d");

// ===== Game State =====
let currentPlayer = "X";
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let scores = { x: 0, o: 0, tie: 0 };

const winningConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// ===== Particles Setup =====
let particles = [];

function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
    this.opacity = Math.random() * 0.5 + 0.2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    if (this.y < 0) this.y = canvas.height;
  }

  draw() {
    ctx.fillStyle = `rgba(168, 85, 247, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });
  requestAnimationFrame(animateParticles);
}

// ===== Confetti Effect =====
function createConfetti() {
  const colors = ['#a855f7', '#ec4899', '#06b6d4', '#3b82f6', '#f97316'];
  const confettiCount = 60;
  
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = Math.random() * 12 + 5 + 'px';
      confetti.style.height = Math.random() * 12 + 5 + 'px';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-20px';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      confetti.style.opacity = '1';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.boxShadow = `0 0 15px ${colors[Math.floor(Math.random() * colors.length)]}`;
      
      document.body.appendChild(confetti);
      
      const duration = Math.random() * 3000 + 2500;
      const endX = parseFloat(confetti.style.left) + (Math.random() - 0.5) * 300;
      const rotation = Math.random() * 720;
      
      confetti.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${window.innerHeight + 50}px) translateX(${endX - parseFloat(confetti.style.left)}px) rotate(${rotation}deg)`, opacity: 0 }
      ], {
        duration: duration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => confetti.remove();
    }, i * 25);
  }
}

// ===== Game Logic =====

function handleCellClick(e) {
  const cell = e.target.closest('.cell');
  if (!cell) return;
  
  const index = cell.getAttribute("data-index");

  if (gameState[index] !== "" || !gameActive) return;

  gameState[index] = currentPlayer;
  cell.textContent = currentPlayer === 'X' ? '✕' : '◯';
  cell.classList.add(currentPlayer.toLowerCase());

  createCellParticles(cell);
  checkResult();
}

function createCellParticles(cell) {
  const rect = cell.getBoundingClientRect();
  const colors = currentPlayer === 'X' 
    ? ['#06b6d4', '#3b82f6'] 
    : ['#a855f7', '#ec4899'];
  
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = Math.random() * 8 + 4 + 'px';
    particle.style.height = particle.style.width;
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.borderRadius = '50%';
    particle.style.left = rect.left + rect.width / 2 + 'px';
    particle.style.top = rect.top + rect.height / 2 + 'px';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    particle.style.boxShadow = `0 0 10px ${colors[0]}`;
    
    document.body.appendChild(particle);
    
    const angle = (Math.PI * 2 * i) / 15;
    const velocity = Math.random() * 60 + 40;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;
    
    particle.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
    ], {
      duration: 1200,
      easing: 'cubic-bezier(0, .9, .57, 1)'
    }).onfinish = () => particle.remove();
  }
}

function drawWinLine(pattern) {
  const boardRect = board.getBoundingClientRect();
  const [a, b, c] = pattern;
  
  const startCell = cells[a].getBoundingClientRect();
  const endCell = cells[c].getBoundingClientRect();
  
  const startX = startCell.left - boardRect.left + startCell.width / 2;
  const startY = startCell.top - boardRect.top + startCell.height / 2;
  const endX = endCell.left - boardRect.left + endCell.width / 2;
  const endY = endCell.top - boardRect.top + endCell.height / 2;
  
  const line = winLine.querySelector('line');
  line.setAttribute('x1', startX);
  line.setAttribute('y1', startY);
  line.setAttribute('x2', endX);
  line.setAttribute('y2', endY);
  
  winLine.classList.add('show');
}

function checkResult() {
  let roundWon = false;
  let winPattern = null;

  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (
      gameState[a] &&
      gameState[a] === gameState[b] &&
      gameState[a] === gameState[c]
    ) {
      roundWon = true;
      winPattern = condition;
      break;
    }
  }

  if (roundWon) {
    gameActive = false;
    if (currentPlayer === 'X') {
      scores.x++;
    } else {
      scores.o++;
    }
    updateScores();
    drawWinLine(winPattern);
    createConfetti();
    
    setTimeout(() => {
      modalIcon.textContent = '🎉';
      modalTitle.textContent = `Player ${currentPlayer} Wins!`;
      modalSubtitle.textContent = 'Congratulations on your victory!';
      winModal.classList.add('show');
    }, 600);
    return;
  }

  if (!gameState.includes("")) {
    gameActive = false;
    scores.tie++;
    updateScores();
    
    setTimeout(() => {
      modalIcon.textContent = '🤝';
      modalTitle.textContent = "It's a Tie!";
      modalSubtitle.textContent = 'Well played by both players!';
      winModal.classList.add('show');
    }, 300);
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
  statusIcon.textContent = currentPlayer === 'X' ? '✕' : '◯';
}

function updateScores() {
  scoreXElement.textContent = scores.x;
  scoreOElement.textContent = scores.o;
  scoreTieElement.textContent = scores.tie;
}

function restartGame() {
  currentPlayer = "X";
  gameActive = true;
  gameState = ["", "", "", "", "", "", "", "", ""];
  statusText.textContent = "Player X's turn";
  statusIcon.textContent = '✕';
  winLine.classList.remove('show');
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("x", "o");
  });
}

function resetGame() {
  restartGame();
  scores = { x: 0, o: 0, tie: 0 };
  updateScores();
}

function closeModal() {
  winModal.classList.remove('show');
}

// ===== Event Listeners =====
cells.forEach(cell => cell.addEventListener("click", handleCellClick));
restartBtn.addEventListener("click", restartGame);
resetBtn.addEventListener("click", resetGame);
modalClose.addEventListener("click", closeModal);
modalPlayAgain.addEventListener("click", () => {
  closeModal();
  restartGame();
});

window.addEventListener('resize', setupCanvas);

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal();
  }
});

// ===== Initialize =====
setupCanvas();
initParticles();
animateParticles();
updateScores();
