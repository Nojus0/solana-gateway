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
    onError?: (message: string) => void
    onSuccess?: (user: CurrentUser) => void
  }
>(
  "user/register",
  async (
    { email, network, password, onSuccess, onError },
    { dispatch, getState, rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const loginMutation = await GqlInclude("mutation")(
        {
          createUser: [
            {
              email: $`email`,
              network: $`network`,
              password: $`password`
            },
            {
              email: true,
              apiKey: true,
              isFast: true,
              webhooks: true,
              walletAddress: true,
              secretKey: true,
              recieved: true,
              __typename: true
            }
          ]
        },
        {
          operationName: "register",
          variables: {
            email,
            password,
            network
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
