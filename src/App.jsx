import { useEffect, useState } from 'react'
import { Layout } from './Layout'
import { Home, Packs, PackDetail } from './Home'
import {
  Reveal, Collection, CardPage, Battles, Marketplace,
  Trading, Lending, Leaderboard, Trust,
} from './Rest'
import { path } from './nav'

export default function App() {
  const [route, setRoute] = useState(path())
  useEffect(() => {
    const on = () => setRoute(path())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const parts = route.split('/').filter(Boolean)
  let view = <Home />
  if (route === '/packs') view = <Packs />
  else if (parts[0] === 'packs' && parts[1]) view = <PackDetail id={parts[1]} />
  else if (route === '/reveal') view = <Reveal />
  else if (route === '/collection') view = <Collection />
  else if (parts[0] === 'card') view = <CardPage id={decodeURIComponent(parts[1] || '')} />
  else if (route === '/battles') view = <Battles />
  else if (route === '/marketplace') view = <Marketplace />
  else if (route === '/trading') view = <Trading />
  else if (route === '/lending') view = <Lending />
  else if (route === '/leaderboard') view = <Leaderboard />
  else if (route === '/trust') view = <Trust />
  return <Layout>{view}</Layout>
}
