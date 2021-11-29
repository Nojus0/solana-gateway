import "dotenv/config";
import mongoose from "mongoose";
import { gql } from "apollo-server";
import { NetworkModel, networkSchema, UserModel } from "shared";
import base58 from "bs58";
import { setup } from "./setup";
import crypto from "crypto";

it("should create a user in mongodb and add a public key to it", async () => {
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

  const account = await server.executeOperation({
    query: gql`
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
    `,
    variables: {
      email: "test@test.com",
      password: "testpassword",
      network: "dev",
    },
  });

  expect(account.data).toBeDefined();

  const api_key = account.data.createUser.api_key;

  req.headers = {
    authorization: `Bearer ${api_key}`,
  };

  const mutation = gql`
    mutation setPublicKey($newPublicKey: String!) {
      setPublicKey(newPublicKey: $newPublicKey)
    }
  `;

  const pb_correct = base58.encode(crypto.randomBytes(32));

  const correct = await server.executeOperation({
    query: mutation,
    variables: { newPublicKey: pb_correct },
  });

  console.log(correct.errors);
  expect(correct.data.setPublicKey).toBe(pb_correct);
  expect(correct.errors).toBeUndefined();

  const wrong = await server.executeOperation({
    query: mutation,
    variables: { newPublicKey: base58.encode(crypto.randomBytes(4)) },
  });

  expect(wrong.data.setPublicKey).toEqual(null);
  expect(wrong.errors).toBeDefined();

  redis.disconnect();
  await mongoose.disconnect();
});
