import "dotenv/config";
import mongoose from "mongoose";
import { gql } from "apollo-server";
import { NetworkModel, networkSchema, UserModel } from "shared";
import { setup } from "./setup";

const setFastMutation = gql`
  mutation SetFast($newFast: Boolean!) {
    setFast(newFast: $newFast)
  }
`;

const createUserMutation = gql`
  mutation createUser($email: String!, $password: String!, $network: String!) {
    createUser(email: $email, password: $password, network: $network) {
      email
      lamports_recieved
      api_key
    }
  }
`;

test("create a user and set it to fast mode", async () => {
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

  const createUserResponse = await server.executeOperation({
    query: createUserMutation,
    variables,
  });

  createUserResponse.errors && console.log(createUserResponse.errors);

  req.headers = {
    authorization: `Bearer ${createUserResponse.data.createUser.api_key}`,
  };

  const fastResponse = await server.executeOperation({
    query: setFastMutation,
    variables: {
      newFast: true,
    },
  });
  fastResponse.errors && console.log(fastResponse.errors);

  expect(fastResponse.data.setFast).toBeTruthy();
  expect(fastResponse.errors).toBeUndefined();

  const usr = await UserModel.findOne({ email: "test@test.com" });

  expect(usr.isFast).toBeTruthy();

  redis.disconnect();
  await mongoose.disconnect();
});
