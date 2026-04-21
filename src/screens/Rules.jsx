import { motion } from 'motion/react'

const RULES = [
  {
    icon: '📍',
    title: 'Follow the riddle',
    body: 'Each checkpoint gives you a clue. Read it carefully to figure out which room to head to.',
  },
  {
    icon: '🔍',
    title: 'Scan or type the room code',
    body: 'At each room, find the QR code and scan it — or type the room code manually to unlock the challenge.',
  },
  {
    icon: '🧩',
    title: 'Solve the challenge',
    body: 'Every checkpoint has a mini-puzzle. Crack it to reveal the secret passphrase.',
  },
  {
    icon: '⌨️',
    title: 'Enter the passphrase',
    body: 'Type the passphrase in the app to complete the checkpoint and unlock your next riddle.',
  },
  {
    icon: '🔟',
    title: '10 checkpoints total',
    body: 'There are 10 checkpoints hidden across the office. Complete all of them to finish the hunt.',
  },
  {
    icon: '🏆',
    title: 'First to finish wins',
    body: 'The first explorer to complete all 10 checkpoints wins the hunt.',
  },
  {
    icon: '🎲',
    title: 'Lucky Draw for everyone else',
    body: "Didn't finish first? No worries — every finisher enters the Lucky Draw for extra prizes.",
  },
]

export function RulesList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {RULES.map((rule, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="card"
          style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '0.875rem 1rem' }}
        >
          <span style={{ fontSize: '1.25rem', flexShrink: 0, lineHeight: 1.4 }}>{rule.icon}</span>
          <div>
            <p style={{ fontWeight: 'bold', fontSize: '0.875rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
              {rule.title}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              {rule.body}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function Rules() {
  return (
    <div className="screen" style={{ gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '1.1rem' }}>Rules</h1>
        <p className="text-muted" style={{ fontSize: '0.82rem' }}>How the Office Jungle hunt works.</p>
      </div>
      <RulesList />
    </div>
  )
}
