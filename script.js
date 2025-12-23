const board = document.querySelector(".board");
const blockHeight = 50;
const blockWidth = 50;
const blocks = [];
const snack = [
  {
    x: 1,
    y: 3,
  },
];
let direction = "right";

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);
let intervalId = null;

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
    block.textContent = `${row}-${col}`;
    blocks[`${row},${col}`] = block;
  }
}

function renderSnack() {
  snack.forEach((segment) => {
    blocks[`${segment.x},${segment.y}`].classList.add("fill");
  });
}

intervalId = setInterval(() => {
  let head = null;
  if (direction === "left") {
    head = { x: snack[0].x, y: snack[0].y - 1 };
  } else if (direction === "right") {
    head = { x: snack[0].x, y: snack[0].y + 1 };
  } else if (direction === "down") {
    head = { x: snack[0].x + 1, y: snack[0].y };
  } else if (direction === "up") {
    head = { x: snack[0].x - 1, y: snack[0].y };
  }

  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    alert("Game Over");
    clearInterval(intervalId);
  }

  snack.forEach((segment) => {
    blocks[`${segment.x},${segment.y}`].classList.remove("fill");
  });

  snack.unshift(head);
  snack.pop();

  renderSnack();
}, 300);

addEventListener("keydown", (e) => {
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
