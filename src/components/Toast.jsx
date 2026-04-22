import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'

export default function Toast({ message, type = 'success', visible, onDismiss }) {
  const bg    = type === 'success' ? 'var(--green-glow)' : type === 'error' ? 'var(--error)' : 'var(--gold)'
  const color = type === 'success' ? '#fff' : type === 'error' ? '#fff' : '#0A2A1B'

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={
            type === 'error'
              ? { opacity: 1, scale: 1, y: 0, x: [0, -8, 8, -6, 6, 0] }
              : { opacity: 1, scale: 1, y: 0 }
          }
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ duration: 0.25 }}
          onClick={onDismiss}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: bg,
            color,
            padding: '1rem 1.5rem',
            borderRadius: 12,
            fontSize: '0.95rem',
            fontWeight: 'bold',
            textAlign: 'center',
            maxWidth: 320,
            width: 'calc(100% - 3rem)',
            zIndex: 999,
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            cursor: 'pointer',
            lineHeight: 1.5,
          }}
        >
          {message}
          <div style={{ fontSize: '0.7rem', fontWeight: 'normal', marginTop: '0.4rem', opacity: 0.75 }}>
            tap to dismiss
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
