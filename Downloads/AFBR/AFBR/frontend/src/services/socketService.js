// frontend/src/services/socketService.js
import { io } from 'socket.io-client';

const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(socketURL, {
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

export const joinChatRoom = (sessionId) => {
  if (!socket || !sessionId) return;
  socket.emit('chat:join', { sessionId });
};

export const leaveChatRoom = (sessionId) => {
  if (!socket || !sessionId) return;
  socket.emit('chat:leave', { sessionId });
};

export const onChatMessage = (handler) => {
  if (!socket) return;
  socket.on('chat:message', handler);
};

export const offChatMessage = (handler) => {
  if (!socket) return;
  socket.off('chat:message', handler);
};

export const emitChatMessage = (payload) => {
  if (!socket) return;
  socket.emit('chat:message', payload);
};

export const getSocket = () => socket;
