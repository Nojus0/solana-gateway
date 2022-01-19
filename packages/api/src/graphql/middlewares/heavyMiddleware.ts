import { IMiddlewareFunction } from "graphql-middleware"
import { IJwtToken, Model, UserDocument, verifyToken } from "shared"
import { IContext } from "../../interfaces"
import { rateLimit } from "../../rateLimit"

const headyMiddleware: IMiddlewareFunction = async (
  resolve,
  root,
  args,
  ctx: IContext,
  info
) => {
  // * Check if calling from frontend *

  const { allowed, remaining } = await rateLimit({
    redis: ctx.redis,
    category: "auth",
    identifier: ctx.req.ip,
    capacity: 6,
    rate: 1 / ((3600 * 24) / 6),
    consume: 1
  })

  ctx.res.setHeader("X-RateLimit-Remaining", remaining.toString())
  ctx.res.setHeader("X-RateLimit-Req-Cost", "1")

  if (!allowed) {
    return ctx.res.status(429).send("Too many requests")
  }

  return await resolve(root, args, ctx, info)
}

const heavyConsumers = {
  Mutation: {
    createUser: headyMiddleware
  }
}

export default heavyConsumers
