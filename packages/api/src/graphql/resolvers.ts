import { merge } from "lodash";
import DepositResolver from "../resolvers.ts/DepositResolver";
import { transactionResolver } from "../resolvers.ts/TransactionResolver";
import UserResolver from "../resolvers.ts/UserResolver";

const resolvers = merge(
  UserResolver,
  DepositResolver,
  transactionResolver
);

export default resolvers;
