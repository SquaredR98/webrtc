import { createSlice } from "@reduxjs/toolkit"

const initialState = {}

export const callStreamSlice = createSlice({
  initialState,
  name: 'callStatus',
  reducers: {
    addStream: (state, action) => {
      state[action.payload.key] = action.payload.value;
    }
  }
})

export default callStreamSlice.reducer;
export const { addStream } = callStreamSlice.actions;