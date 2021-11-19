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

  const NETWORK = await NetworkModel.findOne({
    network: process.env.NETWORK,
  });

  if (!NetworkModel.exists({ network: process.env.NETWORK })) {
    throw new Error("Network does not exist");
  }

  const handler = createHandler(NETWORK, redis, 2000);
  handler.start();
})();
