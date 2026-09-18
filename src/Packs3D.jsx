import { useEffect, useRef, useState } from 'react'
import { PACKS } from './data'

const IDLE = 'rotateY(-26deg) rotateX(8deg)'

function PackArt({ tier }) {
  return <Pack3D tier={tier} decorative />
}

function Pack3D({ tier, pack, onOpen, decorative }) {
  const ref = useRef(null)
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [hot, setHot] = useState(false)
  const onMove = (e) => {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = `rotateY(${-26 + x * 18}deg) rotateX(${8 - y * 10}deg) translateZ(${hot ? 16 : 0}px)`
  }
  const reset = () => {
    if (!ref.current) return
    ref.current.style.transform = IDLE
    setHot(false)
  }
  useEffect(() => { reset() }, [])
  const label = pack ? `${pack.name}, ${pack.tier} tier, $${pack.price} USDC` : `${tier} pack`
  const open = () => { if (onOpen && pack) onOpen(pack) }
  const t = (tier || 'PRO').toLowerCase()
  return (
    <div
      className={`pack-3d tier-${t} ${hot ? 'is-hot' : ''}`}
      ref={ref}
      role={decorative ? undefined : 'button'}
      tabIndex={decorative ? -1 : 0}
      aria-label={decorative ? undefined : label}
      onMouseMove={onMove}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={reset}
      onFocus={() => setHot(true)}
      onBlur={reset}
      onClick={decorative ? undefined : open}
      onKeyDown={(e) => { if (!decorative && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open() } }}
    >
      <div className="pk face">
        <span className="pack-tier">{tier}</span>
        <div className="brand">YOUR<br/>GRAILS</div>
        <strong>{tier} PACK</strong>
        <span className="art-slot">Artwork slot</span>
      </div>
      <div className="pk back" aria-hidden="true" />
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

export { PackArt, Pack3D, PackRail }
