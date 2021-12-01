import "dotenv/config";
import { gql } from "apollo-server";
import { UserModel } from "shared";
import { setup } from "./setup";

export const setWebhookMutation = gql`
  mutation setWebhook($newUrl: String!) {
    setWebhook(newUrl: $newUrl)
  }
`;

test("create a user and set its webhook, and test wrong and correct ones", async () => {
  const { redis, server, network, setHeaders, createUser, cleanup } =
    await setup();

  const user = await createUser();

  setHeaders({
    authorization: `Bearer ${user.api_key}`,
  });

  const HTTPS_URL = "https://random.com";
  const HTTP_URL = "http://127.0.0.1.com";

  process.env.NETWORK = "mainnet";
  const WRONG = await server.executeOperation({
    query: setWebhookMutation,
    variables: {
      newUrl: HTTP_URL,
    },
  });
  expect(WRONG.data.setWebhook).toBeNull();

  const CORRECT = await server.executeOperation({
    query: setWebhookMutation,
    variables: {
      newUrl: HTTPS_URL,
    },
  });

  // * CORRECT *
  expect(CORRECT.data.setWebhook).toBeDefined();
  const User = await UserModel.findOne({ email: "test@test.com" });
  expect(User.webhook == HTTPS_URL).toBeTruthy();

  await cleanup();
});
