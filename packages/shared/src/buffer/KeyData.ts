import { SmartBuffer } from "smart-buffer";

export interface IKeyData {
  requested: number;
  uid: string;
}

export function createKeyData({ requested, uid }: IKeyData) {
  const b = new SmartBuffer();

  b.writeUInt32LE(requested);
  b.writeBufferNT(Buffer.from(uid, "hex"));

  return b.toBuffer();
}

export function readKeyData(bfr: Buffer): IKeyData {
  const b = SmartBuffer.fromBuffer(bfr);

  return {
    requested: b.readUInt32LE(),
    uid: b.readBufferNT().toString("hex"),
  };
}
