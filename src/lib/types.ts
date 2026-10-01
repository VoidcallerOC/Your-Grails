/** Lean shapes the UI renders. Built server-side from production API records (src/lib/normalize.ts). */

export type Images = { slab?: string; front?: string; back?: string; thumb?: string };

export type TokenRef = { chainId: number; contract: string; tokenId: string };

export type CardSummary = {
  id: string;
  title: string;
  set?: string;
  number?: string;
  year?: number;
  rarity?: string;
  grader?: string;
  grade?: string;
  cert?: string;
  certUrl?: string;
  valueUsd: number | null;
  images: Images;
  token?: TokenRef;
  owner?: string;
  status?: string;
};

export type Comps = {
  basis: string;
  count: number;
  medianUsd: number | null;
  minUsd: number | null;
  maxUsd: number | null;
  fetchedAt?: string;
};

export type CardDetail = CardSummary & {
  comps?: Comps;
  valueSource?: string;
  valueUpdatedAt?: string;
  popAtGrade?: number;
  popHigher?: number;
};

export type Listing = {
  id: string;
  listingId: number | null;
  priceUsd: number | null;
  seller: string;
  status: string;
  createdAt?: string;
  bidCount: number;
  highestBidUsd: number | null;
  card: CardSummary;
};

export type ListingDetail = Omit<Listing, "card"> & { card: CardDetail; txHash?: string };

export type Pagination = { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };

export type Facet = { value: string; count: number };
export type ListingFacets = { graders: Facet[]; grades: Facet[]; sets: Facet[]; categories: Facet[] };

export type OddsTier = { label: string; displayRange: string; percentage: number; count: number };

export type Pack = {
  id: string;
  name: string;
  tier: string;
  category: string;
  priceUsd: number | null;
  evUsd: number | null;
  cardsPerPack: number;
  active: boolean;
  soldOut: boolean;
  paused: boolean;
  /** Set when production's EV guardrail is blocking sales (refill in progress). */
  blockedMessage: string | null;
  availableInventory: number | null;
  buybackPercentage: number | null;
  buybackEnabled: boolean;
  odds: OddsTier[];
  chase: CardSummary[];
  oddsCalculatedAt?: string;
};

export type Pull = {
  id: string;
  title: string;
  valueUsd: number | null;
  image?: string;
  packId?: string;
  packName?: string;
  packTier?: string;
  pullTier?: string;
  revealedAt?: string;
  wallet?: string;
};

export type SiteStats = {
  packsOpened: number | null;
  rippedVolumeUsd: number | null;
  buybackPaidUsd: number | null;
  chaseCards: number | null;
  grails: number | null;
  activeListings: number | null;
  liveBattles: number | null;
  completedBattles: number | null;
  topRecentPull: { title: string; valueUsd: number | null; image?: string; packName?: string; revealedAt?: string } | null;
};

export type Person = { address: string; username?: string; displayName?: string; avatarUrl?: string };

export type PointsRow = Person & { rank: number; lifetimePointsEarned: number };

export type BattleRow = Person & {
  wins: number;
  losses: number;
  draws: number;
  totalBattles: number;
  currentWinStreak: number;
  bestWinStreak: number;
};

export type RaceEntry = Person & {
  rank: number;
  battlesPlayed: number;
  battleWins: number;
  battleLosses: number;
  battleDraws: number;
  longestWinStreak: number;
  longestLossStreak: number;
  pointsEarned: number;
};

export type RaceCategory = {
  key: string;
  title: string;
  shortTitle: string;
  description: string;
  metricLabel: string;
  prizes: { place: number; label: string }[];
  entries: RaceEntry[];
  totalParticipants: number;
};

export type Race = {
  id: string;
  title: string;
  subtitle: string;
  startAt: string;
  endAt: string;
  timeZone: string;
  status: string;
  categories: RaceCategory[];
};

export type Profile = Person & { bio?: string; memberSince?: string };

export type Collection = { cards: CardSummary[]; totalCards: number | null; totalValueUsd: number | null; pagination: Pagination | null };

/** A part of a page whose data source may fail independently. */
/** `status` is the production HTTP status when the API answered (404 = production says it does not exist). */
export type Part<T> = { ok: true; data: T } | { ok: false; error: string; status?: number };
