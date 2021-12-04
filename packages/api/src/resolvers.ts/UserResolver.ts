import { gql } from "apollo-server-lambda";
import { createKeyData, NetworkModel, UserModel, isUrlValid } from "shared";
import crypto from "crypto";
import base58 from "bs58";
import { IContext } from "../interfaces";
import { APIContext } from "../graphql/middleware";
import bcrypt from "bcryptjs";
import util from "util";
export const userTypeDefs = gql`
  type CurrentUser {
    email: String!
    lamports_recieved: Int!
    api_key: String!
    isFast: Boolean!
    secret: String!
    webhook: String
    publicKey: String
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
    createUser(email: String!, password: String!, network: String!): CurrentUser
    changeWebhook(newUrl: String!): String
    regenerateApiKey: String
    setFast(newFast: Boolean!): Boolean
    setPublicKey(newPublicKey: String!): String
    setWebhook(newUrl: String!): String
    login(email: String!, password: String!): CurrentUser
  }
`;

interface ICreateUser {
  email: string;
  password: string;
  publicKey: string;
  network: string;
}

const generateKeyPair = util.promisify(crypto.generateKeyPair);

const UserResolver = {
  Mutation: {
    createUser: async (
      _,
      { password, network, publicKey, email }: ICreateUser,
      { redis, res, isFrontend }: IContext
    ) => {
      const NETWORK = await NetworkModel.findOne({ name: network });
      if (!NETWORK) throw new Error("Network does not exists");

      const SALT = await bcrypt.genSalt(5);
      const HASH = await bcrypt.hash(password, SALT);
      try {
        const api_key = base58.encode(
          crypto.randomBytes(parseInt(process.env.API_KEY_LENGTH))
        );

        const keypair = await generateKeyPair("rsa", {
          modulusLength: 2048,
        });

        const usr = await UserModel.create({
          publicKey,
          email,
          api_key,
          password: HASH,
          verifyKeypair: [
            keypair.publicKey.export({ format: "der", type: "pkcs1" }),
            keypair.privateKey.export({ format: "der", type: "pkcs1" }),
          ],
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
          { _id: NETWORK.id },
          { $push: { accounts: usr } }
        ).exec();
        console.log(``);

        if (isFrontend)
          res.cookie("api_key", usr.api_key, {
            httpOnly: true,
            secure: process.env.NODE_ENV != "development",
            maxAge: 1000 * 60 * 60 * 24 * 7,
          });

        return {
          ...usr.toObject(),
          secret: usr.verifyKeypair[0].toString("base64"),
        };
      } catch (err: any) {
        if (err.code == 11000) {
          throw new Error(`The specified email is already registered.`);
        }

        throw new Error(
          "Unknown error: is your webhook less than 1024 characters and email 128 characters?"
        );
      }
    },
    setPublicKey: async (_, params, { uid }: APIContext) => {
      if (params.newPublicKey.includes(process.env.FEE_RECIEVER_WALLET))
        throw new Error("Invalid public key");

      const usr = await UserModel.findById(uid);

      // * PUBLIC KEY MUST BE 32 BYTES LONG *
      if (base58.decode(params.newPublicKey).length != 32)
        throw new Error(
          "Public key is incorrect or isn't 32 bytes long, make sure its base58 encoded."
        );

      usr.publicKey = params.newPublicKey;
      await usr.save();

      return params.newPublicKey;
    },
    setWebhook: async (_, params, { uid }: APIContext) => {
      if (!isUrlValid(params.newUrl)) throw new Error("Invalid host");

      try {
        const usr = await UserModel.findById(uid);

        usr.webhook = params.newUrl;

        await usr.save();
        return usr.webhook;
      } catch (err) {
        throw new Error("Error occurred when setting the new webhook.");
      }
    },
    regenerateApiKey: async (
      _,
      params,
      { redis, uid, api_key, requested }: APIContext
    ) => {
      const new_api_key = base58.encode(
        crypto.randomBytes(parseInt(process.env.API_KEY_LENGTH))
      );

      try {
        const USR = await UserModel.findById(uid);
        USR.api_key = new_api_key;
        await USR.save();

        await redis.hdel("api_keys", api_key);
        requested++;
        await redis.hsetBuffer(
          "api_keys",
          new_api_key,
          createKeyData({ requested, uid })
        );

        return USR.api_key;
      } catch (err) {
        throw new Error("Error occurred while regenerating the API Key.");
      }
    },
    setFast: async (_, params, ctx: APIContext) => {
      try {
        const USR = await UserModel.findById(ctx.uid);
        USR.isFast = params.newFast;
        await USR.save();
        return USR.isFast;
      } catch (err) {
        throw new Error("Error occurred while setting new Fast Mode.");
      }
    },
    login: async (_, params, ctx: IContext) => {
      const USER = await UserModel.findOne({ email: params.email });

      if (!USER) throw new Error("User not found");

      if (!(await bcrypt.compare(params.password, USER.password)))
        throw new Error("Incorrect password");

      ctx.res.cookie("api_key", USER.api_key, {
        httpOnly: true,
        secure: process.env.NODE_ENV != "development",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      return {
        ...USER.toObject(),
        secret: USER.verifyKeypair[0].toString("base64"),
      };
    },
  },
  Query: {
    currentUser: async (_, params, ctx: APIContext) => {
      const user = (await UserModel.findById(ctx.uid)).toObject();

      return {
        ...user,
        secret: user.verifyKeypair[0].toString("base64"),
      };
    },
  },
};

export default UserResolver;
