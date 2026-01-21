import axios from 'axios';
import config from '../config/index.js';

/**
 * Service for interacting with Brave Search API
 * Handles web search, image search, and news search
 */
class BraveSearchService {
  constructor() {
    this.baseUrl = 'https://api.search.brave.com/res/v1';
    this.apiKey = config.braveApiKey;
    this.headers = {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': this.apiKey
    };
  }

  /**
   * Perform web search via Brave API
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {Promise<object>} Search results
   */
  async searchWeb(query, options = {}) {
    try {
      const params = {
        q: query,
        count: options.count || 10,
        offset: options.offset || 0,
        safesearch: options.safesearch || 'moderate',
        search_lang: options.lang || 'en',
        country: options.country || 'US',
        ui_lang: options.uiLang || 'en-US'
      };

      const response = await axios.get(`${this.baseUrl}/web/search`, {
        headers: this.headers,
        params,
        timeout: 10000
      });

      return this.formatWebResults(response.data, query);
    } catch (error) {
      console.error('Brave web search error:', error.message);
      throw new Error('Failed to fetch search results');
    }
  }

  /**
   * Perform image search via Brave API
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {Promise<object>} Image search results
   */
  async searchImages(query, options = {}) {
    try {
      const params = {
        q: query,
        count: options.count || 20,
        offset: options.offset || 0,
        safesearch: options.safesearch || 'moderate',
        search_lang: options.lang || 'en'
      };

      const response = await axios.get(`${this.baseUrl}/images/search`, {
        headers: this.headers,
        params,
        timeout: 10000
      });

      return this.formatImageResults(response.data, query);
    } catch (error) {
      console.error('Brave image search error:', error.message);
      throw new Error('Failed to fetch image results');
    }
  }

  /**
   * Perform news search via Brave API
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {Promise<object>} News search results
   */
  async searchNews(query, options = {}) {
    try {
      const params = {
        q: query,
        count: options.count || 20,
        offset: options.offset || 0,
        safesearch: options.safesearch || 'moderate',
        search_lang: options.lang || 'en',
        country: options.country || 'US',
        ui_lang: options.uiLang || 'en-US',
        freshness: options.freshness || 'pd' // past day for fresh news
      };

      const response = await axios.get(`${this.baseUrl}/news/search`, {
        headers: this.headers,
        params,
        timeout: 10000
      });

      return this.formatNewsResults(response.data, query);
    } catch (error) {
      console.error('Brave news search error:', error.message);
      throw new Error('Failed to fetch news results');
    }
  }

  /**
   * Format web search results
   * @private
   */
  formatWebResults(data, query) {
    const results = data.web?.results || [];
    
    return {
      query,
      results: results.map(result => ({
        title: result.title,
        url: result.url,
        snippet: result.description,
        published: result.age,
        domain: this.extractDomain(result.url)
      })),
      engine: 'Brave',
      type: 'web',
      total: data.web?.total || results.length,
      elapsedMs: Date.now() // Will be updated by caller
    };
  }

  /**
   * Format image search results
   * @private
   */
  formatImageResults(data, query) {
    const results = data.results || [];
    
    return {
      query,
      results: results.map(result => ({
        title: result.title,
        url: result.url,
        thumbnail: result.thumbnail?.src,
        width: result.properties?.width,
        height: result.properties?.height,
        source: result.source,
        domain: this.extractDomain(result.source)
      })),
      engine: 'Brave',
      type: 'images',
      total: results.length,
      elapsedMs: Date.now() // Will be updated by caller
    };
  }

  /**
   * Format news search results
   * @private
   */
  formatNewsResults(data, query) {
    const results = data.results || [];
    
    return {
      query,
      results: results.map(result => ({
        title: result.title,
        url: result.url,
        snippet: result.description,
        published: result.age,
        source: result.meta_url?.hostname,
        domain: this.extractDomain(result.url)
      })),
      engine: 'Brave',
      type: 'news',
      total: results.length,
      elapsedMs: Date.now() // Will be updated by caller
    };
  }

  /**
   * Extract domain from URL
   * @private
   */
  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }
}

export default new BraveSearchService();