const board = document.querySelector(".board");
const startBtn = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartBtn = document.querySelector(".btn-restart");

const highScoreEl = document.querySelector("#high-score");
const scoreEl = document.querySelector("#score");
const timeEl = document.querySelector("#time");

const blockHeight = 50;
const blockWidth = 50;

let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let score = 0;
let time = `00:00`;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let intervalId = null;
let timerIntervalId = null;

let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

const blocks = [];
let snack = [
  {
    x: 1,
    y: 3,
  },
];
let direction = "right";

// for (let i = 0; i < rows * cols; i++) {
//   const block = document.createElement("div");
//   block.classList.add("block");
//   board.appendChild(block);
// }

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${row},${col}`] = block;
  }
}

function renderSnack() {
  let head = null;

  blocks[`${food.x},${food.y}`].classList.add("food");

  if (direction === "left") {
    head = { x: snack[0].x, y: snack[0].y - 1 };
  } else if (direction === "right") {
    head = { x: snack[0].x, y: snack[0].y + 1 };
  } else if (direction === "down") {
    head = { x: snack[0].x + 1, y: snack[0].y };
  } else if (direction === "up") {
    head = { x: snack[0].x - 1, y: snack[0].y };
  }

  //Collision detection logic
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    clearInterval(intervalId);

    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";

    return;
  }

  //Food consumption logic
  if (head.x === food.x && head.y === food.y) {
    blocks[`${food.x},${food.y}`].classList.remove("food");
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
    blocks[`${food.x},${food.y}`].classList.add("food");
    snack.unshift(head);

    score += 10;
    scoreEl.textContent = score;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore.toString());
      highScoreEl.textContent = highScore;
    }
  }

  snack.forEach((segment) => {
    blocks[`${segment.x},${segment.y}`].classList.remove("fill");
  });

  snack.unshift(head);
  snack.pop();
  snack.forEach((segment) => {
    blocks[`${segment.x},${segment.y}`].classList.add("fill");
  });
}

startBtn.addEventListener("click", () => {
  modal.style.display = "none";
  intervalId = setInterval(() => {
    renderSnack();
  }, 300);
  timerIntervalId = setInterval(() => {
    let [mins, secs] = time.split(":").map(Number);
    if (secs === 59) {
      mins++;
      secs = 0;
    } else {
      secs++;
    }

    time = `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
    timeEl.textContent = time;
  }, 1000);
});

restartBtn.addEventListener("click", restartGame);

function restartGame() {
  score = 0;
  scoreEl.textContent = score;
  time = `00:00`;
  timeEl.textContent = time;
  highScoreEl.textContent = highScore;

  blocks[`${food.x},${food.y}`].classList.remove("food");
  snack.forEach((segment) => {
    blocks[`${segment.x},${segment.y}`].classList.remove("fill");
  });
  direction = "down";

  modal.style.display = "none";
  snack = [{ x: 1, y: 3 }];
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
  intervalId = setInterval(() => {
    renderSnack();
  }, 300);
}

// function updateTime() {
//   let [mins, secs] = time.split(":").map(Number);
//   secs++;

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    direction = "up";
  } else if (e.key === "ArrowRight") {
    direction = "right";
  } else if (e.key === "ArrowLeft") {
    direction = "left";
  } else if (e.key === "ArrowDown") {
    direction = "down";
  }
});
