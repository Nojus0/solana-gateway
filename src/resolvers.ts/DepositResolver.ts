import { Keypair } from "@solana/web3.js";
import { gql } from "apollo-server-core";
import base58 from "bs58";
import { IApiMiddlewareContext } from "../graphql/middleware";
export const depositTypeDefs = gql`
  extend type Mutation {
    createDepositAddress(data: String!): DepositAddress
  }

  type DepositAddress {
    publicKey: String!
  }
`;

export interface IPublicKeyData {
  uid: string;
  secret: string;
  data: string;
}

const max_ms_expires = 86400000;

const DepositResolver = {
  Query: {},
  Mutation: {
    createDepositAddress: async (
      _,
      params,
      { redis, requested, uid }: IApiMiddlewareContext
    ) => {
      const Account = new Keypair();

      // if (params.expiresIn > max_ms_expires)
      //   throw new Error(
      //     "Expiry time too big, The maximum deposit wallet/address lifetime is 24 hours."
      //   );

      const publicKeyData: IPublicKeyData = {
        uid,
        secret: base58.encode(Account.secretKey),
        data: params.data,
      };

      redis.hset(
        "deposits",
        Account.publicKey.toBase58(),
        JSON.stringify(publicKeyData),
      );

      return {
        publicKey: Account.publicKey.toBase58(),
      };
    },
  },
};

export default DepositResolver;
