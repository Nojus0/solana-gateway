import { gql } from "apollo-server-lambda"
import {
  isUrlValid,
  Model,
  UserDocument,
  generateUserApiKey,
  generateSecretKey,
  createToken
} from "shared"
import base58 from "bs58"
import { IContext } from "../interfaces"
import { APIContext } from "../graphql/middleware"
import bcrypt from "bcryptjs"
import { CookieOptions } from "express"
import validator from "validator"

export const userTypeDefs = gql`
  type CurrentUser {
    email: String!
    recieved: Float!
    network: String!
    isFast: Boolean!
    webhooks: [String!]!
    walletAddress: String
  }

  type BasicUser {
    email: String!
    recieved: Float!
  }

  extend type Query {
    currentUser: CurrentUser
  }

  type Keys {
    secretKey: String!
    apiKey: String!
  }

  extend type Mutation {
    createUser(
      email: String!
      password: String!
      acceptedTerms: Boolean!
      network: String! # token: String!
    ): CurrentUser
    changeWebhook(newUrl: String!): String
    regenerateApiKey: String
    setFast(newFast: Boolean!): Boolean
    setPublicKey(newPublicKey: String!): String
    addWebhook(newUrl: String!): [String!]
    removeWebhook(removeUrl: String!): [String!]
    keys: Keys
    login(
      email: String!
      password: String!
      remember: Boolean!
      network: String! # token: String!
    ): CurrentUser
    signOut: Boolean
  }
`

interface ICreateUser {
  email: string
  password: string
  network: string
  acceptedTerms: boolean
  // token: string
}

const UserResolver = {
  Mutation: {
    createUser: async (
      _,
      { password, network, email, acceptedTerms }: ICreateUser,
      { res, isFrontend, req }: IContext
    ) => {
      email = email.toLowerCase()
      // const resp = await hcaptcha.verify(
      //   process.env.HCAPTCHA_SECRET!,
      //   token,
      //   req.ip
      // )

      // if (!resp.success) throw new Error("Invalid Captcha.")

      if (!acceptedTerms)
        throw new Error(
          "You must agree to the terms and conditions and privacy policy"
        )

      if (!validator.isEmail(email)) throw new Error("Invalid email")
      if (!validator.isLength(password, { min: 6 }))
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
          network,
          acceptedTerms,
          acceptedTime: Date.now(),
          acceptedVersion: 1,
          ip: req.ip
        })) as UserDocument

        if (isFrontend)
          res.cookie("jwt", createToken({ email, network }), {
            httpOnly: true,
            secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 1,
            sameSite: "none"
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

      // const resp = await hcaptcha.verify(
      //   process.env.HCAPTCHA_SECRET!,
      //   params.token,
      //   params.ip
      // )

      // if (!resp.success) throw new Error("Invalid Captcha.")

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
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 1,
        sameSite: "none"
      }

      if (!params.remember) delete cookie.maxAge

      res.cookie(
        "jwt",
        createToken({ email: USER.email, network: USER.network }),
        cookie
      )

      return USER
    },
    keys: async (_, params, { user }: APIContext) => {
      const diff = Date.now() - user.lastRegen
      console.log(diff)
      if (diff < 1000 * 60 * 60) {
        throw new Error("You can regenerate a new key only once an hour.")
      }

      user.lastRegen = Date.now()
      user.secretKey = generateSecretKey()
      user.apiKey = generateUserApiKey()
      await user.save()

      return {
        secretKey: user.secretKey,
        apiKey: user.apiKey
      }
    },
    signOut: async (_, params, ctx: IContext) => {
      ctx.res.cookie("jwt", "", {
        httpOnly: true,
        secure: true,
        expires: new Date(0),
        sameSite: "none"
      })
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
