export const PACKS = [
  {
    id: 'pro',
    name: 'Pokemon Pro Pack',
    tier: 'PRO',
    price: 50,
    ev: 51.84,
    hot: false,
    blurb: 'The working collector pack. Real graded cards, fair random draw, 90% buyback window.',
  },
  {
    id: 'master',
    name: 'Pokemon Master Pack',
    tier: 'MASTER',
    price: 100,
    ev: 103.75,
    hot: true,
    blurb: 'Higher expected pull value. Same vaulted PSA / BGS / CGC cards. Same 5-day buyback.',
  },
]

export const ODDS = [
  { label: 'Common', pct: 75 },
  { label: 'Uncommon', pct: 20 },
  { label: 'Rare', pct: 4 },
  { label: 'Epic', pct: 1 },
]

export const VAULT = [
  { id: 'lugia', name: 'Lugia', set: 'Neo Genesis', company: 'PSA', grade: '10', rarity: 'Epic', value: 24500, status: 'demo', art: '#1b3b6f' },
  { id: 'charizard', name: 'Charizard', set: 'Base Set', company: 'PSA', grade: '9', rarity: 'Epic', value: 24500, status: 'featured', art: '#c45c12' },
  { id: 'rayquaza', name: 'Rayquaza', set: 'EX Deoxys', company: 'BGS', grade: '9.5', rarity: 'Rare', value: 1860, status: 'listed', art: '#146b4a' },
  { id: 'dragonite', name: 'Dark Dragonite', set: 'Team Rocket', company: 'PSA', grade: '9', rarity: 'Rare', value: 1406.7, status: 'owned', art: '#4a1d6b' },
  { id: 'magikarp', name: 'Shining Magikarp', set: 'Neo Revelation', company: 'CGC', grade: '8.5', rarity: 'Uncommon', value: 1300, status: 'owned', art: '#b45309' },
  { id: 'blastoise', name: 'Blastoise ex', set: '151', company: 'PSA', grade: '10', rarity: 'Uncommon', value: 37.68, status: 'buyback', art: '#1d4ed8' },
]

export const LISTINGS = [
  { id: 'l1', cardId: 'rayquaza', price: 1920, seller: 'vault-04' },
  { id: 'l2', cardId: 'dragonite', price: 1480, seller: 'vault-11' },
  { id: 'l3', cardId: 'magikarp', price: 1340, seller: 'vault-02' },
]

export const CHAINS = ['Avalanche', 'Ethereum', 'Base', 'Arbitrum', 'OP Mainnet', 'Polygon', 'HyperEVM', 'Monad']

export function pickCard() {
  const roll = Math.random() * 100
  let band = 'Common'
  if (roll >= 99) band = 'Epic'
  else if (roll >= 95) band = 'Rare'
  else if (roll >= 75) band = 'Uncommon'
  const pool = VAULT.filter((c) => c.rarity === band)
  const fallback = VAULT.filter((c) => c.rarity === 'Uncommon' || c.rarity === 'Common')
  const list = pool.length ? pool : fallback.length ? fallback : VAULT
  const card = list[Math.floor(Math.random() * list.length)]
  return { ...card, id: card.id + '-' + Date.now(), pulledAt: Date.now(), status: 'owned', buybackUntil: Date.now() + 5 * 86400000 }
}
