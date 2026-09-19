/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useState } from 'react'
import { useNavigate } from './nav'
import { LISTINGS, TRUST_POINTS, VAULT, daysLeft, money, resolveCard } from './data'
import { Slab } from './Home'
import { RipScene } from './RipScene'
import { useVault } from './store'

export function Reveal() {
  const navigate = useNavigate()
  const phase = useVault((s) => s.phase)
  const card = useVault((s) => s.pulled)
  const tier = useVault((s) => s.ripTier)
  const epic = card?.rarity === 'Epic'
  return (
    <div className={`reveal ${phase === 'show' && epic ? 'is-epic' : ''}`}>
      {(phase === 'rip' || phase === 'verify' || phase === 'show') && (
        <RipScene tier={tier} phase={phase} card={card}>
          {card ? <Slab card={card} large pose="emerge" /> : null}
        </RipScene>
      )}
      {!phase && (
        <>
          <h2>Nothing to reveal yet.</h2>
          <button className="btn btn-ghost" onClick={() => navigate({ to: '/packs' })}>Choose a pack</button>
        </>
      )}
    </div>
  )
}

export function Collection() {
  const navigate = useNavigate()
  const owned = useVault((s) => s.owned)
  const usdc = useVault((s) => s.usdc)
  const total = owned.reduce((n, c) => n + Number(c.value), 0)
  return (
    <>
      <span className="tag">My Grails</span>
      <h1>Your vault</h1>
      <p className="muted">{owned.length} slab{owned.length === 1 ? '' : 's'} · ${money(total)} market · ${money(usdc)} USDC</p>
      {!owned.length && <div className="panel" style={{ marginTop: 20 }}>No slabs yet. Rip a pack to seed the vault.</div>}
      <div className="grid-3" style={{ marginTop: 24 }}>
        {owned.map((c) => (
          <div key={c.id} className="panel vault-card">
            <Slab card={c} />
            <div style={{ width: '100%', marginTop: 12 }}>
              <strong>{c.name}</strong>
              <p className="muted">{c.company} {c.grade} · ${money(c.value)}{c.pledged ? ' · pledged' : ''}</p>
              <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => navigate({ to: '/card/$id', params: { id: c.id } })}>Inspect slab</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export function CardPage({ id }) {
  const navigate = useNavigate()
  const owned = useVault((s) => s.owned)
  const sellBack = useVault((s) => s.sellBack)
  const listCard = useVault((s) => s.listCard)
  const setSelectedBattle = useVault((s) => s.setSelectedBattle)
  const card = owned.find((c) => c.id === id) || VAULT.find((c) => c.id === id) || VAULT[0]
  const inVault = owned.some((c) => c.id === card.id)
  const left = daysLeft(card.buybackUntil)
  const [ask, setAsk] = useState(Math.round(Number(card.value)))
  const buybackOpen = inVault && (!card.buybackUntil || left > 0) && !card.pledged
  return (
    <div className="grid-2" style={{ alignItems: 'center' }}>
      <div style={{ display: 'grid', placeItems: 'center' }}><Slab card={card} large /></div>
      <div>
        <span className="tag">{card.company} {card.grade} · {card.rarity}</span>
        <h1>{card.name}</h1>
        <p className="muted">{card.set}{card.cert ? ` · cert ${card.cert}` : ''}</p>
        <h3>${money(card.value)} market value</h3>
        {inVault && left != null && (
          <p className="muted">{left > 0 ? `${left} day${left === 1 ? '' : 's'} left on 90% buyback` : 'Buyback window closed'}</p>
        )}
        {card.pledged && <p className="muted">Pledged as loan collateral.</p>}
        <div className="row" style={{ marginTop: 16 }}>
          <button
            className="btn btn-gold"
            disabled={!buybackOpen}
            onClick={() => { sellBack(card.id); navigate({ to: '/collection' }) }}
          >
            Sell back 90%
          </button>
          <button
            className="btn btn-ghost"
            disabled={!inVault || card.pledged}
            onClick={() => { setSelectedBattle(card.id); navigate({ to: '/battles' }) }}
          >
            Battle
          </button>
        </div>
        {inVault && !card.pledged && (
          <div className="list-box">
            <label htmlFor="ask">List on marketplace</label>
            <div className="row">
              <input id="ask" className="field" type="number" min="1" value={ask} onChange={(e) => setAsk(e.target.value)} />
              <button className="btn btn-ghost" onClick={() => { listCard(card.id, ask); navigate({ to: '/marketplace' }) }}>List</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function Battles() {
  const owned = useVault((s) => s.owned)
  const battle = useVault((s) => s.battle)
  const selectedBattleId = useVault((s) => s.selectedBattleId)
  const setSelectedBattle = useVault((s) => s.setSelectedBattle)
  const lockBattle = useVault((s) => s.lockBattle)
  const resetBattle = useVault((s) => s.resetBattle)
  const session = useVault((s) => s.session)
  const connect = useVault((s) => s.connect)
  const playable = owned.filter((c) => !c.pledged)
  const you = playable.find((c) => c.id === selectedBattleId) || playable[0] || VAULT.find((c) => c.id === 'magikarp')
  const them = battle.them || VAULT.find((c) => c.id === 'dragonite')
  const locking = battle.status === 'lock'
  const done = battle.status === 'result'
  return (
    <>
      <span className="tag">Arena</span>
      <h1>Player vs player</h1>
      <p className="lead">Stake a slab. Higher published value is favored — upsets happen. Winner takes the other card.</p>
      {!owned.length && <p className="notice">No pulls yet — you're staking a house Magikarp. Rip a pack to risk your own grail.</p>}
      {playable.length > 1 && (
        <div className="row" style={{ margin: '16px 0' }}>
          {playable.map((c) => (
            <button
              key={c.id}
              className={`chip ${you?.id === c.id ? 'is-on' : ''}`}
              onClick={() => { setSelectedBattle(c.id); resetBattle() }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
      <div className={`grid-3 arena ${locking ? 'is-lock' : ''} ${done ? 'is-done' : ''}`} style={{ alignItems: 'center', marginTop: 28 }}>
        <div className={`panel ${done && battle.winner === 'you' ? 'is-win' : ''}`} style={{ textAlign: 'center' }}>
          <div className="tag">You</div>
          <div style={{ display: 'grid', placeItems: 'center', margin: '12px 0' }}><Slab card={battle.you || you} /></div>
          <strong>${money((battle.you || you).value)}</strong>
        </div>
        <div className="arena-mid">
          <h2>VS</h2>
          {done ? (
            <>
              <p className="price">{battle.winner === 'you' ? 'You take the slab' : 'They take the slab'}</p>
              <button className="btn btn-ghost" onClick={resetBattle}>Run it back</button>
            </>
          ) : (
            <button
              className="btn btn-grad"
              disabled={locking}
              onClick={() => { if (!session) connect(); else lockBattle() }}
            >
              {locking ? 'Locking…' : session ? 'Lock battle' : 'Connect to lock'}
            </button>
          )}
        </div>
        <div className={`panel ${done && battle.winner === 'them' ? 'is-win' : ''}`} style={{ textAlign: 'center' }}>
          <div className="tag">YG Battle Bot</div>
          <div style={{ display: 'grid', placeItems: 'center', margin: '12px 0' }}><Slab card={them} /></div>
          <strong>${money(them.value)}</strong>
        </div>
      </div>
    </>
  )
}

function OfferBox({ listing }) {
  const [bid, setBid] = useState(listing.price)
  const offerListing = useVault((s) => s.offerListing)
  const buyListing = useVault((s) => s.buyListing)
  return (
    <div className="row">
      <button className="btn btn-grad" onClick={() => buyListing(listing.id)}>Buy</button>
      <input className="field field-sm" type="number" min="1" value={bid} onChange={(e) => setBid(e.target.value)} aria-label="Offer amount" />
      <button className="btn btn-ghost" onClick={() => offerListing(listing.id, bid)}>Offer</button>
    </div>
  )
}

export function Marketplace() {
  const listings = useVault((s) => s.listings)
  const session = useVault((s) => s.session)
  const connect = useVault((s) => s.connect)
  const rows = listings.length ? listings : LISTINGS
  return (
    <>
      <span className="tag">Collectible market</span>
      <h1>Marketplace</h1>
      <p className="lead">Live asks from the vault. Demo escrow — USDC leaves your session when a bid clears.</p>
      {!session && <button className="btn btn-blue" style={{ marginBottom: 16 }} onClick={connect}>Connect to trade</button>}
      <table className="table market">
        <thead>
          <tr><th>Card</th><th>Grade</th><th>Value</th><th>Ask</th><th>Seller</th><th></th></tr>
        </thead>
        <tbody>
          {rows.map((l) => {
            const c = l.card || resolveCard(l.cardId)
            return (
              <tr key={l.id}>
                <td>{c.name}</td>
                <td>{c.company} {c.grade}</td>
                <td>${money(c.value)}</td>
                <td className="price">${money(l.price)}</td>
                <td className="muted">{l.seller}</td>
                <td>{session ? <OfferBox listing={l} /> : <span className="muted">Connect</span>}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {!rows.length && <div className="panel" style={{ marginTop: 16 }}>No asks. List a slab from your vault.</div>}
    </>
  )
}

export function Trading() {
  const ownedAll = useVault((s) => s.owned)
  const listings = useVault((s) => s.listings)
  const tradeFor = useVault((s) => s.tradeFor)
  const owned = ownedAll.filter((c) => !c.pledged)
  const [mine, setMine] = useState('')
  const [theirs, setTheirs] = useState('')
  const myCard = owned.find((c) => c.id === mine) || owned[0]
  const listing = listings.find((l) => l.id === theirs) || listings[0]
  const theirCard = listing ? (listing.card || resolveCard(listing.cardId)) : null
  return (
    <>
      <span className="tag">Peer trade</span>
      <h1>Trading</h1>
      <p className="lead">One-for-one against an open ask. No fabricated tape — only the listings sitting in this demo.</p>
      {!owned.length || !listings.length ? (
        <div className="panel" style={{ marginTop: 20 }}>
          <p className="muted">{!owned.length ? 'Rip a pack so you have something to offer.' : 'No open asks to trade into.'}</p>
        </div>
      ) : (
        <div className="grid-2" style={{ marginTop: 24, alignItems: 'start' }}>
          <div className="panel">
            <h3>Your offer</h3>
            <select className="field" value={myCard?.id || ''} onChange={(e) => setMine(e.target.value)}>
              {owned.map((c) => <option key={c.id} value={c.id}>{c.name} · ${money(c.value)}</option>)}
            </select>
            {myCard && <div style={{ display: 'grid', placeItems: 'center', marginTop: 16 }}><Slab card={myCard} /></div>}
          </div>
          <div className="panel">
            <h3>Their ask</h3>
            <select className="field" value={listing?.id || ''} onChange={(e) => setTheirs(e.target.value)}>
              {listings.map((l) => {
                const c = l.card || resolveCard(l.cardId)
                return <option key={l.id} value={l.id}>{c.name} · ask ${money(l.price)}</option>
              })}
            </select>
            {theirCard && <div style={{ display: 'grid', placeItems: 'center', marginTop: 16 }}><Slab card={theirCard} /></div>}
          </div>
        </div>
      )}
      {myCard && listing && (
        <div className="cta-row">
          <button className="btn btn-grad" onClick={() => tradeFor(listing.id, myCard.id)}>Propose trade</button>
        </div>
      )}
    </>
  )
}

export function Lending() {
  const owned = useVault((s) => s.owned)
  const loans = useVault((s) => s.loans)
  const borrow = useVault((s) => s.borrow)
  const repay = useVault((s) => s.repay)
  const free = owned.filter((c) => !c.pledged)
  return (
    <>
      <span className="tag">Card-backed</span>
      <h1>Lending</h1>
      <p className="lead">Borrow 50% LTV against a vaulted slab. Demo rate is a flat 4% to unlock.</p>
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="panel">
          <h3>Borrow</h3>
          {!free.length && <p className="muted">No unpledged slabs. Rip a pack first.</p>}
          {free.map((c) => (
            <div className="loan-row" key={c.id}>
              <div>
                <strong>{c.name}</strong>
                <p className="muted">${money(c.value)} · borrow ${money(c.value * 0.5)}</p>
              </div>
              <button className="btn btn-ghost" onClick={() => borrow(c.id)}>Borrow</button>
            </div>
          ))}
        </div>
        <div className="panel">
          <h3>Open loans</h3>
          {!loans.length && <p className="muted">Nothing drawn.</p>}
          {loans.map((l) => (
            <div className="loan-row" key={l.id}>
              <div>
                <strong>{l.name}</strong>
                <p className="muted">Repay ${money(l.repay)}</p>
              </div>
              <button className="btn btn-gold" onClick={() => repay(l.id)}>Repay</button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function Leaderboard() {
  return (
    <>
      <span className="tag">Season</span>
      <h1>Leaderboard</h1>
      <p className="lead">Empty on purpose. This demo does not invent a season tape.</p>
      <div className="panel empty-board">
        <h3>Waiting for a grail.</h3>
        <p className="muted">When production posts a season, the board fills here. Be the first name if you ship the real one.</p>
      </div>
    </>
  )
}

export function Trust() {
  return (
    <>
      <span className="tag">Provenance</span>
      <h1>Trust layer</h1>
      <p className="lead">The product stays the same. This presentation layer shows how the rails should feel.</p>
      <div className="grid-3" style={{ marginTop: 20 }}>
        {TRUST_POINTS.map((t) => (
          <div className="panel" key={t.title}>
            <h4>{t.title}</h4>
            <p className="muted">{t.body}</p>
          </div>
        ))}
      </div>
    </>
  )
}
