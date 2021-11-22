import base58, { decode } from "bs58";
import { IMiddlewareFunction } from "graphql-middleware";
import { createKeyData, IKeyData, readKeyData } from "shared";
import { IContext } from "../interfaces";

// export type IApiMiddlewareContext = IApiRedisObject &
//   IContext & { api_key: string };

export type APIContext = IContext & IKeyData & { api_key: string };

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

  const binary = await ctx.redis.hgetBuffer("api_keys", token);

  if (!binary) throw new Error("Invalid API Key");

  const decoded = readKeyData(binary);
  decoded.requested += 1;

  await ctx.redis.hset("api_keys", token, createKeyData(decoded));

  const context: APIContext = {
    ...ctx,
    ...decoded,
    api_key: token,
  };

  return await resolve(root, args, context, info);
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
