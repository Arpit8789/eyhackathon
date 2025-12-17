// frontend/src/services/apiService.js
import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${apiBaseURL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const sendChatMessage = async ({ message, sessionId, userId, channel }) => {
  const res = await api.post('/chat', {
    message,
    sessionId,
    userId,
    channel
  });
  return res.data;
};

export const fetchSessionContext = async (sessionId) => {
  const res = await api.get(`/chat/session/${sessionId}`);
  return res.data;
};

export const listProducts = async (params = {}) => {
  const res = await api.get('/products', { params });
  return res.data;
};

export const getProductBySku = async (sku) => {
  const res = await api.get(`/products/${sku}`);
  return res.data;
};

export const createOrder = async (payload) => {
  const res = await api.post('/orders', payload);
  return res.data;
};

export const getOrderById = async (orderId) => {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
};

export const registerUser = async ({ name, email }) => {
  const res = await api.post('/users/register', { name, email });
  return res.data;
};
