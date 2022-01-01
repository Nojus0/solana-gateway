import { gql } from "apollo-server-lambda"
import { APIContext } from "../graphql/middleware"
import { Model, TransactionUUIDLength, UserDocument } from "shared"
import dynamoose from "dynamoose"
import { TransactionDocument } from "shared"
import base58 from "bs58"
import crypto from "crypto"
export type TransactionFilter = "All" | "Pending" | "Confirmed"

export const transactionDefs = gql`
  type Transaction {
    uuid: String!
    senderPk: String!
    senderTo: String!
    senderSig: String!
    senderLm: Float!

    payload: String!
    retries: Int!

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
  }

  extend type Mutation {
    setConfirmed(uuid: String!): Transaction
  }
`

async function paginify(
  Limit: number,
  n: string,
  u: string,
  filter: "PENDING" | "CONFIRMED" | "",
  next?: string
) {
  if (next?.includes("#")) throw new Error("Invalid next token.")

  const query = await Model.query(
    new dynamoose.Condition()
      .where("pk")
      .eq(`USER#${u}`)
      .filter("sk")
      .beginsWith(`NET#${n}#TXN#${filter}`)
  ).limit(Limit)

  if (next) {
    const [type, id, time]: [string, string, string] = (next as any).split(".")

    if (!type || !id || !time) throw new Error("Invalid next token.")

    if (filter && filter != type) throw new Error("Invalid next token.")

    if (isNaN(Number(time))) throw new Error("Invalid next token.")
    console.log(base58.encode(crypto.randomBytes(16)))
    if (base58.decode(id).byteLength != TransactionUUIDLength)
      throw new Error("Invalid next token.")

    query.startAt({
      pk: `USER#${u}`,
      sk: `NET#${n}#TXN#${type}#${id}#${time}`
    })
  }

  const resp = await query.exec()
  if (resp.lastKey?.sk) {
    const [, net, type, status, id, time] = resp.lastKey.sk.split("#")
    return {
      transactions: resp,
      next: `${status}.${id}.${time}`
    }
  } else return { transactions: resp, next: null }
}

export const transactionResolver = {
  Query: {
    getTransactions: async (_, params, { u, n }: APIContext) => {
      const Limit = Math.min(50, Math.max(params.limit, 1))

      switch (params.filter) {
        case "All": {
          return await paginify(Limit, n, u, "", params.next)
        }
        case "Confirmed": {
          return await paginify(Limit, n, u, "CONFIRMED", params.next)
        }
        case "Pending": {
          return await paginify(Limit, n, u, "PENDING", params.next)
        }
      }
    }
  },
  Mutation: {
    setConfirmed: async (_, params, ctx: APIContext) => {
      const condtion = new dynamoose.Condition()
        .where("pk")
        .eq(`USER#${ctx.u}`)
        .filter("sk")
        .beginsWith(`NET#${ctx.n}#TXN#PENDING#${params.uuid}`)

      const txn: any = (await Model.query(condtion)
        .limit(1)
        .exec()) as TransactionDocument
      console.log(txn)
      if (txn.count < 1) throw new Error("Transaction not found.")


      txn.status = "CONFIRMED"
      txn.sk = `NET#${ctx.n}#TXN#${txn.status}#${txn.uuid}#${txn.createdAt}`
      txn.confirmedAt = Date.now()
      await txn.save()

      return txn
    }
  }
}
