import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import { ApolloServer } from "apollo-server";
import middlewares from "../src/graphql/middleware";
import typeDefs from "../src/graphql/typeDefs";
import resolvers from "../src/graphql/resolvers";
import mongoose from "mongoose";
import { gql } from "apollo-server-core";
import Redis from "ioredis";
import { NetworkModel, UserModel } from "shared";

export const createUserMutation = gql`
  mutation createUser($email: String!, $password: String!, $network: String!) {
    createUser(email: $email, password: $password, network: $network) {
      email
      lamports_recieved
      api_key
    }
  }
`;

export async function setup() {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const mongo = await mongoose.connect(process.env.MONGO_URI);
  const redis = new Redis(process.env.REDIS_URI);
  const schemaWithMiddleware = applyMiddleware(schema, ...middlewares);

  const req: any = {
    headers: {},
  };

  const GQL_SERVER = new ApolloServer({
    schema: schemaWithMiddleware,
    introspection: true,
    context: ({ res }) => ({
      req,
      res,
      redis,
      mongo,
    }),
  });

  await UserModel.deleteOne({ email: "test@test.com" });
  redis.flushdb();
  await NetworkModel.updateOne({ name: "dev" }, [
    {
      $set: {
        accounts: [],
        name: "dev",
      },
    },
  ]);

  const network = await NetworkModel.findOne({ name: "dev" });

  async function createUser() {
    const variables = {
      email: "test@test.com",
      password: "testpassword",
      network: network.name,
    };

    const { data, errors } = await GQL_SERVER.executeOperation({
      query: createUserMutation,
      variables,
    });

    if (errors) console.log(errors);

    expect(data.createUser.email).toEqual(variables.email);
    expect(errors).toBeUndefined();

    return data.createUser;
  }

  function setHeaders(headers: any) {
    req.headers = headers;
  }

  async function cleanup() {
    redis.disconnect();
    await mongo.disconnect();
  }

  return {
    mongo,
    redis,
    network,
    server: GQL_SERVER,
    createUser,
    cleanup,
    setHeaders,
  };
}
