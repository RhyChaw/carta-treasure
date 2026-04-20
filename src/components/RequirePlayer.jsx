import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../lib/playerContext'

export default function RequirePlayer({ children }) {
  const { player } = usePlayer()
  const navigate = useNavigate()
  useEffect(() => {
    if (!player) navigate('/')
  }, [player, navigate])
  if (!player) return null
  return children
}
