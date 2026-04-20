import { Routes, Route, Navigate } from 'react-router-dom'
import Registration from './screens/Registration'
import Game from './screens/Game'
import Scanner from './screens/Scanner'
import Victory from './screens/Victory'
import Leaderboard from './screens/Leaderboard'
import RequirePlayer from './components/RequirePlayer'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Registration />} />
      <Route path="/game" element={<RequirePlayer><Game /></RequirePlayer>} />
      <Route path="/scan" element={<RequirePlayer><Scanner /></RequirePlayer>} />
      <Route path="/victory" element={<RequirePlayer><Victory /></RequirePlayer>} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
