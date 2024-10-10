const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on *:${PORT}`);
});

var players = {};
var stars = {};
var starId = 0;

io.on('connection', (socket) => {
  console.log('a user connected: ', socket.id);

  players[socket.id] = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    color: 0xFFFFFF * Math.random() | 0,
    score: 0
  };

  socket.emit('currentPlayers', players);
  socket.emit('currentStars', stars);

  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('playerMovement', (movementData) => {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });

  const starGenerationInterval = setInterval(() => {
    console.log('a star is added: ', starId);
    
    const starX = Math.floor(Math.random() * 700) + 50;
    const starY = Math.floor(Math.random() * 500) + 50;
    
    starId++;
    const newStar = { x: starX, y: starY, starId: starId };
    stars[starId] = newStar;
    
    io.emit('starGenerated', newStar);
  }, 2000);

  socket.on('starCollected', (collectedStarId) => {
    console.log(`star ${collectedStarId} was collected by: `, socket.id);
        if (stars[collectedStarId]) {
      delete stars[collectedStarId];
      players[socket.id].score += 1;
      io.emit('starRemoved', collectedStarId);
      io.emit('updateScore', { playerId: socket.id, score: players[socket.id].score });
    }
  });

  socket.on('disconnect', () => {
    console.log('player disconnected: ', socket.id);
    delete players[socket.id];
    io.emit('disconnection', socket.id);
    clearInterval(starGenerationInterval);
  });
});