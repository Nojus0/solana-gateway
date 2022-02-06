import axios from "axios"
import { network } from "./index"

export interface RPCResponseBase {
  jsonrpc: "2.0"
  id: 1
}

export const MAX_RETRIES = Number(process.env.MAX_RETRIES)

export async function getBlocks(start: number, endslot: number, retries = 0) {
  try {
    const Response = await axios({
      url: network.url,
      data: {
        jsonrpc: "2.0",
        id: 1,
        method: "getBlocks",
        params: [start, endslot]
      }
    })

    const data = Response.data as RPCResponseBase & { result: number[] }

    return data.result
  } catch (err) {
    if (retries > MAX_RETRIES)
      throw new Error("[RETRIES EXCEEDED] Failed to get blocks")

    return getBlocks(start, endslot, ++retries)
  }
}

export async function getBlock(block: number, retries = 0) {
  try {
    const { data } = await axios({
      url: network.url,
      data: {
        jsonrpc: "2.0",
        id: 1,
        method: "getBlock",
        params: [
          block,
          {
            encoding: "jsonParsed",
            transactionDetails: "full",
            commitment: "finalized",
            rewards: false
          }
        ]
      }
    })
    
    return data
  } catch (err) {
    if (retries > MAX_RETRIES)
      throw new Error("[RETRIES EXCEEDED] Failed to get block")

    return getBlock(block, ++retries)
  }
}

export async function getLatestFinalizedSlot(retries = 0) {
  try {
    const { data } = await axios({
      url: network.url,
      data: {
        jsonrpc: "2.0",
        id: 1,
        method: "getSlot",
        params: [
          {
            commitment: "finalized"
          }
        ]
      }
    })
    return data
  } catch (err) {
    if (retries > MAX_RETRIES)
      throw new Error("[RETRIES EXCEEDED] Failed to get latest finalized slot")

    return getLatestFinalizedSlot(++retries)
  }
}
