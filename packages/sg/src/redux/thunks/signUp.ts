import { createAsyncThunk } from "@reduxjs/toolkit"
import { CurrentUser } from "shared"
import { $, Gql, GraphQLError } from "../../zeus"
import { GqlInclude } from "../../zeus/custom"
import { setLoggedOut, setUser } from "../slices/authSlice"

const signUpThunk = createAsyncThunk<
  any,
  {
    email: string
    password: string
    network: string
    token: string
    onError?: (message: string) => void
    onSuccess?: (user: CurrentUser) => void
  }
>(
  "user/register",
  async (
    { email, network, password, token, onSuccess, onError },
    { dispatch, getState, rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const loginMutation = await GqlInclude("mutation")(
        {
          createUser: [
            {
              email: $`email`,
              network: $`network`,
              password: $`password`,
              token: $`token`
            },
            {
              email: true,
              isFast: true,
              webhooks: true,
              walletAddress: true,
              recieved: true,
              network: true
            }
          ]
        },
        {
          operationName: "register",
          variables: {
            email,
            password,
            network,
            token
          }
        }
      )

      if (loginMutation.createUser) {
        dispatch(setUser(loginMutation.createUser))

        fulfillWithValue(loginMutation.createUser)
        onSuccess && onSuccess(loginMutation.createUser)
      }
    } catch (err) {
      rejectWithValue(err)
      dispatch(setLoggedOut())
      if (!onError) return

      if (err instanceof GraphQLError && err.response?.errors) {
        onError(err.response.errors.map((e: any) => e.message).join("\n"))
      }

      if (err instanceof TypeError) {
        onError("Please check your internet connection")
      }
    }
  }
)

export default signUpThunk
