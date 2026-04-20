import { describe, it, expect } from 'vitest'
import { validatePassphrase, parseQrCode, getCheckpoint, CHECKPOINTS } from './checkpoints'

describe('validatePassphrase', () => {
  it('accepts exact match', () => {
    expect(validatePassphrase(CHECKPOINTS[0], 'LUCK')).toBe(true)
  })
  it('is case insensitive', () => {
    expect(validatePassphrase(CHECKPOINTS[0], 'luck')).toBe(true)
    expect(validatePassphrase(CHECKPOINTS[0], 'Luck')).toBe(true)
  })
  it('trims whitespace', () => {
    expect(validatePassphrase(CHECKPOINTS[0], '  LUCK  ')).toBe(true)
  })
  it('rejects wrong passphrase', () => {
    expect(validatePassphrase(CHECKPOINTS[0], 'WRONG')).toBe(false)
  })
})

describe('parseQrCode', () => {
  it('parses valid QR code', () => {
    expect(parseQrCode('JUNGLE_HUNT_MAPLE')).toBe('MAPLE')
  })
  it('returns null for invalid code', () => {
    expect(parseQrCode('not-a-qr-code')).toBeNull()
    expect(parseQrCode(null)).toBeNull()
  })
})

describe('getCheckpoint', () => {
  it('returns checkpoint by index', () => {
    expect(getCheckpoint(0).roomId).toBe('CLOVER')
    expect(getCheckpoint(9).roomId).toBe('LIBRARY')
  })
  it('returns null for out-of-bounds', () => {
    expect(getCheckpoint(10)).toBeNull()
    expect(getCheckpoint(-1)).toBeNull()
  })
})
