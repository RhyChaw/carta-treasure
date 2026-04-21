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

      {checkpoint.challengeUrl && (
        <a
          href={checkpoint.challengeUrl}
          style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', display: 'block' }}
        >
          🔗 debug: open challenge directly
        </a>
      )}

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
