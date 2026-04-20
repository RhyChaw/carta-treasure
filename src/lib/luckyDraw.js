export function pickWinners(players, count) {
  if (players.length === 0) return []
  const n = Math.min(count, players.length)
  const arr = [...players]

  // Fisher-Yates shuffle using crypto.getRandomValues for true randomness
  const randomBytes = new Uint32Array(arr.length)
  crypto.getRandomValues(randomBytes)

  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomBytes[i] % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr.slice(0, n)
}
