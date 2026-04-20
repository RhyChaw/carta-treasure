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
