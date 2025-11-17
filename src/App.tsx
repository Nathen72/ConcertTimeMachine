import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Concerts } from './pages/Concerts'
import { Player } from './pages/Player'
import SpotifyCallback from './pages/SpotifyCallback'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/concerts" element={<Concerts />} />
        <Route path="/player" element={<Player />} />
        <Route path="/callback" element={<SpotifyCallback />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
