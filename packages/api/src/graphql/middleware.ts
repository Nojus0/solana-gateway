import base58 from "bs58";
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
  // * Check if calling from frontend *
  if (
    ctx.req.headers.origin == process.env.ORIGIN ||
    (process.env.NODE_ENV == "development" &&
      ctx.req.headers.origin == "http://localhost:3000")
  ) {
    if (!ctx.req.cookies.api_key)
      throw new Error("API Key not found in cookies");
    if (
      base58.decode(ctx.req.cookies.api_key).length !=
      parseInt(process.env.API_KEY_LENGTH)
    )
      throw new Error("API Key invalid length");

    const binary = await ctx.redis.hgetBuffer(
      "api_keys",
      ctx.req.cookies.api_key
    );

    if (!binary) throw new Error("API Key not found");

    const userdata = readKeyData(binary);

    const context: APIContext = {
      ...ctx,
      ...userdata,
      api_key: ctx.req.cookies.api_key,
    };

    return await resolve(root, args, context, info);
  }

  // * Calling from backend *
  if (!ctx.req.headers.authorization)
    throw new Error("Api key was not provided.");

  const [authType, token] = ctx.req.headers.authorization.split(" ");
  if (authType !== "Bearer") throw new Error("Invalid authorization type");

  if (token == null) throw new Error("No token was provided");

  const binary = await ctx.redis.hgetBuffer("api_keys", token);

  if (!binary) throw new Error("Invalid API Key");

  const userdata = readKeyData(binary);
  userdata.requested += 1;

  await ctx.redis.hsetBuffer("api_keys", token, createKeyData(userdata));

  const context: APIContext = {
    ...ctx,
    ...userdata,
    api_key: token,
  };

  return await resolve(root, args, context, info);
};

const fullDetailsMiddleware: IMiddlewareFunction = async (
  resolve,
  root,
  args,
  ctx: APIContext,
  info
) => {
  const USER = await UserModel.findById(ctx.uid);

  if (!USER)
    throw new Error(
      "Cache server and Main Database are out of sync. We found you in the cache server but not in the Account server"
    );

  if (!USER.publicKey)
    throw new Error(
      "Your wallet's public key must be added, to perform this action."
    );

  if (!USER.webhook)
    throw new Error(
      "You need to add a webhook url to your account in order to perform this action."
    );

  return await resolve(root, args, ctx, info);
};

const apiMiddlewareConsumers = {
  Query: {
    getTransactions: apiMiddleware,
    currentUser: apiMiddleware,
    getAdressTransactions: apiMiddleware,
  },
  Mutation: {
    createDepositAddress: apiMiddleware,
    setAsProcessed: apiMiddleware,
    regenerateApiKey: apiMiddleware,
    changeWebhook: apiMiddleware,
    setFast: apiMiddleware,
    setWebhook: apiMiddleware,
    setPublicKey: apiMiddleware,
  },
};

const fullDetailsConsumers = {
  Query: {},
  Mutation: {
    createDepositAddress: fullDetailsMiddleware,
  },
};

const middlewares = [apiMiddlewareConsumers, fullDetailsConsumers];

export default middlewares;
