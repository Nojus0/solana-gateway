import { Keypair } from "@solana/web3.js";
import { gql } from "apollo-server-core";
import base58 from "bs58";
import { IApiMiddlewareContext } from "../graphql/middleware";
import { IPublicKeyData } from "shared";

export const depositTypeDefs = gql`
  extend type Mutation {
    createDepositAddress(data: String!): DepositAddress
  }

  type DepositAddress {
    publicKey: String!
  }
`;

const max_ms_expires = 86400000;

const DepositResolver = {
  Query: {},
  Mutation: {
    createDepositAddress: async (
      _,
      params,
      { redis, uid }: IApiMiddlewareContext
    ) => {
      const Account = new Keypair();

      const publicKeyData: IPublicKeyData = {
        uid,
        secret: base58.encode(Account.secretKey),
        data: params.data,
      };

      redis.hset(
        "deposits",
        Account.publicKey.toBase58(),
        JSON.stringify(publicKeyData)
      );

      return {
        publicKey: Account.publicKey.toBase58(),
      };
    },
  },
};

export default DepositResolver;
