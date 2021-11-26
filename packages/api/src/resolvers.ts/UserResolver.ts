import { gql } from "apollo-server-lambda";
import { createKeyData, NetworkModel, UserModel, isUrlValid } from "shared";
import crypto from "crypto";
import base58 from "bs58";
import { IContext } from "../interfaces";
import { APIContext } from "../graphql/middleware";
import bcrypt from "bcryptjs";

export const userTypeDefs = gql`
  type User {
    webhook: String!
    email: String!
    lamports_recieved: Int!
    api_key: String!
    publicKey: String!
  }

  extend type Query {
    currentUser: User
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
    setFast(newFast: Boolean!): Boolean
  }
`;

interface ICreateUser {
  email: string;
  password: string;
  webhook: string;
  publicKey: string;
  network: string;
}

const UserResolver = {
  Mutation: {
    createUser: async (
      _,
      { password, network, ...rest }: ICreateUser,
      ctx: IContext
    ) => {
      if (rest.publicKey.includes(process.env.FEE_RECIEVER_WALLET))
        throw new Error("Invalid public key");
      const NETWORK = await NetworkModel.findOne({ name: network });

      if (!NETWORK) throw new Error("Network does not exists");

      if (!isUrlValid(rest.webhook))
        throw new Error("Invalid webhook host, are you using https?");

      const api_key = base58.encode(crypto.randomBytes(24));

      const SALT = await bcrypt.genSalt(5);
      const HASH = await bcrypt.hash(password, SALT);

      try {
        const usr = await UserModel.create({
          ...rest,
          password: HASH,
          api_key,
          network: NETWORK,
          lamports_recieved: 0,
        });

        await usr.save();

        await ctx.redis.hsetBuffer(
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
      if (!isUrlValid(params.newUrl)) throw new Error("Invalid host");
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

    setFast: async (_, params, ctx: APIContext) => {
      const User = await UserModel.findById(ctx.uid);

      // * Will hit if api key in redis references to a non existing uid/user in mongo*
      if (!User) throw new Error("User does not exist");

      User.isFast = params.newFast;

      await User.save();

      return User.isFast;
    },
  },
  Query: {
    currentUser: async (_, params, ctx: APIContext) => {
      return UserModel.findById(ctx.uid);
    },
  },
};

export default UserResolver;
