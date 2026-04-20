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
