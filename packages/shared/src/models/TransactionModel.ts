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
  resendSignature: string;
  transferSignature: string;
}

export const TransactionSchema = new Schema<ITransaction>({
  madeBy: { type: Schema.Types.ObjectId, ref: "User" },
  publicKey: String,
  privateKey: String,
  createdAt: { type: Date, default: new Date() },
  processedAt: Date,
  IsProcessed: Boolean,
  transferSignature: String,
  resendSignature: String,
  lamports: Number,
  payload: { type: String, maxlength: 4096 },
});

export const TransactionModel = model("transaction", TransactionSchema);
