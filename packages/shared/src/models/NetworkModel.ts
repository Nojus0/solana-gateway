import { Schema, model, Document } from "mongoose";
import { IUser } from "..";

export interface INetwork extends Document {
  network: string;
  network_url: string;
  lastProcessedBlock: number;
  blocks: number[];
  badBlocks: number[];
  service_fee: number;
  accounts: IUser[];
}

export const networkSchema = new Schema<INetwork>({
  network: { type: String, required: true },
  network_url: String,
  lastProcessedBlock: { type: Number },
  blocks: { type: [Number], default: [] },
  badBlocks: { type: [Number], default: [] },
  service_fee: { type: Number, required: true, default: 2.0 },
  accounts: { type: [Schema.Types.ObjectId], ref: "user", default: [] },
});

export const NetworkModel = model<INetwork>("network", networkSchema);
