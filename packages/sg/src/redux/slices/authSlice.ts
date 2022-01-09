import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { CurrentUser } from "shared"
import { useDispatch, useSelector } from "react-redux"
import currentUserThunk from "../thunks/currentUser"
import { useEffect } from "react"
import { useRouter } from "next/router"

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  fetched: false,
  network: "dev" as "dev" | "main",
  data: null as unknown as CurrentUser
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<CurrentUser>) => {
      state.isAuthenticated = true
      state.isLoading = false
      state.fetched = true
      state.data = action.payload
    },
    setLoggedOut: state => {
      state.isAuthenticated = false
      state.fetched = true
      state.isLoading = false
      state.data = {} as CurrentUser
    },
    removeWebhook: (state, action: PayloadAction<string>) => {
      state.data.webhooks = state.data.webhooks.filter(
        webhook => webhook !== action.payload
      )
    },
    addWebhook: (state, action: PayloadAction<string>) => {
      state.data.webhooks.push(action.payload)
    }
  }
})

export const { setUser, setLoggedOut, removeWebhook, addWebhook } =
  authSlice.actions

export const selectAuth = (state: RootState) => state.authSlice

export function useRequireAuth() {
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector(selectAuth)

  useEffect(() => {
    if (!user.fetched) dispatch(currentUserThunk())

    if (!user.isAuthenticated && !user.isLoading) {
      router.push("/login")
    }
  }, [user])
}
