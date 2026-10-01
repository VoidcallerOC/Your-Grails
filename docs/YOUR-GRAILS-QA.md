# Your Grails — Non-Web3 Product QA

Date: 2026-10-01. Build: `f6e9977`. Status vocabulary: COMPLETE | PARTIAL | BLOCKED | UNVERIFIED | NOT STARTED.

## Method and what each source proves

| Source | Proves | Does not prove |
| --- | --- | --- |
| **Preview** (Vercel preview of the commit, read through a share link) | Real production data, real production 404s, server rendering on Vercel | Loading, empty or failure states, which production cannot be made to produce on demand |
| **Local mock** (production build on :8081, `YG_API_BASE_URL` pointed at a local stub in `normal`, `empty`, `error`, `slow` and `timeout` modes) | That the UI handles each state | Production behavior |
| **Playwright sweep** (20 routes × 390/430/768/1440) | No horizontal overflow, exactly one `h1`, every image has `alt`, the first Tab lands on the skip link | Visual quality |

Wallet-dependent actions are out of scope here. They render disabled with the reason and stay **UNVERIFIED**
(see `YOUR-GRAILS-ARCHITECTURE.md` §4).

## Results per route

Columns: 1 live data · 2 loading · 3 empty · 4 API failure · 5 responsive · 6 navigation · 7 real links/actions · 8 no fabricated data.
✓P = verified on preview against production. ✓M = verified on the local mock. — = not applicable (no API data).

| Route | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | ✓P | ✓M | ✓M "No pulls reported yet." | ✓M 5 panels | ✓ | ✓ | ✓ | ✓ |
| `/packs` | ✓P | ✓M | ✓M "No packs are on sale right now." | ✓M; timeout message ✓M | ✓ | ✓ | ✓ | ✓ |
| `/packs/:id` | ✓P Pro: $50, EV $51.83, 326 cards, 5 odds tiers, chase, pulls | ✓M | ✓M sold out, no odds, no pulls | ✓M 2 panels | ✓ | ✓ | ✓ | ✓ |
| `/packs/:unknown` | ✓P production 404 → "Nothing in this slot" | — | — | — | ✓ | ✓ | ✓ | ✓ |
| `/market` | ✓P 62 listings, 3 pages; `query=charizard` → 8 Charizard listings | ✓M | ✓M "No listings match." | ✓M | ✓ | ✓ page links | ✓ | ✓ |
| `/market/:id` | ✓P (`5a23bf1`) | ✓M | — | ✓M | ✓ | ✓ | ✓ cert → psacard.com, token → snowtrace.io | ✓ |
| `/market/:unknown` | ✓P production 404 → not-found page; malformed id → 404 | — | — | — | ✓ | ✓ | ✓ | ✓ |
| `/battles` | ✓P (`5a23bf1`) | ✓M | ✓M "No packs are on sale…", "No battles fought yet." (`f6e9977`) | ✓M 3 panels | ✓ | ✓ | ✓ | ✓ |
| `/trading` | ✓P | ✓M | ✓M "No cards match." | ✓M | ✓ | ✓ | ✓ | ✓ |
| `/leaderboard` (race, points, battles) | ✓P | ✓M | ✓M on all 3 tabs | ✓M on all 3 tabs | ✓ | ✓ tabs | ✓ | ✓ |
| `/u/:username` | ✓P `griim`, `lamehillbilly` | ✓M | ✓M "No cards in this collection." | ✓M 2 panels | ✓ | ✓ | ✓ | ✓ |
| `/u/:unknown` | ✓P production 404 → not-found page | — | — | — | ✓ | ✓ | ✓ | ✓ |
| `/u/address/:addr` | ✓P redirects to username; address-only profile renders | ✓M | ✓M | ✓M 2 panels | ✓ | ✓ | ✓ | ✓ |
| `/lending` | — (terms need sign-in, stated on page) ✓P | — | — | — | ✓ | ✓ | actions disabled with reason | ✓ |
| `/collection`, `/account`, `/redeem` | — (sign-in) | — | — | — | ✓ | ✓ | actions disabled with reason | ✓ |
| `/docs`, `/support`, `/terms`, `/privacy` | — (static) | — | — | — | ✓ | ✓ | ✓ | ✓ |

**Loading.** React transitions keep the previous page on screen during navigation, so a route-level pending component never
renders, and it was removed. The global progress bar (`NavProgress`) is the loading indicator: it was observed during a slow
(mock) navigation and is announced as "Loading" to screen readers.

**Links.** Crawled 78 internal links, 0 broken. External hosts: snowtrace.io, www.psacard.com, x.com, yourgrails.com, mailto.

**Fabricated data.** The only hard-coded figures are 90% (buyback, from production docs), 21+ (Terms) and "5 days" (docs
copy only). Everything else comes from the API. "5 days" was removed from data rows in `359e18c`.

## Not covered (stays open)

- Wallet-dependent actions on every route: **UNVERIFIED**, by design.
- Profile Listings and Activity tabs: **NOT STARTED**.
- The battle lobby list: **UNVERIFIED** (no endpoint found).
