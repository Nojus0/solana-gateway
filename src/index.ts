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
    maxPollsPerInterval: 45,
    startBlock: NETWORK.lastProcessedBlock || "latest",
    retryDelay: 1000,
    onTransaction: async ({ reciever, signatures }) => {
      const publicKeyStr = await redis.hget(
        "deposits",
        reciever.publicKey.toBase58()
      );

      if (!publicKeyStr) return;

      if (reciever.change <= 0) return;

      const LAMPORTS_RECIEVED = reciever.change - 5000;

      const recieverData: IPublicKeyData = JSON.parse(publicKeyStr);

      const recieverKeyPair = new Keypair({
        publicKey: reciever.publicKey.toBytes(),
        secretKey: base58.decode(recieverData.secret),
      });

      const owner = await UserModel.findById(recieverData.uid).select(
        "-transactions"
      );

      const TRANSACTION = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: reciever.publicKey,
          toPubkey: new PublicKey(owner.publicKey),
          lamports: LAMPORTS_RECIEVED,
        })
      );

      const SIGNATURE = await sendAndConfirmTransaction(conn, TRANSACTION, [
        recieverKeyPair,
      ]);

      const DB_TRANSACTION = await TransactionModel.create({
        IsProcessed: false,
        createdAt: Date.now(),
        lamports: LAMPORTS_RECIEVED,
        madeBy: owner,
        payload: recieverData.data,
        privateKey: base58.encode(recieverKeyPair.secretKey),
        processedAt: null,
        publicKey: recieverKeyPair.publicKey.toBase58(),
        resendSignature: SIGNATURE,
        transferSignature: signatures,
      });

      await DB_TRANSACTION.save();

      await UserModel.updateOne(
        { id: owner.id },
        {
          $push: { transactions: DB_TRANSACTION },
          $inc: { lamports_recieved: LAMPORTS_RECIEVED },
        }
      ).exec();

      try {
        const { data } = await axios({
          url: owner.webhook,
          method: "POST",
          data: {
            lamports: LAMPORTS_RECIEVED,
            data: recieverData.data,
          },
          timeout: 2000,
        });

        if (data?.processed == true) {
          DB_TRANSACTION.processedAt = new Date();
          DB_TRANSACTION.IsProcessed = true;
          DB_TRANSACTION.save();
        }
      } catch (err: any) {
        console.log(
          `Unable to reach webhook ${owner.webhook}: err: ${err?.message}`
        );
      }
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
