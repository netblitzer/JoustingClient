/* global window:true*/
/* global document:true*/
/* global requestAnimationFrame:true*/

// const electron = require('electron');
// const ipc = require('electron').ipcRenderer;
// const BrowserWindow = require('electron').remote.BrowserWindow;
const remote = require('electron').remote;
// const screen = electron.screen;
const socket = require('socket.io-client')('https://joustingserver.herokuapp.com/');

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
let mainStage;
const screenSize = {
  w: 1280,
  h: 720,
};
const camLoc = {
  x: 640,
  y: 360,
};

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
  background: new Container(),
  menu: new Container(),
  shop: new Container(),
  arenaMenu: new Container(),
  arenaWaitingOnMatch: new Container(),
  arenaCountDown: new Container(),
  arenaUserLeft: new Container(),
  faceoff: new Container(),
  started: new Container(),
  endMenu: new Container(),
  exitConfirm: new Container(),
};
const allEmitters = [];

// match variables
let user = { };
let opponent = { };
let position;
let maxSetupTimer;
let startTimer = 0;
let alpha;
let transition = 0;


// ---------------------//
// * SOCKET HANDLING * //
// ---------------------//

// socket.on('connect', (m) => {
//
//
// });
//
socket.on('joined', (m) => {
  user = m.data;
});
//
// socket.on('playerCountUpdate', (m) => {
//
//
// });

socket.on('matchWaiting', (m) => {
  state = 'matchWaiting';
  coverStages.arenaWaitingOnMatch.waitStart = m.data;
});

socket.on('matchResults', (m) => {
  state = 'postGameTransition';
  coverStages.endMenu.visible = true;
  coverStages.endMenu.alpha = 0;
  coverStages.arenaMenu.interactive = false;

  allEmitters.forEach((_e) => {
    _e.destructor();
  });

  zoneStages.arena.cHorse.backEmitter = undefined;
  zoneStages.arena.cHorse.frontEmitter = undefined;

  zoneStages.arena.oHorse.backEmitter = undefined;
  zoneStages.arena.oHorse.frontEmitter = undefined;

  allEmitters.splice(0, allEmitters.length);

  switch (m.type) {

    default:
    case 'draw':
      switch (m.data) {
        case 'userLeft':
          state = 'userLeft';

          coverStages.arenaMenu.visible = true;
          coverStages.arenaMenu.interactive = true;

          coverStages.arenaUserLeft.visible = true;
          coverStages.arenaCountDown.visible = false;
          coverStages.endMenu.visible = false;
          break;

        default:
          state = 'postGameTransition';
          transition = 1;
          coverStages.endMenu.window.text.text = 'DRAW';
          break;

      }
      break;
    case 'win':
      state = 'postGameTransition';
      transition = 1;
      coverStages.endMenu.window.text.text = 'WIN';
      break;

    case 'loss':
      state = 'postGameTransition';
      transition = 1;
      coverStages.endMenu.window.text.text = 'LOSS';
      break;
  }
});

socket.on('matchEnded', () => {
  coverStages.arenaMenu.visible = true;
  coverStages.endMenu.window.button.visible = true;
});

socket.on('matchPreparing', (m) => {
  coverStages.arenaMenu.visible = false;
  coverStages.arenaWaitingOnMatch.waitingMenu.visible = false;
  coverStages.arenaCountDown.visible = true;
  maxSetupTimer = m.data.maxTime;

  state = 'preparing';

  if (m.data.p1.hash !== user.hash) {
    opponent = m.data.p1;
    position = 'p2';
  } else {
    opponent = m.data.p2;
    position = 'p1';
  }
});

socket.on('prepUpdate', (m) => {
  coverStages.arenaCountDown.window.text.text = Math.round(maxSetupTimer - m.data);
});

socket.on('matchStarted', () => {
  state = 'inGame';

  startTimer = 2;
  alpha = 0;

  coverStages.arenaCountDown.visible = false;
  coverStages.started.visible = true;


  const e = new EmitterStream(50, { x: 135, y: 510 },
    path.join(__dirname, '../assets/Dust.png'), {
      particleVelocityFudge: { x: 5, y: 20 },
      velocity: { x: 0, y: -5 },
      particlePosFudge: { x: 8, y: 8 },
      lifeTime: 1.0,
      lifeFudge: 0.1,
      fade: true,
    });

  allEmitters.push(e);

  mainStage.addChild(e.container);
  zoneStages.arena.cHorse.backEmitter = e;

  const h = new EmitterStream(50, { x: 300, y: 510 },
    path.join(__dirname, '../assets/Dust.png'), {
      particleVelocityFudge: { x: 5, y: 20 },
      velocity: { x: 0, y: -5 },
      particlePosFudge: { x: 8, y: 8 },
      lifeTime: 1.0,
      lifeFudge: 0.1,
      fade: true,
    });

  allEmitters.push(h);

  mainStage.addChild(h.container);
  zoneStages.arena.cHorse.frontEmitter = h;


  const f = new EmitterStream(50, { x: 135, y: 490 },
    path.join(__dirname, '../assets/Dust.png'), {
      particleVelocityFudge: { x: 5, y: 20 },
      velocity: { x: 0, y: -5 },
      particlePosFudge: { x: 8, y: 8 },
      lifeTime: 1.0,
      lifeFudge: 0.1,
      fade: true,
    });

  allEmitters.push(f);

  mainStage.addChild(f.container);
  zoneStages.arena.oHorse.backEmitter = f;

  const g = new EmitterStream(50, { x: 300, y: 490 },
    path.join(__dirname, '../assets/Dust.png'), {
      particleVelocityFudge: { x: 5, y: 20 },
      velocity: { x: 0, y: -5 },
      particlePosFudge: { x: 8, y: 8 },
      lifeTime: 1.0,
      lifeFudge: 0.1,
      fade: true,
    });

  allEmitters.push(g);

  mainStage.addChildAt(g.container);
  zoneStages.arena.oHorse.frontEmitter = g;
});

socket.on('matchGameUpdate', (m) => {
  if (position === 'p1') {
    user.data = m.data.p1;
    opponent.data = m.data.p2;
  } else {
    user.data = m.data.p2;
    opponent.data = m.data.p1;
  }

  alpha = 0.5;
});

socket.on('postGameUpdate', (m) => {
  if (position === 'p1') {
    user.data = m.data.p1;
    opponent.data = m.data.p2;
  } else {
    user.data = m.data.p2;
    opponent.data = m.data.p1;
  }

  alpha = 0.5;
});


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


// Main game loop
const updateLoop = () => {
  // Update the timing of the game
  requestAnimationFrame(updateLoop);

  const dT = utilities.updateTiming();

  // Calculate state updates

  // case declarations
  const wS = coverStages.arenaWaitingOnMatch.waitStart;
  const cH = zoneStages.arena.cHorse;
  const oH = zoneStages.arena.oHorse;

  switch (zone) {

    case 'arena':

      switch (state) {

        default:
        case 'menu':

          break;

        case 'matchWaiting':
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
            coverStages.arenaMenu.aMenu.exitButton.interactive = true;

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

        case 'exitConfirm':
          if (input.keys.esc === true) {
            state = 'menu';

            coverStages.exitConfirm.visible = false;

            // coverStages.arenaMenu.aMenu.practiceButton.interactive = true;
            // coverStages.arenaMenu.aMenu.aiButton.interactive = true;
            coverStages.arenaMenu.aMenu.randomButton.interactive = true;
            // coverStages.arenaMenu.aMenu.rankedButton.interactive = true;
            coverStages.arenaMenu.aMenu.exitButton.interactive = true;

            // coverStages.arenaMenu.aMenu.practiceButton.tint = 0xDDDDDD;
            // coverStages.arenaMenu.aMenu.aiButton.tint = 0xDDDDDD;
            coverStages.arenaMenu.aMenu.randomButton.tint = 0xDDDDDD;
            // coverStages.arenaMenu.aMenu.rankedButton.tint = 0xDDDDDD;

            // coverStages.arenaMenu.aMenu.practiceButton.text.tint = 0xCCCCCC;
            // coverStages.arenaMenu.aMenu.aiButton.text.tint = 0xCCCCCC;
            coverStages.arenaMenu.aMenu.randomButton.text.tint = 0xFFFFFF;
            // coverStages.arenaMenu.aMenu.rankedButton.text.tint = 0xCCCCCC;
          }

          break;

        case 'userLeft':

          if (input.keys.esc === true) {
            state = 'menu';

            coverStages.arenaUserLeft.visible = false;

            // coverStages.arenaMenu.aMenu.practiceButton.interactive = true;
            // coverStages.arenaMenu.aMenu.aiButton.interactive = true;
            coverStages.arenaMenu.aMenu.randomButton.interactive = true;
            // coverStages.arenaMenu.aMenu.rankedButton.interactive = true;
            coverStages.arenaMenu.aMenu.exitButton.interactive = true;

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

        case 'preparing':

          break;

        case 'postGame':

          // * POSITION * //
          camLoc.x = utilities.lerp3(user.data.ax, user.data.bx, user.data.cx, alpha);
          cH.x = 100 + (user.data.velocity * 0.2);
          oH.x = 100 +
            utilities.lerp3(opponent.data.ax, opponent.data.bx, opponent.data.cx, alpha) +
            camLoc.x + cH.x;


          // * LANCE * //
          cH.lance.rotation = -0.5 + (user.data.lanceDropProgress * 0.6);
          cH.lance.x = 115 + (user.data.lanceProgress * 20);
          oH.lance.rotation = -0.5 + (opponent.data.lanceDropProgress * 0.6);
          oH.lance.x = 115 + (opponent.data.lanceProgress * 20);


          // * PARTICLES * //
          if (cH.backEmitter) {
            cH.backEmitter.pos.x = cH.x + 35;
            cH.backEmitter.particleVelocity.x = -user.data.velocity / 20;
            // cH.backEmitter.updateRate(Math.round(user.data.velocity / 5));
          }
          if (cH.frontEmitter) {
            cH.frontEmitter.pos.x = cH.x + 190;
            cH.frontEmitter.particleVelocity.x = -user.data.velocity / 20;
            // cH.frontEmitter.updateRate(Math.round(user.data.velocity / 5));
          }

          if (oH.backEmitter) {
            oH.backEmitter.pos.x = oH.x - 35;
            oH.backEmitter.particleVelocity.x = opponent.data.velocity / 20;
            // cH.backEmitter.updateRate(Math.round(user.data.velocity / 5));
          }
          if (oH.frontEmitter) {
            oH.frontEmitter.pos.x = oH.x - 190;
            oH.frontEmitter.particleVelocity.x = opponent.data.velocity / 20;
            // cH.frontEmitter.updateRate(Math.round(user.data.velocity / 5));
          }

          break;

        case 'postGameTransition':

          // * POSITION * //
          camLoc.x = utilities.lerp3(user.data.ax, user.data.bx, user.data.cx, alpha);
          cH.x = 100 + (user.data.velocity * 0.2);
          oH.x = 100 +
            utilities.lerp3(opponent.data.ax, opponent.data.bx, opponent.data.cx, alpha) +
            camLoc.x + cH.x;


          // * LANCE * //
          cH.lance.rotation = -0.5 + (user.data.lanceDropProgress * 0.6);
          cH.lance.x = 115 + (user.data.lanceProgress * 20);
          oH.lance.rotation = -0.5 + (opponent.data.lanceDropProgress * 0.6);
          oH.lance.x = 115 + (opponent.data.lanceProgress * 20);


          // * PARTICLES * //
          if (cH.backEmitter) {
            cH.backEmitter.pos.x = cH.x + 35;
            cH.backEmitter.particleVelocity.x = -user.data.velocity / 20;
            // cH.backEmitter.updateRate(Math.round(user.data.velocity / 5));
          }
          if (cH.frontEmitter) {
            cH.frontEmitter.pos.x = cH.x + 190;
            cH.frontEmitter.particleVelocity.x = -user.data.velocity / 20;
            // cH.frontEmitter.updateRate(Math.round(user.data.velocity / 5));
          }

          if (oH.backEmitter) {
            oH.backEmitter.pos.x = oH.x - 35;
            oH.backEmitter.particleVelocity.x = opponent.data.velocity / 20;
            // cH.backEmitter.updateRate(Math.round(user.data.velocity / 5));
          }
          if (oH.frontEmitter) {
            oH.frontEmitter.pos.x = oH.x - 190;
            oH.frontEmitter.particleVelocity.x = opponent.data.velocity / 20;
            // cH.frontEmitter.updateRate(Math.round(user.data.velocity / 5));
          }

          if (transition > 0) {
            transition -= dT;
            coverStages.endMenu.alpha = (1 - transition);

            if (transition < 0) {
              transition = 0;
              state = 'postGame';
              coverStages.endMenu.alpha = 1;
            }
          }

          break;

        case 'inGame':

          if (startTimer > 1.5) {
            coverStages.started.text.style.fontSize += 1;
          } else if (startTimer < 1 && startTimer > 0) {
            coverStages.started.text.alpha -= dT;
            coverStages.started.text.style.fontSize -= 0.25;
          }

          if (startTimer > 0) {
            startTimer -= dT;

            if (startTimer < 0) {
              startTimer = 0;
              coverStages.started.text.alpha = 0;
              coverStages.started.text.style.fontSize = 256;
            }
          }


          if (alpha < 1) {
            alpha += 0.05;
          }


          // * POSITION * //
          camLoc.x = utilities.lerp3(user.data.ax, user.data.bx, user.data.cx, alpha);
          cH.x = 100 + (user.data.velocity * 0.2);
          oH.x = 100 +
            utilities.lerp3(opponent.data.ax, opponent.data.bx, opponent.data.cx, alpha) +
            camLoc.x + cH.x;


          // * LANCE * //
          cH.lance.rotation = -0.5 + (user.data.lanceDropProgress * 0.6);
          cH.lance.x = 115 + (user.data.lanceProgress * 20);
          oH.lance.rotation = -0.5 + (opponent.data.lanceDropProgress * 0.6);
          oH.lance.x = 115 + (opponent.data.lanceProgress * 20);


          // * PARTICLES * //
          if (cH.backEmitter) {
            cH.backEmitter.pos.x = cH.x + 35;
            cH.backEmitter.particleVelocity.x = -user.data.velocity;
            // cH.backEmitter.updateRate(Math.round(user.data.velocity / 5));
          }
          if (cH.frontEmitter) {
            cH.frontEmitter.pos.x = cH.x + 190;
            cH.frontEmitter.particleVelocity.x = -user.data.velocity;
            // cH.frontEmitter.updateRate(Math.round(user.data.velocity / 5));
          }

          if (oH.backEmitter) {
            oH.backEmitter.pos.x = oH.x - 35;
            oH.backEmitter.particleVelocity.x = opponent.data.velocity;
            // cH.backEmitter.updateRate(Math.round(user.data.velocity / 5));
          }
          if (oH.frontEmitter) {
            oH.frontEmitter.pos.x = oH.x - 190;
            oH.frontEmitter.particleVelocity.x = opponent.data.velocity;
            // cH.frontEmitter.updateRate(Math.round(user.data.velocity / 5));
          }


          // * UI * //
          cH.boostWindow.bar.clear();
          cH.boostWindow.bar.beginFill(0x55FF55);
          cH.boostWindow.bar.fillAlpha = 0.5;
          cH.boostWindow.bar.drawRect(-58, 168, 16, -(user.data.boostProgress * 146));

          cH.lanceWindow.bar.clear();
          if (user.data.lanceProgress < 0) {
            cH.lanceWindow.bar.beginFill(0xFF5555);
          } else {
            cH.lanceWindow.bar.beginFill(0x5555FF);
          }
          cH.lanceWindow.bar.fillAlpha = 0.5;
          cH.lanceWindow.bar.drawRect(-28, 95, 16, -(user.data.lanceProgress * 73));


          zoneStages.arena.opponentDist.text = `Distance to Opponent: ${
            Math.floor((user.data.ax + opponent.data.ax) / 100, 2)}m`;

          // * INPUT * //
          if ((input.keys.space && !input.lastKeys.space) ||
              (!input.keys.space && input.lastKeys.space)) {
            socket.emit('inputSent', new Message('input', input.keys));
          }
          if ((input.keys.mouse1 && !input.lastKeys.mouse1) ||
              (!input.keys.mouse1 && input.lastKeys.mouse1)) {
            socket.emit('inputSent', new Message('input', input.keys));
          }
          if ((input.keys.mouse2 && !input.lastKeys.mouse2) ||
              (!input.keys.mouse2 && input.lastKeys.mouse2)) {
            socket.emit('inputSent', new Message('input', input.keys));
          }

          break;

      }

      break;

    default:

      break;

  }

  input.lastKeys = Object.assign({}, input.keys);

  // Render current state
  // mainStage.debugTimer.text = `dT: ${dT}`;

  allEmitters.forEach((_emit) => {
    _emit.update(dT);
  });

  renderer.render(mainStage);
};


// Initialize function
  // starts the renderer process and the game loop
  // sets up all the PIXI rendering
const init = () => {
  input.init();
  utilities.init();

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

  // const timer = new Text('dT: 0', { fontFamily: 'Arial', fontSize: 20, fill: '#FFF' });
  // timer.position.x = 15;
  // timer.position.y = 15;
// 
  // mainStage.addChild(timer);
  // mainStage.debugTimer = timer;

  // set up the arena stage
  const g = new Graphics();
  g.beginFill(0xEECCAA);
  g.drawRect(0, screenSize.h * 0.3, screenSize.w, screenSize.h * 0.7);

  g.beginFill(0xCCDDFF);
  g.drawRect(0, 0, screenSize.w, screenSize.h * 0.3);

  zoneStages.menu.addChild(g);
  
  const f = new Graphics();
  f.beginFill(0xEECCAA);
  f.drawRect(0, screenSize.h * 0.3, screenSize.w, screenSize.h * 0.7);

  f.beginFill(0xCCDDFF);
  f.drawRect(0, 0, screenSize.w, screenSize.h * 0.3);
  
  zoneStages.arena.addChild(f);

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
  aMenu.exitButton = exitButton;

  const exitText = new Text('QUIT', {
    fontFamily: 'Arial',
    fontSize: 30,
    fill: '#CCC',
    algin: 'center',
  });
  exitText.anchor.set(0.5);
  exitText.x = 1110;
  exitText.y = 80;
  exitText.tint = 0xCCCCCC;
  exitButton.addChild(exitText);
  exitButton.text = exitText;
  
  exitButton.on('pointerdown', () => {
    coverStages.exitConfirm.visible = true;
    
    state = 'exitConfirm';

    // coverStages.arenaMenu.aMenu.practiceButton.interactive = true;
    // coverStages.arenaMenu.aMenu.aiButton.interactive = true;
    coverStages.arenaMenu.aMenu.randomButton.interactive = false;
    // coverStages.arenaMenu.aMenu.rankedButton.interactive = true;
    coverStages.arenaMenu.aMenu.exitButton.interactive = false;

    // coverStages.arenaMenu.aMenu.practiceButton.tint = 0xAAAAAA;
    // coverStages.arenaMenu.aMenu.aiButton.tint = 0xAAAAAA;
    coverStages.arenaMenu.aMenu.randomButton.tint = 0xAAAAAA;
    // coverStages.arenaMenu.aMenu.rankedButton.tint = 0xAAAAAA;

    // coverStages.arenaMenu.aMenu.practiceButton.text.tint = 0xCCCCCC;
    // coverStages.arenaMenu.aMenu.aiButton.text.tint = 0xCCCCCC;
    coverStages.arenaMenu.aMenu.randomButton.text.tint = 0xCCCCCC;
    // coverStages.arenaMenu.aMenu.rankedButton.text.tint = 0xCCCCCC;

    genericDown();
  });


  const exitConfirmMenu = new Graphics();
  exitConfirmMenu.beginFill(0x000000);
  exitConfirmMenu.fillAlpha = 0.5;
  exitConfirmMenu.drawRect(0, 0, screenSize.w, screenSize.h);

  exitConfirmMenu.fillAlpha = 0.95;
  exitConfirmMenu.drawRect(center.x - 160, center.y - 100, 320, 200);

  coverStages.exitConfirm.addChild(exitConfirmMenu);
  coverStages.exitConfirm.menu = exitConfirmMenu;
  coverStages.exitConfirm.visible = false;

  const exitConfirmText = new Text('Are you sure you \n want to quit?', {
    fontFamily: 'Arial',
    fontSize: 36,
    fill: '#888',
    algin: 'center',
  });
  exitConfirmText.anchor.set(0.5);
  exitConfirmText.x = center.x;
  exitConfirmText.y = center.y - 35;
  exitConfirmMenu.addChild(exitConfirmText);

  const exitConfirmButton = new Graphics();
  exitConfirmButton.beginFill(0xFF5555);
  exitConfirmButton.fillAlpha = 0.95;
  exitConfirmButton.drawRect(center.x - 160, center.y + 50, 158, 50);
  exitConfirmButton.tint = 0xDDDDDD;
  exitConfirmMenu.addChild(exitConfirmButton);

  const exitConfirmButtonText = new Text('Quit', {
    fontFamily: 'Arial',
    fontSize: 36,
    fill: '#888',
    algin: 'center',
  });
  exitConfirmButtonText.anchor.set(0.5);
  exitConfirmButtonText.x = center.x - 80;
  exitConfirmButtonText.y = center.y + 75;
  exitConfirmButton.addChild(exitConfirmButtonText);

  exitConfirmButton.interactive = true;
  attachButtonHandlers(exitConfirmButton);
  exitConfirmButton.on('pointerup', () => {
    
    const win = remote.getCurrentWindow();
    win.close();    
  });

  const exitCancelButton = new Graphics();
  exitCancelButton.beginFill(0x555555);
  exitCancelButton.fillAlpha = 0.95;
  exitCancelButton.drawRect(center.x + 2, center.y + 50, 158, 50);
  exitCancelButton.tint = 0xDDDDDD;
  exitConfirmMenu.addChild(exitCancelButton);

  const exitCancelButtonText = new Text('Cancel', {
    fontFamily: 'Arial',
    fontSize: 36,
    fill: '#888',
    algin: 'center',
  });
  exitCancelButtonText.anchor.set(0.5);
  exitCancelButtonText.x = center.x + 80;
  exitCancelButtonText.y = center.y + 75;
  exitCancelButton.addChild(exitCancelButtonText);

  exitCancelButton.interactive = true;
  attachButtonHandlers(exitCancelButton);
  exitCancelButton.on('pointerup', () => {
    coverStages.exitConfirm.visible = false;
    state = 'menu';

    // coverStages.arenaMenu.aMenu.practiceButton.interactive = true;
    // coverStages.arenaMenu.aMenu.aiButton.interactive = true;
    coverStages.arenaMenu.aMenu.randomButton.interactive = true;
    // coverStages.arenaMenu.aMenu.rankedButton.interactive = true;
    coverStages.arenaMenu.aMenu.exitButton.interactive = true;

    // coverStages.arenaMenu.aMenu.practiceButton.tint = 0xDDDDDD;
    // coverStages.arenaMenu.aMenu.aiButton.tint = 0xDDDDDD;
    coverStages.arenaMenu.aMenu.randomButton.tint = 0xDDDDDD;
    // coverStages.arenaMenu.aMenu.rankedButton.tint = 0xDDDDDD;

    // coverStages.arenaMenu.aMenu.practiceButton.text.tint = 0xCCCCCC;
    // coverStages.arenaMenu.aMenu.aiButton.text.tint = 0xCCCCCC;
    coverStages.arenaMenu.aMenu.randomButton.text.tint = 0xFFFFFF;
    // coverStages.arenaMenu.aMenu.rankedButton.text.tint = 0xCCCCCC;

    genericUp();
  });


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
    coverStages.arenaMenu.aMenu.exitButton.interactive = false;

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

  const waitingText = new Text('In Match\n Queue...', {
    fontFamily: 'Arial',
    fontSize: 42,
    fill: '#888',
    algin: 'center',
  });
  waitingText.anchor.set(0.5);
  waitingText.x = center.x;
  waitingText.y = center.y - 85;
  waitingMenu.addChild(waitingText);

  const waitingTimeText = new Text('0', {
    fontFamily: 'Arial',
    fontSize: 96,
    fill: '#888',
    algin: 'center',
  });
  waitingTimeText.anchor.set(0.5);
  waitingTimeText.x = center.x;
  waitingTimeText.y = center.y + 45;
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
    coverStages.arenaMenu.aMenu.exitButton.interactive = true;

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


  const leftMenu = new Graphics();
  leftMenu.beginFill(0x000000);
  leftMenu.fillAlpha = 0.5;
  leftMenu.drawRect(0, 0, screenSize.w, screenSize.h);

  leftMenu.fillAlpha = 0.95;
  leftMenu.drawRect(center.x - 160, center.y - 90, 320, 180);

  coverStages.arenaUserLeft.addChild(leftMenu);
  coverStages.arenaUserLeft.visible = false;


  const leftText = new Text('Match Ended', {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: '#888',
    algin: 'center',
  });
  leftText.anchor.set(0.5);
  leftText.x = center.x;
  leftText.y = center.y - 40;
  leftMenu.addChild(leftText);

  const leftSecText = new Text('User Left.', {
    fontFamily: 'Arial',
    fontSize: 40,
    fill: '#888',
    algin: 'center',
  });
  leftSecText.anchor.set(0.5);
  leftSecText.x = center.x;
  leftSecText.y = center.y + 40;
  leftMenu.addChild(leftSecText);

  const leftCloseButton = new Graphics();
  leftCloseButton.beginFill(0x555555);
  leftCloseButton.fillAlpha = 0.95;
  leftCloseButton.drawRect(center.x - 160, center.y + 90, 320, 50);
  leftCloseButton.tint = 0xDDDDDD;
  leftMenu.addChild(leftCloseButton);

  const leftCloseText = new Text('Close', {
    fontFamily: 'Arial',
    fontSize: 36,
    fill: '#888',
    algin: 'center',
  });
  leftCloseText.anchor.set(0.5);
  leftCloseText.x = center.x;
  leftCloseText.y = center.y + 115;
  leftCloseButton.addChild(leftCloseText);

  leftCloseButton.interactive = true;
  attachButtonHandlers(leftCloseButton);
  leftCloseButton.on('pointerdown', () => {
    coverStages.arenaUserLeft.visible = false;

    // coverStages.arenaMenu.aMenu.practiceButton.interactive = true;
    // coverStages.arenaMenu.aMenu.aiButton.interactive = true;
    coverStages.arenaMenu.aMenu.randomButton.interactive = true;
    // coverStages.arenaMenu.aMenu.rankedButton.interactive = true;
    coverStages.arenaMenu.aMenu.exitButton.interactive = true;

    // coverStages.arenaMenu.aMenu.practiceButton.tint = 0xDDDDDD;
    // coverStages.arenaMenu.aMenu.aiButton.tint = 0xDDDDDD;
    coverStages.arenaMenu.aMenu.randomButton.tint = 0xDDDDDD;
    // coverStages.arenaMenu.aMenu.rankedButton.tint = 0xDDDDDD;

    // coverStages.arenaMenu.aMenu.practiceButton.text.tint = 0xCCCCCC;
    // coverStages.arenaMenu.aMenu.aiButton.text.tint = 0xCCCCCC;
    coverStages.arenaMenu.aMenu.randomButton.text.tint = 0xFFFFFF;
    // coverStages.arenaMenu.aMenu.rankedButton.text.tint = 0xCCCCCC;

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


  const endWindow = new Graphics();
  endWindow.beginFill(0x000000);
  endWindow.fillAlpha = 0.5;
  endWindow.drawRect(0, 0, screenSize.w, screenSize.h);

  endWindow.fillAlpha = 0.95;
  endWindow.drawRect(center.x - 240, center.y - 150, 480, 300);

  coverStages.endMenu.addChild(endWindow);
  coverStages.endMenu.window = endWindow;
  coverStages.endMenu.visible = false;

  const endText = new Text('DRAW', {
    fontFamily: 'Arial',
    fontSize: 128,
    fill: '#888',
    algin: 'center',
  });
  endText.anchor.set(0.5);
  endText.x = center.x;
  endText.y = center.y;
  endWindow.addChild(endText);
  endWindow.text = endText;

  const endCloseButton = new Graphics();
  endCloseButton.beginFill(0x555555);
  endCloseButton.fillAlpha = 0.95;
  endCloseButton.drawRect(center.x - 240, center.y + 150, 480, 50);
  endCloseButton.tint = 0xDDDDDD;
  endWindow.addChild(endCloseButton);
  endWindow.button = endCloseButton;
  endCloseButton.visible = false;

  const endCloseText = new Text('Close', {
    fontFamily: 'Arial',
    fontSize: 36,
    fill: '#888',
    algin: 'center',
  });
  endCloseText.anchor.set(0.5);
  endCloseText.x = center.x;
  endCloseText.y = center.y + 175;
  endCloseButton.addChild(endCloseText);

  endCloseButton.interactive = true;
  attachButtonHandlers(endCloseButton);
  endCloseButton.on('pointerdown', () => {
    coverStages.endMenu.visible = false;
    coverStages.arenaMenu.interactive = true;

    // coverStages.arenaMenu.aMenu.practiceButton.interactive = true;
    // coverStages.arenaMenu.aMenu.aiButton.interactive = true;
    coverStages.arenaMenu.aMenu.randomButton.interactive = true;
    // coverStages.arenaMenu.aMenu.rankedButton.interactive = true;
    coverStages.arenaMenu.aMenu.exitButton.interactive = true;

    // coverStages.arenaMenu.aMenu.practiceButton.tint = 0xDDDDDD;
    // coverStages.arenaMenu.aMenu.aiButton.tint = 0xDDDDDD;
    coverStages.arenaMenu.aMenu.randomButton.tint = 0xDDDDDD;
    // coverStages.arenaMenu.aMenu.rankedButton.tint = 0xDDDDDD;

    // coverStages.arenaMenu.aMenu.practiceButton.text.tint = 0xCCCCCC;
    // coverStages.arenaMenu.aMenu.aiButton.text.tint = 0xCCCCCC;
    coverStages.arenaMenu.aMenu.randomButton.text.tint = 0xFFFFFF;
    // coverStages.arenaMenu.aMenu.rankedButton.text.tint = 0xCCCCCC;

    state = 'menu';
    endCloseButton.visible = false;

    genericDown();
  });
  


  const startButton = new Graphics();
  startButton.beginFill(0x555555);
  startButton.fillAlpha = 0.8;
  startButton.drawRect(320, 213, 640, 142);
  startButton.tint = 0xDDDDDD;

  const startText = new Text('START', {
    fontFamily: 'Arial',
    fontSize: 96,
    fill: '#EEE',
    algin: 'center',
  });
  startText.anchor.set(0.5);
  startText.x = center.x;
  startText.y = center.y - 77;
  startText.tint = 0xFFFFFF;
  startButton.addChild(startText);
  startButton.text = startText;

  startButton.interactive = true;
  attachButtonHandlers(startButton);
  startButton.on('pointerup', () => {
    zoneStages.menu.visible = false;
    zoneStages.arena.visible = true;
    coverStages.arenaMenu.visible = true;
    
    state = 'menu';

    socket.emit('join');

    genericUp();
  });
  
  zoneStages.menu.addChild(startButton);


  const quitButton = new Graphics();
  quitButton.beginFill(0xFF5555);
  quitButton.fillAlpha = 0.8;
  quitButton.drawRect(320, 360, 640, 100);
  quitButton.tint = 0xDDDDDD;

  const quitText = new Text('QUIT', {
    fontFamily: 'Arial',
    fontSize: 90,
    fill: '#EEE',
    algin: 'center',
  });
  quitText.anchor.set(0.5);
  quitText.x = center.x;
  quitText.y = center.y + 50;
  quitText.tint = 0xFFFFFF;
  quitButton.addChild(quitText);
  quitButton.text = quitText;

  quitButton.interactive = true;
  attachButtonHandlers(quitButton);
  quitButton.on('pointerup', () => {
    
    const win = remote.getCurrentWindow();
    win.close(); 
  });
  
  zoneStages.menu.addChild(quitButton);
  

  const startedText = new Text('Started', {
    fontFamily: 'Arial',
    fontSize: 256,
    fill: '#FFF',
    algin: 'center',
  });
  startedText.anchor.set(0.5);
  startedText.x = center.x;
  startedText.y = center.y;
  coverStages.started.addChild(startedText);
  coverStages.started.text = startedText;

  coverStages.started.visible = false;


  // const opponentLocationWindow = new Graphics();
  // opponentLocationWindow.beginFill(0x555555);
  // opponentLocationWindow.lineStyle(5, 0xFFDD33, 1);
  // opponentLocationWindow.fillAlpha = 1;
  // opponentLocationWindow.drawCircle(150, 150, 37);
  //
  // const oProfile = new Sprite(resources[path.join(__dirname, '../assets/profile.png')].texture);
  // oProfile.scale = {
  //  x: 1,
  //  y: 1,
  // };
  // oProfile.anchor.set(0.5);
  // oProfile.x = 150;
  // oProfile.y = 150;
//
  // opponentLocationWindow.addChild(oProfile);
  // opponentLocationWindow.oProfile = oProfile;

  const opponentDist = new Text('Distance to Opponent: 100m', {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: '#FFF',
    algin: 'center',
  });
  opponentDist.anchor.set(0.5);
  opponentDist.x = center.x;
  opponentDist.y = screenSize.h - 60;
  zoneStages.arena.addChild(opponentDist);
  zoneStages.arena.opponentDist = opponentDist;

  // zoneStages.arena.addChild(opponentLocationWindow);
//
  // zoneStages.arena.oLocation = opponentLocationWindow;
  // countdownWindow.text = countdownText;


  const oHorse = new Sprite(resources[path.join(__dirname, '../assets/rohan_horse.png')].texture);
  oHorse.scale = {
    x: -1.25,
    y: 1.25,
  };
  oHorse.x = 5000;
  oHorse.y = 260;

  zoneStages.arena.addChild(oHorse);
  zoneStages.arena.oHorse = oHorse;


  const oLance = new Sprite(resources[path.join(__dirname, '../assets/lance.png')].texture);
  oLance.scale = {
    x: -1,
    y: 1,
  };
  oLance.anchor.set(0.9, 0.9);
  oLance.x = 115;
  oLance.y = 60;
  oLance.rotation = -0.5;

  oHorse.addChild(oLance);
  zoneStages.arena.oHorse.lance = oLance;


  const cHorse = new Sprite(resources[path.join(__dirname, '../assets/rohan_horse.png')].texture);
  cHorse.scale = {
    x: 1.25,
    y: 1.25,
  };
  cHorse.x = 100;
  cHorse.y = 280;

  zoneStages.arena.addChild(cHorse);
  zoneStages.arena.cHorse = cHorse;


  const cLance = new Sprite(resources[path.join(__dirname, '../assets/lance.png')].texture);
  cLance.scale = {
    x: -1,
    y: 1,
  };
  cLance.anchor.set(0.9, 0.9);
  cLance.x = 115;
  cLance.y = 60;
  cLance.rotation = -0.5;

  cHorse.addChild(cLance);
  zoneStages.arena.cHorse.lance = cLance;


  const boostWindow = new Graphics();
  boostWindow.beginFill(0x000000);
  boostWindow.lineStyle(2, 0x444444, 1);
  boostWindow.fillAlpha = 0.5;
  boostWindow.drawRect(-60, 20, 20, 150);

  const boostBar = new Graphics();

  cHorse.addChild(boostWindow);
  cHorse.addChild(boostBar);
  cHorse.boostWindow = boostWindow;
  cHorse.boostWindow.bar = boostBar;


  const lanceWindow = new Graphics();
  lanceWindow.beginFill(0x000000);
  lanceWindow.lineStyle(2, 0x444444, 1);
  lanceWindow.fillAlpha = 0.5;
  lanceWindow.drawRect(-30, 20, 20, 150);

  const lanceBar = new Graphics();

  cHorse.addChild(lanceWindow);
  cHorse.addChild(lanceBar);
  cHorse.lanceWindow = lanceWindow;
  cHorse.lanceWindow.bar = lanceBar;

  requestAnimationFrame(updateLoop);

  zoneStages.arena.visible = false;
  coverStages.arenaMenu.visible = false;
  state = 'startScreen';
};


window.onload = () => {
  renderer = new PIXI.WebGLRenderer(1280, 720);
  renderer.autoResize = true;

  document.body.appendChild(renderer.view);

  startLoader.loadInTextures(init, '../assets/');
};


module.exports = {
  mainStage,
  screenSize,
};
