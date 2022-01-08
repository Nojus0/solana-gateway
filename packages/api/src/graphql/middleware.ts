import base58 from "bs58"
import { IMiddlewareFunction } from "graphql-middleware"
import { IContext } from "../interfaces"
import { Model, UserDocument, UserRedisObject, User } from "shared"

export type APIContext = IContext & { user: UserDocument }

const apiMiddleware: IMiddlewareFunction = async (
  resolve,
  root,
  args,
  ctx: IContext,
  info
) => {
  // * Check if calling from frontend *
  if (ctx.isFrontend) {
    const token = ctx.req.cookies.api_key

    if (!token) throw new Error("Invalid token")

    const [user] = await Model.query("apiKey")
      .eq(token)
      .limit(1)
      .using("apiKey-gsi")
      .exec()

    if (!user) {
      throw new Error("Invalid token")
    }

    return await resolve(
      root,
      args,
      {
        user,
        ...ctx
      },
      info
    )
  }

  // * Calling from backend *
  if (!ctx.req.headers.authorization)
    throw new Error("Api key was not provided.")

  const [authType, token] = ctx.req.headers.authorization.split(" ")
  if (authType !== "Bearer") throw new Error("Invalid authorization type")

  if (!token) throw new Error("No token was provided")

  const [user] = await Model.query("apiKey")
    .eq(token)
    .limit(1)
    .using("apiKey-gsi")
    .exec()

  if (!user) throw new Error("Invalid api key.")

  return await resolve(
    root,
    args,
    {
      user,
      ...ctx
    },
    info
  )
}

const fullDetailsMiddleware: IMiddlewareFunction = async (
  resolve,
  root,
  args,
  ctx: APIContext,
  info
) => {
  if (!ctx.user.walletAddress)
    throw new Error(
      "Your wallet's public key must be added, to perform this action."
    )

  if (!ctx.user.webhooks || ctx.user.webhooks.length < 1)
    throw new Error(
      "You need to add a webhook url to your account in order to perform this action."
    )

  return await resolve(root, args, ctx, info)
}

const apiMiddlewareConsumers = {
  Query: {
    getTransactions: apiMiddleware,
    getTransaction: apiMiddleware,
    currentUser: apiMiddleware
  },
  Mutation: {
    createDepositAddress: apiMiddleware,
    setConfirmed: apiMiddleware,
    regenerateApiKey: apiMiddleware,
    changeWebhook: apiMiddleware,
    setFast: apiMiddleware,
    removeWebhook: apiMiddleware,
    addWebhook: apiMiddleware,
    setPublicKey: apiMiddleware
  }
}

const fullDetailsConsumers = {
  Query: {},
  Mutation: {
    createDepositAddress: fullDetailsMiddleware
  }
}

const middlewares = [apiMiddlewareConsumers, fullDetailsConsumers]

export default middlewares
