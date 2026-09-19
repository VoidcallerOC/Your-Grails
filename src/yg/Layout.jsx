/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
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

function Logo() {
  return (
    <Link to="/" className="logo" aria-label="YourGrails home">
      <img className="logo-mark" src="/brand/header.png" alt="" />
    </Link>
  )
}

export function Layout({ children }) {
  const path = useRouterState({ select: (s) => s.location.pathname })
  const session = useVault((s) => s.session)
  const usdc = useVault((s) => s.usdc)
  const connect = useVault((s) => s.connect)
  const addUsdc = useVault((s) => s.addUsdc)
  const toast = useVault((s) => s.toast)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const live = hydrated && session
  return (
    <div className="app">
      <div className="beta">We're in beta. Help us improve by reporting any bugs or issues. Demo vault — not production.</div>
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
          <div>YourGrails demo presentation layer. PSA · BGS · CGC vaulted cards. 90% buyback.</div>
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
