import "dotenv/config";
import Redis from "ioredis";
import _ from "lodash";
import mongoose from "mongoose";
import { createKeyData, NetworkModel, UserModel } from "shared";
import { createHandler } from "./createHandler";

(async () => {
  if (!process.env.MONGO_URI || !process.env.REDIS_URI)
    throw new Error("Redis or Mongo server uri not found.");

  const mongo = await mongoose.connect(process.env.MONGO_URI);
  const redis = new Redis(process.env.REDIS_URI);

  const network = await NetworkModel.findOne({
    name: process.env.NETWORK,
  });

  if (!network) {
    throw new Error("Network does not exist");
  }

  const users = await UserModel.find({ network });

  for (const user of users) {
    const REDIS_USR = redis.hgetBuffer("api_keys", user.api_key);
    if (!REDIS_USR) continue;

    redis.hsetBuffer(
      "api_keys",
      user.api_key,
      createKeyData({ requested: 0, uid: user.id })
    );
  }

  const handler = createHandler({
    network,
    redis,
    webhook_interval: Number(process.env.WEBHOOK_RESEND_MS!),
    webhook_retry_exist_min: Number(process.env.WEBHOOK_RETRY_EXIST_MIN),
    maxPollsPerInterval: Number(process.env.MAX_POLLS_PER_INTERVAL),
    maxRetries: Number(process.env.MAX_RETRIES),
    pollInterval: Number(process.env.POLL_INTERVAL),
    retryDelay: Number(process.env.RETRY_DELAY),
  });

  handler.start();
})();
