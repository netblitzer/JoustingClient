let socket;
const path = require('path');
const fs = require('fs');
const url = require('url');

const Message = require('./Types/Message.js');

const connectToServer = () => {
  //socket = require('socket.io-client')('http://localhost:3000');
  
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
};



module.exports = {
  connectToServer,
};