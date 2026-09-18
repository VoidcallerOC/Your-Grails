# Pack artwork — production drop-in

The 3D pack rig (`src/Packs3D.jsx`) renders real production artwork the moment
these files exist here. No code change is needed to switch from the current
vector face to the raster art — the rig probes for the files at runtime and
falls back to the existing SVG/CSS face when they are absent.

## Required (front / printed surface)

| File | Tier | Design (must be preserved) |
| --- | --- | --- |
| `pro-chase-front.webp`    | Pro    | `PRO · THE CHASE` — purple / indigo identity, YG emblem, YOURGRAILS branding |
| `master-vault-front.webp` | Master | `MASTER · THE VAULT` — obsidian / gold identity, vault emblem, YOURGRAILS branding |

- Keep the **exact existing composition, emblem, branding, typography, tier name,
  color direction**. The raster is a higher-fidelity rendering of the *same*
  design, not a redesign.
- Preferred source resolution: **2K or higher**. Do not downsample unnecessarily.
- Aspect ratio ~**196 × 280** (the pack face). Art is drawn `object-fit: cover`.
- `.png` is an accepted fallback if WebP is not appropriate — name it
  `pro-chase-front.png` / `master-vault-front.png` and the rig will use it.

## Optional material maps

Not required for the first integration; the rig consumes them only if present.

| File | Purpose |
| --- | --- |
| `pro-chase-foil.webp` / `master-vault-foil.webp`     | Foil mask — the environmental sheen only catches where the map marks foil (a separate material response). |
| `pro-chase-normal.webp` / `master-vault-normal.webp` | Surface relief — subtle tactile variation revealed by the 3D movement. |

## Status

Until `pro-chase-front.webp` and `master-vault-front.webp` exist here, the pack
artwork is **BLOCKED — production pack art assets required**, and the app keeps
its existing vector face. Do not fake these with gradients, filters, noise,
blur, pseudo-elements, SVG recreation, or generated CSS textures — those are
presentation effects, not replacement artwork.
