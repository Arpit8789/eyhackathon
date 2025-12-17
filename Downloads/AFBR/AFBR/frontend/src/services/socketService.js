import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect(userId) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: { userId }
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      toast.success('Connected to server', { duration: 2000 });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
      toast.error('Disconnected from server', { duration: 2000 });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      toast.error('Connection failed. Retrying...', { duration: 3000 });
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      toast.error(error.message || 'An error occurred', { duration: 3000 });
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners = {};
      console.log('🔌 Socket disconnected manually');
    }
  }

  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected. Attempting to emit:', event);
      toast.error('Not connected. Please refresh.', { duration: 2000 });
      return;
    }
    this.socket.emit(event, data);
  }

  on(event, callback) {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized');
      return;
    }
    
    this.socket.on(event, callback);
    
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    
    this.socket.off(event, callback);
    
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  removeAllListeners(event) {
    if (!this.socket) return;
    
    if (event) {
      this.socket.removeAllListeners(event);
      delete this.listeners[event];
    } else {
      this.socket.removeAllListeners();
      this.listeners = {};
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  getSocketId() {
    return this.socket?.id;
  }
}

export default new SocketService();
