# Your Grails — Feature Matrix (Phase 2)

Audit date: 2026-10-01. Evidence and sources: `docs/YOUR-GRAILS-PRODUCT-MAP.md`.

- **Disposition** (Nitro UI only. The Web3 layer is PRESERVE throughout, see Architecture §0): REBUILD (build fresh on the new stack against real data), PRESERVE (keep existing rebuild work as is),
  REFACTOR (keep but rewire/rework), REMOVE (delete once replaced), UNVERIFIED (production behavior not yet observed).
- **Nitro status**: state of the *new stack* implementation today. No feature is wired to production data yet, so
  nothing is COMPLETE.
- **Data source**: `API` = production backend (host UNVERIFIED), `Chain` = Avalanche C-Chain contract reads/writes,
  `Static` = content page.

## Phase 1 implementation status (2026-10-01)

Stack: Forge Nitro (TanStack Start, React 19, Tailwind 4, Nitro on the Vercel preset). Data: `api.yourgrails.com/api` through server functions.
"Preview-verified" means the page was loaded on the Vercel preview deployment of commit `7a8a6cb` and showed live production data
(for example 11,911 packs opened, Pro EV $51.83, listing #223 Dark Espeon PSA 8 at $250 with PSA cert 97428182).

Boundary (Architecture §0): the Web3 layer (contracts, ABIs, escrow, settlement, wallet infrastructure, chain) is
**PRESERVE** in every row. It is never modified here. "Nitro UI" is the rebuilt screen. "Nitro integration" is whether
Nitro correctly calls production's existing API or contract interface: wallet-dependent integrations are **UNVERIFIED** until an
authenticated wallet session is available. They are not built as replacement implementations.

| Area | Route(s) | Web3 layer | Nitro UI | Nitro integration | Evidence / what is missing |
|---|---|---|---|---|---|
| Nav, footer, preview notice, skip link | all | PRESERVE | PARTIAL | n/a | No overflow at 390/430/768/1440. Signed-in nav state needs auth |
| Homepage: live figures, chase slabs, packs, recent pulls, listings | `/` | PRESERVE | PARTIAL | Public API: COMPLETE | Preview-verified with live data |
| Packs: price, EV, live odds tiers, pool, refill guardrail, chase cards, pulls | `/packs`, `/packs/$packId` | PRESERVE | PARTIAL | Public API: COMPLETE | Preview-verified (Master: 5 tiers, 325 cards) |
| Buy and open pack (GachaPacks via Avalanche or CCTP API) | `/packs/$packId` | PRESERVE | PARTIAL (disabled action states what production does) | UNVERIFIED | Needs Privy session and funded admitted wallet. Must reuse production's `buyPack*`/CCTP prepare→relay→confirm path |
| Reveal / multi-pack session (VRF) | — | PRESERVE | NOT STARTED | UNVERIFIED | Needs a real purchase. Demo random reveal removed |
| 3D pack stage | `/packs/$packId` | n/a | PARTIAL | n/a | Lazy, exact-pixel art. Not checked on a real GPU |
| Marketplace browse, search, filters, pagination | `/market` | PRESERVE | PARTIAL | Public API: COMPLETE | Preview-verified (CGC → 3). Production sort values UNVERIFIED, so not exposed |
| Listing detail: cert, PSA link, population, token, seller, tx, comps | `/market/$listingId` | PRESERVE | PARTIAL | Public API: COMPLETE | Preview-verified on #223 |
| Buy, offer, offer-balance deposit/withdraw, seller accept, list/cancel (MarketplaceEscrow + `/listings/confirm-*`) | `/market/*` | PRESERVE | PARTIAL (disabled) | UNVERIFIED | Needs wallet session |
| Instant buyback (voucher API + Buyback contract) | card views | PRESERVE | NOT STARTED | UNVERIFIED | Eligibility comes from production `buybackInfo`. Nitro must not compute it |
| Leaderboards: race, points, battles | `/leaderboard` | PRESERVE | PARTIAL | Public API: COMPLETE | All three tabs and race categories preview-verified (`5a23bf1`). "Your standing" needs `address`/session: UNVERIFIED |
| Public profiles and collections (one tile per token) | `/u/*` | PRESERVE | PARTIAL | Public API: COMPLETE | Preview-verified (`/u/griim` 18 cards. `/u/address/0x4051…` 10 cards, $4,413). Address route shows the bare address: no profile-by-address endpoint found (UNVERIFIED). Listings and Activity tabs NOT STARTED |
| Trade discovery | `/trading` | PRESERVE | PARTIAL | Public API: COMPLETE | Preview-verified on `5a23bf1` (559 cards, live owners) |
| Trade offers, accept, cancel (`/trades/direct-offers*`) | `/trading` | PRESERVE | PARTIAL (disabled) | UNVERIFIED | Trade contract address not published: UNVERIFIED |
| Battles: rules, live counts, top battlers | `/battles` | PRESERVE | PARTIAL | Public API: COMPLETE | Preview-verified on `5a23bf1` (1,005 fought). Rules shown as production states them. Not decided by Nitro |
| Battle create/join/bot/reveal (PackBattleV3 + CCTP battle API) | `/battles` | PRESERVE | PARTIAL (disabled) | UNVERIFIED | Lobby feed endpoint UNVERIFIED. 21+ gate is production's |
| Lending: request, fund, repay, extend, claim (CardLoanMarket + `/lending/*`) | `/lending` | PRESERVE | PARTIAL (explainer + disabled) | UNVERIFIED | Every lending endpoint needs bearer. No terms or rates shown |
| Own collection | `/collection` | PRESERVE | PARTIAL (signed-out state + public lookup) | UNVERIFIED | Needs session |
| Sign-in, wallet connect, referral admission (production Privy + `/referrals/*`) | `/account` | PRESERVE | PARTIAL (explainer) | UNVERIFIED | Origin must be added to production's existing Privy app (Architecture §4) |
| Redemption | `/redeem` | PRESERVE | PARTIAL | n/a | Production marks it "coming soon" |
| Support | `/support` | PRESERVE | PARTIAL | UNVERIFIED | Ticket endpoints not found in the API client |
| Docs, Terms, Privacy | `/docs`, `/terms`, `/privacy` | PRESERVE | PARTIAL | n/a | Contract table is display-only. Legal text points to YourGrails LLC's binding versions |
| Demo-code removal | — | — | COMPLETE | — | Fake wallet, store, listings, CSV and invented battle/lending/trade/offer logic removed |
| Web3 drift guard | — | PRESERVE | — | COMPLETE | `src/lib/contracts.test.ts` pins every referenced address to production's published list |
| Tests / typecheck / lint / build | — | — | COMPLETE | — | 21 tests. `tsc`, `eslint` and `vite build` pass locally and on Vercel |

Original audit matrix (dispositions) follows.

| # | Feature | Production route | Current production behavior (observed / documented) | Data source | Wallet | Web3 | Disposition | Nitro status |
|---|---|---|---|---|---|---|---|---|
| 1 | Global nav + beta banner | all | Packs, Battles, Marketplace, Trading, Lending, Collection, Leaderboard; Connect; beta bug-report banner | Static + API (feedback) | No | No | REFACTOR (nav exists; add Trading/Lending/Leaderboard, real Connect, feedback form) | PARTIAL |
| 2 | Footer | all | Play / Market / Resources columns, X link, `v1.3.0` | Static | No | No | REFACTOR | PARTIAL |
| 3 | Homepage hero + value prop | `/` | "Rip packs. Battle players. Own the grail." | Static | No | No | REFACTOR (copy currently says "battle the house") | PARTIAL |
| 4 | Homepage live stats | `/` | Chase cards pulled, packs + battle volume, top pull this week, battles, active listings | API | No | No | REBUILD (live or honest "unavailable"; never hardcoded) | NOT STARTED |
| 5 | Recent pulls ticker | `/` | Card name + value stream | API | No | No | REBUILD | NOT STARTED |
| 6 | Featured packs (EV + price) | `/` | Pro $50 / EV $51.83; Master $100 / EV $103.71 (live) | API | No | Read | REFACTOR (3D pack art PRESERVE; EV must come from API) | PARTIAL |
| 7 | Chain row / CCTP marketing | `/` | 8 chains via Circle CCTP | Static | No | No | PRESERVE (content) | PARTIAL |
| 8 | Invite/referral gate | app routes | Connect wallet → redeem single-use referral code | API | Yes | Sign-in | REBUILD | NOT STARTED |
| 9 | Auth / wallet connect | header | Supported wallet or embedded wallet; provider UNVERIFIED | API + wallet SDK | Yes | Yes | REBUILD (replace fake `connect()`) | NOT STARTED |
| 10 | Pack list | `/packs` | Tiers, EV, buyback %, value-tier odds | API | Gate | Read | REFACTOR | PARTIAL (UI only) |
| 11 | Pack detail + checkout (Avalanche) | `/packs/[id]` | Single and multi-pack USDC purchase; permit/authorization | API + Chain (`GachaPacks.buyPack*`, `buyAndRequestReveal*`) | Yes | Write | REBUILD | NOT STARTED |
| 12 | Cross-chain checkout (CCTP) | `/packs/[id]` | Burn on source chain → attestation → `receiveAndBuy` on Avalanche; optional AVAX gas stipend; status polling | API + Chain (multi-chain) | Yes | Write | REBUILD | NOT STARTED |
| 13 | Coupons / pack credits | pack checkout | One-time EIP-712 coupon; free-pack credits | API + Chain (`redeemCoupon*`) | Yes | Write | REBUILD | NOT STARTED |
| 14 | Reveal (VRF) | reveal session (path UNVERIFIED) | Pending carousel until VRF fulfilled → reveal animation → card | Chain events + API index | Yes | Read | REFACTOR (3D rip PRESERVE; drive by real `PackRevealed`, not `Math.random`) | PARTIAL (visual only) |
| 15 | Multi-pack reveal session + summary | reveal | "Pack 1 of N" → summary with total value and buyback amounts | API | Yes | Read | REBUILD | NOT STARTED |
| 16 | Collection | `/collection` | Owned CardNFTs, one entry per token ID | Chain (`CardNFT`) + API metadata | Yes | Read | REFACTOR (UI shell PRESERVE; source from chain/API) | PARTIAL (UI only) |
| 17 | Card detail | card view (path UNVERIFIED) | Title, set, number, grade, grader, cert, images, owner, token ID, market value, buyback value | API + Chain | No (view) | Read | REFACTOR | PARTIAL (UI only) |
| 18 | Instant buyback | card/collection/battle result | 90%, 5-day window, original purchaser only, server voucher | API (voucher) + Chain (`Buyback.execute*Voucher`, NFT approve) | Yes | Write | REBUILD (demo version uses wrong eligibility) | NOT STARTED |
| 19 | Proof-of-ownership photo request | via support | Manual live photo of the vaulted card | API (support) | Yes | No | REBUILD | NOT STARTED |
| 20 | Marketplace browse/search/filter/sort | `/market` | Listings with grader filters and more | API (+ Chain `MarketplaceEscrow` state) | No | Read | REFACTOR (filter/sort/pagination UI PRESERVE; CSV source REMOVE) | PARTIAL (UI only) |
| 21 | Listing detail | `/market` (detail path UNVERIFIED) | Card details, price, offers, seller | API | No | Read | REBUILD | NOT STARTED |
| 22 | Buy now | `/market` | USDC purchase from escrow | Chain (`buy`) | Yes | Write | REBUILD | NOT STARTED |
| 23 | Offer balance: deposit/withdraw | `/market` | Deposit USDC to offer balance; withdraw | Chain (`depositBidBalance`/`withdrawBidBalance`) | Yes | Write | REBUILD | NOT STARTED |
| 24 | Make / cancel offer | `/market` | Offer on a listing; warn if above buy-now | Chain (`placeBid`/`cancelBid`) | Yes | Write | REBUILD (demo auto-accept REMOVE) | NOT STARTED |
| 25 | Accept offer (seller) | card detail via notification | Seller reviews and accepts | Chain (`acceptBid`) | Yes | Write | REBUILD | NOT STARTED |
| 26 | List / update price / cancel listing | collection → market | NFT approve + escrow; update; cancel returns NFT | Chain (`listCard`, `updatePrice`, `cancel`) | Yes | Write | REBUILD | NOT STARTED |
| 27 | Battles lobby / create / join | `/battles` | PvP or YG Battle Bot; create or join with USDC or CCTP | API + Chain (`PackBattleV3.createBattle*`, `joinBattle*`) | Yes | Write | REBUILD (house-battle logic REMOVE) | NOT STARTED |
| 28 | Battle room: reveals, timeout, bonus pack, result | battle room (path UNVERIFIED) | Each side reveals; timeout path; higher value wins bonus pack; draw possible; both keep cards | Chain events + API | Yes | Write/Read | REBUILD | NOT STARTED |
| 29 | Battle 21+ eligibility | battles | Terms §7 age 21+, jurisdiction restrictions | API / attestation | Yes | No | REBUILD (gate UX; method UNVERIFIED) | NOT STARTED |
| 30 | Battle history | battles / profile | Past battles | API | Yes | Read | UNVERIFIED | NOT STARTED |
| 31 | Trading | `/trading` | Client-rendered; mechanism not observed; no trade contract in the published list | UNVERIFIED | Yes | UNVERIFIED | UNVERIFIED (demo swap logic must not ship) | NOT STARTED |
| 32 | Lending — borrow request (single/bundle) | `/lending` | Choose card(s), term, amount within LTV; collateral locked | API (appraisal, terms) + Chain (`createLoanRequest`, `createBundleLoanRequest`) | Yes | Write | REBUILD (demo 50%/4% REMOVE) | NOT STARTED |
| 33 | Lending — lender funding | `/lending` | Review requests (APR, term, LTV), fund | Chain (`fundLoan*`) | Yes | Write | REBUILD | NOT STARTED |
| 34 | Lending — My Loans: repay, grace, default claim, extensions, renewal yield | `/lending` | Full lifecycle | Chain (`repayLoan`, `claimDefault`, `proposeExtension`, `acceptExtension`, `claimRenewalYield`…) | Yes | Write | REBUILD | NOT STARTED |
| 35 | Leaderboard | `/leaderboard` | Monthly race (Battle Wins, Win Streak, Losing Streak, Overall Points), Overall, Battles tabs, podium, full standings, tie-break note | API | No | No | REBUILD (current page is empty placeholder) | NOT STARTED |
| 36 | Own profile / points / referral codes | `/profile` | Points, unlocked referral codes with copy/share | API | Yes | No | REBUILD | NOT STARTED |
| 37 | Public profile | `/u/[handle]`, `/u/address/[addr]` | Stats, Collection / Listings / Activity tabs, sort | API | No | Read | REBUILD | NOT STARTED |
| 38 | Wallet page | path UNVERIFIED | USDC + AVAX balances, copy address, send USDC/AVAX | Chain | Yes | Write | REBUILD | NOT STARTED |
| 39 | Navbar USDC balance | header | Shown only when connected | Chain (`USDC.balanceOf`) | Yes | Read | REFACTOR (fake chip REMOVE) | NOT STARTED |
| 40 | Notifications / activity | path UNVERIFIED | Reveals, buybacks, offers, battles, lending, support replies | API | Yes | No | REBUILD | NOT STARTED |
| 41 | Support tickets | `/support` | Create ticket (public form); wallet-linked inbox and replies | API | Optional | No | REBUILD | NOT STARTED |
| 42 | Beta feedback | banner | Bug / feedback / suggestion | API | Optional | No | REBUILD | NOT STARTED |
| 43 | Redemption | `/redeem` | "Coming soon"; intended burn + ship flow | API + Chain (`CardNFT.redeem`) | Yes | Write (future) | REBUILD as honest "coming soon" | NOT STARTED |
| 44 | Docs | `/docs` | Product guide + contracts | Static | No | No | REBUILD (rebuild's `/trust` is a partial substitute) | PARTIAL |
| 45 | Terms | `/terms` | ToS (28 May 2026) | Static (owner-supplied) | No | No | REBUILD (use YourGrails LLC's text verbatim, from them) | NOT STARTED |
| 46 | Privacy | `/privacy` | Not fetched | Static | No | No | UNVERIFIED | NOT STARTED |
| 47 | Testnet faucet | faucet page | Fuji only | Chain (testnet) | Yes | Write | REMOVE from production build (dev-only) | NOT STARTED |
| 48 | 3D pack renderer + rip scene | packs / reveal | (Rebuild asset) | — | No | No | PRESERVE (lazy-load; keep art unaltered) | PARTIAL |
| 49 | Slab component / honest "Photo pending" | everywhere | (Rebuild asset) | — | No | No | PRESERVE | PARTIAL |
| 50 | Demo data: `marketplace-demo.csv`, `LISTINGS`, `VAULT`, `pickCard`, fake `connect`/`addUsdc`, demo battle/lending/trade/offer logic | — | — | — | — | — | REMOVE once real sources exist (keep fixtures only under tests) | — |
| 51 | Hash router (`nav.jsx`) | — | Production uses path routes | — | — | — | REFACTOR to path routing with production paths (`/market`, `/u/…`) | — |

## Counts

- Features mapped: 49 production features plus 2 rebuild-internal rows.
- COMPLETE: 0. PARTIAL: 13 (UI or content only). NOT STARTED: 36. UNVERIFIED production behavior: Trading, battle history,
  privacy, and every route path marked "UNVERIFIED".

## Gate to begin Phase 4 (implementation)

Superseded (2026-10-01): the production API is identified (Architecture §1). Rows needing a wallet are UNVERIFIED integrations against the preserved Web3 layer. Originally:
implementation of any row whose Data source includes `API` was blocked until the production API contract was obtained
(base URL, auth scheme, endpoints for packs/cards/listings/battles/loans/leaderboard/profiles/support/vouchers). Rows that
are `Chain`-only (collection ownership, USDC balance, listing/escrow reads, loan state) can be built against the verified
contracts once the stack decision is made.
