import { gql } from "apollo-server-core";
import { APIContext } from "../graphql/middleware";
import { TransactionModel } from "shared";
import { UserModel } from "shared";

export const transactionDefs = gql`
  type Transaction {
    id: String!
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

  extend type Mutation {
    setAsProcessed(transactionId: String!): Transaction
  }
`;

export const transactionResolver = {
  Query: {
    getTransactions: async (_, params, { uid }: APIContext) => {
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
  Mutation: {
    setAsProcessed: async (_, params) => {
      try {
        const transaction = await TransactionModel.findById(params.id);

        if (transaction.IsProcessed)
          throw new Error("Transaction already processed");

        transaction.IsProcessed = true;
        transaction.processedAt = new Date();
        await transaction.save();
      } catch (err) {
        throw new Error("Transaction does not exist");
      }
    },
  },
};
