import { useState, useEffect } from 'react'
import { Menu, Heart, Map, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '../lib/supabase'
import { usePlayer } from '../lib/playerContext'
import { useStuckTimer } from '../lib/useStuckTimer'
import { CHECKPOINTS, getCheckpoint } from '../lib/checkpoints'
import MapView from './MapView'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [mapOpen, setMapOpen]           = useState(false)
  const [rank, setRank]                 = useState(null)
  const [winnerToast, setWinnerToast]   = useState(null)
  const { player } = usePlayer()
  const { isStuck, remainingMs } = useStuckTimer(player)

  // Fetch & keep rank current
  useEffect(() => {
    if (!player) return
    async function fetchRank() {
      const { data } = await supabase
        .from('players')
        .select('id, current_step, completed_at, created_at')
        .order('current_step', { ascending: false })
        .order('completed_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true })
      if (!data) return
      const pos = data.findIndex(p => p.id === player.id)
      if (pos !== -1) setRank(pos + 1)
    }
    fetchRank()
  }, [player?.current_step, player?.id])

  // Real-time winner broadcast
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

  const currentCheckpoint = player ? getCheckpoint(player.current_step) : null
  const completedRooms    = player
    ? CHECKPOINTS.slice(0, player.current_step).map(c => c.roomId)
    : []

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

      {/* Map overlay */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 120,
              display: 'flex',
              flexDirection: 'column',
              padding: '3.5rem 1rem 1rem',
            }}
            onClick={e => { if (e.target === e.currentTarget) setMapOpen(false) }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '100%' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Office Map
                </span>
                <button
                  onClick={() => setMapOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
              <div style={{ overflowY: 'auto', borderRadius: 10 }}>
                <MapView
                  completedRooms={completedRooms}
                  currentRoom={currentCheckpoint?.roomId}
                  isStuck={isStuck}
                  remainingMs={remainingMs}
                />
              </div>
            </motion.div>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {rank !== null && (
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 'bold',
                color: rank <= 3 ? 'var(--gold)' : 'var(--text-muted)',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}>
                #{rank}
              </span>
            )}
            <img src="/assets/host_front.png" alt="Fairy" style={{ width: 32 }} />
          </div>
        </header>

        {/* 5-min stuck banner */}
        <AnimatePresence>
          {isStuck && currentCheckpoint && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                background: 'var(--gold)',
                color: '#0A2A1B',
                padding: '0.55rem 1.25rem',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                letterSpacing: '0.03em',
                textAlign: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              Head to {currentCheckpoint.roomId} — check the map!
            </motion.div>
          )}
        </AnimatePresence>

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

      {/* Floating map button */}
      {player && (
        <button
          onClick={() => setMapOpen(true)}
          aria-label="Open map"
          style={{
            position: 'fixed',
            bottom: '4.5rem',
            right: '1rem',
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--green-glow)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
            cursor: 'pointer',
          }}
        >
          <Map size={20} strokeWidth={2} />
        </button>
      )}
    </>
  )
}
