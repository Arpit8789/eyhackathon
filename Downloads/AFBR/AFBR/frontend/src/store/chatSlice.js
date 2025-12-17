// frontend/src/store/chatSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sessionId: null,
  messages: [], // { id, role, content, intent?, timestamp }
  isTyping: false,
  channel: 'web'
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSessionId(state, action) {
      state.sessionId = action.payload;
    },
    setChannel(state, action) {
      state.channel = action.payload;
    },
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
    setMessages(state, action) {
      state.messages = action.payload || [];
    },
    setTyping(state, action) {
      state.isTyping = action.payload;
    },
    resetChat(state) {
      state.sessionId = null;
      state.messages = [];
      state.isTyping = false;
      state.channel = 'web';
    }
  }
});

export const {
  setSessionId,
  setChannel,
  addMessage,
  setMessages,
  setTyping,
  resetChat
} = chatSlice.actions;

export default chatSlice.reducer;
