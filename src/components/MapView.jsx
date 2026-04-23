import { useRef, useState, useEffect } from 'react'

// Only these rooms are game checkpoints — determines completed/active states
const CHECKPOINT_ROOMS = new Set(['CLOVER', 'ASH', 'MAPLE', 'ORCHID', 'HICKORY', 'GLASGOW', 'IRIS', 'VIOLET', 'CHERRY', 'LIBRARY'])

// All rooms shown on the map (checkpoints + decoys)
const ROOM_PINS = {
  // ── Checkpoint rooms ──────────────────────────────
  GLASGOW:    { x: 4.3,  y: 14.3 },
  MAPLE:      { x: 42.7, y: 24.1 },
  ASH:        { x: 71.5, y: 12.0 },
  VIOLET:     { x: 82.5, y: 13.3 },
  TRILLIUM:   { x: 81.7, y: 23.1 },
  CHERRY:     { x: 71.5, y: 27.0 },
  ORCHID:     { x: 81.9, y: 49.4 },
  HICKORY:    { x: 71.5, y: 40.0 },
  POPPY:      { x: 81.7, y: 39.1 },
  PINE:       { x: 55.0, y: 35.3 },
  CLOVER:     { x: 44.1, y: 48.9 },
  WALNUT:     { x: 55.0, y: 45.5 },
  IRIS:       { x: 67.3, y: 64.5 },
  LIBRARY:    { x: 62.0, y: 64.9 },
  LILY:       { x: 71.4, y: 64.9 },
  MAYFLOWER:  { x: 75.5, y: 66.9 },
  // ── Decoy rooms ───────────────────────────────────
  KITCHEN:    { x: 31.0, y: 11.9 },
  GYM:        { x: 52.6, y: 9.9  },
  WEBER:      { x: 10.5, y: 9.9  },
  OAK:        { x: 11.5, y: 15.5 },
  BUNCHBERRY: { x: 40.0, y: 46.9 },
  DANDELION:  { x: 48.2, y: 47.9 },
  ROSE:       { x: 82.3, y: 23.8 },
  CABIN:      { x: 92.6, y: 86.4 },
}

// ─────────────────────────────────────────────
// GPS CALIBRATION — update these if re-calibrating
// ─────────────────────────────────────────────
const GPS_REFS = [
  { lat: 43.4500889, lng: -80.5129959, xPct: ROOM_PINS.GLASGOW.x,  yPct: ROOM_PINS.GLASGOW.y  },
  { lat: 43.4503131, lng: -80.5123552, xPct: ROOM_PINS.VIOLET.x,   yPct: ROOM_PINS.VIOLET.y   },
  { lat: 43.4501729, lng: -80.5125219, xPct: ROOM_PINS.LIBRARY.x,  yPct: ROOM_PINS.LIBRARY.y  },
]
// ─────────────────────────────────────────────

const GPS_CALIBRATED = GPS_REFS.every(r => r.lat !== null && r.lng !== null)

function buildTransform(refs) {
  const latO = refs[0].lat
  const lngO = refs[0].lng
  const pts = refs.map(r => ({ dLat: r.lat - latO, dLng: r.lng - lngO, xPct: r.xPct, yPct: r.yPct }))
  const [p1, p2, p3] = pts

  const det =
    p1.dLat * (p2.dLng - p3.dLng) -
    p1.dLng * (p2.dLat - p3.dLat) +
    (p2.dLat * p3.dLng - p3.dLat * p2.dLng)
  if (Math.abs(det) < 1e-20) return null

  const ax = (p1.xPct * (p2.dLng - p3.dLng) - p1.dLng * (p2.xPct - p3.xPct) + (p2.xPct * p3.dLng - p3.xPct * p2.dLng)) / det
  const bx = (p1.dLat * (p2.xPct - p3.xPct) - p1.xPct * (p2.dLat - p3.dLat) + (p2.dLat * p3.xPct - p3.dLat * p2.xPct)) / det
  const cx = (p1.dLat * (p2.dLng * p3.xPct - p3.dLng * p2.xPct) - p1.dLng * (p2.dLat * p3.xPct - p3.dLat * p2.xPct) + p1.xPct * (p2.dLat * p3.dLng - p3.dLat * p2.dLng)) / det

  const ay = (p1.yPct * (p2.dLng - p3.dLng) - p1.dLng * (p2.yPct - p3.yPct) + (p2.yPct * p3.dLng - p3.yPct * p2.dLng)) / det
  const by = (p1.dLat * (p2.yPct - p3.yPct) - p1.yPct * (p2.dLat - p3.dLat) + (p2.dLat * p3.yPct - p3.dLat * p2.yPct)) / det
  const cy = (p1.dLat * (p2.dLng * p3.yPct - p3.dLng * p2.yPct) - p1.dLng * (p2.dLat * p3.yPct - p3.dLat * p2.yPct) + p1.yPct * (p2.dLat * p3.dLng - p3.dLat * p2.dLng)) / det

  return { ax, bx, cx, ay, by, cy, latO, lngO }
}

function applyTransform(t, lat, lng) {
  const dLat = lat - t.latO
  const dLng = lng - t.lngO
  return {
    xPct: t.ax * dLat + t.bx * dLng + t.cx,
    yPct: t.ay * dLat + t.by * dLng + t.cy,
  }
}

const TRANSFORM = GPS_CALIBRATED ? buildTransform(GPS_REFS) : null

function formatMs(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function MapView({ completedRooms = [], currentRoom, isStuck = false, remainingMs = 0 }) {
  const containerRef = useRef(null)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [userPos, setUserPos] = useState(null)
  const [showLabels, setShowLabels] = useState(false)
  const [tapCoords, setTapCoords] = useState(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      if (containerRef.current) {
        const containerW = containerRef.current.offsetWidth
        const scale = containerW / img.naturalWidth
        setImgSize({ w: containerW, h: img.naturalHeight * scale })
      }
    }
    img.src = '/assets/office.png'
  }, [])

  useEffect(() => {
    if (!GPS_CALIBRATED || !TRANSFORM || !navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      err => console.warn('GPS:', err.message),
      { enableHighAccuracy: true, timeout: 15000 }
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  const userMapPos = userPos && TRANSFORM ? applyTransform(TRANSFORM, userPos.lat, userPos.lng) : null
  const userVisible = userMapPos && userMapPos.xPct >= 0 && userMapPos.xPct <= 100 && userMapPos.yPct >= 0 && userMapPos.yPct <= 100
  const outsideOffice = userPos && TRANSFORM && !userVisible

  const currentRevealed = isStuck

  function getPinStyle(roomId) {
    const isCheckpoint = CHECKPOINT_ROOMS.has(roomId)
    const isCompleted = completedRooms.includes(roomId)
    const isActive = isCheckpoint && roomId === currentRoom && currentRevealed

    if (isCompleted) return { bg: '#4ADE80', label: '✓', size: 18, active: false }
    if (isActive)    return { bg: '#FBBF24', label: '●', size: 28, active: true }
    return { bg: '#374151', label: '○', size: 16, active: false }
  }

  function handleMapTap(e) {
    if (!showLabels) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1)
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1)
    setTapCoords({ x, y })
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'auto',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: '#071e12',
        touchAction: 'pan-x pan-y',
      }}
    >
      <div style={{ position: 'relative', width: imgSize.w || '100%', height: imgSize.h || 200 }} onClick={handleMapTap}>
        <img
          src="/assets/office.png"
          alt="Office Map"
          style={{ width: '100%', display: 'block' }}
        />

        {imgSize.w > 0 && Object.entries(ROOM_PINS).map(([roomId, pin]) => {
          const { bg, label, size, active } = getPinStyle(roomId)
          return (
            <div
              key={roomId}
              style={{
                position: 'absolute',
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: active ? 2 : 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <div
                title={showLabels ? roomId : undefined}
                style={{
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  background: bg,
                  border: `${active ? 3 : 2}px solid ${active ? '#fff' : 'rgba(0,0,0,0.4)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: active ? 10 : 8,
                  color: '#0A2A1B',
                  fontWeight: 'bold',
                  cursor: 'default',
                  animation: active ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                  boxShadow: active ? '0 0 0 6px rgba(251,191,36,0.35), 0 0 16px #FBBF24' : 'none',
                }}
              >
                {label}
              </div>
              {showLabels && (
                <span style={{
                  background: 'rgba(0,0,0,0.8)',
                  color: CHECKPOINT_ROOMS.has(roomId) ? '#4ADE80' : '#9ca3af',
                  fontSize: 8,
                  padding: '1px 3px',
                  borderRadius: 3,
                  whiteSpace: 'nowrap',
                  fontFamily: 'monospace',
                  pointerEvents: 'none',
                }}>
                  {roomId}
                </span>
              )}
            </div>
          )
        })}

        {showLabels && tapCoords && (
          <div style={{
            position: 'absolute',
            left: `${tapCoords.x}%`,
            top: `${tapCoords.y}%`,
            transform: 'translate(-50%, -120%)',
            background: '#000',
            color: '#4ADE80',
            fontSize: 9,
            padding: '2px 5px',
            borderRadius: 4,
            whiteSpace: 'nowrap',
            fontFamily: 'monospace',
            border: '1px solid #4ADE80',
            pointerEvents: 'none',
            zIndex: 30,
          }}>
            x:{tapCoords.x} y:{tapCoords.y}
          </div>
        )}

        {imgSize.w > 0 && userVisible && (
          <div
            style={{
              position: 'absolute',
              left: `${userMapPos.xPct}%`,
              top: `${userMapPos.yPct}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
            }}
          >
            <div style={{
              position: 'absolute',
              inset: '50%',
              transform: 'translate(-50%, -50%)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59,130,246,0.35)',
            }} />
            <div style={{
              position: 'relative',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#3B82F6',
              border: '2.5px solid #fff',
              boxShadow: '0 0 0 3px rgba(59,130,246,0.3)',
            }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: '#4ADE80' }}>● Completed</span>
        {currentRevealed && <span style={{ color: '#FBBF24' }}>● Current Target</span>}
        <span style={{ color: '#374151' }}>● Room</span>
        {GPS_CALIBRATED && <span style={{ color: '#3B82F6' }}>● You</span>}
        <button
          onClick={() => { setShowLabels(s => !s); setTapCoords(null) }}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: '1px solid var(--border)',
            color: showLabels ? '#4ADE80' : 'var(--text-muted)',
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          {showLabels ? 'labels on' : 'labels off'}
        </button>
      </div>

      {showLabels && tapCoords && (
        <div style={{ padding: '0 0.75rem 0.5rem', fontSize: '0.72rem', color: '#4ADE80', fontFamily: 'monospace' }}>
          tapped → x:{tapCoords.x}% y:{tapCoords.y}%
        </div>
      )}

      {currentRoom && !currentRevealed && remainingMs > 0 && (
        <div style={{
          padding: '0.5rem 0.75rem 0.6rem',
          fontSize: '0.78rem',
          fontWeight: 'bold',
          color: '#FBBF24',
          letterSpacing: '0.04em',
        }}>
          SEE CURRENT TARGET IN {formatMs(remainingMs)}
        </div>
      )}
      {outsideOffice && (
        <div style={{ padding: '0.4rem 0.75rem 0.6rem', fontSize: '0.78rem', color: '#FBBF24', fontWeight: 'bold' }}>
          You are outside the office
        </div>
      )}
      {userPos && !outsideOffice && (
        <div style={{ padding: '0.25rem 0.75rem 0.5rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
          GPS: {userPos.lat.toFixed(7)}, {userPos.lng.toFixed(7)} (±{Math.round(userPos.accuracy)}m)
        </div>
      )}
    </div>
  )
}
