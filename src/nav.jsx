import { useCallback, useEffect, useState } from 'react'

export function path() {
  const h = window.location.hash.replace(/^#/, '') || '/'
  return h.startsWith('/') ? h : '/' + h
}

export function toPath(arg) {
  if (typeof arg === 'string') return arg
  let p = arg.to
  if (arg.params) {
    for (const [k, v] of Object.entries(arg.params)) {
      p = p.replaceAll('$' + k, encodeURIComponent(String(v)))
    }
  }
  return p
}

export function navigate(arg) {
  window.location.hash = toPath(arg)
}

export function useNavigate() {
  return useCallback((arg) => navigate(arg), [])
}

export function Link({ to, className, children, ...rest }) {
  const href = '#' + (typeof to === 'string' ? to : toPath(to))
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => { e.preventDefault(); navigate(to) }}
      {...rest}
    >
      {children}
    </a>
  )
}

export function useRouterState({ select }) {
  const [p, setP] = useState(path())
  useEffect(() => {
    const on = () => setP(path())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return select({ location: { pathname: p } })
}
