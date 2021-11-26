import { SmartBuffer } from "smart-buffer";

export const DEPOSIT_DATA_MAX_SIZE = 256;

export interface IDepositData {
  uid: string;
  secret: Uint8Array;
  data: string;
}

export function createDepositData({ uid, data, secret }: IDepositData) {
  const b = new SmartBuffer();

  if (Buffer.from(data).length > DEPOSIT_DATA_MAX_SIZE)
    throw new Error(
      `Data payload exceeds ${DEPOSIT_DATA_MAX_SIZE} bytes limit`
    );

  if (secret.length != 64)
    throw new Error(
      `[Create Deposit Data] secret key length isn't 64 got ${secret.length}`
    );

  const uid_buffer = Buffer.from(uid, "hex");

  if (uid_buffer.length != 12)
    throw new Error(
      `[Create Deposit Data] MongoDB ObjectId, is incorrect length supposed to be 12 bytes got ${uid_buffer.length} bytes`
    );

  b.writeBuffer(uid_buffer);
  b.writeBuffer(Buffer.from(secret));
  b.writeStringNT(data);

  return b.toBuffer();
}

export function readDepositData(bfr: Buffer): IDepositData {
  const b = SmartBuffer.fromBuffer(bfr);

  return {
    uid: b.readBuffer(12).toString("hex"),
    secret: Uint8Array.from(b.readBuffer(64)),
    data: b.readStringNT(),
  };
}
