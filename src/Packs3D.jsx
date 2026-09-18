import { useEffect, useRef, useState } from 'react'
import { PACKS } from './data'

function useLive3D(elRef, opts) {
  const ptr = useRef({ x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 })
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      if (elRef.current) elRef.current.style.transform = `rotateY(${opts.yaw}deg) rotateX(8deg)`
      return
    }
    let raf
    const tick = (t) => {
      const el = elRef.current
      if (!el) { raf = requestAnimationFrame(tick); return }
      const p = ptr.current
      p.x += (p.tx - p.x) * 0.08
      p.y += (p.ty - p.y) * 0.08
      p.z += (p.tz - p.z) * 0.08
      const s = t * 0.001
      const yaw = opts.yaw + Math.sin(s / opts.period + opts.phase) * opts.yawAmp + p.x * 16
      const pitch = opts.pitch + Math.cos(s / (opts.period * 1.18) + opts.phase) * opts.pitchAmp + p.y * -10
      const lift = Math.sin(s / opts.bob + opts.phase) * opts.bobAmp + p.z
      el.style.transform = `translateY(${lift.toFixed(2)}px) rotateY(${yaw.toFixed(2)}deg) rotateX(${pitch.toFixed(2)}deg)`
      el.style.setProperty('--foil', `${50 + Math.sin(s / 2.4 + opts.phase) * 28 + p.x * 20}%`)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return {
    aim: (e, hot) => {
      const el = elRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      ptr.current.tx = (e.clientX - r.left) / r.width - 0.5
      ptr.current.ty = (e.clientY - r.top) / r.height - 0.5
      ptr.current.tz = hot ? 16 : 0
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
      {[0,45,90,135,180,225,270,315].map((a) => {
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

function PackArt({ tier }) {
  return <Pack3D tier={tier} decorative />
}

function Pack3D({ tier, pack, onOpen, decorative }) {
  const ref = useRef(null)
  const [hot, setHot] = useState(false)
  const t = (tier || 'PRO').toLowerCase()
  const master = t === 'master'
  const live = useLive3D(ref, master
    ? { yaw: 22, pitch: 7, yawAmp: 10, pitchAmp: 4, period: 3.4, bob: 2.6, bobAmp: 7, phase: 1.7 }
    : { yaw: -24, pitch: 8, yawAmp: 9, pitchAmp: 3.5, period: 2.8, bob: 2.2, bobAmp: 6, phase: 0.2 }
  )
  const label = pack ? `${pack.name}, ${pack.tier} tier, $${pack.price} USDC` : `${tier} pack`
  const open = () => { if (onOpen && pack) onOpen(pack) }
  return (
    <div
      className={`pack-3d tier-${t} ${hot ? 'is-hot' : ''}`}
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
      <PackFace tier={tier} />
      <div className="pk grain" aria-hidden="true" />
      <div className="pk seal seal-top" aria-hidden="true" />
      <div className="pk seal seal-bot" aria-hidden="true" />
      <div className="pk back" aria-hidden="true"><span>YG</span></div>
      <div className="pk side side-r" aria-hidden="true" />
      <div className="pk side side-l" aria-hidden="true" />
      <div className="pk lid" aria-hidden="true" />
      <div className="pk foil" aria-hidden="true" />
      <div className="pk shine" aria-hidden="true" />
    </div>
  )
}

function PackRail({ onOpen }) {
  return (
    <div className="pack-rail">
      {PACKS.map((p) => (
        <div className="pack-slot" key={p.id}>
          <Pack3D tier={p.tier} pack={p} onOpen={onOpen} />
          <div className="pack-meta">
            <div className="row" style={{ justifyContent: 'center' }}>
              <span className="badge">{p.tier}</span>
              {p.hot && <span className="badge">HOT</span>}
            </div>
            <h3>{p.name}</h3>
            <p className="muted">Expected pull value ${p.ev.toFixed(2)}</p>
            <div className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
              <span className="price">${p.price.toFixed(2)} USDC</span>
              <button className="btn btn-grad" onClick={() => onOpen(p)}>Open</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export { PackArt, Pack3D, PackRail, useLive3D }
