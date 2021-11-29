import { addMinutes } from "date-fns";
import { Redis } from "ioredis";
import { ITransaction, IUser, TransactionModel, UserModel } from "shared";
import crypto from "crypto";
import axios from "axios";

interface IConfimer {
  redis: Redis;
  interval: number;
  requiredExistenceMinutes: number;
}

export function createWebhookConfirmer({
  redis,
  interval,
  requiredExistenceMinutes,
}: IConfimer) {
  let isRunning = false;

  async function sendWebhookToAllUnprocessed() {
    if (!isRunning) return;
    // * Get All unprocessed transactions, this can pile up maybe discard if time exceeds *?* ?
    const TXNS = await TransactionModel.find({
      IsProcessed: false,
      webhook_retries: { $lt: 10 },
    }).populate("madeBy");

    for (const transaction of TXNS) {
      const createdAt = addMinutes(
        new Date(transaction.createdAt),
        requiredExistenceMinutes
      );

      if (new Date() < createdAt) {
        continue;
      }

      console.log(
        `Sending webhook to unprocessed transaction: ${transaction.lamports} url = ${transaction.madeBy.webhook}`
      );

      transaction.webhook_retries += 1;

      await transaction.populate("madeBy");
      await send(transaction);
      transaction.save();
    }

    setTimeout(sendWebhookToAllUnprocessed, interval);
  }

  async function send(transaction: ITransaction) {
    await transaction.populate("madeBy");

    try {
      const PAYLOAD = JSON.stringify({
        lamports: transaction.lamports,
        data: transaction.payload,
      });

      const sig = crypto
        .createHash("sha256")
        .update(PAYLOAD + transaction.madeBy.api_key)
        .digest("base64");

      console.log(`Sending webhook to ${transaction.madeBy.webhook}`);
      const { data } = await axios({
        url: transaction.madeBy.webhook,
        method: "POST",
        data: PAYLOAD,
        headers: {
          "x-api-key": transaction.madeBy.api_key,
          "Content-Type": "application/json",
          "x-signature": sig,
        },
        timeout: Number(process.env.WEBHOOK_TIMEOUT),
      });

      if (data?.processed) {
        transaction.processedAt = new Date();
        transaction.IsProcessed = true;
      }

      if (data?.delete) {
        redis.del(transaction.publicKey);
      }

      await transaction.save();
    } catch (err: any) {
      console.log(
        `Unable to reach webhook ${transaction.madeBy.webhook}: err: ${err?.message}`
      );
    }
  }

  return {
    send,
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
