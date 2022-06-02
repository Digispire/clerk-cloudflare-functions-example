# Digispire Workspace

Example repo of using Cloudflare workers with Clerk JWT verification.

## Issue
The Trouble is not with Clerk but with verifying JWTs in Cloudflare Pages Functions, which doesn't support Node.js APIs.
Error messages 

- process.env
- Crypto 

## Getting Started
1. Run ```npm install```
2. Run ```wrangler login``` (requires free Cloudflare account)
3. Export Clerk Key ```export CLERK_JWT_KEY="YOUR_KEY""```
4. Start function local functions ```wrangler pages dev functions --local CLERK_JWT_KEY=$CLERK_JWT_KEY
```

The _middleware will automaticly run on each request to the api. Use POSTMAN to send a post to http://localhost:8788/api.

Send the Bearer Token in the header.


