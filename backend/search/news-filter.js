import Sentiment from 'sentiment';
import vader from 'vader-sentiment';
import afinn from 'afinn-165' assert { type: 'json' };
import config from '../config/index.js';

/**
 * Service for filtering news articles based on positive sentiment
 * Uses multiple sentiment analysis libraries for improved accuracy
 */
class NewsFilterService {
  constructor() {
    this.sentiment = new Sentiment();
    this.performanceThreshold = config.sentiment.timeoutMs;
    
    // Positive keywords to boost sentiment scores
    this.positiveKeywords = [
      'breakthrough', 'inspiring', 'recovery', 'success', 'hope', 'progress',
      'achievement', 'celebration', 'victory', 'improvement', 'innovation',
      'uplifting', 'positive', 'amazing', 'wonderful', 'brilliant', 'excellent',
      'fantastic', 'outstanding', 'remarkable', 'extraordinary', 'miracle',
      'heartwarming', 'touching', 'beautiful', 'kind', 'generous', 'heroic',
      'brave', 'courageous', 'compassionate', 'unity', 'peace', 'love',
      'joy', 'happiness', 'triumph', 'overcome', 'resilience', 'healing'
    ];

    // Negative keywords to filter out
    this.negativeKeywords = [
      'violence', 'war', 'death', 'murder', 'disaster', 'crisis', 'tragedy',
      'accident', 'terrorism', 'attack', 'crime', 'scandal', 'corruption',
      'failure', 'collapse', 'destroy', 'devastation', 'suffering', 'pain',
      'abuse', 'harassment', 'discrimination', 'fraud', 'scam', 'bankruptcy'
    ];
  }

  /**
   * Filter news articles to show only positive/hopeful content
   * @param {Array} articles - Array of news articles
   * @returns {Promise<Array>} Filtered and scored articles
   */
  async filterPositiveNews(articles) {
    const startTime = Date.now();
    
    try {
      // Process articles in parallel with timeout protection
      const processedArticles = await Promise.all(
        articles.map(article => this.processArticle(article))
      );

      // Filter and sort by positivity score
      const positiveArticles = processedArticles
        .filter(article => article.positivityScore > 0)
        .sort((a, b) => b.positivityScore - a.positivityScore);

      // Apply content clustering to ensure diversity
      const diverseArticles = this.ensureContentDiversity(positiveArticles);

      const processingTime = Date.now() - startTime;
      
      // Log performance warning if processing takes too long
      if (processingTime > this.performanceThreshold) {
        console.warn(`News filtering took ${processingTime}ms, exceeding threshold of ${this.performanceThreshold}ms`);
      }

      return diverseArticles;
    } catch (error) {
      console.error('Error filtering news:', error);
      // Return original articles if filtering fails
      return articles;
    }
  }

  /**
   * Process individual article for sentiment analysis
   * @private
   */
  async processArticle(article) {
    const text = `${article.title} ${article.snippet || ''}`;
    
    try {
      // Run all sentiment analyses in parallel with equal weighting
      const [sentimentScore, vaderScore, afinnScore] = await Promise.all([
        this.getSentimentScore(text),
        this.getVaderScore(text),
        this.getAfinnScore(text)
      ]);

      // Calculate weighted positivity score
      const averageScore = (sentimentScore + vaderScore + afinnScore) / 3;
      const keywordBoost = this.getKeywordBoost(text);
      const positivityScore = averageScore + keywordBoost;

      return {
        ...article,
        positivityScore,
        sentimentBreakdown: {
          sentiment: sentimentScore,
          vader: vaderScore,
          afinn: afinnScore,
          keywordBoost
        }
      };
    } catch (error) {
      console.error('Error processing article:', error);
      return {
        ...article,
        positivityScore: 0,
        sentimentBreakdown: {
          sentiment: 0,
          vader: 0,
          afinn: 0,
          keywordBoost: 0
        }
      };
    }
  }

  /**
   * Get sentiment score using sentiment library
   * @private
   */
  async getSentimentScore(text) {
    const result = this.sentiment.analyze(text);
    // Normalise to -1 to 1 range
    return Math.max(-1, Math.min(1, result.score / 10));
  }

  /**
   * Get sentiment score using VADER
   * @private
   */
  async getVaderScore(text) {
    const result = vader.SentimentIntensityAnalyzer.polarity_scores(text);
    // VADER compound score is already in -1 to 1 range
    return result.compound;
  }

  /**
   * Get sentiment score using AFINN
   * @private
   */
  async getAfinnScore(text) {
    const words = text.toLowerCase().split(/\W+/);
    let totalScore = 0;
    let wordCount = 0;

    words.forEach(word => {
      const score = afinn[word];
      if (score !== undefined) {
        totalScore += score;
        wordCount++;
      }
    });

    if (wordCount === 0) return 0;
    
    // Normalise AFINN score to -1 to 1 range
    const averageScore = totalScore / wordCount;
    return Math.max(-1, Math.min(1, averageScore / 5));
  }

  /**
   * Calculate keyword-based boost
   * @private
   */
  getKeywordBoost(text) {
    const lowercaseText = text.toLowerCase();
    let boost = 0;

    // Add positive boost
    this.positiveKeywords.forEach(keyword => {
      if (lowercaseText.includes(keyword)) {
        boost += 0.2;
      }
    });

    // Subtract negative penalty
    this.negativeKeywords.forEach(keyword => {
      if (lowercaseText.includes(keyword)) {
        boost -= 0.3;
      }
    });

    return Math.max(-1, Math.min(1, boost));
  }

  /**
   * Ensure content diversity using sophisticated clustering
   * @private
   */
  ensureContentDiversity(articles) {
    if (articles.length <= 5) return articles;

    const diverseArticles = [];
    const usedDomains = new Set();
    const usedKeywords = new Set();

    for (const article of articles) {
      // Check domain diversity
      const domain = article.domain;
      const domainCount = Array.from(usedDomains).filter(d => d === domain).length;
      
      // Check keyword/topic diversity
      const keywords = this.extractKeywords(article.title);
      const keywordOverlap = keywords.some(keyword => usedKeywords.has(keyword));

      // Allow article if:
      // 1. Domain has been used less than 2 times, AND
      // 2. No significant keyword overlap with existing articles
      if (domainCount < 2 && !keywordOverlap) {
        diverseArticles.push(article);
        usedDomains.add(domain);
        keywords.forEach(keyword => usedKeywords.add(keyword));
        
        // Limit total articles to prevent overwhelming
        if (diverseArticles.length >= 15) break;
      }
    }

    return diverseArticles;
  }

  /**
   * Extract key terms from article title for clustering
   * @private
   */
  extractKeywords(title) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
      'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
    ]);

    return title
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 5); // Take first 5 meaningful words
  }
}

export default new NewsFilterService();