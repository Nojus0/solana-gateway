import { currentUser } from "./currentUser";
import gqlRequest from "./gql";
export const createUserMutation = `
    mutation createUser($email: String!, $password: String!, $network: String!) {
        createUser(email: $email, password: $password, network: $network) {
        email
        lamports_recieved
        api_key
        isFast
        secret
        webhook
        publicKey
        }
    }
`;

export function createUser(vars: createUserVars) {
  return gqlRequest<{ createUser: currentUser }, createUserVars>(
    createUserMutation,
    vars
  );
}

export interface createUserVars {
  email: string;
  password: string;
  network: string;
}
