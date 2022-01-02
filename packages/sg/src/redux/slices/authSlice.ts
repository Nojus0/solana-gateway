import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: null,
  },
  reducers: {},
});

export const selectAuth = (state: RootState) => state.authSlice;
