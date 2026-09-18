import { useEffect, useRef } from 'react'
import { PACKS } from './data'
import { Pack3D } from './PackGL'

// Live 3D tilt loop used by the card Slab (CSS-transform based). The packs use
// the genuine WebGL asset in PackGL; cards stay lightweight CSS.
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

function PackArt({ tier }) {
  return <Pack3D tier={tier} decorative />
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
