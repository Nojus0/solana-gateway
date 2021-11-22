import { SmartBuffer } from "smart-buffer";

export const DEPOSIT_DATA_MAX_SIZE = 256;

export interface IDepositData {
  uid: string;
  secret: Buffer;
  data: Buffer;
}

export function createDepositData({ uid, data, secret }: IDepositData) {
  const b = new SmartBuffer();

  if (data.length > DEPOSIT_DATA_MAX_SIZE)
    throw new Error(
      `Data payload exceeds ${DEPOSIT_DATA_MAX_SIZE} bytes limit`
    );

  b.writeBufferNT(Buffer.from(uid, "hex"));
  b.writeBufferNT(secret);
  b.writeBufferNT(data);

  return b.toBuffer();
}

export function readDepositData(bfr: Buffer): IDepositData {
  const b = SmartBuffer.fromBuffer(bfr);

  return {
    uid: b.readBufferNT().toString("hex"),
    secret: b.readBufferNT(),
    data: b.readBufferNT(),
  };
}
