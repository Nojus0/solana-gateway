import { createAsyncThunk } from "@reduxjs/toolkit"
import { CurrentUser } from "shared"
import { $, Gql, GraphQLError } from "../../zeus"
import { GqlInclude } from "../../zeus/custom"
import { setLoggedOut, setUser } from "../slices/authSlice"

const loginThunk = createAsyncThunk<
  any,
  {
    email: string
    password: string
    network: string
    onError?: (message: string) => void
    onSuccess?: (user: CurrentUser) => void
  }
>(
  "user/login",
  async (
    { email, network, password, onSuccess, onError },
    { dispatch, getState, rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const loginMutation = await GqlInclude("mutation")(
        {
          login: [
            {
              email: $`email`,
              network: $`network`,
              remember: $`remember`,
              password: $`password`
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
          operationName: "login",
          variables: {
            email,
            password,
            network,
            remember: true
          }
        }
      )

      if (loginMutation.login) {
        dispatch(setUser(loginMutation.login))

        fulfillWithValue(loginMutation.login)
        onSuccess && onSuccess(loginMutation.login)
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

export default loginThunk
