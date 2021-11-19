import { merge } from "lodash";
import DepositResolver from "../resolvers.ts/DepositResolver";
import { transactionResolver } from "../resolvers.ts/TransactionResolver";
import UserResolver from "../resolvers.ts/UserResolver";

const baseResolver = {
  Query: {
    test: async () => {
      return "wow";
    },
  },
};

const resolvers = merge(
  baseResolver,
  UserResolver,
  DepositResolver,
  transactionResolver
);

export default resolvers;
