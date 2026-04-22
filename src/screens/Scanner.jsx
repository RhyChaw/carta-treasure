import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { BrowserQRCodeReader } from '@zxing/browser'
import { parseQrCode } from '../lib/checkpoints'

export default function Scanner() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const controlsRef = useRef(null)
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    startScanner()
    return () => controlsRef.current?.stop()
  }, [])

  async function startScanner() {
    try {
      readerRef.current = new BrowserQRCodeReader()
      controlsRef.current = await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, err) => {
          if (result) {
            const roomId = parseQrCode(result.getText())
            if (roomId) {
              controlsRef.current?.stop()
              sessionStorage.setItem('jungle_scan_result', roomId)
              navigate('/game')
            }
          }
        }
      )
    } catch {
      setError("Camera access denied. Use manual entry below.")
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    const raw = manualCode.trim().toUpperCase()
    const roomId = parseQrCode(raw) ?? parseQrCode(`JUNGLE_HUNT_${raw}`)
    if (roomId) {
      controlsRef.current?.stop()
      sessionStorage.setItem('jungle_scan_result', roomId)
      navigate('/game')
    } else {
      setError("That doesn't look like a valid jungle code. Try again.")
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>
      <video
        ref={videoRef}
        style={{ flex: 1, objectFit: 'cover', width: '100%' }}
        playsInline
        muted
      />

      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          width: 220, height: 220, border: '2px solid var(--green-glow)',
          borderRadius: 12, boxShadow: '0 0 0 2000px rgba(0,0,0,0.45)',
        }} />
      </div>

      <button
        onClick={() => { controlsRef.current?.stop(); navigate('/game') }}
        style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%', width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <X size={18} strokeWidth={2} />
      </button>

      <p style={{
        position: 'absolute', top: '50%', marginTop: 130,
        width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem',
      }}>
        Point at the QR code...
      </p>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(10,42,27,0.95)', padding: '1rem 1.25rem 2rem',
        borderTop: '1px solid var(--border)',
      }}>
        {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{error}</p>}
        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="input-field"
            placeholder="Or type room code (e.g. CLOVER)"
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            autoCapitalize="characters"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.8rem 1rem' }}>
            GO
          </button>
        </form>
      </div>
    </div>
  )
}
