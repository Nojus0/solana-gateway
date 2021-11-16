import express from "express";
import {
  BlockResponse,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
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

const depositAddresses: Map<string, { secret: string; user: string }> = new Map(
  []
);

const createPoller = (conn: Connection, interval = 2000) => {
  let latestBlock: number | null = null;
  let lastProcessedBlock = latestBlock;

  let isActive = false;

  async function parseBlockTransactions(BLOCK: BlockResponse) {
    if (!BLOCK || !BLOCK.transactions) return;

    const ALLTXNS = BLOCK.transactions.map((txn, i) => {
      const obj = txn.transaction.message.accountKeys.map((pk, i) => ({
        publicKey: pk,
        postBalance: txn.meta.postBalances[i],
        preBalance: txn.meta.preBalances[i],
        feePayer: txn.transaction.message.isAccountSigner(i),
        change: txn.meta.postBalances[i] - txn.meta.preBalances[i],
      }));

      const sender = obj[0];
      const reciever = obj[1];

      return {
        sender,
        reciever,
      };
    });

    return ALLTXNS;
  }

  async function repeatBlock(slot: number): Promise<BlockResponse> {
    try {
      return await conn.getBlock(slot, { commitment: "finalized" });
    } catch (err: any) {
      console.log(`Failled to fetch block ${slot}, err: ${err.message}`);
      return repeatBlock(slot);
    }
  }

  async function handleBlock(slot: number) {
    console.log(`CALL ${slot}`);

    const block = await repeatBlock(slot);
    const TXNS = await parseBlockTransactions(block);
    console.log(`Processed ${slot}!`);

    for (const TXN of TXNS) {
      if (TXN?.reciever?.publicKey == null) continue;

      const UserData = depositAddresses.get(TXN.reciever.publicKey.toBase58());

      if (UserData && TXN.reciever.change > 0) {
        console.log(
          `${UserData.user} deposited ${TXN.reciever.change / LAMPORTS_PER_SOL}`
        );
      }
    }
  }

  async function poll() {
    if (!isActive) return;

    latestBlock = await conn.getSlot("finalized");
    lastProcessedBlock = lastProcessedBlock || latestBlock;

    console.log(`Latest block ${latestBlock} last block ${lastProcessedBlock}`);

    const blocks_list = await conn.getBlocks(lastProcessedBlock, latestBlock);

    const promises = blocks_list.map((block) => handleBlock(block));

    await Promise.all(promises);

    lastProcessedBlock = latestBlock;

    console.log(`Finished Poll`);

    setTimeout(poll, interval);
  }

  return {
    start() {
      isActive = true;
      poll();
    },
    stop() {
      isActive = false;
    },
  };
};

(async () => {
  const a = createPoller(conn, 2000);
  a.start();
})();

app.get("/send", (req, res) => {
  const keypair = new Keypair();
  const user = req.query.user || "anonymous";

  depositAddresses.set(keypair.publicKey.toBase58(), {
    secret: base58.encode(keypair.secretKey),
    user: Array.isArray(user) ? user[0].toString() : user.toString(),
  });

  res.json({
    depositAddress: keypair.publicKey.toBase58(),
  });
});

app.listen(4000, () => console.log(`Listening on http://localhost:4000/`));
