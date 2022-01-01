import crypto from "crypto"
import base58 from "bs58"
import dynamoose from "dynamoose"
import { Document } from "dynamoose/dist/Document"

export interface NetworkError {
  /**
   * `pk` NETWORK#name
   */
  pk: string
  /**
   * `sk` ERROR#block#time
   */
  sk: string
  message: string
  createdAt: number
}

export type NetworkErrorDocument = NetworkError & Document

const ErrorSchema = new dynamoose.Schema({
  pk: {
    hashKey: true,
    type: String,
    required: true
  },
  sk: {
    rangeKey: true,
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Number,
    required: true,
    default: Date.now()
  }
})

export default ErrorSchema
