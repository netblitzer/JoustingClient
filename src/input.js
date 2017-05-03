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

let m1last = 0;
let m2last = 0;
let lastClicked = '';


const keyDownHandler = (e) => {
  const keyPressed = e.which;

  // W OR UP
  if(keyPressed === 87 || keyPressed === 38) {
    keys.up = true;
  }
  // A OR LEFT
  else if(keyPressed === 65 || keyPressed === 37) {
    keys.left = true;
  }
  // S OR DOWN
  else if(keyPressed === 83 || keyPressed === 40) {
    keys.down = true;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    keys.right = true;
  }
  // SPACE
  else if(keyPressed === 32) {
    keys.space = true;
  }
  // SHIFT
  else if(keyPressed === 16) {
    keys.shift = true;
  }
  // ESC
  else if(keyPressed === 27) {
    keys.esc = true;
  }
  // E
  else if(keyPressed === 69) {
    keys.e = true;
  }
  
  console.dir(keys);

  e.preventDefault();
};

const keyUpHandler = (e) => {
  const keyPressed = e.which;

  // W OR UP
  if(keyPressed === 87 || keyPressed === 38) {
    keys.up = false;
  }
  // A OR LEFT
  else if(keyPressed === 65 || keyPressed === 37) {
    keys.left = false;
  }
  // S OR DOWN
  else if(keyPressed === 83 || keyPressed === 40) {
    keys.down = false;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    keys.right = false;
  }
  // SPACE
  else if(keyPressed === 32) {
    keys.space = false;
  }
  // SHIFT
  else if(keyPressed === 16) {
    keys.shift = false;
  }
  // ESC
  else if(keyPressed === 27) {
    keys.esc = false;
  }
  // E
  else if(keyPressed === 69) {
    keys.e = false;
  }
  
  console.dir(keys);

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