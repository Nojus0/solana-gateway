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
  }),
});

export const handler = async (event, context, callback) => {
  if (!mongo) {
    mongo = await mongo_promise;
    console.log(`Connecting to mongo`);
  }

  return GQL_SERVER.createHandler()(event, context, callback);
};
