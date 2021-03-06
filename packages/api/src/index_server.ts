import "dotenv/config"
import Redis from "ioredis"
import _ from "lodash"
import typeDefs from "./graphql/typeDefs"
import { ApolloServer } from "./modified/apollo-express"
import resolvers from "./graphql/resolvers"
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core"
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { applyMiddleware } from "graphql-middleware"
import middlewares from "./graphql/middleware"

if (!process.env.REDIS_URI)
  throw new Error("Redis or Mongo server uri not found.")
;(async () => {
  const redis = new Redis(process.env.REDIS_URI)

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  })

  const schemaWithMiddleware = applyMiddleware(schema, ...middlewares)

  const GQL_SERVER = new ApolloServer({
    schema: schemaWithMiddleware,
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      isFrontend: req.headers.origin == process.env.ORIGIN
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
  })

  const app = express()
  app.use(cookieParser())

  await GQL_SERVER.start()

  GQL_SERVER.applyMiddleware({
    app,
    cors: { credentials: true, origin: process.env.ORIGIN }
  })

  app.listen(4000, () =>
    console.log(`Listening on http://localhost:4000/graphql`)
  )
})()
