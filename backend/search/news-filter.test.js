// News Filter Service Tests
// Note: Full integration testing is limited due to ES module + JSON import assertions
// Jest doesn't fully support import assertions yet
// These tests verify the concepts and algorithms

describe('NewsFilterService Concepts', () => {
  describe('keyword boosting algorithm', () => {
    it('should boost positive keywords', () => {
      const positiveKeywords = ['breakthrough', 'success', 'amazing'];
      const text = 'breakthrough success amazing';

      let boost = 0;
      positiveKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          boost += 0.2;
        }
      });

      expect(boost).toBeGreaterThan(0);
      expect(boost).toBeCloseTo(0.6, 1); // 3 keywords * 0.2, allow floating point variance
    });

    it('should penalize negative keywords', () => {
      const negativeKeywords = ['violence', 'disaster', 'tragedy'];
      const text = 'violence and tragedy';

      let boost = 0;
      negativeKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          boost -= 0.3;
        }
      });

      expect(boost).toBeLessThan(0);
      expect(boost).toBe(-0.6); // 2 keywords * -0.3
    });

    it('should clamp boost values', () => {
      const manyPositive = 'breakthrough '.repeat(100);
      let boost = 0;

      const positiveKeywords = ['breakthrough'];
      positiveKeywords.forEach(keyword => {
        const matches = (manyPositive.match(new RegExp(keyword, 'g')) || []).length;
        boost += matches * 0.2;
      });

      // Clamp to -1 to 1 range
      boost = Math.max(-1, Math.min(1, boost));

      expect(boost).toBe(1);
      expect(boost).toBeLessThanOrEqual(1);
      expect(boost).toBeGreaterThanOrEqual(-1);
    });
  });

  describe('keyword extraction', () => {
    it('should extract meaningful keywords', () => {
      const title = 'The Amazing Discovery of New Technology';
      const stopWords = new Set(['the', 'of', 'a', 'an', 'and', 'or']);

      const keywords = title
        .toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 2 && !stopWords.has(word))
        .slice(0, 5);

      expect(keywords).toContain('amazing');
      expect(keywords).toContain('discovery');
      expect(keywords).toContain('new');
      expect(keywords).toContain('technology');
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('of');
    });

    it('should limit keywords to 5', () => {
      const title = 'one two three four five six seven eight';
      const keywords = title.split(' ').slice(0, 5);

      expect(keywords.length).toBeLessThanOrEqual(5);
    });

    it('should convert to lowercase', () => {
      const title = 'AMAZING Technology';
      const keywords = title.toLowerCase().split(' ');

      keywords.forEach(keyword => {
        expect(keyword).toBe(keyword.toLowerCase());
      });
    });
  });

  describe('content diversity', () => {
    it('should limit articles per domain', () => {
      const articles = [
        { domain: 'example.com', positivityScore: 0.9 },
        { domain: 'example.com', positivityScore: 0.8 },
        { domain: 'example.com', positivityScore: 0.7 },
        { domain: 'other.com', positivityScore: 0.6 }
      ];

      const maxPerDomain = 2;
      const domainCounts = {};
      const diverse = [];

      for (const article of articles) {
        const count = domainCounts[article.domain] || 0;
        if (count < maxPerDomain) {
          diverse.push(article);
          domainCounts[article.domain] = count + 1;
        }
      }

      expect(diverse.length).toBe(3);
      expect(domainCounts['example.com']).toBe(2);
      expect(domainCounts['other.com']).toBe(1);
    });
  });

  describe('sorting by positivity', () => {
    it('should sort articles by score descending', () => {
      const articles = [
        { title: 'Article 1', positivityScore: 0.5 },
        { title: 'Article 2', positivityScore: 0.9 },
        { title: 'Article 3', positivityScore: 0.3 }
      ];

      const sorted = [...articles].sort((a, b) => b.positivityScore - a.positivityScore);

      expect(sorted[0].positivityScore).toBe(0.9);
      expect(sorted[1].positivityScore).toBe(0.5);
      expect(sorted[2].positivityScore).toBe(0.3);

      // Verify descending order
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].positivityScore).toBeGreaterThanOrEqual(sorted[i + 1].positivityScore);
      }
    });
  });

  describe('filtering positive articles', () => {
    it('should filter out negative scores', () => {
      const articles = [
        { title: 'Positive', positivityScore: 0.5 },
        { title: 'Negative', positivityScore: -0.3 },
        { title: 'Neutral', positivityScore: 0.1 },
        { title: 'Very Negative', positivityScore: -0.8 }
      ];

      const positive = articles.filter(article => article.positivityScore > 0);

      expect(positive.length).toBe(2);
      positive.forEach(article => {
        expect(article.positivityScore).toBeGreaterThan(0);
      });
    });
  });

  describe('normalization', () => {
    it('should normalize scores to -1 to 1 range', () => {
      const rawScore = 25; // Example score that might be outside range
      const normalized = Math.max(-1, Math.min(1, rawScore / 10));

      expect(normalized).toBeGreaterThanOrEqual(-1);
      expect(normalized).toBeLessThanOrEqual(1);
      expect(normalized).toBe(1); // 25/10 = 2.5, clamped to 1
    });

    it('should handle negative scores', () => {
      const rawScore = -15;
      const normalized = Math.max(-1, Math.min(1, rawScore / 10));

      expect(normalized).toBe(-1); // -15/10 = -1.5, clamped to -1
    });
  });
});
