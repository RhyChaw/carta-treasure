import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseQrCode } from '../lib/checkpoints'

export default function Scanner() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState('')
  const detectorRef = useRef(null)
  const rafRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      if ('BarcodeDetector' in window) {
        detectorRef.current = new BarcodeDetector({ formats: ['qr_code'] })
        rafRef.current = requestAnimationFrame(scanFrame)
      } else {
        setError("QR scanner not supported in this browser. Use manual entry below.")
      }
    } catch (err) {
      setError("Camera access denied. Use manual entry below.")
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  async function scanFrame() {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }
    try {
      const barcodes = await detectorRef.current.detect(videoRef.current)
      if (barcodes.length > 0) {
        const roomId = parseQrCode(barcodes[0].rawValue)
        if (roomId) {
          handleResult(roomId)
          return
        }
      }
    } catch {}
    rafRef.current = requestAnimationFrame(scanFrame)
  }

  function handleResult(roomId) {
    stopCamera()
    sessionStorage.setItem('jungle_scan_result', roomId)
    navigate('/game')
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    const raw = manualCode.trim().toUpperCase()
    const roomId = parseQrCode(`JUNGLE_HUNT_${raw}`) ?? parseQrCode(raw)
    if (roomId) {
      handleResult(roomId)
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
        onClick={() => navigate('/game')}
        style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%', width: 40, height: 40, fontSize: '1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        ✕
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
