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
  NetworkModel,
  readDepositData,
  TransactionModel,
  UserModel,
} from "shared";

export const createHandler = (
  NETWORK: INetwork & {
    _id: any;
  },
  redis: Redis,
  webhookInterval: number = 1000 * 60 * 5
) => {
  const conn = new Connection(NETWORK.network_url);

  const poller = createPoller({
    conn,
    maxRetries: 5,
    pollInterval: 2500,
    maxPollsPerInterval: 45,
    startBlock: NETWORK.lastProcessedBlock || "latest",
    retryDelay: 1000,
    onTransaction: async ({ reciever, signatures, fee }) => {
      const KEY_DATA = await redis.getBuffer(reciever.publicKey.toBase58());

      if (!KEY_DATA || reciever.change <= 0) return;

      // * -5000 lamports because of send back fee *
      // * So the user pays the fee when sending to the deposit address *
      // * And when sending back to main wallet *

      const LAMPORTS_RECIEVED = reciever.change - fee;
      const SERVICE_FEE = (LAMPORTS_RECIEVED / 100) * NETWORK.service_fee;
      const LAMPORTS = LAMPORTS_RECIEVED - SERVICE_FEE;

      const recieverData = readDepositData(KEY_DATA);

      const recieverKeyPair = new Keypair({
        publicKey: reciever.publicKey.toBytes(),
        secretKey: recieverData.secret,
      });

      try {
        const owner = await UserModel.findById(recieverData.uid).select(
          "-transactions"
        );
        console.log(`${reciever.publicKey.toBase58()}`);
        console.log(
          `recieved minus incoming fee = ${LAMPORTS_RECIEVED} fee = ${SERVICE_FEE} user gets = ${LAMPORTS}`
        );
        const TRANSACTION = new Transaction().add(
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
          TRANSACTION,
          [recieverKeyPair],
          { commitment: owner.isFast ? "confirmed" : "max" }
        );

        const DB_TRANSACTION = await TransactionModel.create({
          IsProcessed: false,
          createdAt: Date.now(),
          lamports: LAMPORTS,
          madeBy: owner,
          payload: recieverData.data,
          privateKey: base58.encode(recieverKeyPair.secretKey),
          processedAt: null,
          publicKey: recieverKeyPair.publicKey.toBase58(),
          resendSignature: SIGNATURE,
          transferSignature: signatures,
        });
        await DB_TRANSACTION.save();

        await sendWebhook(
          owner.webhook,
          LAMPORTS,
          recieverData,
          DB_TRANSACTION
        );

        await UserModel.updateOne(
          { id: owner.id },
          {
            $push: { transactions: DB_TRANSACTION },
            $inc: { lamports_recieved: LAMPORTS },
          }
        ).exec();
      } catch (err: any) {
        const error = await ErrorModel.create({
          publicKey: reciever.publicKey.toBase58(),
          privateKey: recieverData.secret,
          message: err.message,
        });
        await error.save();
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
  });

  async function sendWebhook(
    url: string,
    LAMPORTS: number,
    recieverData: IDepositData,
    transaction: mongoose.Document<any, any, ITransaction> &
      ITransaction & {
        _id: mongoose.Types.ObjectId;
      }
  ) {
    try {
      // ! SENDING RAW BUFFER ? CHECK IF WORKS ELSE SEND BASE64 ENCODED !
      const payload = JSON.stringify({
        lamports: LAMPORTS,
        data: recieverData.data,
      });

      const sig = base58.encode(
        crypto
          .createHash("sha256")
          .update(payload + transaction.madeBy.api_key)
          .digest()
      );

      const { data } = await axios({
        url: url,
        method: "POST",
        data: payload,
        headers: {
          "x-api-key": transaction.madeBy.api_key,
          "Content-Type": "application/json",
          "x-signature": sig,
        },
        timeout: 2000,
      });

      if (data?.processed == true) {
        transaction.processedAt = new Date();
        transaction.IsProcessed = true;
        await transaction.save();
      }
    } catch (err: any) {
      console.log(`Unable to reach webhook ${url}: err: ${err?.message}`);
    }
  }

  async function sendWebhookToAllUnprocessed() {
    if (!poller.isRunning()) return;
    const TXNS = await TransactionModel.find({ IsProcessed: false }).populate(
      "madeBy"
    );

    for (const transaction of TXNS) {
      const createdAt = addMinutes(new Date(transaction.createdAt), 5);

      if (createdAt.getTime() > Date.now()) {
        continue;
      }

      const data_bfr = await redis.hgetBuffer(
        "deposits",
        transaction.publicKey
      );

      const decoded = readDepositData(data_bfr);

      console.log(
        `Sending webhook to unprocessed transaction: ${transaction.lamports} url = ${transaction.madeBy.webhook}`
      );
      await sendWebhook(
        transaction.madeBy.webhook,
        transaction.lamports,
        decoded,
        transaction
      );
    }

    setTimeout(sendWebhookToAllUnprocessed, webhookInterval);
  }

  return {
    poller,
    conn,
    start() {
      poller.start();
      sendWebhookToAllUnprocessed();
      return this;
    },
    stop() {
      poller.stop();
      return this;
    },
  };
};
