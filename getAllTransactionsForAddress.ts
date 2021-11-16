// interface IInfo {
//   destination: string;
//   lamports: number;
//   source: string;
// }

// interface ITransaction extends IInfo {
//   signature: string;
// }


// async function getAllTransForAddress(addr: PublicKey): Promise<ITransaction[]> {
//   const ADDRESS_SIGS = await conn.getConfirmedSignaturesForAddress2(addr);

//   const SIGNATURES = ADDRESS_SIGS.map((obj) => obj.signature);

//   const TRANSACTIONS = await conn.getParsedConfirmedTransactions(
//     SIGNATURES,
//     "confirmed"
//   );

//   const CONFIRM = TRANSACTIONS.map((TXN) => {
//     const PARSED_INSTRUCTIONS = TXN?.transaction.message
//       .instructions as ParsedInstruction[];

//     if (!PARSED_INSTRUCTIONS) return;
//     TXN?.transaction.signatures;
//     const TRANSFERS = PARSED_INSTRUCTIONS.map((tr) => {
//       if (tr.parsed.type != "transfer") return;
//       else return tr.parsed.info as IInfo[];
//     });

//     return TRANSFERS;
//   });

//   const MERGED = CONFIRM.flat(2).map((txn, i) => ({
//     ...txn,
//     signature: SIGNATURES[i],
//   }));

//   return MERGED as ITransaction[];
// }
