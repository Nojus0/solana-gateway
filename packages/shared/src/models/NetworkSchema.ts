import crypto from "crypto"
import base58 from "bs58"
import dynamoose from "dynamoose"
import { Document } from "dynamoose/dist/Document"

export interface Network {
  /**
   * `pk` NETWORK#name
   */
  pk: string
  /**
   * `sk` should be set to *DETAILS* when retrieving details about a network
   */
  sk: string
  url: string
  name: string
  lastBlock: number
  fee: number
  createdAt: number
}

export type NetworkDocument = Network & Document

const NetworkSchema = new dynamoose.Schema({
  pk: {
    hashKey: true,
    type: String,
    required: true
  },
  sk: {
    rangeKey: true,
    type: String,
    default: "DETAILS"
  },
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  lastBlock: {
    type: Number
  },
  fee: {
    type: Number,
    required: true,
    default: 1
  },
  createdAt: {
    type: Number,
    default: Date.now()
  }
})

export default NetworkSchema
