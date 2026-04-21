import { Routes, Route, Navigate } from 'react-router-dom'
import Registration from './screens/Registration'
import Home from './screens/Home'
import Game from './screens/Game'
import Scanner from './screens/Scanner'
import Victory from './screens/Victory'
import Leaderboard from './screens/Leaderboard'
import CheckpointsList from './screens/CheckpointsList'
import MapScreen from './screens/MapScreen'
import LuckyDraw from './screens/LuckyDraw'
import Onboarding from './screens/Onboarding'
import Rules from './screens/Rules'
import RequirePlayer from './components/RequirePlayer'
import Layout from './components/Layout'

function AuthScreen({ children }) {
  return (
    <RequirePlayer>
      <Layout>{children}</Layout>
    </RequirePlayer>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/"            element={<Registration />} />
      <Route path="/home"        element={<AuthScreen><Home /></AuthScreen>} />
      <Route path="/game"        element={<AuthScreen><Game /></AuthScreen>} />
      <Route path="/scan"        element={<RequirePlayer><Scanner /></RequirePlayer>} />
      <Route path="/victory"     element={<AuthScreen><Victory /></AuthScreen>} />
      <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
      <Route path="/checkpoints" element={<AuthScreen><CheckpointsList /></AuthScreen>} />
      <Route path="/map"         element={<AuthScreen><MapScreen /></AuthScreen>} />
      <Route path="/lucky-draw"  element={<Layout><LuckyDraw /></Layout>} />
      <Route path="/onboarding"  element={<RequirePlayer><Onboarding /></RequirePlayer>} />
      <Route path="/rules"       element={<Layout><Rules /></Layout>} />
      <Route path="*"            element={<Navigate to="/" />} />
    </Routes>
  )
}
