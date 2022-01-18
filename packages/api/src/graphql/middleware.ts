import { IMiddlewareFunction } from "graphql-middleware"
import { IContext } from "../interfaces"
import { Model, UserDocument, verifyToken, IJwtToken } from "shared"
import { rateLimit } from "../rateLimit"

export type APIContext = IContext & { user: UserDocument }

const apiMiddleware: IMiddlewareFunction = async (
  resolve,
  root,
  args,
  ctx: IContext,
  info
) => {
  // * Check if calling from frontend *
  const { allowed, remaining } = await rateLimit({
    redis: ctx.redis,
    category: "api",
    identifier: ctx.req.ip,
    capacity: 5,
    rate: 1 / (3600 * 24),
    consume: 1
  })

  ctx.res.setHeader("X-RateLimit-Remaining", remaining.toString())
  if (!allowed) {
    ctx.res.status(429).send("Too many requests")
  }

  if (ctx.isFrontend) {
    const token = ctx.req.cookies.jwt

    if (!token) throw new Error("Not logged in")

    const userJwt = verifyToken(token) as IJwtToken

    const user = (await Model.get({
      pk: `USER#${userJwt.email}`,
      sk: `NET#${userJwt.network}`
    })) as UserDocument

    if (!user) {
      ctx.res.clearCookie("jwt")
      throw new Error(
        "Authentication token is valid, but user does not exist. Please log in again."
      )
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
    keys: apiMiddleware,
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
