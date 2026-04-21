# Navigation & Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add persistent navbar+sidebar navigation, cream/green theme, home hub screen, checkpoints list, map standalone screen, and PIN-gated lucky draw with slot-machine animation.

**Architecture:** A new `Layout` component wraps all authenticated screens providing the navbar and slide-in sidebar. The theme flips from dark-jungle to cream/green by updating CSS variables. Five new screens are added at new routes; existing screens keep their logic and gain the Layout wrapper.

**Tech Stack:** React, React Router, Motion (`motion/react`), `crypto.getRandomValues()` for randomness, Vitest for unit tests.

---

### Task 1: Theme Overhaul

**Files:**
- Modify: `src/styles/global.css`

**Step 1: Replace all CSS variables and update base styles**

Fully replace the `:root` block and all colour references in `src/styles/global.css`:

```css
:root {
  --bg:           #F5F0E8;
  --bg-card:      #FFFFFF;
  --bg-sidebar:   #1A3D2B;
  --green-glow:   #2D7A4A;
  --green-light:  #E8F5EE;
  --green-dim:    #245f3a;
  --gold:         #B8860B;
  --gold-dim:     #9a6f09;
  --text:         #1C2B1E;
  --text-muted:   #6B7B6E;
  --error:        #C0392B;
  --border:       #D4E6D9;
  --border-bright:#aed4ba;
  --font:         'Courier New', Courier, monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #root {
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

#root {
  display: flex;
  flex-direction: column;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100dvh;
  overflow-x: hidden;
}

button {
  cursor: pointer;
  font-family: var(--font);
  border: none;
  outline: none;
}

input { font-family: var(--font); }

.btn-primary {
  background: var(--green-glow);
  color: #FFFFFF;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 0.08em;
  padding: 0.85rem 1.5rem;
  border-radius: 8px;
  width: 100%;
  transition: background 0.15s, transform 0.1s;
  text-transform: uppercase;
}
.btn-primary:active { transform: scale(0.97); background: var(--green-dim); }

.btn-secondary {
  background: transparent;
  color: var(--green-glow);
  border: 1px solid var(--border-bright);
  padding: 0.65rem 1.2rem;
  border-radius: 8px;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.15s;
}
.btn-secondary:active { background: var(--green-light); }

.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  padding: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  gap: 1rem;
  overflow-y: auto;
  background: var(--bg);
}

.screen-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  gap: 1rem;
  text-align: center;
  background: var(--bg);
}

h1 { font-size: 1.5rem; letter-spacing: 0.06em; color: var(--green-glow); text-transform: uppercase; }
h2 { font-size: 1.15rem; letter-spacing: 0.04em; color: var(--gold); }
h3 { font-size: 1rem; color: var(--text); }

.text-muted  { color: var(--text-muted); font-size: 0.875rem; }
.text-gold   { color: var(--gold); }
.text-green  { color: var(--green-glow); }
.text-error  { color: var(--error); }

.input-field {
  background: var(--bg);
  border: 1px solid var(--border-bright);
  border-radius: 8px;
  color: var(--text);
  font-size: 1rem;
  padding: 0.8rem 1rem;
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}
.input-field:focus   { border-color: var(--green-glow); }
.input-field::placeholder { color: var(--text-muted); }

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 4px var(--gold), 0 0 8px var(--gold-dim); }
  50%       { box-shadow: 0 0 10px var(--gold), 0 0 20px var(--gold-dim); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.fade-in { animation: fadeIn 0.3s ease forwards; }
```

**Step 2: Verify build**
```bash
cd /Users/rhythm.chawla/carta_repos/treasure && npx vite build 2>&1 | tail -3
```
Expected: build succeeds.

**Step 3: Commit**
```bash
git add src/styles/global.css
git commit -m "feat: cream and green theme overhaul"
```

---

### Task 2: Sidebar Component

**Files:**
- Create: `src/components/Sidebar.jsx`

**Step 1: Write `src/components/Sidebar.jsx`**

```jsx
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePlayer } from '../lib/playerContext'

const NAV_ITEMS = [
  { label: 'Home',          path: '/home',        icon: '🏠' },
  { label: 'Current Quest', path: '/game',        icon: '📍' },
  { label: 'Checkpoints',   path: '/checkpoints', icon: '📋' },
  { label: 'Map',           path: '/map',         icon: '🗺️' },
  { label: 'Leaderboard',   path: '/leaderboard', icon: '🏆' },
  { label: 'Lucky Draw',    path: '/lucky-draw',  icon: '🎲' },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { player, logout } = usePlayer()

  function go(path) {
    navigate(path)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 40,
            }}
          />

          {/* Drawer */}
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              width: 260,
              background: 'var(--bg-sidebar)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              padding: '0 0 1.5rem',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.25rem 1rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="/assets/host.png" alt="Fairy" style={{ width: 36 }} />
                <div>
                  <p style={{ color: '#e8f5e2', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Office Jungle
                  </p>
                  {player && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                      {player.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Nav items */}
            <div style={{ flex: 1, padding: '0.75rem 0' }}>
              {NAV_ITEMS.map(item => {
                const active = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      width: '100%',
                      padding: '0.85rem 1.25rem',
                      background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.65)',
                      fontSize: '0.95rem',
                      letterSpacing: '0.03em',
                      borderLeft: active ? '3px solid #4ADE80' : '3px solid transparent',
                      transition: 'background 0.15s, color 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', minWidth: 22 }}>{item.icon}</span>
                    {item.label}
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            {player && (
              <div style={{ padding: '0 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <button
                  onClick={() => { logout(); navigate('/'); onClose() }}
                  style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: 'transparent',
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0',
                  }}
                >
                  ⤶ Exit Hunt
                </button>
              </div>
            )}
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}
```

**Step 2: Verify build**
```bash
cd /Users/rhythm.chawla/carta_repos/treasure && npx vite build 2>&1 | tail -3
```

**Step 3: Commit**
```bash
git add src/components/Sidebar.jsx
git commit -m "feat: sidebar navigation component"
```

---

### Task 3: Layout Component + Navbar

**Files:**
- Create: `src/components/Layout.jsx`

**Step 1: Write `src/components/Layout.jsx`**

```jsx
import { useState } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {/* Navbar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          height: 52,
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'transparent',
              color: 'var(--text)',
              fontSize: '1.3rem',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              minHeight: 44,
            }}
            aria-label="Open menu"
          >
            ☰
          </button>

          <p style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--green-glow)',
          }}>
            Office Jungle
          </p>

          <img src="/assets/host.png" alt="Fairy" style={{ width: 32 }} />
        </header>

        {/* Page content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </>
  )
}
```

**Step 2: Verify build**
```bash
cd /Users/rhythm.chawla/carta_repos/treasure && npx vite build 2>&1 | tail -3
```

**Step 3: Commit**
```bash
git add src/components/Layout.jsx
git commit -m "feat: layout component with sticky navbar"
```

---

### Task 4: Router + App.jsx Update

**Files:**
- Modify: `src/App.jsx`
- Create stubs: `src/screens/Home.jsx`, `src/screens/CheckpointsList.jsx`, `src/screens/MapScreen.jsx`, `src/screens/LuckyDraw.jsx`

**Step 1: Create stub screens** (each is a minimal placeholder):

`src/screens/Home.jsx`:
```jsx
export default function Home() { return <div className="screen">Home</div> }
```

`src/screens/CheckpointsList.jsx`:
```jsx
export default function CheckpointsList() { return <div className="screen">Checkpoints</div> }
```

`src/screens/MapScreen.jsx`:
```jsx
export default function MapScreen() { return <div className="screen">Map</div> }
```

`src/screens/LuckyDraw.jsx`:
```jsx
export default function LuckyDraw() { return <div className="screen">Lucky Draw</div> }
```

**Step 2: Update `src/App.jsx`**

Read the current App.jsx first, then replace completely:

```jsx
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
      <Route path="*"            element={<Navigate to="/" />} />
    </Routes>
  )
}
```

Note: `/scan` skips Layout (it's full-screen camera overlay). `/leaderboard` and `/lucky-draw` have Layout but no RequirePlayer (public screens).

**Step 3: Update Registration to navigate to `/home` instead of `/game`**

In `src/screens/Registration.jsx`, find the two places that `navigate('/game')` and change both to `navigate('/home')`.

**Step 4: Update Game.jsx** — remove the inline header (player name, board/logout buttons) since those now live in the navbar/sidebar. Read `src/screens/Game.jsx` and remove the header `<div>` block (the one with "Explorer" label, player name, "Board" button, and logout button).

**Step 5: Verify build**
```bash
cd /Users/rhythm.chawla/carta_repos/treasure && npx vite build 2>&1 | tail -3
```

**Step 6: Run tests**
```bash
cd /Users/rhythm.chawla/carta_repos/treasure && npx vitest run 2>&1 | tail -5
```
Expected: 8/8 pass.

**Step 7: Commit**
```bash
git add src/App.jsx src/screens/Home.jsx src/screens/CheckpointsList.jsx src/screens/MapScreen.jsx src/screens/LuckyDraw.jsx src/screens/Registration.jsx src/screens/Game.jsx
git commit -m "feat: wire routing with layout wrapper and new screen stubs"
```

---

### Task 5: Home Screen

**Files:**
- Modify: `src/screens/Home.jsx`

**Step 1: Write the full `src/screens/Home.jsx`**

```jsx
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { usePlayer } from '../lib/playerContext'
import { CHECKPOINTS, getCheckpoint } from '../lib/checkpoints'
import ProgressBar from '../components/ProgressBar'

export default function Home() {
  const navigate = useNavigate()
  const { player } = usePlayer()

  if (!player) return null

  const currentCheckpoint = getCheckpoint(player.current_step)
  const isComplete = player.current_step >= CHECKPOINTS.length

  return (
    <div className="screen" style={{ gap: '1.25rem' }}>
      {/* Fairy + greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <motion.img
          src="/assets/host.png"
          alt="Fairy"
          style={{ width: 64 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        />
        <div>
          <h1 style={{ fontSize: '1.1rem' }}>
            {isComplete ? 'Hunt Complete!' : 'Lost in the Jungle'}
          </h1>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Welcome back, <strong style={{ color: 'var(--text)' }}>{player.name}</strong>
          </p>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar current={Math.min(player.current_step, CHECKPOINTS.length)} total={CHECKPOINTS.length} />

      {/* Current Quest CTA */}
      {!isComplete && currentCheckpoint && (
        <button
          onClick={() => navigate('/game')}
          className="card"
          style={{
            textAlign: 'left',
            width: '100%',
            cursor: 'pointer',
            borderLeft: '4px solid var(--green-glow)',
            transition: 'box-shadow 0.15s',
            background: 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{
              background: 'var(--green-light)',
              color: 'var(--green-glow)',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              padding: '0.2rem 0.5rem',
              borderRadius: 4,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Current Quest
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {player.current_step + 1} / 10 →
            </span>
          </div>
          <p style={{ fontWeight: 'bold', color: 'var(--text)', marginBottom: '0.3rem' }}>
            Checkpoint {player.current_step + 1} · {currentCheckpoint.roomId}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
            {currentCheckpoint.riddle.slice(0, 80)}...
          </p>
        </button>
      )}

      {isComplete && (
        <div className="card" style={{ textAlign: 'center', borderLeft: '4px solid var(--gold)' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
            {player.is_first_place ? '👑' : '🌿'}
          </p>
          <p style={{ fontWeight: 'bold', color: 'var(--gold)' }}>
            {player.is_first_place ? 'Jungle Champion!' : 'Hunt Complete!'}
          </p>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Check the leaderboard to see your rank.
          </p>
        </div>
      )}

      {/* Shortcut tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Map',         icon: '🗺️',  path: '/map' },
          { label: 'Leaderboard', icon: '🏆',  path: '/leaderboard' },
          { label: 'Lucky Draw',  icon: '🎲',  path: '/lucky-draw' },
        ].map(tile => (
          <button
            key={tile.path}
            onClick={() => navigate(tile.path)}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              padding: '0.875rem 0.5rem',
              transition: 'box-shadow 0.15s',
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>{tile.icon}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {tile.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Verify build**
```bash
cd /Users/rhythm.chawla/carta_repos/treasure && npx vite build 2>&1 | tail -3
```

**Step 3: Commit**
```bash
git add src/screens/Home.jsx
git commit -m "feat: home hub screen with progress and shortcuts"
```

---

### Task 6: Checkpoints List Screen

**Files:**
- Modify: `src/screens/CheckpointsList.jsx`

**Step 1: Write `src/screens/CheckpointsList.jsx`**

```jsx
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { usePlayer } from '../lib/playerContext'
import { CHECKPOINTS } from '../lib/checkpoints'

function CheckpointRow({ checkpoint, state, onTap }) {
  const isDone    = state === 'done'
  const isCurrent = state === 'current'
  const isLocked  = state === 'locked'

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: checkpoint.index * 0.04 }}
      onClick={isLocked ? undefined : onTap}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        width: '100%',
        padding: '0.875rem 1rem',
        background: isCurrent ? 'var(--green-light)' : 'var(--bg-card)',
        border: `1px solid ${isCurrent ? 'var(--border-bright)' : 'var(--border)'}`,
        borderLeft: `4px solid ${isDone ? 'var(--green-glow)' : isCurrent ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: 10,
        cursor: isLocked ? 'default' : 'pointer',
        opacity: isLocked ? 0.55 : 1,
        textAlign: 'left',
        transition: 'box-shadow 0.15s',
      }}
    >
      {/* Index badge */}
      <span style={{
        minWidth: 28,
        height: 28,
        borderRadius: '50%',
        background: isDone ? 'var(--green-glow)' : isCurrent ? 'var(--gold)' : 'var(--border)',
        color: isDone || isCurrent ? '#fff' : 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        animation: isCurrent ? 'pulse-glow 2s ease-in-out infinite' : 'none',
      }}>
        {isDone ? '✓' : checkpoint.index + 1}
      </span>

      {/* Label */}
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isLocked ? 'var(--text-muted)' : 'var(--text)' }}>
          {isLocked ? `???` : checkpoint.roomId}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {isDone ? 'Completed' : isCurrent ? 'Your current quest' : 'Locked'}
        </p>
      </div>

      {/* Difficulty */}
      {!isLocked && (
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {['⭐','⭐⭐','⭐⭐⭐','⭐','⭐⭐','⭐⭐⭐','⭐','⭐⭐','⭐⭐⭐','🔥'][checkpoint.index]}
        </span>
      )}

      {isLocked && <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>🔒</span>}
    </motion.button>
  )
}

export default function CheckpointsList() {
  const navigate = useNavigate()
  const { player } = usePlayer()

  if (!player) return null

  function getState(index) {
    if (index < player.current_step)  return 'done'
    if (index === player.current_step) return 'current'
    return 'locked'
  }

  function handleTap(checkpoint, state) {
    if (state === 'current') { navigate('/game'); return }
    // done — show a quick modal? For now just navigate to game with a note
    // (no extra modal needed — YAGNI)
  }

  return (
    <div className="screen">
      <div>
        <h1 style={{ fontSize: '1.1rem' }}>Checkpoints</h1>
        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
          {player.current_step} of 10 completed
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {CHECKPOINTS.map(cp => (
          <CheckpointRow
            key={cp.index}
            checkpoint={cp}
            state={getState(cp.index)}
            onTap={() => handleTap(cp, getState(cp.index))}
          />
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Verify build**
```bash
cd /Users/rhythm.chawla/carta_repos/treasure && npx vite build 2>&1 | tail -3
```

**Step 3: Commit**
```bash
git add src/screens/CheckpointsList.jsx
git commit -m "feat: checkpoints list screen with lock states"
```

---

### Task 7: Map Screen

**Files:**
- Modify: `src/screens/MapScreen.jsx`

**Step 1: Write `src/screens/MapScreen.jsx`**

```jsx
import { usePlayer } from '../lib/playerContext'
import { CHECKPOINTS, getCheckpoint } from '../lib/checkpoints'
import MapView from '../components/MapView'

export default function MapScreen() {
  const { player } = usePlayer()
  if (!player) return null

  const completedRooms = CHECKPOINTS
    .slice(0, player.current_step)
    .map(c => c.roomId)
  const currentCheckpoint = getCheckpoint(player.current_step)

  return (
    <div className="screen">
      <div>
        <h1 style={{ fontSize: '1.1rem' }}>Office Map</h1>
        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
          Tap a pin to see its status.
        </p>
      </div>
      <MapView
        completedRooms={completedRooms}
        currentRoom={currentCheckpoint?.roomId}
      />
    </div>
  )
}
```

**Step 2: Verify build**
```bash
cd /Users/rhythm.chawla/carta_repos/treasure && npx vite build 2>&1 | tail -3
```

**Step 3: Commit**
```bash
git add src/screens/MapScreen.jsx
git commit -m "feat: map as standalone screen"
```

---

### Task 8: Lucky Draw — Random Logic + Tests

**Files:**
- Create: `src/lib/luckyDraw.js`
- Create: `src/lib/luckyDraw.test.js`

**Step 1: Write `src/lib/luckyDraw.js`**

```js
export function pickWinners(players, count) {
  if (players.length === 0) return []
  const n = Math.min(count, players.length)
  const arr = [...players]

  // Fisher-Yates shuffle using crypto.getRandomValues for true randomness
  const randomBytes = new Uint32Array(arr.length)
  crypto.getRandomValues(randomBytes)

  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomBytes[i] % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr.slice(0, n)
}
```

**Step 2: Write `src/lib/luckyDraw.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { pickWinners } from './luckyDraw'

describe('pickWinners', () => {
  const players = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Carol' },
    { id: '4', name: 'Dave' },
    { id: '5', name: 'Eve' },
    { id: '6', name: 'Frank' },
    { id: '7', name: 'Grace' },
  ]

  it('returns exactly count winners', () => {
    expect(pickWinners(players, 5)).toHaveLength(5)
  })

  it('returns all players when count >= length', () => {
    expect(pickWinners(players, 10)).toHaveLength(7)
  })

  it('returns empty array for empty players', () => {
    expect(pickWinners([], 5)).toHaveLength(0)
  })

  it('returns unique winners (no duplicates)', () => {
    const winners = pickWinners(players, 5)
    const ids = winners.map(w => w.id)
    expect(new Set(ids).size).toBe(5)
  })

  it('winners are a subset of the original players', () => {
    const winners = pickWinners(players, 5)
    const playerIds = new Set(players.map(p => p.id))
    winners.forEach(w => expect(playerIds.has(w.id)).toBe(true))
  })

  it('does not mutate the original array', () => {
    const original = [...players]
    pickWinners(players, 5)
    expect(players).toEqual(original)
  })

  it('produces different results across runs (probabilistic)', () => {
    const runs = Array.from({ length: 10 }, () =>
      pickWinners(players, 3).map(w => w.id).join(',')
    )
    const unique = new Set(runs)
    // With 7 players choosing 3, P(all 10 identical) ≈ 1/35^9 ≈ 0. Failing means broken RNG.
    expect(unique.size).toBeGreaterThan(1)
  })
})
```

**Step 3: Run tests**
```bash
cd /Users/rhythm.chawla/carta_repos/treasure && npx vitest run 2>&1 | tail -8
```
Expected: 15/15 tests pass (8 original + 7 new).

**Step 4: Commit**
```bash
git add src/lib/luckyDraw.js src/lib/luckyDraw.test.js
git commit -m "feat: lucky draw random selection with crypto.getRandomValues + tests"
```

---

### Task 9: Lucky Draw Screen

**Files:**
- Modify: `src/screens/LuckyDraw.jsx`
- Modify: `.env.example` (add VITE_LUCKY_DRAW_PIN)

**Step 1: Add PIN to `.env.example`**

Append to `.env.example`:
```
VITE_LUCKY_DRAW_PIN=1234
```

Also add it to `.env` (if it exists):
```
VITE_LUCKY_DRAW_PIN=1234
```

**Step 2: Write `src/screens/LuckyDraw.jsx`**

```jsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '../lib/supabase'
import { pickWinners } from '../lib/luckyDraw'

const DRAW_COUNT = 5
const SPIN_DURATION_MS = 600   // how long each slot spins before landing
const SLOT_INTERVAL_MS = 1200  // gap between each slot landing

function SlotReel({ eligibleNames, winner, spinning, landed }) {
  const intervalRef = useRef(null)
  const [displayName, setDisplayName] = useState(eligibleNames[0] ?? '')

  useEffect(() => {
    if (spinning && !landed) {
      let i = 0
      intervalRef.current = setInterval(() => {
        i = (i + 1) % eligibleNames.length
        setDisplayName(eligibleNames[i])
      }, 80)
    }
    if (landed) {
      clearInterval(intervalRef.current)
      setDisplayName(winner)
    }
    return () => clearInterval(intervalRef.current)
  }, [spinning, landed, winner, eligibleNames])

  return (
    <motion.div
      animate={landed ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 0.3 }}
      style={{
        background: landed ? 'var(--green-light)' : 'var(--bg)',
        border: `2px solid ${landed ? 'var(--green-glow)' : 'var(--border)'}`,
        borderRadius: 8,
        padding: '0.75rem 1rem',
        textAlign: 'center',
        fontSize: '1rem',
        fontWeight: landed ? 'bold' : 'normal',
        color: landed ? 'var(--green-glow)' : 'var(--text-muted)',
        minHeight: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        letterSpacing: '0.03em',
        transition: 'background 0.2s, border-color 0.2s',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
    >
      {spinning || landed ? displayName : '· · ·'}
    </motion.div>
  )
}

export default function LuckyDraw() {
  const [eligible, setEligible] = useState([])
  const [loading, setLoading] = useState(true)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [winners, setWinners] = useState([])
  const [landedCount, setLandedCount] = useState(0)
  const [drawn, setDrawn] = useState(false)

  const CORRECT_PIN = import.meta.env.VITE_LUCKY_DRAW_PIN ?? '1234'

  useEffect(() => {
    async function fetchEligible() {
      const { data } = await supabase
        .from('players')
        .select('id, name')
        .not('completed_at', 'is', null)
        .eq('is_first_place', false)
      setEligible(data ?? [])
      setLoading(false)
    }
    fetchEligible()
  }, [])

  function handleUnlock(e) {
    e.preventDefault()
    if (pin === CORRECT_PIN) {
      setUnlocked(true)
      setPinError('')
    } else {
      setPinError('Wrong PIN. Try again.')
      setPin('')
    }
  }

  function handleDraw() {
    if (drawn || drawing || eligible.length === 0) return
    const picked = pickWinners(eligible, DRAW_COUNT)
    setWinners(picked)
    setDrawing(true)
    setLandedCount(0)

    picked.forEach((_, i) => {
      setTimeout(() => {
        setLandedCount(prev => prev + 1)
        if (i === picked.length - 1) {
          setDrawing(false)
          setDrawn(true)
        }
      }, SPIN_DURATION_MS + i * SLOT_INTERVAL_MS)
    })
  }

  const eligibleNames = eligible.map(p => p.name)
  const isSpinning = drawing || landedCount > 0

  return (
    <div className="screen">
      <div>
        <h1 style={{ fontSize: '1.1rem' }}>Lucky Draw 🎲</h1>
        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
          {loading
            ? 'Loading...'
            : `${eligible.length} eligible explorer${eligible.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* 5 slots */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Winners
        </p>
        {Array.from({ length: DRAW_COUNT }).map((_, i) => (
          <SlotReel
            key={i}
            eligibleNames={eligibleNames.length > 0 ? eligibleNames : ['—']}
            winner={winners[i]?.name ?? ''}
            spinning={isSpinning}
            landed={landedCount > i}
          />
        ))}
      </div>

      {/* PIN or Draw button */}
      {!unlocked ? (
        <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            className="input-field"
            type="password"
            placeholder="Organizer PIN..."
            value={pin}
            onChange={e => setPin(e.target.value)}
            maxLength={8}
          />
          {pinError && <p className="text-error" style={{ fontSize: '0.875rem' }}>{pinError}</p>}
          <button type="submit" className="btn-secondary">Unlock Draw</button>
        </form>
      ) : (
        <button
          className="btn-primary"
          onClick={handleDraw}
          disabled={drawing || drawn || eligible.length === 0}
        >
          {drawn ? 'Draw Complete 🎉' : drawing ? 'Drawing...' : `Draw ${Math.min(DRAW_COUNT, eligible.length)} Winners`}
        </button>
      )}

      {/* Eligible list */}
      {eligible.length > 0 && (
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Eligible Explorers
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {eligible.map(p => {
              const isWinner = drawn && winners.some(w => w.id === p.id)
              return (
                <span
                  key={p.id}
                  style={{
                    background: isWinner ? 'var(--green-light)' : 'var(--bg-card)',
                    border: `1px solid ${isWinner ? 'var(--green-glow)' : 'var(--border)'}`,
                    color: isWinner ? 'var(--green-glow)' : 'var(--text-muted)',
                    borderRadius: 20,
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: isWinner ? 'bold' : 'normal',
                    opacity: drawn && !isWinner ? 0.45 : 1,
                    transition: 'all 0.3s',
                  }}
                >
                  {isWinner && '✓ '}{p.name}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {eligible.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            "No explorers in the draw yet... the jungle awaits its finishers."
            <br />— Fairy
          </p>
        </div>
      )}
    </div>
  )
}
```

**Step 3: Verify build + tests**
```bash
cd /Users/rhythm.chawla/carta_repos/treasure && npx vite build 2>&1 | tail -3
npx vitest run 2>&1 | tail -5
```
Expected: build passes, 15/15 tests.

**Step 4: Commit**
```bash
git add src/screens/LuckyDraw.jsx .env.example
git commit -m "feat: lucky draw screen with PIN gate and slot machine animation"
```

---

### Task 10: Final Polish + Push

**Step 1: Remove the Map toggle from Game.jsx**

The map is now a standalone screen at `/map`. In `src/screens/Game.jsx`, find and remove:
- The `mapOpen` state (`const [mapOpen, setMapOpen] = useState(false)`)
- The map toggle button (`▲ Hide Map` / `▼ Show Map`)
- The `{mapOpen && <MapView ... />}` render
- The `MapView` import

**Step 2: Run full test suite**
```bash
cd /Users/rhythm.chawla/carta_repos/treasure && npx vitest run
```
Expected: 15/15 pass.

**Step 3: Run final build**
```bash
npx vite build 2>&1 | tail -5
```

**Step 4: Final commit + push**
```bash
git add -A
git commit -m "feat: remove inline map from game screen (now standalone /map route)"
git push origin main
```
