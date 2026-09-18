import { CHAINS, ODDS, PACKS, VAULT } from './data'
import { PackArt, PackRail } from './Packs3D'

function navigate(to) { window.location.hash = to }

export function Slab({ card, large }) {
  const style = { background: `radial-gradient(circle at 30% 20%, #fff2, transparent 40%), ${card.art || '#222'}` }
  return (
    <div className="slab" style={large ? { width: 260 } : undefined}>
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
        <div>
          <h1>Rip packs.<br/>Battle players.<br/><em>Own the grail.</em></h1>
          <p className="lead">Real, graded cards sealed in digital packs. Reveal them on-chain, stake them in head-to-head battles, or cash out instantly with our 90% buyback.</p>
          <div className="cta-row">
            <button className="btn btn-grad" onClick={() => session ? navigate('/packs') : onConnect()}>Get Started →</button>
            <button className="btn btn-ghost" onClick={() => navigate('/battles')}>Enter the Arena</button>
          </div>
          <div className="trust-row">
            <div className="trust-card"><div className="ico">✦</div><h4>Fair random draw</h4><p className="muted">Independently verified on-chain</p></div>
            <div className="trust-card"><div className="ico">◈</div><h4>Graded & vaulted</h4><p className="muted">PSA · BGS · CGC, fully insured</p></div>
            <div className="trust-card"><div className="ico">⚡</div><h4>Instant settle</h4><p className="muted">Sell back for up to 90%</p></div>
          </div>
        </div>
        <div className="stage">
          <div className="hero-card-wrap"><Slab card={VAULT[1]} large /></div>
          <div className="float-chip" style={{ left: 8, bottom: 86 }}><div className="tag">Just pulled</div>Lugia · PSA 10</div>
          <div className="float-chip" style={{ right: 0, bottom: 18 }}><div className="tag">Instant buyback</div>Up to 90% USDC</div>
        </div>
      </section>
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
      <p className="notice" style={{ marginTop: 10 }}>Live product figures shown as published on yourgrails.com. This demo does not invent additional volume.</p>
      <div className="section-head">
        <div>
          <span className="badge">FEATURED DROPS</span>
          <h2>Pick a pack. Reveal a real card.</h2>
          <p className="muted">Current featured packs from the vault. CSS 3D skins — not official foil artwork.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/packs')}>View all packs →</button>
      </div>
      <PackRail onOpen={(p) => navigate('/packs/' + p.id)} />
      <div className="section-head"><div><span className="tag">New here?</span><h2>Three steps. Real cards.</h2></div></div>
      <div className="steps">
        <div className="step"><div className="n">01 · BUY A PACK</div><h3>Choose your tier</h3><p className="muted">Purchase a sealed pack with USDC from any supported chain.</p></div>
        <div className="step"><div className="n">02 · RIP IT</div><h3>Tear the pack</h3><p className="muted">Reveal your real graded card — instantly, with a fair random draw.</p></div>
        <div className="step"><div className="n">03 · CASH OUT OR SHIP</div><h3>Your call</h3><p className="muted">90% instant buyback, list it, battle it, or hold it in the vault.</p></div>
      </div>
    </>
  )
}

export function Packs() {
  return (
    <>
      <span className="tag">Vault drops</span>
      <h1 style={{ letterSpacing: '-1px' }}>Sealed packs. Real slabs.</h1>
      <p className="lead">Two live tiers only. Pro and Master. No additional products.</p>
      <div style={{ marginTop: 28 }}>
        <PackRail onOpen={(p) => navigate('/packs/' + p.id)} />
      </div>
      <div className="panel" style={{ marginTop: 24 }}>
        <h4>Value-tier odds</h4>
        <div className="grid-4" style={{ marginTop: 12 }}>
          {ODDS.map((o) => <div key={o.label}><b>{o.pct}%</b><div className="muted">{o.label}</div></div>)}
        </div>
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
        <p>Price <strong>${pack.price} USDC</strong> · EV ${pack.ev.toFixed(2)}</p>
        <div className="cta-row">
          <button className="btn btn-grad" onClick={() => onRip(pack)} disabled={!session}>Rip this pack</button>
          {!session && <span className="muted">Connect to enter the vault first.</span>}
        </div>
      </div>
    </div>
  )
}
