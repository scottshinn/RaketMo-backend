const db = require('../models/index');
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
require('dotenv').config();
const Notify = require('../libs/notifications');


function setupSocketEvents(socket, io) {

  
  socket.on('ConncetedChat', (user_id) => {
    console.log('---------room_id--------', user_id);
    socket.join(user_id);
    socket.broadcast.to(user_id).emit('ConncetedChat', user_id);
  });


  socket.on('newMessage', (message) => {
    try {
      console.log('-----newMessage-----', message);
      socket.broadcast.to(message.room_id).emit('newMessage', message);
      // io.to(message.room_id).emit('newMessage', message);
    } catch (err) {
      console.log('------err-----', err);
    }
  });


  socket.on('leaveChat', (id) => {
    try {
      socket.leave(id);
      socket.broadcast.to(id).emit('leaveChat', id);
    } catch (err) {
      console.log('------err-----', err);
    }
  });


  socket.on('type', (typing) => {
    try {
      console.log('-----type----', typing);
      socket.broadcast.to(typing.room_id).emit('type', typing);
    } catch (err) {
      console.log('------err-----', err);
    }
  });

  socket.on('typing', (typing) => {
    try {
      console.log('-----typing----', typing);
      socket.broadcast.to(typing.room_id).emit('typing', typing);
    } catch (err) {
      console.log('------err-----', err);
    }
  });

  socket.on('ChatStatus', (details) => {
    try {
      console.log('-----ChatStatus----', details);
      socket.broadcast.to().emit('ChatStatus', details);
    } catch (err) {
      console.log('------err-----', err);
    }
  });


  socket.on('error', error => {
    console.error('Socket error:', error);
    // You can take further actions here, such as closing the socket or logging the error to a file
  });

  // Handle socket disconnections
  socket.on('disconnect', reason => {
    console.log('Socket disconnected:', reason);
    // socket.leave(user_id)
    // You can log the reason for disconnection and take appropriate actions if needed
  });
}


module.exports = {
  setupSocketEvents,
};
