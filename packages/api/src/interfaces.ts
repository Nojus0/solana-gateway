import { Request, Response } from "express";
import { Redis } from "ioredis";

export interface IContext {
  redis: Redis;
  req: Request;
  res: Response;
  isFrontend: boolean
}
