import { gql } from "apollo-server-lambda";
import { createKeyData, NetworkModel, UserModel, isUrlValid } from "shared";
import crypto from "crypto";
import base58 from "bs58";
import { IContext } from "../interfaces";
import { APIContext } from "../graphql/middleware";
import bcrypt from "bcryptjs";

export const userTypeDefs = gql`
  type CurrentUser {
    webhook: String!
    email: String!
    lamports_recieved: Int!
    api_key: String!
    isFast: Boolean!
    publicKey: String!
  }

  type BasicUser {
    email: String!
    lamports_recieved: Float!
    api_key: String!
  }

  extend type Query {
    currentUser: CurrentUser
  }

  extend type Mutation {
    createUser(email: String!, password: String!, network: String!): BasicUser
    changeWebhook(newUrl: String!): String
    regenerateApiKey: String
    setFast(newFast: Boolean!): Boolean
    setPublicKey(newPublicKey: String!): String
    setWebhook(newUrl: String!): String
    login(email: String!, password: String!): Boolean
  }
`;

interface ICreateUser {
  email: string;
  password: string;
  publicKey: string;
  network: string;
}

const UserResolver = {
  Mutation: {
    createUser: async (
      _,
      { password, network, publicKey, email }: ICreateUser,
      { redis }: IContext
    ) => {
      const NETWORK = await NetworkModel.findOne({ name: network });
      if (!NETWORK) throw new Error("Network does not exists");

      const SALT = await bcrypt.genSalt(5);
      const HASH = await bcrypt.hash(password, SALT);
      try {
        const api_key = base58.encode(
          crypto.randomBytes(parseInt(process.env.API_KEY_LENGTH))
        );
        const usr = await UserModel.create({
          publicKey,
          email,
          api_key,
          password: HASH,
          network: NETWORK,
          lamports_recieved: 0,
        });
        await usr.save();

        await redis.hsetBuffer(
          "api_keys",
          api_key,
          createKeyData({ requested: 0, uid: usr.id })
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

        throw new Error(err);
        // throw new Error(
        // "Unknown error: is your webhook less than 1024 characters and email 128 characters?"
        // );
      }
    },
    setPublicKey: async (_, params, { uid }: APIContext) => {
      if (params.newPublicKey.includes(process.env.FEE_RECIEVER_WALLET))
        throw new Error("Invalid public key");

      const usr = await UserModel.findById(uid);
      
      
      // * PUBLIC KEY MUST BE 32 BYTES LONG *
      if (
        base58.decode(params.newPublicKey).length != 32)
        throw new Error(
          "Public key is incorrect or isn't 32 bytes long, make sure its base58 encoded."
        );
      
      usr.publicKey = params.newPublicKey;
      await usr.save();

      return params.newPublicKey;
    },
    setWebhook: async (_, params, { uid }: APIContext) => {
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
      const new_api_key = base58.encode(
        crypto.randomBytes(parseInt(process.env.API_KEY_LENGTH))
      );

      await UserModel.updateOne({
        id: uid,
        api_key: new_api_key,
      });

      await redis.hdel("api_keys", api_key);

      // ! !
      requested++;

      await redis.hsetBuffer(
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
    login: async (_, params, ctx: IContext) => {
      const USER = await UserModel.findOne({ email: params.email });

      if (!USER) throw new Error("User not found");

      if (!(await bcrypt.compare(params.password, USER.password)))
        throw new Error("Incorrect password");

      ctx.res.cookie("api_key", USER.api_key, {
        httpOnly: true,
        secure: process.env.NODE_ENV != "development",
        maxAge: 60 * 60 * 24 * 7,
      });

      return true;
    },
  },
  Query: {
    currentUser: async (_, params, ctx: APIContext) => {
      return UserModel.findById(ctx.uid);
    },
  },
};

export default UserResolver;
