interface Entry<T> {
  value: T
  expiresAt: number
}

export class TtlCache {
  private store = new Map<string, Entry<unknown>>()

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value as T
  }

  invalidate(key: string): void {
    this.store.delete(key)
  }

  // löscht alles mit diesem prefix
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key)
    }
  }
}

export const cache = new TtlCache()
