import { gql } from "apollo-server-lambda"
import {
  isUrlValid,
  Model,
  UserDocument,
  UserRedisObject,
  generateUserApiKey
} from "shared"
import crypto from "crypto"
import base58 from "bs58"
import { IContext } from "../interfaces"
import { APIContext } from "../graphql/middleware"
import bcrypt from "bcryptjs"
import util from "util"
import { CookieOptions } from "express"
import validator from "validator"

export const userTypeDefs = gql`
  type CurrentUser {
    email: String!
    recieved: Float!
    apiKey: String!
    isFast: Boolean!
    secretKey: String!
    webhooks: [String!]!
    walletAddress: String
  }

  type BasicUser {
    email: String!
    recieved: Float!
    apiKey: String!
  }

  extend type Query {
    currentUser: CurrentUser
  }

  extend type Mutation {
    createUser(email: String!, password: String!, network: String!): CurrentUser
    changeWebhook(newUrl: String!): String
    regenerateApiKey: String
    setFast(newFast: Boolean!): Boolean
    setPublicKey(newPublicKey: String!): String
    addWebhook(newUrl: String!): [String!]
    removeWebhook(removeUrl: String!): [String!]
    login(
      email: String!
      password: String!
      remember: Boolean!
      network: String!
    ): CurrentUser
    signOut: Boolean
  }
`

interface ICreateUser {
  email: string
  password: string
  network: string
}

const UserResolver = {
  Mutation: {
    createUser: async (
      _,
      { password, network, email }: ICreateUser,
      { res, isFrontend }: IContext
    ) => {
      email = email.toLowerCase()

      if (!validator.isEmail(email)) throw new Error("Invalid email")
      if (!validator.isStrongPassword(password, { minLength: 6 }))
        throw new Error("Password is too weak")

      const NETWORK = await Model.get({ pk: `NET#${network}`, sk: "DETAILS" })
      if (!NETWORK) throw new Error("Network does not exists")

      const SALT = await bcrypt.genSalt(5)
      const HASH = await bcrypt.hash(password, SALT)

      try {
        const usr = (await Model.create({
          pk: `USER#${email}`,
          sk: `NET#${network}`,
          password: HASH,
          email,
          network
        })) as UserDocument

        if (isFrontend)
          res.cookie("api_key", usr.apiKey, {
            httpOnly: true,
            secure: process.env.NODE_ENV != "development",
            maxAge: 1000 * 60 * 60 * 24 * 7
          })

        return {
          ...usr,
          email
        }
      } catch (err: any) {
        console.log(err)
        if (err.code === "ConditionalCheckFailedException") {
          throw new Error("User with the specified email already exists")
        }
        throw new Error("An unknown error occurred while creating user")
      }
    },
    setPublicKey: async (_, params, { user }: APIContext) => {
      if (params.newPublicKey.includes(process.env.FEE_RECIEVER_WALLET))
        throw new Error("Invalid public key")

      // * PUBLIC KEY MUST BE 32 BYTES LONG *
      if (base58.decode(params.newPublicKey).length != 32)
        throw new Error(
          "Public key is incorrect or isn't 32 bytes long, make sure its base58 encoded."
        )

      try {
        user.walletAddress = params.newPublicKey
        await user.save()
        return user.walletAddress
      } catch (err) {
        console.log(err)
        throw new Error("Error updating public key")
      }
    },
    addWebhook: async (_, params, { user }: APIContext) => {
      if (!isUrlValid(params.newUrl)) throw new Error("Invalid host")

      try {
        if (user.webhooks.length >= user.maxWebhooks) {
          throw new RangeError(
            "You have reached the maximum number of webhooks"
          )
        }

        const newUrl = new URL(params.newUrl)

        const isDuplicate = user.webhooks.some(
          urlStr => new URL(urlStr).href == newUrl.href
        )

        if (isDuplicate)
          throw new RangeError("The specified webhook uri is already added")

        user.webhooks.push(params.newUrl)
        await user.save()

        return user.webhooks
      } catch (err) {
        if (err instanceof RangeError) throw err

        console.log(err)
        throw new Error("Error occurred when adding webhook")
      }
    },
    removeWebhook: async (_, params, { user }: APIContext) => {
      try {
        const removeUrl = new URL(params.removeUrl)

        const isExists = user.webhooks.some(
          urlStr => new URL(urlStr).href == removeUrl.href
        )

        if (!isExists)
          throw new RangeError("The specified webhook url does not exists")

        user.webhooks = user.webhooks.filter(
          urlStr => new URL(urlStr).href != removeUrl.href
        )

        await user.save()

        return user.webhooks
      } catch (err) {
        if (err instanceof RangeError) throw err

        console.log(err)
        throw new Error("Error occurred when adding webhook")
      }
    },
    regenerateApiKey: async (_, params, { user }: APIContext) => {
      try {
        const newKey = generateUserApiKey()

        user.apiKey = newKey

        // ! CHECK !
        await user.save()
        return newKey
      } catch (err) {
        console.log(err)
        throw new Error("Error occurred while regenerating the API Key.")
      }
    },
    setFast: async (_, params, { user }: APIContext) => {
      try {
        user.isFast = params.newFast
        await user.save()

        return user.isFast
      } catch (err) {
        console.log(err)
        throw new Error("Error occurred while setting new Fast Mode.")
      }
    },
    login: async (_, params, { res }: IContext) => {
      params.email = params.email.toLowerCase()
      if (!validator.isEmail(params.email)) throw new Error("Invalid email")

      const USER = (await Model.get({
        pk: `USER#${params.email}`,
        sk: `NET#${params.network}`
      })) as UserDocument

      if (!USER) throw new Error("Incorrect email or password")

      if (!(await bcrypt.compare(params.password, USER.password)))
        throw new Error("Incorrect email or password")

      const cookie: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV != "development",
        maxAge: 1000 * 60 * 60 * 24 * 7
      }

      if (!params.remember) delete cookie.maxAge

      res.cookie("api_key", USER.apiKey, cookie)

      return USER
    },
    signOut: async (_, params, ctx: IContext) => {
      ctx.res.clearCookie("api_key")
      return true
    }
  },
  Query: {
    currentUser: async (_, params, { user }: APIContext) => {
      try {
        return user
      } catch (err) {
        console.log(err)
        throw new Error("Error occurred while getting current user.")
      }
    }
  }
}

export default UserResolver
