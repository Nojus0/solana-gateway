import base58 from "bs58";
import { addMinutes } from "date-fns";
import { Redis } from "ioredis";
import { ITransaction, IUser, TransactionModel } from "shared";
import crypto from "crypto";
import axios from "axios";
interface IConfimer {
  redis: Redis;
  interval: number;
  requiredExistenceMinutes: number;
}

interface ISendWebhook {
  user: IUser;
  transaction: ITransaction;
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
    const TXNS = await TransactionModel.find({ IsProcessed: false }).populate(
      "madeBy"
    );

    for (const transaction of TXNS) {
      const createdAt = addMinutes(
        new Date(transaction.createdAt),
        requiredExistenceMinutes
      );

      if (new Date() < createdAt) {
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

      const sig = crypto
        .createHash("sha256")
        .update(PAYLOAD + user.api_key)
        .digest("base64");
        
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

      if (data?.delete) {
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
