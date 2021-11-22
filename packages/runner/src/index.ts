import "dotenv/config";
import Redis from "ioredis";
import _ from "lodash";
import mongoose from "mongoose";
import { NetworkModel } from "shared";
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

  const handler = createHandler({
    network,
    redis,
    webhook_interval: 2000,
  });

  handler.start();
})();
