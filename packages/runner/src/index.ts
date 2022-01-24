import "dotenv/config"
import Redis from "ioredis"
import _ from "lodash"
import { envProcessor, Model, NetworkDocument } from "shared"
import { createHandler } from "./createHandler"
;(async () => {
  const envs = [
    "REDIS_URI",
    "NET",
    "MAX_POLLS_PER_INTERVAL",
    "POLL_INTERVAL",
    "RETRY_DELAY",
    "MAX_RETRIES",
    "WEBHOOK_TIMEOUT"
  ]

  envProcessor(envs)

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
    maxPollsPerInterval: Number(process.env.MAX_POLLS_PER_INTERVAL),
    maxRetries: Number(process.env.MAX_RETRIES),
    pollInterval: Number(process.env.POLL_INTERVAL),
    retryDelay: Number(process.env.RETRY_DELAY)
  })

  handler.start()
})()
