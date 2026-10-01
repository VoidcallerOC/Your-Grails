import { count } from "./format";
import type { Pack } from "./types";

/** Locked, approved pack artwork (public/packs/README.md). Unknown tiers render no art rather than a stand-in. */
const ART: Record<string, string> = {
  pro: "/packs/pro-chase-front.webp",
  master: "/packs/master-vault-front.webp",
};

export function packArtSrc(tier: string): string | undefined {
  return ART[tier.toLowerCase()];
}

export function packAvailability(p: Pack): { ok: boolean; text: string } {
  if (!p.active || p.paused) return { ok: false, text: "Paused" };
  if (p.soldOut) return { ok: false, text: "Sold out" };
  if (p.blockedMessage) return { ok: false, text: p.blockedMessage };
  return { ok: true, text: p.availableInventory !== null ? `${count(p.availableInventory)} cards in the pool` : "Available" };
}

