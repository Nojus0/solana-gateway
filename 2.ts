// conn.onRootChange(async (root) => {
//   if ((await redis.hget("processed", root.toString())) == "1") {
//     console.log(`Already processed: ${root}`);
//     return;
//   }

//   // console.log(`Processing ${root}`);
//   const all = await getBalanceChangesFromBlock(conn, root);

//   const TXN = all.find(
//     (a) => a.sender.publicKey.toBase58() == PRIMARY_WALLET.publicKey.toBase58()
//   );

//   if (TXN != null) {
//     console.log(root);
//     const senderChange = TXN.sender.postBalance! - TXN.sender.preBalance!;
//     const recieverChange = TXN.reciever.postBalance! - TXN.reciever.preBalance!;
//     console.log(
//       `${TXN.sender.publicKey.toBase58()}: ${senderChange / LAMPORTS_PER_SOL}`
//     );
//     console.log(
//       `${TXN.reciever.publicKey.toBase58()}: ${
//         recieverChange / LAMPORTS_PER_SOL
//       }`
//     );
//   }
//   await redis.hset("processed", root, 1);
//   // console.log(`Processed! ${root}`);
// });
