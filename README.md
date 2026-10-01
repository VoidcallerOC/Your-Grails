# Your Grails — Nitro rebuild

The full Your Grails product rebuilt on the Forge Nitro stack: **TanStack Start, React 19, Tailwind 4, Nitro (Vercel preset)**.
Production at <https://yourgrails.com> is the source of truth for behavior. This repo is the replacement frontend plus a thin
server layer. It is **not** the production backend.

- Product map: `docs/YOUR-GRAILS-PRODUCT-MAP.md`
- Feature matrix and status: `docs/YOUR-GRAILS-FEATURE-MATRIX.md`
- Production API and architecture: `docs/YOUR-GRAILS-ARCHITECTURE.md`

## Run

```bash
npm ci
npm run dev        # http://localhost:8080
npm run check      # typecheck + lint + unit tests + production build
npm run preview    # serve the production build on :8081
```

`YG_API_BASE_URL` (server-only, optional) overrides the API base. It defaults to `https://api.yourgrails.com/api`.
No secrets are needed for anything this build does.

## How data flows

```
route loader → createServerFn (src/lib/api.ts, runs on the server)
             → src/server/yg-api.ts → api.yourgrails.com/api
             → src/lib/normalize.ts (typed, trimmed) → React
```

- Each page section loads independently. If a source fails, that section says so. Nothing is invented in its place, and there
  are no fixture fallbacks.
- Raw API records (comps lists, population tables, PSA and Alt payloads) stay on the server. The browser gets lean typed objects.
- Contract addresses live in `src/lib/contracts.ts`, with their verification state.

## What works and what doesn't

Live: homepage figures, packs with odds, EV and refill state, chase cards, recent pulls, marketplace listings with
search, filters and pages, listing detail (cert, population, comps, token, seller), leaderboards (race, points, battles),
public profiles and collections, trade discovery, docs, the contract table.

Off: sign-in and every wallet action (buy, open, list, offer, deposit, withdraw, battle, trade, lend, buyback, redeem). Production
auth is Privy, and tokens are only issued to origins YourGrails approves. See `docs/YOUR-GRAILS-ARCHITECTURE.md` §4. These
actions render disabled with the reason. They never simulate a result.

## Design system

`src/styles.css`: graphite base, slab-label paper, brass accent. Barlow Condensed display, Inter body, IBM Plex Mono for
certs, tokens and money. Hairline rules, 3px radii, real slab photography. The 3D pack (`src/lib/pack-gl.js`) loads only on
pack detail. It draws the approved art in `public/packs/` at exact pixels, and falls back to the flat image with
reduced motion or no WebGL.
