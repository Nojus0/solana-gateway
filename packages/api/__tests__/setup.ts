import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import { ApolloServer } from "apollo-server";
import middlewares from "../src/graphql/middleware";
import typeDefs from "../src/graphql/typeDefs";
import resolvers from "../src/graphql/resolvers";
import mongoose from "mongoose";
import Redis from "ioredis";
import { Request } from "express";
interface ISetup {
  mongo: typeof mongoose;
  redis: Redis.Redis;
  server: ApolloServer;
}

export async function setup(req?: Request): Promise<ISetup> {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const mongo = await mongoose.connect(process.env.MONGO_URI);
  const redis = new Redis(process.env.REDIS_URI);
  const schemaWithMiddleware = applyMiddleware(schema, ...middlewares);
  
  const GQL_SERVER = new ApolloServer({
    schema: schemaWithMiddleware,
    introspection: true,
    context: ({ res }) => ({
      req: req,
      res,
      redis,
      mongo,
    }),
  });

  return {
    mongo,
    redis,
    server: GQL_SERVER,
  };
}
