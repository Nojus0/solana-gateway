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
    },
    setFast: (state, action: PayloadAction<boolean>) => {
      state.data.isFast = action.payload
    }
  }
})

export const { setUser, setLoggedOut, removeWebhook, addWebhook, setFast } =
  authSlice.actions

export const selectAuth = (state: RootState) => state.authSlice

export function useFetchCurrent() {
  const user = useSelector(selectAuth)
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!user.fetched) dispatch(currentUserThunk())
  }, [user])
}

export function useRequireAuth() {
  const user = useSelector(selectAuth)
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!user.fetched) dispatch(currentUserThunk())

    if (
      !user.isAuthenticated &&
      !user.isLoading &&
      router.pathname != "/login"
    ) {
      router.push("/login", "/login")
    }
  }, [user])
}
