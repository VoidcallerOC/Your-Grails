import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/*
 * Genuine 3D pack assets (Three.js / react-three-fiber).
 *
 * The approved production artwork (public/packs/*-front.webp) is the design
 * blueprint. Here it becomes part of a real physical object:
 *   - a puffed foil-pouch geometry with crimped top/bottom seals and rolled
 *     edges (not a flat card or a rigid box),
 *   - PBR materials whose metalness / roughness / normal maps are DERIVED from
 *     the artwork, so foil borders, metallic type and the emblem respond to
 *     real lighting differently from the matte body,
 *   - real lights + an environment map for reflections,
 *   - the whole object floats, rotates, tilts to the pointer and can be opened.
 * The same asset powers hero, featured drops, rail, detail and reveal.
 */

const TIERS = {
  pro: {
    front: '/packs/pro-chase-front.webp',
    ar: 684 / 1024,
    body: '#2a1668',      // indigo foil body (back / rim)
    rim: '#6d28d9',
    accent: '#c4b5fd',    // rim-light colour
    // physical behaviour: lighter, quicker, more restless
    idle: { yaw: -0.30, pitch: 0.10, yawAmp: 0.16, pitchAmp: 0.07, speed: 0.55, floatAmp: 0.045, floatSpeed: 0.9, phase: 0.2, roll: 0.03 },
    envIntensity: 0.75, clearcoat: 0.5,
  },
  master: {
    front: '/packs/master-vault-front.webp',
    ar: 701 / 1024,
    body: '#0b0a07',      // obsidian body
    rim: '#c9962a',
    accent: '#f0cf72',    // warm gold rim light
    // physical behaviour: heavier, slower, more deliberate, independently phased
    idle: { yaw: 0.28, pitch: 0.09, yawAmp: 0.12, pitchAmp: 0.05, speed: 0.36, floatAmp: 0.035, floatSpeed: 0.62, phase: 1.7, roll: 0.02 },
    envIntensity: 0.7, clearcoat: 0.4,
  },
}

const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches
const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let _webglOK
function hasWebGL() {
  if (_webglOK !== undefined) return _webglOK
  try {
    const c = document.createElement('canvas')
    _webglOK = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch { _webglOK = false }
  return _webglOK
}

/* ----------------------------------------------------------------------------
 * Material maps derived from the artwork (cached per tier).
 * From the albedo we synthesise:
 *   - metalnessMap: bright + saturated regions (gold / silver / foil) read as
 *     metal; the dark body reads as non-metal.
 *   - roughnessMap: foil is smoother (lower roughness), body is more matte.
 *   - normalMap: a Sobel height-to-normal pass so print / emblem / type emboss.
 * ------------------------------------------------------------------------- */
const mapCache = {}
function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

function buildMaps(tier) {
  const cfg = TIERS[tier]
  return loadImage(cfg.front).then((img) => {
    // Albedo keeps the artwork at full resolution (crisp print). The derived
    // material maps are computed from a smaller working canvas — they are subtle
    // and low-frequency, so this keeps the per-pixel work (and jank) small.
    const full = document.createElement('canvas'); full.width = img.naturalWidth; full.height = img.naturalHeight
    full.getContext('2d').drawImage(img, 0, 0)

    const W = isMobile ? 288 : 384
    const H = Math.round(W / cfg.ar)
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H
    const ctx = cv.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0, W, H)
    const src = ctx.getImageData(0, 0, W, H).data
    const N = W * H

    // luminance + saturation per pixel
    const lum = new Float32Array(N)
    const sat = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const r = src[i * 4] / 255, g = src[i * 4 + 1] / 255, b = src[i * 4 + 2] / 255
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
      lum[i] = 0.299 * r + 0.587 * g + 0.114 * b
      sat[i] = mx <= 0 ? 0 : (mx - mn) / mx
    }
    const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t) }

    // metalness + roughness
    const metalData = new Uint8ClampedArray(N * 4)
    const roughData = new Uint8ClampedArray(N * 4)
    for (let i = 0; i < N; i++) {
      // foil factor: bright & (saturated for coloured foil, or very bright for silver/gold)
      const foil = Math.max(smooth(0.32, 0.72, lum[i]) * smooth(0.12, 0.5, sat[i]), smooth(0.6, 0.92, lum[i]))
      const metal = Math.min(1, foil * 1.05)
      const rough = 0.86 - foil * 0.62            // foil smoother, body matte
      const m = Math.round(metal * 255)
      const r = Math.round(Math.min(1, Math.max(0.18, rough)) * 255)
      metalData[i * 4] = metalData[i * 4 + 1] = metalData[i * 4 + 2] = m; metalData[i * 4 + 3] = 255
      roughData[i * 4] = roughData[i * 4 + 1] = roughData[i * 4 + 2] = r; roughData[i * 4 + 3] = 255
    }

    // normal map from luminance (Sobel), subtle relief for emboss
    const normData = new Uint8ClampedArray(N * 4)
    const strength = 1.7
    const at = (x, y) => lum[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))]
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const dx = (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1))
        const dy = (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1))
        const nx = -dx * strength, ny = -dy * strength, nz = 1
        const len = Math.hypot(nx, ny, nz) || 1
        const i = (y * W + x) * 4
        normData[i] = ((nx / len) * 0.5 + 0.5) * 255
        normData[i + 1] = ((ny / len) * 0.5 + 0.5) * 255
        normData[i + 2] = ((nz / len) * 0.5 + 0.5) * 255
        normData[i + 3] = 255
      }
    }

    // All four maps share one orientation (flipY:true is correct for this plane;
    // horizontal needs no flip). The derived maps come from the same pixels, so
    // they stay pixel-aligned with the albedo.
    const orient = (t, srgb) => {
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
      t.flipY = true
      t.needsUpdate = true
    }
    const albedo = new THREE.CanvasTexture(full); albedo.anisotropy = 8; orient(albedo, true)
    const mk = (data) => {
      const c = document.createElement('canvas'); c.width = W; c.height = H
      c.getContext('2d').putImageData(new ImageData(data, W, H), 0, 0)
      const t = new THREE.CanvasTexture(c); orient(t, false)
      return t
    }
    return {
      map: albedo,
      metalnessMap: mk(metalData),
      roughnessMap: mk(roughData),
      normalMap: mk(normData),
    }
  })
}
function getMaps(tier) {
  if (!mapCache[tier]) mapCache[tier] = buildMaps(tier)
  return mapCache[tier]
}

/* ----------------------------------------------------------------------------
 * Pack body: ONE thin box. Its front (+z) face carries the artwork, so the
 * silhouette IS the artwork — no outer shell, no second pack. The back is dark
 * foil and the four thin walls are the physical foil edge/seals. A subtle
 * front dome adds foil life without changing the silhouette.
 * BoxGeometry material-group order is [+x, -x, +y, -y, +z(front), -z(back)].
 * ------------------------------------------------------------------------- */
const geoCache = {}
function getBox(tier) {
  const key = `${TIERS[tier].ar}-${isMobile ? 'm' : 'd'}`
  if (geoCache[key]) return geoCache[key]
  const h = 1.46, w = h * TIERS[tier].ar, depth = 0.06
  const segX = isMobile ? 24 : 48, segY = isMobile ? 34 : 68
  const geo = new THREE.BoxGeometry(w, h, depth, segX, segY, 1)
  // Give ONLY the front (+z) face a whisper of a dome so foil catches light,
  // while the silhouette (x/y extent) is untouched — still one clean pack edge.
  const pos = geo.attributes.position
  const dome = depth * 0.5
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i)
    if (z > depth * 0.49) {
      const u = pos.getX(i) / (w / 2), v = pos.getY(i) / (h / 2)
      const k = Math.cos(Math.min(1, Math.abs(u)) * Math.PI / 2) * Math.cos(Math.min(1, Math.abs(v)) * Math.PI / 2)
      pos.setZ(i, z + dome * 0.5 * k)
    }
  }
  geo.computeVertexNormals()
  const val = { geo, w, h, depth }
  geoCache[key] = val
  return val
}

/* ------------------------------------------------------------------------- */
function Environment() {
  const { scene, gl } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    return () => { env.dispose(); pmrem.dispose(); scene.environment = null }
  }, [scene, gl])
  return null
}

function PackMesh({ tier, pointer, reveal }) {
  const cfg = TIERS[tier]
  const group = useRef()
  const sealTop = useRef()
  const [maps, setMaps] = useState(null)
  const box = useMemo(() => getBox(tier), [tier])
  const p = useRef({ x: 0, y: 0 })
  const prog = useRef(0)

  useEffect(() => {
    let ok = true
    getMaps(tier).then((m) => ok && setMaps(m)).catch(() => {})
    return () => { ok = false }
  }, [tier])

  // The raster IS the look: it already carries real foil, wrinkles and
  // reflections. So the artwork stays the dominant term (low metalness keeps
  // its diffuse colour intact) and the material only adds a moving specular /
  // clearcoat sheen on top. Heavy metalness turned the gold grey.
  const frontMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    roughness: 1, metalness: 0.2, envMapIntensity: cfg.envIntensity,
    clearcoat: cfg.clearcoat, clearcoatRoughness: 0.28,
    normalScale: new THREE.Vector2(0.18, 0.18),
  }), [cfg.envIntensity, cfg.clearcoat])
  const backMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(cfg.body), roughness: 0.5, metalness: 0.55, envMapIntensity: cfg.envIntensity * 0.8,
  }), [cfg.body, cfg.envIntensity])
  const sideMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(cfg.rim), roughness: 0.32, metalness: 0.85, envMapIntensity: cfg.envIntensity,
  }), [cfg.rim, cfg.envIntensity])
  // [+x, -x, +y(top seal), -y(bottom seal), +z(front art), -z(back)]
  const materials = useMemo(() => [sideMat, sideMat, sideMat, sideMat, frontMat, backMat], [sideMat, frontMat, backMat])

  useEffect(() => {
    if (!maps || !frontMat) return
    frontMat.map = maps.map
    frontMat.metalnessMap = maps.metalnessMap
    frontMat.roughnessMap = maps.roughnessMap
    frontMat.normalMap = maps.normalMap
    frontMat.needsUpdate = true
  }, [maps, frontMat])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const i = cfg.idle
    // ease pointer
    const tx = pointer?.current?.tx || 0, ty = pointer?.current?.ty || 0
    p.current.x += (tx - p.current.x) * Math.min(1, dt * 5)
    p.current.y += (ty - p.current.y) * Math.min(1, dt * 5)

    if (reveal) {
      // opening: advance toward camera, spin, seal peels, then recede
      prog.current = Math.min(1, prog.current + dt / 1.7)
      const pr = prog.current
      const spin = THREE.MathUtils.smoothstep(pr, 0, 0.7)
      g.rotation.y = i.yaw + spin * Math.PI * 1.4
      g.rotation.x = i.pitch + Math.sin(pr * Math.PI) * 0.15
      g.position.z = THREE.MathUtils.smoothstep(pr, 0, 0.5) * 0.55
      g.position.y = Math.sin(t * 1.2) * 0.02 - THREE.MathUtils.smoothstep(pr, 0.7, 1) * 0.15
      g.scale.setScalar(1 + THREE.MathUtils.smoothstep(pr, 0, 0.5) * 0.12)
      if (sealTop.current) {
        const peel = THREE.MathUtils.smoothstep(pr, 0.45, 0.9)
        sealTop.current.rotation.x = -peel * 2.2
      }
      return
    }
    if (prefersReduced) {
      g.rotation.set(i.pitch, i.yaw, 0)
      return
    }
    g.rotation.y = i.yaw + Math.sin(t * i.speed + i.phase) * i.yawAmp + p.current.x * 0.6
    g.rotation.x = i.pitch + Math.cos(t * i.speed * 0.82 + i.phase) * i.pitchAmp + p.current.y * -0.45
    g.rotation.z = Math.sin(t * i.speed * 0.5 + i.phase) * i.roll + p.current.x * 0.05
    g.position.y = Math.sin(t * i.floatSpeed + i.phase) * i.floatAmp
  })

  return (
    <group ref={group}>
      <mesh geometry={box.geo} material={materials} />
      {/* separable top-seal sliver used by the reveal opening */}
      {reveal && (
        <mesh ref={sealTop} position={[0, box.h / 2, box.depth / 2]}>
          <planeGeometry args={[box.w, box.h * 0.08]} />
          <meshStandardMaterial color={cfg.rim} metalness={0.85} roughness={0.32} side={THREE.DoubleSide} envMapIntensity={cfg.envIntensity} />
        </mesh>
      )}
    </group>
  )
}

function Lights({ tier }) {
  const cfg = TIERS[tier]
  return (
    <>
      {/* Even base light so the artwork reads at its true value, plus a key and
          a tier-tinted rim that travel across the foil as the pack turns. */}
      <ambientLight intensity={1.15} />
      <directionalLight position={[2.5, 3.2, 3.5]} intensity={1.1} color="#fff6e8" />
      <directionalLight position={[-3, 1.5, 1.5]} intensity={0.55} color={cfg.accent} />
    </>
  )
}

function PackScene({ tier, pointer, reveal }) {
  return (
    <>
      <Environment />
      <Lights tier={tier} />
      <PackMesh tier={tier} pointer={pointer} reveal={reveal} />
    </>
  )
}

/* ----------------------------------------------------------------------------
 * DOM wrapper — keeps the existing .pack-3d sizing/classes so the component is
 * a drop-in for the CSS version across every surface.
 * ------------------------------------------------------------------------- */
function PackCanvas({ tier, reveal }) {
  const pointer = useRef({ tx: 0, ty: 0 })
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    pointer.current.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
    pointer.current.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
  }
  const onLeave = () => { pointer.current.tx = 0; pointer.current.ty = 0 }
  return (
    <div className="pack-canvas" onPointerMove={onMove} onPointerLeave={onLeave}>
      <Canvas
        dpr={[1, isMobile ? 1.5 : 1.9]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance',
              // Keep the raster's own colour: ACES (the default) desaturated the
              // gold and lifted the blacks away from the supplied artwork.
              toneMapping: THREE.NoToneMapping }}
        camera={{ position: [0, 0, 3.35], fov: 30 }}
      >
        <PackScene tier={tier} pointer={pointer} reveal={reveal} />
      </Canvas>
    </div>
  )
}

function Fallback({ tier }) {
  return <div className="pack-fallback"><img src={TIERS[tier].front} alt="" /></div>
}

export function Pack3D({ tier, pack, onOpen, decorative, reveal }) {
  const t = (tier || 'PRO').toLowerCase() === 'master' ? 'master' : 'pro'
  const [hot, setHot] = useState(false)
  const label = pack ? `${pack.name}, ${pack.tier} tier, $${pack.price} USDC` : `${tier} pack`
  const open = () => { if (onOpen && pack) onOpen(pack) }
  const gl = hasWebGL()
  return (
    <div
      className={`pack-3d pack-gl has-art tier-${t} ${hot ? 'is-hot' : ''}`}
      role={decorative ? undefined : 'button'}
      tabIndex={decorative ? -1 : 0}
      aria-label={decorative ? undefined : label}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      onClick={decorative ? undefined : open}
      onKeyDown={(e) => { if (!decorative && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open() } }}
    >
      {gl ? <PackCanvas tier={t} reveal={reveal} /> : <Fallback tier={t} />}
    </div>
  )
}

export { TIERS }
