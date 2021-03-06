import { gql } from "apollo-server-core"
import { APIContext } from "../graphql/middlewares/apiMiddleware"
import { Model, Transaction, UserDocument } from "shared"
import dynamoose from "dynamoose"
import { TransactionDocument } from "shared"
import { decryptToken, encryptToken } from "../crypto"
export type TransactionFilter = "All" | "Pending" | "Confirmed"

export const TransactionDefs = gql`
  type Transaction {
    uuid: String!
    senderPk: String!
    senderTo: String!
    senderSig: String!
    senderLm: Float!

    payload: String
    confirmedAt: Date
    recieveLm: Float!
    recieveSig: String!

    createdAt: Date!
    status: String!
  }

  enum TransactionFilter {
    All
    Pending
    Confirmed
  }

  type TransactionsType {
    transactions: [Transaction!]!
    next: String
  }

  extend type Query {
    getTransactions(
      filter: TransactionFilter!
      limit: Int!
      next: String
    ): TransactionsType

    getTransaction(uuid: String!): Transaction
  }

  extend type Mutation {
    setConfirmed(uuid: String!): Transaction
  }
`

// * Its really hard add pagination when using dynamodb with composite sort key without making it unsecure and slow *
// * The next token is encrypted with AES 128 bit and split using the '.' character *
// * I Don't know if that's overkill but atleast its safe *
// * If the had access to the query sort key, key could only query his own account details,
// * the graphql fields would mismatch and graphql would throw an error or not return the forbidden fields *
// * By using encryption the next token gets a bit larger with the iv and the encoding. *
async function paginify(
  Limit: number,
  user: UserDocument,
  filter: "PENDING" | "CONFIRMED" | "ALL",
  next?: string
) {
  if (next?.includes("#")) throw new Error("Invalid next token.")

  const query = await Model.query(
    new dynamoose.Condition()
      .where("pk")
      .eq(user.pk)
      .filter("sk")
      .beginsWith(`NET#${user.network}#TXN#${filter == "ALL" ? "" : filter}`)
  ).limit(Limit)

  if (next) {
    const [status, id, time]: [string, string, string] = (next as any).split(
      "."
    )

    if (
      (filter == "CONFIRMED" && status != "CONFIRMED") ||
      (filter == "PENDING" && status != "PENDING") ||
      (filter == "ALL" && status != "CONFIRMED" && status != "PENDING")
    )
      throw new Error("Invalid next token.")

    query.startAt({
      pk: user.pk,
      sk: `NET#${user.network}#TXN#${status}#${id}#${time}`
    })
  }

  const resp = await query.exec()
  if (resp?.lastKey?.sk) {
    const [, net, type, status, id, time] = resp.lastKey.sk.split("#")
    return {
      transactions: resp,
      next: encryptToken(`${status}.${id}.${time}`)
    }
  } else return { transactions: resp, next: null }
}

export const transactionResolver = {
  Query: {
    getTransactions: async (_, params, { user }: APIContext) => {
      const Limit = Math.min(50, Math.max(params.limit, 1))

      const nextToken = params.next ? decryptToken(params.next) : null
      switch (params.filter) {
        case "All": {
          return await paginify(Limit, user, "ALL", nextToken)
        }
        case "Confirmed": {
          return await paginify(Limit, user, "CONFIRMED", nextToken)
        }
        case "Pending": {
          return await paginify(Limit, user, "PENDING", nextToken)
        }
      }
    },
    getTransaction: async (_, params, { user }: APIContext) => {
      const [txn] = await Model.query("pk")
        .eq(user.pk)
        .filter("uuid")
        .eq(params.uuid)
        .limit(1)
        .using("uuid-lsi")
        .exec()

      if (!txn) throw new Error("Transaction not found.")

      return txn
    }
  },
  Mutation: {
    setConfirmed: async (_, params, { user }: APIContext) => {
      const condtion = new dynamoose.Condition()
        .where("pk")
        .eq(user.pk)
        .filter("sk")
        .beginsWith(`NET#${user.network}#TXN#PENDING#${params.uuid}#`)

      const [txn]: TransactionDocument[] = await Model.query(condtion)
        .limit(1)
        .exec()

      if (!txn) throw new Error("Pending transaction not found.")

      const newTransaction: Transaction = {
        ...txn,
        confirmedAt: Date.now(),
        sk: `NET#${user.network}#TXN#CONFIRMED#${txn.uuid}#${txn.createdAt}`,
        status: "CONFIRMED"
      }

      try {
        await Model.transaction.update([
          Model.delete({
            pk: txn.pk,
            sk: txn.sk
          }),
          Model.create(newTransaction)
        ])
      } catch (err) {
        throw new Error("Failed to set as confirmed.")
      }

      return newTransaction
    }
  }
}
