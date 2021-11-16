import express from "express";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Redis from "ioredis";
import PRIMARY_WALLET, { getBalanceChangesFromBlock } from "./wallet";
import fs from "fs";
import path from "path";
import base58 from "bs58";
import _ from "lodash";

const app = express();

const redis = new Redis({
  db: 1,
  port: 6379,
  host: "127.0.0.1",
});

// https://api.mainnet-beta.solana.com
// https://api.devnet.solana.com
const conn = new Connection("https://api.devnet.solana.com");

(async () => {
  await redis.setnx("last-block", await conn.getSlot("root"));
})();

conn.onRootChange(async (root) => {
  if ((await redis.hget("processed", root.toString())) == "1") {
    console.log(`Already processed: ${root}`);
    return;
  }

  const all = await getBalanceChangesFromBlock(conn, root);

  const TXN = all.find(
    (a) => a.sender.publicKey.toBase58() == PRIMARY_WALLET.publicKey.toBase58()
  );

  if (TXN != null) {
    console.log(root);
    const senderChange = TXN.sender.postBalance! - TXN.sender.preBalance!;
    const recieverChange = TXN.reciever.postBalance! - TXN.reciever.preBalance!;
    console.log(
      `${TXN.sender.publicKey.toBase58()}: ${senderChange / LAMPORTS_PER_SOL}`
    );
    console.log(
      `${TXN.reciever.publicKey.toBase58()}: ${
        recieverChange / LAMPORTS_PER_SOL
      }`
    );
  }
  console.log(`Processed! ${root}`);
  await redis.hset("processed", root, 1);
});

app.listen(4000, () => console.log(`Listening on http://localhost:4000/`));
