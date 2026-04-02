import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TtlCache } from '../../main/cache'

describe('TtlCache', () => {
  let cache: TtlCache

  beforeEach(() => {
    cache = new TtlCache()
    vi.useFakeTimers()
  })

  it('gibt gespeicherten Wert zurück', () => {
    cache.set('key', { data: 1 }, 60)
    expect(cache.get('key')).toEqual({ data: 1 })
  })

  it('gibt null zurück wenn TTL abgelaufen', () => {
    cache.set('key', { data: 1 }, 30)
    vi.advanceTimersByTime(31_000)
    expect(cache.get('key')).toBeNull()
  })

  it('invalidiert einen Key', () => {
    cache.set('key', { data: 1 }, 60)
    cache.invalidate('key')
    expect(cache.get('key')).toBeNull()
  })

  it('invalidiert alle Keys mit Prefix', () => {
    cache.set('proj1:servers', [1, 2], 60)
    cache.set('proj1:server:1', { id: 1 }, 60)
    cache.set('proj2:servers', [3], 60)
    cache.invalidatePrefix('proj1:')
    expect(cache.get('proj1:servers')).toBeNull()
    expect(cache.get('proj1:server:1')).toBeNull()
    expect(cache.get('proj2:servers')).toEqual([3])
  })

  it('überschreibt bestehenden Eintrag', () => {
    cache.set('key', 'old', 60)
    cache.set('key', 'new', 60)
    expect(cache.get('key')).toBe('new')
  })
})
