# Your Grails — Product Map (Phase 0 / Phase 1 audit)

Audit date: 2026-10-01. Status vocabulary: COMPLETE | PARTIAL | BLOCKED | UNVERIFIED | NOT STARTED.

**Audit status: PARTIAL.** The public production surface and the on-chain contract layer were observed. The
authenticated experience and the production backend API were **not** observed (see Blockers).

## 0. How this was gathered (evidence)

| Source | Method | Result |
| --- | --- | --- |
| `https://yourgrails.com` and public routes | Rendered headless fetch (Nimble, vx8). Direct curl/WebFetch from the build sandbox is blocked by egress policy. | Observed |
| `/docs` (production product guide) | Rendered fetch | Observed. Primary source for business rules and contract addresses. |
| `/terms` (effective 28 May 2026) | Rendered fetch | Observed. Legal source for odds, buyback, battles, marketplace, redemption. |
| Contract source/ABI | Routescan (Snowtrace) Etherscan-compatible API, chain 43114 | 7 contracts **verified on Avalanche C-Chain mainnet** (see §4). CardNFT is *not* verified on Fuji 43113. |
| Production JS bundles | Sampled 4 of ~35 chunks | Framework only: **Next.js 16.1.4, App Router, Turbopack, React 19.3 canary**. API host not found in the sample. |
| Production source repo | `list_repos` (GitHub), Vercel team listing | **Not accessible.** Only `VoidcallerOC/Your-Grails` (this rebuild) exists. The `your-grails` Vercel project is this Vite rebuild, not yourgrails.com. |
| Authenticated app | Not attempted: requires a wallet plus a single-use referral code | **BLOCKED** |

## 1. Production architecture (what is known)

| Layer | Finding | Status |
| --- | --- | --- |
| Frontend framework | Next.js 16.1.4 App Router (Turbopack build), `next/image`, version string `v1.3.0` in the footer | VERIFIED (bundle + HTML) |
| Rendering | Marketing, docs, terms, support, leaderboard and profiles render server-side. App routes (`/market`, `/trading`) show `Loading...` then client-render. | VERIFIED (observed HTML) |
| Access gate | `/packs`, `/packs/[id]`, `/battles`, `/redeem` (and likely all app routes) show **"Invite Only Launch — Unlock the vault"**: connect wallet, then redeem a single-use referral code | VERIFIED (public view) |
| User images | `https://tcg-gacha-images.s3.amazonaws.com/uploads/<uuid>.<ext>` (avatars; card images likely the same bucket) | VERIFIED for avatars; UNVERIFIED for cards |
| Site images | `/packs/yg-pro-pack-hero-20260608.webp`, `/packs/yg-master-pack-hero-20260608.webp`, `/images/charizard.png`, `/images/usdc.png`, `/images/chains/*.{jpg,png}` (incl. `solana.png`), `/uploads/<uuid>.png` | VERIFIED |
| Pack IDs | `698e4bafc03946126c163331` (Pro, `onchainPackId 0`), `6988fbbe8c8b9a609c4bf5eb` (Master, `onchainPackId 1`). Corrected 2026-10-01 from `GET /api/packs`; the first audit had them swapped. | VERIFIED |
| Backend API | `https://api.yourgrails.com/api`. See `YOUR-GRAILS-ARCHITECTURE.md`. | **VERIFIED** (responses observed 2026-10-01) |
| Auth / wallet provider | Privy (wallet login) on wagmi + viem. See `YOUR-GRAILS-ARCHITECTURE.md`. | VERIFIED (bundle code) |
| Chain | Avalanche C-Chain mainnet (43114). Contracts verified there. Docs also reference Fuji testnet faucet and Ethereum Sepolia CCTP routes. | VERIFIED (mainnet contracts) |
| Randomness | Chainlink VRF (GachaPacks `rawFulfillRandomWords`, `requestReveal`, `retryReveal`) | VERIFIED (ABI) |
| Cross-chain | Circle CCTP into `CctpPackBuyerReceiver.receiveAndBuy` (packs, multi-pack, battle create/join, optional AVAX gas stipend) | VERIFIED (ABI) |
| Payment token | USDC `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` (Circle native USDC on Avalanche) | Address from docs; standard USDC address |

## 2. Route inventory (production)

| Route | Public view observed | Notes |
| --- | --- | --- |
| `/` | Yes | Hero "Rip packs. Battle players. Own the grail."; live stats strip; featured packs (EV + price); recent-pulls ticker; 3-step onboarding; chain row (Avalanche, Ethereum, Base, Arbitrum, OP Mainnet, Polygon, HyperEVM, Monad) |
| `/packs` | Invite gate | Pack list. Docs: EV, buyback %, value-tier odds per pack |
| `/packs/[id]` | Invite gate | Pack detail + checkout (single and multi-pack, Avalanche or CCTP, coupon) |
| (reveal) | Not observed | Reveal session "pack 1 of N"; VRF pending carousel; summary with total value and buyback amounts. Route path UNVERIFIED |
| `/battles` | Invite gate | Battle lobby/rooms. Room route UNVERIFIED |
| `/market` | `Loading...` (client) | Marketplace. **Note: `/market`, not `/marketplace`** |
| `/trading` | `Loading...` (client) | Trading. Mechanism UNVERIFIED (no trade contract in the published list) |
| `/lending` | Not fetched (gated nav) | P2P card-backed loans, "My Loans" |
| `/collection` | Not fetched (gated nav) | Owned CardNFTs |
| `/leaderboard` | **Public** | Tabs: August Race / Overall / Battles. August categories: Battle Wins, Win Streak, Losing Streak, Overall Points. Prizes "To be announced". Tie-break rule published |
| `/profile` | Linked ("My points") | Own profile, referral codes, points |
| `/u/[handle]`, `/u/address/[0x…]` | **Public** | Avatar, handle, short address, join date, title ("Steady Rippin"), Cards, Collection Value, Active Listings, Public Activity; tabs Collection / Listings / Activity; sort Highest value / Newest / A to Z |
| `/redeem` | Invite gate | Physical redemption — "coming soon" per docs |
| `/support` | **Public** | Ticket form (Name, Email, Subject, Message); wallet-linked ticket inbox; Open/Unread/Status counters |
| `/docs` | **Public** | Product guide, contracts list |
| `/terms` | **Public** | ToS, YourGrails LLC (Wyoming) |
| `/privacy` | Linked | Not fetched |
| Wallet page | Referenced in docs | USDC + AVAX balances, copy address, send USDC/AVAX. Path UNVERIFIED |
| Faucet page | Referenced in docs (testnet only) | Path UNVERIFIED |
| Notifications / activity | Referenced in docs | Reveals, buybacks, offers, battles, lending, support replies. Path UNVERIFIED |
| Beta feedback | Banner "reporting any bugs or issues" | Bug/feedback/suggestion submission |
| Admin | Referenced in docs | Out of scope for the user-facing rebuild |

## 3. Business rules (from production docs/terms — do not re-invent)

**Packs**
- Two live tiers: Pokemon Pro Pack ($50) and Pokemon Master Pack ($100). Older Basic/Starter/Platinum/Diamond/Legend are retired.
- One card per pack. Published odds bands at Terms date: 75% Common / 20% Uncommon / 4% Rare / 1% Epic. "These odds can fluctuate" — **pack pages must read odds and EV from live data, not constants.**
- Multi-pack checkout → reveal session "pack 1 of N … N of N" → summary (total market value, buyback amounts).
- Reveal waits on Chainlink VRF; UI shows a pending state, then the reveal plays when fulfillment is indexed.
- Pack credits and one-time coupon codes (EIP-712 voucher; coupon redemption is Avalanche-only).

**Instant buyback**
- 90% of assessed market value, 5-day window after reveal, countdown in days/hours/minutes.
- Only for the **original qualifying purchaser** (pack pull, CCTP pull, eligible coupon pull, verified battle card). **Marketplace purchases and transferred cards are NOT eligible.**
- Settles via `Buyback.executeBuyback*Voucher` (server-signed voucher). Large buybacks may be manually reviewed (up to 72h).

**Battles** (major divergence from the current rebuild — see §6)
- Player vs player or vs "YG Battle Bot". Each side opens a pack of equal value through VRF.
- **Both players keep their own revealed card.** Higher market value wins a **bonus pack**, which is then revealed and slid to the winner.
- Timeout reveal path; draws exist (`BattleDraw` event); battle cards may be buyback-eligible from the result view.
- **Age 21+ only** (Terms §7). Up to 6 on-chain txs per battle.

**Marketplace** (`MarketplaceEscrow`)
- List at buy-now price (NFT approved and moved into escrow); update price; cancel (NFT returned).
- Offers (product language "offer", contract "bid"): buyer deposits USDC to an **offer balance** (`depositBidBalance` / `withdrawBidBalance`), then places offers; seller accepts (`acceptBid`). Warn if offer > buy-now.
- Grader filters PSA/BGS/CGC. Fees configurable (`setFee`). YourGrails itself may be a seller (Terms 9.6).

**Lending** (`CardLoanMarket` + registries) — **peer-to-peer, not platform credit**
- Borrower requests a USDC loan against one card or a bundle; collateral locks in contract on request.
- Amount bounded by term LTV and a **signed appraisal**. Terms come from the Lending Terms Registry.
- Lender funds → USDC to borrower, due date starts. Platform fee shown in repayment.
- Due date → grace period (borrower can still repay) → lender `claimDefault` (collateral transfers).
- Extra time: extensions (`proposeExtension` / `acceptExtension`), renewal reserve and renewal yield claims.

**Rewards / access**
- Invite-only: wallet + single-use referral code. Users unlock their own codes after verified pack and battle volume.
- Leaderboard points from paid opens, battles, coupon pulls, completed lending repayments.

**Redemption**
- "Coming soon" in-app. Intended: request → itemized costs → pay → CardNFT burned → ship with tracking and insurance. KYC may apply.
- Interim: proof-of-ownership live photo via support.

**Values**: user pages say "market value", never "floor". Buyback value is computed separately.

## 4. Contracts (Avalanche C-Chain 43114)

Addresses from production `/docs`. "Verified" means source verified on Routescan for chain 43114, as of this audit.

| Contract | Address | Source verified | Key user-facing functions |
| --- | --- | --- | --- |
| CardNFT (ERC-721) | `0x423714cB42bcFe9DD52A5225656d622aD39d6bA0` | Yes | `ownerOf`, `tokenOfOwnerByIndex`, `tokenURI`, `tokenCardId`, `isRedeemed`, `approve`/`setApprovalForAll`, `redeem` |
| PackNFT | `0xFe3eB95C2369ddE7f93Af7229f774b2D00207745` | Not checked | — |
| GachaPacks | `0xA26De0Ed1c24f54Cf316C9CDb8fEFF1ea68E5AB4` | Yes | `buyPack[Batch][WithPermit/WithAuthorization]`, `buyAndRequestReveal[Batch]`, `requestReveal`, `retryReveal`, `redeemCoupon[AndRequestReveal]`; events `PackPurchased`, `PackRevealRequested`, `PackRevealed` |
| MarketplaceEscrow | `0x90A40f2befe2CE0AA10e951dbc47e2B6837Cfd9d` | Yes | `listCard`/`list`, `updatePrice`, `cancel`, `buy`, `depositBidBalance`, `withdrawBidBalance`, `placeBid`, `cancelBid`, `acceptBid` |
| Buyback | `0x8D8669ADE9D390A6dD03D384983A5bb334369dAa` | Yes | `executeBuybackWith{,Id,Seller}Voucher` (+`AndReseed`) |
| PackBattleV3 | `0x7cC8173A9eD2dF8BAb306bbF28eDa301032D3936` | Yes | `createBattle[WithPermit/WithAuthorization]`, `joinBattle…`, `revealMyPack`, `cancelBattle`, `expireBattle`; events incl. `BattleResolved`, `BattleDraw`, `BattleBonusRevealRequested` |
| CCTP Receiver (`CctpPackBuyerReceiver`) | `0xBa73111925C2bD51794eE8A0aD0520558FE6737c` | Yes | `receiveAndBuy` (relayed); events for cross-chain pack/battle/refund/gas stipend |
| CardLoanMarket | `0xa3A984C11A6f3d975a785f6028e7dEf08DCF2AC2` | Yes | `createLoanRequest`, `createBundleLoanRequest`, `cancelLoanRequest`, `fundLoan[WithPermit…]`, `repayLoan[WithPermit]`, `claimDefault`, `proposeExtension`, `acceptExtension`, `depositRenewalReserve`, `claimRenewalYield` |
| Lending Collateral Registry | `0xA07bb02d4979014D4bDeD18820d1Cd1f5Def16Df` | Not checked | — |
| Lending Terms Registry | `0x5e8a5755EaE73A825689096aF598E38B68bcD0C7` | Not checked | — |
| USDC | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` | Not checked | ERC-20 + EIP-2612 permit / EIP-3009 authorization |
| USDC Faucet (Fuji only) | `0x69b7AB27D0E4d54540031E6FC27a4Fe4570346c8` | n/a | Testnet only — must not appear in production UI |

**Important:** most flows need **server-issued data** that cannot be produced on-chain by the frontend alone. That includes the buyback voucher, coupon voucher, lending signed appraisal, card metadata/images/market values, pack EV/odds, the leaderboard and points, profiles, support tickets, notifications and the referral gate. Without the production backend API, those flows can only be read-only on-chain or show an honest unavailable state.

## 5. Current rebuild repo (`VoidcallerOC/Your-Grails`) — what exists

| Item | Finding |
| --- | --- |
| Stack | **Vite 8 + React 19 SPA, hash routing (`#/…`), zustand + localStorage.** It is **not Nitro** and has no server/API layer. |
| Routes | `/`, `/packs`, `/packs/:id`, `/reveal`, `/collection`, `/card/:id`, `/battles`, `/marketplace`, `/trading`, `/lending`, `/leaderboard`, `/trust` |
| Data | `src/data.js` hardcoded `PACKS` (incl. EV numbers), `ODDS`, `VAULT` (10 cards), `LISTINGS`, `TRUST_POINTS`; `src/marketplace-data.js` + `src/data/marketplace-demo.csv` (48 synthetic listings) |
| Wallet | `store.connect()` fakes a session "Vault 0xYG" and credits 5,000 demo USDC; nav chip adds 2,500 USDC on click |
| Web3 | None. No wallet library, no contract calls, no RPC |
| 3D | `three` pack renderer (`Packs3D.jsx`, `pack-gl.js`, `PackGL.jsx`, `RipScene.jsx`); real pack art in `public/packs/` |
| Real assets | `public/packs/*-front.{png,webp}`, `public/slabs/charizard-psa10.png`, `public/slabs/luffy-psa10.jpg`, brand images |
| Scripts | `dev`, `build`, `lint` (oxlint), `preview`. **No tests, no typecheck.** |
| Deploy | Vercel project `your-grails` (framework vite), latest deployment target **production** at `your-grails.vercel.app`, SSO-protected except custom domains |

## 6. Behavioral divergences: rebuild vs production (must be fixed, not restyled)

| Area | Rebuild today | Production (source) | Severity |
| --- | --- | --- | --- |
| Battles | "Battle the house"; win probability by value; **loser loses their slab** | PvP or bot; both open equal packs; **both keep their cards**; winner gets a bonus pack; 21+ | P0 — misstates the product and its legal framing |
| Lending | Borrow 50% from platform at flat 4%; no lender | P2P lender funding, LTV via signed appraisal, terms registry, platform fee, grace, default claim, extensions | P0 — invented financial terms |
| Buyback | Any owned card incl. marketplace buys | Original qualifying purchaser only; marketplace/transferred cards excluded | P1 |
| Marketplace offers | Auto-accepts ≥ 92% of ask | Offer balance deposit, seller accepts manually | P1 — invented rule |
| Trading | Instant swap if value ratio ≥ 0.7 | Mechanism UNVERIFIED | P1 — invented rule |
| Pack EV | Hardcoded `51.84` / `103.75` | Live, changes with inventory (homepage showed $51.83 / $103.71) | P1 — stale figure |
| Odds | Constants | "Can fluctuate", read per pack | P2 |
| Route names | `/marketplace`, `/trust`, `/card/:id`, hash routing | `/market`, `/docs`, `/u/...`, path routing | P2 (SEO/links) |
| Missing entirely | — | Invite/referral gate, profile + public profiles, leaderboard data, support tickets, notifications, wallet page, multi-pack reveal session, CCTP checkout, coupons/pack credits, redemption (coming soon), proof-of-ownership request, beta feedback, 21+ battle gate, privacy page | P1 |
| Homepage claim | "Battle the house" (README) | "Battle players" | P1 |

## 7. Blockers

1. **Production backend API is unknown and unreachable from here.** No production source repo is accessible, and the API host was not found in the sampled bundles. Every off-chain feature depends on it (§4 "Important").
2. **Authenticated experience not observable.** It needs a wallet plus a single-use referral code. Someone with access must provide a test wallet that is already admitted, or screenshots and HAR captures.
3. **Stack decision.** The brief says "Nitro stack", but this repo is a Vite SPA with no server. Nitro means one of: (a) Nuxt (Vue), (b) standalone Nitro server + this React frontend, (c) TanStack Start / Vinxi (Nitro-based, React), or (d) "Nitro" as an internal name for something else. Nick must pick one before Phase 4.
4. **Authorization (legal).** The rebuild reproduces YourGrails LLC's brand, Terms and contracts. Before it is deployed anywhere public or wired to production APIs, written authorization from YourGrails LLC is needed (scope, API access, brand use). This is not legal advice. Have a human attorney review the engagement terms if there is no signed agreement.
5. **Egress.** The build sandbox cannot reach yourgrails.com or the Avalanche public RPC directly. Allow-list `yourgrails.com`, `api.avax.network`, `tcg-gacha-images.s3.amazonaws.com` in the environment network policy to run runtime verification from here.
