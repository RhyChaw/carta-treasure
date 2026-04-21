import { useState } from 'react'
import { Menu, Heart } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
