const electron = require('electron');
const ipc = require('electron').ipcRenderer;
const BrowserWindow = require('electron').remote.BrowserWindow;
const remote = require('electron').remote;
const screen = electron.screen;

const path = require('path');
const fs = require('fs');

const utilities = require('./utilities.js');
const Emitter = require('./Emitter.js');

// PIXI variables
const PIXI = require('pixi.js');
const loader = PIXI.loader;
const Container = PIXI.Container;
const Sprite = PIXI.Sprite;

let renderer;
let renderFrame = 0;
let user = { };


// Initialize function
  // starts the renderer process and the game loop
  // sets up all the PIXI rendering
const init = () => {
  
  renderer = PIXI.WebGLRenderer(1280, 720);
  renderer.autoResize = true;

  document.body.appendChild(renderer.view);
  
};

const updateLoop = () => {
  renderFrame = requestAnimationFrame();
  
  
};



// Attach the init function
window.onload = init;