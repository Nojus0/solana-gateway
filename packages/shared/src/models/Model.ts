import dynamoose from "dynamoose"
import UserSchema, { UserDocument } from "./UserSchema"
import NetworkSchema, { NetworkDocument } from "./NetworkSchema"
import TransactionSchema, { TransactionDocument } from "./TransactionSchema"
import ErrorSchema, { NetworkErrorDocument } from "./ErrorSchema"

export const config = {
  table: "payments",
  region: "eu-west-2"
}

dynamoose.aws.sdk.config.update({
  region: config.region
})

export const Model = dynamoose.model<
  UserDocument | NetworkDocument | TransactionDocument | NetworkErrorDocument
>(config.table, [UserSchema, NetworkSchema, TransactionSchema, ErrorSchema], {
  create: false,
  waitForActive: false
})
