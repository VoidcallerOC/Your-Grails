# Marketplace snapshot

Put `marketplace-reference.csv` in this folder and rebuild. `src/marketplace-data.js` reads it at build time.
Nothing is generated or guessed: with no file, the marketplace page says the snapshot is not loaded.

The file is a snapshot of the live marketplace. Prices and offers may be out of date.

## Columns
Header names are matched loosely (case and punctuation are ignored). Required: a card name and an asking price.

| Field | Accepted headers (examples) |
| --- | --- |
| Card name (required) | `Card Name`, `Name`, `Card`, `Title` |
| Asking price (required) | `Asking Price`, `Ask`, `Price` |
| Grading company | `Grading Company`, `Company`, `Grader` (or put it in `Grade`, e.g. `PSA 10`) |
| Grade | `Grade` |
| Set / card number | `Set` and `Card Number`, or one `Set and Number` column such as `Base Set #4` |
| Seller | `Seller`, `Seller Displayed` |
| Fair value | `Fair Value` |
| Top offer / offer count | `Top Offer`, `Offer Count` (or `Offers`) |
| Available actions | `Actions`, e.g. `Buy|Trade|Cash Offer`. If absent, all three are shown. |
| Listing URL | `Listing URL`, `URL` (only http/https links are used) |
| Listing state (optional) | `Status` or `Listed`. Values containing "unlist", "sold", "false" or "no" count as unlisted. |

Empty prices, `—`, `N/A` and `-` are treated as missing. Rows without a name or price are skipped and counted on the page.

## Images
The CSV has no image URLs, so every listing shows the "Photo pending" slab. A slab photo is only attached when it can be tied to the exact certified card; see `docs/SLAB-INVENTORY.md`.
