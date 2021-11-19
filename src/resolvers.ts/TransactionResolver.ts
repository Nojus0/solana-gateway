import { gql } from "apollo-server-core";
import { IApiRedisObject } from "../graphql/middleware";
import { UserModel } from "../models/UserModel";

export const transactionDefs = gql`

  type Transaction {
    transferSignature: String!
    resendSignature: String!
    lamports: String!
    payload: String!
    IsProcessed: Boolean
    processedAt: Date
    createdAt: Date!
    publicKey: String!
  }

  enum TransactionFiler {
    All
    Processed
    Unprocessed
  }

  extend type Query {
    getTransactions(
      filter: TransactionFiler!
      skip: Int!
      limit: Int!
    ): [Transaction!]
  }
`;

export const transactionResolver = {
  Query: {
    getTransactions: async (_, params, { requested, uid }: IApiRedisObject) => {
      const User = await UserModel.findById(uid);

      const Limit = Math.min(50, Math.max(params.limit, 1));

      const match = {
        IsProcessed:
          (params.filter == "Processed" && true) ||
          (params.filter == "Unprocessed" && false),
      };

      params.filter == "All" && delete match.IsProcessed;

      await User.populate({
        path: "transactions",
        match,
        options: {
          limit: Limit,
          skip: params.skip,
        },
      });

      return User.transactions;
    },
  },
};
