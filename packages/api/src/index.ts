import "dotenv/config"
import Redis from "ioredis"
import _ from "lodash"
import typeDefs from "./graphql/typeDefs"
import { ApolloServer } from "./modified/apollo-lambda"
import resolvers from "./graphql/resolvers"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { applyMiddleware } from "graphql-middleware"
import middlewares from "./graphql/middleware"
import { envProcessor } from "shared"
import cookieParser from "cookie-parser"
import express from "express"

if (!process.env.REDIS_URI) throw new Error("Redis uri not found.")

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

const schemaWithMiddleware = applyMiddleware(schema, ...middlewares)

envProcessor(["REDIS_URI", "FEE_RECIEVER_WALLET", "ORIGIN", "TOKEN_SECRET"])

if (typeof redis === "undefined") {
  var redis = new Redis(process.env.REDIS_URI)
}

const GQL_SERVER = new ApolloServer({
  schema: schemaWithMiddleware,
  introspection: true,
  context: ({ express: { req, res } }) => ({
    req,
    res,
    redis,
    isFrontend: req.headers.origin == process.env.ORIGIN
  })
})

export const handler = async (event, context, callback) => {
  return GQL_SERVER.createHandler({
    expressGetMiddlewareOptions: {
      cors: {
        credentials: true,
        origin: process.env.ORIGIN || "*"
      }
    },
    expressAppFromMiddleware: middleware => {
      const app = express()
      app.use(cookieParser())
      app.use(middleware)
      return app
    }
  })(event, context, callback)
}
