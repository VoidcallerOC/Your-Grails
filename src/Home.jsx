import { useRef } from 'react'
import { CHAINS, ODDS, PACKS, VAULT } from './data'
import { PackArt, PackRail } from './Packs3D'

function navigate(to) { window.location.hash = to }

function VaultStage({ children }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%')
    el.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%')
  }
  return <div className="vault" ref={ref} onMouseMove={onMove}>{children}</div>
}

export function Slab({ card, large }) {
  const style = { background: `radial-gradient(circle at 30% 20%, #fff2, transparent 40%), ${card.art || '#222'}` }
  return (
    <div className={large ? 'slab slab-lg' : 'slab'}>
      <span className="grade-pill">{card.company} {card.grade}</span>
      <div className="inner">
        <div className="slab-art" style={style}>{card.name}</div>
        <div className="slab-meta"><span>{card.set}</span><span>{card.rarity}</span></div>
      </div>
      <span className="value-pill">VALUE ${Number(card.value).toLocaleString()}</span>
    </div>
  )
}

export function Home({ session, onConnect }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Rip packs.<br/>Battle players.<br/><em>Own the grail.</em></h1>
          <p className="lead">Real, graded cards sealed in digital packs. Reveal them on-chain, stake them in head-to-head battles, or cash out instantly with our 90% buyback.</p>
          <div className="cta-row">
            <button className="btn btn-grad" onClick={() => session ? navigate('/packs') : onConnect()}>Get Started →</button>
            <button className="btn btn-ghost" onClick={() => navigate('/battles')}>Enter the Arena</button>
          </div>
        </div>
        <VaultStage>
          <div className="atmos" />
          <div className="haze" />
          <div className="orbits" />
          <div className="orbits rev" />
          <div className="hero-mini pro"><PackArt tier="PRO" /></div>
          <div className="hero-mini master"><PackArt tier="MASTER" /></div>
          <div className="hero-card-wrap"><Slab card={VAULT[1]} /></div>
        </VaultStage>
      </section>
      <div className="trust-row">
        <div className="trust-card"><div className="ico">✦</div><h4>Fair random draw</h4><p className="muted">Independently verified on-chain</p></div>
        <div className="trust-card"><div className="ico">◈</div><h4>Graded & vaulted</h4><p className="muted">PSA · BGS · CGC, fully insured</p></div>
        <div className="trust-card"><div className="ico">⚡</div><h4>Instant settle</h4><p className="muted">Sell back for up to 90%</p></div>
      </div>
      <div className="panel" style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div><strong>Pay in USDC, from any chain</strong><p className="muted">One balance, six networks — we bridge it for you</p></div>
        <div className="row">{CHAINS.map((c) => <span key={c} className="badge">{c}</span>)}</div>
      </div>
      <div className="stats">
        <div className="stat"><label>Chase cards pulled</label><b>116</b><span className="muted">18 grails · a pack ripped every 5 hr</span></div>
        <div className="stat"><label>Packs + battle volume</label><b>$814K</b><span className="muted">12K packs ripped</span></div>
        <div className="stat"><label>Top pull this week</label><b>$1.3K</b><span className="muted">Shining Magikarp</span></div>
        <div className="stat"><label>Arena & market</label><b>1.0K battles</b><span className="muted">61 active listings</span></div>
      </div>
      <p className="notice" style={{ marginTop: 10 }}>Live product figures shown as published on yourgrails.com.</p>
      <div className="section-head">
        <div>
          <span className="badge">FEATURED DROPS</span>
          <h2>Pick a pack. Reveal a real card.</h2>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/packs')}>View all packs →</button>
      </div>
      <PackRail onOpen={(p) => navigate('/packs/' + p.id)} />
    </>
  )
}

export function Packs() {
  return (
    <>
      <span className="tag">Vault drops</span>
      <h1>Sealed packs. Real slabs.</h1>
      <p className="lead">Two live tiers only. Pro and Master.</p>
      <div style={{ marginTop: 28 }}>
        <PackRail onOpen={(p) => navigate('/packs/' + p.id)} />
      </div>
    </>
  )
}

export function PackDetail({ id, session, onRip }) {
  const pack = PACKS.find((p) => p.id === id) || PACKS[0]
  return (
    <div className="grid-2" style={{ alignItems: 'center' }}>
      <div style={{ display: 'grid', placeItems: 'center' }}><PackArt tier={pack.tier} /></div>
      <div>
        <span className="badge">{pack.tier}</span>
        <h1>{pack.name}</h1>
        <p className="lead">{pack.blurb}</p>
        <p>Price <strong>${pack.price} USDC</strong></p>
        <div className="cta-row">
          <button className="btn btn-grad" onClick={() => onRip(pack)} disabled={!session}>Rip this pack</button>
          {!session && <span className="muted">Connect first.</span>}
        </div>
      </div>
    </div>
  )
}
