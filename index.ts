import express from "express";
import { Connection, Keypair } from "@solana/web3.js";
import Redis from "ioredis";
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
