import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Crown, Leaf, Trophy } from 'lucide-react'
import { usePlayer } from '../lib/playerContext'

export default function Victory() {
  const navigate = useNavigate()
  const location = useLocation()
  const { player } = usePlayer()
  const [timeDisplay, setTimeDisplay] = useState('')
  const [isFirst, setIsFirst] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    if (!player) { navigate('/'); return }
    const first = !!player.is_first_place
    setIsFirst(first)
    if (player.completed_at && player.start_time) {
      const seconds = Math.round((new Date(player.completed_at) - new Date(player.start_time)) / 1000)
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      setTimeDisplay(`${m}m ${s}s`)
    }
    // Only show the video if they just won first place (fresh navigation from Game)
    if (first && location.state?.fresh && location.state?.isFirst) {
      setShowVideo(true)
    }
  }, [player, navigate, location.state])

  if (!player) return null

  return (
    <>
      {/* First-place trophy video overlay */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            key="winner-video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.92)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              padding: '2rem 1.5rem',
            }}
          >
            <video
              src="/assets/Fairy_Presents_Winner_Trophy_Video.mp4"
              autoPlay
              playsInline
              onEnded={() => setShowVideo(false)}
              style={{
                maxWidth: 380,
                width: '100%',
                borderRadius: 16,
                boxShadow: '0 0 60px rgba(251,191,36,0.4)',
              }}
            />
            <button
              onClick={() => setShowVideo(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 20,
                padding: '0.4rem 1rem',
                fontSize: '0.8rem',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              Skip →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory screen */}
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
    </>
  )
}
