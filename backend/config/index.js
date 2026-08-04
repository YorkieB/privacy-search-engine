import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const config = {
  port: process.env.PORT || 3001,
  // [SovereignBrowser] Each Brave subscription issues its own token, so keys
  // are held per plan. BRAVE_API_KEY remains supported as a single-key
  // fallback so existing setups keep working.
  braveApiKey: process.env.BRAVE_SEARCH_KEY || process.env.BRAVE_API_KEY,
  braveKeys: {
    search: process.env.BRAVE_SEARCH_KEY || process.env.BRAVE_API_KEY,
    autosuggest: process.env.BRAVE_AUTOSUGGEST_KEY || process.env.BRAVE_API_KEY,
    pro: process.env.BRAVE_PRO_KEY || null
  },
  allowedOrigin: process.env.ORIGIN || '*',
  environment: process.env.NODE_ENV || 'development',
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS) || 300,
    maxEntries: parseInt(process.env.MAX_CACHE_ENTRIES) || 100
  },
  news: {
    defaultRefreshInterval: parseInt(process.env.DEFAULT_NEWS_REFRESH_INTERVAL) || 300000
  },
  sentiment: {
    timeoutMs: parseInt(process.env.SENTIMENT_TIMEOUT_MS) || 500
  }
};

// Validate critical configuration
if (!config.braveApiKey && config.environment === 'production') {
  throw new Error('BRAVE_API_KEY is not defined. Please set it in the environment.');
}

if (!config.braveApiKey && config.environment === 'development') {
  console.warn('Warning: BRAVE_API_KEY is not set. Search functionality will not work.');
}

// Environment-specific settings
if (config.environment === 'production') {
  if (config.allowedOrigin === '*') {
    console.warn('Warning: CORS origin is set to * in production. Consider setting a specific origin.');
  }
}

export default config;
