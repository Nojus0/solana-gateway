import { auth } from "../utils/auth";
import gqlRequest from "./gql";
export const setWebhookMutation = `
    mutation setWebhook($newUrl: String!) {
        setWebhook(newUrl: $newUrl) 
    }
`;

export function setWebhook(vars: setWehookVars) {
  return gqlRequest<{ errors: any; setWebhook: string }, setWehookVars>(
    setWebhookMutation,
    vars
  );
}

export interface setWehookVars {
  newUrl: string;
}
