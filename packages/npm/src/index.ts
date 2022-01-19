import crypto from "crypto"

export function verify(body: string, sk: string, signature: string) {
  return (
    crypto
      .createHash("sha256")
      .update(body + sk)
      .digest("base64") === signature
  )
}
