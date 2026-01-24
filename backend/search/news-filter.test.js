import NewsFilterService from './news-filter.js';

describe('NewsFilterService', () => {
  describe('filterPositiveNews', () => {
    it('should filter and return positive articles', async () => {
      const articles = [
        {
          title: 'Amazing breakthrough in renewable energy',
          snippet: 'Scientists achieve incredible success',
          url: 'https://example.com/positive',
          domain: 'example.com'
        },
        {
          title: 'Tragic disaster strikes region',
          snippet: 'Multiple casualties reported in terrible accident',
          url: 'https://example.com/negative',
          domain: 'example.com'
        },
        {
          title: 'Community celebrates success',
          snippet: 'Local heroes honored for brave actions',
          url: 'https://example.com/positive2',
          domain: 'example.com'
        }
      ];

      const result = await NewsFilterService.filterPositiveNews(articles);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(articles.length);

      // Verify articles have positivity scores
      result.forEach(article => {
        expect(article.positivityScore).toBeDefined();
        expect(article.positivityScore).toBeGreaterThan(0);
        expect(article.sentimentBreakdown).toBeDefined();
      });
    });

    it('should return empty array for empty input', async () => {
      const result = await NewsFilterService.filterPositiveNews([]);
      expect(result).toEqual([]);
    });

    it('should handle articles without snippets', async () => {
      const articles = [
        {
          title: 'Wonderful news',
          url: 'https://example.com/test',
          domain: 'example.com'
        }
      ];

      const result = await NewsFilterService.filterPositiveNews(articles);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should sort articles by positivity score in descending order', async () => {
      const articles = [
        {
          title: 'Good news',
          snippet: 'Something positive',
          url: 'https://example.com/1',
          domain: 'example.com'
        },
        {
          title: 'Amazing wonderful fantastic breakthrough',
          snippet: 'Incredible success and celebration',
          url: 'https://example.com/2',
          domain: 'example.com'
        },
        {
          title: 'Okay news',
          snippet: 'Neutral content',
          url: 'https://example.com/3',
          domain: 'example.com'
        }
      ];

      const result = await NewsFilterService.filterPositiveNews(articles);

      // Verify sorted in descending order
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].positivityScore).toBeGreaterThanOrEqual(result[i + 1].positivityScore);
      }
    });

    it('should ensure content diversity by limiting domain usage', async () => {
      const articles = Array(10).fill(null).map((_, i) => ({
        title: `Positive news ${i}`,
        snippet: 'Great wonderful amazing',
        url: `https://example.com/article${i}`,
        domain: 'example.com'
      }));

      const result = await NewsFilterService.filterPositiveNews(articles);

      const domainCount = result.filter(a => a.domain === 'example.com').length;
      expect(domainCount).toBeLessThanOrEqual(2);
    });

    it('should return original articles on error', async () => {
      const invalidArticles = [null, undefined, { invalid: 'data' }];

      const result = await NewsFilterService.filterPositiveNews(invalidArticles);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('sentiment scoring', () => {
    it('should assign higher scores to positive keywords', async () => {
      const positiveArticle = [{
        title: 'Breakthrough success achievement celebration victory',
        snippet: 'Wonderful amazing fantastic',
        url: 'https://example.com/positive',
        domain: 'example.com'
      }];

      const neutralArticle = [{
        title: 'The weather today',
        snippet: 'It is sunny outside',
        url: 'https://example.com/neutral',
        domain: 'example.com'
      }];

      const positiveResult = await NewsFilterService.filterPositiveNews(positiveArticle);
      const neutralResult = await NewsFilterService.filterPositiveNews(neutralArticle);

      if (positiveResult.length > 0 && neutralResult.length > 0) {
        expect(positiveResult[0].positivityScore).toBeGreaterThan(neutralResult[0].positivityScore);
      }
    });

    it('should penalize negative keywords', async () => {
      const negativeArticle = [{
        title: 'Violence tragedy disaster death murder',
        snippet: 'Terrible crisis and suffering',
        url: 'https://example.com/negative',
        domain: 'example.com'
      }];

      const result = await NewsFilterService.filterPositiveNews(negativeArticle);

      // Negative articles should be filtered out or have very low scores
      expect(result.length === 0 || result[0].positivityScore < 0.1).toBe(true);
    });
  });

  describe('keyword boost', () => {
    it('should boost scores for positive keywords', () => {
      const text = 'breakthrough inspiring success';
      const boost = NewsFilterService.getKeywordBoost(text);

      expect(boost).toBeGreaterThan(0);
    });

    it('should reduce scores for negative keywords', () => {
      const text = 'violence war disaster';
      const boost = NewsFilterService.getKeywordBoost(text);

      expect(boost).toBeLessThan(0);
    });

    it('should be case insensitive', () => {
      const text1 = 'BREAKTHROUGH SUCCESS';
      const text2 = 'breakthrough success';

      const boost1 = NewsFilterService.getKeywordBoost(text1);
      const boost2 = NewsFilterService.getKeywordBoost(text2);

      expect(boost1).toBe(boost2);
    });

    it('should clamp boost values between -1 and 1', () => {
      const manyPositive = 'breakthrough '.repeat(100);
      const boost = NewsFilterService.getKeywordBoost(manyPositive);

      expect(boost).toBeLessThanOrEqual(1);
      expect(boost).toBeGreaterThanOrEqual(-1);
    });
  });

  describe('extractKeywords', () => {
    it('should extract meaningful keywords from title', () => {
      const title = 'The Amazing Discovery of New Technology';
      const keywords = NewsFilterService.extractKeywords(title);

      expect(keywords).toBeDefined();
      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.length).toBeLessThanOrEqual(5);

      // Should not include stop words
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('of');
    });

    it('should filter out stop words', () => {
      const title = 'the a an and or but in on at';
      const keywords = NewsFilterService.extractKeywords(title);

      expect(keywords).toEqual([]);
    });

    it('should filter out short words', () => {
      const title = 'I am in';
      const keywords = NewsFilterService.extractKeywords(title);

      expect(keywords).toEqual([]);
    });

    it('should return at most 5 keywords', () => {
      const title = 'amazing wonderful fantastic incredible outstanding remarkable extraordinary';
      const keywords = NewsFilterService.extractKeywords(title);

      expect(keywords.length).toBeLessThanOrEqual(5);
    });

    it('should convert to lowercase', () => {
      const title = 'AMAZING Technology';
      const keywords = NewsFilterService.extractKeywords(title);

      keywords.forEach(keyword => {
        expect(keyword).toBe(keyword.toLowerCase());
      });
    });
  });
});
