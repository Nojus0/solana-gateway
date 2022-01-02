import { addMinutes } from "date-fns"
import { Redis } from "ioredis"
import { IPayload } from "solanagateway"
import { Model, Transaction, TransactionDocument, UserDocument } from "shared"
import crypto, { createPrivateKey, KeyObject } from "crypto"
import axios from "axios"

export class Webhook {
  static async send(u: UserDocument, t: TransactionDocument) {
    for (let webhook of u?.webhooks) {
      try {
        const PAYLOAD = JSON.stringify({
          senderPk: t.senderPk,
          senderLm: t.senderLm,
          senderSig: t.senderSig,
          senderTo: t.senderTo,
          recieveLm: t.recieveLm,
          recieveSig: t.recieveSig,
          uuid: t.uuid,
          createdAt: t.createdAt,
          payload: t.payload,
          targetWebhook: webhook
        })
        const signature = sign(PAYLOAD, u.secretKey)

        const { data } = await axios({
          url: webhook,
          method: "POST",
          data: PAYLOAD,
          headers: {
            "Content-Type": "application/json",
            "x-signature": signature
          },
          timeout: Number(process.env.WEBHOOK_TIMEOUT)
        })

        if (data?.confirmed) {
          t.confirmedAt = Date.now()

          const newTransaction: Transaction = {
            ...t,
            status: "CONFIRMED",
            confirmedAt: Date.now(),
            sk: `NET#${u.network}#TXN#CONFIRMED#${t.uuid}#${t.createdAt}`
          }

          await Model.transaction.update([
            Model.delete({
              pk: t.pk,
              sk: t.sk
            }),
            Model.create(newTransaction)
          ])
        }
      } catch (err: any) {
        console.log(`Unable to reach webhook`)
      }
    }
  }
}

function sign(request: string, sk: string) {
  return crypto
    .createHash("sha256")
    .update(Buffer.from(request + sk))
    .digest("base64")
}
