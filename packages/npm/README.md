# Solana Gateway

Verify if the request is coming from solana gateway, and is not tampered with.

```ts
import express from "express";
import { verify, withFee, IEvent } from "solanagateway";
import axios from "axios";

const app = express();

const ak = "API_KEY";
const sk = "SECRET_KEY";

app.get("/createtransaction", async (req, res) => {
  if (!req.query.user) return res.json({ error: "user is required" });

  try {
    const { data, headers } = await axios({
      method: "post",
      url: "https://api.solanagateway.com/graphql",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ak}`,
      },
      data: {
        query: `mutation createDepositAddress($data: String!, $lifetimeMs: Int!) {
                    createDepositAddress(data: $data, lifetime_ms: $lifetimeMs) {
                      publicKey
                    }
                  }`,
        variables: {
          data: `user=${req.query.user}`,
          lifetimeMs: 1000 * 60 * 15,
        },
      },
    });

    console.log(headers["x-ratelimit-remaining"]);
    return res.json({
      publicKey: data.data.createDepositAddress.publicKey,
      amount: withFee(0.01 / 0.000000001, "dev") * 0.000000001,
    });
  } catch (err) {
    res.status(429).send("Too many requests");
  }
});

app.post(
  "/transaction",
  express.text({ type: "application/json" }),
  (req, res) => {
    const isValid = verify(req.body, sk, req.header("x-signature") || "");
    const event = JSON.parse(req.body) as IEvent;
    console.log(`isValid = ${isValid}`);

    if (event.type != "transfer:new") {
      console.log(`Invalid type`);
      return res.status(404).send();
    }

    if (!isValid) {
      return res.status(404).send();
    }

    if (event.payload.recieveLm == 0.01 / 0.000000001) {
      console.log(`SUCCESS`);
    }
    console.log(event);
    res.json({
      confirmed: true,
    });
  }
);

app.listen(4000, () => console.log(`Listening on port 4000`));

```
