import { useState } from 'react'
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
            ☰
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

          <img src="/assets/host.png" alt="Fairy" style={{ width: 32 }} />
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </>
  )
}
