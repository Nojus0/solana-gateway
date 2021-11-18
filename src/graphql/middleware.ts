import { IMiddlewareFunction } from "graphql-middleware";
import { IContext } from "../interfaces";

export interface IApiRedisObject {
  uid?: string;
  requested?: number;
}

const apiMiddleware: IMiddlewareFunction = async (
  resolve,
  root,
  args,
  ctx: IContext,
  info
) => {
  if (!ctx.req.headers.authorization)
    throw new Error("Api key was not provided.");
  const [authType, token] = ctx.req.headers.authorization.split(" ");

  if (authType !== "Bearer") throw new Error("Invalid authorization type");

  if (token == null) throw new Error("No token was provided");

  const data_str = await ctx.redis.hget("api_keys", token);

  if (!data_str) throw new Error("Invalid API Key");

  const obj: IApiRedisObject = JSON.parse(data_str);
  obj.requested += 1;

  await ctx.redis.hset("api_keys", token, JSON.stringify(obj));

  return await resolve(root, args, ctx, info);
};

const root = {
  Query: {},
  Mutation: {
    createDepositAddress: apiMiddleware,
  },
};

const middlewares = [root];

export default middlewares;
