import { Schema, model, Document } from "mongoose";
import { INetwork, ITransaction } from "..";

export interface IUser extends Document {
  id: string;
  email: string;
  argon2: string;
  webhook: string;
  api_key: string;
  publicKey: string;
  transactions: ITransaction[] | [Schema.Types.ObjectId];
  lamports_recieved: number;
  isFast: boolean;
  network: INetwork | Schema.Types.ObjectId;
}

export const UserSchema = new Schema<IUser>({
  argon2: { type: String },
  webhook: { type: String, maxlength: 1024 },
  email: { type: String, maxlength: 128, unique: true },
  api_key: { type: String, required: true },
  publicKey: { type: String },
  transactions: { type: [Schema.Types.ObjectId], ref: "transaction" },
  lamports_recieved: { type: Number, default: 0.0 },
  isFast: { type: Boolean, default: false },
  network: { type: Schema.Types.ObjectId, ref: "network", default: "main" },
});

export const UserModel = model<IUser>("user", UserSchema);
