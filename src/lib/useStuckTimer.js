import { useState, useEffect } from 'react'

const THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

export function useStuckTimer(player) {
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    const step = player?.current_step
    if (step == null || step >= 10 || player?.completed_at) {
      setIsStuck(false)
      return
    }

    const key = `jungle_step_start_${player.id}_${step}`
    let startTime = sessionStorage.getItem(key)
    if (!startTime) {
      startTime = Date.now()
      sessionStorage.setItem(key, String(startTime))
    } else {
      startTime = parseInt(startTime, 10)
    }

    const elapsed = Date.now() - startTime
    const remaining = THRESHOLD_MS - elapsed

    if (remaining <= 0) {
      setIsStuck(true)
      return
    }

    setIsStuck(false)
    const t = setTimeout(() => setIsStuck(true), remaining)
    return () => clearTimeout(t)
  }, [player?.current_step, player?.id, player?.completed_at])

  return isStuck
}
