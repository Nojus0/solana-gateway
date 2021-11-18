import { Keypair } from "@solana/web3.js";
import { gql } from "apollo-server-core";
import base58 from "bs58";
import { IContext } from "../interfaces";
import { UserModel } from "../models/UserModel";

export const depositTypeDefs = gql`
  extend type Mutation {
    createDepositAddress(data: String!): DepositAddress
  }

  type DepositAddress {
    publicKey: String!
  }
`;

const DepositResolver = {
  Query: {},
  Mutation: {
    createDepositAddress: async (_, params, { redis }: IContext) => {
      if (!UserModel.exists({ id: params.id })) return null;

      const Account = new Keypair();

      redis.hset(
        "deposits",
        Account.publicKey.toBase58(),
        JSON.stringify({
          owner: params.id,
          secret: base58.encode(Account.secretKey),
          data: params.data,
        })
      );

      return {
        publicKey: Account.publicKey.toBase58(),
      };
    },
  },
};

export default DepositResolver;
