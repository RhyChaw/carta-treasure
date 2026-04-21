import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Medal, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { CHECKPOINTS } from '../lib/checkpoints'

const RANK_COLORS = ['#FBBF24', '#9ca3af', '#d97706']

function formatDuration(createdAt, completedAt) {
  if (!completedAt) return null
  const ms = new Date(completedAt) - new Date(createdAt)
  const totalSeconds = Math.round(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
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
    const { data } = await supabase
      .from('players')
      .select('id, name, current_step, completed_at, is_first_place, created_at')
      .order('current_step', { ascending: false })
      .order('completed_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
    setRows(data ?? [])
    setLoading(false)
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="btn-ghost" onClick={() => navigate(-1)}>← Back</button>
        <h1 style={{ fontSize: '1.1rem' }}>Jungle Leaderboard</h1>
        <img src="/assets/host_front.png" alt="" style={{ width: 28, marginLeft: 'auto' }} />
      </div>

      {loading ? (
        <p className="text-muted" style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
      ) : rows.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
            "No explorers have entered the jungle yet..."
            <br />— Fairy
          </p>
        </div>
      ) : (
        <>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>
            {rows.filter(r => r.completed_at).length} finished · {rows.filter(r => !r.completed_at).length} in progress
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {rows.map((row, i) => {
              const isFinished = !!row.completed_at
              const duration = formatDuration(row.created_at, row.completed_at)
              return (
                <motion.div
                  key={row.id}
                  className="card"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  <span style={{
                    fontSize: i < 3 ? '1.3rem' : '0.9rem',
                    color: RANK_COLORS[i] ?? 'var(--text-muted)',
                    minWidth: 28,
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}>
                    {i < 3
                    ? <Medal size={18} strokeWidth={1.75} color={RANK_COLORS[i]} fill={RANK_COLORS[i] + '33'} />
                    : `#${i + 1}`}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                      {row.name}
                      {row.is_first_place && (
                        <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--gold)' }}>SPECIAL PRIZE</span>
                      )}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {isFinished
                        ? `Finished · ${duration ?? '—'}`
                        : `Step ${row.current_step} / ${CHECKPOINTS.length}`}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: isFinished ? 'var(--green-glow)' : 'var(--text-muted)',
                  }}>
                    {isFinished
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Check size={12} strokeWidth={2.5} />Done</span>
                      : `${row.current_step}/${CHECKPOINTS.length}`}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
