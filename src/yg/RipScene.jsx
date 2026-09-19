/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { PackGL } from './PackGL'
import { money } from './data'
import { useVault } from './store'

const BEATS = [
  { at: 0, beat: 'enter' },
  { at: 700, beat: 'wind' },
  { at: 1500, beat: 'hit' },
  { at: 1720, beat: 'tear' },
  { at: 3200, beat: 'bloom' },
]

export const RIP_MS = {
  verify: 4600,
  show: 6400,
  reducedVerify: 280,
  reducedShow: 720,
}

const ART = {
  pro: '/packs/pro-chase-front.webp',
  master: '/packs/master-vault-front.webp',
}

let audioCtx = null

export function unlockRipAudio() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  if (!audioCtx) audioCtx = new AC({ latencyHint: 'interactive' })
  if (audioCtx.state === 'suspended') audioCtx.resume()
}

function noiseBuffer(seconds) {
  const sr = audioCtx.sampleRate
  const len = Math.floor(sr * seconds)
  const buf = audioCtx.createBuffer(1, len, sr)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buf
}

function envGain(t0, peak, attack, hold, release) {
  const g = audioCtx.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + attack)
  g.gain.setValueAtTime(peak, t0 + hold)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + release)
  return g
}

function playRipSound() {
  if (!audioCtx) unlockRipAudio()
  if (!audioCtx) return
  const t0 = audioCtx.currentTime
  const dest = audioCtx.destination
  const noise = noiseBuffer(0.85)
  const paper = audioCtx.createBufferSource()
  paper.buffer = noise
  const bp = audioCtx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.setValueAtTime(2000, t0)
  bp.frequency.exponentialRampToValueAtTime(700, t0 + 0.55)
  bp.Q.value = 0.7
  const pg = envGain(t0, 0.2, 0.02, 0.12, 0.7)
  paper.connect(bp)
  bp.connect(pg)
  pg.connect(dest)
  paper.start(t0)
  paper.stop(t0 + 0.75)
}

function playSlideSound() {
  if (!audioCtx) return
  const t0 = audioCtx.currentTime
  const dest = audioCtx.destination
  const noise = noiseBuffer(0.55)
  const src = audioCtx.createBufferSource()
  src.buffer = noise
  const bp = audioCtx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.setValueAtTime(820, t0)
  bp.frequency.exponentialRampToValueAtTime(380, t0 + 0.35)
  const g = envGain(t0, 0.12, 0.03, 0.1, 0.48)
  src.connect(bp)
  bp.connect(g)
  g.connect(dest)
  src.start(t0)
  src.stop(t0 + 0.5)
  const thud = audioCtx.createOscillator()
  thud.type = 'sine'
  thud.frequency.setValueAtTime(64, t0 + 0.18)
  thud.frequency.exponentialRampToValueAtTime(30, t0 + 0.42)
  const tg = envGain(t0 + 0.18, 0.16, 0.01, 0.04, 0.28)
  thud.connect(tg)
  tg.connect(dest)
  thud.start(t0 + 0.18)
  thud.stop(t0 + 0.46)
}

export function RipScene({ tier = 'PRO', card, children }) {
  const navigate = useNavigate()
  const setPhase = useVault((s) => s.setPhase)
  const finishRip = useVault((s) => s.finishRip)
  const key = (tier || 'PRO').toLowerCase() === 'master' ? 'master' : 'pro'
  const [beat, setBeat] = useState('enter')
  const torn = useRef(false)
  const slid = useRef(false)
  const epic = card?.rarity === 'Epic'

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setBeat('bloom')
      const a = window.setTimeout(() => { setBeat('hold'); setPhase('verify') }, RIP_MS.reducedVerify)
      const b = window.setTimeout(() => { setBeat('reveal'); finishRip() }, RIP_MS.reducedShow)
      return () => { clearTimeout(a); clearTimeout(b) }
    }
    const timers = [
      ...BEATS.map(({ at, beat: next }) => window.setTimeout(() => setBeat(next), at)),
      window.setTimeout(() => { setBeat('hold'); setPhase('verify') }, RIP_MS.verify),
      window.setTimeout(() => { setBeat('reveal'); finishRip() }, RIP_MS.show),
    ]
    return () => timers.forEach(clearTimeout)
  }, [setPhase, finishRip])

  useEffect(() => {
    if (beat === 'tear' && !torn.current) {
      torn.current = true
      playRipSound()
    }
    if (beat === 'bloom' && !slid.current) {
      slid.current = true
      playSlideSound()
    }
  }, [beat])

  const showCard = beat === 'reveal'

  return (
    <div className={`rip-stage is-${key} ${epic ? 'is-epic' : ''}`} data-beat={beat} aria-live="polite">
      {!showCard && (
        <div className="rip-pack is-gl">
          <PackGL src={ART[key]} tier={key} mode="rip" ripBeat={beat} slabSrc={card?.photo} />
        </div>
      )}
      {showCard && <div className="rip-final">{children}</div>}
      <div className="rip-copy">
        {beat !== 'reveal' && beat !== 'hold' && (
          <>
            <h2>Opening pack…</h2>
            <p className="muted">One pull. Vaulted and graded.</p>
          </>
        )}
        {beat === 'hold' && (
          <>
            <h2>Verifying pull…</h2>
            <p className="muted">Demo verification beat. Production uses Chainlink VRF on Avalanche.</p>
          </>
        )}
        {beat === 'reveal' && card && (
          <>
            <div className="tag">{epic ? 'Grail pull' : 'You own this'}</div>
            <h2>{card.name}</h2>
            <p>{card.company} {card.grade} · {card.rarity} · ${money(card.value)}</p>
            <div className="cta-row" style={{ justifyContent: 'center' }}>
              <button className="btn btn-gold" onClick={() => navigate({ to: '/collection' })}>Add to vault</button>
              <button className="btn btn-ghost" onClick={() => navigate({ to: '/packs' })}>Rip another</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
