import { createAsyncThunk } from "@reduxjs/toolkit"
import { GqlInclude } from "../../zeus/custom"
import { setLoggedOut, setUser } from "../slices/authSlice"

const currentUserThunk = createAsyncThunk(
  "user/currentUser",
  async (params, { dispatch, getState, fulfillWithValue, rejectWithValue }) => {
    try {
      const currentUserQuery = await GqlInclude("query")({
        currentUser: {
          email: true,
          isFast: true,
          webhooks: true,
          recieved: true,
          walletAddress: true,
          network: true
        }
      })

      if (currentUserQuery.currentUser) {
        dispatch(setUser(currentUserQuery.currentUser))

        fulfillWithValue(currentUserQuery.currentUser)
      } else {
        dispatch(setLoggedOut())
        rejectWithValue("No user found")
      }
    } catch (err) {
      dispatch(setLoggedOut())
      rejectWithValue(err)
    }
  }
)

export default currentUserThunk
