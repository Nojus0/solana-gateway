import gqlRequest from "./gql";
export const createUserMutation = `
query currentUser {
    currentUser {
      publicKey
      webhook
      secret
      isFast
      api_key
      lamports_recieved
      email
    }
  }
`;

export function currentUser() {
  return gqlRequest<{ currentUser: currentUser }>(createUserMutation, {});
}

export interface currentUser {
  email: string;
  lamports_recieved: number;
  api_key: string;
  isFast: boolean;
  secret: string;
  webhook: string;
  publicKey: string;
}
