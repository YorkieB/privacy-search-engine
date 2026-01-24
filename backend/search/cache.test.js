import CacheService from './cache.js';

// Mock the config
jest.mock('../config/index.js', () => ({
  default: {
    cache: {
      ttlSeconds: 300,
      maxEntries: 100
    }
  }
}));

describe('CacheService', () => {
  beforeEach(() => {
    // Clear cache before each test
    CacheService.clear();
  });

  describe('generateKey', () => {
    it('should generate consistent keys for same inputs', () => {
      const key1 = CacheService.generateKey('web', 'test query', { page: 1 });
      const key2 = CacheService.generateKey('web', 'test query', { page: 1 });

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different queries', () => {
      const key1 = CacheService.generateKey('web', 'query1');
      const key2 = CacheService.generateKey('web', 'query2');

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different types', () => {
      const key1 = CacheService.generateKey('web', 'test');
      const key2 = CacheService.generateKey('images', 'test');

      expect(key1).not.toBe(key2);
    });

    it('should normalize query case', () => {
      const key1 = CacheService.generateKey('web', 'TEST QUERY');
      const key2 = CacheService.generateKey('web', 'test query');

      expect(key1).toBe(key2);
    });

    it('should trim whitespace from queries', () => {
      const key1 = CacheService.generateKey('web', '  test  ');
      const key2 = CacheService.generateKey('web', 'test');

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different options', () => {
      const key1 = CacheService.generateKey('web', 'test', { page: 1 });
      const key2 = CacheService.generateKey('web', 'test', { page: 2 });

      expect(key1).not.toBe(key2);
    });
  });

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      const key = 'test::key';
      const data = { results: ['item1', 'item2'] };

      CacheService.set(key, data);
      const cached = CacheService.get(key);

      expect(cached).toBeDefined();
      expect(cached.results).toEqual(data.results);
      expect(cached.cached).toBe(true);
      expect(cached.cacheTimestamp).toBeDefined();
    });

    it('should return null for non-existent keys', () => {
      const cached = CacheService.get('nonexistent::key');
      expect(cached).toBeNull();
    });

    it('should update access order on get', () => {
      const key1 = 'test::key1';
      const key2 = 'test::key2';

      CacheService.set(key1, { data: 'first' });
      CacheService.set(key2, { data: 'second' });

      // Access key1 to make it more recent
      CacheService.get(key1);

      // Verify both keys still exist
      expect(CacheService.get(key1)).not.toBeNull();
      expect(CacheService.get(key2)).not.toBeNull();
    });

    it('should handle concurrent sets of same key', () => {
      const key = 'test::key';

      CacheService.set(key, { data: 'first' });
      CacheService.set(key, { data: 'second' });

      const cached = CacheService.get(key);
      expect(cached.data).toBe('second');
    });
  });

  describe('TTL and expiration', () => {
    it('should return null for expired entries', (done) => {
      // Create cache with 1 second TTL
      const testCache = {
        cache: new Map(),
        ttlSeconds: 0.1, // 100ms
        maxEntries: 100,
        accessOrder: new Map(),
        get: CacheService.get.bind(CacheService),
        set: CacheService.set.bind(CacheService),
        updateAccessOrder: CacheService.updateAccessOrder.bind(CacheService)
      };

      const key = 'test::expiring';
      const data = { results: ['test'] };

      // Temporarily swap cache instances
      const originalTTL = CacheService.ttlSeconds;
      CacheService.ttlSeconds = 0.1;

      CacheService.set(key, data);

      // Immediately should be available
      expect(CacheService.get(key)).not.toBeNull();

      // After TTL should be expired
      setTimeout(() => {
        expect(CacheService.get(key)).toBeNull();
        CacheService.ttlSeconds = originalTTL;
        done();
      }, 150);
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used entry when at capacity', () => {
      // Set max entries to 3 for testing
      const originalMax = CacheService.maxEntries;
      CacheService.maxEntries = 3;

      CacheService.set('key1', { data: '1' });
      CacheService.set('key2', { data: '2' });
      CacheService.set('key3', { data: '3' });

      // Access key1 to make it more recent
      CacheService.get('key1');

      // Adding 4th entry should evict key2 (least recently used)
      CacheService.set('key4', { data: '4' });

      expect(CacheService.get('key1')).not.toBeNull();
      expect(CacheService.get('key2')).toBeNull();
      expect(CacheService.get('key3')).not.toBeNull();
      expect(CacheService.get('key4')).not.toBeNull();

      CacheService.maxEntries = originalMax;
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      CacheService.set('key1', { data: '1' });
      CacheService.set('key2', { data: '2' });
      CacheService.set('key3', { data: '3' });

      CacheService.clear();

      expect(CacheService.get('key1')).toBeNull();
      expect(CacheService.get('key2')).toBeNull();
      expect(CacheService.get('key3')).toBeNull();

      const stats = CacheService.getStats();
      expect(stats.totalEntries).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should remove only expired entries', (done) => {
      const originalTTL = CacheService.ttlSeconds;
      CacheService.ttlSeconds = 0.1; // 100ms

      CacheService.set('key1', { data: '1' });

      setTimeout(() => {
        // key1 should be expired
        CacheService.set('key2', { data: '2' }); // Fresh entry

        const removedCount = CacheService.cleanup();

        expect(removedCount).toBe(1);
        expect(CacheService.get('key1')).toBeNull();
        expect(CacheService.get('key2')).not.toBeNull();

        CacheService.ttlSeconds = originalTTL;
        done();
      }, 150);
    });

    it('should return count of removed entries', () => {
      const count = CacheService.cleanup();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      CacheService.set('key1', { data: '1' });
      CacheService.set('key2', { data: '2' });

      const stats = CacheService.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalEntries).toBe(2);
      expect(stats.validEntries).toBe(2);
      expect(stats.expiredEntries).toBe(0);
      expect(stats.maxEntries).toBeDefined();
      expect(stats.hitRatio).toBeDefined();
    });

    it('should count expired entries correctly', (done) => {
      const originalTTL = CacheService.ttlSeconds;
      CacheService.ttlSeconds = 0.1;

      CacheService.set('expired', { data: '1' });

      setTimeout(() => {
        CacheService.set('valid', { data: '2' });

        const stats = CacheService.getStats();

        expect(stats.expiredEntries).toBe(1);
        expect(stats.validEntries).toBe(1);

        CacheService.ttlSeconds = originalTTL;
        done();
      }, 150);
    });
  });

  describe('getSearchResults and setSearchResults', () => {
    it('should cache and retrieve search results', () => {
      const results = {
        query: 'test',
        results: [{ title: 'Test Result' }],
        total: 1
      };

      CacheService.setSearchResults('web', 'test', {}, results);
      const cached = CacheService.getSearchResults('web', 'test', {});

      expect(cached).not.toBeNull();
      expect(cached.query).toBe('test');
      expect(cached.results).toEqual(results.results);
    });

    it('should return null for cache miss', () => {
      const cached = CacheService.getSearchResults('web', 'nonexistent');
      expect(cached).toBeNull();
    });

    it('should differentiate between search types', () => {
      const webResults = { type: 'web', results: [] };
      const imageResults = { type: 'images', results: [] };

      CacheService.setSearchResults('web', 'test', {}, webResults);
      CacheService.setSearchResults('images', 'test', {}, imageResults);

      const cachedWeb = CacheService.getSearchResults('web', 'test', {});
      const cachedImages = CacheService.getSearchResults('images', 'test', {});

      expect(cachedWeb.type).toBe('web');
      expect(cachedImages.type).toBe('images');
    });
  });
});
