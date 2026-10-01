# Marketplace demo data

`marketplace-demo.csv` holds **48 synthetic listings invented for this demo**. The card names, sets, card numbers, seller labels
(`demo-seller-NN`), prices, fair values and offers are made up. They are not real inventory, accounts, wallets or market data, and
they contain no listing URLs. `src/marketplace-data.js` reads the file at build time; the marketplace page labels everything as demo data.

If the file is missing the page says the demo listings are not loaded and shows none.

## Columns
Header names are matched loosely (case and punctuation are ignored). Required: a card name and an asking price.

| Field | Accepted headers (examples) |
| --- | --- |
| Listing id | `listing_id`, `ID` (used as the listing key; the demo uses `DEMO-001` and so on) |
| Card name (required) | `name`, `Card Name`, `Card`, `Title` |
| Grading company | `grader`, `Grading Company`, `Company` (or put it in `grade`, e.g. `PSA 10`) |
| Grade | `grade` |
| Set / card number | `set` and `card_number`, or one `Set and Number` column such as `Example Set #4` |
| Seller label | `seller_display`, `Seller` |
| Asking price (required) | `ask_usdc`, `Asking Price`, `Ask`, `Price` |
| Fair value | `fair_value_usdc`, `Fair Value` |
| Top offer / offer count | `top_offer_usdc`, `offer_count` |
| Available actions | `actions`, e.g. `Buy|Trade|Cash Offer`. If absent, all three are shown. |
| Listing URL | `listing_url`, `URL` (optional; only http/https links are used; the demo leaves it empty) |
| Image URL | `image_url`, `Image` (optional; only http/https; the demo leaves it empty) |
| Listing state (optional) | `Status` or `Listed`. Values containing "unlist", "sold", "false" or "no" count as unlisted. |

Empty prices, `—`, `N/A` and `-` are treated as missing. Rows without a name or price are skipped and counted on the page.
Grades like `9.0` display as `9`.

## Images
The demo data has no image URLs, so every listing shows the "Photo pending" slab. A slab photo is only attached when it can be tied to the
exact certified card; see `docs/SLAB-INVENTORY.md`.
