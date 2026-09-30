/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useRouterState } from './nav'
import { useVault } from './store'
import { money } from './data'

const LINKS = [
  ['/packs', 'Packs'],
  ['/battles', 'Battles'],
  ['/marketplace', 'Marketplace'],
  ['/collection', 'Collection'],
]
const INTERIOR_PATHS = ['/collection', '/battles', '/marketplace', '/trading', '/lending', '/leaderboard', '/trust']

function Logo({ onNavigate }) {
  return (
    <Link to="/" className="logo" aria-label="YourGrails home" onClick={onNavigate}>
      <img className="logo-mark" src="/brand/header.png" alt="" />
    </Link>
  )
}

export function Layout({ children }) {
  const path = useRouterState({ select: (s) => s.location.pathname })
  const interior = INTERIOR_PATHS.includes(path)
  const packPage = path.startsWith('/packs')
  const session = useVault((s) => s.session)
  const usdc = useVault((s) => s.usdc)
  const connect = useVault((s) => s.connect)
  const addUsdc = useVault((s) => s.addUsdc)
  const toast = useVault((s) => s.toast)
  const [hydrated, setHydrated] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  useEffect(() => setHydrated(true), [])
  const live = hydrated && session
  return (
    <div className={`app ${path === '/' ? 'home-app' : ''} ${packPage ? 'pack-app' : ''} ${interior ? `interior-app route-${path.slice(1)}` : ''}`}>
      <div className="beta">Private beta · Help us improve the vault.</div>
      <header className={`nav ${navOpen ? 'nav-open' : ''}`}>
        <Logo onNavigate={() => setNavOpen(false)} />
        <nav id="mobile-navigation" className={`nav-links ${navOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {LINKS.map(([href, label]) => (
            <Link key={href} to={href} className={path.startsWith(href) ? 'active' : ''} onClick={() => setNavOpen(false)}>{label}</Link>
          ))}
        </nav>
        <div className="nav-end">
          {live && (
            <button type="button" className="usdc-chip" title="Add 2,500 demo USDC" onClick={() => addUsdc(2500)}>
              ${money(usdc)} USDC
            </button>
          )}
          {live ? (
            <Link to="/collection" className="btn btn-ghost">{session.name}</Link>
          ) : (
            <button className="btn btn-blue" onClick={connect}>Sign in</button>
          )}
          <button
            type="button"
            className="nav-toggle"
            aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={navOpen}
            aria-controls="mobile-navigation"
            onClick={() => setNavOpen((open) => !open)}
          >
            {navOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </header>
      <main className="page"><div className="wrap">{children}</div></main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <div>Graded collectibles · PSA · BGS · CGC · 90% buyback within 5 days.</div>
          <nav className="row footer-links" aria-label="More">
            <Link to="/trading">Trading</Link>
            <Link to="/lending">Lending</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/trust">How it's protected</Link>
          </nav>
        </div>
      </footer>
      {toast && <div className="toast" role="status">{toast.msg}</div>}
    </div>
  )
}
