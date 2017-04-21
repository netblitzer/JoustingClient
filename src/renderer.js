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
const Container = PIXI.Container;
const Sprite = PIXI.Sprite;

let renderer;
let renderFrame = 0;
let user = { };
let e;
let stage;
let b;
let t;

// Initialize function
  // starts the renderer process and the game loop
  // sets up all the PIXI rendering
const init = () => {
  
  stage = new Container();
  
  e = new EmitterStream(10, { x: 200, y: 200}, path.join(__dirname, '../assets/airplane.png'), {
    particleVelocityFudge: {x: 50, y: 50},
    particlePosFudge: {x: 20, y: 20},
    lifeTime: 1,
    fade: true,
  });
  
  stage.addChild(e.container);
  
  updateLoop();
  
};


const updateLoop = () => {
  renderFrame = requestAnimationFrame(updateLoop);
  
  utilities.updateTiming();
  
  e.update(utilities.timing.dT);
  
  renderer.render(stage);
};




window.onload = () => {
  
  renderer = PIXI.autoDetectRenderer(1280, 720);
  renderer.autoResize = true;

  document.body.appendChild(renderer.view);
  
  startLoader.loadInTextures(init, '../assets/');
};