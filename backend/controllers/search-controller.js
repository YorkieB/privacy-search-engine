import braveService from '../search/brave-service.js';
import newsFilter from '../search/news-filter.js';
import cache from '../search/cache.js';

/**
 * Controller for handling web search requests
 */
export const searchWeb = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { q: query, ...options } = req.query;
    
    // Validate query parameter
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Query parameter "q" is required and must be a non-empty string'
      });
    }

    const trimmedQuery = query.trim();
    
    // Check cache first
    const cachedResults = cache.getSearchResults('web', trimmedQuery, options);
    if (cachedResults) {
      return res.json({
        ...cachedResults,
        elapsedMs: Date.now() - startTime
      });
    }

    // Fetch from Brave API
    const results = await braveService.searchWeb(trimmedQuery, options);
    results.elapsedMs = Date.now() - startTime;

    // Cache the results
    cache.setSearchResults('web', trimmedQuery, options, results);

    res.json(results);
  } catch (error) {
    console.error('Web search error:', error);
    res.status(502).json({
      error: 'Failed to fetch search results',
      query: req.query.q,
      elapsedMs: Date.now() - startTime
    });
  }
};

/**
 * Controller for handling image search requests
 */
export const searchImages = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { q: query, ...options } = req.query;
    
    // Validate query parameter
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Query parameter "q" is required and must be a non-empty string'
      });
    }

    const trimmedQuery = query.trim();
    
    // Check cache first
    const cachedResults = cache.getSearchResults('images', trimmedQuery, options);
    if (cachedResults) {
      return res.json({
        ...cachedResults,
        elapsedMs: Date.now() - startTime
      });
    }

    // Fetch from Brave API
    const results = await braveService.searchImages(trimmedQuery, options);
    results.elapsedMs = Date.now() - startTime;

    // Cache the results
    cache.setSearchResults('images', trimmedQuery, options, results);

    res.json(results);
  } catch (error) {
    console.error('Image search error:', error);
    res.status(502).json({
      error: 'Failed to fetch image results',
      query: req.query.q,
      elapsedMs: Date.now() - startTime
    });
  }
};

/**
 * Controller for handling news search requests with positivity filtering
 */
export const searchNews = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { q: query, ...options } = req.query;
    
    // For positive news, use default query if none provided
    const searchQuery = query && query.trim().length > 0 ? query.trim() : 'inspiring breakthrough good news positive';
    
    // Check cache first
    const cachedResults = cache.getSearchResults('news', searchQuery, options);
    if (cachedResults) {
      return res.json({
        ...cachedResults,
        elapsedMs: Date.now() - startTime
      });
    }

    // Fetch from Brave API with larger count for filtering
    const searchOptions = { ...options, count: 50 }; // Get more articles for better filtering
    const results = await braveService.searchNews(searchQuery, searchOptions);
    
    // Filter for positive news using sentiment analysis
    const filteredArticles = await newsFilter.filterPositiveNews(results.results);
    
    const finalResults = {
      ...results,
      results: filteredArticles,
      total: filteredArticles.length,
      originalTotal: results.results.length,
      filtered: true,
      elapsedMs: Date.now() - startTime
    };

    // Cache the filtered results
    cache.setSearchResults('news', searchQuery, options, finalResults);

    res.json(finalResults);
  } catch (error) {
    console.error('News search error:', error);
    res.status(502).json({
      error: 'Failed to fetch news results',
      query: req.query.q,
      elapsedMs: Date.now() - startTime
    });
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async (req, res) => {
  try {
    const stats = cache.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({
      error: 'Failed to get cache statistics'
    });
  }
};

/**
 * Clear cache
 */
export const clearCache = async (req, res) => {
  try {
    cache.clear();
    res.json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      error: 'Failed to clear cache'
    });
  }
};