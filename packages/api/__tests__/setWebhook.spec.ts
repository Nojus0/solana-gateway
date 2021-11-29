import "dotenv/config";
import mongoose from "mongoose";
import { gql } from "apollo-server";
import { NetworkModel, networkSchema, UserModel } from "shared";
import { setup } from "./setup";

const createUserMutation = gql`
  mutation createUser($email: String!, $password: String!, $network: String!) {
    createUser(email: $email, password: $password, network: $network) {
      email
      lamports_recieved
      api_key
    }
  }
`;
const setWebhookMutation = gql`
  mutation setWebhook($newUrl: String!) {
    setWebhook(newUrl: $newUrl)
  }
`;

test("create a user and set its webhook, and test wrong and correct ones", async () => {
  let req = {
    headers: {},
  };

  const { redis, server } = await setup(req as any);
  await UserModel.deleteOne({ email: "test@test.com" });
  await NetworkModel.updateOne({ name: "dev" }, [
    {
      $set: {
        accounts: [],
        name: "dev",
      },
    },
  ]);

  // * Create User Mutation *
  const account = await server.executeOperation({
    query: createUserMutation,
    variables: {
      email: "test@test.com",
      password: "testpassword",
      network: "dev",
    },
  });

  expect(account.data).toBeDefined();

  // * Retrieve public key *
  const api_key = account.data.createUser.api_key;

  req.headers = {
    authorization: `Bearer ${api_key}`,
  };

  const webhook = await server.executeOperation({
    query: setWebhookMutation,
    variables: {
      newUrl: "https://random.com",
    },
  });

  expect(webhook.data.setWebhook == "https://random.com").toBeTruthy();
  expect(webhook.errors).toBeUndefined();

  process.env.NETWORK = "mainnet";
  const WrongB = await server.executeOperation({
    query: setWebhookMutation,
    variables: {
      newUrl: "http://127.0.0.1.com",
    },
  });

  expect(WrongB.data.setWebhook).toBeNull();
  expect(WrongB.errors).toBeDefined();

  process.env.NETWORK = "dev";
  const correctDev = await server.executeOperation({
    query: setWebhookMutation,
    variables: {
      newUrl: "http://127.0.0.1.com",
    },
  });

  expect(correctDev.data.setWebhook).toBeDefined();
  expect(correctDev.errors).toBeUndefined();

  redis.disconnect();
  await mongoose.disconnect();
});
