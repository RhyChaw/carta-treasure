import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Check, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePlayer } from '../lib/playerContext'

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function Registration() {
  const navigate = useNavigate()
  const { login, player } = usePlayer()
  const skipOnboardingRef = useRef(false)

  const [name, setName]         = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const [showRejoin, setShowRejoin]           = useState(false)
  const [existingPlayers, setExistingPlayers] = useState([])
  const [selectedPlayer, setSelectedPlayer]   = useState(null)
  const [rejoinPassword, setRejoinPassword]   = useState('')
  const [passwordError, setPasswordError]     = useState('')

  useEffect(() => {
    if (!player) return
    if (skipOnboardingRef.current || localStorage.getItem('jungle_onboarded')) {
      navigate('/home')
    } else {
      navigate('/onboarding')
    }
  }, [player, navigate])

  async function handleRegister(e) {
    e.preventDefault()
    if (!name.trim() || !password) return
    setLoading(true)
    setError('')
    try {
      const password_hash = await sha256(password)
      const { data, error: dbError } = await supabase
        .from('players')
        .insert({ name: name.trim(), password_hash })
        .select()
        .single()
      if (dbError) throw dbError
      login(data)
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
      .limit(50)
    setExistingPlayers(data ?? [])
    setShowRejoin(true)
    setSelectedPlayer(null)
    setRejoinPassword('')
    setPasswordError('')
    setLoading(false)
  }

  async function handleRejoinPassword(e) {
    e.preventDefault()
    if (!selectedPlayer || !rejoinPassword) return
    setLoading(true)
    const hash = await sha256(rejoinPassword)
    if (!selectedPlayer.password_hash || hash === selectedPlayer.password_hash) {
      skipOnboardingRef.current = true
      login(selectedPlayer)
    } else {
      setPasswordError('Wrong password. Try again.')
      setRejoinPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="screen-center" style={{ gap: '1.5rem' }}>
      <motion.img
        src="/assets/host_front.png"
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
          /* ── New registration ── */
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              className="input-field"
              placeholder="Your explorer name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
              autoFocus
            />
            <input
              className="input-field"
              type="password"
              placeholder="Choose a password..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              maxLength={40}
            />
            {error && <p className="text-error" style={{ fontSize: '0.875rem' }}>{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading || !name.trim() || !password}>
              {loading ? 'Entering the jungle...' : 'Enter the Jungle'}
            </button>
            <button type="button" className="btn-ghost" onClick={handleRejoin} disabled={loading}>
              I already registered →
            </button>
          </form>
        ) : !selectedPlayer ? (
          /* ── Pick name from list ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Select your name:
            </p>
            <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {existingPlayers.map(p => (
                <button
                  key={p.id}
                  className="btn-secondary"
                  onClick={() => { setSelectedPlayer(p); setRejoinPassword(''); setPasswordError('') }}
                  style={{ textAlign: 'left' }}
                >
                  {p.name}{p.completed_at && <Check size={12} strokeWidth={2.5} style={{ marginLeft: 4 }} />}
                </button>
              ))}
            </div>
            <button className="btn-ghost" onClick={() => setShowRejoin(false)}>← Back</button>
          </div>
        ) : (
          /* ── Password verify ── */
          <form onSubmit={handleRejoinPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 0.75rem',
              background: 'var(--green-light)',
              borderRadius: 8,
              fontSize: '0.875rem',
              color: 'var(--green-glow)',
              fontWeight: 'bold',
            }}>
              <User size={14} strokeWidth={2} style={{ marginRight: 4 }} /> {selectedPlayer.name}
            </div>
            <input
              className="input-field"
              type="password"
              placeholder="Enter your password..."
              value={rejoinPassword}
              onChange={e => setRejoinPassword(e.target.value)}
              maxLength={40}
              autoFocus
            />
            {passwordError && <p className="text-error" style={{ fontSize: '0.875rem' }}>{passwordError}</p>}
            <button type="submit" className="btn-primary" disabled={loading || !rejoinPassword}>
              {loading ? 'Checking...' : 'Continue →'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setSelectedPlayer(null)}>
              ← Pick a different name
            </button>
          </form>
        )}
      </div>

      <button className="btn-ghost" onClick={() => navigate('/leaderboard')}>
        View Leaderboard
      </button>
    </div>
  )
}
