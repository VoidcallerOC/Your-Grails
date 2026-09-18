# YourGrails — Frontend Redesign Demo

Award-caliber presentation layer for [YourGrails](https://yourgrails.com).

**Change the experience, not the product.** Working demo the team can open and feel.

The GitHub repository was README-only before this session. There was no existing application, routes, or integrations to preserve. This app is a branded demo presentation layer. It is **not** connected to YourGrails production wallets, contracts, or APIs.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Standalone (no bundler): open `dist/index.html`.

## Brand source of truth

Live site: https://yourgrails.com

- Wordmark: YOURGRAILS / RIP · BATTLE · GRAIL
- Nav: Packs, Battles, Marketplace, Trading, Lending, Collection, Leaderboard
- Hero: Rip packs. Battle players. Own the grail.
- Tiers: Pokemon Pro Pack ($50) and Pokemon Master Pack ($100)
- Trust: fair random draw, graded & vaulted PSA·BGS·CGC, 90% buyback
- USDC + Circle CCTP multi-chain

## Flows

Home → Packs → Pack detail → Rip / reveal → Card → Collection → Battles → Marketplace → Trading → Lending → Leaderboard → Trust

Reveal sequence: anticipation → rip → verification → reveal → identity → value → ownership

## Pack artwork (production assets)

The 3D pack rig (`src/Packs3D.jsx`) powers the hero, featured drops, pack rail,
pack detail, and reveal from one component. It renders real production artwork
as the printed surface as soon as the source files are dropped into
`public/packs/` (see that folder's `README.md`), and falls back to the existing
vector face until they exist — no redesign, no faked textures.

- Required: `public/packs/pro-chase-front.webp` (`PRO · THE CHASE`) and
  `public/packs/master-vault-front.webp` (`MASTER · THE VAULT`). PNG accepted.
- Optional: `*-foil.*` (masked material sheen) and `*-normal.*` (surface relief).
- **Status: BLOCKED — production pack art assets required** until the two front
  files exist. The rig is wired and runtime-ready to consume them.

## Demo vs production

- Connect is a demo vault session
- Odds use published ToS bands (75 / 20 / 4 / 1)
- Leaderboard is empty on purpose
- Homepage published stats are labeled as live-site figures
- No fabricated extra volume
