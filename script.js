const board = document.querySelector(".board");
const startBtn = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartBtn = document.querySelector(".btn-restart");

const highScoreEl = document.querySelector("#high-score");
const scoreEl = document.querySelector("#score");
const timeEl = document.querySelector("#time");

/* ------------------ GAME STATE ------------------ */

let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let score = 0;
let time = "00:00";

let intervalId = null;
let timerIntervalId = null;

let direction = "right";
let snack = [{ x: 1, y: 3 }];
let food;

const blocks = [];

let cols, rows;
let blockSize;

/* ------------------ CONFIG ------------------ */

const isMobile = window.innerWidth < 768;
const speed = isMobile ? 350 : 300;

/* ------------------ GRID ------------------ */

function getBlockSize() {
  const minScreen = Math.min(window.innerWidth, window.innerHeight);
  if (minScreen < 400) return 22;
  if (minScreen < 768) return 28;
  if (minScreen < 1024) return 36;
  return 50;
}

function buildGrid() {
  board.innerHTML = "";
  blocks.length = 0;

  blockSize = getBlockSize();
  cols = Math.floor(board.clientWidth / blockSize);
  rows = Math.floor(board.clientHeight / blockSize);

  board.style.gridTemplateColumns = `repeat(${cols}, ${blockSize}px)`;
  board.style.gridTemplateRows = `repeat(${rows}, ${blockSize}px)`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const block = document.createElement("div");
      block.classList.add("block");
      board.appendChild(block);
      blocks[`${r},${c}`] = block;
    }
  }
}

/* ------------------ FOOD ------------------ */

function generateFood() {
  return {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
}

/* ------------------ RENDER ------------------ */

function renderSnack() {
  // Draw food
  const foodBlock = blocks[`${food.x},${food.y}`];
  if (foodBlock) foodBlock.classList.add("food");

  // Calculate new head
  let head;
  if (direction === "left") head = { x: snack[0].x, y: snack[0].y - 1 };
  if (direction === "right") head = { x: snack[0].x, y: snack[0].y + 1 };
  if (direction === "up") head = { x: snack[0].x - 1, y: snack[0].y };
  if (direction === "down") head = { x: snack[0].x + 1, y: snack[0].y };

  // Wall collision
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    gameOver();
    return;
  }

  // Self collision
  if (snack.some((seg) => seg.x === head.x && seg.y === head.y)) {
    gameOver();
    return;
  }

  // Add new head
  snack.unshift(head);

  // Food eaten?
  if (head.x === food.x && head.y === food.y) {
    if (foodBlock) foodBlock.classList.remove("food");
    food = generateFood();

    score += 10;
    scoreEl.textContent = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreEl.textContent = highScore;
    }
  } else {
    // Remove tail
    const tail = snack.pop();
    const tailBlock = blocks[`${tail.x},${tail.y}`];
    if (tailBlock) tailBlock.classList.remove("fill");
  }

  // Draw snake
  snack.forEach((seg) => {
    const block = blocks[`${seg.x},${seg.y}`];
    if (block) block.classList.add("fill");
  });
}

/* ------------------ GAME CONTROL ------------------ */

function startGame() {
  modal.style.display = "none";
  intervalId = setInterval(renderSnack, speed);

  timerIntervalId = setInterval(() => {
    let [m, s] = time.split(":").map(Number);
    s++;
    if (s === 60) {
      m++;
      s = 0;
    }
    time = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    timeEl.textContent = time;
  }, 1000);
}

function gameOver() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);

  modal.style.display = "flex";
  startGameModal.style.display = "none";
  gameOverModal.style.display = "flex";
}

function restartGame() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);

  const oldFoodBlock = blocks[`${food.x},${food.y}`];
  if (oldFoodBlock) oldFoodBlock.classList.remove("food");

  snack.forEach((seg) => {
    const block = blocks[`${seg.x},${seg.y}`];
    if (block) block.classList.remove("fill");
  });

  score = 0;
  time = "00:00";
  scoreEl.textContent = score;
  timeEl.textContent = time;
  highScoreEl.textContent = highScore;

  direction = "right";
  snack = [{ x: 1, y: 3 }];
  food = generateFood();

  modal.style.display = "none";
  startGame();
}

/* ------------------ INPUT ------------------ */

function feedback() {
  board.classList.add("flash");
  setTimeout(() => board.classList.remove("flash"), 200);

  if (navigator.vibrate) {
    navigator.vibrate(30);
  }
}

// Keyboard
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && direction !== "down") {
    direction = "up";
    feedback();
  }
  if (e.key === "ArrowDown" && direction !== "up") {
    direction = "down";
    feedback();
  }
  if (e.key === "ArrowLeft" && direction !== "right") {
    direction = "left";
    feedback();
  }
  if (e.key === "ArrowRight" && direction !== "left") {
    direction = "right";
    feedback();
  }
});

// Swipe (mobile)
let sx = 0,
  sy = 0;
board.addEventListener(
  "touchstart",
  (e) => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  },
  { passive: false }
);

board.addEventListener("touchmove", (e) => e.preventDefault(), {
  passive: false,
});

board.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - sx;
  const dy = e.changedTouches[0].clientY - sy;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30 && direction !== "left") {
      direction = "right";
      feedback();
    }
    if (dx < -30 && direction !== "right") {
      direction = "left";
      feedback();
    }
  } else {
    if (dy > 30 && direction !== "up") {
      direction = "down";
      feedback();
    }
    if (dy < -30 && direction !== "down") {
      direction = "up";
      feedback();
    }
  }
});

/* ------------------ EVENTS ------------------ */

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

window.addEventListener("resize", () => {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);
  buildGrid();
  restartGame();
});

/* ------------------ INIT ------------------ */

highScoreEl.textContent = highScore;
buildGrid();
food = generateFood();
