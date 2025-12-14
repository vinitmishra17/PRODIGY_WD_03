const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");

let currentPlayer = "X";
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let aiDifficulty = "easy";
let isAIMode = true;

const winningConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// ===== AI Logic =====
function getEmptyCells() {
  return gameState.map((cell, index) => cell === "" ? index : null).filter(val => val !== null);
}

function aiMove() {
  if (!gameActive || currentPlayer !== "O") return;
  
  let move;
  
  if (aiDifficulty === "easy") {
    move = getRandomMove();
  } else if (aiDifficulty === "medium") {
    move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
  } else {
    move = getBestMove();
  }
  
  if (move !== null) {
    setTimeout(() => {
      gameState[move] = "O";
      const cell = cells[move];
      cell.textContent = "O";
      cell.classList.add("o");
      checkResult();
    }, 500);
  }
}

function getRandomMove() {
  const emptyCells = getEmptyCells();
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getBestMove() {
  // Check if AI can win
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (gameState[a] === "O" && gameState[b] === "O" && gameState[c] === "") return c;
    if (gameState[a] === "O" && gameState[c] === "O" && gameState[b] === "") return b;
    if (gameState[b] === "O" && gameState[c] === "O" && gameState[a] === "") return a;
  }
  
  // Block player from winning
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (gameState[a] === "X" && gameState[b] === "X" && gameState[c] === "") return c;
    if (gameState[a] === "X" && gameState[c] === "X" && gameState[b] === "") return b;
    if (gameState[b] === "X" && gameState[c] === "X" && gameState[a] === "") return a;
  }
  
  // Take center if available
  if (gameState[4] === "") return 4;
  
  // Take corners
  const corners = [0, 2, 6, 8].filter(i => gameState[i] === "");
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
  
  // Take any remaining cell
  return getRandomMove();
}

function handleCellClick(e) {
  const index = e.target.getAttribute("data-index");

  if (gameState[index] !== "" || !gameActive || currentPlayer !== "X") return;

  gameState[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add(currentPlayer.toLowerCase());

  checkResult();
  
  if (gameActive && isAIMode) {
    currentPlayer = "O";
    aiMove();
  }
}

function checkResult() {
  let roundWon = false;

  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (
      gameState[a] &&
      gameState[a] === gameState[b] &&
      gameState[a] === gameState[c]
    ) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    statusText.textContent = `Player ${currentPlayer} Wins! 🎉`;
    gameActive = false;
    return;
  }

  if (!gameState.includes("")) {
    statusText.textContent = "It's a Draw!";
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function restartGame() {
  currentPlayer = "X";
  gameActive = true;
  gameState = ["", "", "", "", "", "", "", "", ""];
  statusText.textContent = "Player X's turn";
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("x", "o");
  });
}

// ===== Difficulty Selection =====
difficultyBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    difficultyBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    aiDifficulty = btn.getAttribute("data-difficulty");
    restartGame();
  });
});

// ===== Event Listeners =====
cells.forEach(cell => cell.addEventListener("click", handleCellClick));
restartBtn.addEventListener("click", restartGame);
