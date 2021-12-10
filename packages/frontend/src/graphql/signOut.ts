import { auth } from "../utils/auth";
import gqlRequest from "./gql";
export const signOutMutation = `
    mutation signOut {
        signOut 
    }
`;

export function signOut() {
  return gqlRequest<{ errors: any; signOut: boolean }>(
    signOutMutation,
    {}
  );
}
