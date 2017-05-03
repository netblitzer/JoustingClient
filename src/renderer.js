// const electron = require('electron');
// const ipc = require('electron').ipcRenderer;
// const BrowserWindow = require('electron').remote.BrowserWindow;
// const remote = require('electron').remote;
// const screen = electron.screen;
const socket = require('socket.io-client')('http://localhost:3000');

const path = require('path');

const utilities = require('./utilities.js');
const input = require('./input.js');
// const Emitter = require('./Types/Emitter.js');
const EmitterStream = require('./Types/EmitterStream.js');
const startLoader = require('./loader.js');
const Message = require('./Types/Message.js');

// PIXI variables
const PIXI = require('pixi.js');
// const loader = PIXI.loader;
const resources = PIXI.loader.resources;
const Container = PIXI.Container;
const Sprite = PIXI.Sprite;
const Graphics = PIXI.Graphics;
const Text = PIXI.Text;

// Rendering variables
let renderer;
// let renderFrame = 0;
let mainStage;
const screenSize = {
  w: 1280,
  h: 720,
};
const screenScaleMod = {
  x: 1,
  y: 1,
};
// const camLoc = {
//  x: 640,
//  y: 360,
// };

// Game state variables
const zone = 'arena';
let state = 'menu';

// specific rendering variables
const zoneStages = {
  menu: new Container(),
  transition: new Container(),
  outside: new Container(),
  arena: new Container(),
};
const coverStages = {
  menu: new Container(),
  shop: new Container(),
  arenaMenu: new Container(),
  arenaWaitingOnMatch: new Container(),
  arenaCountDown: new Container(),
  faceoff: new Container(),
};
const allEmitters = [];

// let user = { };


// ---------------------//
// * SOCKET HANDLING * //
// ---------------------//

// socket.on('connect', (m) => {
//
//
// });
//
// socket.on('joined', (m) => {
//  //user = m.data;
// });
//
// socket.on('playerCountUpdate', (m) => {
//
//
// });

socket.on('matchWaiting', (m) => {
  state = 'matchWaiting';
  coverStages.arenaWaitingOnMatch.waitStart = m.data;
});

socket.on('matchPreparing', () => {
  coverStages.arenaMenu.visible = false;
  coverStages.arenaWaitingOnMatch.visible = false;
  coverStages.arenaCountDown.visible = true;

  state = 'preparing';
});

socket.on('prepUpdate', (m) => {
  coverStages.arenaCountDown.window.text.text = Math.round(15 - m.data);
});

// socket.on('matchEnd', (m) => {
//
//
// });
//
// socket.on('inputUpdate', (m) => {
//
//
// });
//
// socket.on('matchResult', (m) => {
//
//
// });


// * NOTES * //
  // Everything is placed assuming it's in in 1280x720p currently

// Button functions
function genericOver() {
  this.isOver = true;
  this.tint = 0xFFFFFF;
}
function genericOut() {
  this.isOver = false;
  this.tint = 0xDDDDDD;
}
function genericDown() {
  this.isDown = true;
  this.tint = 0xBBBBBB;
}
function genericUp() {
  this.isDown = false;

  if (this.isOver) {
    this.tint = 0xFFFFFF;
  } else {
    this.tint = 0xDDDDDD;
  }
}
const attachButtonHandlers = (button) => {
  button.on('pointerdown', genericDown);
  button.on('pointerup', genericUp);
  button.on('pointerupOutside', genericUp);
  button.on('pointerover', genericOver);
  button.on('pointerout', genericOut);
};


// Initialize function
  // starts the renderer process and the game loop
  // sets up all the PIXI rendering
const init = () => {
  // init the main stage
  mainStage = new Container();

  const center = utilities.center;

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

  const timer = new Text('dT: 0', { fontFamily: 'Arial', fontSize: 20, fill: '#FFF' });
  timer.position.x = 15;
  timer.position.y = 15;

  mainStage.addChild(timer);
  mainStage.debugTimer = timer;

  // set up the arena stage
  const g = new Graphics();
  g.beginFill(0xFFEECC);
  g.lineStyle(10, 0x000000, 1);

  g.drawRect(-1280, -720, 3840, 2160);

  zoneStages.arena.addChild(g);

  const aMenu = new Graphics();
  aMenu.beginFill(0x000000);
  aMenu.fillAlpha = 0.5;
  aMenu.drawRect(0, 0, screenSize.w, screenSize.h);

  aMenu.fillAlpha = 0.8;
  aMenu.drawRect(120, 60, 1040, 580);

  coverStages.arenaMenu.addChild(aMenu);
  coverStages.arenaMenu.aMenu = aMenu;

  const exitButton = new Graphics();
  exitButton.beginFill(0xFF5555);
  exitButton.fillAlpha = 0.8;
  exitButton.drawRect(1060, 60, 100, 40);
  exitButton.tint = 0xDDDDDD;

  exitButton.interactive = true;
  attachButtonHandlers(exitButton);

  aMenu.addChild(exitButton);


  const practiceButton = new Graphics();
  practiceButton.beginFill(0x555555);
  practiceButton.fillAlpha = 0.8;
  practiceButton.drawRect(120, 60, 640, 142);
  practiceButton.tint = 0xAAAAAA;

  const practiceText = new Text('PRACTICE', {
    fontFamily: 'Arial',
    fontSize: 96,
    fill: '#888',
    algin: 'center',
  });
  practiceText.anchor.set(0.5);
  practiceText.x = 440;
  practiceText.y = 131;
  practiceText.tint = 0xCCCCCC;
  practiceButton.addChild(practiceText);
  practiceButton.text = practiceText;

  practiceButton.interactive = false;
  // attachButtonHandlers(practiceButton);

  aMenu.addChild(practiceButton);


  const aiButton = new Graphics();
  aiButton.beginFill(0x555555);
  aiButton.fillAlpha = 0.8;
  aiButton.drawRect(120, 206, 640, 142);
  aiButton.tint = 0xAAAAAA;

  const aiText = new Text('AI MATCH', {
    fontFamily: 'Arial',
    fontSize: 96,
    fill: '#888',
    algin: 'center',
  });
  aiText.anchor.set(0.5);
  aiText.x = 440;
  aiText.y = 277;
  aiText.tint = 0xCCCCCC;
  aiButton.addChild(aiText);
  aiButton.text = aiText;

  aiButton.interactive = false;
  // attachButtonHandlers(aiButton);

  aMenu.addChild(aiButton);


  const randomButton = new Graphics();
  randomButton.beginFill(0x555555);
  randomButton.fillAlpha = 0.8;
  randomButton.drawRect(120, 352, 640, 142);
  randomButton.tint = 0xDDDDDD;

  const randomText = new Text('RANDOM', {
    fontFamily: 'Arial',
    fontSize: 96,
    fill: '#888',
    algin: 'center',
  });
  randomText.anchor.set(0.5);
  randomText.x = 440;
  randomText.y = 423;
  randomText.tint = 0xFFFFFF;
  randomButton.addChild(randomText);
  randomButton.text = randomText;

  randomButton.interactive = true;
  attachButtonHandlers(randomButton);
  randomButton.on('pointerdown', () => {
    coverStages.arenaWaitingOnMatch.waitingMenu.visible = true;
    coverStages.arenaWaitingOnMatch.waitTime = 0;

    // coverStages.arenaMenu.aMenu.practiceButton.interactive = true;
    // coverStages.arenaMenu.aMenu.aiButton.interactive = true;
    coverStages.arenaMenu.aMenu.randomButton.interactive = false;
    // coverStages.arenaMenu.aMenu.rankedButton.interactive = true;

    // coverStages.arenaMenu.aMenu.practiceButton.tint = 0xAAAAAA;
    // coverStages.arenaMenu.aMenu.aiButton.tint = 0xAAAAAA;
    coverStages.arenaMenu.aMenu.randomButton.tint = 0xAAAAAA;
    // coverStages.arenaMenu.aMenu.rankedButton.tint = 0xAAAAAA;

    // coverStages.arenaMenu.aMenu.practiceButton.text.tint = 0xCCCCCC;
    // coverStages.arenaMenu.aMenu.aiButton.text.tint = 0xCCCCCC;
    coverStages.arenaMenu.aMenu.randomButton.text.tint = 0xCCCCCC;
    // coverStages.arenaMenu.aMenu.rankedButton.text.tint = 0xCCCCCC;

    socket.emit('match', new Message('random', { }));

    genericDown();
  });

  aMenu.addChild(randomButton);


  const rankedButton = new Graphics();
  rankedButton.beginFill(0x555555);
  rankedButton.fillAlpha = 0.8;
  rankedButton.drawRect(120, 498, 640, 142);
  rankedButton.tint = 0xAAAAAA;

  const rankedText = new Text('RANKED', {
    fontFamily: 'Arial',
    fontSize: 96,
    fill: '#888',
    algin: 'center',
  });
  rankedText.anchor.set(0.5);
  rankedText.x = 440;
  rankedText.y = 569;
  rankedText.tint = 0xCCCCCC;
  rankedButton.addChild(rankedText);
  rankedButton.text = rankedText;

  rankedButton.interactive = false;
  // attachButtonHandlers(rankedButton);

  aMenu.addChild(rankedButton);

  aMenu.practiceButton = practiceButton;
  aMenu.aiButton = aiButton;
  aMenu.randomButton = randomButton;
  aMenu.rankedButton = rankedButton;


  const waitingMenu = new Graphics();
  waitingMenu.beginFill(0x000000);
  waitingMenu.fillAlpha = 0.5;
  waitingMenu.drawRect(0, 0, screenSize.w, screenSize.h);

  waitingMenu.fillAlpha = 0.95;
  waitingMenu.drawRect(center.x - 160, center.y - 150, 320, 300);

  coverStages.arenaWaitingOnMatch.addChild(waitingMenu);
  coverStages.arenaWaitingOnMatch.waitingMenu = waitingMenu;
  waitingMenu.visible = false;

  const waitingText = new Text('Waiting...', {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: '#888',
    algin: 'center',
  });
  waitingText.anchor.set(0.5);
  waitingText.x = center.x;
  waitingText.y = center.y - 100;
  waitingMenu.addChild(waitingText);

  const waitingTimeText = new Text('000', {
    fontFamily: 'Arial',
    fontSize: 96,
    fill: '#888',
    algin: 'center',
  });
  waitingTimeText.anchor.set(0.5);
  waitingTimeText.x = center.x;
  waitingTimeText.y = center.y + 20;
  waitingMenu.addChild(waitingTimeText);
  waitingMenu.text = waitingTimeText;

  const waitingCloseButton = new Graphics();
  waitingCloseButton.beginFill(0x555555);
  waitingCloseButton.fillAlpha = 0.95;
  waitingCloseButton.drawRect(center.x - 160, center.y + 150, 320, 50);
  waitingCloseButton.tint = 0xDDDDDD;
  waitingMenu.addChild(waitingCloseButton);

  const waitingCloseText = new Text('Leave', {
    fontFamily: 'Arial',
    fontSize: 36,
    fill: '#888',
    algin: 'center',
  });
  waitingCloseText.anchor.set(0.5);
  waitingCloseText.x = center.x;
  waitingCloseText.y = center.y + 175;
  waitingCloseButton.addChild(waitingCloseText);

  waitingCloseButton.interactive = true;
  attachButtonHandlers(waitingCloseButton);
  waitingCloseButton.on('pointerdown', () => {
    coverStages.arenaWaitingOnMatch.waitingMenu.visible = false;
    coverStages.arenaWaitingOnMatch.waitTime = 0;

    // coverStages.arenaMenu.aMenu.practiceButton.interactive = true;
    // coverStages.arenaMenu.aMenu.aiButton.interactive = true;
    coverStages.arenaMenu.aMenu.randomButton.interactive = true;
    // coverStages.arenaMenu.aMenu.rankedButton.interactive = true;

    // coverStages.arenaMenu.aMenu.practiceButton.tint = 0xDDDDDD;
    // coverStages.arenaMenu.aMenu.aiButton.tint = 0xDDDDDD;
    coverStages.arenaMenu.aMenu.randomButton.tint = 0xDDDDDD;
    // coverStages.arenaMenu.aMenu.rankedButton.tint = 0xDDDDDD;

    // coverStages.arenaMenu.aMenu.practiceButton.text.tint = 0xCCCCCC;
    // coverStages.arenaMenu.aMenu.aiButton.text.tint = 0xCCCCCC;
    coverStages.arenaMenu.aMenu.randomButton.text.tint = 0xFFFFFF;
    // coverStages.arenaMenu.aMenu.rankedButton.text.tint = 0xCCCCCC;

    socket.emit('leaveMatch', { });

    state = 'menu';

    genericDown();
  });


  const countdownWindow = new Graphics();
  countdownWindow.beginFill(0x000000);
  countdownWindow.fillAlpha = 0.5;
  countdownWindow.drawRect(center.x - 150, center.y - 150, 300, 300);

  const countdownText = new Text('15', {
    fontFamily: 'Arial',
    fontSize: 128,
    fill: '#FFF',
    algin: 'center',
  });
  countdownText.anchor.set(0.5);
  countdownText.x = center.x;
  countdownText.y = center.y;
  countdownWindow.addChild(countdownText);

  coverStages.arenaCountDown.addChild(countdownWindow);

  coverStages.arenaCountDown.window = countdownWindow;
  countdownWindow.text = countdownText;

  coverStages.arenaCountDown.visible = false;


  const horse = new Sprite(resources[path.join(__dirname, '../assets/rohan_horse.png')].texture);
  horse.scale = {
    x: 1,
    y: 1,
  };
  zoneStages.arena.addChild(horse);


  const e = new EmitterStream(25000, { x: 800, y: 800 },
                              path.join(__dirname, '../assets/airplane.png'), {
                                particleVelocityFudge: { x: 500, y: 500 },
                                particlePosFudge: { x: 50, y: 50 },
                                lifeTime: 1,
                                lifeFudge: 0.1,
                                fade: true,
                              });

  allEmitters.push(e);

  // mainStage.addChild(e.container);

  // renderFrame = requestAnimationFrame(updateLoop);

  socket.emit('join');
};


// Main game loop
const updateLoop = () => {
  // Update the timing of the game
  // renderFrame = requestAnimationFrame(updateLoop);
  requestAnimationFrame(updateLoop);

  const dT = utilities.updateTiming();

  // Calculate state updates

  switch (zone) {

    case 'arena': {
      switch (state) {

        default:
        case 'menu': {
          break;
        }
        case 'matchWaiting': {
          const wS = coverStages.arenaWaitingOnMatch.waitStart;
          if (wS !== undefined) {
            coverStages.arenaWaitingOnMatch.waitTime += dT;
            coverStages.arenaWaitingOnMatch.waitingMenu.text.text =
              Math.floor(coverStages.arenaWaitingOnMatch.waitTime);
          }

          if (input.keys.esc === true) {
            state = 'menu';

            coverStages.arenaWaitingOnMatch.waitingMenu.visible = false;
            coverStages.arenaWaitingOnMatch.waitTime = 0;

            // coverStages.arenaMenu.aMenu.practiceButton.interactive = true;
            // coverStages.arenaMenu.aMenu.aiButton.interactive = true;
            coverStages.arenaMenu.aMenu.randomButton.interactive = true;
            // coverStages.arenaMenu.aMenu.rankedButton.interactive = true;

            // coverStages.arenaMenu.aMenu.practiceButton.tint = 0xDDDDDD;
            // coverStages.arenaMenu.aMenu.aiButton.tint = 0xDDDDDD;
            coverStages.arenaMenu.aMenu.randomButton.tint = 0xDDDDDD;
            // coverStages.arenaMenu.aMenu.rankedButton.tint = 0xDDDDDD;

            // coverStages.arenaMenu.aMenu.practiceButton.text.tint = 0xCCCCCC;
            // coverStages.arenaMenu.aMenu.aiButton.text.tint = 0xCCCCCC;
            coverStages.arenaMenu.aMenu.randomButton.text.tint = 0xFFFFFF;
            // coverStages.arenaMenu.aMenu.rankedButton.text.tint = 0xCCCCCC;

            socket.emit('leaveMatch', { });
          }

          break;
        }
        case 'preparing': {
          break;
        }
        case 'inGame': {
          break;
        }
      }

      break;
    }
    default: {
      break;
    }
  }

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

  input.init();

  requestAnimationFrame(updateLoop);
};


module.exports = {
  mainStage,
  screenSize,
  screenScaleMod,
};
