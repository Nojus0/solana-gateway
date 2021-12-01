import "dotenv/config";
import { gql } from "apollo-server";
import { NetworkModel, UserModel } from "shared";
import base58 from "bs58";
import { setup } from "./setup";

export const createUserMutation = gql`
  mutation createUser($email: String!, $password: String!, $network: String!) {
    createUser(email: $email, password: $password, network: $network) {
      email
      lamports_recieved
      api_key
    }
  }
`;

test("should create a user in mongodb", async () => {
  const { redis, server, network, cleanup } = await setup();

  const variables = {
    email: "test@test.com",
    password: "testpassword",
    network: network.name,
  };

  const { data, errors } = await server.executeOperation({
    query: createUserMutation,
    variables,
  });

  if (errors) console.log(errors);

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

  await cleanup();
});
