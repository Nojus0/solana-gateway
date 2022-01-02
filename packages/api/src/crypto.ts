import base58 from "bs58"
import crypto from "crypto"
import { SmartBuffer } from "smart-buffer"

const TOKEN_SECRET = base58.decode(process.env.TOKEN_SECRET)
const IV_LEN = 16

export function encryptToken(str: string) {
  const iv = crypto.randomBytes(IV_LEN)

  const SB = new SmartBuffer()
  SB.writeBuffer(iv)

  const ciph = crypto.createCipheriv("aes-256-cbc", TOKEN_SECRET, iv)

  SB.writeBuffer(Buffer.concat([ciph.update(str), ciph.final()]))

  return base58.encode(SB.toBuffer())
}

export function decryptToken(str: string) {
  try {
    const SB = new SmartBuffer()
    SB.writeBuffer(base58.decode(str))

    const iv = SB.readBuffer(IV_LEN)
    const cipherText = SB.readBuffer()
    const decipher = crypto.createDecipheriv("aes-256-cbc", TOKEN_SECRET, iv)
    const decoded =
      decipher.update(cipherText).toString("utf-8") + decipher.final("utf-8")
    return decoded
  } catch (err) {
    console.log(err)
    throw new Error("Invalid token.")
  }
}
