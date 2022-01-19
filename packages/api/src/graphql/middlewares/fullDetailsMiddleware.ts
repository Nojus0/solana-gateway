import { IMiddlewareFunction } from "graphql-middleware"
import { APIContext } from "./apiMiddleware"

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

const fullDetailsConsumers = {
  Query: {},
  Mutation: {
    createDepositAddress: fullDetailsMiddleware
  }
}

export default fullDetailsConsumers
