import { createDepositData, readDepositData } from "shared";
import {
  Keypair,
  Transaction,
  Connection,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Signer,
} from "@solana/web3.js";

(async () => {
  const secretKey = Uint8Array.from([
    132, 34, 29, 0, 254, 204, 192, 67, 172, 103, 39, 96, 26, 198, 61, 179, 2,
    219, 112, 235, 204, 34, 12, 126, 154, 127, 57, 181, 18, 129, 48, 155, 201,
    248, 178, 48, 181, 9, 192, 204, 180, 24, 54, 235, 249, 108, 215, 158, 140,
    255, 246, 147, 240, 85, 45, 13, 149, 10, 63, 237, 184, 27, 8, 232,
  ]);

  const a = createDepositData({
    data: "test",
    uid: "69032190xjdfsni",
    secret: secretKey
  });

  console.log(readDepositData(a));
})();
