import { Model, Transaction, UserDocument } from "shared"
import crypto from "crypto"
import axios from "axios"
import { Payload, sign } from "solanagateway"
export class Webhook {
  static async send(user: UserDocument, txn: Transaction) {
    if (user.webhooks.length < 1) return

    async function sendOne(webhook: string): Promise<boolean> {
      const PAYLOAD = JSON.stringify({
        senderPk: txn.senderPk,
        senderLm: txn.senderLm,
        senderSig: txn.senderSig,
        senderTo: txn.senderTo,
        recieveLm: txn.recieveLm,
        recieveSig: txn.recieveSig,
        uuid: txn.uuid,
        createdAt: txn.createdAt,
        payload: txn.payload,
        targetWebhook: webhook
      } as Payload)
      const sig = sign(PAYLOAD, user.secretKey)
      console.log(`sending to ${webhook} = ${sig} = ${PAYLOAD}`)
      try {
        const { data } = await axios({
          url: webhook,
          method: "POST",
          data: PAYLOAD,
          headers: {
            "Content-Type": "application/json",
            "x-signature": sig
          },
          timeout: Number(process.env.WEBHOOK_TIMEOUT)
        })
        return data?.confirmed
      } catch (err) {
        return false
      }
    }
    const confirmations = await Promise.all(
      user.webhooks.map(url => sendOne(url))
    )

    if (confirmations.some(p => p == true)) {
      txn.pk = `USER#${user.email}`
      txn.sk = `NET#${user.network}#TXN#CONFIRMED#${txn.uuid}#${txn.createdAt}`
      txn.confirmedAt = Date.now()
      txn.status = "CONFIRMED"
      console.log(`confirmed ${txn.uuid}`)
    } else {
      txn.pk = `USER#${user.email}`
      txn.sk = `NET#${user.network}#TXN#PENDING#${txn.uuid}#${txn.createdAt}`
      txn.status = "PENDING"
      console.log(`pending ${txn.uuid}`)
    }

    await Model.create(txn)
  }
}
