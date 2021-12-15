---
sidebar_position: 1
---

# Webhooks
Webhooks are triggered when a new transaction is found, when found the server will send a post request to the user's webhook url with a json payload the payload object looks like this.

```json
{
    "lamports": 1000000,
    "data": "the data you associated when you created the deposit address maximum 256 bytes",
    "transferSignature": "the transfer signature to the deposit address",
    "sendbackSignature": "the transfer signature from the deposit address to the user's wallet",
    "publicKey": "the deposit address public key",
}
```

It also has the signature of the entire json payload + api key signed, so you need to validate if the request comes from solanagateway.com luckily solanagateway has its own NPM package so you can easily validate the request origin by installing the `solanagateway` NPM package. To validate find your api key and the secret key.

## Webhook Response
User webhook's must respond with a json payload example bellow to proccess the transaction if webhook cannot be reached it will retry 10 times. The retries will start when the transaction has been left unprocessed for 2 minutes after its creation. Then after the retries will start every 5 minutes.

```json
{
    "processed":true
}
```