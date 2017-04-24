const ipc = require('electron').ipcRenderer;

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const loader = require('pixi.js').loader;


const loadInTextures = (callback, _directory) => {
  
  const dir = _directory || '../assets/';
  
  const files = glob.sync(path.join(__dirname, `${dir}*.png`));
  
  if (process.platform === 'win32') {
    for (let i = 0; i < files.length; i++) {
      files[i] = files[i].replace(/\//g,"\\");
    }
  }
  
  console.dir(files);
  
  if (callback) {
    loader.add(files).load(callback);
  }
}

module.exports = {
  loadInTextures,
};