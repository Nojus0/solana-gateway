import { IMiddlewareFunction } from "graphql-middleware"
import { IJwtToken, Model, UserDocument, verifyToken } from "shared"
import { IContext } from "../../interfaces"
import { rateLimit } from "../../rateLimit"

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
    capacity: 100,
    rate: 2,
    consume: 1
  })

  ctx.res.setHeader("X-RateLimit-Remaining", remaining.toString())
  ctx.res.setHeader("X-RateLimit-Req-Cost", "1")

  if (!allowed) {
    return ctx.res.status(429).send("Too many requests")
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

const apiConsumers = {
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

export default apiConsumers
