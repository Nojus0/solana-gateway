import { gql } from "apollo-server-core";
import { UserModel } from "shared";
import crypto from "crypto";
import argon2, { argon2id } from "argon2";
import base58 from "bs58";
import { IContext } from "../interfaces";
import { IApiMiddlewareContext, IApiRedisObject } from "../graphql/middleware";
export const userTypeDefs = gql`
  type User {
    webhook: String!
    email: String!
    api_key: String!
    publicKey: String!
  }

  extend type Mutation {
    createUser(
      email: String!
      password: String!
      webhook: String!
      publicKey: String!
    ): User
    changeWebhook(newUrl: String!): String
    regenerateApiKey: String
  }
`;

function webhookUrlValid(web: string) {
  const url = new URL(web);

  return (
    process.env.NODE_ENV != "development" &&
    (url.hostname == "localhost" ||
      url.hostname == "127.0.0.1" ||
      url.protocol != "https:")
  );
}

const UserResolver = {
  Mutation: {
    createUser: async (_, { password, ...rest }, ctx: IContext) => {
      const HASH = await argon2.hash(password, { type: argon2id });
      const api_key = base58.encode(crypto.randomBytes(24));

      if (webhookUrlValid(rest.webhook)) throw new Error("Invalid host");

      try {
        const usr = await UserModel.create({
          ...rest,
          argon2: HASH,
          api_key,
          lamports_recieved: 0,
        });
        const redis_object: IApiRedisObject = {
          requested: 0,
          uid: usr.id,
        };
        await ctx.redis.hset("api_keys", api_key, JSON.stringify(redis_object));
        await usr.save();
        return usr;
      } catch (err: any) {
        if (err.code == 11000) {
          throw new Error(`The specified email is already registered.`);
        }

        throw new Error(
          "Unknown error: is your webhook less than 1024 characters and email 128 characters?"
        );
      }
    },
    changeWebhook: async (_, params, { redisData }: IApiMiddlewareContext) => {
      if (webhookUrlValid(params.newUrl)) throw new Error("Invalid host");

      const user = await UserModel.findById(redisData.uid);

      user.webhook = params.newUrl;

      await user.save();

      return params.newUrl;
    },
    regenerateApiKey: async (
      _,
      params,
      { primitive, api_key, redisData }: IApiMiddlewareContext
    ) => {
      const new_api_key = base58.encode(crypto.randomBytes(24));

      const user = await UserModel.findById(redisData.uid);
      user.api_key = new_api_key;
      user.save();      
      
      await primitive.redis.hdel("api_keys", api_key);
      
      redisData.requested += 1;

      await primitive.redis.hset(
        "api_keys",
        new_api_key,
        JSON.stringify(redisData)
      );

      return new_api_key;
    },
  },
};

export default UserResolver;
