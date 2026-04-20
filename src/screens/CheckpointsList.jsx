import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { usePlayer } from '../lib/playerContext'
import { CHECKPOINTS } from '../lib/checkpoints'

const DIFFICULTY = ['⭐','⭐⭐','⭐⭐⭐','⭐','⭐⭐','⭐⭐⭐','⭐','⭐⭐','⭐⭐⭐','🔥']

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
        flexShrink: 0,
      }}>
        {isDone ? '✓' : checkpoint.index + 1}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isLocked ? 'var(--text-muted)' : 'var(--text)' }}>
          {isLocked ? '???' : checkpoint.roomId}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {isDone ? 'Completed' : isCurrent ? 'Your current quest' : 'Locked'}
        </p>
      </div>

      {!isLocked && (
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
          {DIFFICULTY[checkpoint.index]}
        </span>
      )}

      {isLocked && <span style={{ fontSize: '1rem', color: 'var(--text-muted)', flexShrink: 0 }}>🔒</span>}
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

  function handleTap(state) {
    if (state === 'current') navigate('/game')
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
            onTap={() => handleTap(getState(cp.index))}
          />
        ))}
      </div>
    </div>
  )
}
