import { Transaction } from "shared";
import gqlRequest from "./gql";
export const getTransactionsQuery = `
query getTransactions($filter: TransactionFiler!, $skip: Int!, $limit: Int!) {
    getTransactions(filter: $filter, skip: $skip, limit: $limit) {
      publicKey
      createdAt
      processedAt
      payload
      lamports
      transferSignature
      sendbackSignature
      id
      IsProcessed
    }
  }
`;

export interface getTransactionsVars {
  filter: "All" | "Processed" | "Unprocessed";
  skip: number;
  limit: number;
}

export function getTransactions(vars: getTransactionsVars) {
  return gqlRequest<{ getTransactions: Transaction[] }, getTransactionsVars>(
    getTransactionsQuery,
    vars
  );
}
