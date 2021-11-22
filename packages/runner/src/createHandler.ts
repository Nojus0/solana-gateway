import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import base58 from "bs58";
import { Redis } from "ioredis";
import { createPoller } from "./createPoller";
import mongoose from "mongoose";
import axios from "axios";
import crypto from "crypto";
import { addMinutes } from "date-fns";
import {
  ErrorModel,
  IDepositData,
  INetwork,
  ITransaction,
  IUser,
  NetworkModel,
  readDepositData,
  TransactionModel,
  UserModel,
} from "shared";

interface IHandler {
  network: INetwork;
  redis: Redis;
  webhook_interval?: number;
}

export const createHandler = ({
  redis,
  network,
  webhook_interval = 1000,
}: IHandler) => {
  const conn = new Connection(network.url);
  const webhook = createWebhookConfirmer({ redis, interval: webhook_interval });

  const poller = createPoller({
    conn,
    maxRetries: 5,
    pollInterval: 2500,
    maxPollsPerInterval: 45,
    startBlock: network.lastProcessedBlock || "latest",
    retryDelay: 1000,
    onTransaction: async ({ reciever, signatures, fee }) => {
      const KEY_DATA = await redis.getBuffer(reciever.publicKey.toBase58());

      if (!KEY_DATA || reciever.change <= 0) return;

      // * -5000 lamports because of send back fee *
      // * So the user pays the fee when sending to the deposit address *
      // * And when sending back to main wallet *

      const LAMPORTS_RECIEVED = reciever.change - fee;
      const SERVICE_FEE = (LAMPORTS_RECIEVED / 100) * network.service_fee;
      const LAMPORTS = LAMPORTS_RECIEVED - SERVICE_FEE;

      const { data, secret, uid } = readDepositData(KEY_DATA);

      const recieverKeyPair = new Keypair({
        publicKey: reciever.publicKey.toBytes(),
        secretKey: secret,
      });

      try {
        const owner = await UserModel.findById(uid).select("-transactions");
        console.log(`${reciever.publicKey.toBase58()}`);
        console.log(
          `recieved minus incoming fee = ${LAMPORTS_RECIEVED} fee = ${SERVICE_FEE} user gets = ${LAMPORTS}`
        );
        const TXN = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: reciever.publicKey,
            toPubkey: new PublicKey(owner.publicKey),
            lamports: LAMPORTS,
          }),
          SystemProgram.transfer({
            fromPubkey: reciever.publicKey,
            toPubkey: new PublicKey(process.env.FEE_RECIEVER_WALLET),
            lamports: SERVICE_FEE,
          })
        );
        const SIGNATURE = await sendAndConfirmTransaction(
          conn,
          TXN,
          [recieverKeyPair],
          { commitment: owner.isFast ? "confirmed" : "max" }
        );

        const transaction = await TransactionModel.create({
          IsProcessed: false,
          createdAt: Date.now(),
          lamports: LAMPORTS,
          madeBy: owner,
          payload: data,
          privateKey: base58.encode(recieverKeyPair.secretKey),
          processedAt: null,
          publicKey: recieverKeyPair.publicKey.toBase58(),
          resendSignature: SIGNATURE,
          transferSignature: signatures,
        });
        await transaction.save();

        await UserModel.updateOne(
          { id: owner.id },
          {
            $push: { transactions: transaction },
            $inc: { lamports_recieved: LAMPORTS },
          }
        ).exec();

        webhook.sendWebhook({ user: owner, transaction });
      } catch (err: any) {
        const error = await ErrorModel.create({
          publicKey: reciever.publicKey.toBase58(),
          privateKey: secret,
          message: err.message,
        });
        await error.save();
      }
    },
    onBlockMaxRetriesExceeded: (badBlock) => {
      NetworkModel.findOneAndUpdate(
        { name: process.env.NETWORK },
        { $push: { badBlocks: badBlock } }
      ).exec();
    },
    onPollFinished: (last) => {
      NetworkModel.findOneAndUpdate(
        { name: process.env.NETWORK },
        { lastProcessedBlock: last }
      ).exec();
    },
    onHandleBlock: (block) => {
      NetworkModel.findOneAndUpdate(
        { name: process.env.NETWORK },
        { $push: { blocks: block } }
      ).exec();
    },
  });

  return {
    poller,
    conn,
    start() {
      poller.start();
      webhook.start();
      return this;
    },
    stop() {
      poller.stop();
      webhook.stop();
      return this;
    },
  };
};

interface IConfimer {
  redis: Redis;
  interval: number;
}

interface ISendWebhook {
  user: IUser;
  transaction: ITransaction;
}

function createWebhookConfirmer({ redis, interval }: IConfimer) {
  let isRunning = false;

  async function sendWebhookToAllUnprocessed() {
    if (!isRunning) return;
    // * Get All unprocessed transactions, this can pile up maybe discard if time exceeds *?* ?
    const TXNS = await TransactionModel.find({ IsProcessed: false }).populate(
      "madeBy"
    );

    for (const transaction of TXNS) {
      const createdAt = addMinutes(new Date(transaction.createdAt), 5);

      if (createdAt.getTime() < Date.now()) {
        console.log(`not yet ${createdAt.getTime()} < ${Date.now()}`);
        continue;
      }

      console.log(
        `Sending webhook to unprocessed transaction: ${transaction.lamports} url = ${transaction.madeBy.webhook}`
      );
      await send({ user: transaction.madeBy, transaction });
    }

    setTimeout(sendWebhookToAllUnprocessed, interval);
  }

  async function send({ transaction, user }: ISendWebhook) {
    try {
      const PAYLOAD = JSON.stringify({
        lamports: transaction.lamports,
        data: transaction.payload,
      });

      const sig = base58.encode(
        crypto
          .createHash("sha256")
          .update(PAYLOAD + user.api_key)
          .digest()
      );
      console.log(`Sending webhook to ${user.webhook}`);
      const { data } = await axios({
        url: user.webhook,
        method: "POST",
        data: PAYLOAD,
        headers: {
          "x-api-key": user.api_key,
          "Content-Type": "application/json",
          "x-signature": sig,
        },
        timeout: 2000,
      });

      if (data?.processed) {
        transaction.processedAt = new Date();
        transaction.IsProcessed = true;
      }
      
      if(data?.delete) {
        redis.del(transaction.publicKey);
      }


      await transaction.save();
    } catch (err: any) {
      console.log(
        `Unable to reach webhook ${user.webhook}: err: ${err?.message}`
      );
    }
  }

  return {
    sendWebhook: send,
    getRunning() {
      return isRunning;
    },
    start() {
      isRunning = true;
      sendWebhookToAllUnprocessed();
    },
    stop() {
      isRunning = false;
    },
  };
}
