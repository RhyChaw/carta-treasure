import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '../lib/supabase'
import { pickWinners } from '../lib/luckyDraw'

const DRAW_COUNT = 5
const SPIN_DURATION_MS = 600   // how long each slot spins before landing
const SLOT_INTERVAL_MS = 1200  // gap between each slot landing
const CORRECT_PIN = import.meta.env.VITE_LUCKY_DRAW_PIN ?? '1234'

function SlotReel({ eligibleNames, winner, spinning, landed }) {
  const timeoutRef = useRef(null)
  const [displayName, setDisplayName] = useState(eligibleNames[0] ?? '')

  useEffect(() => {
    if (landed) {
      clearTimeout(timeoutRef.current)
      setDisplayName(winner)
      return
    }

    if (!spinning) return

    // Deceleration: start fast, slow down over ~30 ticks
    let tick = 0
    let i = 0

    function step() {
      i = (i + 1) % eligibleNames.length
      setDisplayName(eligibleNames[i])
      tick++
      // Interval grows from 80ms → ~400ms over 25 ticks, then stays at 400ms
      const delay = Math.min(80 + tick * 13, 400)
      timeoutRef.current = setTimeout(step, delay)
    }

    timeoutRef.current = setTimeout(step, 80)

    return () => clearTimeout(timeoutRef.current)
  }, [spinning, landed, winner, eligibleNames])

  return (
    <motion.div
      animate={landed ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 0.3 }}
      style={{
        background: landed ? 'var(--green-light)' : 'var(--bg)',
        border: `2px solid ${landed ? 'var(--green-glow)' : 'var(--border)'}`,
        borderRadius: 8,
        padding: '0.75rem 1rem',
        textAlign: 'center',
        fontSize: '1rem',
        fontWeight: landed ? 'bold' : 'normal',
        color: landed ? 'var(--green-glow)' : 'var(--text-muted)',
        minHeight: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        letterSpacing: '0.03em',
        transition: 'background 0.2s, border-color 0.2s',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
    >
      {spinning || landed ? displayName : '· · ·'}
    </motion.div>
  )
}

export default function LuckyDraw() {
  const [eligible, setEligible] = useState([])
  const [loading, setLoading] = useState(true)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [winners, setWinners] = useState([])
  const [landedCount, setLandedCount] = useState(0)
  const [drawn, setDrawn] = useState(false)
  const [fetchError, setFetchError] = useState('')

  const drawTimeoutsRef = useRef([])

  useEffect(() => {
    return () => drawTimeoutsRef.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    async function fetchEligible() {
      const { data, error } = await supabase
        .from('players')
        .select('id, name')
        .not('completed_at', 'is', null)
        .eq('is_first_place', false)
      if (error) setFetchError('Failed to load players. Check your connection.')
      setEligible(data ?? [])
      setLoading(false)
    }
    fetchEligible()
  }, [])

  function handleUnlock(e) {
    e.preventDefault()
    if (pin === CORRECT_PIN) {
      setUnlocked(true)
      setPinError('')
    } else {
      setPinError('Wrong PIN. Try again.')
      setPin('')
    }
  }

  function handleDraw() {
    if (drawn || drawing || eligible.length === 0) return
    const picked = pickWinners(eligible, DRAW_COUNT)
    setWinners(picked)
    setDrawing(true)
    setLandedCount(0)

    picked.forEach((_, i) => {
      const id = setTimeout(() => {
        setLandedCount(prev => prev + 1)
        if (i === picked.length - 1) {
          setDrawing(false)
          setDrawn(true)
        }
      }, SPIN_DURATION_MS + i * SLOT_INTERVAL_MS)
      drawTimeoutsRef.current.push(id)
    })
  }

  const eligibleNames = useMemo(() => eligible.map(p => p.name).filter(Boolean), [eligible])
  const isSpinning = drawing || landedCount > 0

  return (
    <div className="screen">
      <div>
        <h1 style={{ fontSize: '1.1rem' }}>Lucky Draw 🎲</h1>
        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
          {loading
            ? 'Loading...'
            : `${eligible.length} eligible explorer${eligible.length !== 1 ? 's' : ''}`}
        </p>
        {fetchError && <p className="text-error" style={{ fontSize: '0.875rem' }}>{fetchError}</p>}
      </div>

      {/* 5 slots */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Winners
        </p>
        {Array.from({ length: loading ? DRAW_COUNT : Math.min(DRAW_COUNT, Math.max(eligible.length, 1)) }).map((_, i) => (
          <SlotReel
            key={i}
            eligibleNames={eligibleNames.length > 0 ? eligibleNames : ['—']}
            winner={winners[i]?.name ?? ''}
            spinning={isSpinning}
            landed={landedCount > i}
          />
        ))}
      </div>

      {/* PIN or Draw button */}
      {!unlocked ? (
        <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            className="input-field"
            type="password"
            placeholder="Organizer PIN..."
            value={pin}
            onChange={e => setPin(e.target.value)}
            maxLength={8}
          />
          {pinError && <p className="text-error" style={{ fontSize: '0.875rem' }}>{pinError}</p>}
          <button type="submit" className="btn-secondary">Unlock Draw</button>
        </form>
      ) : (
        <button
          className="btn-primary"
          onClick={handleDraw}
          disabled={drawing || drawn || eligible.length === 0}
        >
          {drawn ? 'Draw Complete 🎉' : drawing ? 'Drawing...' : `Draw ${Math.min(DRAW_COUNT, eligible.length)} Winners`}
        </button>
      )}

      {/* Eligible list */}
      {eligible.length > 0 && (
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Eligible Explorers
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {eligible.map(p => {
              const isWinner = drawn && winners.some(w => w.id === p.id)
              return (
                <span
                  key={p.id}
                  style={{
                    background: isWinner ? 'var(--green-light)' : 'var(--bg-card)',
                    border: `1px solid ${isWinner ? 'var(--green-glow)' : 'var(--border)'}`,
                    color: isWinner ? 'var(--green-glow)' : 'var(--text-muted)',
                    borderRadius: 20,
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: isWinner ? 'bold' : 'normal',
                    opacity: drawn && !isWinner ? 0.45 : 1,
                    transition: 'all 0.3s',
                  }}
                >
                  {isWinner && '✓ '}{p.name}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {eligible.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            "No explorers in the draw yet... the jungle awaits its finishers."
            <br />— Fairy
          </p>
        </div>
      )}
    </div>
  )
}
