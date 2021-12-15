---
sidebar_position: 4
---


# Set As Processed
Sets an unprocessed transaction processed. Unprocessed means the webhook didn't send a valid json response.
```graphql
mutation setAsProcessed($setAsProcessedId: String!) {
  setAsProcessed(id: $setAsProcessedId) {
    id
    transferSignature
    sendbackSignature
    lamports
    payload
    IsProcessed
    createdAt
    processedAt
    publicKey
  }
}
```

`setAsProcessedId` the id of the transaction.