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
const conn = new Connection("https://solana-api.projectserum.com");

(async () => {
  await redis.setnx("last", await conn.getSlot("root"));
})();

conn.onRootChange(async (root) => {
  await redis.set("latest-fetched-block", root);
});

async function processBehindBlocks() {
  const last = Number(await redis.get("last"));
  const latest = Number(await redis.get("latest-fetched-block"));

  const BLOCKS = await conn.getBlocks(last, latest);
  console.log(BLOCKS);
  for (const BLOCK of BLOCKS) {
    try {
      console.log(`Proccesing ${BLOCK}`);
      const a = await getBalanceChangesFromBlock(conn, BLOCK);

      for (const addr of a) {
        if (
          addr.sender.publicKey.toBase58() !=
          PRIMARY_WALLET.publicKey.toBase58()
        )
          continue;

        console.log(addr);
      }
      redis.set("last", BLOCK);
      console.log(`Proccessed! ${BLOCK}`);
    } catch (err: any) {
      console.log(`Failed to proccess ${BLOCK}: Err: ${err.message}`);
    }
  }
}

processBehindBlocks();

app.get("/request_deposit_address", async (req, res) => {
  const DEPOSIT = new Keypair();
  res.json({
    address: DEPOSIT.publicKey.toBase58(),
  });
});

app.listen(4000, () => console.log(`Listening on http://localhost:4000/`));
