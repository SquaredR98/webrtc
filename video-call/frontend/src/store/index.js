import { configureStore } from "@reduxjs/toolkit";
import { userLoginApi } from "./api/login";
import userReducer from "./slices/usersSlice";
import { userFetchApi } from "./api/user";
import callStatusReducer from "./slices/callStatus";
import streamsSlice from "./slices/streamsSlice";

export const store = configureStore({
  reducer: {
    [userLoginApi.reducerPath]: userLoginApi.reducer,
    [userFetchApi.reducerPath]: userFetchApi.reducer,
    userState: userReducer,
    callStatus: callStatusReducer,
    streams: streamsSlice
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({ serializableCheck: false })
      .concat(userLoginApi.middleware)
      .concat(userFetchApi.middleware);
  },
});
