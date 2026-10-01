/**
 * Pure mappers from production API records to the lean UI types.
 * They run on the server, so heavy fields (comps lists, population tables, raw PSA and Alt payloads) never reach the browser.
 * Missing values stay missing (null or undefined). Nothing is defaulted to a made-up number.
 */
import type {
  BattleRow,
  CardDetail,
  CardSummary,
  Collection,
  Comps,
  Facet,
  Listing,
  ListingDetail,
  ListingFacets,
  OddsTier,
  Pack,
  Pagination,
  Person,
  PointsRow,
  Profile,
  Pull,
  Race,
  RaceCategory,
  RaceEntry,
  SiteStats,
} from "./types";

type Raw = Record<string, any>;

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v : undefined);

const httpsOnly = (v: unknown): string | undefined => {
  const s = str(v);
  return s && /^https:\/\//i.test(s) ? s : undefined;
};

/** USDC has 6 decimals. Listing prices arrive as base-unit strings, e.g. "250000000" = 250. */
export function usdcUnitsToUsd(units: unknown): number | null {
  if (typeof units === "number") return Number.isFinite(units) ? units / 1e6 : null;
  if (typeof units !== "string" || !/^\d+$/.test(units)) return null;
  const big = BigInt(units);
  const whole = big / 1_000_000n;
  const frac = big % 1_000_000n;
  return Number(whole) + Number(frac) / 1e6;
}

/** Grades arrive as "10", "10.0", "9.0", "8.5". Display "10", "9", "8.5". */
export function displayGrade(grade: unknown): string | undefined {
  const s = str(typeof grade === "number" ? String(grade) : grade);
  if (!s) return undefined;
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return Number.isInteger(n) ? String(n) : String(n);
}

export function toCard(c: Raw | null | undefined): CardSummary {
  const r = c ?? {};
  const t = r.token ?? {};
  const img = r.images ?? {};
  return {
    id: String(r._id ?? r.id ?? ""),
    title: str(r.title) ?? "Untitled card",
    set: str(r.setName),
    number: str(r.cardNumber),
    year: num(r.year) ?? undefined,
    rarity: str(r.rarity),
    grader: str(r.gradingCompany),
    grade: displayGrade(r.grade),
    cert: str(r.certNumber),
    certUrl: httpsOnly(r.psa?.certUrl),
    valueUsd: num(r.pricing?.currentValueUsd ?? r.estimatedValueUsd),
    images: {
      slab: httpsOnly(img.slabUrl),
      front: httpsOnly(img.frontUrl),
      back: httpsOnly(img.backUrl),
      thumb: httpsOnly(img.thumbnailUrl),
    },
    token:
      t.contractAddress && t.tokenId !== undefined
        ? { chainId: num(t.chainId) ?? 43114, contract: String(t.contractAddress), tokenId: String(t.tokenId) }
        : undefined,
    owner: str(r.ownerAddress),
    status: str(r.status),
  };
}

function toComps(alt: Raw | undefined): Comps | undefined {
  const summary = alt?.marketTransactionSummary;
  const info = alt?.marketPriceInfo;
  if (!summary) return undefined;
  const basisKey = typeof info?.compBasis === "string" ? info.compBasis.replace(/_(\d+)$/, "$1").replace(/_([a-z])/g, (_: string, ch: string) => ch.toUpperCase()) : "recent25";
  const bucket = summary[basisKey] ?? summary.recent25 ?? summary.recent10;
  if (!bucket) return undefined;
  return {
    basis: basisKey,
    count: num(bucket.count) ?? 0,
    medianUsd: num(bucket.medianPrice),
    minUsd: num(bucket.minPrice),
    maxUsd: num(bucket.maxPrice),
    fetchedAt: str(summary.fetchedAt),
  };
}

export function toCardDetail(c: Raw | null | undefined): CardDetail {
  const r = c ?? {};
  const base = toCard(r);
  const grade = base.grade;
  const pops: Raw[] = Array.isArray(r.alt?.cardPops) ? r.alt.cardPops : [];
  const atGrade = pops.find((p) => p.gradingCompany === base.grader && displayGrade(p.gradeNumber) === grade);
  return {
    ...base,
    comps: toComps(r.alt),
    valueSource: str(r.alt?.marketPriceInfo?.source),
    valueUpdatedAt: str(r.pricing?.lastPriceUpdateAt ?? r.priceLastUpdated),
    popAtGrade: num(r.psa?.psaPopulation) ?? num(atGrade?.count) ?? undefined,
    popHigher: num(r.psa?.psaPopHigher) ?? undefined,
  };
}

export function toListing(l: Raw): Listing {
  return {
    id: String(l._id ?? ""),
    listingId: num(l.listingId),
    priceUsd: usdcUnitsToUsd(l.price),
    seller: String(l.seller ?? ""),
    status: String(l.status ?? "unknown"),
    createdAt: str(l.createdAt),
    bidCount: num(l.bidCount) ?? 0,
    highestBidUsd: l.highestBid ? usdcUnitsToUsd(l.highestBid.amount ?? l.highestBid.price ?? l.highestBid) : null,
    card: toCard(l.card),
  };
}

export function toListingDetail(l: Raw): ListingDetail {
  const base = toListing(l);
  return { ...base, card: toCardDetail(l.card), txHash: str(l.txHash) };
}

export function toPagination(p: Raw | undefined): Pagination | null {
  if (!p) return null;
  return {
    page: num(p.page) ?? 1,
    limit: num(p.limit) ?? 0,
    total: num(p.total) ?? 0,
    totalPages: num(p.totalPages) ?? 1,
    hasNext: Boolean(p.hasNext),
    hasPrev: Boolean(p.hasPrev),
  };
}

const toFacets = (list: unknown): Facet[] =>
  Array.isArray(list) ? list.filter((f) => f && str(f.value)).map((f) => ({ value: String(f.value), count: num(f.count) ?? 0 })) : [];

export function toListingFacets(f: Raw | undefined): ListingFacets {
  return {
    graders: toFacets(f?.graders),
    grades: toFacets(f?.grades),
    sets: toFacets(f?.sets),
    categories: toFacets(f?.categories),
  };
}

export function toPack(p: Raw): Pack {
  const guard = p.evGuardrailStatus;
  const odds: OddsTier[] = Array.isArray(p.oddsTiers)
    ? p.oddsTiers.map((o: Raw) => ({
        label: String(o.label ?? ""),
        displayRange: String(o.displayRange ?? ""),
        percentage: num(o.percentage) ?? 0,
        count: num(o.count) ?? 0,
      }))
    : [];
  return {
    id: String(p._id ?? ""),
    name: str(p.name) ?? "Pack",
    tier: String(p.tier ?? "").toLowerCase(),
    category: String(p.category ?? ""),
    priceUsd: num(p.priceUsdc),
    evUsd: num(p.inventoryStats?.displayedExpectedValueUsd ?? p.expectedValueUsd),
    cardsPerPack: num(p.cardsPerPack) ?? 1,
    active: Boolean(p.active),
    soldOut: Boolean(p.soldOut),
    paused: Boolean(p.paused),
    blockedMessage: p.evGuardrailBlocked || guard?.blocked ? str(guard?.refillMessage) ?? "This pack is being refilled." : null,
    availableInventory: num(p.availableInventory ?? p.inventoryStats?.totalCards),
    buybackPercentage: num(p.buybackPercentage),
    buybackEnabled: Boolean(p.buybackEnabled),
    odds,
    chase: Array.isArray(p.chaseCards) ? p.chaseCards.map(toCard) : [],
    oddsCalculatedAt: str(p.inventoryStats?.calculatedAt),
  };
}

export function toPull(p: Raw): Pull {
  return {
    id: String(p._id ?? p.purchaseId ?? ""),
    title: str(p.cardTitle) ?? "Card",
    valueUsd: num(p.cardValueUsd),
    image: httpsOnly(p.cardImageUrl),
    packId: str(p.packId),
    packName: str(p.packName),
    packTier: str(p.packTier),
    pullTier: str(p.pullTier),
    revealedAt: str(p.revealedAt),
    wallet: str(p.walletAddress),
  };
}

export function toStats(s: Raw): SiteStats {
  const top = s.topRecentPull;
  return {
    packsOpened: num(s.lifetimePacksRipped ?? s.packsOpened),
    rippedVolumeUsd: num(s.lifetimeRippedVolumeUsd),
    buybackPaidUsd: num(s.lifetimeBuybackPaidUsd),
    chaseCards: num(s.lifetimeChaseCards),
    grails: num(s.lifetimeGrails),
    activeListings: num(s.activeListings),
    liveBattles: num(s.liveBattles),
    completedBattles: num(s.completedBattles),
    topRecentPull: top
      ? { title: str(top.title) ?? "Card", valueUsd: num(top.valueUsd), image: httpsOnly(top.imageUrl), packName: str(top.packName), revealedAt: str(top.revealedAt) }
      : null,
  };
}

function toPerson(r: Raw): Person {
  return {
    address: String(r.address ?? "").toLowerCase(),
    username: str(r.username),
    displayName: str(r.displayName),
    avatarUrl: httpsOnly(r.avatarUrl),
  };
}

export function toPointsRow(r: Raw): PointsRow {
  return { ...toPerson(r), rank: num(r.rank) ?? 0, lifetimePointsEarned: num(r.lifetimePointsEarned) ?? 0 };
}

export function toBattleRow(r: Raw): BattleRow {
  const wins = num(r.wins) ?? 0;
  const losses = num(r.losses) ?? 0;
  const draws = num(r.draws ?? r.ties) ?? 0;
  return {
    ...toPerson(r),
    wins,
    losses,
    draws,
    totalBattles: num(r.totalBattles) ?? wins + losses + draws,
    currentWinStreak: num(r.currentWinStreak) ?? 0,
    bestWinStreak: num(r.bestWinStreak) ?? 0,
  };
}

function toRaceEntry(r: Raw): RaceEntry {
  return {
    ...toPerson(r),
    rank: num(r.rank) ?? 0,
    battlesPlayed: num(r.battlesPlayed) ?? 0,
    battleWins: num(r.battleWins) ?? 0,
    battleLosses: num(r.battleLosses) ?? 0,
    battleDraws: num(r.battleDraws) ?? 0,
    longestWinStreak: num(r.longestWinStreak) ?? 0,
    longestLossStreak: num(r.longestLossStreak) ?? 0,
    pointsEarned: num(r.pointsEarned) ?? 0,
  };
}

/** Category order follows production's race page. */
export const RACE_CATEGORY_ORDER = ["battleWins", "longestWinStreak", "longestLossStreak", "pointsEarned"];

export function toRace(d: Raw): Race {
  const cats: Raw = d.categories ?? {};
  const keys = [...RACE_CATEGORY_ORDER.filter((k) => k in cats), ...Object.keys(cats).filter((k) => !RACE_CATEGORY_ORDER.includes(k))];
  const categories: RaceCategory[] = keys.map((k) => {
    const c = cats[k] ?? {};
    return {
      key: k,
      title: str(c.title) ?? k,
      shortTitle: str(c.shortTitle) ?? str(c.title) ?? k,
      description: str(c.description) ?? "",
      metricLabel: str(c.metricLabel) ?? "",
      prizes: Array.isArray(c.prizes) ? c.prizes.map((p: Raw) => ({ place: num(p.place) ?? 0, label: str(p.label) ?? "To be announced" })) : [],
      entries: Array.isArray(c.entries) ? c.entries.map(toRaceEntry) : [],
      totalParticipants: num(c.totalParticipants) ?? 0,
    };
  });
  const race = d.race ?? {};
  return {
    id: String(race.id ?? ""),
    title: str(race.title) ?? "Leaderboard race",
    subtitle: str(race.subtitle) ?? "",
    startAt: String(race.startAt ?? ""),
    endAt: String(race.endAt ?? ""),
    timeZone: str(race.timeZone) ?? "America/New_York",
    status: String(race.status ?? ""),
    categories,
  };
}

export function toProfile(p: Raw): Profile {
  return { ...toPerson(p), bio: str(p.bio), memberSince: str(p.memberSince) };
}

export function toCollection(d: Raw): Collection {
  return {
    cards: Array.isArray(d.cards) ? d.cards.map(toCard) : [],
    totalCards: num(d.totals?.totalCards),
    totalValueUsd: num(d.totals?.totalValueUsd),
    pagination: toPagination(d.pagination),
  };
}

export function isAddress(v: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(v);
}
