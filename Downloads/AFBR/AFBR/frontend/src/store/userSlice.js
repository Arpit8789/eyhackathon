// frontend/src/store/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: null,
  name: 'Guest',
  email: '',
  loyaltyTier: 'Bronze',
  loyaltyPoints: 0
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      const { id, name, email, loyaltyTier, loyaltyPoints } = action.payload;
      state.id = id;
      state.name = name || state.name;
      state.email = email || state.email;
      state.loyaltyTier = loyaltyTier || state.loyaltyTier;
      state.loyaltyPoints = loyaltyPoints ?? state.loyaltyPoints;
    },
    resetUser() {
      return initialState;
    }
  }
});

export const { setUser, resetUser } = userSlice.actions;

export default userSlice.reducer;
