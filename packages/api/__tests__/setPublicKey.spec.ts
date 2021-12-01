import "dotenv/config";
import { gql } from "apollo-server";
import base58 from "bs58";
import { setup } from "./setup";
import crypto from "crypto";
export const setPublicKeyMutation = gql`
  mutation setPublicKey($newPublicKey: String!) {
    setPublicKey(newPublicKey: $newPublicKey)
  }
`;

test("should create a user in mongodb and add a public key to it", async () => {
  const { redis, server, network, cleanup, createUser, setHeaders } =
    await setup();

  const user = await createUser();

  setHeaders({
    authorization: `Bearer ${user.api_key}`,
  });

  // * CORRECT PUBLIC KEY LENGTH *
  const pb_correct = base58.encode(crypto.randomBytes(32));
  const correct = await server.executeOperation({
    query: setPublicKeyMutation,
    variables: { newPublicKey: pb_correct },
  });
  if (correct.errors) console.log(correct.errors);
  expect(correct.data.setPublicKey).toBe(pb_correct);
  // * CORRECT PUBLIC KEY LENGTH *


  // * INVALID PUBLIC KEY LENGTH *
  const wrong = await server.executeOperation({
    query: setPublicKeyMutation,
    variables: { newPublicKey: base58.encode(crypto.randomBytes(1)) },
  });

  expect(wrong.data.setPublicKey).toEqual(null);
  // * INVALID PUBLIC KEY LENGTH *



  await cleanup();
});
