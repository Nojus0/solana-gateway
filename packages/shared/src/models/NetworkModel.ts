import { Schema, model, Document } from "mongoose";
import { IUser } from "..";

export interface Network {
  name: string;
  url: string;
  lastProcessedBlock: number;
  blocks: number[];
  badBlocks: number[];
  service_fee: number;
  accounts: IUser[];
}

export type INetwork = Network & Document;

export const networkSchema = new Schema<INetwork>({
  name: { type: String, required: true, unique: true },
  url: String,
  lastProcessedBlock: { type: Number },
  blocks: { type: [Number], default: [] },
  badBlocks: { type: [Number], default: [] },
  service_fee: { type: Number, required: true, default: 2.0 },
  accounts: { type: [Schema.Types.ObjectId], ref: "user", default: [] },
});

export const NetworkModel = model<INetwork>("network", networkSchema);
