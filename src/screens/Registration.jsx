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
