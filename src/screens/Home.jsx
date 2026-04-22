// v2
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Crown, Leaf, Map, Trophy, Dices } from 'lucide-react'
import { usePlayer } from '../lib/playerContext'
import { CHECKPOINTS, getCheckpoint } from '../lib/checkpoints'
import ProgressBar from '../components/ProgressBar'

export default function Home() {
  const navigate = useNavigate()
  const { player } = usePlayer()

  if (!player) return null

  const currentCheckpoint = getCheckpoint(player.current_step)
  const isComplete = player.current_step >= CHECKPOINTS.length

  return (
    <div className="screen" style={{ gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <motion.img
          src="/assets/host_front.png"
          alt="Fairy"
          style={{ width: 64 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.1rem' }}>
            {isComplete ? 'Hunt Complete!' : 'Lost in the Jungle'}
          </h1>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Welcome back, <strong style={{ color: 'var(--text)' }}>{player.name}</strong>
          </p>
        </div>
      </div>

      <ProgressBar current={Math.min(player.current_step, CHECKPOINTS.length)} total={CHECKPOINTS.length} />

      {!isComplete && currentCheckpoint && (
        <button
          onClick={() => navigate('/game')}
          className="card"
          style={{
            textAlign: 'left',
            width: '100%',
            cursor: 'pointer',
            borderLeft: '4px solid var(--green-glow)',
            transition: 'box-shadow 0.15s',
            background: 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{
              background: 'var(--green-light)',
              color: 'var(--green-glow)',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              padding: '0.2rem 0.5rem',
              borderRadius: 4,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Current Quest
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {player.current_step + 1} / 10 →
            </span>
          </div>
          <p style={{ fontWeight: 'bold', color: 'var(--text)', marginBottom: '0.3rem' }}>
            Checkpoint {player.current_step + 1}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
            {currentCheckpoint.riddle.slice(0, 80)}...
          </p>
        </button>
      )}

      {isComplete && (
        <div className="card" style={{ textAlign: 'center', borderLeft: '4px solid var(--gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem', color: player.is_first_place ? 'var(--gold)' : 'var(--green-glow)' }}>
            {player.is_first_place ? <Crown size={28} strokeWidth={1.5} /> : <Leaf size={28} strokeWidth={1.5} />}
          </div>
          <p style={{ fontWeight: 'bold', color: 'var(--gold)' }}>
            {player.is_first_place ? 'Jungle Champion!' : 'Hunt Complete!'}
          </p>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Check the leaderboard to see your rank.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Map',         Icon: Map,    path: '/map' },
          { label: 'Leaderboard', Icon: Trophy, path: '/leaderboard' },
          { label: 'Lucky Draw',  Icon: Dices,  path: '/lucky-draw' },
        ].map(tile => (
          <button
            key={tile.path}
            onClick={() => navigate(tile.path)}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              padding: '0.875rem 0.5rem',
              transition: 'box-shadow 0.15s',
            }}
          >
            <tile.Icon size={22} strokeWidth={1.5} color="var(--green-glow)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {tile.label}
            </span>
          </button>
        ))}
      </div>

    </div>
  )
}
