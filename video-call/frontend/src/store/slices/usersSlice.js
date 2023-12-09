import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  availableUsers: null,
}

export const userSlice = createSlice({
  initialState,
  name: 'userSlice',
  reducers: {
    logout: () => initialState,
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAvailableUsers: (state, action) => {
      state.availableUsers = action.payload;
    }
  } 
})

export default userSlice.reducer;
export const { logout, setUser, setAvailableUsers } = userSlice.actions;