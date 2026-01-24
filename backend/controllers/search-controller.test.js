import { searchWeb, searchImages, searchNews } from './search-controller.js';

// Mock dependencies
jest.mock('../search/brave-service.js', () => ({
  default: {
    searchWeb: jest.fn(),
    searchImages: jest.fn(),
    searchNews: jest.fn()
  }
}));

jest.mock('../search/news-filter.js', () => ({
  default: {
    filterPositiveNews: jest.fn()
  }
}));

jest.mock('../search/cache.js', () => ({
  default: {
    getSearchResults: jest.fn(),
    setSearchResults: jest.fn()
  }
}));

import braveService from '../search/brave-service.js';
import newsFilter from '../search/news-filter.js';
import cache from '../search/cache.js';

describe('Search Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {}
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('searchWeb', () => {
    it('should return 400 if query parameter is missing', async () => {
      req.query = {};

      await searchWeb(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Query parameter')
        })
      );
    });

    it('should return 400 if query is empty string', async () => {
      req.query = { q: '   ' };

      await searchWeb(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });

    it('should return cached results if available', async () => {
      req.query = { q: 'test query' };
      const cachedResults = {
        results: [{ title: 'Cached Result' }],
        cached: true
      };

      cache.getSearchResults.mockReturnValue(cachedResults);

      await searchWeb(req, res);

      expect(cache.getSearchResults).toHaveBeenCalledWith('web', 'test query', {});
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          results: cachedResults.results,
          cached: true,
          elapsedMs: expect.any(Number)
        })
      );
      expect(braveService.searchWeb).not.toHaveBeenCalled();
    });

    it('should fetch from API if cache miss', async () => {
      req.query = { q: 'test query' };
      const apiResults = {
        results: [{ title: 'API Result' }],
        total: 1
      };

      cache.getSearchResults.mockReturnValue(null);
      braveService.searchWeb.mockResolvedValue(apiResults);

      await searchWeb(req, res);

      expect(cache.getSearchResults).toHaveBeenCalled();
      expect(braveService.searchWeb).toHaveBeenCalledWith('test query', {});
      expect(cache.setSearchResults).toHaveBeenCalledWith(
        'web',
        'test query',
        {},
        expect.objectContaining({
          results: apiResults.results
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          results: apiResults.results,
          elapsedMs: expect.any(Number)
        })
      );
    });

    it('should trim whitespace from query', async () => {
      req.query = { q: '  test query  ' };
      cache.getSearchResults.mockReturnValue(null);
      braveService.searchWeb.mockResolvedValue({ results: [] });

      await searchWeb(req, res);

      expect(braveService.searchWeb).toHaveBeenCalledWith('test query', {});
    });

    it('should pass through additional options', async () => {
      req.query = { q: 'test', count: 20, page: 2 };
      cache.getSearchResults.mockReturnValue(null);
      braveService.searchWeb.mockResolvedValue({ results: [] });

      await searchWeb(req, res);

      expect(braveService.searchWeb).toHaveBeenCalledWith(
        'test',
        { count: '20', page: '2' }
      );
    });

    it('should return 502 on API error', async () => {
      req.query = { q: 'test' };
      cache.getSearchResults.mockReturnValue(null);
      braveService.searchWeb.mockRejectedValue(new Error('API Error'));

      await searchWeb(req, res);

      expect(res.status).toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to fetch search results',
          query: 'test',
          elapsedMs: expect.any(Number)
        })
      );
    });

    it('should include elapsed time in response', async () => {
      req.query = { q: 'test' };
      cache.getSearchResults.mockReturnValue(null);
      braveService.searchWeb.mockResolvedValue({ results: [] });

      await searchWeb(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          elapsedMs: expect.any(Number)
        })
      );
    });
  });

  describe('searchImages', () => {
    it('should return 400 if query parameter is missing', async () => {
      req.query = {};

      await searchImages(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Query parameter')
        })
      );
    });

    it('should fetch and return image results', async () => {
      req.query = { q: 'test images' };
      const imageResults = {
        results: [
          { title: 'Image 1', url: 'https://example.com/1.jpg' }
        ]
      };

      cache.getSearchResults.mockReturnValue(null);
      braveService.searchImages.mockResolvedValue(imageResults);

      await searchImages(req, res);

      expect(braveService.searchImages).toHaveBeenCalledWith('test images', {});
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          results: imageResults.results
        })
      );
    });
  });

  describe('searchNews', () => {
    it('should return 400 if query parameter is missing for non-positive search', async () => {
      req.query = { positive: 'false' };

      await searchNews(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fetch positive news without query', async () => {
      req.query = {};
      const newsResults = {
        results: [
          { title: 'Good News', snippet: 'Something positive happened' }
        ]
      };

      cache.getSearchResults.mockReturnValue(null);
      braveService.searchNews.mockResolvedValue(newsResults);
      newsFilter.filterPositiveNews.mockResolvedValue(newsResults.results);

      await searchNews(req, res);

      expect(braveService.searchNews).toHaveBeenCalled();
      expect(newsFilter.filterPositiveNews).toHaveBeenCalledWith(newsResults.results);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          results: newsResults.results
        })
      );
    });

    it('should apply positive news filtering', async () => {
      req.query = { q: 'technology' };
      const newsResults = {
        results: [
          { title: 'Good Tech News', positivityScore: 0.8 },
          { title: 'Bad Tech News', positivityScore: -0.5 }
        ]
      };
      const filteredResults = [
        { title: 'Good Tech News', positivityScore: 0.8 }
      ];

      cache.getSearchResults.mockReturnValue(null);
      braveService.searchNews.mockResolvedValue(newsResults);
      newsFilter.filterPositiveNews.mockResolvedValue(filteredResults);

      await searchNews(req, res);

      expect(newsFilter.filterPositiveNews).toHaveBeenCalledWith(newsResults.results);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          results: filteredResults
        })
      );
    });

    it('should use cache for news results', async () => {
      req.query = { q: 'cached news' };
      const cachedResults = {
        results: [{ title: 'Cached News' }],
        cached: true
      };

      cache.getSearchResults.mockReturnValue(cachedResults);

      await searchNews(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          cached: true
        })
      );
      expect(braveService.searchNews).not.toHaveBeenCalled();
    });
  });
});
