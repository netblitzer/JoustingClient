const keys = {
  e: false,
  space: false,
  left: false,
  right: false,
  up: false,
  down: false,
  shift: false,
  esc: false,
  mouse1: false,
  mouse2: false,
  mouse1double: false,
  mouse2double: false,
};

// const m1last = 0;
// const m2last = 0;
// const lastClicked = '';


const keyDownHandler = (e) => {
  const keyPressed = e.which;

  if (keyPressed === 87 || keyPressed === 38) {
    // W OR UP
    keys.up = true;
  } else if (keyPressed === 65 || keyPressed === 37) {
    // A OR LEFT
    keys.left = true;
  } else if (keyPressed === 83 || keyPressed === 40) {
    // S OR DOWN
    keys.down = true;
  } else if (keyPressed === 68 || keyPressed === 39) {
    // D OR RIGHT
    keys.right = true;
  } else if (keyPressed === 32) {
    // SPACE
    keys.space = true;
  } else if (keyPressed === 16) {
    // SHIFT
    keys.shift = true;
  } else if (keyPressed === 27) {
    // ESC
    keys.esc = true;
  } else if (keyPressed === 69) {
    // E
    keys.e = true;
  }

  e.preventDefault();
};

const keyUpHandler = (e) => {
  const keyPressed = e.which;

  if (keyPressed === 87 || keyPressed === 38) {
    // W OR UP
    keys.up = false;
  } else if (keyPressed === 65 || keyPressed === 37) {
    // A OR LEFT
    keys.left = false;
  } else if (keyPressed === 83 || keyPressed === 40) {
    // S OR DOWN
    keys.down = false;
  } else if (keyPressed === 68 || keyPressed === 39) {
    // D OR RIGHT
    keys.right = false;
  } else if (keyPressed === 32) {
    // SPACE
    keys.space = false;
  } else if (keyPressed === 16) {
    // SHIFT
    keys.shift = false;
  } else if (keyPressed === 27) {
    // ESC
    keys.esc = false;
  } else if (keyPressed === 69) {
    // E
    keys.e = false;
  }

  e.preventDefault();
};

const mouseUpHandler = (e) => {
  keys.mouse1 = false;

  e.preventDefault();
};

const mouseDownHandler = (e) => {
  keys.mouse1 = true;

  e.preventDefault();
};


const init = () => {
  document.body.addEventListener('keyup', keyUpHandler);
  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('mouseup', mouseUpHandler);
  document.body.addEventListener('mousedown', mouseDownHandler);
};

module.exports = {
  init,
  keys,
};
