import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import jsQR from 'jsqr'
import { parseQrCode } from '../lib/checkpoints'

export default function Scanner() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState('')
  const rafRef = useRef(null)
  const streamRef = useRef(null)
  const doneRef = useRef(false)

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
        videoRef.current.addEventListener('playing', () => {
          rafRef.current = requestAnimationFrame(scanFrame)
        }, { once: true })
      }
    } catch {
      setError("Camera access denied. Use manual entry below.")
    }
  }

  function stopCamera() {
    doneRef.current = true
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  function scanFrame() {
    if (doneRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const w = video?.videoWidth
    const h = video?.videoHeight
    if (!video || !canvas || !w || !h) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(video, 0, 0, w, h)
    const imageData = ctx.getImageData(0, 0, w, h)
    const code = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' })
    if (code?.data) {
      const roomId = parseQrCode(code.data)
      if (roomId) {
        handleResult(roomId)
        return
      }
    }
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
    const roomId = parseQrCode(raw) ?? parseQrCode(`JUNGLE_HUNT_${raw}`)
    if (roomId) {
      handleResult(roomId)
    } else {
      setError("That doesn't look like a valid jungle code. Try again.")
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
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
