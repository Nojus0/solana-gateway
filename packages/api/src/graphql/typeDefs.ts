import { gql } from "apollo-server-core";
import { depositTypeDefs } from "../resolvers.ts/DepositResolver";
import { transactionDefs } from "../resolvers.ts/TransactionResolver";
import { userTypeDefs } from "../resolvers.ts/UserResolver";

const baseTypeDefs = gql`
  scalar Date

  type Mutation

  type Query {
    test: String
  }
`;

const typeDefs = [baseTypeDefs, userTypeDefs, depositTypeDefs, transactionDefs];

export default typeDefs;
