/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useRef } from 'react'
import { createPackEngine } from './pack-gl'

export function PackGL({ src, tier = 'pro', pose, ptrRef, ripBeat = null, mode = 'idle', slabSrc = null }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const beatRef = useRef(ripBeat)
  const poseRef = useRef(pose)
  const slabRef = useRef(slabSrc)
  beatRef.current = ripBeat
  poseRef.current = pose
  slabRef.current = slabSrc

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !src) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let engine
    try {
      engine = createPackEngine(canvas, {
        src,
        tier: (tier || 'pro').toLowerCase(),
        pose: poseRef.current,
        ripBeat: beatRef.current,
        mode,
        slabSrc: slabRef.current,
      })
    } catch {
      return undefined
    }
    engine.setReduce(reduce)
    engineRef.current = engine
    let raf
    const loop = (t) => {
      engine.setPointer(ptrRef?.current)
      engine.setBeat(beatRef.current)
      engine.setPose(poseRef.current)
      engine.setSlab(slabRef.current)
      engine.frame(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      engine.dispose()
      engineRef.current = null
    }
  }, [src, tier, mode, ptrRef])

  return (
    <div className={`pack-gl-wrap ${mode === 'rip' ? 'is-rip' : ''}`} ref={wrapRef}>
      <canvas ref={canvasRef} className="pack-gl" />
    </div>
  )
}
