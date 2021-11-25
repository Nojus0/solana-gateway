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

  b.writeBufferNT(Buffer.from(uid, "hex"));
  b.writeBufferNT(Buffer.from(secret));
  b.writeStringNT(data);

  return b.toBuffer();
}

export function readDepositData(bfr: Buffer): IDepositData {
  const b = SmartBuffer.fromBuffer(bfr);

  return {
    uid: b.readBufferNT().toString("hex"),
    secret: Uint8Array.from(b.readBufferNT()),
    data: b.readStringNT(),
  };
}
