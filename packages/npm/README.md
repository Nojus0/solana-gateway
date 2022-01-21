# Solana Gateway

Verify if the request is coming from solana gateway, and is not tampered with.

```ts
app.post("/", express.text({ type: "application/json" }), (req, res) => {
  const payload: Payload = JSON.parse(req.body)
  const sig = req.header("x-signature")
  const isValid = verify(req.body, sk, sig)

  if (!isValid) {
    console.log(`invalid`)
    return res.status(404).send()
  }

  res.json({
    confirmed: true
  })
})

app.get("/make", async (req, res) => {
  try {
    const { data } = await axios({
      url: "http://localhost:4000/graphql",
      method: "post",
      headers: {
        Authorization: `Bearer ${pk}`
      },
      data: {
        query: `mutation createDepositAddress($data: String!, $lifetimeMs: Int!) {
          createDepositAddress(data: $data, lifetime_ms: $lifetimeMs) {
            publicKey
          }
        }`,
        variables: {
          data: `user=${req.query.user || "annoymous"}`,
          lifetimeMs: 1000 * 60 * 15
        }
      }
    })

    const total =
      0.01 / 0.000000001 + feeAmountForSendAmount(0.01 / 0.000000001, "dev")

    return res.json({
      address: data.data.createDepositAddress.publicKey,
      amount: total * 0.000000001
    })
  } catch (err) {
    res.json({
      error: "Too many requests please try again later."
    })
  }
})

```
