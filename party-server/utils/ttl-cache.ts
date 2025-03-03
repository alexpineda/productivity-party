/*
<ai_context>
A generic TTL cache utility that can be used across the application.
</ai_context>
<recent_changes>
Created a new generic TTL cache utility.
</recent_changes>
*/

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export class TTLCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private ttlMs: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    // Default 5 minute TTL
    this.cache = new Map();
    this.ttlMs = ttlMs;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get all valid entries (not expired)
  entries(): [string, T][] {
    const now = Date.now();
    return Array.from(this.cache.entries())
      .filter(([_, entry]) => now - entry.timestamp <= this.ttlMs)
      .map(([key, entry]) => [key, entry.value]);
  }

  // Get size of cache (including expired entries)
  get size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.cache.delete(key);
      }
    }
  }

  // Update TTL for the cache
  setTTL(ttlMs: number): void {
    this.ttlMs = ttlMs;
    this.cleanup(); // Clean up any entries that would be expired with new TTL
  }
}
