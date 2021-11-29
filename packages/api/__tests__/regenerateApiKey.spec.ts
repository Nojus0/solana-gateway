import "dotenv/config";
import mongoose from "mongoose";
import { gql } from "apollo-server";
import { NetworkModel, networkSchema, UserModel } from "shared";
import { setup } from "./setup";
import base58 from "bs58";
const createUserMutation = gql`
  mutation createUser($email: String!, $password: String!, $network: String!) {
    createUser(email: $email, password: $password, network: $network) {
      email
      lamports_recieved
      api_key
    }
  }
`;
const regenerateApiKeyMutation = gql`
  mutation Mutation {
    regenerateApiKey
  }
`;

test("create a user and regenerate api key", async () => {
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
  let network = await NetworkModel.findOne({ name: "dev" });
  
  const variables = {
    email: "test@test.com",
    password: "testpassword",
    network: network.name,
  };

  const usr_r = await server.executeOperation({
    query: createUserMutation,
    variables,
  });

  usr_r.errors && console.log(usr_r.errors);
  
  req.headers = {
    authorization: `Bearer ${usr_r.data.createUser.api_key}`,
  };

  const regenResp = await server.executeOperation({
    query: regenerateApiKeyMutation,
  });

  expect(
    base58.decode(regenResp.data.regenerateApiKey).length ==
      Number(process.env.API_KEY_LENGTH)
  ).toBeTruthy();

  expect(regenResp.errors).toBeUndefined();

  const usr = await UserModel.findOne({ email: "test@test.com" });

  expect(usr.api_key == regenResp.data.regenerateApiKey).toBeTruthy();

  redis.disconnect();
  await mongoose.disconnect();
});
