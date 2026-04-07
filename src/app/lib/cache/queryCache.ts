/**
 * Query Cache Manager
 * Provides in-memory caching for frequently accessed queries
 * Uses TTL (Time To Live) for cache invalidation
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

class QueryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number = 1000; // Maximum number of cache entries
  private defaultTTL: number = 60000; // Default TTL: 60 seconds

  // Extended TTLs for different content types
  private extendedTTLs: Record<string, number> = {
    business: 600000, // 10 minutes for business data
    businesses: 300000, // 5 minutes for business lists
    reviews: 300000, // 5 minutes for reviews
    stats: 900000, // 15 minutes for stats (less frequently updated)
    profile: 600000, // 10 minutes for profiles
  };

  /**
   * Generate a cache key from query parameters
   */
  private generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${JSON.stringify(params[key])}`)
      .join("|");
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if entry has expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry with optional TTL
   * If TTL is not provided, attempts to infer from key prefix
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    // Auto-detect TTL from key prefix if not provided
    let finalTTL = ttl;
    if (!finalTTL) {
      for (const [prefix, prefixTTL] of Object.entries(this.extendedTTLs)) {
        if (key.startsWith(prefix + ":")) {
          finalTTL = prefixTTL;
          break;
        }
      }
      finalTTL = finalTTL || this.defaultTTL;
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: finalTTL,
    });
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete all cache entries matching a prefix
   */
  deleteByPrefix(prefix: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Evict the oldest cache entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      maxSize: this.maxSize,
    };
  }

  /**
   * Generate cache key helper
   */
  key(prefix: string, params: Record<string, any>): string {
    return this.generateKey(prefix, params);
  }
}

// Singleton instance
export const queryCache = new QueryCache();

/**
 * Cache decorator for async functions
 * Automatically caches function results
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyPrefix: string;
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const key = options.keyGenerator
      ? options.keyGenerator(...args)
      : queryCache.key(options.keyPrefix, { args });

    // Check cache first
    const cached = queryCache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    queryCache.set(key, result, options.ttl);

    return result;
  }) as T;
}
