import gqlRequest from "./gql";
export const setPublicKeyMutation = `
    mutation SetPublicKey($newPublicKey: String!) {
        setPublicKey(newPublicKey: $newPublicKey)
    }
`;

export function setPublicKey(vars: setPublicKeyVars) {
  return gqlRequest<{ errors: any; setPublicKey: string }, setPublicKeyVars>(
    setPublicKeyMutation,
    vars
  );
}

export interface setPublicKeyVars {
  newPublicKey: string;
}
