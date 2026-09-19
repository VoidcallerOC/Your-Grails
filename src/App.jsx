import { useEffect, useState } from 'react'
import { pickCard } from './data'
import {
  Home, Packs, PackDetail, Reveal, Collection, CardPage,
  Battles, Marketplace, Trading, Lending, Leaderboard, Trust,
} from './Screens'

function path() {
  const h = window.location.hash.replace(/^#/, '') || '/'
  return h.startsWith('/') ? h : '/' + h
}
function navigate(to) { window.location.hash = to }

function Logo() {
  return (
    <a className="logo" href="#/" aria-label="YourGrails home" onClick={(e) => { e.preventDefault(); navigate('/') }}>
      <img className="logo-mark" src="/brand/header.png" alt="" />
      <span className="wordmark"><strong>YOURGRAILS</strong><span>RIP · BATTLE · GRAIL</span></span>
    </a>
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

export default function App() {
  const [route, setRoute] = useState(path())
  const [session, setSession] = useState(null)
  const [owned, setOwned] = useState([])
  const [phase, setPhase] = useState(null)
  const [pulled, setPulled] = useState(null)
  const [ripTier, setRipTier] = useState('PRO')
  useEffect(() => {
    const on = () => setRoute(path())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const connect = () => setSession({ name: 'Vault 0xYG' })
  const rip = (pack) => {
    setRipTier(pack?.tier || 'PRO')
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
  else if (route === '/reveal') view = <Reveal phase={phase} card={pulled} tier={ripTier} onDone={() => navigate('/packs')} />
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
