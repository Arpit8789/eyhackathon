// frontend/src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice.js';
import userReducer from './userSlice.js';

const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: userReducer
  }
});

export default store;
