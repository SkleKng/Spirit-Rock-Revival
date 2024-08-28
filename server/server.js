const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow requests from your frontend
        methods: ["GET", "POST"]
      }
});

const decals = [];

io.on('connection', (socket) => {
  console.log('a user connected');
  
  // Send existing decals to the newly connected user
  socket.emit('initial-decals', decals);

  // Handle new decals
  socket.on('new-decal', (decal) => {
    const simpleDecal = {
      position: {
        x: decal.position.x,
        y: decal.position.y,
        z: decal.position.z,
      },
      normal: {
        x: decal.normal.x,
        y: decal.normal.y,
        z: decal.normal.z,
      },
      color: decal.color,
      size: decal.size,
    };
  
    decals.push(simpleDecal);
    io.emit('new-decal', simpleDecal); // Broadcast to all users
  });
  

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});