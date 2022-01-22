---
sidebar_position: 4
---


# Manual Confirm
Sets transaction as confirmed manually by using the transaction uuid.
```graphql
mutation setConfirmed($uuid: String!) {
  setConfirmed(uuid: $uuid) {
    uuid
    senderTo
    senderPk
    senderSig
    senderLm
    payload
    confirmedAt
    status
    createdAt
    recieveSig
    recieveLm
  }
}
```

`uuid` the uuid of the transaction.