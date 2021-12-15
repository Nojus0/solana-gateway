import "dotenv/config";
import Redis from "ioredis";
import _ from "lodash";
import mongoose from "mongoose";
import typeDefs from "./graphql/typeDefs";
import { ApolloServer } from "apollo-server-lambda";
import resolvers from "./graphql/resolvers";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import middlewares from "./graphql/middleware";
import { envProcessor } from "shared";
import cookieParser from "cookie-parser";
import express from "express";
if (!process.env.MONGO_URI || !process.env.REDIS_URI)
  throw new Error("Redis or Mongo server uri not found.");

if (typeof redis === "undefined") {
  var redis = new Redis(process.env.REDIS_URI);
}

if (typeof mongo_promise === "undefined") {
  var mongo_promise = mongoose.connect(process.env.MONGO_URI);
}

let mongo: typeof mongoose | null = null;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const schemaWithMiddleware = applyMiddleware(schema, ...middlewares);
const GQL_SERVER = new ApolloServer({
  schema: schemaWithMiddleware,
  introspection: true,

  context: ({ express: { req, res } }) => ({
    req,
    res,
    redis,
    mongo,
    isFrontend: req.headers.origin == process.env.ORIGIN,
  }),
});

envProcessor([
  "MONGO_URI",
  "REDIS_URI",
  "NETWORK",
  "FEE_RECIEVER_WALLET",
  "NODE_ENV",
  "ORIGIN",
  "API_KEY_LENGTH",
]);

export const handler = async (event, context, callback) => {
  if (!mongo) {
    mongo = await mongo_promise;
    console.log(`Connecting to mongo`);
  }

  return GQL_SERVER.createHandler({
    expressGetMiddlewareOptions: {
      cors: {
        credentials: true,
        origin: process.env.ORIGIN || "*",
      },
    },
    expressAppFromMiddleware: (middleware) => {
      const app = express();
      app.use(cookieParser());
      app.use(middleware);
      return app;
    },
  })(event, context, callback);
};
