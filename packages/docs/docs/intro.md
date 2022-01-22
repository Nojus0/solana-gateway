---
sidebar_position: 1
---

# Introduction

Solana Gateway was made to solve the problem of handling solana transfers off-chain. If you wanted to accept solana payments on your website and update the users balance in the database. Then you have a problem, its not easy looking through 3000+ transfers per second and checking if each address is one of your many deposit addresses. So we made Solana Gateway it let's you generate temporary deposit addresses, and get notfied through a webhook when you recieve a transfer to one of your deposit addresses. When a temporary deposit address recieves a transfer it immediately creates a new transfer to your personal solana wallet, so you get the transfer amount after fees as quickly as possible.

## Fees

Solana Gateway takes 1% fee and additional 5000 lamports. The additional 5000 lamports are used to pay the transaction fee on the solana blockchain, this is used up when sending the _sol_ from the deposit address to your personal wallet. You can view the Fee Calculation sheet [here](https://docs.google.com/spreadsheets/d/11ZX8afdHGHmBmks0UilQruXuG3vA5WM4-okeJo3yzKU/edit?usp=sharing)

## Limits
### Minimum Accepted Transfer Amount
The minimum transfer amount we process is 0.005 SOL or 5000000 LM.
### Rate Limits
**Main-Net** 100 Requests per second.

**Dev Net** 30 Requests per second. Transfer information is deleted after 15 minutes.

## Getting Started

Get started by **registering** on **[solanagateway.com](https://www.solanagateway.com)**

## Complete Account setup

In order to access the solana gateway API you need to add a valid **wallet address** and a **webhook url** to your account. You can do this by login in to you solana gateway account and going to the **settings** page.
