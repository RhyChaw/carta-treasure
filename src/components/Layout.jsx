import { useState, useEffect } from 'react'
import { Menu, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '../lib/supabase'
import { usePlayer } from '../lib/playerContext'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { player } = usePlayer()
  const [winnerToast, setWinnerToast] = useState(null)

  useEffect(() => {
    const channel = supabase
      .channel('winner-broadcast')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'players' },
        (payload) => {
          const wasFirst = !payload.old?.is_first_place
          const isNowFirst = payload.new?.is_first_place === true
          if (wasFirst && isNowFirst && payload.new.id !== player?.id) {
            setWinnerToast(payload.new.name)
            setTimeout(() => setWinnerToast(null), 6000)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [player?.id])

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Winner broadcast toast */}
      <AnimatePresence>
        {winnerToast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--gold)',
              color: '#0A2A1B',
              padding: '0.75rem 1.25rem',
              borderRadius: 10,
              fontSize: '0.875rem',
              fontWeight: 'bold',
              textAlign: 'center',
              maxWidth: 340,
              width: 'calc(100% - 2.5rem)',
              zIndex: 150,
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
              lineHeight: 1.5,
            }}
          >
            We have our first Jungle Champion!<br />
            <span style={{ fontWeight: 'normal', fontSize: '0.8rem' }}>
              {winnerToast} has conquered the hunt!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          height: 52,
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'transparent',
              color: 'var(--text)',
              fontSize: '1.3rem',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              minHeight: 44,
            }}
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>

          <p style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--green-glow)',
          }}>
            Office Jungle
          </p>

          <img src="/assets/host_front.png" alt="Fairy" style={{ width: 32 }} />
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </div>

        <footer style={{
          padding: '0.6rem 1.25rem',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.3rem',
          flexShrink: 0,
        }}>
          Made by Rhythm <Heart size={11} strokeWidth={2} fill="var(--error)" color="var(--error)" />
        </footer>
      </div>
    </>
  )
}
