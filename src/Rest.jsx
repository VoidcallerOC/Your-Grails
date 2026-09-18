import { LISTINGS, VAULT } from './data'
import { Slab } from './Home'

function navigate(to) { window.location.hash = to }

export function Reveal({ phase, card, onDone }) {
  return (
    <div className="reveal">
      {phase === 'rip' && (<><div className="rip pack-pro"><div className="pack-face"><div className="pack-title">YOUR<br/>GRAILS</div></div></div><h2>Tearing the seal…</h2></>)}
      {phase === 'verify' && (<><h2>Verifying fair draw</h2><p className="muted">Demo verification beat. Production uses Chainlink VRF on Avalanche.</p></>)}
      {phase === 'show' && card && (
        <>
          <div style={{ display: 'grid', placeItems: 'center', marginBottom: 18 }}><Slab card={card} large /></div>
          <div className="tag">You own this</div>
          <h2>{card.name}</h2>
          <p>{card.company} {card.grade} · {card.rarity} · ${Number(card.value).toLocaleString()}</p>
          <div className="cta-row" style={{ justifyContent: 'center' }}>
            <button className="btn btn-gold" onClick={() => navigate('/collection')}>Add to vault</button>
            <button className="btn btn-ghost" onClick={onDone}>Rip another</button>
          </div>
        </>
      )}
    </div>
  )
}

export function Collection({ owned }) {
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

export function CardPage({ id, owned }) {
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

export function Battles({ owned }) {
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

export function Marketplace() {
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

export function Trading() {
  return (<><span className="tag">Peer trade</span><h1>Trading</h1><div className="panel"><p className="muted">No fabricated trade tape.</p></div></>)
}
export function Lending() {
  return (<><span className="tag">Card-backed</span><h1>Lending</h1><div className="grid-2" style={{ marginTop: 20 }}><div className="panel"><h3>Borrow</h3></div><div className="panel"><h3>Lend</h3></div></div></>)
}
export function Leaderboard() {
  return (<><span className="tag">Season</span><h1>Leaderboard</h1><div className="panel">Waiting for a grail. Empty on purpose.</div></>)
}
export function Trust() {
  return (<><span className="tag">Provenance</span><h1>Trust layer</h1><div className="grid-3" style={{ marginTop: 20 }}>{['Chainlink VRF on Avalanche', 'Circle CCTP USDC', 'CardNFT tied to cert data', 'Marketplace escrow', '5-day 90% buyback', 'Physical ship coming soon'].map((t) => <div className="panel" key={t}><h4>{t}</h4></div>)}</div></>)
}
