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
import { createWebhookConfirmer } from "./createWebhookConfirmer";

interface IHandler {
  network: INetwork;
  redis: Redis;
  webhook_interval: number;
  webhook_retry_exist_min: number;
  maxRetries: number;
  pollInterval: number;
  maxPollsPerInterval: number;
  retryDelay: number;
}

export const createHandler = ({
  redis,
  network,
  webhook_interval,
  webhook_retry_exist_min,
  maxPollsPerInterval,
  maxRetries,
  pollInterval,
  retryDelay,
}: IHandler) => {
  const conn = new Connection(network.url);
  const webhook = createWebhookConfirmer({
    redis,
    interval: webhook_interval,
    requiredExistenceMinutes: webhook_retry_exist_min,
  });

  const poller = createPoller({
    conn,
    maxRetries,
    pollInterval,
    maxPollsPerInterval,
    retryDelay,
    startBlock: network.lastProcessedBlock || "latest",
    onTransaction: async ({ reciever, signatures, fee }) => {
      const KEY_DATA = await redis.getBuffer(reciever.publicKey.toBase58());

      if (!KEY_DATA || reciever.change <= 0) return;

      // * -5000 lamports because of send back fee *
      // * So the user pays the fee when sending to the deposit address *
      // * And when sending back to main wallet *

      const { data, secret, uid } = readDepositData(KEY_DATA);

      const recieverKeyPair = new Keypair({
        publicKey: reciever.publicKey.toBytes(),
        secretKey: secret,
      });

      try {
        const owner = await UserModel.findById(uid).select("-transactions");

        // * - fee = solana network transfer fee *
        const LAMPORTS_RECIEVED = reciever.change - fee;
        const SERVICE_FEE = (LAMPORTS_RECIEVED / 100) * network.service_fee;
        const LAMPORTS =
          LAMPORTS_RECIEVED - (!owner.isFeeExempt ? SERVICE_FEE : 0);

        console.log(`${reciever.publicKey.toBase58()}`);
        console.log(
          `recieved minus incoming fee = ${LAMPORTS_RECIEVED} fee = ${SERVICE_FEE} user gets = ${LAMPORTS}`
        );
        const TXN = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: reciever.publicKey,
            toPubkey: new PublicKey(owner.publicKey),
            lamports: LAMPORTS,
          })
        );

        if (!owner.isFeeExempt) {
          TXN.add(
            SystemProgram.transfer({
              fromPubkey: reciever.publicKey,
              toPubkey: new PublicKey(process.env.FEE_RECIEVER_WALLET),
              lamports: SERVICE_FEE,
            })
          );
        }

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
          webhook_retries: 0,
        });
        await transaction.save();

        await UserModel.updateOne(
          { id: owner.id },
          {
            $push: { transactions: transaction },
            $inc: { lamports_recieved: LAMPORTS },
          }
        ).exec();

        webhook.send(transaction);
      
      } catch (err: any) {
        console.log(err);
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
      // NetworkModel.findOneAndUpdate(
      //   { name: process.env.NETWORK },
      //   { $push: { blocks: block } }
      // ).exec();
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
