import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Check, Lock, Star, Flame } from 'lucide-react'
import { usePlayer } from '../lib/playerContext'
import { CHECKPOINTS } from '../lib/checkpoints'

const DIFFICULTY_LEVELS = [1, 2, 3, 1, 2, 1, 1, 2, 3, null] // null = flame

function DifficultyIndicator({ index }) {
  const level = DIFFICULTY_LEVELS[index]
  if (level === null) return <Flame size={12} color="var(--error)" strokeWidth={2} />
  return (
    <span style={{ display: 'flex', gap: 1 }}>
      {Array.from({ length: level }).map((_, i) => (
        <Star key={i} size={10} fill="var(--gold)" color="var(--gold)" strokeWidth={0} />
      ))}
    </span>
  )
}

function CheckpointRow({ checkpoint, state, onTap, expanded }) {
  const isDone    = state === 'done'
  const isCurrent = state === 'current'
  const isLocked  = state === 'locked'

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
          borderRadius: expanded ? '10px 10px 0 0' : 10,
          borderBottom: expanded ? 'none' : undefined,
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
          {isDone ? <Check size={13} strokeWidth={2.5} /> : checkpoint.index + 1}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isLocked ? 'var(--text-muted)' : 'var(--text)' }}>
            {isLocked ? '???' : checkpoint.roomId}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isDone ? 'Completed · tap to review' : isCurrent ? 'Your current quest' : 'Locked'}
          </p>
        </div>

        {!isLocked && <DifficultyIndicator index={checkpoint.index} />}
        {isLocked && <Lock size={15} color="var(--text-muted)" strokeWidth={1.75} />}
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'var(--green-light)',
              border: '1px solid var(--border-bright)',
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              padding: '0.75rem 1rem',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'var(--green-glow)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                padding: '0.15rem 0.5rem',
                borderRadius: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                <Check size={11} strokeWidth={2.5} /> Completed
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6 }}>
              {checkpoint.riddle}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CheckpointsList() {
  const navigate = useNavigate()
  const { player } = usePlayer()
  const [expandedIndex, setExpandedIndex] = useState(null)

  if (!player) return null

  function getState(index) {
    if (index < player.current_step)  return 'done'
    if (index === player.current_step) return 'current'
    return 'locked'
  }

  function handleTap(checkpoint, state) {
    if (state === 'current') { navigate('/game'); return }
    if (state === 'done') {
      setExpandedIndex(prev => prev === checkpoint.index ? null : checkpoint.index)
    }
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
            expanded={expandedIndex === cp.index}
          />
        ))}
      </div>
    </div>
  )
}
