import { gql } from "apollo-server-core";
import base58 from "bs58";
import "dotenv/config";
import { DEPOSIT_DATA_MAX_SIZE, UserModel } from "shared";
import { setup } from "./setup";
import crypto from "crypto";
import { setWebhookMutation } from "./setWebhook.spec";
import { setPublicKeyMutation } from "./setPublicKey.spec";
import {
  max_ms_expires,
  min_ms_expires,
} from "../src/resolvers.ts/DepositResolver";

export const createDepositAddressMutation = gql`
  mutation CreateDepositAddress($data: String!, $lifetimeMs: Int!) {
    createDepositAddress(data: $data, lifetime_ms: $lifetimeMs) {
      publicKey
    }
  }
`;

test("create a user submit full details", async () => {
  const { createUser, cleanup, setHeaders, server, redis } = await setup();

  const user = await createUser();

  setHeaders({
    authorization: `Bearer ${user.api_key}`,
  });

  process.env.NETWORK = "dev";
  const HTTPS_URL = "https://random.com";
  const HTTP_URL = "http://127.0.0.1.com";

  const SET_WEBHOOK = await server.executeOperation({
    query: setWebhookMutation,
    variables: {
      newUrl: HTTP_URL,
    },
  });

  const PUBLIC_KEY_RAND = base58.encode(crypto.randomBytes(32));

  const SET_PUBLIC_KEY = await server.executeOperation({
    query: setPublicKeyMutation,
    variables: { newPublicKey: PUBLIC_KEY_RAND },
  });

  const CREATE_DEPOSIT = await server.executeOperation({
    query: createDepositAddressMutation,
    variables: { data: "test=data", lifetimeMs: min_ms_expires },
  });

  const DEPOSIT_ADDR = CREATE_DEPOSIT.data.createDepositAddress.publicKey;
  expect(base58.decode(DEPOSIT_ADDR).length == 32);
  expect(redis.getBuffer(DEPOSIT_ADDR)).not.toBeUndefined();

  const CREATE_DEPOSIT_LOWER = await server.executeOperation({
    query: createDepositAddressMutation,
    variables: {
      data: "dsadasdasdasdasdasdas",
      lifetimeMs: min_ms_expires / 2,
    },
  });

  expect(CREATE_DEPOSIT_LOWER.errors).toBeDefined();

  const CREATE_DEPOSIT_HIGHEST = await server.executeOperation({
    query: createDepositAddressMutation,
    variables: {
      data: "7".repeat(256),
      lifetimeMs: max_ms_expires,
    },
  });

  expect(CREATE_DEPOSIT_HIGHEST.errors).toBeUndefined();

  const CREATE_DEPOSIT_EXCEED = await server.executeOperation({
    query: createDepositAddressMutation,
    variables: {
      data: "7".repeat(256 / 2),
      lifetimeMs: max_ms_expires * 2,
    },
  });

  expect(CREATE_DEPOSIT_EXCEED.errors).toBeDefined();

  await cleanup();
});
