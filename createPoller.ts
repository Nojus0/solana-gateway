import { BlockResponse, Connection, PublicKey } from "@solana/web3.js";

export interface ITransaction {
  sender: ISubTransaction;
  reciever: ISubTransaction;
}

interface ISubTransaction {
  publicKey: PublicKey;
  postBalance: number;
  preBalance: number;
  feePayer: boolean;
  change: number;
}

const createPoller = (
  conn: Connection,
  interval = 2000,
  onTransaction: (transaction: ITransaction) => void
) => {
  let latestBlock: number | null = null;
  let lastProcessedBlock = latestBlock;

  let isActive = false;

  async function parseBlockTransactions(BLOCK: BlockResponse) {
    if (!BLOCK || !BLOCK.transactions) return;

    const ALLTXNS: ITransaction[] = BLOCK.transactions.map((txn, i) => {
      const obj = txn.transaction.message.accountKeys.map((pk, i) => ({
        publicKey: pk,
        postBalance: txn.meta.postBalances[i],
        preBalance: txn.meta.preBalances[i],
        feePayer: txn.transaction.message.isAccountSigner(i),
        change: txn.meta.postBalances[i] - txn.meta.preBalances[i],
      }));

      const sender: ISubTransaction = obj[0];
      const reciever: ISubTransaction = obj[1];

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

    TXNS.forEach((txn)=> onTransaction(txn));
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
