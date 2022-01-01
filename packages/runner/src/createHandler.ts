import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction
} from "@solana/web3.js"
import base58 from "bs58"
import { Redis } from "ioredis"
import { createPoller } from "./createPoller"
import {
  Model,
  DepositRedisObject,
  Network,
  Transaction as TransactionModel,
  UserDocument,
  TransactionDocument,
  generateTransactionUUID
} from "shared"
import { createWebhookConfirmer } from "./createWebhookConfirmer"

interface IHandler {
  network: Network
  redis: Redis
  webhook_interval: number
  webhook_retry_exist_min: number
  maxRetries: number
  pollInterval: number
  maxPollsPerInterval: number
  retryDelay: number
}

export const createHandler = ({
  redis,
  network,
  webhook_interval,
  webhook_retry_exist_min,
  maxPollsPerInterval,
  maxRetries,
  pollInterval,
  retryDelay
}: IHandler) => {
  const conn = new Connection(network.url)
  const webhook = createWebhookConfirmer({
    interval: webhook_interval,
    requiredExistenceMinutes: webhook_retry_exist_min
  })

  const poller = createPoller({
    conn,
    maxRetries,
    pollInterval,
    maxPollsPerInterval,
    retryDelay,
    startBlock: network.lastBlock || "latest",
    onTransaction: async ({ reciever, signature, fee, sender }) => {
      const KEY_DATA = await redis.get(reciever.publicKey.toBase58())
      if (!KEY_DATA || reciever.change <= fee) return

      const { d, n, secret, u }: DepositRedisObject = JSON.parse(KEY_DATA)

      // * Rare case *
      if (n != network.name) return console.log("Wrong network")

      const recieverKeyPair = new Keypair({
        publicKey: reciever.publicKey.toBytes(),
        secretKey: Buffer.from(secret, "base64")
      })

      try {
        const owner = (await Model.get({
          pk: `USER#${u}`,
          sk: `NET#${network.name}`
        })) as UserDocument

        // * - fee = solana network transfer fee *

        const TAKE_FEE = reciever.change - fee / (100 + network.fee)
        const USER_GOT = reciever.change - TAKE_FEE - fee
        const LEFT_BALANCE = reciever.change - USER_GOT - TAKE_FEE

        if (reciever.change < 0.01 / 0.000000001) {
          return
        }

        if (LEFT_BALANCE != fee) {
          const error = await Model.create({
            pk: `NET${network.name}`,
            sk: `ERROR#${Date.now()}#${owner.pk.split("#")[1]}`,
            message: `
            [LEFT_BALANCE != fee]
            error on ${reciever.publicKey.toBase58()}
            sig = ${signature}
            TAKE_FEE = ${TAKE_FEE}
            USER_GOT = ${USER_GOT}
            LEFT_BALANCE = ${LEFT_BALANCE}
            fee = ${fee}
            secret = ${secret.toString()}
            user = ${JSON.stringify(owner.toJSON())}
            `
          })
          await error.save()
        }

        console.log(`${reciever.publicKey.toBase58()}`)
        console.log(`recieved a transaction `)
        const TXN = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: reciever.publicKey,
            toPubkey: new PublicKey(owner.walletAddress),
            lamports: USER_GOT
          })
        )

        if (!owner.paysFee) {
          TXN.add(
            SystemProgram.transfer({
              fromPubkey: reciever.publicKey,
              toPubkey: new PublicKey(process.env.FEE_RECIEVER_WALLET),
              lamports: TAKE_FEE
            })
          )
        }

        const SIGNATURE = await sendAndConfirmTransaction(
          conn,
          TXN,
          [recieverKeyPair],
          { commitment: owner.isFast ? "confirmed" : "max" }
        )

        const createdAt = Date.now()
        const uuid = generateTransactionUUID()

        const transaction = await Model.create({
          pk: `USER#${u}`,
          sk: `NET#${network.name}#TXN#PENDING#${uuid}#${createdAt}`,
          createdAt,
          uuid,
          senderPk: sender.publicKey.toBase58(),
          senderLm: sender.change,
          senderSig: signature,
          senderTo: reciever.publicKey.toBase58(),
          recieveLm: USER_GOT,
          recieveSig: SIGNATURE,
          status: "PENDING",
          payload: d
        } as TransactionModel)

        await transaction.save()

        webhook.send(transaction)
      } catch (err: any) {
        console.log(err)
        const error = await Model.create({
          pk: `NET${network.name}`,
          sk: `ERROR#${Date.now()}`,
          message: err?.toString(),
          walletAddress: reciever.publicKey.toBase58(),
          secretKey: Buffer.from(secret).toString("base64")
        })
      }
    },
    onBlockMaxRetriesExceeded: badBlock => {
      Model.create({
        pk: `NET#${process.env.NET}`,
        sk: `ERROR#${badBlock}#${Date.now()}`,
        message: `Bad block ${badBlock} on network ${process.env.NET}`
      })
    },
    onPollFinished: last => {
      Model.update({
        pk: `NET#${process.env.NET}`,
        sk: "DETAILS",
        lastBlock: last
      })
    },
    onHandleBlock: block => {
      // NetworkModel.findOneAndUpdate(
      //   { name: process.env.NETWORK },
      //   { $push: { blocks: block } }
      // ).exec();
    }
  })

  return {
    poller,
    conn,
    start() {
      poller.start()
      webhook.start()
      return this
    },
    stop() {
      poller.stop()
      webhook.stop()
      return this
    }
  }
}
