/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
export const PACKS = [
  { id: 'pro', name: 'Pokemon Pro Pack', tier: 'PRO', price: 50, ev: 51.84, hot: false, blurb: 'The working collector pack. Real graded cards, fair random draw, 90% buyback window.' },
  { id: 'master', name: 'Pokemon Master Pack', tier: 'MASTER', price: 100, ev: 103.75, hot: true, blurb: 'Higher expected pull value. Same vaulted PSA / BGS / CGC cards. Same 5-day buyback.' },
]

export const ODDS = [
  { label: 'Common', pct: 75 },
  { label: 'Uncommon', pct: 20 },
  { label: 'Rare', pct: 4 },
  { label: 'Epic', pct: 1 },
]

export const VAULT = [
  { id: 'luffy', name: 'Monkey D. Luffy', set: 'One Piece Magazine Vol.20', company: 'PSA', grade: '10', rarity: 'Rare', value: 196, status: 'owned', cert: '133373253', photo: '/slabs/luffy-psa10.jpg' },
  { id: 'charizard', name: 'Charizard Holo', set: '1999 Pokemon Game #4', company: 'PSA', grade: '10', rarity: 'Epic', value: 24500, status: 'featured', cert: '26573583', photo: '/slabs/charizard-psa10.png' },
  { id: 'rayquaza', name: 'Rayquaza', set: 'EX Deoxys', company: 'BGS', grade: '9.5', rarity: 'Rare', value: 1860, status: 'listed', art: '#146b4a' },
  { id: 'dragonite', name: 'Dark Dragonite', set: 'Team Rocket', company: 'PSA', grade: '9', rarity: 'Rare', value: 1406.7, status: 'owned', art: '#4a1d6b' },
  { id: 'magikarp', name: 'Shining Magikarp', set: 'Neo Revelation', company: 'CGC', grade: '8.5', rarity: 'Uncommon', value: 1300, status: 'owned', art: '#b45309' },
  { id: 'blastoise', name: 'Blastoise ex', set: '151', company: 'PSA', grade: '10', rarity: 'Uncommon', value: 37.68, status: 'buyback', art: '#1d4ed8' },
  { id: 'pikachu', name: 'Pikachu', set: 'Base Set', company: 'PSA', grade: '8', rarity: 'Common', value: 18, status: 'pool', art: '#ca8a04' },
  { id: 'squirtle', name: 'Squirtle', set: 'Base Set', company: 'CGC', grade: '9', rarity: 'Common', value: 22, status: 'pool', art: '#2563eb' },
  { id: 'oddish', name: 'Oddish', set: 'Jungle', company: 'BGS', grade: '8', rarity: 'Common', value: 14, status: 'pool', art: '#166534' },
  { id: 'caterpie', name: 'Caterpie', set: 'Base Set', company: 'PSA', grade: '9', rarity: 'Common', value: 12, status: 'pool', art: '#4d7c0f' },
]

export const LISTINGS = [
  { id: 'l1', cardId: 'rayquaza', price: 1920, seller: 'vault-04' },
  { id: 'l2', cardId: 'dragonite', price: 1480, seller: 'vault-11' },
  { id: 'l3', cardId: 'magikarp', price: 1340, seller: 'vault-02' },
]

export const CHAINS = ['Avalanche', 'Ethereum', 'Base', 'Arbitrum', 'OP Mainnet', 'Polygon', 'HyperEVM', 'Monad']

export const LIVE_STATS = [
  { label: 'Chase cards pulled', value: '116', sub: '18 grails · a pack ripped every 49 min' },
  { label: 'Packs + battle volume', value: '$814K', sub: '12K packs ripped' },
  { label: 'Top pull this week', value: '$146', sub: 'Fa/Vileplume Gx' },
  { label: 'Arena & market', value: '1.0K', sub: 'battles · 60 active listings' },
]

export const RECENT_PULLS = [
  { name: 'Yveltal', value: 31.69 },
  { name: 'Charizard', value: 70 },
  { name: 'Lugia', value: 88 },
  { name: 'Gardevoir', value: 42 },
  { name: 'Mewtwo', value: 55 },
  { name: 'Umbreon', value: 120 },
]

export const TRUST_POINTS = [
  { title: 'Chainlink VRF on Avalanche', body: 'Production draws are independently verified on-chain. This demo fakes the beat, not the odds bands.' },
  { title: 'Circle CCTP USDC', body: 'One balance across Avalanche, Ethereum, Base, Arbitrum, OP, Polygon, HyperEVM, Monad.' },
  { title: 'CardNFT tied to cert data', body: 'Every slab is bound to PSA · BGS · CGC cert numbers in the vault record.' },
  { title: 'Marketplace escrow', body: 'Asks settle in USDC. Cards do not move until the bid clears.' },
  { title: '5-day 90% buyback', body: 'Hate the pull? Sell it back within five days for 90% of published value.' },
  { title: 'Physical ship coming soon', body: 'Request the cardboard. The vault holds it insured until then.' },
]

export function money(n) {
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function daysLeft(until) {
  if (!until) return null
  const d = Math.ceil((until - Date.now()) / 86400000)
  return d
}

export function resolveCard(idOrCard) {
  if (idOrCard && typeof idOrCard === 'object') return idOrCard
  return VAULT.find((v) => v.id === idOrCard) || VAULT[0]
}

export function pickCard() {
  const roll = Math.random() * 100
  let rarity = 'Common'
  if (roll >= 99) rarity = 'Epic'
  else if (roll >= 95) rarity = 'Rare'
  else if (roll >= 75) rarity = 'Uncommon'
  const pool = VAULT.filter((c) => c.rarity === rarity)
  const list = pool.length ? pool : VAULT
  const card = list[Math.floor(Math.random() * list.length)]
  return {
    ...card,
    id: `${card.id}-${Date.now()}`,
    originId: card.id,
    pulledAt: Date.now(),
    status: 'owned',
    buybackUntil: Date.now() + 5 * 86400000,
  }
}
