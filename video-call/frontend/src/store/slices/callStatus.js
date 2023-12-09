import { createSlice } from "@reduxjs/toolkit"

/**
 * Video Feed Status: 
 *    - 'off': Media Not Available
 *    - 'enabled': Media available and enabled
 *    - 'disabled': Media available but disabled
 *    - 'complete': Media removed as call is completed
 * 
 * Audio Statuses:
 *    - off 
 */

const initialState = {
  current: 'idle',  // progress, negotiate, complete
  video: 'off',
  audio: 'off',
  audioDevice: 'default',
  videoDevice: 'default',
  shareScreen: false,
  haveMedia: false, // Track if there is a local stream or not
  haveCreatedOffer: false,
  offeredTo: null
}

export const callStatusSlice = createSlice({
  initialState,
  name: 'callStatus',
  reducers: {
    updateCallStatus: (state, action) => {
      state[action.payload.key] = action.payload.value;
    }
  }
})

export default callStatusSlice.reducer;
export const { updateCallStatus } = callStatusSlice.actions;