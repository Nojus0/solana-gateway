import { Keypair } from "@solana/web3.js";
import { gql } from "apollo-server-core";
import base58 from "bs58";
import { createDepositData } from "shared";
import { APIContext } from "../graphql/middleware";

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
    createDepositAddress: async (_, params, { redis, uid }: APIContext) => {
      const Account = new Keypair();

      // * Cant do account:*publickey* because of buffer, possible but dirty *
      // * If problems arrise prefix it with some bytes or encoded string
      const binary = createDepositData({
        uid,
        data: params.data,
        secret: Buffer.from(Account.secretKey),
      });

      redis.set(Account.publicKey.toBase58(), binary);

      return {
        publicKey: Account.publicKey.toBase58(),
      };
    },
  },
};

export default DepositResolver;
