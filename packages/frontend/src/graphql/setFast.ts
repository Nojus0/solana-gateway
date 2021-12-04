import { Transaction } from "shared";
import gqlRequest from "./gql";
export const setFastMutation = `
    mutation setFast($newFast: Boolean!) {
        setFast(newFast: $newFast)
    }
`;

export interface setFastVars {
  newFast: boolean;
}

export function setFast(vars: setFastVars) {
  return gqlRequest<{ setFast: boolean }, setFastVars>(setFastMutation, vars);
}
