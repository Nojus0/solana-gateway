import crypto from "crypto"
import base58 from "bs58"
import dynamoose from "dynamoose"
import { Document } from "dynamoose/dist/Document"

export interface Transaction {
  /**
   * `pk` USER#email
   */
  pk: string
  /**
   * `sk` NET#net#TXN#STATUS#timestamp
   * type STATUS = "PENDING" | "CONFIRMED"
   */
  sk: string

  uuid: string
  senderPk: string
  senderTo: string
  senderSig: string
  senderLm: number

  payload: string

  recieveLm: number
  recieveSig: string

  confirmedAt: number
  createdAt: number
  status: "PENDING" | "CONFIRMED"

  // Expiry ! DEV NET ONLY !
  expiresAt: number
}

export type TransactionDocument = Transaction & Document

export const TransactionUUIDLength = 16

export const generateTransactionUUID = () =>
  base58.encode(crypto.randomBytes(TransactionUUIDLength))

const TransactionSchema = new dynamoose.Schema({
  pk: {
    hashKey: true,
    type: String,
    required: true
  },
  sk: {
    rangeKey: true,
    type: String
  },
  uuid: {
    type: String,
    required: true,
    index: {
      name: "uuid-lsi",
      global: false
    }
  },
  senderPk: {
    type: String,
    required: true
  },
  senderTo: {
    type: String,
    required: true
  },
  senderSig: {
    type: String,
    required: true
  },
  senderLm: {
    type: Number,
    required: true
  },
  payload: {
    type: String
  },
  recieveLm: {
    type: Number,
    required: true
  },
  recieveSig: {
    type: String,
    required: true
  },
  createdAt: {
    type: Number,
    required: true
  },
  confirmedAt: {
    type: Number
  },
  status: {
    type: String,
    required: true,
    default: "PENDING"
  },
  expiresAt: {
    type: Number
  }
})

export default TransactionSchema
