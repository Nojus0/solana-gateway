---
sidebar_position: 5
---


# Transaction details
Get the transaction details by providing the `uuid` of the transaction.

```graphql
query getTransaction($uuid: String!) {
  getTransaction(uuid: $uuid) {
    uuid
    senderTo
    senderPk
    payload
    senderLm
    senderSig
    confirmedAt
    recieveLm
    recieveSig
    createdAt
    status
  }
}
```

`uuid` the uuid of the specified transaction.