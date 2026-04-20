import { motion, AnimatePresence } from 'motion/react'

export default function Toast({ message, type = 'success', visible }) {
  const bg = type === 'success' ? 'var(--green-glow)' : type === 'error' ? 'var(--error)' : 'var(--gold)'
  const color = type === 'success' ? '#0A2A1B' : '#fff'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={type === 'error' ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, 0] } : { opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            background: bg,
            color,
            padding: '0.75rem 1rem',
            borderRadius: 8,
            fontSize: '0.875rem',
            fontWeight: 'bold',
            textAlign: 'center',
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 340,
            width: 'calc(100% - 2.5rem)',
            zIndex: 100,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
