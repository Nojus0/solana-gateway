import { model, Schema } from "mongoose";

export interface IError {
  publicKey: string;
  privateKey: string;
  message: string;
}

export const ErrorSchema = new Schema<IError>({
  publicKey: String,
  privateKey: String,
  message: String,
});

export const ErrorModel = model("error", ErrorSchema);
