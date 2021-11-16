import express from "express";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Redis from "ioredis";
import base58 from "bs58";
import _ from "lodash";
import { createPoller } from "./createPoller";

interface IDepositAccount {
  secret: string;
  user: string;
}

(async () => {
  const app = express();

  const redis = new Redis({
    db: 1,
    port: 6379,
    host: "127.0.0.1",
  });

  // https://api.mainnet-beta.solana.com - Very rate limited and slow proccesing time, wont work
  // https://solana-api.projectserum.com - Doesn't hit rate limit, average processing time, have not checked the max limit.
  // https://api.devnet.solana.com // Doesn't hit rate limit very fast proccesing time

  const conn = new Connection("https://api.devnet.solana.com");

  const poller = createPoller({
    conn,
    maxRetries: 5,
    pollInterval: 2500,
    maxPollsPerInterval: 10,
    startBlock: 94706229,
    retryDelay: 1000,
    onTransaction: async ({ reciever }) => {
      if (reciever?.publicKey == null || reciever.change <= 0) return;

      // * Check if transaction reciever is a deposit address *
      const data: string = await redis.hget(
        "deposits",
        reciever.publicKey.toBase58()
      );

      // * Return if isn't a deposit address *
      if (!data) return;

      const Obj: IDepositAccount = JSON.parse(data);

      console.log(
        `DEPOSIT ADDRESS: ${reciever.publicKey.toBase58()} recieved ${
          reciever.change / LAMPORTS_PER_SOL
        } from user ${Obj.user}`
      );
    },
    onBlockMaxRetriesExceeded: async (badBlock) => {
      await redis.rpush("bad-blocks", badBlock);
    },
  }).start();

  app.get("/send", (req, res) => {
    const keypair = new Keypair();
    const user = req.query.user || "anonymous";

    redis.hset(
      "deposits",
      keypair.publicKey.toBase58(),
      JSON.stringify({
        secret: base58.encode(keypair.secretKey),
        user: Array.isArray(user) ? user[0].toString() : user.toString(),
      })
    );

    res.json({
      depositAddress: keypair.publicKey.toBase58(),
    });
  });

  app.listen(4000, () => console.log(`Listening on http://localhost:4000/`));
})();
