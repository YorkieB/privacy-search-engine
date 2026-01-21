import config from '../config/index.js';

/**
 * In-memory cache service for search results
 * Implements LRU eviction policy to manage memory usage
 */
class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttlSeconds = config.cache.ttlSeconds;
    this.maxEntries = config.cache.maxEntries;
    this.accessOrder = new Map(); // For LRU tracking
  }

  /**
   * Generate cache key from query and options
   * @param {string} type - Type of search (web, images, news)
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {string} Cache key
   */
  generateKey(type, query, options = {}) {
    const normalizedQuery = query.toLowerCase().trim();
    const optionsString = JSON.stringify(options);
    return `${type}::${normalizedQuery}::${optionsString}`;
  }

  /**
   * Get cached result
   * @param {string} key - Cache key
   * @returns {object|null} Cached result or null if not found/expired
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.ttlSeconds * 1000) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(key);
    
    return {
      ...entry.data,
      cached: true,
      cacheTimestamp: entry.timestamp
    };
  }

  /**
   * Store result in cache
   * @param {string} key - Cache key
   * @param {object} data - Data to cache
   */
  set(key, data) {
    const now = Date.now();
    
    // Remove oldest entries if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      this.evictLRU();
    }

    // Store entry with timestamp
    this.cache.set(key, {
      data: { ...data, cached: false },
      timestamp: now
    });

    // Update access order
    this.updateAccessOrder(key);
  }

  /**
   * Clear all cached entries
   */
  clear() {
    this.cache.clear();
    this.accessOrder.clear();
  }

  /**
   * Remove expired entries
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlSeconds * 1000) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.accessOrder.delete(key);
    });

    return expiredKeys.length;
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > this.ttlSeconds * 1000) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      maxEntries: this.maxEntries,
      hitRatio: this.accessOrder.size > 0 ? validEntries / this.accessOrder.size : 0
    };
  }

  /**
   * Update access order for LRU tracking
   * @private
   */
  updateAccessOrder(key) {
    // Remove existing entry
    if (this.accessOrder.has(key)) {
      this.accessOrder.delete(key);
    }
    
    // Add to end (most recent)
    this.accessOrder.set(key, Date.now());
  }

  /**
   * Evict least recently used entries
   * @private
   */
  evictLRU() {
    // Get oldest entry
    const oldestKey = this.accessOrder.keys().next().value;
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }

  /**
   * Get cached search results with automatic cleanup
   * @param {string} type - Search type
   * @param {string} query - Search query  
   * @param {object} options - Search options
   * @returns {object|null} Cached results or null
   */
  getSearchResults(type, query, options = {}) {
    // Clean up expired entries periodically
    if (Math.random() < 0.1) { // 10% chance
      this.cleanup();
    }

    const key = this.generateKey(type, query, options);
    return this.get(key);
  }

  /**
   * Cache search results
   * @param {string} type - Search type
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @param {object} results - Search results to cache
   */
  setSearchResults(type, query, options = {}, results) {
    const key = this.generateKey(type, query, options);
    this.set(key, results);
  }
}

// Create singleton instance
export default new CacheService();