import { gql } from "apollo-server-core";
import { createKeyData, NetworkModel, readKeyData, UserModel } from "shared";
import crypto from "crypto";
import argon2, { argon2id } from "argon2";
import base58 from "bs58";
import { IContext } from "../interfaces";
import { APIContext } from "../graphql/middleware";
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
      network: String!
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
    createUser: async (_, { password, network, ...rest }, ctx: IContext) => {
      const NETWORK = await NetworkModel.findOne({ name: network });

      if (!NETWORK) throw new Error("Network does not exists");

      const HASH = await argon2.hash(password, { type: argon2id });
      const api_key = base58.encode(crypto.randomBytes(24));

      if (webhookUrlValid(rest.webhook)) throw new Error("Invalid host");

      try {
        const usr = await UserModel.create({
          ...rest,
          api_key,
          argon2: HASH,
          network: NETWORK,
          lamports_recieved: 0,
        });

        await usr.save();

        await ctx.redis.hset(
          "api_keys",
          api_key,
          createKeyData({ uid: usr.id, requested: 0 })
        );

        await NetworkModel.findOneAndUpdate(
          { id: NETWORK.id },
          { $push: { accounts: usr } }
        ).exec();

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
    changeWebhook: async (_, params, { uid }: APIContext) => {
      if (webhookUrlValid(params.newUrl)) throw new Error("Invalid host");
      const USER = await UserModel.updateOne(
        { id: uid },
        {
          webhook: params.newUrl,
        }
      );

      return params.newUrl;
    },
    regenerateApiKey: async (
      _,
      params,
      { redis, uid, api_key, requested }: APIContext
    ) => {
      const new_api_key = base58.encode(crypto.randomBytes(24));

      const user = await UserModel.updateOne({
        id: uid,
        api_key: new_api_key,
      });

      await redis.hdel("api_keys", api_key);

      // ! !
      requested++;

      await redis.hset(
        "api_keys",
        new_api_key,
        createKeyData({ requested, uid })
      );

      return new_api_key;
    },
  },
};

export default UserResolver;
