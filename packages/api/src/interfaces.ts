import { Request, Response } from "express"
import { Redis } from "ioredis"

export interface IContext {
  redis: Redis
  req: Request
  res: Response
  isFrontend: boolean
}
export const isProd = process.env.NODE_ENV === "production"
export const isDev = process.env.NODE_ENV === "development"
