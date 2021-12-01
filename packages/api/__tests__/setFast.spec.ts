import "dotenv/config";
import { gql } from "apollo-server";
import { UserModel } from "shared";
import { setup } from "./setup";

export const setFastMutation = gql`
  mutation SetFast($newFast: Boolean!) {
    setFast(newFast: $newFast)
  }
`;

test("create a user and set it to fast mode", async () => {
  let { redis, server, network, cleanup, createUser, setHeaders } =
    await setup();

  const user = await createUser();

  setHeaders({
    authorization: `Bearer ${user.api_key}`,
  });

  const fastResponse = await server.executeOperation({
    query: setFastMutation,
    variables: {
      newFast: true,
    },
  });

  if (fastResponse.errors) console.log(fastResponse.errors);

  expect(fastResponse.data.setFast).toBeTruthy();
  expect(fastResponse.errors).toBeUndefined();

  const usr = await UserModel.findOne({ email: "test@test.com" });

  expect(usr.isFast).toBeTruthy();

  await cleanup();
});
