import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Concerts } from './pages/Concerts'
import { Player } from './pages/Player'
import SpotifyCallback from './pages/SpotifyCallback'
import { CassetteLayout } from './components/CassetteLayout'

import { SpotifyPlayerProvider } from './contexts/SpotifyPlayerContext'

function App() {
  return (
    <BrowserRouter>
      <SpotifyPlayerProvider>
        <Routes>
          <Route element={<CassetteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/concerts" element={<Concerts />} />
            <Route path="/player" element={<Player />} />
            <Route path="/callback" element={<SpotifyCallback />} />
          </Route>
        </Routes>
      </SpotifyPlayerProvider>
    </BrowserRouter>
  )
}

export default App
