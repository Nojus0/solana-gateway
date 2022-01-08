import dynamoose from "dynamoose"

export const config = {
  table: "solana_payments",
  region: "eu-west-2"
}

dynamoose.aws.sdk.config.update({
  region: config.region
})

export * from "./models/Model"
export * from "./models/NetworkSchema"
export * from "./models/TransactionSchema"
export * from "./models/UserSchema"
export * from "./isUrlValid"
export * from "./envProcessor"
export * from "./redis"