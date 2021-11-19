import "dotenv/config";
import express from "express";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import Redis from "ioredis";
import base58 from "bs58";
import _ from "lodash";
import { createPoller } from "./createPoller";
import mongoose from "mongoose";
import { NetworkModel } from "./models/NetworkModel";
import typeDefs from "./graphql/typeDefs";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import resolvers from "./graphql/resolvers";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import middlewares from "./graphql/middleware";
import axios from "axios";
import { IUser, UserModel } from "./models/UserModel";
import { IPublicKeyData } from "./resolvers.ts/DepositResolver";
import { ITransaction, TransactionModel } from "./models/TransactionModel";
import { ErrorModel } from "./models/ErrorModel";
import { createHandler } from "./createHandler";

(async () => {
  if (!process.env.MONGO_URI || !process.env.REDIS_URI)
    throw new Error("Redis or Mongo server uri not found.");

  const app = express();
  const mongo = await mongoose.connect(process.env.MONGO_URI);
  const redis = new Redis(process.env.REDIS_URI);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  const schemaWithMiddleware = applyMiddleware(schema, ...middlewares);
  const GQL_SERVER = new ApolloServer({
    schema: schemaWithMiddleware,
    context: ({ req, res }) => ({ req, res, redis, mongo }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });
  await GQL_SERVER.start();
  GQL_SERVER.applyMiddleware({ app });

  const NETWORK = await NetworkModel.findOne({
    network: process.env.NETWORK,
  });

  if (!NetworkModel.exists({ network: process.env.NETWORK })) {
    throw new Error("Network does not exist");
  }
  
  // https://api.mainnet-beta.solana.com - Very rate limited and slow proccesing time, wont work
  // https://solana-api.projectserum.com - Doesn't hit rate limit, average processing time, have not checked the max limit.
  // https://api.devnet.solana.com // Doesn't hit rate limit very fast proccesing time

  const handler = createHandler(NETWORK, redis, 2000).start();

  app.listen(4000, () => console.log(`Listening on http://localhost:4000/`));
})();
