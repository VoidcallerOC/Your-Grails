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

/** Rarity colours, quietest to loudest. Keyed by production's tier labels; unknown labels fall back by position. */
const TIER: Record<string, string> = { common: "#5d564b", uncommon: "#9a9387", rare: "#6f9bf0", chase: "#9b87ff", grail: "#e0b452" };
const TIER_ORDER = ["#5d564b", "#9a9387", "#6f9bf0", "#9b87ff", "#e0b452"];
export function tierColor(label: string | undefined, i = 0): string {
  return (label && TIER[label.toLowerCase()]) || TIER_ORDER[Math.min(i, TIER_ORDER.length - 1)];
}

/** Each pack's own light: the colour of its artwork. */
const GLOW: Record<string, string> = { pro: "143, 124, 248", master: "212, 168, 75" };
export const glow = (tier: string) => GLOW[tier.toLowerCase()] ?? "212, 168, 75";
