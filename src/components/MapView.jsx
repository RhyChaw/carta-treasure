import { useRef, useState, useEffect } from 'react'

const CHECKPOINT_ROOMS = ['CLOVER', 'ASH', 'MAPLE', 'ORCHID', 'HICKORY', 'GLASGOW', 'IRIS', 'VIOLET', 'CHERRY', 'LIBRARY']

const ROOM_PINS = {
  GLASGOW:    { x: 4.5,  y: 4   },
  MAPLE:      { x: 44,   y: 14  },
  ASH:        { x: 71.5, y: 12  },
  VIOLET:     { x: 84,   y: 7   },
  ORCHID:     { x: 84.5, y: 38  },
  HICKORY:    { x: 71.5, y: 40  },
  CHERRY:     { x: 71.5, y: 27  },
  CLOVER:     { x: 46,   y: 37  },
  IRIS:       { x: 68.5, y: 52  },
  LIBRARY:    { x: 64,   y: 49  },
}

// ─────────────────────────────────────────────
// GPS CALIBRATION — update these if re-calibrating
// ─────────────────────────────────────────────
const GPS_REFS = [
  { lat: 43.4500889, lng: -80.5129959, xPct: ROOM_PINS.GLASGOW.x,  yPct: ROOM_PINS.GLASGOW.y  },  // GLASGOW
  { lat: 43.4503131, lng: -80.5123552, xPct: ROOM_PINS.VIOLET.x,   yPct: ROOM_PINS.VIOLET.y   },  // VIOLET
  { lat: 43.4501729, lng: -80.5125219, xPct: ROOM_PINS.LIBRARY.x,  yPct: ROOM_PINS.LIBRARY.y  },  // LIBRARY
]
// ─────────────────────────────────────────────

const GPS_CALIBRATED = GPS_REFS.every(r => r.lat !== null && r.lng !== null)

function buildTransform(refs) {
  // Normalize to small numbers around origin to avoid floating-point drift
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

export default function MapView({ completedRooms = [], currentRoom, highlightRoom = false }) {
  const containerRef = useRef(null)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [userPos, setUserPos] = useState(null)

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

  function getPinColor(roomId) {
    if (completedRooms.includes(roomId)) return '#4ADE80'
    if (roomId === currentRoom) return '#FBBF24'
    return '#374151'
  }

  function getPinLabel(roomId) {
    if (completedRooms.includes(roomId)) return '✓'
    if (roomId === currentRoom) return '●'
    return '○'
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
      <div style={{ position: 'relative', width: imgSize.w || '100%', height: imgSize.h || 200 }}>
        <img
          src="/assets/office.png"
          alt="Office Map"
          style={{ width: '100%', display: 'block' }}
        />

        {imgSize.w > 0 && CHECKPOINT_ROOMS.map(roomId => {
          const pin = ROOM_PINS[roomId]
          if (!pin) return null
          const isCurrent = roomId === currentRoom
          return (
            <div
              key={roomId}
              title={roomId}
              style={{
                position: 'absolute',
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: 'translate(-50%, -50%)',
                width: isCurrent && highlightRoom ? 28 : isCurrent ? 22 : 18,
                height: isCurrent && highlightRoom ? 28 : isCurrent ? 22 : 18,
                borderRadius: '50%',
                background: getPinColor(roomId),
                border: `${isCurrent && highlightRoom ? 3 : 2}px solid ${isCurrent ? '#fff' : 'rgba(0,0,0,0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isCurrent && highlightRoom ? 10 : 8,
                color: '#0A2A1B',
                fontWeight: 'bold',
                cursor: 'default',
                animation: isCurrent ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                zIndex: isCurrent ? 2 : 1,
                boxShadow: isCurrent && highlightRoom
                  ? '0 0 0 6px rgba(251,191,36,0.35), 0 0 16px #FBBF24'
                  : isCurrent ? '0 0 8px #FBBF24' : 'none',
              }}
            >
              {getPinLabel(roomId)}
            </div>
          )
        })}

        {/* "You are here" dot — only renders once GPS_REFS are filled in */}
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
            {/* Accuracy ring */}
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
            {/* Blue dot */}
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

      <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ color: '#4ADE80' }}>● Completed</span>
        <span style={{ color: '#FBBF24' }}>● Current Target</span>
        <span style={{ color: '#374151' }}>● Undiscovered</span>
        {GPS_CALIBRATED && <span style={{ color: '#3B82F6' }}>● You</span>}
      </div>
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
