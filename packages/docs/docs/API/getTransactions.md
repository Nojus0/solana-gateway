---
sidebar_position: 3
---

# Get Transactions
Retrieve all transactions according to the filter, this endpoint is paginated to navigate big transactions list's use the skip variable.
```graphql
query GetTransactions($filter: TransactionFiler!, $skip: Int!, $limit: Int!) {
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
```

`filter` can be `All` | `Processed` | `Unprocessed`

`skip` how many transactions to skip from the most recent this is because the transactions list paginated

`limit` the maximum amount of transactions to retrieve maximum is 50 minimum is 1.