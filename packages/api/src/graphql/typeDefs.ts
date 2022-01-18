import { gql } from "apollo-server-core"
import { depositTypeDefs } from "../resolvers.ts/DepositResolver"
import { TransactionDefs } from "../resolvers.ts/TransactionResolver"
import { userTypeDefs } from "../resolvers.ts/UserResolver"

const baseTypeDefs = gql`
  scalar Date

  type Mutation

  type Query
`

const typeDefs = [baseTypeDefs, userTypeDefs, depositTypeDefs, TransactionDefs]

export default typeDefs
