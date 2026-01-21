# Privacy Search Engine Deployment Package

## Project Overview
This is a privacy-focused search engine with a Bing-style interface, powered by Brave Search API.

## Features
- 🎨 Modern Bing-style homepage with hero background
- 🔍 Privacy-focused web search (no tracking)
- 📰 Positive news carousel with sentiment analysis
- 🖼️ Image search integration
- 📱 Fully responsive design
- 🐳 Docker-ready for production deployment

## API Configuration
- **Brave API Key**: BSAq4NtSqFFWRcGdfgz5V8VfvcH_rkc
- **API Endpoint**: https://api.search.brave.com/res/v1/

## Architecture
- **Frontend**: React 18 + Vite (Bing-style UI)
- **Backend**: Node.js + Express (API proxy)
- **Search**: Brave Search API integration
- **News**: Sentiment analysis for positive news filtering
- **Deployment**: Docker + Docker Compose

## File Structure
```
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── styles/          # CSS styling
│   │   └── App.jsx          # Main app
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Node.js API server
│   ├── routes/             # API routes
│   ├── services/           # Brave API integration
│   ├── config/             # Configuration
│   ├── package.json
│   └── server.js           # Express server
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Container orchestration
├── nginx.conf             # Reverse proxy config
└── deploy.sh              # Deployment script
```

## Quick Deploy Commands

### Option 1: Upload project files
```bash
# Create app directory
mkdir -p /opt/privacy-search
cd /opt/privacy-search

# Upload all files to this directory, then run:
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual deployment
```bash
# Set environment
cat > .env << EOL
NODE_ENV=production
PORT=3001
BRAVE_API_KEY=BSAq4NtSqFFWRcGdfgz5V8VfvcH_rkc
ALLOWED_ORIGIN=*
EOL

# Build and start
docker-compose up --build -d
```

## Verification
After deployment, verify at:
- Health: http://YOUR_SERVER_IP:3001/health
- App: http://YOUR_SERVER_IP:3001/

## Support
All files are production-ready with security headers, rate limiting, and error handling included.