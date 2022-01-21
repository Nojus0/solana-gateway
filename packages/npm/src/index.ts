import crypto from "crypto"

export interface Payload {
  /**
   * The UUID of the transaction
   */
  uuid: string
  /**
   * The public key of the sender who sent the SOL to one of your deposit addresses
   */
  senderPk: string
  /**
   * The deposit address the sender sent the SOL to.
   */
  senderTo: string
  /**
   * Senders signature
   */
  senderSig: string
  /**
   * The amount of LAMPORTS sent by the sender
   */
  senderLm: number

  /**
   * The text payload specfied by you.
   */
  payload: string
  /**
   * The LAMPORTS you recieved to your wallet after fees.
   */
  recieveLm: number
  /**
   * The signature of the transfer to your wallet from the temporary deposit address.
   */
  recieveSig: string
  /**
   * The time the transaction was found on the blockchain.
   */
  createdAt: number
  /**
   * The webhook url this payload is meant for.
   */
  targetWebhook: string
}

export function verify(body: string, sk: string, signature: string) {
  return (
    crypto
      .createHash("sha256")
      .update(Buffer.from(body + sk))
      .digest("base64") === signature
  )
}
