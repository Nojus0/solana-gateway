import { BlockResponse, Connection } from "@solana/web3.js"
import { IBlockTransaction } from "./interfaces"

interface IPoller {
  conn: Connection
  pollInterval?: number
  maxRetries?: number
  maxPollsPerInterval?: number
  /**
   * Don't set too high, it will block the
   * polling for that amount so you might
   * get too behind the blockchain
   * ! This is Synchronous !
   * TODO Make this Asynchronous
   */
  retryDelay?: number
  startBlock?: number | "latest"
  onTransaction: (transaction: IBlockTransaction) => void
  onBlockMaxRetriesExceeded: (badBlock: number) => void
  onPollFinished: (lastBlock: number) => void
  onHandleBlock: (asyncCurrentBlock: number) => void
}

export const createPoller = ({
  conn,
  maxRetries = 5,
  retryDelay = 1500,
  pollInterval = 2500,
  startBlock = "latest",
  maxPollsPerInterval = 25,
  onBlockMaxRetriesExceeded,
  onTransaction,
  onPollFinished,
  onHandleBlock
}: IPoller) => {
  let latestBlock: number | null = null
  let lastProcessedBlock = startBlock != "latest" ? startBlock : null
  let isActive = false

  async function parseBlockTransactions(BLOCK: BlockResponse) {
    if (!BLOCK || !BLOCK.transactions) return

    const ALLTXNS: IBlockTransaction[] = BLOCK.transactions.map((txn, i) => {
      const [sender, reciever] = txn.transaction.message.accountKeys.map(
        (pk, i) => ({
          publicKey: pk,
          postBalance: txn.meta.postBalances[i],
          preBalance: txn.meta.preBalances[i],
          feePayer: txn.transaction.message.isAccountSigner(i),
          change: txn.meta.postBalances[i] - txn.meta.preBalances[i]
        })
      )

      return {
        fee: txn.meta.fee,
        signature: Array.isArray(txn.transaction.signatures)
          ? txn.transaction.signatures[0]
          : txn.transaction.signatures,
        sender,
        reciever
      }
    })

    return ALLTXNS
  }

  async function repeatBlock(
    slot: number,
    retries = 0
  ): Promise<BlockResponse | null> {
    try {
      return await conn.getBlock(slot, { commitment: "finalized" })
    } catch (err: any) {
      if (retries > maxRetries) {
        onBlockMaxRetriesExceeded(slot)
        return null
      }

      retries++
      console.log(
        `[${retries}]Failled to fetch block ${slot}, err: ${err.message}`
      )

      return new Promise(res =>
        setTimeout(() => res(repeatBlock(slot, retries)), retryDelay)
      )
    }
  }

  async function handleBlock(slot: number) {
    // console.log(`[TASK] ${slot}`)
    const block = await repeatBlock(slot)
    // console.log(`[FINISHED] ${slot}`)

    if (!block) return

    onHandleBlock(slot)

    const TXNS = await parseBlockTransactions(block)

    TXNS.forEach(txn => {
      txn.reciever &&
        txn.sender &&
        txn.signature &&
        txn.fee &&
        onTransaction(txn)
    })
  }

  async function getLatestBlock(retries = 0): Promise<number> {
    try {
      return await conn.getSlot("finalized")
    } catch (err) {
      if (retries < maxRetries)
        return new Promise(res =>
          setTimeout(() => res(getLatestBlock(++retries)), retryDelay)
        )
      else throw new Error("[MANUAL] Failed to get latest block")
    }
  }

  async function getBlocksRange(
    start: number,
    end: number,
    retries = 0
  ): Promise<number[]> {
    try {
      return await conn.getBlocks(start, end)
    } catch (err) {
      if (retries > maxRetries) throw new Error("[MANUAL] Failed to get blocks")

      return new Promise(res =>
        setTimeout(() => res(getBlocksRange(start, end, ++retries)), retryDelay)
      )
    }
  }

  async function poll() {
    if (!isActive) return

    latestBlock = await getLatestBlock()

    lastProcessedBlock = lastProcessedBlock || latestBlock

    // console.log(`Latest block ${latestBlock} last block ${lastProcessedBlock}`)

    const adder = lastProcessedBlock + 1 < latestBlock ? 1 : 0

    if (latestBlock - (lastProcessedBlock + adder) > maxPollsPerInterval) {
      console.log(
        `Poll limit exceeded by ${
          latestBlock - lastProcessedBlock - maxPollsPerInterval
        } blocks`
      )
      latestBlock = lastProcessedBlock + maxPollsPerInterval
    }

    const blocks_list = await getBlocksRange(
      lastProcessedBlock + adder,
      latestBlock
    )

    const promises = blocks_list.map(block => handleBlock(block))

    await Promise.all(promises)

    lastProcessedBlock = latestBlock

    onPollFinished && onPollFinished(lastProcessedBlock)

    // console.log(`Finished Poll`)

    setTimeout(poll, pollInterval)
  }

  return {
    isRunning() {
      return isActive
    },
    start() {
      isActive = true
      poll()
      return this
    },
    stop() {
      isActive = false
      return this
    }
  }
}
