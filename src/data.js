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
  { id: 'charizard', name: 'Charizard Holo', set: '1999 Pokemon Game #4', company: 'PSA', grade: '10', rarity: 'Epic', value: 24500, status: 'featured', cert: '26573583', photo: '/slabs/charizard-psa10.jpg' },
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
  const pool = VAULT.filter((c) => c.photo)
  const list = pool.length ? pool : VAULT
  const card = list[Math.floor(Math.random() * list.length)]
  return { ...card, id: card.id + '-' + Date.now(), pulledAt: Date.now(), status: 'owned', buybackUntil: Date.now() + 5 * 86400000 }
}
