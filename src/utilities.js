
const timing = {
  dT: 0,
  lastTime: new Date().getTime(),
  curTime: new Date().getTime(),
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
  timing.curTime = new Date().getTime();
  timing.dT = (timing.curTime - timing.lastTime) * 0.001;
  timing.lastTime = timing.curTime;
  
  return timing.dT;
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
