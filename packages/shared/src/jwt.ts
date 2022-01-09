import jwt from "jsonwebtoken"

export interface IJwtToken {
  email: string
  network: string
}

export function createToken(token: IJwtToken) {
  return jwt.sign(token, process.env.TOKEN_SECRET!)
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.TOKEN_SECRET!, { maxAge: "1d" })
}
