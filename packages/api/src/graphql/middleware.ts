import base58 from "bs58"
import { IMiddlewareFunction } from "graphql-middleware"
import { IContext } from "../interfaces"
import { Model, UserDocument, UserRedisObject } from "shared"

export type APIContext = IContext & UserRedisObject & { ak: string }

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

    const data: UserRedisObject = JSON.parse(await ctx.redis.get(token))

    if (!data) {
      throw new Error("Invalid token")
    }

    data.rq += 1
    await ctx.redis.set(token, JSON.stringify(data))
    return await resolve(
      root,
      args,
      {
        ...ctx,
        ...data,
        ak: token
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

  const data: UserRedisObject = JSON.parse(await ctx.redis.get(token))

  if (!data) throw new Error("Invalid token")

  data.rq += 1
  await ctx.redis.set(token, JSON.stringify(data))
  return await resolve(
    root,
    args,
    {
      ...ctx,
      ...data,
      ak: token
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
  const USER = (await Model.get({
    pk: `USER#${ctx.u}`,
    sk: `NET#${ctx.n}`
  })) as UserDocument

  if (!USER)
    throw new Error(
      "Cache server and Main Database are out of sync. We found you in the cache server but not in the Account server"
    )

  if (!USER.walletAddress)
    throw new Error(
      "Your wallet's public key must be added, to perform this action."
    )

  if (!USER.webhooks || USER.webhooks.length < 1)
    throw new Error(
      "You need to add a webhook url to your account in order to perform this action."
    )

  return await resolve(root, args, ctx, info)
}

const apiMiddlewareConsumers = {
  Query: {
    getTransactions: apiMiddleware,
    currentUser: apiMiddleware,
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
