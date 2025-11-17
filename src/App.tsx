import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Concerts } from './pages/Concerts'
import { Player } from './pages/Player'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/concerts" element={<Concerts />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
