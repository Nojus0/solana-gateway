import { Connection, Keypair } from "@solana/web3.js";
import base58 from "bs58";

const PRIMARY_WALLET = new Keypair({
  publicKey: base58.decode("BtmeDx97CSrq9ce7dARsgnusA7YHbVe6732cfTkd8SFW"),
  secretKey: base58.decode(
    "BDNNqrHVweHckbrrAQF8amRjkqXMdPksaoHgGdPfqHbPiym1aCLyb2AXxjrcLz2nEiv7nhFwLDNaR1SwsXDpRDN"
  ),
});

export default PRIMARY_WALLET;

export async function getBalanceChangesFromBlock(
  conn: Connection,
  block: number
) {
  const BLOCK = await conn.getBlock(block, { commitment: "confirmed" });

  if (!BLOCK || !BLOCK.transactions) return;

  const ALLTXNS = BLOCK.transactions.map((txn, i) => {
    const obj = txn.transaction.message.accountKeys.map((pk, i) => ({
      publicKey: pk,
      postBalance: txn.meta.postBalances[i],
      preBalance: txn.meta.preBalances[i],
      feePayer: txn.transaction.message.isAccountSigner(i),
    }));

    const sender = obj[0];
    const reciever = obj[1];

    return {
      sender,
      reciever,
    };

  });

  return ALLTXNS
}

// const senderChange = sender.postBalance! - sender.preBalance!;

// const recieverChange = reciever.postBalance! - reciever.preBalance!;