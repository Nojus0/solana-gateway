import { Document, model, Schema } from "mongoose";
import { IUser } from "./UserModel";

export type ITransaction = Transaction & Document;

export interface TransactionBasic {
  id: string;
  transferSignature: string;
  sendbackSignature: string;
  lamports: number;
  payload: string;
  IsProcessed: boolean;
  processedAt: Date;
  createdAt: Date;
  publicKey: string;
}

export interface Transaction {
  madeBy: IUser;
  publicKey: string;
  privateKey: string;
  createdAt: Date;
  processedAt: Date;
  payload: string;
  IsProcessed: boolean;
  lamports: number;
  sendbackSignature: string;
  transferSignature: string;
  webhook_retries: number;
}

export const TransactionSchema = new Schema<ITransaction>({
  madeBy: { type: Schema.Types.ObjectId, ref: "user" },
  publicKey: String,
  privateKey: String,
  createdAt: { type: Date, default: new Date() },
  processedAt: Date,
  IsProcessed: Boolean,
  transferSignature: String,
  sendbackSignature: String,
  lamports: Number,
  payload: { type: String, maxlength: 4096 },
  webhook_retries: { type: Number, default: 0 },
});

export const TransactionModel = model("transaction", TransactionSchema);
