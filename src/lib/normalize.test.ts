import { describe, expect, it } from "vitest";
import { displayGrade, toListing, toPack, toRace, toStats, usdcUnitsToUsd } from "./normalize";
import { packAvailability } from "./packs";

describe("usdcUnitsToUsd", () => {
  it("converts 6-decimal USDC base units exactly", () => {
    expect(usdcUnitsToUsd("250000000")).toBe(250);
    expect(usdcUnitsToUsd("380000000")).toBe(380);
    expect(usdcUnitsToUsd("1234567")).toBe(1.234567);
    expect(usdcUnitsToUsd("0")).toBe(0);
  });
  it("refuses anything that is not base units instead of guessing", () => {
    expect(usdcUnitsToUsd("12.5")).toBeNull();
    expect(usdcUnitsToUsd(undefined)).toBeNull();
    expect(usdcUnitsToUsd("abc")).toBeNull();
  });
});

describe("displayGrade", () => {
  it("normalizes the grade strings production returns", () => {
    expect(displayGrade("10.0")).toBe("10");
    expect(displayGrade("9")).toBe("9");
    expect(displayGrade("8.5")).toBe("8.5");
    expect(displayGrade(undefined)).toBeUndefined();
  });
});

// Trimmed from a real GET /api/listings response (2026-10-01).
const LISTING = {
  _id: "6abcb2cd203c37c71b27029d",
  listingId: 223,
  price: "250000000",
  seller: "0x2e5bb537c9608c411755549d401793d32ff79f55",
  status: "active",
  bidCount: 0,
  highestBid: null,
  card: {
    _id: "6a44b4937d31bdf0a7b0fe23",
    title: "Dark Espeon",
    setName: "Neo 4 Darkness And To Light Japanese",
    cardNumber: "196",
    gradingCompany: "PSA",
    grade: "8.0",
    certNumber: "97428182",
    year: 2001,
    estimatedValueUsd: 284.06,
    pricing: { currentValueUsd: 284.06 },
    psa: { certUrl: "https://www.psacard.com/cert/97428182/psa" },
    images: { slabUrl: "https://tcg-gacha-images.s3.amazonaws.com/uploads/f2d28c5a.jpg" },
    token: { chainId: 43114, contractAddress: "0x423714cb42bcfe9dd52a5225656d622ad39d6ba0", tokenId: "1908077120553475" },
    alt: { cardPops: new Array(40).fill({ gradingCompany: "PSA", gradeNumber: "9.0", count: 1 }) },
  },
};

describe("toListing", () => {
  it("maps the listing and keeps token identity as a string", () => {
    const l = toListing(LISTING);
    expect(l.priceUsd).toBe(250);
    expect(l.listingId).toBe(223);
    expect(l.card.grade).toBe("8");
    expect(l.card.token?.tokenId).toBe("1908077120553475");
    expect(l.card.certUrl).toBe("https://www.psacard.com/cert/97428182/psa");
    expect(l.card.images.slab).toMatch(/^https:\/\/tcg-gacha-images/);
  });
  it("does not leak heavy raw fields to the client", () => {
    expect(JSON.stringify(toListing(LISTING))).not.toContain("cardPops");
  });
  it("keeps missing values missing", () => {
    const l = toListing({ ...LISTING, price: undefined, card: { title: "X" } });
    expect(l.priceUsd).toBeNull();
    expect(l.card.valueUsd).toBeNull();
    expect(l.card.images.slab).toBeUndefined();
  });
  it("drops non-https image URLs", () => {
    const l = toListing({ ...LISTING, card: { ...LISTING.card, images: { slabUrl: "javascript:alert(1)" } } });
    expect(l.card.images.slab).toBeUndefined();
  });
});

const PACK = {
  _id: "698e4bafc03946126c163331",
  name: "Pokemon Pro Pack",
  priceUsdc: "50",
  active: true,
  soldOut: false,
  paused: false,
  tier: "pro",
  category: "pokemon",
  cardsPerPack: 1,
  expectedValueUsd: 51.83,
  oddsTiers: [{ label: "Common", displayRange: "$20 - $45", count: 179, percentage: 54.91 }],
  buybackPercentage: 90,
  buybackEnabled: true,
  availableInventory: 326,
  inventoryStats: { displayedExpectedValueUsd: 51.83, calculatedAt: "2026-10-01T03:52:01.987Z" },
  chaseCards: [],
  evGuardrailBlocked: false,
  evGuardrailStatus: { blocked: false, refillMessage: "This pack is being refilled. Please check back soon." },
};

describe("toPack", () => {
  it("reads live price, EV and odds", () => {
    const p = toPack(PACK);
    expect(p.priceUsd).toBe(50);
    expect(p.evUsd).toBe(51.83);
    expect(p.odds[0]).toEqual({ label: "Common", displayRange: "$20 - $45", percentage: 54.91, count: 179 });
    expect(p.blockedMessage).toBeNull();
    expect(packAvailability(p).ok).toBe(true);
  });
  it("surfaces production's refill guardrail instead of selling", () => {
    const p = toPack({ ...PACK, evGuardrailBlocked: true, evGuardrailStatus: { ...PACK.evGuardrailStatus, blocked: true } });
    expect(p.blockedMessage).toBe("This pack is being refilled. Please check back soon.");
    expect(packAvailability(p)).toEqual({ ok: false, text: "This pack is being refilled. Please check back soon." });
  });
  it("reports sold out and paused packs as unavailable", () => {
    expect(packAvailability(toPack({ ...PACK, soldOut: true })).ok).toBe(false);
    expect(packAvailability(toPack({ ...PACK, paused: true })).ok).toBe(false);
  });
});

describe("toStats", () => {
  it("keeps absent figures null rather than zero", () => {
    const s = toStats({ packsOpened: 11911 });
    expect(s.packsOpened).toBe(11911);
    expect(s.activeListings).toBeNull();
    expect(s.topRecentPull).toBeNull();
  });
});

describe("toRace", () => {
  it("orders categories the way production does", () => {
    const r = toRace({
      race: { id: "august-2026", title: "August Leaderboard Race", status: "ended" },
      categories: { pointsEarned: { title: "Points" }, battleWins: { title: "Wins" } },
    });
    expect(r.categories.map((c) => c.key)).toEqual(["battleWins", "pointsEarned"]);
  });
});
