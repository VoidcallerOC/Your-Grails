import * as THREE from 'three'

const DEG = Math.PI / 180
const cache = new Map()
const CACHE_VER = 'pouch5'

const VERT = /* glsl */ `
attribute float aKind;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vW;
varying float vKind;
void main() {
  vUv = uv;
  vKind = aKind;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`

const FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uLight;
uniform vec3 uFill;
uniform vec3 uRim;
uniform vec3 uCam;
uniform vec3 uSideTint;
uniform float uSide;
uniform float uFade;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vW;
varying float vKind;

void main() {
  vec4 tex = texture2D(uMap, vUv);
  if (uFade < 0.02) discard;
  vec3 n = normalize(vN);
  vec3 view = normalize(uCam - vW);
  vec3 L = normalize(uLight);
  vec3 F = normalize(uFill);
  float fade = uFade;

  if (vKind < 0.5) {
    if (tex.a < 0.08) discard;
    float facing = max(dot(n, view), 0.0);
    float wrap = pow(1.0 - facing, 1.7);
    float spec = pow(max(dot(n, normalize(L + view)), 0.0), 40.0) * wrap;
    vec3 col = tex.rgb * (0.88 + 0.12 * max(dot(n, L), 0.0)) + uRim * wrap * 0.22 + vec3(spec) * 0.18;
    gl_FragColor = vec4(col * tex.a * fade, tex.a * fade);
    return;
  }

  if (vKind < 1.5) {
    float ndl = 0.2 + 0.55 * max(dot(n, L), 0.0) + 0.28 * max(dot(n, F), 0.0);
    float spec = pow(max(dot(n, normalize(L + view)), 0.0), 36.0);
    vec3 base = mix(uSideTint, tex.rgb, 0.62);
    vec3 col = base * ndl + vec3(0.95, 0.9, 0.8) * spec * 0.55;
    float a = max(tex.a, 0.94) * fade;
    gl_FragColor = vec4(col * a, a);
    return;
  }

  if (tex.a < 0.08) discard;
  float ndl = 0.16 + 0.5 * max(dot(n, L), 0.0);
  vec3 col = mix(uSideTint * 0.18, tex.rgb * 0.12, 0.35) * ndl;
  gl_FragColor = vec4(col * tex.a * fade, tex.a * fade);
}
`

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function addQuad(buf, p0, p1, p2, p3, uv0, uv1, uv2, uv3, kind) {
  const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2]
  const bx = p3[0] - p0[0], by = p3[1] - p0[1], bz = p3[2] - p0[2]
  let nx = ay * bz - az * by
  let ny = az * bx - ax * bz
  let nz = ax * by - ay * bx
  const len = Math.hypot(nx, ny, nz) || 1
  nx /= len; ny /= len; nz /= len
  const base = buf.pos.length / 3
  buf.pos.push(...p0, ...p1, ...p2, ...p3)
  buf.n.push(nx, ny, nz, nx, ny, nz, nx, ny, nz, nx, ny, nz)
  buf.uv.push(...uv0, ...uv1, ...uv2, ...uv3)
  buf.kind.push(kind, kind, kind, kind)
  buf.idx.push(base, base + 1, base + 2, base, base + 2, base + 3)
}

function distanceTransform(mask, w, h) {
  const d = new Float32Array(w * h)
  const INF = 1e5
  for (let i = 0; i < d.length; i++) d[i] = mask[i] ? INF : 0
  const tryMin = (i, j, c) => {
    if (j < 0 || j >= d.length) return
    d[i] = Math.min(d[i], d[j] + c)
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (!mask[i]) continue
      if (x > 0) tryMin(i, i - 1, 1)
      if (y > 0) tryMin(i, i - w, 1)
      if (x > 0 && y > 0) tryMin(i, i - w - 1, 1.414)
      if (x + 1 < w && y > 0) tryMin(i, i - w + 1, 1.414)
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x
      if (!mask[i]) continue
      if (x + 1 < w) tryMin(i, i + 1, 1)
      if (y + 1 < h) tryMin(i, i + w, 1)
      if (x + 1 < w && y + 1 < h) tryMin(i, i + w + 1, 1.414)
      if (x > 0 && y + 1 < h) tryMin(i, i + w - 1, 1.414)
    }
  }
  return d
}

function buildGeometry(img) {
  const col = 96
  const row = 144
  const c = document.createElement('canvas')
  c.width = col
  c.height = row
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, col, row)
  const { data } = ctx.getImageData(0, 0, col, row)
  const T = 18
  const mask = new Uint8Array(col * row)
  let er = 0, eg = 0, eb = 0, en = 0
  let minY = row, maxY = 0, minX = col, maxX = 0
  for (let y = 0; y < row; y++) {
    for (let x = 0; x < col; x++) {
      const p = (y * col + x) * 4
      if (data[p + 3] > T) {
        mask[y * col + x] = 1
        if (y < minY) minY = y
        if (y > maxY) maxY = y
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        er += data[p]; eg += data[p + 1]; eb += data[p + 2]; en++
      }
    }
  }
  const dist = distanceTransform(mask, col, row)
  const spanY = Math.max(1, maxY - minY)
  const zGrid = new Float32Array(col * row)

  const X = (x) => (x / (col - 1)) * 2 - 1
  const Y = (y) => (1 - y / (row - 1)) * 3 - 1.5
  const U = (x) => x / (col - 1)
  const V = (y) => 1 - y / (row - 1)

  for (let y = 0; y < row; y++) {
    for (let x = 0; x < col; x++) {
      const i = y * col + x
      if (!mask[i]) continue
      const vn = (y - minY) / spanY
      const u = x / (col - 1)
      const crimp = vn < 0.1 || vn > 0.9
      const s = Math.min(1, dist[i] / (crimp ? 2.4 : 6.2))
      const sm = s * s * (3 - 2 * s)
      const belly = Math.sin(Math.PI * u) * Math.sin(Math.PI * Math.min(1, Math.max(0, (vn - 0.08) / 0.84)))
      if (crimp) {
        const rib = Math.abs(Math.sin(u * Math.PI * 22))
        zGrid[i] = 0.01 + 0.012 * sm + 0.007 * rib
      } else {
        zGrid[i] = 0.018 + 0.07 * sm + 0.05 * belly * sm
      }
    }
  }

  const buf = { pos: [], n: [], uv: [], kind: [], idx: [] }
  const frontOf = new Int32Array(col * row).fill(-1)
  const backOf = new Int32Array(col * row).fill(-1)

  const pushVert = (x, y, z, nx, ny, nz, kind) => {
    const idx = buf.pos.length / 3
    buf.pos.push(X(x), Y(y), z)
    buf.n.push(nx, ny, nz)
    buf.uv.push(U(x), V(y))
    buf.kind.push(kind)
    return idx
  }

  const normalAt = (x, y, sign) => {
    const i = y * col + x
    const zl = x > 0 && mask[i - 1] ? zGrid[i - 1] : zGrid[i]
    const zr = x + 1 < col && mask[i + 1] ? zGrid[i + 1] : zGrid[i]
    const zu = y > 0 && mask[i - col] ? zGrid[i - col] : zGrid[i]
    const zd = y + 1 < row && mask[i + col] ? zGrid[i + col] : zGrid[i]
    const dx = 2 / (col - 1)
    const dy = 3 / (row - 1)
    let nx = -(zr - zl) / (2 * dx)
    let ny = (zd - zu) / (2 * dy)
    let nz = 1 * sign
    if (sign < 0) { nx = -nx; ny = -ny }
    const len = Math.hypot(nx, ny, nz) || 1
    return [nx / len, ny / len, nz / len]
  }

  for (let y = 0; y < row; y++) {
    for (let x = 0; x < col; x++) {
      const i = y * col + x
      if (!mask[i]) continue
      const nf = normalAt(x, y, 1)
      const nb = normalAt(x, y, -1)
      frontOf[i] = pushVert(x, y, zGrid[i], nf[0], nf[1], nf[2], 0)
      backOf[i] = pushVert(x, y, -zGrid[i], nb[0], nb[1], nb[2], 2)
    }
  }

  const tri = (a, b, c) => { buf.idx.push(a, b, c) }
  for (let y = 0; y < row - 1; y++) {
    for (let x = 0; x < col - 1; x++) {
      const a = y * col + x
      const b = a + 1
      const c = a + col
      const d = c + 1
      const fa = frontOf[a], fb = frontOf[b], fc = frontOf[c], fd = frontOf[d]
      if (fa >= 0 && fb >= 0 && fc >= 0 && fd >= 0) {
        tri(fa, fc, fd); tri(fa, fd, fb)
        tri(backOf[a], backOf[b], backOf[d]); tri(backOf[a], backOf[d], backOf[c])
      } else if (fa >= 0 && fb >= 0 && fc >= 0) {
        tri(fa, fc, fb); tri(backOf[a], backOf[b], backOf[c])
      } else if (fa >= 0 && fb >= 0 && fd >= 0) {
        tri(fa, fd, fb); tri(backOf[a], backOf[b], backOf[d])
      } else if (fa >= 0 && fc >= 0 && fd >= 0) {
        tri(fa, fc, fd); tri(backOf[a], backOf[d], backOf[c])
      } else if (fb >= 0 && fc >= 0 && fd >= 0) {
        tri(fb, fc, fd); tri(backOf[b], backOf[d], backOf[c])
      }
    }
  }

  const rimBetween = (x0, y0, x1, y1) => {
    const i0 = y0 * col + x0
    const i1 = y1 * col + x1
    if (frontOf[i0] < 0 || frontOf[i1] < 0) return
    const u0 = [U(x0), V(y0)]
    const u1 = [U(x1), V(y1)]
    addQuad(
      buf,
      [X(x0), Y(y0), zGrid[i0]],
      [X(x1), Y(y1), zGrid[i1]],
      [X(x1), Y(y1), -zGrid[i1]],
      [X(x0), Y(y0), -zGrid[i0]],
      u0, u1, u1, u0,
      1,
    )
  }

  for (let y = 0; y < row - 1; y++) {
    for (let x = 0; x < col; x++) {
      const i = y * col + x
      if (!mask[i] || !mask[i + col]) continue
      const leftOut = x === 0 || !mask[i - 1] || !mask[i + col - 1]
      const rightOut = x === col - 1 || !mask[i + 1] || !mask[i + col + 1]
      if (leftOut) rimBetween(x, y + 1, x, y)
      if (rightOut) rimBetween(x, y, x, y + 1)
    }
  }
  for (let y = 0; y < row; y++) {
    for (let x = 0; x < col - 1; x++) {
      const i = y * col + x
      if (!mask[i] || !mask[i + 1]) continue
      const topOut = y === 0 || !mask[i - col] || !mask[i + 1 - col]
      const botOut = y === row - 1 || !mask[i + col] || !mask[i + 1 + col]
      if (topOut) rimBetween(x, y, x + 1, y)
      if (botOut) rimBetween(x + 1, y, x, y)
    }
  }

  const geo = {
    pos: buf.pos,
    n: buf.n,
    uv: buf.uv,
    kind: buf.kind,
    idx: buf.idx,
  }
  const edge = en ? [er / en / 255, eg / en / 255, eb / en / 255] : [0.45, 0.25, 0.8]
  return { geo, edge }
}

function makeGeometry(data) {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(data.pos, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(data.n, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(data.uv, 2))
  geo.setAttribute('aKind', new THREE.Float32BufferAttribute(data.kind, 1))
  geo.setIndex(data.idx)
  return geo
}

async function getAssets(src) {
  const key = `${CACHE_VER}:${src}`
  if (cache.has(key)) return cache.get(key)
  const pending = (async () => {
    const img = await loadImage(src)
    const { geo, edge } = buildGeometry(img)
    return { img, geo, edge }
  })()
  cache.set(key, pending)
  return pending
}

function makeTexture(img, renderer) {
  const tex = new THREE.Texture(img)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
  tex.premultiplyAlpha = true
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

const HINGE_Y = 1.165

function pose(over = {}) {
  return {
    bx: 0, by: 0, bz: 0, brx: 0.04, bry: 0.14, brz: 0,
    sx: 1, sy: 1, scale: 1, fade: 1, cam: 1, look: 0,
    slx: 0, sly: 0.02, slz: 0.12, slrx: 0.08, slry: 0.12, slsc: 0.72, slop: 0,
    ...over,
  }
}

const RIP_POSE = {
  enter: pose(),
  wind: pose({ sx: 1.03, sy: 0.97, cam: 0.96, brx: 0.08 }),
  hit: pose({ sx: 1.01, sy: 0.99, cam: 0.94, slop: 0 }),
  tear: pose({
    by: -0.28, bz: -0.18, brx: 0.22, fade: 0.85, cam: 0.9, look: 0.08,
    sly: 0.22, slz: 0.28, slrx: -0.06, slry: 0.1, slsc: 0.88, slop: 1,
  }),
  bloom: pose({
    by: -0.7, bz: -0.42, brx: 0.35, bry: -0.12, fade: 0.25, scale: 0.86, cam: 0.84, look: 0.12,
    sly: 0.18, slz: 0.42, slrx: -0.1, slry: 0.16, slsc: 1.02, slop: 1,
  }),
  hold: pose({
    by: -0.9, bz: -0.55, fade: 0, scale: 0.8, cam: 0.86, look: 0.1,
    sly: 0.12, slz: 0.38, slrx: -0.08, slry: 0.14, slsc: 1.06, slop: 1,
  }),
  reveal: pose({
    fade: 0, scale: 0.7, cam: 0.92,
    sly: 0.08, slz: 0.2, slrx: -0.04, slry: 0.18, slsc: 1.08, slop: 0,
  }),
}

const RIP_K = { enter: 6, wind: 5, hit: 12, tear: 3.2, bloom: 2.5, hold: 3.4, reveal: 4 }

function buildSlab() {
  const group = new THREE.Group()
  const w = 0.9
  const h = 1.26
  const d = 0.074
  const plastic = new THREE.MeshBasicMaterial({ color: 0x17171f })
  const front = new THREE.MeshBasicMaterial({ color: 0x1b1b24, transparent: true, opacity: 1 })
  const back = new THREE.MeshBasicMaterial({ color: 0x0b0b0f })
  const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [plastic, plastic, plastic, plastic, front, back])
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.97, h * 0.97),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 }),
  )
  glass.position.z = d / 2 + 0.003
  group.add(box)
  group.add(glass)
  group.visible = false
  return { group, front, box }
}

function lerp(a, b, t) { return a + (b - a) * t }

export function createPackEngine(canvas, opts) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40)
  const root = new THREE.Group()
  scene.add(root)
  const leftG = new THREE.Group()
  const rightG = new THREE.Group()
  root.add(leftG)
  root.add(rightG)

  const state = {
    ready: false,
    pose: opts.pose || { yaw: 0, pitch: 6, yawAmp: 6, pitchAmp: 2.4, period: 3.2, bob: 2.4, bobAmp: 5, phase: 0 },
    ptr: { x: 0, y: 0, z: 0 },
    beat: opts.ripBeat || null,
    mode: opts.mode || 'idle',
    reduce: false,
    cur: { ...RIP_POSE.enter },
    last: performance.now(),
    disposed: false,
    mats: [],
  }

  const fit = () => {
    const wrap = canvas.parentElement
    if (!wrap) return
    const r = wrap.getBoundingClientRect()
    const w = Math.max(1, r.width)
    const h = Math.max(1, r.height)
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const packH = 3
    const pad = state.mode === 'rip' ? 1.78 : 1.32
    const dist = (packH * pad / 2) / Math.tan((camera.fov * Math.PI) / 360)
    camera.position.set(0, 0.04, dist)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    state.baseZ = dist
  }

  const makeMat = (side) => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: null },
        uLight: { value: new THREE.Vector3(-0.45, 0.7, 0.85) },
        uFill: { value: new THREE.Vector3(0.55, 0.15, 0.35) },
        uRim: { value: new THREE.Color(opts.tier === 'master' ? '#ffe9a8' : '#efe7ff') },
        uCam: { value: camera.position },
        uSideTint: { value: new THREE.Color(opts.tier === 'master' ? '#c9a227' : '#7c3aed') },
        uSide: { value: 0 },
        uFade: { value: 1 },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    })
    state.mats.push(mat)
    return mat
  }

  const boot = async () => {
    const { geo: data, img, edge } = await getAssets(opts.src)
    if (state.disposed) return
    const geo = makeGeometry(data)
    const tex = makeTexture(img, renderer)
    state.geo = geo
    state.tex = tex
    const leftMat = makeMat(-1)
    leftMat.uniforms.uMap.value = tex
    leftMat.uniforms.uSideTint.value.setRGB(edge[0], edge[1], edge[2])
    const leftMesh = new THREE.Mesh(geo, leftMat)
    leftG.add(leftMesh)
    rightG.visible = false
    if (state.mode === 'rip') {
      const slab = buildSlab()
      scene.add(slab.group)
      state.slab = slab.group
      state.slabFront = slab.front
      state.slabBox = slab.box
      if (opts.slabSrc) loadSlab(opts.slabSrc)
    }
    state.ready = true
    fit()
  }

  boot().catch(() => {})

  const loadSlab = (url) => {
    if (!url || url === state.slabUrl || !state.slabFront) return
    state.slabUrl = url
    loadImage(url).then((img) => {
      if (state.disposed) return
      const tex = makeTexture(img, renderer)
      state.slabTex = tex
      state.slabFront.map = tex
      state.slabFront.color.set(0xffffff)
      state.slabFront.needsUpdate = true
    }).catch(() => {})
  }

  const ro = new ResizeObserver(fit)
  if (canvas.parentElement) ro.observe(canvas.parentElement)
  window.addEventListener('resize', fit)
  requestAnimationFrame(fit)
  setTimeout(fit, 80)

  const applyIdle = (t) => {
    const o = state.pose
    const p = state.ptr
    const s = t * 0.001
    if (state.reduce) {
      root.rotation.y = o.yaw * DEG
      root.rotation.x = o.pitch * DEG
      root.position.y = 0
      return
    }
    const yaw = o.yaw + Math.sin(s / o.period + o.phase) * o.yawAmp + p.x * 18
    const pitch = o.pitch + Math.cos(s / (o.period * 1.18) + o.phase) * o.pitchAmp + p.y * -11
    const lift = Math.sin(s / o.bob + o.phase) * o.bobAmp * 0.012 + p.z * 0.012
    root.rotation.y = yaw * DEG
    root.rotation.x = pitch * DEG
    root.position.y = lift
    const L = state.mats[0]?.uniforms.uLight.value
    if (L) L.set(-0.45 + p.x * 0.8, 0.7 - p.y * 0.5, 0.85)
  }

  const applyRip = (dt) => {
    const target = RIP_POSE[state.beat] || RIP_POSE.enter
    const k = RIP_K[state.beat] || 6
    const t = 1 - Math.exp(-k * dt)
    const c = state.cur
    Object.keys(target).forEach((key) => { c[key] = lerp(c[key], target[key], t) })
    leftG.position.set(c.bx, c.by, c.bz)
    leftG.rotation.set(c.brx, c.bry, c.brz)
    leftG.visible = c.fade > 0.03
    root.rotation.set(0.03, 0.1, 0)
    root.scale.set(c.sx * c.scale, c.sy * c.scale, c.scale)
    state.mats.forEach((m) => { m.uniforms.uFade.value = c.fade })
    if (state.baseZ) camera.position.z = lerp(camera.position.z, state.baseZ * c.cam, t)
    camera.lookAt(0, c.look, 0)
    if (state.slab) {
      state.slab.position.set(c.slx, c.sly, c.slz)
      state.slab.rotation.set(c.slrx, c.slry, 0)
      state.slab.scale.setScalar(c.slsc)
      state.slab.visible = c.slop > 0.04
      if (state.slabFront) {
        state.slabFront.opacity = Math.min(1, c.slop)
        state.slabFront.transparent = c.slop < 0.98
      }
    }
  }

  return {
    setPointer(p) { if (p) state.ptr = p },
    setBeat(beat) { state.beat = beat },
    setPose(pose) { if (pose) state.pose = pose },
    setSlab(url) { loadSlab(url) },
    setReduce(v) { state.reduce = v },
    frame(now) {
      if (state.disposed) return
      const dt = Math.min(0.05, (now - state.last) / 1000)
      state.last = now
      if (state.mode === 'rip') applyRip(dt)
      else applyIdle(now)
      state.mats.forEach((m) => { m.uniforms.uCam.value.copy(camera.position) })
      renderer.render(scene, camera)
    },
    resize: fit,
    dispose() {
      state.disposed = true
      ro.disconnect()
      window.removeEventListener('resize', fit)
      state.mats.forEach((m) => m.dispose())
      state.geo?.dispose()
      state.tex?.dispose()
      state.slabTex?.dispose()
      state.slabBox?.geometry.dispose()
      state.slabFront?.dispose()
      renderer.dispose()
    },
  }
}
