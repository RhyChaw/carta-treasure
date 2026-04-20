import { createContext, useContext, useState, useEffect } from 'react'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [player, setPlayer] = useState(() => {
    try {
      const saved = sessionStorage.getItem('jungle_player')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (player) {
      sessionStorage.setItem('jungle_player', JSON.stringify(player))
    } else {
      sessionStorage.removeItem('jungle_player')
    }
  }, [player])

  function login(playerData) {
    setPlayer(playerData)
  }

  function logout() {
    setPlayer(null)
  }

  function updateStep(step) {
    setPlayer(prev => ({ ...prev, current_step: step }))
  }

  return (
    <PlayerContext.Provider value={{ player, login, logout, updateStep }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
