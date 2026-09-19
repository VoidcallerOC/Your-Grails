/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useRef, useState } from 'react'
import { PACKS } from './data'
import { useNavigate } from './nav'
import { PackGL } from './PackGL'

const PACK_ART = {
  pro: {
    front: ['/packs/pro-chase-front.webp', '/packs/pro-chase-front.png'],
    foil: ['/packs/pro-chase-foil.webp', '/packs/pro-chase-foil.png'],
    normal: ['/packs/pro-chase-normal.webp', '/packs/pro-chase-normal.png'],
  },
  master: {
    front: ['/packs/master-vault-front.webp', '/packs/master-vault-front.png'],
    foil: ['/packs/master-vault-foil.webp', '/packs/master-vault-foil.png'],
    normal: ['/packs/master-vault-normal.webp', '/packs/master-vault-normal.png'],
  },
}

function resolveFirst(candidates) {
  return new Promise((resolve) => {
    let i = 0
    const tryNext = () => {
      if (i >= candidates.length) { resolve(null); return }
      const src = candidates[i++]
      const img = new Image()
      img.onload = () => resolve(src)
      img.onerror = tryNext
      img.src = src
    }
    tryNext()
  })
}

const artCache = {}
function loadPackArt(key) {
  if (!artCache[key]) {
    const cfg = PACK_ART[key]
    artCache[key] = Promise.all([
      resolveFirst(cfg.front),
      resolveFirst(cfg.foil),
      resolveFirst(cfg.normal),
    ]).then(([front, foil, normal]) => ({ front, foil, normal }))
  }
  return artCache[key]
}

function usePackArt(tier) {
  const key = (tier || 'PRO').toLowerCase() === 'master' ? 'master' : 'pro'
  const [art, setArt] = useState({ front: null, foil: null, normal: null, ready: false })
  useEffect(() => {
    let alive = true
    loadPackArt(key).then((resolved) => { if (alive) setArt({ ...resolved, ready: true }) })
    return () => { alive = false }
  }, [key])
  return art
}

function packPose(tier, pose) {
  if (pose === 'hero-left') {
    return { yaw: -26, pitch: 8, yawAmp: 4.5, pitchAmp: 1.8, period: 3.4, bob: 2.6, bobAmp: 3.6, phase: 0.18 }
  }
  if (pose === 'hero-right') {
    return { yaw: 26, pitch: 8, yawAmp: 4.5, pitchAmp: 1.8, period: 3.7, bob: 2.8, bobAmp: 3.6, phase: 1.62 }
  }
  const master = (tier || '').toLowerCase() === 'master'
  return master
    ? { yaw: 22, pitch: 8, yawAmp: 6, pitchAmp: 2.4, period: 3.4, bob: 2.6, bobAmp: 5, phase: 1.7 }
    : { yaw: -22, pitch: 9, yawAmp: 6, pitchAmp: 2.4, period: 2.8, bob: 2.2, bobAmp: 5, phase: 0.2 }
}

function useLive3D(elRef, opts, { css = true } = {}) {
  const ptr = useRef({ x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 })
  const optsRef = useRef(opts)
  optsRef.current = opts
  const cssRef = useRef(css)
  cssRef.current = css
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      const o = optsRef.current
      if (cssRef.current && elRef.current) elRef.current.style.transform = `rotateY(${o.yaw}deg) rotateX(${o.pitch}deg)`
      return
    }
    let raf
    const tick = (t) => {
      const el = elRef.current
      const o = optsRef.current
      if (!el) { raf = requestAnimationFrame(tick); return }
      const p = ptr.current
      p.x += (p.tx - p.x) * 0.08
      p.y += (p.ty - p.y) * 0.08
      p.z += (p.tz - p.z) * 0.08
      if (cssRef.current) {
        const s = t * 0.001
        const yaw = o.yaw + Math.sin(s / o.period + o.phase) * o.yawAmp + p.x * 16
        const pitch = o.pitch + Math.cos(s / (o.period * 1.18) + o.phase) * o.pitchAmp + p.y * -10
        const lift = Math.sin(s / o.bob + o.phase) * o.bobAmp + p.z
        el.style.transform = `translateY(${lift.toFixed(2)}px) rotateY(${yaw.toFixed(2)}deg) rotateX(${pitch.toFixed(2)}deg)`
        el.style.setProperty('--foil', `${50 + Math.sin(s / 2.4 + o.phase) * 28 + p.x * 20}%`)
      } else {
        el.style.transform = ''
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [elRef])
  return {
    ptr,
    aim: (e, hot) => {
      const el = elRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      ptr.current.tx = (e.clientX - r.left) / r.width - 0.5
      ptr.current.ty = (e.clientY - r.top) / r.height - 0.5
      ptr.current.tz = hot ? 14 : 0
    },
    clear: () => { ptr.current.tx = 0; ptr.current.ty = 0; ptr.current.tz = 0 }
  }
}

function ChaseMark() {
  return (
    <svg className="emblem" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="pg" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#f3e8ff" />
          <stop offset="45%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#4c1d95" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="#c4b5fd" strokeWidth="1.2" opacity=".5" />
      <circle cx="60" cy="60" r="44" fill="none" stroke="#8b5cf6" strokeWidth=".8" strokeDasharray="3 5" />
      <path d="M60 16 L68 48 L100 48 L74 66 L84 98 L60 78 L36 98 L46 66 L20 48 L52 48 Z" fill="url(#pg)" opacity=".9" />
      <rect x="42" y="38" width="36" height="50" rx="3" fill="none" stroke="#ede9fe" strokeWidth="1.4" />
      <text x="60" y="68" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff">YG</text>
    </svg>
  )
}

function VaultMark() {
  return (
    <svg className="emblem" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="none" stroke="#e8c14a" strokeWidth="1.6" />
      <circle cx="60" cy="60" r="46" fill="none" stroke="#8a6a1c" strokeWidth=".7" />
      <circle cx="60" cy="60" r="34" fill="#120e06" stroke="#e8c14a" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="10" fill="#e8c14a" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180
        return <line key={a} x1="60" y1="60" x2={60 + Math.cos(r) * 30} y2={60 + Math.sin(r) * 30} stroke="#c9a227" strokeWidth="1.4" />
      })}
    </svg>
  )
}

function PackFace({ tier }) {
  const master = (tier || '').toUpperCase() === 'MASTER'
  if (master) {
    return (
      <div className="pk face face-master">
        <VaultMark />
        <p className="mark">YOURGRAILS</p>
        <span className="stamp">MASTER · THE VAULT</span>
      </div>
    )
  }
  return (
    <div className="pk face face-pro">
      <ChaseMark />
      <p className="mark">YOURGRAILS</p>
      <span className="stamp">PRO · THE CHASE</span>
    </div>
  )
}

function PackArt({ tier, pose }) {
  return <Pack3D tier={tier} decorative pose={pose} />
}

function Pack3D({ tier, pack, onOpen, decorative, pose }) {
  const ref = useRef(null)
  const [hot, setHot] = useState(false)
  const t = (tier || 'PRO').toLowerCase()
  const art = usePackArt(t)
  const hasArt = !!art.front
  const live = useLive3D(ref, packPose(tier, pose), { css: !hasArt })
  const label = pack ? `${pack.name}, ${pack.tier} tier, $${pack.price} USDC` : `${tier} pack`
  const open = () => { if (onOpen && pack) onOpen(pack) }
  return (
    <div
      className={`pack-3d tier-${t} ${art.ready && hasArt ? 'has-art is-gl' : ''} ${hot ? 'is-hot' : ''}`}
      ref={ref}
      role={decorative ? undefined : 'button'}
      tabIndex={decorative ? -1 : 0}
      aria-label={decorative ? undefined : label}
      onMouseMove={(e) => live.aim(e, hot)}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => { setHot(false); live.clear() }}
      onFocus={() => setHot(true)}
      onBlur={() => { setHot(false); live.clear() }}
      onClick={decorative ? undefined : open}
      onKeyDown={(e) => { if (!decorative && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open() } }}
    >
      {!art.ready ? (
        <div className={`pk face face-pending face-${t === 'master' ? 'master' : 'pro'}`} aria-hidden="true" />
      ) : hasArt ? (
        <PackGL src={art.front} tier={t} pose={packPose(tier, pose)} ptrRef={live.ptr} />
      ) : (
        <PackFace tier={tier} />
      )}
      <div className="pk grain" aria-hidden="true" />
      <div className="pk seal seal-top" aria-hidden="true" />
      <div className="pk seal seal-bot" aria-hidden="true" />
      <div className="pk back" aria-hidden="true"><span>YG</span></div>
      <div className="pk side side-r" aria-hidden="true" />
      <div className="pk side side-l" aria-hidden="true" />
      <div className="pk lid" aria-hidden="true" />
      <div className="pk base" aria-hidden="true" />
      <div className="pk env-light" aria-hidden="true" />
      <div className="pk foil" aria-hidden="true" />
      <div className="pk shine" aria-hidden="true" />
    </div>
  )
}

function PackRail({ onOpen }) {
  const navigate = useNavigate()
  const open = onOpen || ((p) => navigate({ to: '/packs/$id', params: { id: p.id } }))
  return (
    <div className="pack-rail">
      {PACKS.map((p) => (
        <div className="pack-slot" key={p.id}>
          <span className="obj-shadow" aria-hidden="true" />
          <Pack3D tier={p.tier} pack={p} onOpen={open} />
          <div className="pack-meta">
            <div className="row" style={{ justifyContent: 'center' }}>
              <span className="badge">{p.tier}</span>
              {p.hot && <span className="badge">HOT</span>}
            </div>
            <h3>{p.name}</h3>
            <p className="muted">Expected pull value ${p.ev.toFixed(2)}</p>
            <div className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
              <span className="price">${p.price.toFixed(2)} USDC</span>
              <button className="btn btn-grad" onClick={() => open(p)}>Open</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export { PackArt, Pack3D, PackRail, useLive3D }
