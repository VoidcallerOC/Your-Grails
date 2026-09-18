# YourGrails — Frontend Redesign Demo

Award-caliber presentation layer for [YourGrails](https://yourgrails.com).

**Change the experience, not the product.** This is a working demo the team can open and feel — not a proposal deck.

The interactive demo is the live preview from this build session. The GitHub repository was empty (`README.md` only) before this work. The application was built from scratch as a demo presentation layer. It is **not** connected to YourGrails production wallets, contracts, or APIs.

---

## Repository state before build

Empty / minimal. A single file: `# Your-Grails`.

No existing application, components, routes, or integrations to preserve.

---

## What was built

A coherent product flow:

Home → Packs → Pack detail → Open / reveal → Card detail → Collection → Battles → Marketplace → Buyback → Lending → Trust → Wallet → Leaderboard

Signature moment: the pack reveal (tear → verifying fair draw → card → you own this).

---

## Live product reference

From [yourgrails.com](https://yourgrails.com), [docs](https://yourgrails.com/docs), and [terms](https://yourgrails.com/terms):

- Real PSA / BGS / CGC graded cards sealed in digital packs
- Live tiers: Pokémon Pro Pack (ToS Standard Pack, $50) and Pokémon Master Pack (ToS Premium Pack, $100)
- Odds (ToS, 28 May 2026): 75% Common, 20% Uncommon, 4% Rare, 1% Epic
- Homepage chase rate: 1 in 24
- Chainlink VRF on Avalanche
- 90% buyback, 5-day window, original qualifying purchasers
- Pack battles: both keep their card; higher market value wins a bonus pack; 21+
- Marketplace: listings + offers (not bids); escrow
- Card-backed lending
- Circle CCTP / multi-chain USDC
- Physical redemption documented as coming soon
- Documented pulls used as vault examples: Lugia PSA 10 $24,500 (homepage); Dark Dragonite 1st Ed Holo PSA 9 $1,406.70 (June 2026 post); Rayquaza as Master chase

Starter pack appears on the live homepage but is not a documented live tier in the docs, so it is not sold in this demo.

---

## Design system

Luxury vault, not generic crypto dashboard.

- Surfaces: near-black stone (`#080807`)
- Type: ivory (`#f3efe6`)
- Accent: champagne metal (`#d4c4a8`)
- Display: Instrument Serif · UI: Outfit · Mono: IBM Plex Mono
- Central object: graded **slab card** (identity, grade, rarity, value, vault status)
- Motion: pack is tactile, reveal is anticipation, collection is calm. `prefers-reduced-motion` honored.

Presentation illustrations are original TCG-style art for this redesign. They are not official Pokémon TCG card art.

---

## Functionality

### Functional in this repository

- Full frontend navigation and page system
- Demo pack opening with ToS odds
- Reveal choreography
- Local vault (collection, buyback window, listings, offers, loans, demo USDC)
- Battle arena presentation vs YG Battle Bot
- Marketplace buy / offer UI
- Trust / contracts layer using published Avalanche addresses

### Visual / demo representation — not production

- Wallet connect ("Enter vault") is a demo session, not a chain wallet
- No live Chainlink VRF, CCTP, or contract calls
- Inventory, EV, and most appraisals are demonstration data (labeled)
- Leaderboard is empty on purpose — no fabricated activity
- Shipping is documented as coming soon, matching the product

---

## Remaining work (needs YourGrails backend)

- Wallet adapters + embedded wallet
- GachaPacks / CardNFT / PackBattleV3 / MarketplaceEscrow / Buyback / CardLoanMarket
- Live pack inventory, odds, and EV from seeded cards
- Real VRF reveal status
- Live listings, offers, battles, leaderboard, notifications
- CCTP checkout
- Physical redemption when it ships

The data layer is isolated in `src/data/` so API swap is straightforward.
