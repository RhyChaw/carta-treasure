import { motion, AnimatePresence } from 'motion/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePlayer } from '../lib/playerContext'

const NAV_ITEMS = [
  { label: 'Home',          path: '/home',        icon: '🏠' },
  { label: 'Current Quest', path: '/game',        icon: '📍' },
  { label: 'Checkpoints',   path: '/checkpoints', icon: '📋' },
  { label: 'Map',           path: '/map',         icon: '🗺️' },
  { label: 'Leaderboard',   path: '/leaderboard', icon: '🏆' },
  { label: 'Lucky Draw',    path: '/lucky-draw',  icon: '🎲' },
  { label: 'Rules',         path: '/rules',       icon: '📜' },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { player, logout } = usePlayer()

  function go(path) {
    navigate(path)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 40,
            }}
          />

          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              width: 260,
              background: 'var(--bg-sidebar)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              padding: '0 0 1.5rem',
              overflowY: 'auto',
            }}
          >
            <div style={{
              padding: '1.25rem 1.25rem 1rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="/assets/host_front.png" alt="Fairy" style={{ width: 36 }} />
                <div>
                  <p style={{ color: '#e8f5e2', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Office Jungle
                  </p>
                  {player && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                      {player.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div style={{ flex: 1, padding: '0.75rem 0' }}>
              {NAV_ITEMS.map(item => {
                const active = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      width: '100%',
                      padding: '0.85rem 1.25rem',
                      background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.65)',
                      fontSize: '0.95rem',
                      letterSpacing: '0.03em',
                      borderLeft: active ? '3px solid #4ADE80' : '3px solid transparent',
                      transition: 'background 0.15s, color 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', minWidth: 22 }}>{item.icon}</span>
                    {item.label}
                  </button>
                )
              })}
            </div>

            {player && (
              <div style={{ padding: '0 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <button
                  onClick={() => { logout(); navigate('/'); onClose() }}
                  style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: 'transparent',
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0',
                  }}
                >
                  ⤶ Exit Hunt
                </button>
              </div>
            )}
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}
