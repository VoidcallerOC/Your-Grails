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
    setTimeout(() => setPhase('verify'), 2100)
    setTimeout(() => {
      const card = pickCard()
      setPulled(card)
      setOwned((o) => [card, ...o])
      setPhase('show')
    }, 3200)
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
