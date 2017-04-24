const keys = {
  e: false,
  space: false,
  left: false,
  right: false,
  up: false,
  down: false,
  shift: false,
  mouse1: false,
  mouse2: false,
  mouse1double: false,
  mouse2double: false,
};

let m1last = 0;
let m2last = 0;
let lastClicked: '';

const init = () => {
  document.body.addEventListener('keyup', keyUpHandler);
  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('mouseup', mouseUpHandler);
  document.body.addEventListener('mousedown', mouseDownHandler);
};