import { gql } from "apollo-server-core";
import "dotenv/config";
import { UserModel } from "shared";
import { setup } from "./setup";

const setWebhookMutation = gql`
  mutation setWebhook($newUrl: String!) {
    setWebhook(newUrl: $newUrl)
  }
`;

test("create a user submit full details", async () => {
  const { createUser, cleanup, setHeaders } = await setup();

  const user = await createUser();

  setHeaders({
    authorization: `Bearer ${user.api_key}`,
  });

  process.env.NETWORK = "dev";
  const HTTPS_URL = "https://random.com";
  const HTTP_URL = "http://127.0.0.1.com";

//   const WrongB = await server.executeOperation({
//     query: setWebhookMutation,
//     variables: {
//       newUrl: HTTP_URL,
//     },
//   });

  await cleanup();
});
