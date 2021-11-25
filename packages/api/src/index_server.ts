import "dotenv/config";
import Redis from "ioredis";
import _ from "lodash";
import mongoose from "mongoose";
import typeDefs from "./graphql/typeDefs";
import { ApolloServer } from "apollo-server";
import resolvers from "./graphql/resolvers";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import middlewares from "./graphql/middleware";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

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
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });
  GQL_SERVER.listen(4000, () =>
    console.log(`Listening on http://localhost:4000/graphql`)
  );
})();
