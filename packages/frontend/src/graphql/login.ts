import { currentUser } from "./currentUser";
import gqlRequest from "./gql";
export const createUserMutation = `
    mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
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

export function login(vars: createUserVars) {
  return gqlRequest<{ login: currentUser }, createUserVars>(
    createUserMutation,
    vars
  );
}

export interface createUserVars {
  email: string;
  password: string;
  remember: boolean;
}
