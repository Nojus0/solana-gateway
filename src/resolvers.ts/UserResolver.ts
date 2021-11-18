import { gql } from "apollo-server-core";
import { UserModel } from "../models/UserModel";
import crypto from "crypto";
import argon2, { argon2id } from "argon2";
import base58 from "bs58";
import { IContext } from "../interfaces";
import { IApiRedisObject } from "../graphql/middleware";
export const userTypeDefs = gql`
  type User {
    id: String!
    webhook: String!
    email: String!
    api_key: String!
    publicKey: String!
  }

  type BasicUser {
    id: String!
  }

  type Transaction {
    id: String!
    madeBy: BasicUser!
    publicKey: String!
    privateKey: String!
    createdAt: Date!
    processedAt: Date
    payload: String!
    IsProcessed: Boolean!
    lamports: Int!
  }

  extend type Mutation {
    createUser(
      email: String!
      password: String!
      webhook: String!
      publicKey: String!
    ): User
  }
`;

const UserResolver = {
  Mutation: {
    createUser: async (_, { password, ...rest }, ctx: IContext) => {
      const HASH = await argon2.hash(password, { type: argon2id });
      const api_key = base58.encode(crypto.randomBytes(24));

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
    },
  },
};

export default UserResolver;
