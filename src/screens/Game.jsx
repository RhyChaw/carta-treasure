import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, HelpCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePlayer } from '../lib/playerContext'
import { CHECKPOINTS, getCheckpoint, validatePassphrase } from '../lib/checkpoints'
import ProgressBar from '../components/ProgressBar'
import RiddleCard from '../components/RiddleCard'
import Toast from '../components/Toast'

export default function Game() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { player, updateStep, completeGame } = usePlayer()
  const [passphrase, setPassphrase] = useState(() => searchParams.get('passphrase') ?? '')
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })
  const [loading, setLoading] = useState(false)
  const [showFallback, setShowFallback] = useState(false)
  const [roomInput, setRoomInput] = useState('')
  const [roomError, setRoomError] = useState('')
  useEffect(() => {
    if (!player) navigate('/')
  }, [player, navigate])

  useEffect(() => {
    const pending = sessionStorage.getItem('jungle_scan_result')
    if (pending) {
      sessionStorage.removeItem('jungle_scan_result')
      const current = getCheckpoint(player?.current_step)
      if (current && pending === current.roomId) {
        showToast(`You found ${pending}! Solve the challenge and enter the passphrase.`, 'success')
      } else {
        showToast("The spirits here don't welcome us yet... we must look elsewhere, explorer.", 'error')
      }
    }
  }, [])

  function showToast(message, type = 'success') {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500)
  }

  function handleRoomFallback(e) {
    e.preventDefault()
    if (roomInput.trim().toUpperCase() === currentCheckpoint?.roomId) {
      window.location.href = currentCheckpoint.challengeUrl
    } else {
      setRoomError("That's not the right room — keep exploring!")
    }
  }

  async function handlePassphraseSubmit(e) {
    e.preventDefault()
    const current = getCheckpoint(player.current_step)
    if (!current || !validatePassphrase(current, passphrase)) {
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
        const completedAt = new Date().toISOString()
        completeGame(completedAt, isFirst)
        navigate('/victory', { state: { fresh: true, isFirst } })
        return
      }

      await supabase.from('players').update({ current_step: nextStep }).eq('id', player.id)
      updateStep(nextStep)
      setPassphrase('')
      showToast("Brilliant! The path forward reveals itself!", 'success')
    } catch (err) {
      showToast('Something went wrong. Try again.', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!player) return null
  const currentCheckpoint = getCheckpoint(player.current_step)
  const completedCheckpoints = CHECKPOINTS.slice(0, player.current_step)

  return (
    <div className="screen">
      <Toast {...toast} onDismiss={() => setToast(t => ({ ...t, visible: false }))} />

      <ProgressBar current={player.current_step} total={CHECKPOINTS.length} />

      <RiddleCard
        checkpoint={currentCheckpoint}
        onScan={() => navigate('/scan')}
      />

      <div className="card">
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
          "Got the answer? Enter the passphrase here, explorer..."
        </p>
        <form onSubmit={handlePassphraseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            className="input-field"
            placeholder="Enter passphrase..."
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            autoCapitalize="none"
          />
          <button type="submit" className="btn-primary" disabled={loading || !passphrase.trim()}>
            {loading ? 'Checking...' : 'Submit'}
          </button>
        </form>
      </div>

      {/* QR fallback */}
      {currentCheckpoint && (
        <div>
          <button
            className="btn-ghost"
            onClick={() => { setShowFallback(f => !f); setRoomError('') }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
          >
            <HelpCircle size={13} strokeWidth={2} /> Can't scan the QR code?
          </button>
          {showFallback && (
            <form onSubmit={handleRoomFallback} style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                className="input-field"
                placeholder="Type the room name..."
                value={roomInput}
                onChange={e => { setRoomInput(e.target.value); setRoomError('') }}
                autoCapitalize="characters"
                style={{ fontSize: '0.9rem' }}
              />
              {roomError && <p style={{ fontSize: '0.8rem', color: 'var(--error)' }}>{roomError}</p>}
              <button type="submit" className="btn-secondary" disabled={!roomInput.trim()}>
                Open Challenge →
              </button>
            </form>
          )}
        </div>
      )}

      {completedCheckpoints.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {completedCheckpoints.map(c => (
            <span key={c.roomId} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem',
              background: '#0d3522',
              border: '1px solid var(--green-glow)',
              color: 'var(--green-glow)',
              borderRadius: 20,
              padding: '0.2rem 0.6rem',
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
            }}>
              <Check size={10} strokeWidth={2.5} />{c.roomId}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
