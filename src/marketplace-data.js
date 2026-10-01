// Marketplace demo-data loader.
// Source: src/data/marketplace-demo.csv, 48 SYNTHETIC listings invented for this demo (fictional cards, sets and sellers).
// They are not real inventory, prices, offers or accounts. Nothing here talks to a backend.
// If the CSV is missing or unreadable the page says so; it never invents listings at runtime.

const FILES = import.meta.glob('./data/marketplace-demo.csv', { query: '?raw', import: 'default', eager: true })

// Column aliases, matched after lowercasing and stripping non-alphanumerics.
const ALIASES = {
  listingId: ['listingid', 'id', 'listingnumber'],
  name: ['name', 'cardname', 'card', 'title', 'listing'],
  company: ['gradingcompany', 'company', 'grader', 'gradedby', 'gradingco'],
  grade: ['grade', 'gradevalue', 'gradenumber'],
  set: ['set', 'setname', 'cardset', 'series'],
  number: ['cardnumber', 'number', 'cardno', 'no', 'cardnum'],
  setNumber: ['setandnumber', 'setnumber', 'setcardnumber', 'setandcardnumber'],
  seller: ['seller', 'sellerdisplay', 'sellerdisplayed', 'sellername', 'listedby', 'owner'],
  ask: ['askingprice', 'ask', 'price', 'askprice', 'listprice', 'askusdc', 'askingpriceusdc', 'priceusdc'],
  fair: ['fairvalue', 'fair', 'fairprice', 'fairvalueusdc', 'marketvalue'],
  topOffer: ['topoffer', 'highestoffer', 'bestoffer', 'topofferusdc'],
  offerCount: ['offercount', 'offers', 'numoffers', 'openoffers', 'offercnt'],
  actions: ['actions', 'availableactions', 'action'],
  url: ['listingurl', 'url', 'link', 'listinglink'],
  image: ['imageurl', 'image', 'photourl', 'photo'],
  status: ['status', 'state', 'listingstate', 'listed'],
}
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

// RFC 4180 style parser: quoted fields, escaped quotes, commas and newlines inside quotes, CRLF, BOM.
export function parseCsv(text) {
  const src = String(text || '').replace(/^﻿/, '')
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((c) => c.trim() !== '')) rows.push(row)
      row = []
    } else field += ch
  }
  row.push(field)
  if (row.some((c) => c.trim() !== '')) rows.push(row)
  return rows
}

export function money(value) {
  if (value == null) return null
  const t = String(value).trim()
  if (!t || /^(—|–|-|n\/a|na|none|null)$/i.test(t)) return null
  const n = Number(t.replace(/[$,\s]/g, '').replace(/usdc$/i, ''))
  return Number.isFinite(n) ? n : null
}

function splitActions(raw) {
  const out = new Set()
  for (const part of String(raw || '').split(/[|;,/]+/)) {
    const t = norm(part)
    if (t.includes('buy')) out.add('buy')
    else if (t.includes('trade')) out.add('trade')
    else if (t.includes('offer')) out.add('offer')
  }
  return [...out]
}

function safeUrl(raw) {
  try {
    const u = new URL(String(raw || '').trim())
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null
  } catch { return null }
}

// Turns CSV text into normalized listings. Never throws; returns { listings, error, skipped, headers }.
export function buildListings(text) {
  if (!text || !String(text).trim()) return { listings: [], error: null, skipped: 0, headers: [], loaded: false }
  const table = parseCsv(text)
  if (table.length < 2) return { listings: [], error: 'The CSV has a header row but no listings.', skipped: 0, headers: table[0] || [], loaded: true }
  const headers = table[0].map((h) => h.trim())
  const index = {}
  headers.forEach((h, i) => {
    const key = norm(h)
    for (const [field, names] of Object.entries(ALIASES)) {
      if (index[field] == null && names.includes(key)) index[field] = i
    }
  })
  const missing = ['name', 'ask'].filter((f) => index[f] == null)
  if (missing.length) {
    return { listings: [], error: `Could not find required column(s): ${missing.join(', ')}.`, skipped: 0, headers, loaded: true }
  }
  const cell = (r, f) => (index[f] == null ? '' : String(r[index[f]] ?? '').trim())
  const listings = []
  let skipped = 0
  table.slice(1).forEach((r, n) => {
    const name = cell(r, 'name')
    const ask = money(cell(r, 'ask'))
    if (!name || ask == null) { skipped++; return }
    let company = cell(r, 'company').toUpperCase()
    let grade = cell(r, 'grade')
    const combined = grade.match(/^([A-Za-z]{2,4})\s*([\d.]+)$/)
    if (combined) { if (!company) company = combined[1].toUpperCase(); grade = combined[2] }
    // Show whole grades without a trailing .0 ("9.0" -> "9"); half grades like 8.5 are kept.
    grade = grade.replace(/^(\d+)\.0+$/, '$1')
    let set = cell(r, 'set')
    let number = cell(r, 'number').replace(/^#\s*/, '')
    const both = cell(r, 'setNumber')
    if (both && !set) {
      const m = both.match(/^(.*?)[\s·•|/,-]*#\s*([\w/-]+)\s*$/)
      if (m) { set = m[1].trim(); if (!number) number = m[2] } else set = both
    }
    const stateText = norm(cell(r, 'status'))
    const listed = !(stateText.includes('unlist') || stateText === 'false' || stateText === 'no' || stateText === 'sold')
    const offerCount = Number.parseInt(cell(r, 'offerCount').replace(/[^\d]/g, ''), 10)
    const actions = splitActions(cell(r, 'actions'))
    listings.push({
      id: `snap-${cell(r, 'listingId') || n}`,
      listingId: cell(r, 'listingId'),
      name,
      company,
      grade,
      set,
      number,
      seller: cell(r, 'seller'),
      ask,
      fair: money(cell(r, 'fair')),
      topOffer: money(cell(r, 'topOffer')),
      offerCount: Number.isFinite(offerCount) ? offerCount : null,
      // No actions column (or none recognised) means the data did not say; show all three affordances.
      actions: actions.length ? actions : ['buy', 'trade', 'offer'],
      url: safeUrl(cell(r, 'url')),
      listed,
      // A photo is used only if the CSV supplies a valid image URL. Nothing is guessed, and project slab photos
      // are not matched by name: each belongs to one certified card and the CSV has no cert number.
      photo: safeUrl(cell(r, 'image')),
    })
  })
  return { listings, error: null, skipped, headers, loaded: true }
}

export const DEMO_DATA = buildListings(Object.values(FILES)[0])

// What each unsupported action would need before it could be real. Shown in the demo notices.
export const INTEGRATIONS = {
  buy: {
    title: 'Buy at the asking price',
    needs: [
      'Wallet connection and sign-in',
      'USDC approval and a purchase transaction against the escrow contract',
      'A live listing source (API or indexer) that confirms the card is still available at that price',
    ],
  },
  offer: {
    title: 'Cash offer',
    needs: [
      'Wallet connection and sign-in',
      'An offer-wallet balance read, with funds held so the offer is funded',
      'An offers API or contract call to create, cancel and let the seller accept an offer',
    ],
  },
  trade: {
    title: 'Trade',
    needs: [
      'Wallet connection and a read of the cards you own',
      'A trade-proposal API with two-sided escrow',
      'Seller notification and accept or decline handling',
    ],
  },
  deposit: {
    title: 'Deposit to offer wallet',
    needs: ['Wallet connection', 'USDC approval and a deposit transaction', 'A balance read after confirmation'],
  },
  withdraw: {
    title: 'Withdraw from offer wallet',
    needs: ['Wallet connection', 'A withdraw transaction for unlocked USDC', 'A balance read after confirmation'],
  },
}
