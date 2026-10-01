import { describe, expect, it } from "vitest";
import { AVALANCHE_CHAIN_ID, CONTRACTS } from "./contracts";

/**
 * The production Web3 layer is authoritative and must not change from this repo.
 * These are the addresses published at yourgrails.com/docs (read 2026-10-01). If this test fails,
 * the change belongs in production, not here.
 */
const PRODUCTION: Record<string, string> = {
  CardNFT: "0x423714cB42bcFe9DD52A5225656d622aD39d6bA0",
  GachaPacks: "0xA26De0Ed1c24f54Cf316C9CDb8fEFF1ea68E5AB4",
  MarketplaceEscrow: "0x90A40f2befe2CE0AA10e951dbc47e2B6837Cfd9d",
  Buyback: "0x8D8669ADE9D390A6dD03D384983A5bb334369dAa",
  PackBattleV3: "0x7cC8173A9eD2dF8BAb306bbF28eDa301032D3936",
  CctpPackBuyerReceiver: "0xBa73111925C2bD51794eE8A0aD0520558FE6737c",
  CardLoanMarket: "0xa3A984C11A6f3d975a785f6028e7dEf08DCF2AC2",
  PackNFT: "0xFe3eB95C2369ddE7f93Af7229f774b2D00207745",
  "Lending Collateral Registry": "0xA07bb02d4979014D4bDeD18820d1Cd1f5Def16Df",
  "Lending Terms Registry": "0x5e8a5755EaE73A825689096aF598E38B68bcD0C7",
  USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
};

describe("production Web3 layer (preserve)", () => {
  it("targets Avalanche C-Chain mainnet", () => {
    expect(AVALANCHE_CHAIN_ID).toBe(43114);
  });
  it("references exactly the production contract addresses", () => {
    expect(Object.fromEntries(CONTRACTS.map((c) => [c.name, c.address]))).toEqual(PRODUCTION);
  });
});
