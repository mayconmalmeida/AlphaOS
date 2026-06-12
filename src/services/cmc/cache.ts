export type CacheKey = string

type Entry<T> = { value: T; expiresAt: number }

export class MemoryCache {
  private readonly store = new Map<CacheKey, Entry<unknown>>()

  get<T>(key: CacheKey): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }
    return entry.value as T
  }

  set<T>(key: CacheKey, value: T, ttlMs: number) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  clear(prefix?: string) {
    if (!prefix) {
      this.store.clear()
      return
    }
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key)
    }
  }
}

