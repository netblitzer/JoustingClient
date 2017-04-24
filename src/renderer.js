const electron = require('electron');
const ipc = require('electron').ipcRenderer;
const BrowserWindow = require('electron').remote.BrowserWindow;
const remote = require('electron').remote;
const screen = electron.screen;

const path = require('path');
const fs = require('fs');

const utilities = require('./utilities.js');
const Emitter = require('./Emitter.js');
const EmitterStream = require('./EmitterStream.js');
const startLoader = require('./loader.js');

// PIXI variables
const PIXI = require('pixi.js');
const loader = PIXI.loader;
const resources = PIXI.loader.resources;
const Container = PIXI.Container;
const Sprite = PIXI.Sprite;

// Rendering variables
let renderer;
let renderFrame = 0;
let mainStage;
let screenSize = {
  w: 1280,
  h: 720,
};
let screenScaleMod = 1;
let camLoc = {
  x: 640,
  y: 360,
};

// Game state variables
let zone = 'arena';
let state = 'battle';

// specific rendering variables
let zoneStages = {
  menu: new Container(),
  transition: new Container(),
  outside: new Container(),
  arena: new Container(),
};
let coverStages = {
  menu: new Container(),
  shop: new Container(),
  arenaMenu: new Container(),
  faceoff: new Container(),
};
let allEmitters = [ ];

let user = { };

// Initialize function
  // starts the renderer process and the game loop
  // sets up all the PIXI rendering
const init = () => {
  
  // init the main stage
  mainStage = new Container();
  
  // link the main stage back to the other stages
  let keys = Object.keys(zoneStages);
  for (let i = 0; i < keys.length; i++) {
    zoneStages[keys[i]].mainStage = mainStage;
    mainStage.addChild(zoneStages[keys[i]]);
  }
  keys = Object.keys(coverStages);
  for (let i = 0; i < keys.length; i++) {
    coverStages[keys[i]].mainStage = mainStage;
    mainStage.addChild(coverStages[keys[i]]);
  }
  
  const timer = new PIXI.Text('dT: 0', {fontFamily: 'Arial', fontSize: 20, fill: '#FFF'});
  timer.position.x = 15;
  timer.position.y = 15;
  
  mainStage.addChild(timer);
  mainStage.debugTimer = timer;
  
  
  const horse = new Sprite(resources[path.join(__dirname, '../assets/rohan_horse.png')].texture);
  horse.scale = {
    x: 0.65 * screenScaleMod,
    y: 0.65 * screenScaleMod,
  };
  zoneStages.arena.addChild(horse);
  
  
  const e = new EmitterStream(25000, { x: 800, y: 800}, path.join(__dirname, '../assets/airplane.png'), {
    particleVelocityFudge: {x: 500, y: 500},
    particlePosFudge: {x: 50, y: 50},
    lifeTime: 1,
    lifeFudge: 0.1,
    fade: true,
  });
  
  allEmitters.push(e);
  
  //mainStage.addChild(e.container);
  
  updateLoop();
  
};

// Main game loop
const updateLoop = () => {
  
  // Update the timing of the game
  renderFrame = requestAnimationFrame(updateLoop);
  
  const dT = utilities.updateTiming();
  
  // Calculate state updates
  
  
  // Calculate current state
  
  
  // Render current state
  mainStage.debugTimer.text = `dT: ${dT}`;
  
  allEmitters.forEach((_emit) => {
    _emit.update(dT);
  });
  
  renderer.render(mainStage);
};




window.onload = () => {
  
  renderer = new PIXI.WebGLRenderer(1280, 720);
  renderer.autoResize = true;

  document.body.appendChild(renderer.view);
  
  startLoader.loadInTextures(init, '../assets/');
  
};