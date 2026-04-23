import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePlayer } from '../lib/playerContext'
import { CHECKPOINTS, getCheckpoint, validatePassphrase, parseQrCode } from '../lib/checkpoints'
import ProgressBar from '../components/ProgressBar'
import RiddleCard from '../components/RiddleCard'
import Toast from '../components/Toast'

export default function Game() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { player, updateStep, completeGame } = usePlayer()
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })
  const [loading, setLoading] = useState(false)
  const [roomInput, setRoomInput] = useState('')
  const [roomError, setRoomError] = useState('')
  const [penalty, setPenalty] = useState(0)
  const penaltyRef = useRef(null)

  useEffect(() => {
    if (!player) navigate('/')
  }, [player, navigate])

  // Auto-submit passphrase when returning from a challenge page
  useEffect(() => {
    const p = searchParams.get('passphrase')
    if (p && player) {
      navigate('/game', { replace: true })
      submitPassphrase(p)
    }
  }, [player])

  // Countdown tick
  useEffect(() => {
    if (penalty <= 0) return
    penaltyRef.current = setTimeout(() => setPenalty(s => s - 1), 1000)
    return () => clearTimeout(penaltyRef.current)
  }, [penalty])

  function showToast(message, type = 'success') {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500)
  }

  async function submitPassphrase(value) {
    const current = getCheckpoint(player.current_step)
    if (!current || !validatePassphrase(current, value)) {
      showToast("The fairy shakes her head... that's not quite right. Try again, explorer.", 'error')
      return
    }
    setLoading(true)
    try {
      await supabase.from('progress').insert({
        player_id: player.id,
        checkpoint_index: current.index,
        room_id: current.roomId,
      })
      const nextStep = player.current_step + 1
      const isComplete = nextStep >= CHECKPOINTS.length

      if (isComplete) {
        const { data: finishers } = await supabase
          .from('players')
          .select('id')
          .not('completed_at', 'is', null)
        const isFirst = !finishers || finishers.length === 0
        await supabase.from('players').update({
          completed_at: new Date().toISOString(),
          is_first_place: isFirst,
          current_step: nextStep,
        }).eq('id', player.id)
        completeGame(new Date().toISOString(), isFirst)
        navigate('/victory', { state: { fresh: true, isFirst } })
        return
      }

      await supabase.from('players').update({ current_step: nextStep }).eq('id', player.id)
      updateStep(nextStep)
      showToast("Brilliant! The path forward reveals itself!", 'success')
    } catch (err) {
      showToast('Something went wrong. Try again.', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleRoomSubmit(e) {
    e.preventDefault()
    const normalized = roomInput.trim().replace(/\s+/g, ' ').toUpperCase()
    if (normalized === 'THE CLOVER OF LUCK') {
      setPenalty(30)
      setRoomInput('')
      return
    }
    const roomId = parseQrCode(roomInput)
    if (roomId === currentCheckpoint?.roomId) {
      window.location.href = currentCheckpoint.challengeUrl
    } else {
      setRoomError("That's not the right phrase — are you in the right room?")
    }
  }

  if (!player) return null
  const currentCheckpoint = getCheckpoint(player.current_step)
  const completedCheckpoints = CHECKPOINTS.slice(0, player.current_step)
  const locked = penalty > 0

  return (
    <>
      {locked && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: '#000', display: 'flex', flexDirection: 'column',
        }}>
          <iframe
            src="https://www.youtube.com/embed/Aq5WXmQQooo?autoplay=1&controls=0&modestbranding=1"
            allow="autoplay; fullscreen"
            style={{ flex: 1, width: '100%', border: 'none' }}
          />
          <div style={{
            padding: '1rem', textAlign: 'center',
            background: '#0a0a0a',
            fontFamily: "'Courier New', monospace",
          }}>
            <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
              The fairy is disappointed. Penalty: {penalty}s
            </p>
            <p style={{ color: '#555', fontSize: '0.75rem' }}>You fell for the trap. Get back to the real puzzle.</p>
          </div>
        </div>
      )}

      <div className="screen">
        <Toast {...toast} onDismiss={() => setToast(t => ({ ...t, visible: false }))} />

        <ProgressBar current={player.current_step} total={CHECKPOINTS.length} />

        <RiddleCard checkpoint={currentCheckpoint} />

        {currentCheckpoint && (
          <div className="card">
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
              "Found the phrase in the room? Enter it here..."
            </p>
            <form onSubmit={handleRoomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                className="input-field"
                placeholder="Type the room phrase..."
                value={roomInput}
                onChange={e => { setRoomInput(e.target.value); setRoomError('') }}
                autoCapitalize="characters"
                disabled={locked}
              />
              {roomError && <p style={{ fontSize: '0.8rem', color: 'var(--error)' }}>{roomError}</p>}
              <button type="submit" className="btn-secondary" disabled={loading || !roomInput.trim() || locked}>
                {loading ? 'Checking...' : 'Open Challenge →'}
              </button>
            </form>
          </div>
        )}

        {completedCheckpoints.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {completedCheckpoints.map(c => (
              <span key={c.roomId} style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                background: '#0d3522', border: '1px solid var(--green-glow)',
                color: 'var(--green-glow)', borderRadius: 20,
                padding: '0.2rem 0.6rem', fontSize: '0.75rem', letterSpacing: '0.04em',
              }}>
                <Check size={10} strokeWidth={2.5} />{c.roomId}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
