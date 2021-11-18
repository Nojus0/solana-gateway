import { Schema, model, Document } from "mongoose";
import { ITransaction } from "../createPoller";

export interface IUser extends Document {
  id: string;
  email: string;
  argon2: string;
  webhook: string;
  api_key: string;
  publicKey: string;
  transactions: ITransaction[] | [Schema.Types.ObjectId];
}

export const UserSchema = new Schema<IUser>({
  argon2: { type: String },
  webhook: { type: String, maxlength: 1024 },
  email: { type: String, maxlength: 128, unique: true },
  api_key: { type: String, required: true },
  publicKey: { type: String },
  transactions: { type: [Schema.Types.ObjectId], ref: "transaction" },
});


export const UserModel = model<IUser>("User", UserSchema);
