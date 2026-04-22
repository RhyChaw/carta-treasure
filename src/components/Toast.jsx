import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'

export default function Toast({ message, type = 'success', visible, onDismiss }) {
  const bg    = type === 'success' ? 'var(--green-glow)' : type === 'error' ? 'var(--error)' : 'var(--gold)'
  const color = type === 'success' ? '#fff' : type === 'error' ? '#fff' : '#0A2A1B'

  return createPortal(
    <AnimatePresence>
      {visible && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={
              type === 'error'
                ? { opacity: 1, scale: 1, x: [0, -8, 8, -6, 6, 0] }
                : { opacity: 1, scale: 1 }
            }
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.22 }}
            onClick={onDismiss}
            style={{
              background: bg,
              color,
              padding: '1rem 1.5rem',
              borderRadius: 12,
              fontSize: '0.95rem',
              fontWeight: 'bold',
              textAlign: 'center',
              maxWidth: 300,
              width: 'calc(100vw - 3rem)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              cursor: 'pointer',
              lineHeight: 1.5,
              pointerEvents: 'auto',
            }}
          >
            {message}
            <div style={{ fontSize: '0.7rem', fontWeight: 'normal', marginTop: '0.4rem', opacity: 0.75 }}>
              tap to dismiss
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
