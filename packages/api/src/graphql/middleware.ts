import { IMiddlewareFunction } from "graphql-middleware";
import { IContext } from "../interfaces";

export interface IApiRedisObject {
  uid: string;
  requested: number;
}

// export type IApiMiddlewareContext = IApiRedisObject &
//   IContext & { api_key: string };

export type IApiMiddlewareContext = {
  primitive: IContext;
  redisData: IApiRedisObject;
  api_key: string;
};

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

  const Context: IApiMiddlewareContext = {
    api_key: token,
    primitive: ctx,
    redisData: obj,
  };

  return await resolve(root, args, Context, info);
};

const root = {
  Query: {
    getTransactions: apiMiddleware,
  },
  Mutation: {
    createDepositAddress: apiMiddleware,
    setAsProcessed: apiMiddleware,
    regenerateApiKey: apiMiddleware,
    changeWebhook: apiMiddleware,
  },
};

const middlewares = [root];

export default middlewares;
