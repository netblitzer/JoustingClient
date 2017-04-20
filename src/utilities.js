
const timing = {
  dT: 0,
  lastTime: 0,
  curTime: 0,
};

const center = {
  x: 640,
  y: 360,
};

// pixels to add to make the window properly sized in the center
const frameAddition = {
  x: 16,
  y: 39,
};

const updateTiming = () => {
  timing.curTime = new Date.getTime();
  timing.dT = timing.curTime - timing.lastTime;
  timing.lastTime = timing.curTime;
};

const resize = () => {
  const canvas = document.querySelector('canvas');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  center.x = window.innerWidth / 2;
  center.y = window.innerHeight / 2;
};

window.addEventListener('resize', resize);

module.exports = {
  updateTiming,
  resize,
  center,
  timing,
  frameAddition,
};
