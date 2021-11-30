import "dotenv/config";
import { gql } from "apollo-server";
import { UserModel } from "shared";
import { setup } from "./setup";
import base58 from "bs58";
const regenerateApiKeyMutation = gql`
  mutation Mutation {
    regenerateApiKey
  }
`;

test("create a user and regenerate api key", async () => {
  const { redis, server, network, createUser, cleanup, setHeaders } =
    await setup();

  const user = await createUser();

  setHeaders({
    authorization: `Bearer ${user.api_key}`,
  });

  const regenResp = await server.executeOperation({
    query: regenerateApiKeyMutation,
  });

  if (regenResp.errors) console.log(regenResp.errors);

  expect(
    base58.decode(regenResp.data.regenerateApiKey).length ==
      Number(process.env.API_KEY_LENGTH)
  ).toBeTruthy();

  expect(regenResp.errors).toBeUndefined();

  const usr = await UserModel.findOne({ email: "test@test.com" });

  expect(usr.api_key == regenResp.data.regenerateApiKey).toBeTruthy();

  await cleanup();
});
