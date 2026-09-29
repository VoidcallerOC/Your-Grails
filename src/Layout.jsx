/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useState } from 'react'
import { Link, useRouterState } from './nav'
import { useVault } from './store'
import { money } from './data'

const LINKS = [
  ['/packs', 'Packs'],
  ['/battles', 'Battles'],
  ['/marketplace', 'Marketplace'],
  ['/trading', 'Trading'],
  ['/lending', 'Lending'],
  ['/collection', 'Collection'],
  ['/leaderboard', 'Leaderboard'],
]
const INTERIOR_PATHS = ['/collection', '/battles', '/marketplace', '/trading', '/lending', '/leaderboard', '/trust']

function Logo() {
  return (
    <Link to="/" className="logo" aria-label="YourGrails home">
      <img className="logo-mark" src="/brand/header.png" alt="" />
    </Link>
  )
}

export function Layout({ children }) {
  const path = useRouterState({ select: (s) => s.location.pathname })
  const interior = INTERIOR_PATHS.includes(path)
  const session = useVault((s) => s.session)
  const usdc = useVault((s) => s.usdc)
  const connect = useVault((s) => s.connect)
  const addUsdc = useVault((s) => s.addUsdc)
  const toast = useVault((s) => s.toast)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  useEffect(() => {
    const active = document.querySelector('.nav-links a.active')
    if (active && window.innerWidth <= 900) active.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [path])
  const live = hydrated && session
  return (
    <div className={`app ${path === '/' ? 'home-app' : ''} ${interior ? `interior-app route-${path.slice(1)}` : ''}`}>
      <div className="beta">Private beta · Help us improve the vault.</div>
      <header className="nav">
        <Logo />
        <nav className="nav-links">
          {LINKS.map(([href, label]) => (
            <Link key={href} to={href} className={path.startsWith(href) ? 'active' : ''}>{label}</Link>
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
            <button className="btn btn-blue" onClick={connect}>Connect</button>
          )}
        </div>
      </header>
      <main className="page"><div className="wrap">{children}</div></main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <div>Vaulted collectibles · PSA · BGS · CGC · 90% buyback.</div>
          <div className="row">
            <Link to="/trust">Trust</Link>
            <span>USDC · Circle CCTP</span>
          </div>
        </div>
      </footer>
      {toast && <div className="toast" role="status">{toast.msg}</div>}
    </div>
  )
}
