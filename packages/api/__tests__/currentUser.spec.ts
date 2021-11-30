import "dotenv/config";
import { UserModel } from "shared";
import { setup } from "./setup";

test("create a user and get current user data", async () => {
  const { createUser, cleanup } = await setup();

  const user = await createUser();

  const db_user = await UserModel.findOne({ email: user.email });

  expect(user.api_key == db_user.api_key).toBeTruthy();
  expect(user.email == db_user.email).toBeTruthy();
  expect(user.lamports_recieved == db_user.lamports_recieved).toBeTruthy();
  expect(db_user.isFast).toBeFalsy();
  expect(user.isFast).toBeFalsy();

  await cleanup();
});
