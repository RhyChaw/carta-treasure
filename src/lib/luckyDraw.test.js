import { describe, it, expect } from 'vitest'
import { pickWinners } from './luckyDraw'

describe('pickWinners', () => {
  const players = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Carol' },
    { id: '4', name: 'Dave' },
    { id: '5', name: 'Eve' },
    { id: '6', name: 'Frank' },
    { id: '7', name: 'Grace' },
  ]

  it('returns exactly count winners', () => {
    expect(pickWinners(players, 5)).toHaveLength(5)
  })

  it('returns all players when count >= length', () => {
    expect(pickWinners(players, 10)).toHaveLength(7)
  })

  it('returns empty array for empty players', () => {
    expect(pickWinners([], 5)).toHaveLength(0)
  })

  it('returns unique winners (no duplicates)', () => {
    const winners = pickWinners(players, 5)
    const ids = winners.map(w => w.id)
    expect(new Set(ids).size).toBe(5)
  })

  it('winners are a subset of the original players', () => {
    const winners = pickWinners(players, 5)
    const playerIds = new Set(players.map(p => p.id))
    winners.forEach(w => expect(playerIds.has(w.id)).toBe(true))
  })

  it('does not mutate the original array', () => {
    const original = [...players]
    pickWinners(players, 5)
    expect(players).toEqual(original)
  })

  it('produces different results across runs (probabilistic)', () => {
    const runs = Array.from({ length: 10 }, () =>
      pickWinners(players, 3).map(w => w.id).join(',')
    )
    const unique = new Set(runs)
    expect(unique.size).toBeGreaterThan(1)
  })
})
