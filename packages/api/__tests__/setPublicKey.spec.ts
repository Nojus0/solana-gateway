import "dotenv/config";
import mongoose from "mongoose";
import { gql } from "apollo-server";
import { NetworkModel, networkSchema, UserModel } from "shared";
import base58 from "bs58";
import { setup } from "./setup";
import crypto from "crypto";

const createUserMutation = gql`
  mutation createUser($email: String!, $password: String!, $network: String!) {
    createUser(email: $email, password: $password, network: $network) {
      email
      lamports_recieved
      api_key
    }
  }
`;
const setPublicKeyMutation = gql`
  mutation setPublicKey($newPublicKey: String!) {
    setPublicKey(newPublicKey: $newPublicKey)
  }
`;

test("should create a user in mongodb and add a public key to it", async () => {
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

  // * CORRECT PUBLIC KEY LENGTH * 
  const pb_correct = base58.encode(crypto.randomBytes(32));

  const correct = await server.executeOperation({
    query: setPublicKeyMutation,
    variables: { newPublicKey: pb_correct },
  });
  correct.errors && console.log(correct.errors);
  expect(correct.data.setPublicKey).toBe(pb_correct);
  expect(correct.errors).toBeUndefined();
  // * CORRECT PUBLIC KEY LENGTH * 



  // * INVALID PUBLIC KEY LENGTH * 
  const wrong = await server.executeOperation({
    query: setPublicKeyMutation,
    variables: { newPublicKey: base58.encode(crypto.randomBytes(1)) },
  });

  expect(wrong.data.setPublicKey).toEqual(null);
  expect(wrong.errors).toBeDefined();
  // * INVALID PUBLIC KEY LENGTH * 


  redis.disconnect();
  await mongoose.disconnect();
});
