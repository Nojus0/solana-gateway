import "dotenv/config";
import mongoose from "mongoose";
import Redis from "ioredis";
import { gql } from "apollo-server";
import { NetworkModel, networkSchema, UserModel } from "shared";
import base58 from "bs58";
import { setup } from "./setup";

it("should create a user in mongodb", async () => {
  const { redis, server } = await setup();

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

  const mutation = gql`
    mutation createUser(
      $email: String!
      $password: String!
      $network: String!
    ) {
      createUser(email: $email, password: $password, network: $network) {
        email
        lamports_recieved
        api_key
      }
    }
  `;

  const variables = {
    email: "test@test.com",
    password: "testpassword",
    network: network.name,
  };

  const { data, errors } = await server.executeOperation({
    query: mutation,
    variables,
  });

  console.log(errors);

  expect(data.createUser.email).toEqual(variables.email);
  expect(errors).toBeUndefined();

  const db_user = await UserModel.findOne({ email: variables.email });
  await db_user.populate("transactions");
  expect(db_user).toBeDefined();
  expect(base58.decode(db_user.api_key).length).toBe(
    Number(process.env.API_KEY_LENGTH)
  );
  const account_network = await NetworkModel.findOne({
    name: "dev",
    accounts: { $in: [db_user] },
  });

  expect(account_network).toBeDefined();
  expect(db_user.webhook).toBeUndefined();
  expect(db_user.lamports_recieved).toEqual(0);
  expect(db_user.isFast).toBeFalsy();
  expect(db_user.transactions.length).toBe(0);
  expect(db_user.publicKey).toBeUndefined();

  redis.disconnect();
  await mongoose.disconnect();
});
