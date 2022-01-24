# About

Currently your webhook get triggered when we find a new transfer and then send a event to your webhook, you can find the event interface in the `solanagateway` npm package.

NOTE: You will recieve the event faster if you set Confirmations to _confirmed_ in settings, because you wont need to wait for the transfer to you to be finalized.

```js
{
        type: "transfer:new",
        payload: {
            senderPk,
            senderLm,
            senderSig,
            senderTo,
            recieveLm,
            recieveSig,
            uuid,
            createdAt,
            payload,
            targetWebhook
        }
    }
}

```
