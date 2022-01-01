import { PublicKey } from "@solana/web3.js";
import { Request, Response } from "express";
import { Redis } from "ioredis";
import mongoose from "mongoose";

export interface IContext {
  redis: Redis;
  req: Request;
  res: Response;
  mongo: typeof mongoose;
}

export interface IBlockTransaction {
  sender: ISubTransaction;
  reciever: ISubTransaction;
  fee: number;
  signature: string;
}

interface ISubTransaction {
  publicKey: PublicKey;
  postBalance: number;
  preBalance: number;
  feePayer: boolean;
  change: number;
}