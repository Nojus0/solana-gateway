import { addMinutes } from "date-fns";
import { Redis } from "ioredis";
import { ITransaction, IUser, TransactionModel, UserModel } from "shared";
import crypto, { createPrivateKey, KeyObject } from "crypto";
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
        `Found unprocessed transaction: ${transaction.lamports} url = ${transaction.madeBy.webhook}`
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
        transferSignature: transaction.transferSignature,
        sendbackSignature: transaction.sendbackSignature,
      });

      const [, privateKey] = transaction.madeBy.verifyKeypair;

      const signature = sign(
        Buffer.from(PAYLOAD + transaction.madeBy.api_key),
        privateKey
      );

      console.log(`Sending webhook to ${transaction.madeBy.webhook}`);
      const { data } = await axios({
        url: transaction.madeBy.webhook,
        method: "POST",
        data: PAYLOAD,
        headers: {
          "x-api-key": transaction.madeBy.api_key,
          "Content-Type": "application/json",
          "x-signature": signature,
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

function sign(data: Buffer, privateKey: Buffer) {
  return crypto
    .sign("sha256", Buffer.from(data), {
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      key: createPrivateKey({
        key: privateKey,
        format: "der",
        type: "pkcs1",
      }),
    })
    .toString("base64");
}
