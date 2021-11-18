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
import { UserModel } from "./models/UserModel";
import { IPublicKeyData } from "./resolvers.ts/DepositResolver";
import { TransactionModel } from "./models/TransactionModel";

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

  const conn = new Connection(NETWORK.network_url);

  const poller = createPoller({
    conn,
    maxRetries: 5,
    pollInterval: 2500,
    maxPollsPerInterval: 25,
    startBlock: "latest",
    retryDelay: 1000,
    onTransaction: async ({ reciever }) => {
      const publicKeyStr = await redis.hget(
        "deposits",
        reciever.publicKey.toBase58()
      );

      if (!publicKeyStr && reciever.change > 0) return;

      const recieverData: IPublicKeyData = JSON.parse(publicKeyStr);

      const recieverKeyPair = new Keypair({
        publicKey: reciever.publicKey.toBytes(),
        secretKey: base58.decode(recieverData.secret),
      });

      const owner = await UserModel.findById(recieverData.uid);

      const TRANSACTION = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: reciever.publicKey,
          toPubkey: new PublicKey(owner.publicKey),
          lamports: reciever.change - 5000,
        })
      );

      try {
        const SIGNATURE = await sendAndConfirmTransaction(conn, TRANSACTION, [
          recieverKeyPair,
        ]);

        const DB_TRANSACTION = await TransactionModel.create({
          IsProcessed: false,
          createdAt: Date.now(),
          lamports: reciever.change - 5000,
          madeBy: owner,
          payload: recieverData.data,
          privateKey: base58.encode(recieverKeyPair.secretKey),
          processedAt: null,
          publicKey: recieverKeyPair.publicKey.toBase58(),
          signature: SIGNATURE,
        });

        await DB_TRANSACTION.save();

        const { data, status, headers } = await axios({
          url: owner.webhook,
          method: "POST",
          data: {
            // * 5000 Lamport Fee *
            lamports: reciever.change - 5000,
            data: recieverData.data,
          },
          timeout: 5000,
        });

        if (
          status == 200 &&
          headers["Content-Type"] == "application/json" &&
          data?.processed == true
        ) {
          DB_TRANSACTION.processedAt = new Date();
          DB_TRANSACTION.IsProcessed = true;
          DB_TRANSACTION.save();
        }
      } catch (err) {}
    },
    onBlockMaxRetriesExceeded: (badBlock) => {
      NetworkModel.findOneAndUpdate(
        { network: process.env.NETWORK },
        { $push: { badBlocks: badBlock } }
      ).exec();
    },
    onPollFinished: (last) => {
      NetworkModel.findOneAndUpdate(
        { network: process.env.NETWORK },
        { lastProcessedBlock: last }
      ).exec();
    },
    onHandleBlock: (block) => {
      NetworkModel.findOneAndUpdate(
        { network: process.env.NETWORK },
        { $push: { blocks: block } }
      ).exec();
    },
  }).start();

  app.listen(4000, () => console.log(`Listening on http://localhost:4000/`));
})();
