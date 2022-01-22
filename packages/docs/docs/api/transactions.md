---
sidebar_position: 3
---

# Transactions
Retrieve all transactions according to the filter, this endpoint is paginated to navigate big transactions list's use the skip variable.
```graphql
query getTransactions($filter: TransactionFilter!, $limit: Int!, $next: String) {
  getTransactions(filter: $filter, limit: $limit, next: $next) {
    transactions {
      uuid
      senderPk
      senderTo
      senderSig
      senderLm
      payload
      confirmedAt
      recieveLm
      recieveSig
      createdAt
      status
    }
    next
  }
}
```

`filter` can be `All` | `Confirmed` | `Pending`

`filter = Pending` Transaction hasn't been confirmed by a webhook, bur has been finalized on the blockchain.

`filter = Confirmed` Transaction has been finalized and confirmed by on of your webhooks.

`filter = All` All transactions. 

`next` token that should passed to the next query in variables to access the next page of transactions.