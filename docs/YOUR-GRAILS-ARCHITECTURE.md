# Your Grails — Production API and Nitro Architecture

Date: 2026-10-01. Resolves the two blockers raised in `YOUR-GRAILS-PRODUCT-MAP.md` §7.
Status vocabulary: COMPLETE | PARTIAL | BLOCKED | UNVERIFIED | NOT STARTED.

## 0. The boundary (authoritative, 2026-10-01)

The existing production system is the source of truth and **is not rebuilt here**: backend and APIs, smart contracts,
contract addresses and ABIs, escrow, ownership, settlement, battle, lending, buyback and marketplace logic, wallet
infrastructure (Privy on wagmi), transaction semantics, and chain configuration (Avalanche C-Chain 43114).

This repo is the **new client/product layer** only: frontend, UX, design system, responsive UI, and presentation state.
It consumes production through production's existing interfaces:

| Layer | Disposition | Meaning |
| --- | --- | --- |
| Contracts, ABIs, addresses, chain, escrow, settlement and business rules | **PRESERVE** | Never modified, redeployed, reimplemented or "improved" from this repo |
| Production API (`api.yourgrails.com/api`) | **PRESERVE** | Consumed as-is. Where the API abstracts a Web3 operation (vouchers, confirmations, CCTP prepare and relay), Nitro calls the API |
| Wallet infrastructure (Privy app, wagmi config) | **PRESERVE** | Nitro must reuse production's wallet stack and contract interfaces, not add a second one |
| Nitro screens, flows, copy, design system | **REBUILD** | New |
| Nitro invoking production (correct endpoint, function, arguments, confirmation call) | **VERIFY** | Must be runtime-tested against production. Until an authenticated wallet session exists, this is **UNVERIFIED** |

No second source of truth: Nitro computes no ownership, prices, odds, eligibility, battle outcomes, loan terms or settlement.
It displays what production reports. `src/lib/contracts.test.ts` fails if any referenced address drifts from production's
published list.

State of this repo against the boundary: no Web3 library, no contract call, no signature, no transaction code. Addresses are
display-only references (docs page, explorer links).

## 1. Production backend/API — VERIFIED

**Base URL: `https://api.yourgrails.com/api`**

Evidence:
- Production bundle `/_next/static/chunks/83272bf654f54c2f.js`, module `209165`, contains the app's API client:
  `` let s=`https://api.yourgrails.com/api${e}` `` plus about 80 named endpoint functions (exports listed in §1.2). The same module exports `APP_VERSION "1.3.0"`, which matches the site footer.
- The leaderboard page bundle (`8966ad13d88dfb72.js`) imports that module and calls `fetchAugustRaceLeaderboard`, `fetchPointsLeaderboard` and `fetchBattleLeaderboard`.
- **Observed responses (2026-10-01):** `GET /packs`, `/activity/stats`, `/listings?limit=2`, `/listings/facets`, `/packs/recent-pulls?limit=2`, `/leaderboard/points?limit=2`, `/leaderboard/races/august-2026?limit=2` and `/users/by-username/griim` all returned `{"success":true,"data":…}` with live data. For example, stats showed `packsOpened 11911`, `activeListings 62`, `completedBattles 1005`.

### 1.1 Response envelope and conventions (observed)
- Envelope: `{ success: boolean, data: T }`. Errors: `{ error: string | { message } }` or `{ message }` with a non-2xx status (from the client's error handler).
- Prices on listings are **USDC base units (6 decimals) as strings**: `"250000000"` = $250.00.
- Card values are USD numbers (`estimatedValueUsd`, `pricing.currentValueUsd`).
- Card identity: `token: { chainId: 43114, contractAddress: CardNFT, tokenId, txHash }`. Token IDs are large integers. Treat them as strings.
- Images: `images.{frontUrl, backUrl, slabUrl, thumbnailUrl}` on `tcg-gacha-images.s3.amazonaws.com`.
- Cert data: `certNumber`, `gradingCompany`, `grade`, plus `psa.certUrl` (PSA's public cert page).
- Escrowed listings report `ownerAddress` = MarketplaceEscrow (`0x90a4…fd9d`). This confirms the escrow model.

### 1.2 Endpoints (from the production client; ✓ = response observed)

Public, no auth:
`GET /packs` ✓ · `/packs/featured` · `/packs/:id` · `/packs/recent-pulls?tier&packId&category&limit` ✓ ·
`/packs/unrevealed/:id` · `/packs/nft/:id` · `/activity/recent` · `/activity/stats` ✓ ·
`/listings?page&limit&query&sort&seller&bidder&gradingCompany&tcg&grade&set&priceMin&priceMax&valueMin&valueMax` ✓ ·
`/listings/facets` ✓ · `/listings/:listingId?bidder` · `/cards/:id` · `/users/by-username/:username` ✓ ·
`/users/:address/collection?page&limit&sync&search&gradingCompany&sort` · `/users/:address/activity?limit&page` ·
`/leaderboard?limit&sort=wins|bestWinStreak` · `/leaderboard/points?limit&address` ✓ ·
`/leaderboard/races/august-2026?limit&address` ✓ · `/trades/discovery/cards?…` · `/trades/direct-offers?…` ·
`POST /coupons/preview`

Confirmation webhooks (client posts the txHash after an on-chain write; no bearer in the production client):
`POST /packs/confirm-purchase` · `/packs/confirm-reveal` · `/listings/confirm-list` · `/listings/:id/confirm-cancel` ·
`/listings/:id/confirm-sale` · `/listings/confirm-bid-deposit` · `/listings/confirm-bid-withdrawal` ·
`/listings/:id/confirm-bid` · `/listings/:id/confirm-bid-cancel` · `/listings/:id/confirm-bid-accepted` ·
`/cards/:id/buyback-voucher` (bearer optional) · `/cards/:id/confirm-buyback`

Bearer-authenticated (`Authorization: Bearer <Privy access token>`):
`/referrals/status` · `POST /referrals/redeem` · `/points/me` · `/rewards/packs` · `POST /rewards/coupon-claims` ·
`/users/me/activity` · `POST /coupons/prepare` · `/coupons/confirm` · `/cctp/pack-purchases/*` · `/cctp/battle-actions/*` ·
`POST /battles/:id/bot-join` · `/cards/:id/buyback-approval` · `/lending/config` · `/lending/eligible-cards` ·
`POST /lending/prepare` · `/lending/loans?scope` · `POST /lending/confirm-{request,fund,extension-proposal,extension-acceptance,renewal-allowance,renewal-reserve,renewal-yield,cancel,repay,default}` ·
`/trades/direct-offers/confirm` · `/trades/direct-offers/:id/confirm-{cancel,accepted}` · `/gifts*`
(`/admin/*` endpoints exist and are out of scope.)

### 1.3 Other production facts found in the bundles
| Fact | Evidence | Status |
| --- | --- | --- |
| Auth/wallet: **Privy** login (`reconnectPrivyWallet`, `loginMethods:["wallet"]`) on **wagmi + viem**, TanStack Query | chunks `6f776cd8…`, `27799979…` | VERIFIED (code) |
| Target chain: Avalanche C-Chain 43114. Explorer `https://snowtrace.io`. CCTP source chains: Ethereum, Base, Arbitrum, OP, Polygon, HyperEVM, Monad | chunk `27799979…` | VERIFIED (code) |
| Card-for-card trading exists: `/trades/discovery/cards`, `/trades/direct-offers` plus on-chain cancel/accept confirmations. **The trade contract address is not in the published contract list.** | chunk `83272bf6…` | API VERIFIED (code); contract **UNVERIFIED** |
| Live pack odds are **5 value tiers** (Common / Uncommon / Rare / Chase / Grail) with inventory counts and percentages, not fixed 75/20/4/1 constants | `GET /packs` | VERIFIED |
| Pack IDs: **Pro = `698e4bafc03946126c163331` (`onchainPackId 0`)**, **Master = `6988fbbe8c8b9a609c4bf5eb` (`onchainPackId 1`)** | `GET /packs` | VERIFIED (corrects the product map, which had them swapped) |
| MoonPay on-ramp configured | chunk `6f776cd8…` | VERIFIED (code) |
| Battle lobby list endpoint | Not in the API client module (likely realtime/socket or another module) | **UNVERIFIED** |

## 2. Nitro stack — VERIFIED (workspace convention)

"Nitro stack" is the **Forge Nitro stack** used across VoidcallerOC repos:

> "A rebuild of upscalemusic.com on the Forge Nitro stack (TanStack Start, React 19, Tailwind 4, Nitro)." — `UpScale/nitro/README.md`
> "Foundation: `captital-bail` (Nitro stack, proven build …)" — same file

Same toolchain, byte for byte, in `captital-bail/package.json` and `UpScale/nitro/package.json`:
`@tanstack/react-start ^1.168`, `@tanstack/react-router ^1.170`, `react ^19.2`, `tailwindcss ^4.3` + `@tailwindcss/vite`,
`nitro 3.0.260610-beta` (override `nf3 0.3.17`), `vite ^8.2`, TypeScript 5.7, ESLint 9 flat config.
`vite.config.ts`: `tanstackStart()` + `nitro({ preset: "vercel" })` on build/preview + `viteReact()`.
Scripts: `dev` (port 8080), `build`, `typecheck`, `lint`.

## 3. Target architecture

```
Browser (React 19, TanStack Router, Tailwind 4)
  │  route loaders call server functions (createServerFn) — no direct browser→API calls for reads
  ▼
Nitro server (TanStack Start server functions, Vercel preset)
  │  src/server/yg-api.ts: fetch with timeout, envelope unwrap, typed errors, no secrets
  ▼
api.yourgrails.com/api (production data)        Avalanche C-Chain 43114 (contracts in src/lib/contracts.ts)
```

- Reads go through the server layer. That avoids browser CORS dependence on api.yourgrails.com, keeps one place for caching and error handling, and keeps any future server credentials out of the client.
- No production secret is needed for public reads. `YG_API_BASE_URL` (server-only env) defaults to the production base URL.
- Wallet actions will reuse production's existing wallet stack (Privy on wagmi) and existing contract interfaces: the same
  addresses, the verified production ABIs and production's confirmation endpoints. Nothing is reimplemented. Their Nitro
  integration is **UNVERIFIED** until an authenticated session exists, see §4.

## 4. What remains UNVERIFIED and the exact evidence needed

| Nitro integration (Web3 layer: PRESERVE) | Why it can't be runtime-tested yet | What resolves it |
| --- | --- | --- |
| Sign-in, referral admission, every bearer endpoint | The production API expects a **Privy access token issued by YourGrails' Privy app**. Privy only issues tokens to origins on that app's allow-list. The rebuild's preview domain is not on it. | YourGrails adds the Nitro preview/production origins to their **existing** Privy app and confirms its app ID for reuse. A separate Privy app is out of bounds: it would be a second wallet stack. Needs written authorization from YourGrails LLC. |
| All on-chain writes (buy pack, list, buy, offer, buyback, battle, lend, trade) | Real-money mainnet transactions cannot be verified without an admitted test wallet with funds. The trade contract address is unverified. | An admitted test wallet plus a budget, or a staging/Fuji environment from YourGrails (docs mention one). |
| Battle lobby | List endpoint not found | Observe logged-in `/battles` network traffic (HAR) or get the API docs from YourGrails |
| Runtime verification from this sandbox | Egress policy blocks `api.yourgrails.com` and `yourgrails.com` | Allow-list them in the environment network policy, or verify on Vercel preview deployments (used here) |
