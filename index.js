const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

let rooms = {}; // 存储房间信息

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
})

app.get('/', (req, res) => {
  
});

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('join_room', ({ room, nickname }) => {
    // 如果不存在房间，则先初始化房间为空
    if (!rooms[room]) {
      rooms[room] = []
    }
    // 将nickname加入该房间
    rooms[room].push(nickname)
    socket.join(room); // 使用socket.io API将用户加入到指定的房间
    socket.emit('connected', socket.id); // 告诉客户端房间已初始化
    io.to(room).emit('user_join', {users: rooms[room]})
    console.log(`${nickname} joined room ${room}`);
  });

  // // 用户断开连接
  // socket.on('disconnect', () => {
  //   delete peers[socket.id]; // 删除用户的信息
  //   console.log('Client disconnected');
  // });

  // 接收offer
  socket.on('offer', (offer, room) => {
    const findRoom = rooms[room];
    if (findRoom) {
      console.log('get offer');
      socket.broadcast.to(room).emit('offer', {offer, sid: socket.id}); // 将offer广播到同一房间内的所有用户
    }
  });

  // 接收answer和对方的sid
  socket.on('answer', (answer, room, sid) => {
    const findRoom = rooms[room];
    if (findRoom) {
      console.log('get answer');
      socket.broadcast.to(room).emit('answer', {answer, sid: sid}); // 将answer广播到同一房间内的所有用户
    }
  });

  // 接收ICE candidates
  socket.on('ice-candidate', ({room, sid, label, candidate}) => {
    const findRoom = rooms[room];
    if (findRoom) {
      socket.broadcast.to(room).emit('ice-candidate', {candidate, label, sid: sid}); // 将ICE candidate广播到同一房间内的所有用户
    }
  });

})

server.listen(3000, () => {
  console.log('Server is running on port 3000')
})