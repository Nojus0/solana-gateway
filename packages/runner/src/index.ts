import "dotenv/config"
import Redis from "ioredis"
import _ from "lodash"
import mongoose from "mongoose"
import { envProcessor, Model, NetworkDocument } from "shared"
import { createHandler } from "./createHandler"
;(async () => {
  const envs = [
    "MONGO_URI",
    "REDIS_URI",
    "NET",
    "FEE_RECIEVER_WALLET",
    "WEBHOOK_RESEND_MS",
    "WEBHOOK_RETRY_EXIST_MIN",
    "MAX_POLLS_PER_INTERVAL",
    "MAX_RETRIES",
    "POLL_INTERVAL",
    "RETRY_DELAY",
    "WEBHOOK_TIMEOUT"
  ]

  envProcessor(envs)

  const mongo = await mongoose.connect(process.env.MONGO_URI)
  const redis = new Redis(process.env.REDIS_URI)

  const NET_DETAILS = await Model.get({
    pk: `NET#${process.env.NET}`,
    sk: "DETAILS"
  }) as NetworkDocument;

  if (!NET_DETAILS) {
    throw new Error("Network not found.")
  }

  const handler = createHandler({
    network: NET_DETAILS,
    redis,
    webhook_interval: Number(process.env.WEBHOOK_RESEND_MS!),
    webhook_retry_exist_min: Number(process.env.WEBHOOK_RETRY_EXIST_MIN),
    maxPollsPerInterval: Number(process.env.MAX_POLLS_PER_INTERVAL),
    maxRetries: Number(process.env.MAX_RETRIES),
    pollInterval: Number(process.env.POLL_INTERVAL),
    retryDelay: Number(process.env.RETRY_DELAY)
  })

  handler.start()
})()
