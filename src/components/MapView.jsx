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

export default function MapView({ completedRooms = [], currentRoom }) {
  const containerRef = useRef(null)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })

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
                width: isCurrent ? 22 : 18,
                height: isCurrent ? 22 : 18,
                borderRadius: '50%',
                background: getPinColor(roomId),
                border: `2px solid ${isCurrent ? '#fff' : 'rgba(0,0,0,0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                color: '#0A2A1B',
                fontWeight: 'bold',
                cursor: 'default',
                animation: isCurrent ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                zIndex: isCurrent ? 2 : 1,
                boxShadow: isCurrent ? '0 0 8px #FBBF24' : 'none',
              }}
            >
              {getPinLabel(roomId)}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ color: '#4ADE80' }}>● Completed</span>
        <span style={{ color: '#FBBF24' }}>● Current Target</span>
        <span style={{ color: '#374151' }}>● Undiscovered</span>
      </div>
    </div>
  )
}
