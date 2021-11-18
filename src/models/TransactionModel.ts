import { model, Schema } from "mongoose";
import { IUser } from "./UserModel";
export interface ITransaction {
  id: string;
  madeBy: IUser;
  publicKey: string;
  privateKey: string;
  createdAt: Date;
  processedAt: Date;
  payload: string;
  IsProcessed: boolean;
  lamports: number;
}

export const TransactionSchema = new Schema<ITransaction>({
  madeBy: { type: Schema.Types.ObjectId, ref: "User" },
  publicKey: String,
  privateKey: String,
  createdAt: { type: Date, default: new Date() },
  processedAt: Date,
  IsProcessed: Boolean,
  lamports: Number,
  payload: String,
});

export const TransactionModel = model("transaction", TransactionSchema);