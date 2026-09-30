/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useRef, useState } from 'react'
import { useNavigate } from './nav'
import { ODDS, PACKS, VAULT, money } from './data'
import { PackArt, PackRail, useLive3D } from './Packs3D'
import { unlockRipAudio } from './RipScene'
import { useVault } from './store'

function VaultStage({ children }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%')
    el.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%')
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--lx', '50%')
    el.style.setProperty('--ly', '36%')
  }
  return <div className="vault" ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</div>
}

export function Slab({ card, large, pose }) {
  const ref = useRef(null)
  const [hot, setHot] = useState(false)
  const live = useLive3D(ref, pose === 'hero'
    ? { yaw: -4, pitch: 3, yawAmp: 1.1, pitchAmp: 0.6, period: 7.8, bob: 5.8, bobAmp: 1.2, phase: 0.8 }
    : pose === 'emerge'
      ? { yaw: 6, pitch: 7, yawAmp: 0.8, pitchAmp: 0.5, period: 7.2, bob: 5.2, bobAmp: 0.9, phase: 0.4 }
      : { yaw: -8, pitch: 5, yawAmp: 1.4, pitchAmp: 0.7, period: 7.4, bob: 5.4, bobAmp: 1.1, phase: 0.9 }
  )
  if (card?.photo) {
    return (
      <div className={`slab-stage ${large ? 'is-lg' : ''} ${pose === 'hero' ? 'is-hero' : ''} ${pose === 'emerge' ? 'is-emerge' : ''}`}>
        <span className="obj-shadow" aria-hidden="true" />
        <div
          className={`slab-3d ${large ? 'is-lg' : ''} ${hot ? 'is-hot' : ''}`}
          ref={ref}
          onMouseMove={(e) => live.aim(e, hot)}
          onMouseEnter={() => setHot(true)}
          onMouseLeave={() => { setHot(false); live.clear() }}
        >
          <div className="slab-case">
            <img src={card.photo} alt={`${card.name} ${card.company} ${card.grade}`} />
            <span className="slab-glass" aria-hidden="true" />
            <span className="slab-bevel" aria-hidden="true" />
          </div>
          <span className="slab-side slab-side-r" aria-hidden="true" />
          <span className="slab-side slab-side-l" aria-hidden="true" />
          <span className="slab-side slab-side-t" aria-hidden="true" />
          <span className="slab-side slab-side-b" aria-hidden="true" />
        </div>
        {pose === 'hero' && (
          <div className="grail-meta">
            <span className="grade-chip">{card.company} {card.grade}</span>
            <span className="value-chip">VALUE ${money(card.value)}</span>
          </div>
        )}
      </div>
    )
  }
  return (
    <div className={`slab-stage slab-plain ${large ? 'is-lg' : ''}`}>
      <span className="obj-shadow" aria-hidden="true" />
      <div className="slab-plain-case" role="img" aria-label={`${card.name}, ${card.company} ${card.grade}. Photo not yet available.`}>
        <div className="slab-plain-label">
          <div><strong>{card.name}</strong><span>{card.set}</span></div>
          <b>{card.company}<i>{card.grade}</i></b>
        </div>
        <div className="slab-plain-body"><span>Photo coming soon</span></div>
      </div>
    </div>
  )
}

export function Home() {
  const navigate = useNavigate()
  const session = useVault((s) => s.session)
  const connect = useVault((s) => s.connect)
  const hero = VAULT.find((c) => c.id === 'charizard') || VAULT[1]
  const start = () => {
    if (!session) connect()
    navigate({ to: '/packs' })
  }
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Rip packs.<br />Battle players.<br /><em>Own the grail.</em></h1>
          <p className="lead">Every pack holds a real graded card. Open one, keep it, battle with it, trade it, or sell it back for 90% within five days.</p>
          <div className="cta-row">
            <button className="btn btn-grad" onClick={start}>Open a pack</button>
            <button className="btn btn-ghost" onClick={() => navigate({ to: '/battles' })}>Battle</button>
          </div>
        </div>
        <VaultStage>
          <div className="hero-mini pro">
            <span className="obj-shadow" aria-hidden="true" />
            <PackArt tier="PRO" pose="hero-left" />
          </div>
          <div className="hero-card-wrap">
            <Slab card={hero} pose="hero" />
          </div>
          <div className="hero-mini master">
            <span className="obj-shadow" aria-hidden="true" />
            <PackArt tier="MASTER" pose="hero-right" />
          </div>
        </VaultStage>
      </section>

      <div className="section-head">
        <div>
          <h2>Pick a pack.</h2>
          <p className="muted" style={{ marginTop: 8, maxWidth: 560 }}>Each one opens into a real graded card you can keep, list, battle, or sell back.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate({ to: '/packs' })}>View all packs →</button>
      </div>
      <div className="featured-packs"><PackRail featured /></div>

      <div className="trust-row proof-row">
        <div className="trust-card">
          <h4>Fair draw</h4>
          <p className="muted">Odds are published, and every draw is independently verified.</p>
        </div>
        <div className="trust-card">
          <h4>Graded &amp; vaulted</h4>
          <p className="muted">PSA · BGS · CGC, fully insured</p>
        </div>
        <div className="trust-card">
          <h4>Sell back</h4>
          <p className="muted">Don't love the pull? Get 90% back within five days.</p>
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2>How it works</h2>
        </div>
      </div>
      <div className="steps">
        <div className="step-card">
          <span className="step-num">01</span>
          <h3>Buy a Pack</h3>
          <p className="muted">Choose a pack and pay with your balance.</p>
        </div>
        <div className="step-card">
          <span className="step-num">02</span>
          <h3>Open it</h3>
          <p className="muted">Tear it open and see which graded card you pulled.</p>
        </div>
        <div className="step-card">
          <span className="step-num">03</span>
          <h3>Keep, battle or sell</h3>
          <p className="muted">Hold it in your collection, battle other collectors, trade it, or sell it back for 90%.</p>
        </div>
      </div>

      <section className="close-vault">
        <h2>Ready when you are.</h2>
        <div className="cta-row">
          <button className="btn btn-grad" onClick={() => navigate({ to: '/packs/$id', params: { id: PACKS[0].id } })}>Open a Pro Pack</button>
          <button className="btn btn-ghost" onClick={() => navigate({ to: '/packs/$id', params: { id: PACKS[1].id } })}>Open a Master Pack</button>
        </div>
      </section>
    </>
  )
}

export function Packs() {
  return (
    <section className="packs-page">
      <div className="packs-heading">
        <h1>Sealed packs.<br />Real slabs.</h1>
        <p className="lead">Every tier draws from the same graded PSA, BGS and CGC cards. Odds are published: 75 / 20 / 4 / 1.</p>
      </div>
      <PackRail listing />
    </section>
  )
}

export function PackDetail({ id }) {
  const navigate = useNavigate()
  const session = useVault((s) => s.session)
  const usdc = useVault((s) => s.usdc)
  const connect = useVault((s) => s.connect)
  const startRip = useVault((s) => s.startRip)
  const pack = PACKS.find((p) => p.id === id) || PACKS[0]
  const featuredCard = VAULT.find((c) => c.id === 'charizard') || VAULT[0]
  const canAfford = session && usdc >= pack.price
  const onRip = () => {
    if (!session) { connect(); return }
    unlockRipAudio()
    if (!startRip(pack)) return
    navigate({ to: '/reveal' })
  }
  return (
    <div className="pack-detail">
      <div className="detail-display" role="group" aria-label={`${pack.name} and a featured graded card from the vault`}>
        <div className="detail-pack-art">
          <span className="detail-object-label">SEALED / {pack.tier}</span>
          <span className="obj-shadow" aria-hidden="true" />
          <PackArt tier={pack.tier} />
          <span className="detail-object-name">{pack.tier === 'PRO' ? 'THE CHASE' : 'THE VAULT'}</span>
        </div>
        <div className="detail-slab-art">
          <span className="detail-object-label">FEATURED VAULT SLAB</span>
          <Slab card={featuredCard} large pose="hero" />
          <span className="detail-object-name">{featuredCard.name} · {featuredCard.company} {featuredCard.grade}</span>
        </div>
      </div>
      <div className="pack-detail-copy">
        <span className="detail-tier">{pack.tier}{pack.hot ? ' · Featured' : ''}</span>
        <h1>{pack.name}</h1>
        <p className="lead">{pack.blurb}</p>
        <div className="detail-value-row">
          <div><span className="detail-label">PACK PRICE</span><strong className="price">${pack.price.toFixed(2)} <small>USDC</small></strong></div>
          <div><span className="detail-label">EXPECTED PULL VALUE</span><strong>${pack.ev.toFixed(2)}</strong></div>
        </div>
        <p className="muted detail-buyback">5-day 90% buyback window</p>
        <div className="odds" aria-label="Published odds">
          {ODDS.map((o) => (
            <div className="odds-row" key={o.label}>
              <span>{o.label}</span>
              <span className="odds-bar"><i style={{ width: `${o.pct}%` }} /></span>
              <span>{o.pct}%</span>
            </div>
          ))}
        </div>
        <button className="btn btn-grad" onClick={onRip} disabled={session && !canAfford}>
          {!session ? 'Sign in to open' : canAfford ? 'Open this pack' : 'Need more USDC'}
        </button>
        {session && <p className="muted" style={{ marginTop: 10 }}>Balance ${money(usdc)} USDC</p>}
      </div>
    </div>
  )
}
