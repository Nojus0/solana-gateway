import { Request, Response } from "express";
import { Redis } from "ioredis";
import mongoose from "mongoose";


export interface IContext {
  redis: Redis;
  req: Request;
  res: Response;
  mongo: typeof mongoose;
}
