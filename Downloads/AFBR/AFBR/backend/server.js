// backend/server.js
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Map of socket.id -> sessionId to manage rooms cleanly[web:76][web:111]
const socketSessionMap = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('chat:join', ({ sessionId }) => {
    if (!sessionId) return;
    socket.join(sessionId);
    socketSessionMap.set(socket.id, sessionId);
    console.log(`Socket ${socket.id} joined room ${sessionId}`);
  });

  socket.on('chat:leave', ({ sessionId }) => {
    if (!sessionId) return;
    socket.leave(sessionId);
    socketSessionMap.delete(socket.id);
    console.log(`Socket ${socket.id} left room ${sessionId}`);
  });

  socket.on('chat:message', (payload) => {
    const { sessionId, content, role = 'user' } = payload || {};
    if (!sessionId || !content) return;
    io.to(sessionId).emit('chat:message', { sessionId, role, content });
  });

  socket.on('disconnect', () => {
    const sessionId = socketSessionMap.get(socket.id);
    if (sessionId) {
      socket.leave(sessionId);
      socketSessionMap.delete(socket.id);
      console.log(`Socket ${socket.id} disconnected from room ${sessionId}`);
    } else {
      console.log(`Socket disconnected: ${socket.id}`);
    }
  });
});

app.set('io', io);

server.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
