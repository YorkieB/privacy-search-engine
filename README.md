# Privacy-Focused Search Engine

A privacy-first homepage search engine that integrates with Brave Search API to provide fast, unbiased search results with no user tracking. Features dedicated sections for web search, image search, and positive news with sentiment analysis.

## Features

- **Privacy First**: No user tracking, no data collection, no cookies
- **Three-Column Layout**: Dedicated sections for web, images, and positive news
- **Positive News Filtering**: Uses multiple sentiment analysis libraries to surface uplifting content
- **Content Diversity**: Sophisticated clustering to ensure varied news sources
- **Auto-refresh**: Configurable automatic refresh for positive news
- **Responsive Design**: Mobile-friendly with vertical stacking at phone breakpoints
- **Fast Performance**: In-memory caching with LRU eviction
- **Rate Limiting**: Built-in protection against abuse

## Technology Stack

### Backend
- **Node.js** (LTS) with **Express.js**
- **Brave Search API** for search results
- **Multiple sentiment analysis libraries**: sentiment, vader-sentiment, afinn-165
- **In-memory caching** with LRU eviction
- **Rate limiting** and security middleware

### Frontend
- **React 18** with functional components and hooks
- **Vite** for fast development and building
- **CSS Grid/Flexbox** for responsive layout
- **Fetch API** for backend communication

## Getting Started

### Prerequisites

- Node.js (LTS version)
- Brave Search API key

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd "Home Page"
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your BRAVE_API_KEY
   ```

3. **Install dependencies**:
   ```bash
   # Backend dependencies
   cd backend
   npm install

   # Frontend dependencies  
   cd ../frontend
   npm install
   ```

### Development

1. **Start backend server** (from backend/ directory):
   ```bash
   npm run dev
   # Server runs on http://localhost:3001
   ```

2. **Start frontend development server** (from frontend/ directory):
   ```bash
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

3. **Visit http://localhost:3000** to use the search engine

### Production

1. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Start production server**:
   ```bash
   cd backend
   npm start
   ```

## API Endpoints

### Search Endpoints
- `GET /api/search?q=query` - Web search
- `GET /api/images?q=query` - Image search  
- `GET /api/news?q=query` - Positive news search (with sentiment filtering)

### Cache Management
- `GET /api/cache/stats` - Cache statistics
- `DELETE /api/cache` - Clear cache

### Health Check
- `GET /health` - Server health status

## Configuration

### Environment Variables

```bash
# Required
BRAVE_API_KEY=your_brave_api_key_here

# Optional
PORT=3001                           # Backend server port
NODE_ENV=development               # Environment mode
ORIGIN=http://localhost:3000       # CORS origin
CACHE_TTL_SECONDS=300             # Cache TTL (5 minutes)
MAX_CACHE_ENTRIES=100             # Maximum cache entries
SENTIMENT_TIMEOUT_MS=500          # Sentiment analysis timeout
DEFAULT_NEWS_REFRESH_INTERVAL=300000  # Default news refresh (5 minutes)
```

### Auto-refresh Options

Users can configure positive news auto-refresh with intervals:
- 1 minute
- 5 minutes  
- 15 minutes
- 30 minutes

Settings are session-based (not persisted) for privacy.

## Features in Detail

### Sentiment Analysis

The positive news filtering uses three sentiment analysis libraries with equal weighting:
- **sentiment**: JavaScript sentiment analysis
- **vader-sentiment**: Python VADER ported to JS
- **afinn-165**: AFINN word list for sentiment scoring

Articles are scored on positivity and filtered to surface hopeful, inspiring content.

### Content Diversity

News results use sophisticated clustering to ensure:
- Maximum 2 articles per domain
- Keyword diversity to avoid topic clustering  
- Limited to 15 total articles to prevent overwhelming

### Performance Monitoring

- Sentiment analysis timeout at 500ms
- Performance warnings logged for slow operations
- Parallel processing for multiple sentiment libraries

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend  
npm test

# Run with coverage
npm run test:coverage
```

## Security Features

- **Helmet** security headers
- **CORS** protection with configurable origins
- **Rate limiting** (60 requests per minute per IP)
- **Input validation** and sanitisation
- **No data persistence** for user queries
- **HTTPS-only** API calls to external services

## License

MIT

## Contributing

1. Follow the coding standards in `.github/instructions/`
2. Write tests for new features
3. Ensure accessibility compliance
4. Use British English in documentation
5. Follow privacy-first principles