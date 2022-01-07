import { configureStore, createSlice } from "@reduxjs/toolkit"
import { authSlice } from "./slices/authSlice"


const store = configureStore({
  reducer: {
    authSlice: authSlice.reducer
  }
})

export type RootState = ReturnType<typeof store.getState>

export const selectAuth = (state: RootState) => state.authSlice

export default store
