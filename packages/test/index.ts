import { createDepositData, readDepositData } from "shared";
import { Keypair } from "@solana/web3.js";

(async () => {
  const acc = new Keypair();

  console.log(acc);

  const serialized = createDepositData({
    data: "312312#3",
    secret: acc.secretKey,
    uid: "61fzf",
  });
  console.log(readDepositData(serialized));
})();
