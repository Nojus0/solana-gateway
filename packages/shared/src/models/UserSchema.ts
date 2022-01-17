import crypto, { createHash } from "crypto"
import base58 from "bs58"
import dynamoose from "dynamoose"
import { Document } from "dynamoose/dist/Document"

export interface User {
  /**
   * `pk` USER#email
   */
  pk: string
  /**
   * `sk` NET#network
   */
  sk: string

  email: string
  walletAddress: string
  password: string
  webhooks: string[]
  maxWebhooks: number
  isFast: boolean
  recieved: number
  createdAt: number
  paysFee: boolean
  apiKey: string
  secretKey: string
  network: string
  lastRegen: number
  acceptedTerms: boolean
  acceptedTime: number
  acceptedVersion: number
  ip: string
}

export interface CurrentUser {
  email: string
  recieved: number
  isFast: boolean
  webhooks: string[]
  network: string
  walletAddress?: string | undefined
}

export type UserDocument = User & Document

export const generateUserApiKey = () =>
  `ak_${base58.encode(crypto.randomBytes(16))}`

export const generateSecretKey = () =>
  `sk_${base58.encode(crypto.randomBytes(16))}`

const UserSchema = new dynamoose.Schema({
  pk: {
    hashKey: true,
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  sk: {
    rangeKey: true,
    type: String,
    required: true
  },
  walletAddress: {
    type: String
  },
  lastRegen: {
    type: Number
  },
  acceptedTerms: {
    type: Boolean,
    required: true
  },
  acceptedTime: {
    type: Number,
    required: true
  },
  acceptedVersion: {
    type: Number,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  network: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  webhooks: {
    type: Array,
    schema: [String],
    default: []
  },
  maxWebhooks: {
    type: Number,
    default: 3
  },
  isFast: {
    type: Boolean,
    default: false
  },
  recieved: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Number,
    default: Date.now()
  },
  paysFee: {
    type: Boolean,
    default: true
  },
  apiKey: {
    index: {
      global: true,
      name: "apiKey-gsi"
    },
    type: String
    // default: generateUserApiKey
  },
  secretKey: {
    type: String
    // default: () => `sk_${base58.encode(crypto.randomBytes(16))}`
  }
})

export default UserSchema
