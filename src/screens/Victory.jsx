import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Crown, Leaf, Trophy, Clover } from 'lucide-react'
import { usePlayer } from '../lib/playerContext'

export default function Victory() {
  const navigate = useNavigate()
  const { player } = usePlayer()
  const [timeDisplay, setTimeDisplay] = useState('')
  const [isFirst, setIsFirst] = useState(false)

  useEffect(() => {
    if (!player) { navigate('/'); return }
    if (player.completed_at && player.start_time) {
      const seconds = Math.round((new Date(player.completed_at) - new Date(player.start_time)) / 1000)
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      setTimeDisplay(`${m}m ${s}s`)
    }
    setIsFirst(!!player.is_first_place)
  }, [player, navigate])

  if (!player) return null

  return (
    <div className="screen-center" style={{ gap: '1.5rem' }}>
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, -5, 5, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      >
        <img src="/assets/host_front.png" alt="Fairy" style={{ width: 150 }} />
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        style={{ color: isFirst ? 'var(--gold)' : 'var(--green-glow)' }}
      >
        {isFirst
          ? <Crown size={52} strokeWidth={1.5} />
          : <Leaf size={52} strokeWidth={1.5} />}
      </motion.div>

      <div>
        <h1 style={{ fontSize: '1.8rem' }}>
          {isFirst ? 'JUNGLE CHAMPION!' : 'JUNGLE CONQUERED!'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Well done, {player.name}!
        </p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: 360, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {isFirst ? (
          <>
            <p style={{ color: 'var(--gold)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Trophy size={15} strokeWidth={2} /> FIRST PLACE — Special Prize Winner!
            </p>
            <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
              "You've claimed the magical orb, brave explorer! Head to the organizer to claim your special prize. You are excluded from the lucky draw."
              <br />— Fairy
            </p>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--green-glow)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Leaf size={15} strokeWidth={2} /> Lucky Draw Entry Confirmed!
            </p>
            <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
              "The jungle bows to you, explorer. You've earned your place in the lucky draw. Stay close — fortune may still smile upon you!"
              <br />— Fairy
            </p>
          </>
        )}
        {timeDisplay && (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Total time: <span style={{ color: 'var(--text)' }}>{timeDisplay}</span>
          </p>
        )}
      </div>

      <button className="btn-primary" style={{ maxWidth: 360 }} onClick={() => navigate('/leaderboard')}>
        View Leaderboard
      </button>
    </div>
  )
}
