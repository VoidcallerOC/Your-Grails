/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react'
import { Slab } from './Home'
import { INTEGRATIONS, SNAPSHOT } from './marketplace-data'
import { useVault } from './store'

// Prices keep their cents (the shared money() helper drops trailing zeros: 25.10 -> 25.1).
const money = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2, maximumFractionDigits: 2 })

const PAGE_SIZE = 12
const COMPANIES = ['PSA', 'BGS', 'CGC']
const STATES = [['listed', 'Listed'], ['unlisted', 'Unlisted'], ['all', 'All']]
const SORTS = [
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['discount', 'Biggest discount to fair value'],
  ['offer-desc', 'Top offer: high to low'],
  ['offers-desc', 'Most offers'],
  ['fair-desc', 'Fair value: high to low'],
  ['name', 'Name: A to Z'],
]
const NO_FILTERS = { q: '', state: 'listed', companies: [], sort: 'price-asc', min: '', max: '', hasOffers: false, belowFair: false, page: 1 }

// Listing -> the card shape Slab expects. No photo is attached: the CSV has no cert number to prove which physical slab a photo shows.
const toCard = (l) => ({ id: l.id, name: l.name, set: l.set, number: l.number, company: l.company || '—', grade: l.grade || '—', rarity: '', value: l.fair ?? l.ask, photo: l.photo })

function sortRows(rows, sort) {
  const by = (fn, dir = 1) => (a, b) => {
    const x = fn(a); const y = fn(b)
    if (x == null && y == null) return 0
    if (x == null) return 1
    if (y == null) return -1
    return (x - y) * dir
  }
  const out = [...rows]
  if (sort === 'price-asc') out.sort(by((l) => l.ask))
  else if (sort === 'price-desc') out.sort(by((l) => l.ask, -1))
  else if (sort === 'discount') out.sort(by((l) => (l.fair ? l.ask / l.fair : null)))
  else if (sort === 'offer-desc') out.sort(by((l) => l.topOffer, -1))
  else if (sort === 'offers-desc') out.sort(by((l) => l.offerCount, -1))
  else if (sort === 'fair-desc') out.sort(by((l) => l.fair, -1))
  else out.sort((a, b) => a.name.localeCompare(b.name))
  return out
}

function applyFilters(all, f) {
  const q = f.q.trim().toLowerCase()
  const min = f.min === '' ? null : Number(f.min)
  const max = f.max === '' ? null : Number(f.max)
  return all.filter((l) => {
    if (f.state === 'listed' && !l.listed) return false
    if (f.state === 'unlisted' && l.listed) return false
    if (f.companies.length && !f.companies.includes(l.company)) return false
    if (q && ![l.name, l.set, l.number, l.seller, l.company, l.grade, `${l.company} ${l.grade}`].join(' ').toLowerCase().includes(q)) return false
    if (min != null && Number.isFinite(min) && l.ask < min) return false
    if (max != null && Number.isFinite(max) && l.ask > max) return false
    if (f.hasOffers && !(l.offerCount > 0)) return false
    if (f.belowFair && !(l.fair != null && l.ask < l.fair)) return false
    return true
  })
}

function pageList(page, pages) {
  const set = new Set([1, pages, page, page - 1, page + 1])
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b)
  const out = []
  nums.forEach((n, i) => { if (i && n - nums[i - 1] > 1) out.push('gap'); out.push(n) })
  return out
}

function Needs({ kind, onClose }) {
  const info = INTEGRATIONS[kind]
  return (
    <div className="demo-notice" role="status">
      <strong>Demo only: {info.title} isn't connected.</strong>
      <span>Nothing was bought, offered or moved. To make it real this needs:</span>
      <ul>{info.needs.map((n) => <li key={n}>{n}</li>)}</ul>
      <button type="button" className="link-btn" onClick={onClose}>Close</button>
    </div>
  )
}

function Listing({ l, open, setOpen }) {
  const delta = l.fair ? ((l.ask - l.fair) / l.fair) * 100 : null
  const card = toCard(l)
  const label = { buy: 'Buy', offer: 'Cash offer', trade: 'Trade' }
  const order = ['buy', 'offer', 'trade'].filter((a) => l.actions.includes(a))
  return (
    <li className="listing">
      <div className="listing-stage"><Slab card={card} still /></div>
      <div className="listing-body">
        <div className="listing-head">
          <div className="listing-id">
            <strong>{l.name}</strong>
            <span>{[l.set, l.number && `#${l.number}`].filter(Boolean).join(' · ') || 'Set not listed'}</span>
            <span className="listing-meta">{l.seller ? `Seller ${l.seller}` : 'Seller not listed'}</span>
          </div>
          <span className="listing-grade"><i>{l.company || '—'}</i><b>{l.grade || '—'}</b></span>
        </div>
        <div className={`listing-price ${delta != null && delta < -0.05 ? 'is-under' : ''}`}>
          <strong>${money(l.ask)}</strong>
          <span>
            {l.fair == null ? 'Fair value not listed'
              : `Fair value $${money(l.fair)}${Math.abs(delta) < 0.05 ? '' : ` · ${Math.abs(delta).toFixed(1)}% ${delta > 0 ? 'over' : 'under'}`}`}
          </span>
        </div>
        <div className="listing-offers">
          <span>Top offer</span>
          <b>{l.topOffer != null ? `$${money(l.topOffer)}` : 'None'}</b>
          <span>{l.offerCount != null ? `${l.offerCount} offer${l.offerCount === 1 ? '' : 's'}` : ''}</span>
        </div>
        <div className="listing-actions">
          {order.map((a, i) => (
            <button key={a} type="button" className={`btn ${i === 0 ? 'btn-grad' : 'btn-ghost'}`} aria-expanded={open === a} onClick={() => setOpen(open === a ? null : a)}>
              {label[a]}
            </button>
          ))}
        </div>
        {open && <Needs kind={open} onClose={() => setOpen(null)} />}
        {l.url && <a className="listing-orig" href={l.url} target="_blank" rel="noopener noreferrer">Original listing ↗</a>}
      </div>
    </li>
  )
}

function OfferWallet() {
  const [open, setOpen] = useState(null)
  const [expanded, setExpanded] = useState(() => !window.matchMedia('(max-width: 900px)').matches)
  return (
    <details className="wallet" open={expanded} onToggle={(e) => setExpanded(e.currentTarget.open)}>
      <summary>
        <span className="wallet-title">Offer wallet</span>
        <span className="wallet-tag">Demo</span>
        <span className="wallet-bal"><b>—</b><span>USDC · wallet not connected</span></span>
      </summary>
      <div className="wallet-body">
        <p>Funds in your offer wallet back the offers you make, so sellers can accept them right away.</p>
        <div className="wallet-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(open === 'deposit' ? null : 'deposit')} aria-expanded={open === 'deposit'}>Deposit</button>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(open === 'withdraw' ? null : 'withdraw')} aria-expanded={open === 'withdraw'}>Withdraw</button>
        </div>
        {open && <Needs kind={open} onClose={() => setOpen(null)} />}
      </div>
    </details>
  )
}

export function Marketplace() {
  const [f, setF] = useState(NO_FILTERS)
  const [more, setMore] = useState(false)
  const [open, setOpen] = useState({})
  const gridTop = useRef(null)
  const mine = useVault((s) => s.listings).filter((l) => l.card && l.seller === 'Vault 0xYG')
  const all = SNAPSHOT.listings
  const update = (patch) => setF((cur) => ({ ...cur, page: 1, ...patch }))
  const goto = (page) => { setF((cur) => ({ ...cur, page })) }
  const rows = useMemo(() => sortRows(applyFilters(all, f), f.sort), [all, f])
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const page = Math.min(f.page, pages)
  const shown = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const listed = all.filter((l) => l.listed)
  const floor = listed.length ? Math.min(...listed.map((l) => l.ask)) : null
  const offers = all.reduce((n, l) => n + (l.offerCount || 0), 0)
  const dirty = JSON.stringify({ ...f, page: 1 }) !== JSON.stringify(NO_FILTERS)
  const lastPage = useRef(page)
  useEffect(() => {
    if (lastPage.current === page) return
    lastPage.current = page
    gridTop.current?.scrollIntoView({ block: 'start' })
  }, [page])

  return (
    <>
      <div className="mkt-top">
        <div>
          <header className="mkt-head">
            <h1>Trade graded cards on-chain</h1>
            <p>Buy instantly at the asking price, or make a funded offer the seller can accept. Listings are escrowed on-chain with 0% buyer fees.</p>
          </header>
          <p className="demo-banner" role="note">
            <b>Demo preview.</b> A snapshot of the live marketplace, possibly out of date. Nothing here connects to a wallet, escrow or backend; Buy, Cash offer, Trade, Deposit and Withdraw don't execute.
          </p>
        </div>
        <OfferWallet />
      </div>
      <dl className="mkt-stats">
        <div><dt>Active listings</dt><dd>{SNAPSHOT.loaded && !SNAPSHOT.error ? listed.length : '—'}</dd></div>
        <div><dt>Floor</dt><dd>{floor != null ? `$${money(floor)}` : '—'}</dd></div>
        <div><dt>Open offers</dt><dd>{SNAPSHOT.loaded && !SNAPSHOT.error ? offers : '—'}</dd></div>
      </dl>

      {!SNAPSHOT.loaded && (
        <div className="mkt-empty" role="status">
          <strong>Marketplace snapshot not loaded.</strong>
          <p>Add <code>marketplace-reference.csv</code> to <code>src/data/</code> and rebuild. No listings are shown until the real snapshot is present, and none are invented.</p>
        </div>
      )}
      {SNAPSHOT.error && (
        <div className="mkt-empty" role="alert">
          <strong>The snapshot CSV could not be read.</strong>
          <p>{SNAPSHOT.error}</p>
          {SNAPSHOT.headers.length > 0 && <p>Columns found: {SNAPSHOT.headers.join(', ')}</p>}
        </div>
      )}

      {SNAPSHOT.loaded && !SNAPSHOT.error && (
        <>
          <div className="mkt-controls" role="search">
            <label className="ctl ctl-search">
              <span>Search</span>
              <input type="search" value={f.q} onChange={(e) => update({ q: e.target.value })} placeholder="Card, set, number or seller" />
            </label>
            <fieldset className="ctl">
              <legend>Listing</legend>
              <div className="seg">
                {STATES.map(([v, label]) => (
                  <label key={v} className={f.state === v ? 'is-on' : ''}>
                    <input type="radio" name="state" value={v} checked={f.state === v} onChange={() => update({ state: v })} />{label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="ctl">
              <legend>Grader</legend>
              <div className="seg">
                {COMPANIES.map((c) => {
                  const on = f.companies.includes(c)
                  return (
                    <button key={c} type="button" aria-pressed={on} className={on ? 'is-on' : ''}
                      onClick={() => update({ companies: on ? f.companies.filter((x) => x !== c) : [...f.companies, c] })}>{c}</button>
                  )
                })}
              </div>
            </fieldset>
            <label className="ctl">
              <span>Sort</span>
              <select value={f.sort} onChange={(e) => update({ sort: e.target.value })}>
                {SORTS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </label>
            <button type="button" className="ctl-more" aria-expanded={more} onClick={() => setMore(!more)}>
              Filters{(f.min !== '' || f.max !== '' || f.hasOffers || f.belowFair) ? ' •' : ''}
            </button>
          </div>
          {more && (
            <div className="mkt-more">
              <label className="money-field"><span>Min $</span><input type="number" min="0" inputMode="decimal" value={f.min} onChange={(e) => update({ min: e.target.value })} /></label>
              <label className="money-field"><span>Max $</span><input type="number" min="0" inputMode="decimal" value={f.max} onChange={(e) => update({ max: e.target.value })} /></label>
              <label className="check"><input type="checkbox" checked={f.hasOffers} onChange={(e) => update({ hasOffers: e.target.checked })} /> Has offers</label>
              <label className="check"><input type="checkbox" checked={f.belowFair} onChange={(e) => update({ belowFair: e.target.checked })} /> Priced below fair value</label>
            </div>
          )}
          <div className="mkt-count" ref={gridTop} aria-live="polite">
            <span>{rows.length === 0 ? 'No matching listings' : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, rows.length)} of ${rows.length}`}</span>
            {dirty && <button type="button" className="link-btn" onClick={() => setF(NO_FILTERS)}>Clear all</button>}
            {SNAPSHOT.skipped > 0 && <span className="mkt-skip">{SNAPSHOT.skipped} CSV row{SNAPSHOT.skipped === 1 ? '' : 's'} skipped (missing name or price)</span>}
          </div>

          {rows.length === 0 && (
            <p className="mkt-none">
              {f.state === 'unlisted' && !all.some((l) => !l.listed) ? 'This snapshot only contains listed cards.' : 'Nothing matches those filters.'}
            </p>
          )}
          <ul className="market-grid">
            {shown.map((l) => <Listing key={l.id} l={l} open={open[l.id]} setOpen={(a) => setOpen((o) => ({ ...o, [l.id]: a }))} />)}
          </ul>

          {pages > 1 && (
            <nav className="pager" aria-label="Pagination">
              <button type="button" className="btn btn-ghost" disabled={page === 1} onClick={() => goto(page - 1)}>Previous</button>
              <ol>
                {pageList(page, pages).map((n, i) => n === 'gap'
                  ? <li key={`g${i}`} aria-hidden="true">…</li>
                  : <li key={n}><button type="button" aria-current={n === page ? 'page' : undefined} className={n === page ? 'is-on' : ''} onClick={() => goto(n)}>{n}</button></li>)}
              </ol>
              <button type="button" className="btn btn-ghost" disabled={page === pages} onClick={() => goto(page + 1)}>Next</button>
            </nav>
          )}
        </>
      )}

      {mine.length > 0 && (
        <section className="mine" aria-label="Your demo listings">
          <h2>Listed from your demo collection</h2>
          <p className="muted">Only visible to you in this demo. These are not part of the snapshot.</p>
          <ul>
            {mine.map((l) => (
              <li key={l.id}><strong>{l.card.name}</strong><span>{l.card.company} {l.card.grade}</span><b>${money(l.price)}</b></li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
