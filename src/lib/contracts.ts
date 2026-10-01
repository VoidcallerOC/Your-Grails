/**
 * Production contracts on Avalanche C-Chain (43114).
 * Addresses come from yourgrails.com/docs. `verified` means the source is verified on Routescan for chain 43114
 * (checked 2026-10-01). Unverified entries are listed for reference only and must not be used for writes.
 */
export const AVALANCHE_CHAIN_ID = 43114;
export const EXPLORER = "https://snowtrace.io";

export type ContractInfo = { name: string; address: `0x${string}`; role: string; verified: boolean };

export const CONTRACTS: ContractInfo[] = [
  { name: "CardNFT", address: "0x423714cB42bcFe9DD52A5225656d622aD39d6bA0", role: "ERC-721 ownership token for each vaulted graded card", verified: true },
  { name: "GachaPacks", address: "0xA26De0Ed1c24f54Cf316C9CDb8fEFF1ea68E5AB4", role: "Pack purchases, coupons and Chainlink VRF reveal requests", verified: true },
  { name: "MarketplaceEscrow", address: "0x90A40f2befe2CE0AA10e951dbc47e2B6837Cfd9d", role: "Listings, purchases, offers and cancellation escrow", verified: true },
  { name: "Buyback", address: "0x8D8669ADE9D390A6dD03D384983A5bb334369dAa", role: "Instant buyback vouchers and settlement", verified: true },
  { name: "PackBattleV3", address: "0x7cC8173A9eD2dF8BAb306bbF28eDa301032D3936", role: "Two-player and bot-assisted pack battles", verified: true },
  { name: "CctpPackBuyerReceiver", address: "0xBa73111925C2bD51794eE8A0aD0520558FE6737c", role: "Receives Circle CCTP USDC and buys packs or enters battles", verified: true },
  { name: "CardLoanMarket", address: "0xa3A984C11A6f3d975a785f6028e7dEf08DCF2AC2", role: "Peer-to-peer USDC loans backed by cards", verified: true },
  { name: "PackNFT", address: "0xFe3eB95C2369ddE7f93Af7229f774b2D00207745", role: "Temporary unrevealed pack tokens", verified: false },
  { name: "Lending Collateral Registry", address: "0xA07bb02d4979014D4bDeD18820d1Cd1f5Def16Df", role: "Card contracts allowed as loan collateral", verified: false },
  { name: "Lending Terms Registry", address: "0x5e8a5755EaE73A825689096aF598E38B68bcD0C7", role: "Admin-managed loan term presets", verified: false },
  { name: "USDC", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", role: "Circle USDC used for every payment", verified: false },
];

export const contractUrl = (address: string) => `${EXPLORER}/address/${address}`;
/** Same URL shape the production app uses for transactions. */
export const txUrl = (hash: string) => `${EXPLORER}/tx/${hash}?chainid=${AVALANCHE_CHAIN_ID}`;
