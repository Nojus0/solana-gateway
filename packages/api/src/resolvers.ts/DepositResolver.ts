import { Keypair } from "@solana/web3.js";
import { gql } from "apollo-server-lambda";
import { createDepositData } from "shared";
import { APIContext } from "../graphql/middleware";

export const depositTypeDefs = gql`
  extend type Mutation {
    createDepositAddress(data: String!, lifetime_ms: Int!): DepositAddress
  }

  type DepositAddress {
    publicKey: String!
  }
`;

const max_ms_expires = 3600000;
const min_ms_expires = 300000;

const DepositResolver = {
  Query: {},
  Mutation: {
    createDepositAddress: async (_, params, { redis, uid }: APIContext) => {
      const GEN_DEPOSIT_WALLET = new Keypair();

      // * Cant do account:*publickey* because of buffer, possible but dirty *
      // * If problems arrise prefix it with some bytes or encoded string

      if (params.lifetime_ms < min_ms_expires) {
        throw new Error(
          "The specified lifetime is too low, minimum lifetime 5 minutes/300000 ms "
        );
      }

      if (params.lifetime_ms > max_ms_expires) {
        throw new Error(
          "The specified lifetime is too high maximum is 1 hour/3600000 ms"
        );
      }
      const binary = createDepositData({
        uid,
        data: params.data as string,
        secret: GEN_DEPOSIT_WALLET.secretKey,
      });

      redis.setBuffer(
        GEN_DEPOSIT_WALLET.publicKey.toBase58(),
        binary,
        "PX",
        params.lifetime_ms as number
      );

      return {
        publicKey: GEN_DEPOSIT_WALLET.publicKey.toBase58(),
      };
    },
  },
};

export default DepositResolver;
