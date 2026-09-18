import { useEffect, useState } from 'react'
import { CHAINS, LISTINGS, ODDS, PACKS, VAULT, pickCard } from './data'

function path() {
  const h = window.location.hash.replace(/^#/, '') || '/'
  return h.startsWith('/') ? h : '/' + h
}
function navigate(to) { window.location.hash = to }

function Logo() {
  return (
    <a className="logo" href="#/" onClick={(e) => { e.preventDefault(); navigate('/') }}>
      <svg className="logo-mark" viewBox="0 0 56 56" aria-hidden="true">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff4b0" />
            <stop offset=".5" stopColor="#f5c542" />
            <stop offset="1" stopColor="#b8860b" />
          </linearGradient>
        </defs>
        <path d="M8 14 L28 6 L48 14 L44 42 L28 50 L12 42 Z" fill="#1a1030" stroke="url(#g)" strokeWidth="2" />
        <text x="28" y="34" textAnchor="middle" fontFamily="Impact, sans-serif" fontSize="16" fill="url(#g)">YG</text>
      </svg>
      <span className="wordmark">
        <strong>YOURGRAILS</strong>
        <span>RIP · BATTLE · GRAIL</span>
      </span>
    </a>
  )
}

function Slab({ card, large }) {
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

function PackArt({ tier }) {
  const cls = tier === 'MASTER' ? 'pack-master' : 'pack-pro'
  return (
    <div className={`pack-stage ${cls}`}>
      <div className="pack-face">
        <span className="pack-tier">{tier}</span>
        <div>
          <div className="pack-title">YOUR<br/>GRAILS</div>
          <div className="pack-sub">RIP · BATTLE · GRAIL</div>
        </div>
        <strong>{tier} PACK</strong>
      </div>
    </div>
  )
}

function Layout({ session, onConnect, children }) {
  const p = path()
  const links = [['/packs','Packs'],['/battles','Battles'],['/marketplace','Marketplace'],['/trading','Trading'],['/lending','Lending'],['/collection','Collection'],['/leaderboard','Leaderboard']]
  return (
    <div className="app">
      <div className="beta">We're in beta. Help us improve by reporting any bugs or issues. Demo vault — not production.</div>
      <header className="nav">
        <Logo />
        <nav className="nav-links">
          {links.map(([href, label]) => (
            <a key={href} href={'#' + href} className={p.startsWith(href) ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate(href) }}>{label}</a>
          ))}
        </nav>
        {session ? (
          <button className="btn btn-ghost" onClick={() => navigate('/collection')}>{session.name}</button>
        ) : (
          <button className="btn btn-blue" onClick={onConnect}>Connect</button>
        )}
      </header>
      <main className="page"><div className="wrap">{children}</div></main>
      <footer className="footer">
        <div className="wrap">
          <div>YourGrails demo presentation layer. PSA · BGS · CGC vaulted cards. 90% buyback.</div>
          <div className="row">
            <a href="#/trust" onClick={(e) => { e.preventDefault(); navigate('/trust') }}>Trust</a>
            <span>USDC · Circle CCTP</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Home({ session, onConnect }) {
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
          <p className="muted">Current featured packs from the vault.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/packs')}>View all packs →</button>
      </div>
      <div className="grid-2">
        {PACKS.map((p) => (
          <article key={p.id} className="pack-card">
            <div className="art" style={{ background: p.tier === 'MASTER' ? '#1a1408' : '#12081f' }}>
              <div style={{ transform: 'scale(.72)' }}><PackArt tier={p.tier} /></div>
            </div>
            <div className="body">
              <div className="row"><span className="badge">{p.tier}</span>{p.hot && <span className="badge">HOT</span>}</div>
              <h3>{p.name}</h3>
              <p className="muted">Expected pull value ${p.ev.toFixed(2)}</p>
              <div className="row" style={{ marginTop: 12 }}>
                <span className="price">${p.price.toFixed(2)} USDC</span>
                <span className="grow" />
                <button className="btn btn-grad" onClick={() => navigate('/packs/' + p.id)}>Open</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="section-head"><div><span className="tag">New here?</span><h2>Three steps. Real cards.</h2></div></div>
      <div className="steps">
        <div className="step"><div className="n">01 · BUY A PACK</div><h3>Choose your tier</h3><p className="muted">Purchase a sealed pack with USDC from any supported chain.</p></div>
        <div className="step"><div className="n">02 · RIP IT</div><h3>Tear the pack</h3><p className="muted">Reveal your real graded card — instantly, with a fair random draw.</p></div>
        <div className="step"><div className="n">03 · CASH OUT OR SHIP</div><h3>Your call</h3><p className="muted">90% instant buyback, list it, battle it, or hold it in the vault.</p></div>
      </div>
    </>
  )
}

function Packs() {
  return (
    <>
      <span className="tag">Vault drops</span>
      <h1 style={{ letterSpacing: '-1px' }}>Sealed packs. Real slabs.</h1>
      <p className="lead">Two live tiers. Odds: 75% Common, 20% Uncommon, 4% Rare, 1% Epic.</p>
      <div className="grid-2" style={{ marginTop: 28 }}>
        {PACKS.map((p) => (
          <article key={p.id} className="pack-card">
            <div className="art" style={{ background: p.tier === 'MASTER' ? '#1a1408' : '#12081f' }}>
              <div style={{ transform: 'scale(.75)' }}><PackArt tier={p.tier} /></div>
            </div>
            <div className="body">
              <h3>{p.name}</h3>
              <p className="muted">{p.blurb}</p>
              <div className="row"><strong>${p.price} USDC</strong><span className="grow" /><button className="btn btn-grad" onClick={() => navigate('/packs/' + p.id)}>Open pack</button></div>
            </div>
          </article>
        ))}
      </div>
      <div className="panel" style={{ marginTop: 24 }}>
        <h4>Value-tier odds</h4>
        <div className="grid-4" style={{ marginTop: 12 }}>{ODDS.map((o) => <div key={o.label}><b>{o.pct}%</b><div className="muted">{o.label}</div></div>)}</div>
      </div>
    </>
  )
}

function PackDetail({ id, session, onRip }) {
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

function Reveal({ phase, card, onDone }) {
  return (
    <div className="reveal">
      {phase === 'rip' && (<><div className="rip pack-pro"><div className="pack-face"><div className="pack-title">YOUR<br/>GRAILS</div></div></div><h2>Tearing the seal…</h2></>)}
      {phase === 'verify' && (<><h2>Verifying fair draw</h2><p className="muted">Demo verification beat. Production uses Chainlink VRF on Avalanche.</p></>)}
      {phase === 'show' && card && (<><div style={{ display: 'grid', placeItems: 'center', marginBottom: 18 }}><Slab card={card} large /></div><div className="tag">You own this</div><h2>{card.name}</h2><p>{card.company} {card.grade} · {card.rarity} · ${Number(card.value).toLocaleString()}</p><div className="cta-row" style={{ justifyContent: 'center' }}><button className="btn btn-gold" onClick={() => navigate('/collection')}>Add to vault</button><button className="btn btn-ghost" onClick={onDone}>Rip another</button></div></>)}
    </div>
  )
}

function Collection({ owned }) {
  return (
    <>
      <span className="tag">My Grails</span>
      <h1>Your vault</h1>
      {!owned.length && <div className="panel" style={{ marginTop: 20 }}>No slabs yet. Rip a pack to seed the vault.</div>}
      <div className="grid-3" style={{ marginTop: 24 }}>
        {owned.map((c) => (
          <div key={c.id} className="panel" style={{ display: 'grid', placeItems: 'center' }}>
            <Slab card={c} />
            <div style={{ width: '100%', marginTop: 12 }}>
              <strong>{c.name}</strong>
              <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => navigate('/card/' + c.id)}>Inspect slab</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function CardPage({ id, owned }) {
  const card = owned.find((c) => c.id === id) || VAULT.find((c) => c.id === id) || VAULT[0]
  return (
    <div className="grid-2" style={{ alignItems: 'center' }}>
      <div style={{ display: 'grid', placeItems: 'center' }}><Slab card={card} large /></div>
      <div>
        <span className="tag">{card.company} {card.grade}</span>
        <h1>{card.name}</h1>
        <h3>${Number(card.value).toLocaleString()} market value</h3>
        <div className="row">
          <button className="btn btn-gold">Sell back 90%</button>
          <button className="btn btn-ghost" onClick={() => navigate('/marketplace')}>List</button>
          <button className="btn btn-ghost" onClick={() => navigate('/battles')}>Battle</button>
        </div>
      </div>
    </div>
  )
}

function Battles({ owned }) {
  const you = owned[0] || VAULT[4]
  const them = VAULT[3]
  return (
    <>
      <span className="tag">Arena</span>
      <h1>Player vs player</h1>
      <div className="grid-3" style={{ alignItems: 'center', marginTop: 28 }}>
        <div className="panel" style={{ textAlign: 'center' }}><div className="tag">You</div><div style={{ display: 'grid', placeItems: 'center', margin: '12px 0' }}><Slab card={you} /></div><strong>${Number(you.value).toLocaleString()}</strong></div>
        <div style={{ textAlign: 'center' }}><h2>VS</h2><button className="btn btn-grad">Lock battle</button></div>
        <div className="panel" style={{ textAlign: 'center' }}><div className="tag">YG Battle Bot</div><div style={{ display: 'grid', placeItems: 'center', margin: '12px 0' }}><Slab card={them} /></div><strong>${Number(them.value).toLocaleString()}</strong></div>
      </div>
    </>
  )
}

function Marketplace() {
  return (
    <>
      <span className="tag">Collectible market</span>
      <h1>Marketplace</h1>
      <table className="table">
        <thead><tr><th>Card</th><th>Grade</th><th>Value</th><th>Ask</th><th>Seller</th><th></th></tr></thead>
        <tbody>
          {LISTINGS.map((l) => {
            const c = VAULT.find((v) => v.id === l.cardId)
            return (<tr key={l.id}><td>{c.name}</td><td>{c.company} {c.grade}</td><td>${c.value.toLocaleString()}</td><td>${l.price.toLocaleString()}</td><td className="muted">{l.seller}</td><td><button className="btn btn-ghost">Offer</button></td></tr>)
          })}
        </tbody>
      </table>
    </>
  )
}

function Trading() {
  return (<><span className="tag">Peer trade</span><h1>Trading</h1><div className="panel"><p className="muted">No fabricated trade tape.</p></div></>)
}
function Lending() {
  return (<><span className="tag">Card-backed</span><h1>Lending</h1><div className="grid-2" style={{ marginTop: 20 }}><div className="panel"><h3>Borrow</h3></div><div className="panel"><h3>Lend</h3></div></div></>)
}
function Leaderboard() {
  return (<><span className="tag">Season</span><h1>Leaderboard</h1><div className="panel">Waiting for a grail. Empty on purpose.</div></>)
}
function Trust() {
  return (<><span className="tag">Provenance</span><h1>Trust layer</h1><div className="grid-3" style={{ marginTop: 20 }}>{['Chainlink VRF on Avalanche','Circle CCTP USDC','CardNFT tied to cert data','Marketplace escrow','5-day 90% buyback','Physical ship coming soon'].map((t) => <div className="panel" key={t}><h4>{t}</h4></div>)}</div></>)
}

export default function App() {
  const [route, setRoute] = useState(path())
  const [session, setSession] = useState(null)
  const [owned, setOwned] = useState([])
  const [phase, setPhase] = useState(null)
  const [pulled, setPulled] = useState(null)
  useEffect(() => {
    const on = () => setRoute(path())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const connect = () => setSession({ name: 'Vault 0xYG' })
  const rip = () => {
    navigate('/reveal')
    setPhase('rip')
    setTimeout(() => setPhase('verify'), 1100)
    setTimeout(() => {
      const card = pickCard()
      setPulled(card)
      setOwned((o) => [card, ...o])
      setPhase('show')
    }, 2200)
  }
  const parts = route.split('/').filter(Boolean)
  let view = <Home session={session} onConnect={connect} />
  if (route === '/packs') view = <Packs />
  else if (parts[0] === 'packs' && parts[1]) view = <PackDetail id={parts[1]} session={session} onRip={rip} />
  else if (route === '/reveal') view = <Reveal phase={phase} card={pulled} onDone={() => navigate('/packs')} />
  else if (route === '/collection') view = <Collection owned={owned} />
  else if (parts[0] === 'card') view = <CardPage id={parts[1]} owned={owned} />
  else if (route === '/battles') view = <Battles owned={owned} />
  else if (route === '/marketplace') view = <Marketplace />
  else if (route === '/trading') view = <Trading />
  else if (route === '/lending') view = <Lending />
  else if (route === '/leaderboard') view = <Leaderboard />
  else if (route === '/trust') view = <Trust />
  return <Layout session={session} onConnect={connect}>{view}</Layout>
}
