import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { usePlayer } from '../lib/playerContext'
import { CHECKPOINTS, getCheckpoint, validatePassphrase } from '../lib/checkpoints'
import ProgressBar from '../components/ProgressBar'
import RiddleCard from '../components/RiddleCard'
import Toast from '../components/Toast'
import MapView from '../components/MapView'

export default function Game() {
  const navigate = useNavigate()
  const { player, updateStep, logout } = usePlayer()
  const [passphrase, setPassphrase] = useState('')
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })
  const [loading, setLoading] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [mapOpen, setMapOpen] = useState(false)

  useEffect(() => {
    if (!player) navigate('/')
  }, [player, navigate])

  useEffect(() => {
    const pending = sessionStorage.getItem('jungle_scan_result')
    if (pending) {
      sessionStorage.removeItem('jungle_scan_result')
      handleScanResult(pending)
    }
  }, [])

  function showToast(message, type = 'success') {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500)
  }

  function handleScanResult(scannedRoomId) {
    const current = getCheckpoint(player.current_step)
    if (!current) return
    if (scannedRoomId === current.roomId) {
      setScanResult(scannedRoomId)
      showToast(`✨ You found ${scannedRoomId}! Now solve the challenge.`, 'success')
    } else {
      showToast("The spirits here don't welcome us yet... we must look elsewhere, explorer.", 'error')
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
        updateStep(nextStep)
        navigate('/victory')
        return
      }

      await supabase.from('players').update({ current_step: nextStep }).eq('id', player.id)
      updateStep(nextStep)
      setScanResult(null)
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
      <Toast {...toast} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Explorer
          </p>
          <p style={{ fontWeight: 'bold', color: 'var(--green-glow)' }}>{player.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-ghost" onClick={() => navigate('/leaderboard')}>Board</button>
          <button className="btn-ghost" onClick={() => { logout(); navigate('/') }}>⤶</button>
        </div>
      </div>

      <ProgressBar current={player.current_step} total={CHECKPOINTS.length} />

      {!scanResult ? (
        <RiddleCard
          checkpoint={currentCheckpoint}
          onScan={() => navigate('/scan')}
        />
      ) : (
        <motion.div className="card fade-in" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
            "Enter the passphrase from the challenge, explorer..."
          </p>
          <form onSubmit={handlePassphraseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              className="input-field"
              placeholder="Enter passphrase..."
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              autoFocus
              autoCapitalize="none"
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={() => { setScanResult(null); setPassphrase('') }}>
                ← Back
              </button>
              <button type="submit" className="btn-primary" disabled={loading || !passphrase.trim()}>
                {loading ? 'Checking...' : 'Submit'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div>
        <button
          className="btn-ghost"
          onClick={() => setMapOpen(o => !o)}
          style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0' }}
        >
          {mapOpen ? '▲ Hide Map' : '▼ Show Map'}
        </button>
        {mapOpen && <MapView completedRooms={completedCheckpoints.map(c => c.roomId)} currentRoom={currentCheckpoint?.roomId} />}
      </div>

      {completedCheckpoints.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {completedCheckpoints.map(c => (
            <span key={c.roomId} style={{
              background: '#0d3522',
              border: '1px solid var(--green-glow)',
              color: 'var(--green-glow)',
              borderRadius: 20,
              padding: '0.2rem 0.6rem',
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
            }}>
              ✓ {c.roomId}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
