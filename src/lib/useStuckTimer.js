import { useState, useEffect } from 'react'

const THRESHOLD_MS = 5 * 60 * 1000

export function useStuckTimer(player) {
  const [state, setState] = useState({ isStuck: false, remainingMs: THRESHOLD_MS })

  useEffect(() => {
    const step = player?.current_step
    if (step == null || step >= 10 || player?.completed_at) {
      setState({ isStuck: false, remainingMs: 0 })
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

    function tick() {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, THRESHOLD_MS - elapsed)
      const stuck = remaining === 0
      setState({ isStuck: stuck, remainingMs: remaining })
      return stuck
    }

    if (tick()) return

    const interval = setInterval(() => {
      if (tick()) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [player?.current_step, player?.id, player?.completed_at])

  return state
}
