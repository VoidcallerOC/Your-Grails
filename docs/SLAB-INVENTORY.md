# Slab imagery inventory

Source of truth: `VAULT` in `src/data.js`. Real slab photos live in `public/slabs/`.
Only photos of the **actual graded slab** may be used. Nothing here is generated, restyled or stock.

| id | Card | Set | Card no. | Rarity | Grade / cert | Real slab photo | Image source today |
| --- | --- | --- | --- | --- | --- | --- | --- |
| charizard | Charizard Holo | 1999 Pokemon Game | #4 (in set string) | Epic | PSA 10 / 26573583 | **Yes** | `public/slabs/charizard-psa10.png` (600×825) |
| luffy | Monkey D. Luffy | One Piece Magazine Vol.20 | not recorded | Rare | PSA 10 / 133373253 | **Yes** | `public/slabs/luffy-psa10.jpg` (392×536) |
| rayquaza | Rayquaza | EX Deoxys | not recorded | Rare | BGS 9.5 / none | No | placeholder |
| dragonite | Dark Dragonite | Team Rocket | not recorded | Rare | PSA 9 / none | No | placeholder |
| magikarp | Shining Magikarp | Neo Revelation | not recorded | Uncommon | CGC 8.5 / none | No | placeholder |
| blastoise | Blastoise ex | 151 | not recorded | Uncommon | PSA 10 / none | No | placeholder |
| pikachu | Pikachu | Base Set | not recorded | Common | PSA 8 / none | No | placeholder |
| squirtle | Squirtle | Base Set | not recorded | Common | CGC 9 / none | No | placeholder |
| oddish | Oddish | Jungle | not recorded | Common | BGS 8 / none | No | placeholder |
| caterpie | Caterpie | Base Set | not recorded | Common | PSA 9 / none | No | placeholder |

8 of 10 cards have no photo. A full git-history search (all branches) found no other slab images, so none could be recovered from the repo.

## Where each card appears
- **Pack pulls** (`pickCard`): Epic 1% (Charizard), Rare 4% (Luffy, Rayquaza, Dragonite), Uncommon 20% (Magikarp, Blastoise), Common 75% (Pikachu, Squirtle, Oddish, Caterpie). Roughly 95% of pulls therefore land on a placeholder today.
- **Marketplace seed listings:** Rayquaza, Dragonite, Magikarp (all placeholders).
- **Battle house pool:** Luffy, Rayquaza, Dragonite, Magikarp, Blastoise (Charizard and Commons excluded).
- **Hero / pack detail:** Charizard (real photo).
- **Collection, trading, lending, reveal:** whatever the user owns.

## Adding a photo
1. Photograph or scan the actual slab (front, straight-on, slab edges visible, no glare over the label). Portrait, about 0.72–0.75 aspect, at least 600 px wide.
2. Save as `public/slabs/<id>-<company><grade>.jpg|png|webp`, e.g. `blastoise-psa10.jpg`.
3. Set `photo: '/slabs/<file>'` on that entry in `src/data.js`. The slab, thumbnail and reveal components pick it up; nothing else changes.
4. The grade, company and cert in `data.js` must match the slab in the photo. Fill in `cert` from the label if known.

Until a photo exists the UI shows a proportioned slab with the card's real name, set, company and grade and the words "Photo pending". It does not draw card art.
