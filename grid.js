const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let mouse = { x: -9999, y: -9999 };
const squareSize = 40;
const grid = [];
let cols = 0;
let rows = 0;

function initGrid() {
  grid.length = 0;
  cols = Math.ceil(width / squareSize);
  rows = Math.ceil(height / squareSize);
  
  for (let x = 0; x < width; x += squareSize) {
    for (let y = 0; y < height; y += squareSize) {
      grid.push({
        x,
        y,
        alpha: 0,
        fading: false,
        lastTouched: 0,
      });
    }
  }
}

function getCellAt(x, y) {
  const col = Math.floor(x / squareSize);
  const row = Math.floor(y / squareSize);
  if (col >= 0 && col < cols && row >= 0 && row < rows) {
    return grid[col * rows + row];
  }
  return null;
}

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initGrid();
});

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  const cell = getCellAt(mouse.x, mouse.y);
  if (cell && cell.alpha === 0) {
    cell.alpha = 1;
    cell.lastTouched = Date.now();
    cell.fading = false;
  }
});

window.addEventListener("touchmove", (e) => {
  if (e.touches.length > 0) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;

    const cell = getCellAt(mouse.x, mouse.y);
    if (cell && cell.alpha === 0) {
      cell.alpha = 1;
      cell.lastTouched = Date.now();
      cell.fading = false;
    }
  }
});

function drawGrid() {
  ctx.clearRect(0, 0, width, height);
  const now = Date.now();

  for (let i = 0; i < grid.length; i++) {
    const cell = grid[i];

    if (cell.alpha > 0 && !cell.fading && now - cell.lastTouched > 500) {
      cell.fading = true;
    }

    if (cell.fading) {
      cell.alpha -= 0.02;
      if (cell.alpha <= 0) {
        cell.alpha = 0;
        cell.fading = false;
      }
    }

    if (cell.alpha > 0) {
      const centerX = cell.x + squareSize / 2;
      const centerY = cell.y + squareSize / 2;

      const gradient = ctx.createRadialGradient(
        centerX, centerY, 2,
        centerX, centerY, squareSize
      );
      gradient.addColorStop(0, `rgba(0, 255, 204, ${cell.alpha})`);
      gradient.addColorStop(1, `rgba(0, 255, 204, 0)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.0;
      ctx.strokeRect(cell.x + 0.5, cell.y + 0.5, squareSize - 1, squareSize - 1);
    }
  }

  requestAnimationFrame(drawGrid);
}

initGrid();
drawGrid();
