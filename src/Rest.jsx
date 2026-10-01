/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useState } from 'react'
import { Link, useNavigate } from './nav'
import { TRUST_POINTS, VAULT, daysLeft, money, resolveCard } from './data'
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
  const owned = useVault((s) => s.owned)
  const usdc = useVault((s) => s.usdc)
  const total = owned.reduce((n, c) => n + Number(c.value), 0)
  const cards = [...owned].sort((a, b) => b.value - a.value)
  return (
    <>
      <h1>Your collection</h1>
      <dl className="cabinet-stats">
        <div><dt>Slabs</dt><dd>{owned.length}</dd></div>
        <div><dt>Market value</dt><dd>${money(total)}</dd></div>
        <div><dt>Balance</dt><dd>${money(usdc)} <small>USDC</small></dd></div>
      </dl>
      {!owned.length && (
        <div className="cabinet-empty">
          <p>Your cabinet is empty.</p>
          <Link to="/packs" className="btn btn-grad">Open a pack</Link>
        </div>
      )}
      <ul className="cabinet-shelf">
        {cards.map((c) => {
          const left = daysLeft(c.buybackUntil)
          return (
            <li key={c.id}>
              <Link to={{ to: '/card/$id', params: { id: c.id } }} className={`cabinet-item ${c.pledged ? 'is-pledged' : ''}`}>
                <Slab card={c} still />
                <span className="cabinet-cap">
                  <strong>{c.name}</strong>
                  <span className="cabinet-meta"><b>{c.company} {c.grade}</b><span>{c.rarity}</span></span>
                  <span className="cabinet-val">${money(c.value)}</span>
                  {c.pledged && <span className="cabinet-flag">Pledged for a loan</span>}
                  {!c.pledged && left > 0 && <span className="cabinet-flag">Sell back for 90% · {left}d left</span>}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
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
            Sell back for 90%
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
            <label htmlFor="ask">List on the marketplace</label>
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
  useEffect(() => { if (!useVault.getState().battle.them) resetBattle() }, [resetBattle])
  const playable = owned.filter((c) => !c.pledged)
  const you = battle.you || playable.find((c) => c.id === selectedBattleId) || playable[0] || VAULT.find((c) => c.id === 'magikarp')
  const them = battle.them || VAULT.find((c) => c.id === 'dragonite')
  const locking = battle.status === 'lock'
  const done = battle.status === 'result'
  const isOwned = owned.some((c) => c.id === you.id) || (done && battle.isOwned)
  const chance = Math.min(99, Math.max(1, Math.round((Number(you.value) / (Number(you.value) + Number(them.value))) * 100)))
  const youWon = done && battle.winner === 'you'
  return (
    <>
      <h1>Battle the house</h1>
      <p className="lead">Put one of your slabs up against a house slab. The higher-value card is favored, but upsets happen.</p>
      {!owned.length && <p className="notice">You haven't opened a pack yet, so you're playing with a house card. Open a pack to battle with one of your own.</p>}
      {playable.length > 1 && !done && !locking && (
        <div className="row battle-picker" role="group" aria-label="Choose your slab">
          {playable.map((c) => (
            <button
              key={c.id}
              className={`chip ${you?.id === c.id ? 'is-on' : ''}`}
              aria-pressed={you?.id === c.id}
              onClick={() => { setSelectedBattle(c.id); resetBattle() }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
      <div className={`arena ${locking ? 'is-lock' : ''} ${done ? 'is-done' : ''}`}>
        <section className={`arena-side ${done ? (youWon ? 'is-winner' : 'is-loser') : ''}`} aria-label="Your slab">
          <h2 className="arena-label">Your slab</h2>
          <Slab card={you} still />
          <strong className="arena-name">{you.name}</strong>
          <span className="arena-val">${money(you.value)}</span>
        </section>
        <div className="arena-mid">
          <span className="arena-chance"><b>{chance}%</b> your chance</span>
          <span className="arena-bar" aria-hidden="true"><i style={{ width: `${chance}%` }} /></span>
          {done ? (
            <>
              <p className="arena-result" role="status">{youWon ? `You won ${them.name}` : isOwned ? `You lost ${you.name}` : 'House wins — demo stake'}</p>
              <button className="btn btn-ghost" onClick={resetBattle}>Battle again</button>
            </>
          ) : (
            <button
              className="btn btn-grad"
              disabled={locking}
              onClick={() => { if (!session) connect(); else lockBattle() }}
            >
              {locking ? 'Battling…' : session ? 'Start battle' : 'Sign in to battle'}
            </button>
          )}
        </div>
        <section className={`arena-side ${done ? (youWon ? 'is-loser' : 'is-winner') : ''}`} aria-label="House slab">
          <h2 className="arena-label">House slab</h2>
          <Slab card={them} still />
          <strong className="arena-name">{them.name}</strong>
          <span className="arena-val">${money(them.value)}</span>
        </section>
      </div>
      {!done && (
        <dl className="arena-stakes">
          <div><dt>If you win</dt><dd>You keep {them.name} (${money(them.value)}).</dd></div>
          <div><dt>If you lose</dt><dd>{isOwned ? `${you.name} leaves your collection.` : 'Nothing — this is a demo card.'}</dd></div>
        </dl>
      )}
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
      <h1>Trading</h1>
      <p className="lead">Swap one of your slabs for one that's listed. Only real listings in this demo appear here.</p>
      {!owned.length || !listings.length ? (
        <div className="panel" style={{ marginTop: 20 }}>
          <p className="muted">{!owned.length ? 'Open a pack so you have something to offer.' : 'No open asks to trade into.'}</p>
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
      <h1>Lending</h1>
      <p className="lead">Borrow up to 50% of a slab's value and keep the card. Demo rate is a flat 4%.</p>
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="panel">
          <h3>Borrow</h3>
          {!free.length && <p className="muted">No slabs available. Open a pack first.</p>}
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
      <h1>How it's protected</h1>
      <p className="lead">The physical card is the proof. Here is how every pull is verified, stored and paid out.</p>
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
