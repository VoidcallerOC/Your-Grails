/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useRef, useState } from 'react'
import { useNavigate } from './nav'
import { ShieldCheck, Sparkles, Zap, Package, Truck, Swords, BadgeDollarSign } from 'lucide-react'
import { CHAINS, LIVE_STATS, ODDS, PACKS, RECENT_PULLS, VAULT, money, pickCard } from './data'
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
    ? { yaw: -4, pitch: 4, yawAmp: 4.2, pitchAmp: 1.8, period: 3.6, bob: 2.9, bobAmp: 5.5, phase: 0.8 }
    : pose === 'emerge'
      ? { yaw: 8, pitch: 9, yawAmp: 2.2, pitchAmp: 1.2, period: 4.2, bob: 3.4, bobAmp: 2, phase: 0.4 }
      : { yaw: -10, pitch: 6, yawAmp: 6, pitchAmp: 2.4, period: 3.1, bob: 2.5, bobAmp: 4, phase: 0.9 }
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
  const style = { background: `radial-gradient(circle at 30% 20%, #fff2, transparent 40%), ${card.art || '#222'}` }
  return (
    <div className={large ? 'slab slab-lg' : 'slab'}>
      <span className="grade-pill">{card.company} {card.grade}</span>
      <div className="inner">
        <div className="slab-art" style={style}>{card.name}</div>
        <div className="slab-meta"><span>{card.set}</span><span>{card.rarity}</span></div>
      </div>
      <span className="value-pill">VALUE ${money(card.value)}</span>
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
          <p className="lead">Real, graded cards sealed in digital packs. Reveal them on-chain, stake them in head-to-head battles, or cash out instantly with our 90% buyback.</p>
          <div className="cta-row">
            <button className="btn btn-grad" onClick={start}>Get Started →</button>
            <button className="btn btn-ghost" onClick={() => navigate({ to: '/battles' })}>Enter the Arena</button>
          </div>
        </div>
        <VaultStage>
          <div className="atmos" />
          <div className="haze" />
          <div className="orbits" />
          <div className="orbits rev" />
          <div className="vault-floor" aria-hidden="true" />
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

      <div className="pay-row">
        <div>
          <h4>Pay in USDC, from any chain</h4>
          <p className="muted">One balance, six networks — we bridge it for you. Circle CCTP.</p>
        </div>
        <div className="chain-list">
          {CHAINS.map((c) => <span key={c} className="chain-pill">{c}</span>)}
        </div>
      </div>

      <div className="trust-row">
        <div className="trust-card">
          <div className="ico"><Sparkles size={18} strokeWidth={1.75} /></div>
          <h4>Fair random draw</h4>
          <p className="muted">Independently verified on-chain</p>
        </div>
        <div className="trust-card">
          <div className="ico"><ShieldCheck size={18} strokeWidth={1.75} /></div>
          <h4>Graded & vaulted</h4>
          <p className="muted">PSA · BGS · CGC, fully insured</p>
        </div>
        <div className="trust-card">
          <div className="ico"><Zap size={18} strokeWidth={1.75} /></div>
          <h4>Instant settle</h4>
          <p className="muted">Sell back for up to 90%</p>
        </div>
      </div>

      <p className="notice" style={{ marginTop: 28 }}>Published live-site figures — not this demo’s volume.</p>
      <div className="stats">
        {LIVE_STATS.map((s) => (
          <div className="stat" key={s.label}>
            <label>{s.label}</label>
            <b>{s.value}</b>
            <p className="muted">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="section-head">
        <div>
          <span className="badge">FEATURED DROPS</span>
          <h2>Pick a pack. Reveal a real card.</h2>
          <p className="muted" style={{ marginTop: 8, maxWidth: 560 }}>Current featured packs from the vault. Each one opens into a real graded card you can keep, list, battle, ship, or sell back.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate({ to: '/packs' })}>View all packs →</button>
      </div>
      <PackRail />

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...RECENT_PULLS, ...RECENT_PULLS].map((p, i) => (
            <span key={i}>{p.name} pulled · ${money(p.value)}</span>
          ))}
        </div>
      </div>

      <div className="section-head">
        <div>
          <span className="badge">NEW HERE?</span>
          <h2>Three steps. Real cards.</h2>
          <p className="muted" style={{ marginTop: 8 }}>From wallet to grail in under a minute.</p>
        </div>
      </div>
      <div className="steps">
        <div className="step-card">
          <span className="step-num">01</span>
          <div className="ico"><Package size={18} strokeWidth={1.75} /></div>
          <h3>Buy a Pack</h3>
          <p className="muted">Choose your tier and purchase a sealed pack with USDC.</p>
        </div>
        <div className="step-card">
          <span className="step-num">02</span>
          <div className="ico"><Sparkles size={18} strokeWidth={1.75} /></div>
          <h3>Rip It</h3>
          <p className="muted">Tear the pack. Reveal your real graded card — instantly.</p>
        </div>
        <div className="step-card">
          <span className="step-num">03</span>
          <div className="ico"><BadgeDollarSign size={18} strokeWidth={1.75} /></div>
          <h3>Cash Out or Ship</h3>
          <p className="muted">Cash out, trade, or ship it home. 90% instant buyback, no friction.</p>
        </div>
      </div>

      <div className="explain">
        <div className="panel">
          <div className="ico"><ShieldCheck size={18} strokeWidth={1.75} /></div>
          <h3>Real Cards</h3>
          <p className="muted">PSA, BGS, CGC graded cards stored securely in our vault.</p>
        </div>
        <div className="panel">
          <div className="ico"><Truck size={18} strokeWidth={1.75} /></div>
          <h3>Ship Anytime</h3>
          <p className="muted">Request physical delivery of any card you own.</p>
        </div>
        <div className="panel">
          <div className="ico"><BadgeDollarSign size={18} strokeWidth={1.75} /></div>
          <h3>90% Buyback</h3>
          <p className="muted">Don't like your pull? Sell it back within 5 days.</p>
        </div>
        <div className="panel">
          <div className="ico"><Swords size={18} strokeWidth={1.75} /></div>
          <h3>Battle-Ready</h3>
          <p className="muted">Put your pulls on the line. Winner takes the pot.</p>
        </div>
      </div>

      <section className="close-vault">
        <span className="tag">The grail is sealed.</span>
        <h2>Real, graded cards inside every pack.</h2>
        <p className="lead">Open it, list it, ship it, or cash out — your call.</p>
        <div className="close-flags">
          <span>PSA · BGS · CGC</span>
          <span>Vaulted & graded</span>
          <span>90% buyback</span>
          <span>Within 5 days</span>
          <span>Ship anytime</span>
          <span>Or hold on-chain</span>
        </div>
        <p className="muted" style={{ marginTop: 16 }}>Chase rate 1 in 24</p>
        <div className="cta-row" style={{ marginTop: 22 }}>
          <button className="btn btn-grad" onClick={() => navigate({ to: '/packs/$id', params: { id: PACKS[0].id } })}>Rip a Pro Pack</button>
          <button className="btn btn-ghost" onClick={() => navigate({ to: '/packs/$id', params: { id: PACKS[1].id } })}>Open Master</button>
        </div>
      </section>
    </>
  )
}

export function Packs() {
  return (
    <>
      <span className="tag">Vault drops</span>
      <h1>Sealed packs. Real slabs.</h1>
      <p className="lead">Published ToS odds: 75 / 20 / 4 / 1. Same vaulted PSA · BGS · CGC cards in every tier.</p>
      <PackRail />
    </>
  )
}

export function PackDetail({ id }) {
  const navigate = useNavigate()
  const session = useVault((s) => s.session)
  const usdc = useVault((s) => s.usdc)
  const connect = useVault((s) => s.connect)
  const startRip = useVault((s) => s.startRip)
  const pack = PACKS.find((p) => p.id === id) || PACKS[0]
  const canAfford = session && usdc >= pack.price
  const onRip = () => {
    if (!session) { connect(); return }
    unlockRipAudio()
    if (!startRip(pack)) return
    navigate({ to: '/reveal' })
  }
  return (
    <div className="grid-2" style={{ alignItems: 'center' }}>
      <div className="pack-stage">
        <span className="obj-shadow" aria-hidden="true" />
        <PackArt tier={pack.tier} />
      </div>
      <div>
        <span className="badge">{pack.tier}{pack.hot ? ' · HOT' : ''}</span>
        <h1>{pack.name}</h1>
        <p className="lead">{pack.blurb}</p>
        <p className="price" style={{ fontSize: 22, margin: '12px 0 4px' }}>${pack.price.toFixed(2)} USDC</p>
        <p className="muted">Expected pull value ${pack.ev.toFixed(2)} · 5-day 90% buyback</p>
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
          {!session ? 'Connect to rip' : canAfford ? 'Rip this pack' : 'Need more USDC'}
        </button>
        {session && <p className="muted" style={{ marginTop: 10 }}>Vault balance ${money(usdc)} USDC</p>}
      </div>
    </div>
  )
}
