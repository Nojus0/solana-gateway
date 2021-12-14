# Solana Gateway

Verify if the request is coming from solana gateway, and is not tampered with.

```ts
app.post("/", express.text({ type: "application/json" }), (req, res) => {
  console.log(req.body);
  const valid = verify(
    API_KEY,
    SECRET,
    req.body,
    Array.isArray(req.headers["x-signature"])
      ? req.headers["x-signature"][0]
      : req.headers["x-signature"]
  );

  if (!valid) {
    return res.status(401);
  }


  const payload: IPayload = JSON.parse(req.body);

  // Proccess the transaction

  res.json({
    processed: true,
  });
});
```
