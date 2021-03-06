import { Keypair } from "@solana/web3.js"
import { gql } from "apollo-server-core"
import { DepositRedisObject } from "shared"
import { APIContext } from "../graphql/middlewares/apiMiddleware"
import { rateLimit } from "../rateLimit"

export const depositTypeDefs = gql`
  extend type Mutation {
    createDepositAddress(data: String!, lifetime_ms: Int!): DepositAddress
  }

  type DepositAddress {
    publicKey: String!
  }
`

export const max_ms_expires = 1000 * 60 * 15
export const min_ms_expires = 1000 * 60 * 5

const DepositResolver = {
  Query: {},
  Mutation: {
    createDepositAddress: async (
      _,
      params,
      { redis, user, req, res }: APIContext
    ) => {
      const GEN_DEPOSIT_WALLET = new Keypair()

      if (user.network == "dev") {
        const capacity = 25
        const rate = 2
        const consume = 1

        const { remaining, allowed } = await rateLimit({
          redis,
          category: "gen-dev",
          identifier: req.ip,
          capacity,
          consume,
          rate,
          time: Math.floor(Date.now() / 1000)
        })

        res.setHeader("X-RateLimit-Remaining", remaining.toString())
        res.setHeader("X-RateLimit-Req-Cost", consume.toString())
        res.setHeader("X-RateLimit-Req-Rate", rate.toString())
        res.setHeader("X-RateLimit-Capacity", capacity.toString())

        if (!allowed) return res.status(429).send("Too many requests")
      } else {
        const capacity = user.rateLimitCapacity || 100
        const rate = user.rateLimitRate || 20
        const consume = 1

        const { allowed, remaining } = await rateLimit({
          redis,
          category: "gen-main",
          identifier: req.ip,
          capacity,
          consume,
          rate,
          time: Math.floor(Date.now() / 1000)
        })

        res.setHeader("X-RateLimit-Remaining", remaining.toString())
        res.setHeader("X-RateLimit-Req-Cost", consume.toString())
        res.setHeader("X-RateLimit-Req-Rate", rate.toString())
        res.setHeader("X-RateLimit-Capacity", capacity.toString())

        if (!allowed) return res.status(429).send("Too many requests")
      }

      // * Cant do account:*publickey* because of buffer, possible but dirty *
      // * If problems arrise prefix it with some bytes or encoded string

      if (params.lifetime_ms < min_ms_expires) {
        throw new Error(
          `The specified lifetime is too low, minimum lifetime ${min_ms_expires} ms`
        )
      }

      if (params.lifetime_ms > max_ms_expires) {
        throw new Error(
          `The specified lifetime is too high maximum is ${max_ms_expires} ms`
        )
      }

      try {
        const data: DepositRedisObject = {
          u: user.email,
          n: user.network,
          d: params.data,
          secret: Buffer.from(GEN_DEPOSIT_WALLET.secretKey).toString("base64")
        }

        await redis.set(
          GEN_DEPOSIT_WALLET.publicKey.toBase58(),
          JSON.stringify(data),
          "PX",
          params.lifetime_ms as number
        )
      } catch (err) {
        console.log(err)
        throw new Error("Failed to create deposit address")
      }

      return {
        publicKey: GEN_DEPOSIT_WALLET.publicKey.toBase58()
      }
    }
  }
}

export default DepositResolver
