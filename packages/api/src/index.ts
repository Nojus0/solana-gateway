import "dotenv/config";
import express from "express";
import Redis from "ioredis";
import _ from "lodash";
import mongoose from "mongoose";
import typeDefs from "./graphql/typeDefs";
import { ApolloServer } from "apollo-server-lambda";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import resolvers from "./graphql/resolvers";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import middlewares from "./graphql/middleware";

if (!process.env.MONGO_URI || !process.env.REDIS_URI)
  throw new Error("Redis or Mongo server uri not found.");

const app = express();
const mongo = mongoose.connect(process.env.MONGO_URI);
const redis = new Redis(process.env.REDIS_URI);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const schemaWithMiddleware = applyMiddleware(schema, ...middlewares);
const GQL_SERVER = new ApolloServer({
  schema: schemaWithMiddleware,
  context: ({ express: { req, res } }) => ({ req, res, redis, mongo }),
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

export const handler = GQL_SERVER.createHandler();
