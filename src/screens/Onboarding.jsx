import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Leaf } from 'lucide-react'
import { RulesList } from './Rules'

export default function Onboarding() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('video') // 'video' | 'mascot' | 'rules'
  const [showBubble, setShowBubble] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    if (localStorage.getItem('jungle_onboarded')) {
      navigate('/home', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (phase === 'mascot') {
      const t = setTimeout(() => setShowBubble(true), 500)
      return () => clearTimeout(t)
    }
  }, [phase])

  function handleComplete() {
    localStorage.setItem('jungle_onboarded', 'true')
    navigate('/home')
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--bg)', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">

        {/* ── Phase 0: Full-screen mascot video ── */}
        {phase === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed', inset: 0,
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
            }}
          >
            <video
              ref={videoRef}
              src="/assets/Mascot_Flying_In_And_Floating.mp4"
              autoPlay
              playsInline
              muted
              onEnded={() => setPhase('mascot')}
              style={{
                width: '167%',
                height: '100%',
                marginLeft: '-33.5%',
                objectFit: 'cover',
              }}
            />
            <button
              onClick={() => setPhase('mascot')}
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

        {/* ── Phase 1: Mascot greeting bubble ── */}
        {phase === 'mascot' && (
          <motion.div
            key="mascot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="screen-center"
            style={{ gap: '0', padding: '2rem 1.5rem', justifyContent: 'center' }}
          >
            <motion.img
              src="/assets/host_front.png"
              alt="Fairy"
              style={{ width: 110, imageRendering: 'pixelated', marginBottom: '1.25rem' }}
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            />

            <AnimatePresence>
              {showBubble && (
                <motion.div
                  initial={{ opacity: 0, y: 14, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{
                    position: 'relative',
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: '1.25rem 1.25rem 1.1rem',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
                    maxWidth: 360,
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  {/* Speech bubble tail pointing up toward mascot */}
                  <div style={{
                    position: 'absolute',
                    top: -11,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '11px solid transparent',
                    borderRight: '11px solid transparent',
                    borderBottom: '11px solid var(--border)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: -9,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderBottom: '10px solid #fff',
                  }} />

                  <p style={{ color: 'var(--text)', lineHeight: 1.65, fontSize: '0.95rem', marginBottom: '0.65rem' }}>
                    Hey there, explorer! <Leaf size={13} strokeWidth={2} color="var(--green-glow)" style={{ verticalAlign: 'middle' }} /> I'm{' '}
                    <strong style={{ color: 'var(--green-glow)' }}>Fairy</strong>, your guide
                    through the <em>Office Jungle</em>.
                  </p>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    You're about to hunt for{' '}
                    <strong style={{ color: 'var(--text)' }}>10 hidden checkpoints</strong>{' '}
                    scattered across the office. Crack the challenges, collect the passphrases,
                    and race to the finish!
                  </p>

                  <button
                    className="btn-primary"
                    onClick={() => setPhase('rules')}
                    style={{ fontSize: '0.9rem' }}
                  >
                    Show me the rules →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Phase 2: Rules ── */}
        {phase === 'rules' && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="screen"
            style={{ gap: '1rem' }}
          >
            <div>
              <h1 style={{ fontSize: '1.1rem' }}>The Rules</h1>
              <p className="text-muted" style={{ fontSize: '0.82rem' }}>
                Read carefully before you venture in.
              </p>
            </div>

            <RulesList />

            <button
              className="btn-primary"
              onClick={handleComplete}
              style={{ marginTop: '0.25rem' }}
            >
              Start the Hunt! <Leaf size={14} strokeWidth={2} style={{ marginLeft: 4 }} />
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
