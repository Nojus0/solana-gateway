import { createAsyncThunk } from "@reduxjs/toolkit"
import { CurrentUser } from "shared"
import { $, Gql, GraphQLError } from "../../zeus"
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
  "user/signup",
  async (
    { email, network, password, onSuccess, onError },
    { dispatch, getState }
  ) => {
    try {
      const signUpMutation = await Gql("mutation")(
        {
          createUser: [
            {
              email: $`email`,
              network: $`network`,
              remember: $`remember`,
              password: $`password`
            },
            {
              apiKey: true,
              email: true,
              isFast: true,
              webhooks: true,
              walletAddress: true,
              secretKey: true,
              recieved: true
            }
          ]
        },
        {
          operationName: "signup",
          variables: {
            email,
            password,
            network,
            remember: true
          }
        }
      )

      if (signUpMutation.createUser) {
        dispatch(setUser(signUpMutation.createUser))
        onSuccess && onSuccess(signUpMutation.createUser)
      }
    } catch (err) {
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
