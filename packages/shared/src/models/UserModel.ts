import { Schema, model, Document } from "mongoose";
import { type } from "os";
import { INetwork, ITransaction } from "..";

export interface User {
  email: string;
  password: string;
  webhook: string;
  api_key: string;
  publicKey: string;
  transactions: ITransaction[] | [Schema.Types.ObjectId];
  lamports_recieved: number;
  isFeeExempt: boolean;
  isFast: boolean;
  createdAt: Date;
  network: INetwork | Schema.Types.ObjectId;
  verifyKeypair: Buffer[];
}

export type IUser = User & Document;

export const UserSchema = new Schema<IUser>({
  password: { type: String },
  webhook: { type: String, maxlength: 1024 },
  email: { type: String, maxlength: 128, unique: true, minlength: 3 },
  api_key: { type: String },
  publicKey: { type: String },
  isFeeExempt: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() },
  transactions: { type: [Schema.Types.ObjectId], ref: "transaction" },
  lamports_recieved: { type: Number, default: 0.0 },
  isFast: { type: Boolean, default: false },
  network: { type: Schema.Types.ObjectId, ref: "network" },
  verifyKeypair: { type: [Buffer], required: true },
});

// Make UserSchema email to be always unique in the database and not case sensitive
UserSchema.index({ email: 1 }, { unique: true });

UserSchema.pre<IUser>("validate", function (next) {
  this.email = this.email.toLowerCase();
  next();
});

export const UserModel = model<IUser>("user", UserSchema);
