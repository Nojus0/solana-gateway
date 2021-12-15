---
sidebar_position: 2
---

# Fast Mode

When the _blochchain scanner_ detects a transaction that belongs to your deposit address, it sends two transfers one to your wallet 99% and other to solana gateway to collect the 1% commission of the specfied transaction. Fast Mode means when sending that transaction back to the user and commission wallet. It specfies the commitment amount, with fast mode ticked the commitment is set to **confirmed** so your webhook recieves the transaction really fast. But if the fast mode is unticked the commitment is set to **finalized**.


## Finalized vs Confirmed
Finalized means the all the validators agreed that this transaction is correct. This takes a bit of time *1 - 5 seconds*.

Confirmed means the network just acknowledged that transaction. Which is alot faster.
