import { IMiddlewareFunction } from "graphql-middleware";
import { createKeyData, IKeyData, readKeyData, UserModel } from "shared";
import { IContext } from "../interfaces";

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

  await ctx.redis.hsetBuffer("api_keys", token, createKeyData(decoded));

  const context: APIContext = {
    ...ctx,
    ...decoded,
    api_key: token,
  };

  return await resolve(root, args, context, info);
};

const rootApi = {
  Query: {
    getTransactions: apiMiddleware,
  },
  Mutation: {
    createDepositAddress: apiMiddleware,
    setAsProcessed: apiMiddleware,
    regenerateApiKey: apiMiddleware,
    changeWebhook: apiMiddleware,
    setFast: apiMiddleware,
  },
};

const middlewares = [rootApi];

export default middlewares;
