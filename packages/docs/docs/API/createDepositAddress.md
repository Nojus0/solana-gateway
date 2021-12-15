---
sidebar_position: 2
---

# Create a deposit address

Create a temporary deposit address, and if someone sends some *SOL* to it, the webhook of the user who created the deposit address wil be triggered. The graphql mutation is described bellow. 

```graphql
mutation createDepositAddress($data: String!, $lifetimeMs: Int!) {
  createDepositAddress(data: $data, lifetime_ms: $lifetimeMs) {
    publicKey
  }
}
```

`data` is limited to 256 bytes, this data will be sent to the webhook endpoint, when the deposit address recieves a transfer.

`lifetime_ms` the lifetime of the deposit address in milliseconds minimum 5 minutes and maximum of 1 hour. After it expires the only trace is left is the public key of the wallet if the wallet recieved a transaction if not no trace is left.