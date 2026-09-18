import { useEffect, useRef, useState } from 'react'
import { PACKS } from './data'

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
    ref.current.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 10}deg) translateZ(${hot ? 18 : 0}px)`
  }
  const reset = () => {
    if (!ref.current) return
    ref.current.style.transform = 'rotateY(-8deg) rotateX(4deg)'
    setHot(false)
  }
  useEffect(() => { reset() }, [])
  const label = pack ? `${pack.name}, ${pack.tier} tier, $${pack.price} USDC` : `${tier} pack`
  const open = () => { if (onOpen && pack) onOpen(pack) }
  return (
    <div
      className={`pack-3d tier-${(tier || 'PRO').toLowerCase()} ${hot ? 'is-hot' : ''}`}
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
      <div className="edge" />
      <div className="face">
        <span className="pack-tier">{tier}</span>
        <div className="brand">YOUR<br/>GRAILS</div>
        <strong>{tier} PACK</strong>
      </div>
      <div className="foil" />
      <div className="shine" />
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
