---
sidebar_position: 1
---

# Webhooks
Webhooks are triggered when a new transaction is found, when found the server will send a post request to the user's webhook url with a json payload the object looks like this.

```json
{
    "lamports": 1000000,
    "data": "the data you associated when you created the deposit address maximum 256 bytes",
    "transferSignature": "the transfer signature to the deposit address",
    "sendbackSignature": "the transfer signature from the deposit address to the user's wallet",
    "publicKey": "the deposit address public key",
}
```

In order to confirm the request came from *solana gateway* the request body is signed `rsa(body.append(APIKEY)) == signature` you can find the signature in the x-signature header. You can easily validate the request by using the `solanagateway` npm package. Though the request body must be a string not an object so if you are using express you need to use `express.text({type: "application/json"})` for that specific route to get the body as a string.

## Webhook Response
User webhook must respond with a json payload example bellow to proccess the transaction if webhook cannot be reached it will retry 10 times. The retries will start when the transaction has been left unprocessed for 2 minutes after its creation. Then after the retries will start every 5 minutes.

```json
{
    "processed":true
}
```