import crypto from "crypto";

export function verify(
  apiKey: string,
  secret: string,
  data: string,
  signature: string
) {
  return crypto.verify(
    "sha256",
    Buffer.from(data + apiKey),
    {
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      key: Buffer.from(secret, "base64"),
      format: "der",
      type: "pkcs1",
    },
    Buffer.from(signature, "base64")
  );
}

export interface IPayload {
  lamports: number;
  data: string;
  transferSignature: string;
  sendbackSignature: string;
  publicKey: string;
}
