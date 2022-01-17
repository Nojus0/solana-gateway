import { createAsyncThunk } from "@reduxjs/toolkit"
import { CurrentUser } from "shared"
import { $, GraphQLError } from "../../zeus"
import { GqlInclude } from "../../zeus/custom"
import { setLoggedOut, setUser } from "../slices/authSlice"

const signUpThunk = createAsyncThunk<
  any,
  {
    email: string
    password: string
    network: string
    acceptedTerms: boolean
    // token: string
    onError?: (message: string) => void
    onSuccess?: (user: CurrentUser) => void
  }
>(
  "user/register",
  async (
    { email, network, password, acceptedTerms, onSuccess, onError },
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
              acceptedTerms: $`acceptedTerms`
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
            acceptedTerms,
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
