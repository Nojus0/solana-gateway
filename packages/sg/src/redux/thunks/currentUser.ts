import { createAsyncThunk } from "@reduxjs/toolkit"
import { GqlInclude } from "../../zeus/custom"
import { setLoggedOut, setUser } from "../slices/authSlice"

const currentUserThunk = createAsyncThunk(
  "user/currentUser",
  async (params, { dispatch, getState, fulfillWithValue, rejectWithValue }) => {
    try {
      const currentUserQuery = await GqlInclude("query")({
        currentUser: {
          apiKey: true,
          email: true,
          isFast: true,
          webhooks: true,
          recieved: true,
          secretKey: true,
          walletAddress: true
        }
      })

      if (currentUserQuery.currentUser) {
        dispatch(setUser(currentUserQuery.currentUser))
        
        fulfillWithValue(currentUserQuery.currentUser)
      }
    } catch (err) {
      dispatch(setLoggedOut())
      rejectWithValue(err)
    }
  }
)

export default currentUserThunk
