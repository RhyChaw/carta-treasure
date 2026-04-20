import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase env vars. Create a .env file from .env.example.')
}

function getPlayerId() {
  try {
    const saved = sessionStorage.getItem('jungle_player')
    return saved ? JSON.parse(saved)?.id ?? '' : ''
  } catch {
    return ''
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options = {}) => {
      const headers = new Headers(options.headers)
      const playerId = getPlayerId()
      if (playerId) headers.set('x-player-id', playerId)
      return fetch(url, { ...options, headers })
    },
  },
})
