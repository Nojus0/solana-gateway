---
sidebar_position: 1
---


# Introduction

Solana Gateway is only available in **GraphQL** form. The public API Endpoint url is `https://api.solanagateway.com/graphql`, the api has introspection enabled though to view the schema you will need to install cors anywhere and use apollo studio to view the full schema.

## Authentication
In order for us to distinguish you from other users, authenticate using the authorization header with your *API Key* in an Bearer format. Example
```json
{
    "headers": {
        authorization: "Bearer APIKEYHERE"
    }
}
```