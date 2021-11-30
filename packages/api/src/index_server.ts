import "dotenv/config";
import Redis from "ioredis";
import _ from "lodash";
import mongoose from "mongoose";
import typeDefs from "./graphql/typeDefs";
import { ApolloServer } from "apollo-server-express";
import resolvers from "./graphql/resolvers";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import middlewares from "./graphql/middleware";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import express from "express";
import cookieParser from "cookie-parser";
if (!process.env.MONGO_URI || !process.env.REDIS_URI)
  throw new Error("Redis or Mongo server uri not found.");

(async () => {
  const redis = new Redis(process.env.REDIS_URI);

  const mongo = await mongoose.connect(process.env.MONGO_URI);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const schemaWithMiddleware = applyMiddleware(schema, ...middlewares);

  const GQL_SERVER = new ApolloServer({
    schema: schemaWithMiddleware,
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      mongo,
      isFrontend:
        req.headers.origin == process.env.ORIGIN ||
        (process.env.NODE_ENV == "development" &&
          req.headers.origin == "http://localhost:4000"),
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });
  const app = express();
  app.use(cookieParser());
  await GQL_SERVER.start();
  GQL_SERVER.applyMiddleware({ app });

  app.listen(4000, () =>
    console.log(`Listening on http://localhost:4000/graphql`)
  );
})();
