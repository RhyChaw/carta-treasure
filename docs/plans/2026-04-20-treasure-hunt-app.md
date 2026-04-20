# Treasure Hunt App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-first office treasure hunt web app ("Lost in the Office Jungle") with 10 QR-gated checkpoints, real-time leaderboard, and a jungle fairy mascot named Fairy.

**Architecture:** Single-page React (Vite) app. Client-side routing with React Router. No auth — player UUID stored in sessionStorage. Supabase for persistence + real-time leaderboard subscriptions. Challenge pages are separate static HTML files under `/challenges/`. Assets served from `/public/assets/`.

**Tech Stack:** React 18, Vite, Supabase JS (`@supabase/supabase-js`), React Router DOM, Motion (already installed), Vitest for logic unit tests.

---

### Task 1: Project Scaffold

**Files:**
- Modify: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `Makefile`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `src/main.jsx`
- Create: `src/App.jsx`

**Step 1: Install dependencies**

```bash
cd /Users/rhythm.chawla/carta_repos/treasure
npm install react react-dom react-router-dom @supabase/supabase-js
npm install -D vite @vitejs/plugin-react vitest @testing-library/react jsdom
```

Expected: `node_modules/` updated, `package-lock.json` updated.

**Step 2: Write `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

**Step 3: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Lost in the Office Jungle</title>
    <link rel="icon" type="image/png" href="/assets/host.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Step 4: Write `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

**Step 5: Write `src/App.jsx` (stub — just routes placeholder)**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Registration from './screens/Registration'
import Game from './screens/Game'
import Scanner from './screens/Scanner'
import Victory from './screens/Victory'
import Leaderboard from './screens/Leaderboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Registration />} />
      <Route path="/game" element={<Game />} />
      <Route path="/scan" element={<Scanner />} />
      <Route path="/victory" element={<Victory />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
```

**Step 6: Write `Makefile`**

```makefile
.PHONY: dev build preview test

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

test:
	npm run test
```

**Step 7: Update `package.json` scripts**

Add to the `"scripts"` key (create it if missing):
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```
Keep `"dependencies"` and `"devDependencies"` as npm installed them.

**Step 8: Write `.env.example`**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Step 9: Write `.gitignore`**

```
node_modules/
dist/
.env
.env.local
*.local
```

**Step 10: Copy assets to public/**

```bash
mkdir -p /Users/rhythm.chawla/carta_repos/treasure/public/assets
cp /Users/rhythm.chawla/carta_repos/treasure/assets/office.png /Users/rhythm.chawla/carta_repos/treasure/public/assets/
cp /Users/rhythm.chawla/carta_repos/treasure/assets/host.png /Users/rhythm.chawla/carta_repos/treasure/public/assets/
```

**Step 11: Create stub screen files so Vite doesn't error**

Create these as empty stubs (just export default function returning `<div />`):
- `src/screens/Registration.jsx`
- `src/screens/Game.jsx`
- `src/screens/Scanner.jsx`
- `src/screens/Victory.jsx`
- `src/screens/Leaderboard.jsx`
- `src/styles/global.css` (empty for now)

**Step 12: Verify dev server starts**

```bash
make dev
```

Expected: Vite dev server starts on `http://localhost:5173`. Open in browser — blank page, no console errors.

**Step 13: Commit**

```bash
git add -A
git commit -m "feat: scaffold vite+react project with makefile"
```

---

### Task 2: Global Styles (Jungle Theme)

**Files:**
- Create: `src/styles/global.css`

**Step 1: Write global CSS**

```css
:root {
  --bg: #0A2A1B;
  --bg-card: #0d3522;
  --bg-card-hover: #114028;
  --green-glow: #4ADE80;
  --green-dim: #22c55e;
  --gold: #FBBF24;
  --gold-dim: #d97706;
  --text: #e8f5e2;
  --text-muted: #86a87a;
  --error: #ef4444;
  --border: #1e5c35;
  --border-bright: #2d7a4a;
  --font: 'Courier New', Courier, monospace;
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

input {
  font-family: var(--font);
}

.btn-primary {
  background: var(--green-glow);
  color: #0A2A1B;
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
  color: var(--gold);
  border: 1px solid var(--gold-dim);
  padding: 0.65rem 1.2rem;
  border-radius: 8px;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.15s;
}
.btn-secondary:active { background: rgba(251,191,36,0.1); }

.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  padding: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
}

.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  gap: 1rem;
  overflow-y: auto;
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
}

h1 { font-size: 1.5rem; letter-spacing: 0.06em; color: var(--green-glow); text-transform: uppercase; }
h2 { font-size: 1.15rem; letter-spacing: 0.04em; color: var(--gold); }
h3 { font-size: 1rem; color: var(--text); }

.text-muted { color: var(--text-muted); font-size: 0.875rem; }
.text-gold { color: var(--gold); }
.text-green { color: var(--green-glow); }
.text-error { color: var(--error); }

.input-field {
  background: #071e12;
  border: 1px solid var(--border-bright);
  border-radius: 8px;
  color: var(--text);
  font-size: 1rem;
  padding: 0.8rem 1rem;
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}
.input-field:focus { border-color: var(--green-glow); }
.input-field::placeholder { color: var(--text-muted); }

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 6px var(--gold), 0 0 12px var(--gold-dim); }
  50% { box-shadow: 0 0 14px var(--gold), 0 0 28px var(--gold-dim); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in { animation: fadeIn 0.3s ease forwards; }
```

**Step 2: Verify styles load**

Run `make dev`, open browser. Background should be dark green `#0A2A1B`. If it's white, check that `global.css` is imported in `main.jsx`.

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add jungle theme global styles"
```

---

### Task 3: Supabase Client + Checkpoint Config

**Files:**
- Create: `src/lib/supabase.js`
- Create: `src/lib/checkpoints.js`
- Create: `src/lib/checkpoints.test.js`

**Step 1: Write `src/lib/supabase.js`**

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Step 2: Create `.env` from `.env.example`**

```bash
cp /Users/rhythm.chawla/carta_repos/treasure/.env.example /Users/rhythm.chawla/carta_repos/treasure/.env
```

Then fill in real Supabase credentials (the organizer must do this before the event). For now the app will show a blank/erroring screen if not set — that is acceptable.

**Step 3: Write `src/lib/checkpoints.js`**

```js
export const CHECKPOINTS = [
  {
    index: 0,
    roomId: 'CLOVER',
    passphrase: 'LUCK',
    riddle: "Lucky are those who seek the middle sister. Three rooms stand in a row on the jungle floor — not the first, not the last, but the one fortune favors.",
    hint: "Look at the three rooms in a row in the center of the map.",
    challengeUrl: '/challenges/clover.html',
  },
  {
    index: 1,
    roomId: 'ASH',
    passphrase: 'PLACEHOLDER_ASH',
    riddle: "From the ashes of the old jungle, a mighty chamber arose. It watches over the training grounds where warriors test their strength. Seek the largest room near the northern fighting pit.",
    hint: "Find the large room on the east side, near the gym.",
    challengeUrl: '/challenges/ash.html',
  },
  {
    index: 2,
    roomId: 'MAPLE',
    passphrase: 'PLACEHOLDER_MAPLE',
    riddle: "The grandest canopy in the jungle — a round gathering place where the elders once convened. Its leaf adorns a distant nation's flag. Find the great circle table.",
    hint: "A large conference room with a round table in the center-north area.",
    challengeUrl: '/challenges/maple.html',
  },
  {
    index: 3,
    roomId: 'ORCHID',
    passphrase: 'PLACEHOLDER_ORCHID',
    riddle: "Exotic and rare, the jungle's most prized bloom grows near where the healers rest. Seek the flower closest to the place of first aid.",
    hint: "Head to the far east side, near the First Aid / Mother's Room.",
    challengeUrl: '/challenges/orchid.html',
  },
  {
    index: 4,
    roomId: 'HICKORY',
    passphrase: 'PLACEHOLDER_HICKORY',
    riddle: "Tough as old bark and smoky in legend, this tree's wood has fueled a thousand jungle campfires. Seek the southern sibling of Cherry and Ash on the jungle's eastern ridge.",
    hint: "Three large rooms on the east side. You want the southernmost one.",
    challengeUrl: '/challenges/hickory.html',
  },
  {
    index: 5,
    roomId: 'GLASGOW',
    passphrase: 'THEJUNGLEISALIVE',
    riddle: "Not a flower, not a tree — a faraway human settlement at the jungle's forgotten edge. Travel to the farthest northwest outpost, where the dishwashing river flows nearby.",
    hint: "Far northwest corner. Dishwashing room is close by.",
    challengeUrl: '/challenges/glasgow.html',
  },
  {
    index: 6,
    roomId: 'IRIS',
    passphrase: 'WALNUT',
    riddle: "The rainbow goddess planted her flower in the southern gardens, beside the ancient hall of knowledge. Seek the colorful bloom near the Library.",
    hint: "South side of the map, near the Library room.",
    challengeUrl: '/challenges/iris.html',
  },
  {
    index: 7,
    roomId: 'VIOLET',
    passphrase: 'PLACEHOLDER_VIOLET_NUMBER',
    riddle: "Shrinking and shy, a tiny purple bloom hides in the jungle's far northeast corner, high above where explorers enter and exit.",
    hint: "Far northeast corner, near the Employee Entrance.",
    challengeUrl: '/challenges/violet.html',
  },
  {
    index: 8,
    roomId: 'CHERRY',
    passphrase: '36',
    riddle: "Sweet blossoms fall like pink rain in the middle of the eastern ridge. Between the Ash summit above and the Hickory valley below, the cherry grove blooms eternal.",
    hint: "Middle of the three large east-side rooms.",
    challengeUrl: '/challenges/cherry.html',
  },
  {
    index: 9,
    roomId: 'LIBRARY',
    passphrase: 'PLACEHOLDER_LIBRARY',
    riddle: "Your journey nears its end, brave explorer. All jungle knowledge flows to one sacred place — the ancient archive where wisdom sleeps. Go to where books live... and find the fairy's final trial.",
    hint: "The Library. South side. You're almost there.",
    challengeUrl: '/challenges/library.html',
  },
]

export function getCheckpoint(index) {
  return CHECKPOINTS[index] ?? null
}

export function validatePassphrase(checkpoint, input) {
  return checkpoint.passphrase.toUpperCase() === input.trim().toUpperCase()
}

export function parseQrCode(raw) {
  if (!raw?.startsWith('JUNGLE_HUNT_')) return null
  return raw.replace('JUNGLE_HUNT_', '')
}
```

**Step 4: Write `src/lib/checkpoints.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { validatePassphrase, parseQrCode, getCheckpoint, CHECKPOINTS } from './checkpoints'

describe('validatePassphrase', () => {
  it('accepts exact match', () => {
    expect(validatePassphrase(CHECKPOINTS[0], 'LUCK')).toBe(true)
  })
  it('is case insensitive', () => {
    expect(validatePassphrase(CHECKPOINTS[0], 'luck')).toBe(true)
    expect(validatePassphrase(CHECKPOINTS[0], 'Luck')).toBe(true)
  })
  it('trims whitespace', () => {
    expect(validatePassphrase(CHECKPOINTS[0], '  LUCK  ')).toBe(true)
  })
  it('rejects wrong passphrase', () => {
    expect(validatePassphrase(CHECKPOINTS[0], 'WRONG')).toBe(false)
  })
})

describe('parseQrCode', () => {
  it('parses valid QR code', () => {
    expect(parseQrCode('JUNGLE_HUNT_MAPLE')).toBe('MAPLE')
  })
  it('returns null for invalid code', () => {
    expect(parseQrCode('not-a-qr-code')).toBeNull()
    expect(parseQrCode(null)).toBeNull()
  })
})

describe('getCheckpoint', () => {
  it('returns checkpoint by index', () => {
    expect(getCheckpoint(0).roomId).toBe('CLOVER')
    expect(getCheckpoint(9).roomId).toBe('LIBRARY')
  })
  it('returns null for out-of-bounds', () => {
    expect(getCheckpoint(10)).toBeNull()
    expect(getCheckpoint(-1)).toBeNull()
  })
})
```

**Step 5: Run tests**

```bash
make test
```

Expected: All 8 tests PASS. If vitest is not found, run `npx vitest run`.

**Step 6: Commit**

```bash
git add src/lib/
git commit -m "feat: add supabase client and checkpoint config with tests"
```

---

### Task 4: Player Context (sessionStorage state)

**Files:**
- Create: `src/lib/playerContext.jsx`

**Step 1: Write `src/lib/playerContext.jsx`**

```jsx
import { createContext, useContext, useState, useEffect } from 'react'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [player, setPlayer] = useState(() => {
    try {
      const saved = sessionStorage.getItem('jungle_player')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (player) {
      sessionStorage.setItem('jungle_player', JSON.stringify(player))
    } else {
      sessionStorage.removeItem('jungle_player')
    }
  }, [player])

  function login(playerData) {
    setPlayer(playerData)
  }

  function logout() {
    setPlayer(null)
  }

  function updateStep(step) {
    setPlayer(prev => ({ ...prev, current_step: step }))
  }

  return (
    <PlayerContext.Provider value={{ player, login, logout, updateStep }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
```

**Step 2: Wrap App in provider — update `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { PlayerProvider } from './lib/playerContext'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

**Step 3: Commit**

```bash
git add src/lib/playerContext.jsx src/main.jsx
git commit -m "feat: add player context with sessionStorage persistence"
```

---

### Task 5: Registration Screen

**Files:**
- Modify: `src/screens/Registration.jsx`

**Step 1: Write `src/screens/Registration.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { usePlayer } from '../lib/playerContext'

export default function Registration() {
  const navigate = useNavigate()
  const { login, player } = usePlayer()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRejoin, setShowRejoin] = useState(false)
  const [existingPlayers, setExistingPlayers] = useState([])

  // If player already registered, redirect to game
  if (player) {
    navigate('/game')
    return null
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const { data, error: dbError } = await supabase
        .from('players')
        .insert({ name: name.trim() })
        .select()
        .single()
      if (dbError) throw dbError
      login(data)
      navigate('/game')
    } catch (err) {
      setError('Something went wrong. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleRejoin() {
    setLoading(true)
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)
    setExistingPlayers(data ?? [])
    setShowRejoin(true)
    setLoading(false)
  }

  function pickExistingPlayer(p) {
    login(p)
    navigate('/game')
  }

  return (
    <div className="screen-center" style={{ gap: '1.5rem' }}>
      <motion.img
        src="/assets/host.png"
        alt="Fairy"
        style={{ width: 160, imageRendering: 'pixelated' }}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <h1>Lost in the Office Jungle</h1>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          A Treasure Hunt Adventure
        </p>
      </div>

      <div className="card fade-in" style={{ width: '100%', maxWidth: 360 }}>
        <p style={{ fontStyle: 'italic', color: 'var(--green-glow)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          "Brave explorer! The jungle calls to you. Tell me your name and I shall guide your path through the ancient groves..."
          <br />— Fairy
        </p>

        {!showRejoin ? (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              className="input-field"
              placeholder="Enter your explorer name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
              autoFocus
            />
            {error && <p className="text-error" style={{ fontSize: '0.875rem' }}>{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading || !name.trim()}>
              {loading ? 'Entering the jungle...' : 'Enter the Jungle'}
            </button>
            <button type="button" className="btn-ghost" onClick={handleRejoin} disabled={loading}>
              I already registered →
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Pick your name (honor system!):
            </p>
            {existingPlayers.map(p => (
              <button
                key={p.id}
                className="btn-secondary"
                onClick={() => pickExistingPlayer(p)}
                style={{ textAlign: 'left' }}
              >
                {p.name}
                {p.completed_at && ' ✓'}
              </button>
            ))}
            <button className="btn-ghost" onClick={() => setShowRejoin(false)}>← Back</button>
          </div>
        )}
      </div>

      <button className="btn-ghost" onClick={() => navigate('/leaderboard')}>
        View Leaderboard
      </button>
    </div>
  )
}
```

**Step 2: Verify in browser**

`make dev` → open `http://localhost:5173`. Should see: floating fairy image, "LOST IN THE OFFICE JUNGLE" title, name input, "Enter the Jungle" button. Fairy should float up and down.

Note: Register button will fail without real Supabase credentials. That's expected.

**Step 3: Commit**

```bash
git add src/screens/Registration.jsx
git commit -m "feat: registration screen with fairy animation and rejoin flow"
```

---

### Task 6: Game Screen

**Files:**
- Modify: `src/screens/Game.jsx`
- Create: `src/components/ProgressBar.jsx`
- Create: `src/components/RiddleCard.jsx`
- Create: `src/components/Toast.jsx`

**Step 1: Write `src/components/ProgressBar.jsx`**

```jsx
import { motion } from 'motion/react'

export default function ProgressBar({ current, total }) {
  const pct = (current / total) * 100
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Progress
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--green-glow)', fontWeight: 'bold' }}>
          {current} / {total}
        </span>
      </div>
      <div style={{ height: 8, background: '#071e12', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <motion.div
          style={{ height: '100%', background: 'var(--green-glow)', borderRadius: 4 }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
```

**Step 2: Write `src/components/Toast.jsx`**

```jsx
import { motion, AnimatePresence } from 'motion/react'

export default function Toast({ message, type = 'success', visible }) {
  const bg = type === 'success' ? 'var(--green-glow)' : type === 'error' ? 'var(--error)' : 'var(--gold)'
  const color = type === 'success' ? '#0A2A1B' : '#fff'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={type === 'error' ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, 0] } : { opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            background: bg,
            color,
            padding: '0.75rem 1rem',
            borderRadius: 8,
            fontSize: '0.875rem',
            fontWeight: 'bold',
            textAlign: 'center',
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 340,
            width: 'calc(100% - 2.5rem)',
            zIndex: 100,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Step 3: Write `src/components/RiddleCard.jsx`**

```jsx
import { useState } from 'react'
import { motion } from 'motion/react'

export default function RiddleCard({ checkpoint, onScan }) {
  const [showHint, setShowHint] = useState(false)

  if (!checkpoint) return null

  return (
    <motion.div
      className="card fade-in"
      key={checkpoint.index}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{
          background: 'var(--gold)',
          color: '#0A2A1B',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          padding: '0.2rem 0.5rem',
          borderRadius: 4,
          letterSpacing: '0.05em',
        }}>
          CHECKPOINT {checkpoint.index + 1} / 10
        </span>
      </div>

      <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
        "The fairy whispers..."
      </p>

      <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        {checkpoint.riddle}
      </p>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="btn-secondary"
          onClick={() => setShowHint(h => !h)}
          style={{ flex: 1 }}
        >
          {showHint ? 'Hide Hint' : 'Need a Hint?'}
        </button>
        <button className="btn-primary" onClick={onScan} style={{ flex: 2 }}>
          Scan QR Code
        </button>
      </div>

      {showHint && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ marginTop: '0.75rem', color: 'var(--gold)', fontSize: '0.875rem', fontStyle: 'italic' }}
        >
          💡 {checkpoint.hint}
        </motion.p>
      )}
    </motion.div>
  )
}
```

**Step 4: Write `src/screens/Game.jsx`**

```jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { usePlayer } from '../lib/playerContext'
import { CHECKPOINTS, getCheckpoint, validatePassphrase } from '../lib/checkpoints'
import ProgressBar from '../components/ProgressBar'
import RiddleCard from '../components/RiddleCard'
import Toast from '../components/Toast'
import MapView from '../components/MapView'

export default function Game() {
  const navigate = useNavigate()
  const { player, updateStep, logout } = usePlayer()
  const [passphrase, setPassphrase] = useState('')
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })
  const [loading, setLoading] = useState(false)
  const [scanResult, setScanResult] = useState(null) // roomId if correct room scanned
  const [mapOpen, setMapOpen] = useState(false)

  useEffect(() => {
    if (!player) navigate('/')
  }, [player, navigate])

  // Read pending scan result from sessionStorage (set by Scanner screen)
  useEffect(() => {
    const pending = sessionStorage.getItem('jungle_scan_result')
    if (pending) {
      sessionStorage.removeItem('jungle_scan_result')
      handleScanResult(pending)
    }
  }, [])

  function showToast(message, type = 'success') {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500)
  }

  function handleScanResult(scannedRoomId) {
    const current = getCheckpoint(player.current_step)
    if (!current) return
    if (scannedRoomId === current.roomId) {
      setScanResult(scannedRoomId)
      showToast(`✨ You found ${scannedRoomId}! Now solve the challenge.`, 'success')
    } else {
      showToast("The spirits here don't welcome us yet... we must look elsewhere, explorer.", 'error')
    }
  }

  async function handlePassphraseSubmit(e) {
    e.preventDefault()
    const current = getCheckpoint(player.current_step)
    if (!current || !validatePassphrase(current, passphrase)) {
      showToast("The fairy shakes her head... that's not quite right. Try again, explorer.", 'error')
      return
    }
    setLoading(true)
    try {
      await supabase.from('progress').insert({
        player_id: player.id,
        checkpoint_index: current.index,
        room_id: current.roomId,
      })
      const nextStep = player.current_step + 1
      const isComplete = nextStep >= CHECKPOINTS.length

      if (isComplete) {
        const { data: finishers } = await supabase
          .from('players')
          .select('id')
          .not('completed_at', 'is', null)
        const isFirst = !finishers || finishers.length === 0
        await supabase.from('players').update({
          completed_at: new Date().toISOString(),
          is_first_place: isFirst,
          current_step: nextStep,
        }).eq('id', player.id)
        updateStep(nextStep)
        navigate('/victory')
        return
      }

      await supabase.from('players').update({ current_step: nextStep }).eq('id', player.id)
      updateStep(nextStep)
      setScanResult(null)
      setPassphrase('')
      showToast("Brilliant! The path forward reveals itself!", 'success')
    } catch (err) {
      showToast('Something went wrong. Try again.', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!player) return null
  const currentCheckpoint = getCheckpoint(player.current_step)
  const completedCheckpoints = CHECKPOINTS.slice(0, player.current_step)

  return (
    <div className="screen">
      <Toast {...toast} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Explorer
          </p>
          <p style={{ fontWeight: 'bold', color: 'var(--green-glow)' }}>{player.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-ghost" onClick={() => navigate('/leaderboard')}>Board</button>
          <button className="btn-ghost" onClick={() => { logout(); navigate('/') }}>⤶</button>
        </div>
      </div>

      <ProgressBar current={player.current_step} total={CHECKPOINTS.length} />

      {/* Riddle or passphrase entry */}
      {!scanResult ? (
        <RiddleCard
          checkpoint={currentCheckpoint}
          onScan={() => navigate('/scan')}
        />
      ) : (
        <motion.div className="card fade-in" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
            "Enter the passphrase from the challenge, explorer..."
          </p>
          <form onSubmit={handlePassphraseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              className="input-field"
              placeholder="Enter passphrase..."
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              autoFocus
              autoCapitalize="none"
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={() => { setScanResult(null); setPassphrase('') }}>
                ← Back
              </button>
              <button type="submit" className="btn-primary" disabled={loading || !passphrase.trim()}>
                {loading ? 'Checking...' : 'Submit'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Map toggle */}
      <div>
        <button
          className="btn-ghost"
          onClick={() => setMapOpen(o => !o)}
          style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0' }}
        >
          {mapOpen ? '▲ Hide Map' : '▼ Show Map'}
        </button>
        {mapOpen && <MapView completedRooms={completedCheckpoints.map(c => c.roomId)} currentRoom={currentCheckpoint?.roomId} />}
      </div>

      {/* Completed checkpoints */}
      {completedCheckpoints.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {completedCheckpoints.map(c => (
            <span key={c.roomId} style={{
              background: '#0d3522',
              border: '1px solid var(--green-glow)',
              color: 'var(--green-glow)',
              borderRadius: 20,
              padding: '0.2rem 0.6rem',
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
            }}>
              ✓ {c.roomId}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 5: Verify in browser**

After registering (or mocking a player in sessionStorage), you should see the game screen with: player name, progress bar at 0/10, riddle card for CLOVER, "Show Map" toggle.

**Step 6: Commit**

```bash
git add src/screens/Game.jsx src/components/
git commit -m "feat: game screen with riddle card, progress bar, and passphrase entry"
```

---

### Task 7: QR Scanner Screen

**Files:**
- Modify: `src/screens/Scanner.jsx`

**Step 1: Write `src/screens/Scanner.jsx`**

```jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseQrCode } from '../lib/checkpoints'

export default function Scanner() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState('')
  const detectorRef = useRef(null)
  const rafRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      if ('BarcodeDetector' in window) {
        detectorRef.current = new BarcodeDetector({ formats: ['qr_code'] })
        rafRef.current = requestAnimationFrame(scanFrame)
      } else {
        setError("QR scanner not supported in this browser. Use manual entry below.")
      }
    } catch (err) {
      setError("Camera access denied. Use manual entry below.")
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  async function scanFrame() {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }
    try {
      const barcodes = await detectorRef.current.detect(videoRef.current)
      if (barcodes.length > 0) {
        const roomId = parseQrCode(barcodes[0].rawValue)
        if (roomId) {
          handleResult(roomId)
          return
        }
      }
    } catch {}
    rafRef.current = requestAnimationFrame(scanFrame)
  }

  function handleResult(roomId) {
    stopCamera()
    sessionStorage.setItem('jungle_scan_result', roomId)
    navigate('/game')
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    const raw = manualCode.trim().toUpperCase()
    const roomId = parseQrCode(`JUNGLE_HUNT_${raw}`) ?? parseQrCode(raw)
    if (roomId) {
      handleResult(roomId)
    } else {
      setError("That doesn't look like a valid jungle code. Try again.")
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Camera feed */}
      <video
        ref={videoRef}
        style={{ flex: 1, objectFit: 'cover', width: '100%' }}
        playsInline
        muted
      />

      {/* Viewfinder overlay */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          width: 220, height: 220, border: '2px solid var(--green-glow)',
          borderRadius: 12, boxShadow: '0 0 0 2000px rgba(0,0,0,0.45)',
        }} />
      </div>

      {/* Close button */}
      <button
        onClick={() => navigate('/game')}
        style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%', width: 40, height: 40, fontSize: '1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ✕
      </button>

      {/* Helper text */}
      <p style={{
        position: 'absolute', top: '50%', marginTop: 130,
        width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem',
      }}>
        Point at the QR code...
      </p>

      {/* Bottom panel - manual entry */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(10,42,27,0.95)', padding: '1rem 1.25rem 2rem',
        borderTop: '1px solid var(--border)',
      }}>
        {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{error}</p>}
        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="input-field"
            placeholder="Or type room code (e.g. CLOVER)"
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            autoCapitalize="characters"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.8rem 1rem' }}>
            GO
          </button>
        </form>
      </div>
    </div>
  )
}
```

**Step 2: Verify in browser**

Navigate to `/scan`. Should see camera feed (or error if denied), green viewfinder, manual entry at bottom. Typing "CLOVER" and pressing GO should navigate back to `/game` and show the correct-room toast.

**Step 3: Commit**

```bash
git add src/screens/Scanner.jsx
git commit -m "feat: QR scanner with BarcodeDetector API and manual fallback"
```

---

### Task 8: Map View Component

**Files:**
- Create: `src/components/MapView.jsx`

Room coordinates from spec (x%, y% from top-left, remapped to the map image):

**Step 1: Write `src/components/MapView.jsx`**

```jsx
import { useRef, useState, useEffect } from 'react'

const CHECKPOINT_ROOMS = ['CLOVER', 'ASH', 'MAPLE', 'ORCHID', 'HICKORY', 'GLASGOW', 'IRIS', 'VIOLET', 'CHERRY', 'LIBRARY']

const ROOM_PINS = {
  GLASGOW:    { x: 4.5,  y: 4   },
  MAPLE:      { x: 44,   y: 14  },
  ASH:        { x: 71.5, y: 12  },
  VIOLET:     { x: 84,   y: 7   },
  ORCHID:     { x: 84.5, y: 38  },
  HICKORY:    { x: 71.5, y: 40  },
  CHERRY:     { x: 71.5, y: 27  },
  CLOVER:     { x: 46,   y: 37  },
  IRIS:       { x: 68.5, y: 52  },
  LIBRARY:    { x: 64,   y: 49  },
}

export default function MapView({ completedRooms = [], currentRoom }) {
  const containerRef = useRef(null)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      if (containerRef.current) {
        const containerW = containerRef.current.offsetWidth
        const scale = containerW / img.naturalWidth
        setImgSize({ w: containerW, h: img.naturalHeight * scale })
      }
    }
    img.src = '/assets/office.png'
  }, [])

  function getPinColor(roomId) {
    if (completedRooms.includes(roomId)) return '#4ADE80'
    if (roomId === currentRoom) return '#FBBF24'
    return '#374151'
  }

  function getPinLabel(roomId) {
    if (completedRooms.includes(roomId)) return '✓'
    if (roomId === currentRoom) return '●'
    return '○'
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'auto',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: '#071e12',
        touchAction: 'pan-x pan-y',
      }}
    >
      <div style={{ position: 'relative', width: imgSize.w || '100%', height: imgSize.h || 200 }}>
        <img
          src="/assets/office.png"
          alt="Office Map"
          style={{ width: '100%', display: 'block' }}
        />
        {imgSize.w > 0 && CHECKPOINT_ROOMS.map(roomId => {
          const pin = ROOM_PINS[roomId]
          if (!pin) return null
          const isCurrent = roomId === currentRoom
          return (
            <div
              key={roomId}
              title={roomId}
              style={{
                position: 'absolute',
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: 'translate(-50%, -50%)',
                width: isCurrent ? 22 : 18,
                height: isCurrent ? 22 : 18,
                borderRadius: '50%',
                background: getPinColor(roomId),
                border: `2px solid ${isCurrent ? '#fff' : 'rgba(0,0,0,0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                color: '#0A2A1B',
                fontWeight: 'bold',
                cursor: 'default',
                animation: isCurrent ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                zIndex: isCurrent ? 2 : 1,
                boxShadow: isCurrent ? '0 0 8px #FBBF24' : 'none',
              }}
            >
              {getPinLabel(roomId)}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ color: '#4ADE80' }}>● Completed</span>
        <span style={{ color: '#FBBF24' }}>● Current Target</span>
        <span style={{ color: '#374151' }}>● Undiscovered</span>
      </div>
    </div>
  )
}
```

**Step 2: Verify in browser**

On the game screen, tap "Show Map". The office map should render with colored pins. The current target (CLOVER at checkpoint 1) should show a pulsing gold pin.

**Step 3: Commit**

```bash
git add src/components/MapView.jsx
git commit -m "feat: interactive map with checkpoint pins"
```

---

### Task 9: Victory Screen

**Files:**
- Modify: `src/screens/Victory.jsx`

**Step 1: Write `src/screens/Victory.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { usePlayer } from '../lib/playerContext'

export default function Victory() {
  const navigate = useNavigate()
  const { player } = usePlayer()
  const [timeDisplay, setTimeDisplay] = useState('')
  const [isFirst, setIsFirst] = useState(false)

  useEffect(() => {
    if (!player) { navigate('/'); return }
    if (player.completed_at && player.start_time) {
      const seconds = Math.round((new Date(player.completed_at) - new Date(player.start_time)) / 1000)
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      setTimeDisplay(`${m}m ${s}s`)
    }
    setIsFirst(!!player.is_first_place)
  }, [player, navigate])

  if (!player) return null

  return (
    <div className="screen-center" style={{ gap: '1.5rem' }}>
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, -5, 5, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      >
        <img src="/assets/host.png" alt="Fairy" style={{ width: 150 }} />
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        style={{ fontSize: '3rem' }}
      >
        {isFirst ? '👑' : '🌿'}
      </motion.div>

      <div>
        <h1 style={{ fontSize: '1.8rem' }}>
          {isFirst ? 'JUNGLE CHAMPION!' : 'JUNGLE CONQUERED!'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Well done, {player.name}!
        </p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: 360, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {isFirst ? (
          <>
            <p style={{ color: 'var(--gold)', fontWeight: 'bold' }}>🏆 FIRST PLACE — Special Prize Winner!</p>
            <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
              "You've claimed the magical orb, brave explorer! Head to the organizer to claim your special prize. You are excluded from the lucky draw."
              <br />— Fairy
            </p>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--green-glow)', fontWeight: 'bold' }}>🍀 Lucky Draw Entry Confirmed!</p>
            <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
              "The jungle bows to you, explorer. You've earned your place in the lucky draw. Stay close — fortune may still smile upon you!"
              <br />— Fairy
            </p>
          </>
        )}
        {timeDisplay && (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Total time: <span style={{ color: 'var(--text)' }}>{timeDisplay}</span>
          </p>
        )}
      </div>

      <button className="btn-primary" style={{ maxWidth: 360 }} onClick={() => navigate('/leaderboard')}>
        View Leaderboard
      </button>
    </div>
  )
}
```

**Step 2: Verify in browser**

Navigate to `/victory`. Should show fairy animation, crown/leaf emoji (based on `is_first_place`), completion message, and leaderboard button.

**Step 3: Commit**

```bash
git add src/screens/Victory.jsx
git commit -m "feat: victory screen for first place and other completers"
```

---

### Task 10: Leaderboard Screen

**Files:**
- Modify: `src/screens/Leaderboard.jsx`

**Step 1: Write `src/screens/Leaderboard.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'

const RANK_COLORS = ['#FBBF24', '#9ca3af', '#d97706']
const RANK_LABELS = ['🥇', '🥈', '🥉']

function formatTime(seconds) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
    const channel = supabase
      .channel('leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, fetchLeaderboard)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchLeaderboard() {
    const { data } = await supabase.from('leaderboard').select('*')
    setRows(data ?? [])
    setLoading(false)
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="btn-ghost" onClick={() => navigate(-1)}>← Back</button>
        <h1 style={{ fontSize: '1.1rem' }}>Jungle Leaderboard</h1>
        <img src="/assets/host.png" alt="" style={{ width: 28, marginLeft: 'auto' }} />
      </div>

      {loading ? (
        <p className="text-muted" style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
      ) : rows.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
            "No explorers have completed the hunt yet... the jungle awaits its first champion."
            <br />— Fairy
          </p>
        </div>
      ) : (
        <>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>
            {rows.length} explorer{rows.length !== 1 ? 's' : ''} completed the hunt
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {rows.map((row, i) => (
              <motion.div
                key={row.id}
                className="card"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <span style={{
                  fontSize: i < 3 ? '1.3rem' : '0.9rem',
                  color: RANK_COLORS[i] ?? 'var(--text-muted)',
                  minWidth: 28,
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                  {i < 3 ? RANK_LABELS[i] : `#${i + 1}`}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    {row.name}
                    {row.is_first_place && <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--gold)' }}>SPECIAL PRIZE</span>}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {row.is_first_place ? 'Special Prize Winner' : 'Lucky Draw Entry'}
                  </p>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--green-glow)', fontWeight: 'bold' }}>
                  {formatTime(row.time_seconds)}
                </span>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
```

**Step 2: Verify in browser**

Navigate to `/leaderboard`. Should show empty state with fairy quote. Real-time updates will work once Supabase is configured.

**Step 3: Commit**

```bash
git add src/screens/Leaderboard.jsx
git commit -m "feat: leaderboard screen with real-time supabase subscription"
```

---

### Task 11: Challenge Pages (10 HTML files)

**Files:**
- Create: `public/challenges/clover.html`
- Create: `public/challenges/ash.html`
- Create: `public/challenges/maple.html`
- Create: `public/challenges/orchid.html`
- Create: `public/challenges/hickory.html`
- Create: `public/challenges/glasgow.html`
- Create: `public/challenges/iris.html`
- Create: `public/challenges/violet.html`
- Create: `public/challenges/cherry.html`
- Create: `public/challenges/library.html`

**Step 1: Create a shared CSS snippet (inlined in each page)**

Each challenge page uses the same jungle theme inline styles. Here is the base template (repeat for each):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>[CHALLENGE TITLE] — Office Jungle Hunt</title>
  <style>
    :root { --bg:#0A2A1B; --card:#0d3522; --green:#4ADE80; --gold:#FBBF24; --text:#e8f5e2; --muted:#86a87a; --border:#1e5c35; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { background:var(--bg); color:var(--text); font-family:'Courier New',monospace; min-height:100dvh; display:flex; flex-direction:column; align-items:center; padding:1.5rem 1.25rem; gap:1.25rem; }
    .card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:1.25rem; width:100%; max-width:440px; }
    h1 { color:var(--green); font-size:1.2rem; letter-spacing:.06em; text-transform:uppercase; }
    h2 { color:var(--gold); font-size:1rem; }
    p { line-height:1.6; font-size:.95rem; }
    .fairy { width:80px; }
    .muted { color:var(--muted); font-size:.875rem; font-style:italic; }
    .passphrase-box { background:#071e12; border:2px solid var(--green); border-radius:8px; padding:1rem 1.5rem; text-align:center; margin-top:.75rem; }
    .passphrase-box span { font-size:1.5rem; font-weight:bold; color:var(--green); letter-spacing:.1em; }
    input { background:#071e12; border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:'Courier New',monospace; font-size:1rem; padding:.75rem 1rem; width:100%; outline:none; }
    input:focus { border-color:var(--green); }
    button { background:var(--green); color:#0A2A1B; font-family:'Courier New',monospace; font-size:.95rem; font-weight:bold; letter-spacing:.06em; padding:.8rem 1.5rem; border:none; border-radius:8px; cursor:pointer; width:100%; text-transform:uppercase; margin-top:.5rem; }
    .error { color:#ef4444; font-size:.875rem; }
    .success { color:var(--green); font-size:.875rem; }
    em { color:var(--muted); }
  </style>
</head>
<body>
  <img class="fairy" src="/assets/host.png" alt="Fairy" />
  <!-- Content below -->
</body>
</html>
```

**Step 2: Write `public/challenges/clover.html`**

Content after fairy img:
```html
  <div class="card">
    <h1>Checkpoint 1 — Emoji Decode</h1>
    <p class="muted">"Brave explorer! Decode these jungle equations. The last answer is your key..."</p>
  </div>
  <div class="card" style="display:flex;flex-direction:column;gap:.75rem">
    <h2>Decode the Emoji Equations</h2>
    <p>🌳 + 🔥 = <strong>ASH</strong> <em>(example — solved)</em></p>
    <p>🌸 + 🐝 = <strong>HONEY</strong> <em>(example — solved)</em></p>
    <hr style="border-color:var(--border)" />
    <p style="font-size:1.1rem">🍀 + 4️⃣ = <strong>?</strong></p>
    <p class="muted">What does a four-leaf clover represent?</p>
  </div>
  <div class="card">
    <button onclick="document.getElementById('ans').style.display='block';this.style.display='none'">Reveal Answer</button>
    <div id="ans" style="display:none">
      <div class="passphrase-box">
        <p class="muted" style="margin-bottom:.5rem">Your passphrase:</p>
        <span>LUCK</span>
      </div>
      <p class="muted" style="margin-top:.75rem;text-align:center">Type this passphrase into the app to clear Checkpoint 1!</p>
    </div>
  </div>
```

**Step 3: Write `public/challenges/ash.html`**

```html
  <div class="card">
    <h1>Checkpoint 2 — Office GeoGuessr</h1>
    <p class="muted">"The fairy's memory is fading... she remembers seeing this place. Can you identify it?"</p>
  </div>
  <div class="card" style="display:flex;flex-direction:column;gap:.75rem">
    <h2>Where in the Office is This?</h2>
    <p>🖼️ <em>[ORGANIZER: Replace this text with a description or embed a zoomed-in photo of a recognizable office spot]</em></p>
    <p class="muted">Type the name of the location or room shown.</p>
    <input id="guess" placeholder="Your answer..." autocapitalize="characters" />
    <button onclick="checkAsh()">Check Answer</button>
    <p id="ash-result"></p>
  </div>
  <script>
    const ANSWER = 'PLACEHOLDER_ASH'; // ORGANIZER: set this to the correct answer in UPPERCASE
    function checkAsh() {
      const val = document.getElementById('guess').value.trim().toUpperCase();
      const el = document.getElementById('ash-result');
      if (val === ANSWER) {
        el.className = 'success';
        el.textContent = '✓ Correct! Your passphrase is: ' + ANSWER;
      } else {
        el.className = 'error';
        el.textContent = "Not quite... look more carefully at the image.";
      }
    }
  </script>
```

**Step 4: Write `public/challenges/maple.html`**

```html
  <div class="card">
    <h1>Checkpoint 3 — Bracket City</h1>
    <p class="muted">"The jungle spirits must decide their champion. You must guide the tournament to its rightful winner!"</p>
  </div>
  <div class="card" style="display:flex;flex-direction:column;gap:.75rem">
    <h2>Best Office Snack Tournament</h2>
    <p>🏆 <em>[ORGANIZER: Embed your Bracket City tournament link below, or describe the bracket challenge here. The final winner determines the passphrase.]</em></p>
    <p class="muted">Complete the bracket. The winning item's name is your passphrase.</p>
    <div class="passphrase-box">
      <p class="muted" style="margin-bottom:.5rem">After completing the bracket, your passphrase is:</p>
      <span>PLACEHOLDER_MAPLE</span>
    </div>
  </div>
```

**Step 5: Write `public/challenges/orchid.html`**

```html
  <div class="card">
    <h1>Checkpoint 4 — Rebus Puzzle</h1>
    <p class="muted">"Pictures hold ancient jungle wisdom. Decode them, explorer!"</p>
  </div>
  <div class="card" style="display:flex;flex-direction:column;gap:.75rem">
    <h2>Solve the Rebus</h2>
    <p>🖼️ <em>[ORGANIZER: Describe or embed your rebus puzzle images here. Example: 👁️ + 🏝️ = ISLAND]</em></p>
    <p class="muted">The answer to the final rebus is your passphrase.</p>
    <div class="passphrase-box">
      <p class="muted" style="margin-bottom:.5rem">Your passphrase:</p>
      <span>PLACEHOLDER_ORCHID</span>
    </div>
  </div>
```

**Step 6: Write `public/challenges/hickory.html`**

```html
  <div class="card">
    <h1>Checkpoint 5 — Research Quest</h1>
    <p class="muted">"The fairy found a torn page from an ancient text..."</p>
  </div>
  <div class="card" style="display:flex;flex-direction:column;gap:.75rem">
    <h2>The Ancient Text</h2>
    <p>📜 <em>[ORGANIZER: Fill in the book title and author. Example: "The author who wrote <strong>The Alchemist</strong> was born in a city. That city's name is your passphrase."]</em></p>
    <p class="muted">Search the web to find the answer.</p>
    <input id="hick" placeholder="City name..." autocapitalize="characters" />
    <button onclick="checkHickory()">Check Answer</button>
    <p id="hick-result"></p>
  </div>
  <script>
    const ANSWER = 'PLACEHOLDER_HICKORY';
    function checkHickory() {
      const val = document.getElementById('hick').value.trim().toUpperCase().replace(/\s+/g,'');
      const el = document.getElementById('hick-result');
      if (val === ANSWER) {
        el.className = 'success';
        el.textContent = '✓ The fairy is impressed! Your passphrase is: ' + ANSWER;
      } else {
        el.className = 'error';
        el.textContent = "The jungle spirits say no... try again.";
      }
    }
  </script>
```

**Step 7: Write `public/challenges/glasgow.html`**

```html
  <div class="card">
    <h1>Checkpoint 6 — Cipher Decode</h1>
    <p class="muted">"The fairy intercepted a coded message from the jungle spirits. Decode it to proceed."</p>
  </div>
  <div class="card" style="display:flex;flex-direction:column;gap:.75rem">
    <h2>Caesar Cipher — Shift 3</h2>
    <p style="font-size:1.2rem;letter-spacing:.1em;color:var(--gold)">WKHBXQJOHLVDOLYH</p>
    <p class="muted">Each letter has been shifted <strong>forward by 3</strong>. Shift it back to decode.</p>
    <p class="muted">Example: D → A, E → B, F → C ...</p>
    <input id="glas" placeholder="Decoded message..." autocapitalize="characters" />
    <button onclick="checkGlasgow()">Check Answer</button>
    <p id="glas-result"></p>
  </div>
  <script>
    function checkGlasgow() {
      const val = document.getElementById('glas').value.trim().toUpperCase().replace(/\s+/g,'');
      const el = document.getElementById('glas-result');
      if (val === 'THEJUNGLEISALIVE') {
        el.className = 'success';
        el.textContent = '✓ The spirits speak! Your passphrase is: THEJUNGLEISALIVE';
      } else {
        el.className = 'error';
        el.textContent = "The cipher remains unbroken... try again.";
      }
    }
  </script>
```

**Step 8: Write `public/challenges/iris.html`**

```html
  <div class="card">
    <h1>Checkpoint 7 — Sequence Completion</h1>
    <p class="muted">"Complete the jungle sequence. The missing flower is your passphrase."</p>
  </div>
  <div class="card" style="display:flex;flex-direction:column;gap:.75rem">
    <h2>What Comes Next?</h2>
    <p style="font-size:1.1rem">Maple → Oak → Pine → <strong style="color:var(--gold)">?</strong> → Ash</p>
    <p class="muted">💡 Hint: Look at the office map. These rooms appear in a geographic sequence.</p>
    <input id="iris" placeholder="Room name..." autocapitalize="characters" />
    <button onclick="checkIris()">Check Answer</button>
    <p id="iris-result"></p>
  </div>
  <script>
    function checkIris() {
      const val = document.getElementById('iris').value.trim().toUpperCase();
      const el = document.getElementById('iris-result');
      if (val === 'WALNUT') {
        el.className = 'success';
        el.textContent = '✓ Correct! Your passphrase is: WALNUT';
      } else {
        el.className = 'error';
        el.textContent = "Hmm, that doesn't fit the sequence. Check the map again.";
      }
    }
  </script>
```

**Step 9: Write `public/challenges/violet.html`**

```html
  <div class="card">
    <h1>Checkpoint 8 — CARTA Word Challenge</h1>
    <p class="muted">"The fairy needs you to prove your linguistic powers, explorer!"</p>
  </div>
  <div class="card" style="display:flex;flex-direction:column;gap:.75rem">
    <h2>Letters: C, A, R, T, A</h2>
    <p>Using ONLY the letters <strong style="color:var(--gold)">C, A, R, T, A</strong> — how many valid English words of 3+ letters can you form?</p>
    <p class="muted">(You have two A's. 'CARTA' counts. No proper nouns except CARTA.)</p>
    <p class="muted">Word bank to check yourself: ARC, ART, CAR, CAT, RAT, TAR, ACT, CART, CARAT, CARTA...</p>
    <input id="viol" placeholder="Enter the count as a number..." type="number" min="0" max="30" />
    <button onclick="checkViolet()">Check Answer</button>
    <p id="viol-result"></p>
  </div>
  <script>
    const ANSWER = 'PLACEHOLDER_VIOLET_NUMBER'; // ORGANIZER: set to the official count
    function checkViolet() {
      const val = document.getElementById('viol').value.trim();
      const el = document.getElementById('viol-result');
      if (val === ANSWER) {
        el.className = 'success';
        el.textContent = '✓ The fairy claps! Your passphrase is: ' + ANSWER;
      } else {
        el.className = 'error';
        el.textContent = "Not quite the right count. Check your word list again!";
      }
    }
  </script>
```

**Step 10: Write `public/challenges/cherry.html`**

```html
  <div class="card">
    <h1>Checkpoint 9 — Age Riddle</h1>
    <p class="muted">"The fairy poses a riddle of time..."</p>
  </div>
  <div class="card" style="display:flex;flex-direction:column;gap:.75rem">
    <h2>The Elder's Age</h2>
    <p>A jungle elder is <strong>3 times as old</strong> as her apprentice today.</p>
    <p>In <strong>12 years</strong>, she will be exactly <strong>twice</strong> the apprentice's age.</p>
    <p style="color:var(--gold);margin-top:.5rem">How old is the elder RIGHT NOW?</p>
    <p class="muted">The elder's current age is your passphrase (just the number).</p>
    <input id="cher" placeholder="Enter the elder's age..." type="number" min="0" max="200" />
    <button onclick="checkCherry()">Check Answer</button>
    <p id="cher-result"></p>
  </div>
  <script>
    function checkCherry() {
      const val = document.getElementById('cher').value.trim();
      const el = document.getElementById('cher-result');
      if (val === '36') {
        el.className = 'success';
        el.textContent = '✓ Brilliant! Your passphrase is: 36';
      } else {
        el.className = 'error';
        el.textContent = "The math doesn't add up... try again, explorer.";
      }
    }
  </script>
```

**Step 11: Write `public/challenges/library.html`**

```html
  <div class="card">
    <h1>Checkpoint 10 — The Mega Finale</h1>
    <p class="muted">"You've proven yourself worthy, explorer. But the magical orb is locked away..."</p>
  </div>
  <div class="card" style="display:flex;flex-direction:column;gap:.75rem;text-align:center">
    <p style="font-size:1.1rem">🔐 The final trial awaits you.</p>
    <p>Go to <strong style="color:var(--gold)">[ORGANIZER NAME]'s desk</strong>.</p>
    <p class="muted">The fairy guardian awaits you there. Solve the mega challenge to receive the safe combination and claim the magical orb.</p>
    <p style="font-size:1.5rem;margin:.5rem 0">🏆</p>
    <p class="muted">"This is your moment, brave explorer. The jungle believes in you."<br/>— Fairy</p>
  </div>
  <div class="card">
    <p class="muted" style="margin-bottom:.5rem">After solving the mega challenge, enter your passphrase:</p>
    <input id="lib" placeholder="Enter passphrase from organizer..." autocapitalize="characters" />
    <button onclick="checkLibrary()">Submit</button>
    <p id="lib-result"></p>
  </div>
  <script>
    const ANSWER = 'PLACEHOLDER_LIBRARY';
    function checkLibrary() {
      const val = document.getElementById('lib').value.trim().toUpperCase();
      const el = document.getElementById('lib-result');
      if (val === ANSWER) {
        el.className = 'success';
        el.textContent = '✓ You have conquered the jungle! Enter this passphrase in the app.';
      } else {
        el.className = 'error';
        el.textContent = "The safe remains locked... are you sure that's the right combination?";
      }
    }
  </script>
```

**Step 12: Verify challenge pages in browser**

Visit `http://localhost:5173/challenges/clover.html`. Should show: fairy image, jungle-themed card, emoji puzzle, reveal button. Clicking reveal shows "LUCK".

**Step 13: Commit**

```bash
git add public/challenges/
git commit -m "feat: add all 10 challenge pages with jungle theme"
```

---

### Task 12: Guard Routes + App Polish

**Files:**
- Modify: `src/App.jsx`

The app needs to redirect unauthenticated users from `/game`, `/scan`, `/victory` back to `/`.

**Step 1: Create `src/components/RequirePlayer.jsx`**

```jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../lib/playerContext'

export default function RequirePlayer({ children }) {
  const { player } = usePlayer()
  const navigate = useNavigate()
  useEffect(() => {
    if (!player) navigate('/')
  }, [player, navigate])
  if (!player) return null
  return children
}
```

**Step 2: Update `src/App.jsx` to wrap protected routes**

```jsx
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
```

**Step 3: Run all tests**

```bash
make test
```

Expected: All tests pass.

**Step 4: Final smoke test in browser**

1. Open `http://localhost:5173`
2. See registration screen with floating fairy
3. Register a name (if Supabase is configured) or inspect sessionStorage manually
4. Game screen shows CLOVER riddle + progress 0/10
5. Map opens and shows gold pin at Clover
6. `/scan` shows camera or error + manual entry
7. `/leaderboard` shows empty state
8. `/challenges/clover.html` shows emoji puzzle; reveal shows LUCK
9. Challenge pages for glasgow/iris/cherry have interactive answer checkers

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete treasure hunt app — all screens, challenges, and map"
```

---

## Supabase Setup (Organizer Must Do)

Before the event, run this SQL in your Supabase project's SQL editor:

```sql
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  start_time TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  is_first_place BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 0
);

CREATE TABLE progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  checkpoint_index INTEGER NOT NULL,
  room_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, checkpoint_index)
);

ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE progress;

CREATE VIEW leaderboard AS
SELECT
  p.id, p.name, p.start_time, p.completed_at, p.is_first_place,
  EXTRACT(EPOCH FROM (p.completed_at - p.start_time)) AS time_seconds
FROM players p
WHERE p.completed_at IS NOT NULL
ORDER BY p.completed_at - p.start_time ASC;
```

Then create `.env` with your Supabase URL and anon key.

---

## Placeholder Values to Update Before Event

| File | Variable | What to Set |
|------|----------|-------------|
| `src/lib/checkpoints.js` | `CHECKPOINTS[1].passphrase` | ASH answer (your office GeoGuessr photo answer) |
| `src/lib/checkpoints.js` | `CHECKPOINTS[2].passphrase` | MAPLE bracket winner |
| `src/lib/checkpoints.js` | `CHECKPOINTS[3].passphrase` | ORCHID rebus answer |
| `src/lib/checkpoints.js` | `CHECKPOINTS[4].passphrase` | HICKORY city name |
| `src/lib/checkpoints.js` | `CHECKPOINTS[7].passphrase` | VIOLET word count |
| `src/lib/checkpoints.js` | `CHECKPOINTS[9].passphrase` | LIBRARY safe combo / organizer passphrase |
| `public/challenges/ash.html` | `ANSWER` const | Same as above |
| `public/challenges/hickory.html` | `ANSWER` const | Same as above |
| `public/challenges/violet.html` | `ANSWER` const | Same as above |
| `public/challenges/library.html` | `ANSWER` const | Same as above |
| `public/challenges/ash.html` | Photo/description | Add your GeoGuessr office photo |
| `public/challenges/maple.html` | Bracket embed | Add Bracket City link |
| `public/challenges/orchid.html` | Rebus content | Add your rebus images |
| `public/challenges/hickory.html` | Book/author text | Fill in book title |
