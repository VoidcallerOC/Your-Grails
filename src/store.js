/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { LISTINGS, VAULT, money, pickCard, resolveCard } from './data'

function cloneListings() {
  return LISTINGS.map((l) => ({ ...l }))
}

export const useVault = create(persist((set, get) => ({
  session: null,
  usdc: 0,
  owned: [],
  listings: cloneListings(),
  loans: [],
  toast: null,
  phase: null,
  pulled: null,
  ripTier: 'PRO',
  battle: { status: 'idle', you: null, them: null, winner: null },
  selectedBattleId: null,

  notify: (msg) => {
    const id = Date.now()
    set({ toast: { id, msg } })
    window.setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null })
    }, 3200)
  },

  connect: () => {
    if (get().session) {
      set({ usdc: +(get().usdc + 5000).toFixed(2) })
      get().notify('+5,000 USDC credited')
      return
    }
    set({ session: { name: 'Vault 0xYG' }, usdc: 5000 })
    get().notify('Demo vault connected · 5,000 USDC credited')
  },

  addUsdc: (amount = 2500) => {
    set({ usdc: +(get().usdc + amount).toFixed(2) })
    get().notify(`+${amount.toLocaleString('en-US')} USDC`)
  },

  startRip: (pack) => {
    const s = get()
    if (!s.session) {
      get().notify('Connect a demo vault first')
      return false
    }
    if (s.usdc < pack.price) {
      get().notify(`Need $${pack.price.toFixed(2)} USDC to rip`)
      return false
    }
    set({
      usdc: +(s.usdc - pack.price).toFixed(2),
      ripTier: pack.tier || 'PRO',
      phase: 'rip',
      pulled: pickCard(),
    })
    return true
  },

  setPhase: (phase) => set({ phase }),

  finishRip: (card) => {
    if (get().phase === 'show') return
    const pulled = card || get().pulled || pickCard()
    const owned = get().owned
    const already = owned.some((c) => c.id === pulled.id)
    set({ pulled, phase: 'show', owned: already ? owned : [pulled, ...owned] })
  },

  sellBack: (id) => {
    const s = get()
    const card = s.owned.find((c) => c.id === id)
    if (!card) return
    if (card.pledged) { get().notify('Card is pledged as collateral'); return }
    if (card.buybackUntil && Date.now() > card.buybackUntil) {
      get().notify('Buyback window closed')
      return
    }
    const payout = +(Number(card.value) * 0.9).toFixed(2)
    set({
      owned: s.owned.filter((c) => c.id !== id),
      usdc: +(s.usdc + payout).toFixed(2),
    })
    get().notify(`Sold back · +$${money(payout)} USDC`)
  },

  listCard: (id, price) => {
    const s = get()
    const card = s.owned.find((c) => c.id === id)
    if (!card) return
    if (card.pledged) { get().notify('Card is pledged as collateral'); return }
    const ask = Number(price) || Number(card.value)
    set({
      owned: s.owned.filter((c) => c.id !== id),
      listings: [{ id: `l-${Date.now()}`, cardId: card.originId || card.id, price: ask, seller: 'Vault 0xYG', card }, ...s.listings],
    })
    get().notify(`Listed ${card.name} at $${money(ask)}`)
  },

  buyListing: (listingId) => {
    const s = get()
    const listing = s.listings.find((l) => l.id === listingId)
    if (!listing) return
    if (!s.session) { get().notify('Connect a demo vault first'); return }
    if (s.usdc < listing.price) { get().notify('Not enough USDC'); return }
    const base = listing.card || resolveCard(listing.cardId)
    const card = {
      ...base,
      id: `${base.id}-${Date.now()}`,
      originId: base.originId || base.id,
      status: 'owned',
      pulledAt: Date.now(),
      buybackUntil: Date.now() + 5 * 86400000,
    }
    set({
      usdc: +(s.usdc - listing.price).toFixed(2),
      listings: s.listings.filter((l) => l.id !== listingId),
      owned: [card, ...s.owned],
    })
    get().notify(`Acquired ${card.name}`)
  },

  offerListing: (listingId, amount) => {
    const s = get()
    const listing = s.listings.find((l) => l.id === listingId)
    if (!listing || !s.session) { get().notify('Connect first'); return }
    const bid = Number(amount)
    if (!bid || bid <= 0) return
    if (bid >= listing.price) {
      get().buyListing(listingId)
      return
    }
    if (s.usdc < bid) { get().notify('Not enough USDC'); return }
    const accept = bid >= listing.price * 0.92
    if (accept) {
      const base = listing.card || resolveCard(listing.cardId)
      const card = {
        ...base,
        id: `${base.id}-${Date.now()}`,
        originId: base.originId || base.id,
        status: 'owned',
        pulledAt: Date.now(),
        buybackUntil: Date.now() + 5 * 86400000,
      }
      set({
        usdc: +(s.usdc - bid).toFixed(2),
        listings: s.listings.filter((l) => l.id !== listingId),
        owned: [card, ...s.owned],
      })
      get().notify(`Offer accepted · ${card.name} for $${money(bid)}`)
    } else {
      get().notify('Offer sent — seller passed')
    }
  },

  setSelectedBattle: (id) => set({ selectedBattleId: id }),

  lockBattle: () => {
    const s = get()
    const yours = s.owned.find((c) => c.id === s.selectedBattleId) || s.owned[0] || VAULT.find((c) => c.id === 'magikarp')
    if (!yours) return
    if (yours.pledged) { get().notify('Card is pledged as collateral'); return }
    const pool = VAULT.filter((c) => c.id !== 'charizard' && c.id !== (yours.originId || yours.id) && c.rarity !== 'Common')
    const them = pool[Math.floor(Math.random() * pool.length)] || VAULT[3]
    const isOwned = s.owned.some((c) => c.id === yours.id)
    set({ battle: { status: 'lock', you: yours, them, winner: null, isOwned } })
    window.setTimeout(() => {
      const p = Number(yours.value) / (Number(yours.value) + Number(them.value))
      const youWin = Math.random() < p
      const cur = get()
      if (youWin) {
        const spoils = {
          ...them,
          id: `won-${them.id}-${Date.now()}`,
          originId: them.id,
          status: 'owned',
          pulledAt: Date.now(),
          buybackUntil: Date.now() + 5 * 86400000,
        }
        set({
          battle: { status: 'result', you: yours, them, winner: 'you', isOwned },
          owned: [spoils, ...cur.owned],
        })
        get().notify(`You took ${them.name}`)
      } else {
        set({
          battle: { status: 'result', you: yours, them, winner: 'them', isOwned },
          owned: isOwned ? cur.owned.filter((c) => c.id !== yours.id) : cur.owned,
        })
        get().notify(isOwned ? `Lost ${yours.name}` : 'Demo stake lost — your vault is untouched')
      }
    }, 1600)
  },

  resetBattle: () => set({ battle: { status: 'idle', you: null, them: null, winner: null } }),

  borrow: (cardId) => {
    const s = get()
    const card = s.owned.find((c) => c.id === cardId)
    if (!card || card.pledged) return
    const amount = +(Number(card.value) * 0.5).toFixed(2)
    set({
      owned: s.owned.map((c) => (c.id === cardId ? { ...c, pledged: true } : c)),
      loans: [{ id: `ln-${Date.now()}`, cardId, name: card.name, amount, repay: +(amount * 1.04).toFixed(2) }, ...s.loans],
      usdc: +(s.usdc + amount).toFixed(2),
    })
    get().notify(`Borrowed $${money(amount)} USDC against ${card.name}`)
  },

  repay: (loanId) => {
    const s = get()
    const loan = s.loans.find((l) => l.id === loanId)
    if (!loan) return
    if (s.usdc < loan.repay) { get().notify('Not enough USDC to repay'); return }
    set({
      usdc: +(s.usdc - loan.repay).toFixed(2),
      loans: s.loans.filter((l) => l.id !== loanId),
      owned: s.owned.map((c) => (c.id === loan.cardId ? { ...c, pledged: false } : c)),
    })
    get().notify(`Loan cleared · ${loan.name} unlocked`)
  },

  tradeFor: (listingId, offerId) => {
    const s = get()
    const listing = s.listings.find((l) => l.id === listingId)
    const offer = s.owned.find((c) => c.id === offerId)
    if (!listing || !offer) return
    if (offer.pledged) { get().notify('Card is pledged as collateral'); return }
    const theirs = listing.card || resolveCard(listing.cardId)
    const ratio = Number(offer.value) / Number(theirs.value)
    if (ratio < 0.7) {
      get().notify('Counter: they want closer value')
      return
    }
    const incoming = {
      ...theirs,
      id: `${theirs.id}-${Date.now()}`,
      originId: theirs.originId || theirs.id,
      status: 'owned',
      pulledAt: Date.now(),
      buybackUntil: Date.now() + 5 * 86400000,
    }
    set({
      owned: [incoming, ...s.owned.filter((c) => c.id !== offerId)],
      listings: s.listings.filter((l) => l.id !== listingId),
    })
    get().notify(`Trade cleared · ${offer.name} for ${incoming.name}`)
  },
}), {
  name: 'yg-demo-vault',
  storage: createJSONStorage(() => {
    if (typeof window === 'undefined') {
      return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
    }
    return localStorage
  }),
  partialize: (s) => ({
    session: s.session,
    usdc: s.usdc,
    owned: s.owned,
    listings: s.listings,
    loans: s.loans,
  }),
  onRehydrateStorage: () => (state) => {
    if (state?.session && state.usdc < 2500) state.usdc = 5000
  },
}))
