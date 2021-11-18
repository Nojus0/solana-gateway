import { Schema, model, Document } from "mongoose";

interface INetwork extends Document {
  network: string;
  network_url: string;
  lastProcessedBlock: number;
  blocks: number[];
  badBlocks: number[];
}

export const networkSchema = new Schema<INetwork>({
  network: { type: String, required: true },
  network_url: String,
  lastProcessedBlock: { type: Number },
  blocks: { type: [Number], default: [] },
  badBlocks: { type: [Number], default: [] },
});

export const NetworkModel = model<INetwork>("Networks", networkSchema);
