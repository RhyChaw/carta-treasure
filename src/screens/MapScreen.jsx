import { usePlayer } from '../lib/playerContext'
import { CHECKPOINTS, getCheckpoint } from '../lib/checkpoints'
import { useStuckTimer } from '../lib/useStuckTimer'
import MapView from '../components/MapView'

export default function MapScreen() {
  const { player } = usePlayer()
  const { isStuck, remainingMs } = useStuckTimer(player)

  if (!player) return null

  const completedRooms = CHECKPOINTS
    .slice(0, player.current_step)
    .map(c => c.roomId)
  const currentCheckpoint = getCheckpoint(player.current_step)

  return (
    <div className="screen">
      <div>
        <h1 style={{ fontSize: '1.1rem' }}>Office Map</h1>
        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
          Tap a pin to see its status.
        </p>
      </div>
      <MapView
        completedRooms={completedRooms}
        currentRoom={currentCheckpoint?.roomId}
        isStuck={isStuck}
        remainingMs={remainingMs}
      />
    </div>
  )
}
