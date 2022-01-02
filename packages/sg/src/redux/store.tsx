import { configureStore, createSlice } from "@reduxjs/toolkit";
import { authSlice } from "./slices/authSlice";
import { headerSlice } from "./slices/headerSlice";

const store = configureStore({
  reducer: {
    authSlice: authSlice.reducer,
    headerSlice: headerSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export const selectAuth = (state: RootState) => state.authSlice;

export default store;
