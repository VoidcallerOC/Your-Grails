/**
 * Server functions: the Nitro server/API layer between the UI and the production YourGrails API.
 * Handlers run only on the server. The browser receives normalized, trimmed data.
 */
import { createServerFn } from "@tanstack/react-start";
import { ygGet, YgApiError } from "@/server/yg-api";
import {
  isAddress,
  toBattleRow,
  toCollection,
  toListing,
  toListingDetail,
  toListingFacets,
  toPack,
  toPagination,
  toPointsRow,
  toProfile,
  toPull,
  toRace,
  toStats,
  toCard,
} from "./normalize";
import type { Part } from "./types";

type Raw = Record<string, any>;

async function part<T>(fn: () => Promise<T>): Promise<Part<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Request failed", status: err instanceof YgApiError ? err.status : undefined };
  }
}

const getPacksRaw = () => ygGet<Raw[]>("/packs").then((list) => list.map(toPack));
const getStatsRaw = () => ygGet<Raw>("/activity/stats").then(toStats);
const getPullsRaw = (limit: number, packId?: string) =>
  ygGet<Raw[]>("/packs/recent-pulls", { limit, packId }).then((list) => list.map(toPull));

export const getHome = createServerFn({ method: "GET" }).handler(async () => {
  const [stats, packs, pulls, listings] = await Promise.all([
    part(getStatsRaw),
    part(getPacksRaw),
    part(() => getPullsRaw(12)),
    part(() =>
      ygGet<Raw>("/listings", { limit: 8, page: 1 }).then((d) => ({
        listings: ((d.listings ?? []) as Raw[]).map(toListing),
        total: toPagination(d.pagination)?.total ?? null,
      })),
    ),
  ]);
  return { stats, packs, pulls, listings, fetchedAt: Date.now() };
});

export const getPacks = createServerFn({ method: "GET" }).handler(async () => ({ packs: await part(getPacksRaw) }));

export const getPack = createServerFn({ method: "GET" })
  .inputValidator((d: { packId: string }) => ({ packId: String(d.packId).slice(0, 64) }))
  .handler(async ({ data }) => {
    const [pack, pulls] = await Promise.all([
      part(() => ygGet<Raw>(`/packs/${encodeURIComponent(data.packId)}`).then(toPack)),
      part(() => getPullsRaw(12, data.packId)),
    ]);
    return { pack, pulls, fetchedAt: Date.now() };
  });

export type ListingQuery = {
  page?: number;
  query?: string;
  gradingCompany?: string;
  grade?: string;
  set?: string;
  priceMin?: string;
  priceMax?: string;
};

const clean = (v: unknown, max = 80) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);
const money = (v: unknown) => (typeof v === "string" && /^\d+(\.\d{1,2})?$/.test(v) ? v : undefined);

export function sanitizeListingQuery(d: ListingQuery): ListingQuery {
  const page = Number(d.page);
  return {
    page: Number.isInteger(page) && page > 0 && page < 1000 ? page : 1,
    query: clean(d.query),
    gradingCompany: clean(d.gradingCompany, 8),
    grade: clean(d.grade, 8),
    set: clean(d.set, 120),
    priceMin: money(d.priceMin),
    priceMax: money(d.priceMax),
  };
}

export const LISTINGS_PAGE_SIZE = 24;

export const getMarket = createServerFn({ method: "GET" })
  .inputValidator((d: ListingQuery) => sanitizeListingQuery(d))
  .handler(async ({ data }) => {
    const [listings, facets] = await Promise.all([
      part(() =>
        ygGet<Raw>("/listings", { ...data, limit: LISTINGS_PAGE_SIZE }).then((d) => ({
          listings: ((d.listings ?? []) as Raw[]).map(toListing),
          pagination: toPagination(d.pagination),
        })),
      ),
      part(() => ygGet<Raw>("/listings/facets").then(toListingFacets)),
    ]);
    return { listings, facets, fetchedAt: Date.now() };
  });

export const getListing = createServerFn({ method: "GET" })
  .inputValidator((d: { listingId: string }) => {
    const id = String(d.listingId);
    if (!/^[0-9a-fA-F]{24}$|^\d{1,9}$/.test(id)) throw new Error("Invalid listing id");
    return { listingId: id };
  })
  .handler(async ({ data }) => ({
    listing: await part(() => ygGet<Raw>(`/listings/${data.listingId}`).then((d) => toListingDetail(d.listing ?? d))),
    fetchedAt: Date.now(),
  }));

export type BoardTab = "race" | "points" | "battles";

export const getLeaderboard = createServerFn({ method: "GET" })
  .inputValidator((d: { tab: BoardTab; sort?: "wins" | "bestWinStreak" }) => ({
    tab: (["race", "points", "battles"].includes(d.tab) ? d.tab : "race") as BoardTab,
    sort: d.sort === "bestWinStreak" ? "bestWinStreak" : "wins",
  }))
  .handler(async ({ data }) => {
    if (data.tab === "points") {
      return { tab: data.tab, points: await part(() => ygGet<Raw[]>("/leaderboard/points", { limit: 50 }).then((l) => l.map(toPointsRow))) };
    }
    if (data.tab === "battles") {
      return {
        tab: data.tab,
        sort: data.sort,
        battles: await part(() => ygGet<Raw[]>("/leaderboard", { limit: 50, sort: data.sort }).then((l) => l.map(toBattleRow))),
      };
    }
    // The race id is the one production's leaderboard currently requests.
    return { tab: data.tab, race: await part(() => ygGet<Raw>("/leaderboard/races/august-2026", { limit: 50 }).then(toRace)) };
  });

export const getProfile = createServerFn({ method: "GET" })
  .inputValidator((d: { username?: string; address?: string; page?: number }) => ({
    username: d.username ? String(d.username).slice(0, 40) : undefined,
    address: d.address && isAddress(d.address) ? d.address.toLowerCase() : undefined,
    page: Number.isInteger(d.page) && (d.page as number) > 0 ? (d.page as number) : 1,
  }))
  .handler(async ({ data }) => {
    let profile: Part<ReturnType<typeof toProfile> | null> = { ok: true, data: null };
    let address = data.address;
    if (data.username) {
      profile = await part(() => ygGet<Raw>(`/users/by-username/${encodeURIComponent(data.username!)}`).then(toProfile));
      if (profile.ok && profile.data) address = profile.data.address;
    }
    const [byAddress, collection] = await Promise.all([
      // Same source production's /u/address page uses (verified 2026-10-01): resolves an address to its profile.
      !data.username && address ? part(() => ygGet<Raw>(`/users/${address}/profile`).then(toProfile)) : null,
      address
        ? part(() => ygGet<Raw>(`/users/${address}/collection`, { page: data.page }).then(toCollection))
        : ({ ok: false, error: "No wallet address for this profile." } as const),
    ]);
    if (byAddress) profile = byAddress;
    return { profile, address: address ?? null, collection };
  });

export const getTradeDiscovery = createServerFn({ method: "GET" })
  .inputValidator((d: { page?: number; query?: string }) => ({
    page: Number.isInteger(d.page) && (d.page as number) > 0 ? (d.page as number) : 1,
    query: clean(d.query),
  }))
  .handler(async ({ data }) => ({
    discovery: await part(() =>
      ygGet<Raw>("/trades/discovery/cards", { page: data.page, limit: 24, query: data.query }).then((d) => ({
        cards: ((d.cards ?? []) as Raw[]).map((c) => ({
          card: toCard(c),
          owner: c.ownerProfile ? { username: (c.ownerProfile.username as string | undefined) ?? undefined } : null,
        })),
        pagination: toPagination(d.pagination),
      })),
    ),
  }));

export const getBattlesOverview = createServerFn({ method: "GET" }).handler(async () => {
  const [stats, top, packs] = await Promise.all([
    part(getStatsRaw),
    part(() => ygGet<Raw[]>("/leaderboard", { limit: 5, sort: "wins" }).then((l) => l.map(toBattleRow))),
    part(getPacksRaw),
  ]);
  return { stats, top, packs };
});
